// Gestion des formulaires et de l'authentification
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authTabs = document.querySelectorAll('.auth-tab');
  const API_BASE = location.protocol === 'file:' ? 'http://localhost:3000' : '';

  // Gestionnaire de tabs
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetForm = tab.dataset.form;
      
      // Activer l'onglet
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Afficher le formulaire correspondant
      document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
      });
      document.getElementById(targetForm + 'Form').classList.add('active');
    });
  });

  // Connexion
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginForm.querySelector('[name="email"]').value;
    const password = loginForm.querySelector('[name="password"]').value;
    
    try {
      const res = await fetch(API_BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }
      
      // Stocker le token et rediriger
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showMessage('Connexion réussie !', 'success');
      
      // Rediriger selon le rôle
      if (data.user.role === 'admin') {
        setTimeout(() => window.location.href = '/admin/messages.html', 1000);
      } else {
        setTimeout(() => window.location.href = '/lessons.html', 1000);
      }
      
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });

  // Inscription
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = registerForm.querySelector('[name="name"]').value;
    const email = registerForm.querySelector('[name="email"]').value;
    const password = registerForm.querySelector('[name="password"]').value;
    const confirmPassword = registerForm.querySelector('[name="confirmPassword"]').value;
    
    // Validation locale
    if (password !== confirmPassword) {
      showMessage('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    try {
      const res = await fetch(API_BASE + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur d\'inscription');
      }
      
      showMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
      
      // Switcher sur le formulaire de connexion
      document.querySelector('[data-form="login"]').click();
      
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });
});

// Afficher un message de succès/erreur
function showMessage(text, type = 'info') {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#6366f1'
  };
  
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ'
  };
  
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 100px;
    right: 2rem;
    background: ${colors[type]};
    color: white;
    padding: 1.5rem 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 600;
    z-index: 1000;
    animation: slideInRight 0.4s ease;
  `;
  
  message.innerHTML = `
    <span style="font-size: 1.5rem;">${icons[type]}</span>
    <span>${text}</span>
  `;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.style.animation = 'slideOutRight 0.4s ease';
    setTimeout(() => message.remove(), 400);
  }, 4000);
}