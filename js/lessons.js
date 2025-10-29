// ===== SYSTÈME DE FILTRAGE DES COURS =====

document.addEventListener('DOMContentLoaded', () => {
  const languageFilter = document.getElementById('language-filter');
  const levelFilter = document.getElementById('level-filter');
  const typeFilter = document.getElementById('type-filter');
  const lessonCards = document.querySelectorAll('.lesson-card');

  // Fonction de filtrage
  const filterLessons = () => {
    const selectedLanguage = languageFilter.value;
    const selectedLevel = levelFilter.value;
    const selectedType = typeFilter.value;

    let visibleCount = 0;

    lessonCards.forEach(card => {
      const cardLanguage = card.getAttribute('data-language');
      const cardLevel = card.getAttribute('data-level');
      const cardType = card.getAttribute('data-type');

      const languageMatch = selectedLanguage === 'all' || cardLanguage === selectedLanguage;
      const levelMatch = selectedLevel === 'all' || cardLevel === selectedLevel;
      const typeMatch = selectedType === 'all' || cardType === selectedType;

      if (languageMatch && levelMatch && typeMatch) {
        card.classList.remove('hidden');
        // Animation d'apparition
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, visibleCount * 50);
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    // Message si aucun résultat
    showNoResultsMessage(visibleCount);
  };

  // Message "Aucun résultat"
  const showNoResultsMessage = (count) => {
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    if (count === 0) {
      const lessonsGrid = document.querySelector('.lessons-grid');
      const message = document.createElement('div');
      message.className = 'no-results-message';
      message.innerHTML = `
        <div style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        ">
          <h3 style="font-size: 1.5rem; color: #64748b; margin-bottom: 1rem;">
            😔 Aucun cours trouvé
          </h3>
          <p style="color: #64748b;">
            Essayez de modifier vos filtres pour voir plus de résultats.
          </p>
        </div>
      `;
      lessonsGrid.appendChild(message);
    }
  };

  // Écouteurs d'événements sur les filtres
  languageFilter.addEventListener('change', filterLessons);
  levelFilter.addEventListener('change', filterLessons);
  typeFilter.addEventListener('change', filterLessons);

  // Animation initiale des cartes
  lessonCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });

  // ===== GESTION DES BOUTONS "COMMENCER LE COURS" =====
  const lessonButtons = document.querySelectorAll('.lesson-btn');
  
  lessonButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const card = this.closest('.lesson-card');
      const lessonTitle = card.querySelector('h3').textContent;
      const lessonType = card.getAttribute('data-type');
      
      // Animation du bouton
      this.textContent = '✓ Chargement...';
      this.style.background = '#10b981';
      
      // Simuler le chargement (remplacez par votre logique réelle)
      setTimeout(() => {
        // Ouvrir la page du cours ou afficher le lecteur vidéo/audio
        openLessonPlayer(lessonTitle, lessonType);
        
        // Réinitialiser le bouton
        this.textContent = 'Commencer le cours';
        this.style.background = '';
      }, 1000);
    });
  });

  // ===== FONCTION D'OUVERTURE DU LECTEUR =====
  const openLessonPlayer = (title, type) => {
    // Créer une modal pour le lecteur
    const modal = document.createElement('div');
    modal.className = 'lesson-modal';
    modal.innerHTML = `
      <div class="lesson-modal-content">
        <button class="lesson-modal-close">✕</button>
        <h2>${title}</h2>
        <div class="lesson-player">
          ${getPlayerHTML(type)}
        </div>
        <div class="lesson-controls">
          <button class="lesson-prev-btn">← Leçon précédente</button>
          <button class="lesson-next-btn">Leçon suivante →</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Ajouter les styles de la modal
    addModalStyles();
    
    // Animation d'ouverture
    setTimeout(() => {
      modal.style.opacity = '1';
      modal.querySelector('.lesson-modal-content').style.transform = 'scale(1)';
    }, 10);
    
    // Fermer la modal
    const closeBtn = modal.querySelector('.lesson-modal-close');
    closeBtn.addEventListener('click', () => {
      modal.style.opacity = '0';
      modal.querySelector('.lesson-modal-content').style.transform = 'scale(0.9)';
      setTimeout(() => modal.remove(), 300);
    });
    
    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeBtn.click();
      }
    });
  };

  // ===== GÉNÉRER LE HTML DU LECTEUR =====
  const getPlayerHTML = (type) => {
    switch(type) {
      case 'video':
        return `
          <video controls style="width: 100%; border-radius: 10px;">
            <source src="videos/sample.mp4" type="video/mp4">
            Votre navigateur ne supporte pas la vidéo.
          </video>
          <p style="margin-top: 1rem; color: #64748b;">
            📹 Remplacez "videos/sample.mp4" par le chemin de votre vidéo
          </p>
        `;
      case 'audio':
        return `
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 3rem; border-radius: 10px; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎧</div>
            <audio controls style="width: 100%;">
              <source src="audios/sample.mp3" type="audio/mpeg">
              Votre navigateur ne supporte pas l'audio.
            </audio>
          </div>
          <p style="margin-top: 1rem; color: #64748b;">
            🎵 Remplacez "audios/sample.mp3" par le chemin de votre audio
          </p>
        `;
      case 'text':
        return `
          <div style="background: white; padding: 2rem; border-radius: 10px; max-height: 500px; overflow-y: auto;">
            <h3>Contenu du cours</h3>
            <p>Ici apparaîtra le contenu textuel de votre cours.</p>
            <p>Vous pouvez ajouter du texte, des images, des exercices interactifs, etc.</p>
          </div>
        `;
      default:
        return '<p>Type de cours non reconnu</p>';
    }
  };

  // ===== STYLES DE LA MODAL =====
  const addModalStyles = () => {
    if (!document.getElementById('lesson-modal-styles')) {
      const styles = document.createElement('style');
      styles.id = 'lesson-modal-styles';
      styles.textContent = `
        .lesson-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          opacity: 0;
          transition: opacity 0.3s ease;
          padding: 1rem;
        }

        .lesson-modal-content {
          background: white;
          border-radius: 20px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2rem;
          position: relative;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }

        .lesson-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #64748b;
          transition: color 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .lesson-modal-close:hover {
          color: #1e293b;
          background: #f1f5f9;
        }

        .lesson-modal-content h2 {
          margin-bottom: 1.5rem;
          color: #1e293b;
          padding-right: 3rem;
        }

        .lesson-player {
          margin-bottom: 2rem;
        }

        .lesson-controls {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
        }

        .lesson-prev-btn,
        .lesson-next-btn {
          padding: 0.8rem 1.5rem;
          border: 2px solid #6366f1;
          background: white;
          color: #6366f1;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .lesson-prev-btn:hover,
        .lesson-next-btn:hover {
          background: #6366f1;
          color: white;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .lesson-modal-content {
            padding: 1.5rem;
          }

          .lesson-controls {
            flex-direction: column;
          }
        }
      `;
      document.head.appendChild(styles);
    }
  };

  // ===== COMPTEUR DE COURS AFFICHÉS =====
  const updateLessonCount = () => {
    const visibleLessons = document.querySelectorAll('.lesson-card:not(.hidden)').length;
    const totalLessons = lessonCards.length;
    
    let countDisplay = document.querySelector('.lesson-count');
    if (!countDisplay) {
      countDisplay = document.createElement('div');
      countDisplay.className = 'lesson-count';
      countDisplay.style.cssText = `
        text-align: center;
        margin: 2rem 0;
        font-size: 1.1rem;
        color: #64748b;
        font-weight: 500;
      `;
      document.querySelector('.lessons-grid').insertAdjacentElement('beforebegin', countDisplay);
    }
    
    countDisplay.textContent = `${visibleLessons} cours disponible${visibleLessons > 1 ? 's' : ''} sur ${totalLessons}`;
  };

  // Initialiser le compteur
  updateLessonCount();

  // Mettre à jour le compteur lors du filtrage
  [languageFilter, levelFilter, typeFilter].forEach(filter => {
    filter.addEventListener('change', () => {
      setTimeout(updateLessonCount, 100);
    });
  });

  console.log('🎓 Page des cours initialisée avec succès!');
});