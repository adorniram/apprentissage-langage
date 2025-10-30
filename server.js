const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'votre_secret_jwt_super_securise'; // À changer en production

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Configuration de la base de données
const DB_PATH = path.join(__dirname, 'data', 'database.sqlite');

async function initDb() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  // Table des messages
  await db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      receivedAt TEXT NOT NULL
    )
  `);

  // Table des utilisateurs
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Créer un admin par défaut
  const admin = await db.get("SELECT * FROM users WHERE role = 'admin'");
  if (!admin) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@example.com', adminPassword, 'admin']
    );
    console.log('Compte admin créé avec succès');
  }

  return db;
}

let db;
initDb().then(database => {
  db = database;
  console.log('Base de données initialisée avec succès');
}).catch(error => {
  console.error('Erreur initialisation DB:', error);
  process.exit(1);
});

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

// Middleware admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  next();
}

// Routes d'authentification
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoints protégés d'administration
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await db.all(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const result = await db.run(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const userId = req.params.id;

  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
  }

  try {
    const result = await db.run('DELETE FROM users WHERE id = ?', [userId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API Messages
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Champs requis manquants (name, email, message).' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Email invalide.' });
  }

  try {
    const receivedAt = new Date().toISOString();
    const result = await db.run(
      `INSERT INTO messages (name, email, phone, subject, message, receivedAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        String(name).trim(), 
        String(email).trim(), 
        phone ? String(phone).trim() : null, 
        subject || null, 
        String(message).trim(), 
        receivedAt
      ]
    );

    const inserted = await db.get('SELECT * FROM messages WHERE id = ?', result.lastID);
    return res.json({ success: true, data: inserted });
  } catch (err) {
    console.error('Erreur lors de l\'insertion en DB :', err);
    return res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
  }
});

app.get('/api/messages', authenticateToken, isAdmin, async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    let rows;
    
    if (search) {
      rows = await db.all(
        `SELECT * FROM messages 
         WHERE name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ? 
         ORDER BY receivedAt DESC`,
        [search, search, search, search]
      );
    } else {
      rows = await db.all(`SELECT * FROM messages ORDER BY receivedAt DESC`);
    }
    
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Erreur lors de la récupération des messages:', err);
    return res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});