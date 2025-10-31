// ===== MODE SOMBRE =====
const initDarkMode = () => {
  // Créer le bouton de mode sombre
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'dark-mode-toggle';
  darkModeToggle.setAttribute('aria-label', 'Basculer le mode sombre');
  darkModeToggle.innerHTML = '<span class="toggle-icon">🌙</span>';
  document.body.appendChild(darkModeToggle);

  // Vérifier la préférence sauvegardée
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    enableDarkMode();
  }

  // Événement de clic sur le bouton
  darkModeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  });

  // Fonction pour activer le mode sombre
  function enableDarkMode() {
    document.body.classList.add('dark-mode');
    darkModeToggle.querySelector('.toggle-icon').textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }

  // Fonction pour désactiver le mode sombre
  function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    darkModeToggle.querySelector('.toggle-icon').textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
};

// ===== MENU MOBILE =====
const initMobileMenu = () => {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      
      // Animation de l'icône hamburger
      const icon = menuToggle.textContent;
      menuToggle.textContent = icon === '☰' ? '✕' : '☰';
    });

    // Fermer le menu lors du clic sur un lien
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.textContent = '☰';
      });
    });

    // Fermer le menu lors du clic à l'extérieur
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar')) {
        navLinks.classList.remove('active');
        menuToggle.textContent = '☰';
      }
    });
  }
};

// ===== INDICATEUR DE PAGE ACTIVE =====
const setActivePage = () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinksAll = document.querySelectorAll('.nav-links a');
  
  navLinksAll.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active-page');
    }
  });
};

// ===== SCROLL ANIMATIONS =====
const observeElements = () => {
  const elements = document.querySelectorAll('.feature, .hero, .footer-section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
};

// ===== SMOOTH SCROLL =====
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// ===== NEWSLETTER FORM =====
const handleNewsletterForm = () => {
  const forms = document.querySelectorAll('.newsletter-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput.value;
      
      if (email) {
        // Animation de succès
        const button = form.querySelector('button');
        const originalText = button.textContent;
        button.textContent = '✓ Inscrit !';
        button.style.background = '#10b981';
        
        // Réinitialiser après 3 secondes
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '';
          emailInput.value = '';
        }, 3000);
        
        // Ici vous pouvez ajouter votre logique d'envoi
        console.log('Email inscrit:', email);
      }
    });
  });
};

// ===== NAVBAR SCROLL EFFECT =====
const handleNavbarScroll = () => {
  const navbar = document.querySelector('header');
  if (!navbar) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Ajouter ombre lors du scroll
    if (currentScroll > 50) {
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
      navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
  });
};

// ===== LOADING ANIMATION =====
const initPageTransition = () => {
  // Effet de fondu lors du chargement
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';
  
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });
  
  // Effet lors du clic sur les liens
  const internalLinks = document.querySelectorAll('a[href^="./"], a[href^="index.html"], a[href^="lessons.html"], a[href^="about.html"], a[href^="contact.html"]');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#')) {
        e.preventDefault();
        document.body.style.opacity = '0';
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }
    });
  });
};

// ===== BOUTON SCROLL TO TOP =====
const createScrollToTopButton = () => {
  // Créer le bouton
  const button = document.createElement('button');
  button.innerHTML = '↑';
  button.className = 'scroll-to-top';
  button.setAttribute('aria-label', 'Retour en haut');
  document.body.appendChild(button);
  
  // Afficher/masquer selon le scroll
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  });
  
  // Action au clic
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};

// ===== ANIMATIONS AU HOVER DES FEATURES =====
const enhanceFeatureCards = () => {
  const features = document.querySelectorAll('.feature');
  
  features.forEach(feature => {
    feature.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
    
    feature.addEventListener('mouseleave', function() {
      this.style.transition = 'all 0.4s ease';
    });
  });
};

// ===== ANNÉE DANS LE FOOTER =====
const updateYear = () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
};

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initMobileMenu();
  setActivePage();
  observeElements();
  initSmoothScroll();
  handleNewsletterForm();
  handleNavbarScroll();
  initPageTransition();
  createScrollToTopButton();
  enhanceFeatureCards();
  updateYear();
  
  console.log('🎯 Langly chargé avec succès!');
});

// ===== GESTION DES ERREURS =====
window.addEventListener('error', (e) => {
  console.error('Erreur détectée:', e.message);
});

// ===== PERFORMANCE =====
// Lazy loading pour les images
if ('loading' in HTMLImageElement.prototype) {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
  });
} else {
  // Fallback pour les navigateurs plus anciens
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
  document.body.appendChild(script);
}

require("dotenv").config();

const http = require("http");
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

const requestHandler = async (req, res) => {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(version);
};

http.createServer(requestHandler).listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});