Mini-backend Node/Express pour recevoir les messages du formulaire de contact.

Installation et exécution (PowerShell sous Windows) :

# Installer les dépendances
npm install

# Lancer le serveur
npm start

Le serveur écoute par défaut sur http://localhost:3000 et expose :
- POST /api/contact  -> reçoit JSON { name, email, phone, subject, message }
- GET  /api/health   -> vérifie que le serveur est vivant

Les messages sont sauvegardés localement dans `data/messages.json`.

Notes :
- Le serveur sert aussi les fichiers statiques du projet (racine), donc vous pouvez ouvrir http://localhost:3000/index.html pour tester le site + formulaire.
- Pour le développement, installez `nodemon` si vous voulez recharger automatiquement : `npm i -D nodemon` et utilisez `npm run dev`.

Admin & SQLite
- La persistance utilise maintenant SQLite. Le fichier DB est créé dans `data/messages.db`.
- Pour consulter les messages via une interface simple, ouvrez :
	- http://localhost:3000/admin/messages.html

	L'API `/api/messages` est protégée par Basic Auth pour éviter l'accès public. Par défaut les identifiants sont :
	- utilisateur : `admin`
	- mot de passe : `changeme`

	Vous pouvez définir vos propres identifiants via les variables d'environnement `ADMIN_USER` et `ADMIN_PASS` avant de lancer le serveur.

Exemples (PowerShell) :
```powershell
# Définir des identifiants temporaires et lancer
>$env:ADMIN_USER = 'monuser'; $env:ADMIN_PASS = 'monpass'; npm start
```

Notes :
- Les messages sont maintenant stockés dans `data/messages.db` (SQLite). Si vous avez des messages anciens dans `data/messages.json` vous pouvez les migrer ou supprimez-les.
- Si vous préférez une page d'administration non protégée (pour dev), on peut retirer le Basic Auth dans `server.js`.
