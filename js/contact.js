// ===== GESTION DU FORMULAIRE DE CONTACT =====

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Validation en temps réel
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearError(input));
    });
  }

  // Animation des éléments au scroll
  animateOnScroll();
});

// ===== SOUMISSION DU FORMULAIRE =====
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('.submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnIcon = submitBtn.querySelector('.btn-icon');
  
  // Valider tous les champs
  if (!validateForm(form)) {
    showMessage('Veuillez remplir tous les champs requis correctement.', 'error');
    return;
  }
  
  // Récupérer les données du formulaire
  const formData = {
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value || 'Non renseigné',
    subject: form.subject.value,
    message: form.message.value
  };
  
  // Animation du bouton (chargement)
  submitBtn.disabled = true;
  btnText.textContent = 'Envoi en cours...';
  btnIcon.textContent = '⏳';
  
  // Simuler l'envoi (remplacez par votre vraie logique d'envoi)
  try {
    await sendMessage(formData);
    
    // Succès
    btnText.textContent = 'Message envoyé !';
    btnIcon.textContent = '✓';
    submitBtn.style.background = '#10b981';
    
    // Afficher le message de succès
    showSuccessMessage();
    
    // Réinitialiser le formulaire
    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      btnText.textContent = 'Envoyer le message';
      btnIcon.textContent = '📤';
      submitBtn.style.background = '';
    }, 3000);
    
  } catch (error) {
    // Erreur
    btnText.textContent = 'Erreur d\'envoi';
    btnIcon.textContent = '✗';
    submitBtn.style.background = '#ef4444';
    
    showMessage('Une erreur est survenue. Veuillez réessayer.', 'error');
    
    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.textContent = 'Envoyer le message';
      btnIcon.textContent = '📤';
      submitBtn.style.background = '';
    }, 3000);
  }
}

// ===== FONCTION D'ENVOI (à personnaliser) =====
async function sendMessage(data) {
  // Simuler un délai d'envoi
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // ICI : Ajoutez votre logique d'envoi réelle
  // Exemples :
  // - Envoi via EmailJS
  // - Envoi vers votre API backend
  // - Envoi via un service tiers
  
  console.log('Message envoyé:', data);
  
  // Pour tester une erreur, décommentez :
  // throw new Error('Test erreur');
  
  return true;
}

// ===== VALIDATION DU FORMULAIRE =====
function validateForm(form) {
  let isValid = true;
  
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  return isValid;
}

// ===== VALIDATION D'UN CHAMP =====
function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  let isValid = true;
  let errorMessage = '';
  
  // Vérifier si le champ est requis et vide
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'Ce champ est requis';
  }
  
  // Validation spécifique pour l'email
  if (fieldName === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Email invalide';
    }
  }
  
  // Validation spécifique pour le téléphone
  if (fieldName === 'phone' && value) {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(value)) {
      isValid = false;
      errorMessage = 'Numéro invalide';
    }
  }
  
  // Afficher ou masquer l'erreur
  if (!isValid) {
    showFieldError(field, errorMessage);
  } else {
    clearError(field);
  }
  
  return isValid;
}

// ===== AFFICHER L'ERREUR D'UN CHAMP =====
function showFieldError(field, message) {
  clearError(field);
  
  field.style.borderColor = '#ef4444';
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 0.3rem;
    font-weight: 500;
  `;
  
  field.parentElement.appendChild(errorDiv);
}

// ===== EFFACER L'ERREUR D'UN CHAMP =====
function clearError(field) {
  field.style.borderColor = '';
  const errorDiv = field.parentElement.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// ===== MESSAGE DE SUCCÈS =====
function showSuccessMessage() {
  const message = document.createElement('div');
  message.className = 'success-message';
  message.innerHTML = `
    <span style="font-size: 1.5rem;">✓</span>
    <span>Message envoyé avec succès !</span>
  `;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.style.animation = 'slideOutRight 0.4s ease';
    setTimeout(() => message.remove(), 400);
  }, 4000);
}

// ===== MESSAGE GÉNÉRIQUE =====
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

// ===== ANIMATION AU SCROLL =====
function animateOnScroll() {
  const elements = document.querySelectorAll('.faq-item, .info-item, .social-link');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
      }
    });
  }, {
    threshold: 0.1
  });
  
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ===== ANIMATION DES LABELS FLOTTANTS (Optionnel) =====
function addFloatingLabels() {
  const formGroups = document.querySelectorAll('.form-group');
  
  formGroups.forEach(group => {
    const input = group.querySelector('input, textarea, select');
    const label = group.querySelector('label');
    
    if (input && label) {
      input.addEventListener('focus', () => {
        label.style.color = 'var(--primary)';
        label.style.transform = 'translateY(-2px)';
      });
      
      input.addEventListener('blur', () => {
        label.style.color = '';
        label.style.transform = '';
      });
    }
  });
}

// Initialiser les labels flottants
addFloatingLabels();

// ===== COPIER EMAIL AU CLIC =====
const emailLinks = document.querySelectorAll('.info-content a[href^="mailto:"]');
emailLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const email = link.textContent;
    
    navigator.clipboard.writeText(email).then(() => {
      const originalText = link.textContent;
      link.textContent = '✓ Copié !';
      link.style.color = '#10b981';
      
      setTimeout(() => {
        link.textContent = originalText;
        link.style.color = '';
      }, 2000);
    });
  });
});

console.log('📧 Page Contact initialisée avec succès!');