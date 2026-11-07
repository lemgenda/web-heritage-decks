/**
 * Heritage Decks - Project Gallery Modal Module
 * Handles opening full multi-image project galleries on card click,
 * keyboard navigation (Left/Right/Esc), thumbnail selection, focus trapping, and localized alts.
 */

export class ProjectGalleryManager {
  constructor(i18nManager) {
    this.i18n = i18nManager;
    this.projectsData = [];
    this.activeProject = null;
    this.activeIndex = 0;
    this.triggerElement = null;

    // DOM Elements
    this.modal = document.getElementById('gallery-modal');
    this.modalTitle = document.getElementById('modal-project-title');
    this.modalTag = document.getElementById('modal-project-tag');
    this.modalDesc = document.getElementById('modal-project-desc');
    this.stageImg = document.getElementById('modal-active-img');
    this.currentIndexEl = document.getElementById('modal-current-index');
    this.totalCountEl = document.getElementById('modal-total-count');
    this.thumbsContainer = document.getElementById('gallery-thumbnails');
    this.prevBtn = document.getElementById('gallery-prev');
    this.nextBtn = document.getElementById('gallery-next');
  }

  async init() {
    if (!this.modal) return;
    try {
      const res = await fetch('images/projects-data.json');
      if (res.ok) {
        this.projectsData = await res.json();
      }
    } catch (e) {
      console.warn('Could not load projects data:', e);
    }

    this.bindCardEvents();
    this.bindModalEvents();
  }

  bindCardEvents() {
    const cards = document.querySelectorAll('.gallery-card[data-project-id]');
    cards.forEach((card) => {
      const handler = () => {
        const projectId = card.getAttribute('data-project-id');
        this.openProject(projectId, card);
      };

      card.addEventListener('click', handler);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });
    });
  }

  bindModalEvents() {
    // Close triggers
    const closeTriggers = this.modal.querySelectorAll('[data-modal-close]');
    closeTriggers.forEach((btn) => {
      btn.addEventListener('click', () => this.close());
    });

    // Prev / Next buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.showPrev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.showNext());
    }

    // Keyboard support: Escape, Left, Right, Tab trapping
    document.addEventListener('keydown', (e) => {
      if (this.modal.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.showPrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.showNext();
        } else if (e.key === 'Tab') {
          this.trapFocus(e);
        }
      }
    });
  }

  openProject(projectId, triggerEl = null) {
    const project = this.projectsData.find((p) => p.id === projectId);
    if (!project) return;

    this.triggerElement = triggerEl;
    this.activeProject = project;
    this.activeIndex = 0;

    // Localized texts
    const currentLang = this.i18n ? this.i18n.currentLanguage : 'en';
    const title = project.titles[currentLang] || project.titles.en;
    const tag = project.tags[currentLang] || project.tags.en;
    const desc = project.descs[currentLang] || project.descs.en;

    this.modalTitle.textContent = title;
    this.modalTag.textContent = tag;
    this.modalDesc.textContent = desc;
    this.totalCountEl.textContent = project.images.length;

    // Render Thumbnails
    this.thumbsContainer.innerHTML = '';
    project.images.forEach((imgSrc, idx) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.className = `gallery-thumb-btn ${idx === 0 ? 'active' : ''}`;
      thumbBtn.setAttribute('role', 'tab');
      thumbBtn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      thumbBtn.setAttribute('aria-label', `Thumbnail ${idx + 1} of ${project.images.length}`);

      const thumbImg = document.createElement('img');
      thumbImg.src = imgSrc;
      thumbImg.alt = `${title} - photo ${idx + 1}`;
      thumbImg.loading = 'lazy';
      thumbImg.width = 120;
      thumbImg.height = 90;

      thumbBtn.appendChild(thumbImg);
      thumbBtn.addEventListener('click', () => {
        this.setActiveIndex(idx);
      });
      this.thumbsContainer.appendChild(thumbBtn);
    });

    this.setActiveIndex(0);

    // Open Modal
    this.modal.setAttribute('aria-hidden', 'false');
    this.modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    const closeBtn = this.modal.querySelector('.gallery-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  setActiveIndex(index) {
    if (!this.activeProject) return;
    const images = this.activeProject.images;
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    this.activeIndex = index;
    const currentLang = this.i18n ? this.i18n.currentLanguage : 'en';
    const title = this.activeProject.titles[currentLang] || this.activeProject.titles.en;

    this.stageImg.src = images[index];
    this.stageImg.alt = `${title} - image ${index + 1} of ${images.length}`;
    this.currentIndexEl.textContent = index + 1;

    // Update active thumb
    const thumbBtns = this.thumbsContainer.querySelectorAll('.gallery-thumb-btn');
    thumbBtns.forEach((btn, idx) => {
      const isActive = idx === index;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  showPrev() {
    this.setActiveIndex(this.activeIndex - 1);
  }

  showNext() {
    this.setActiveIndex(this.activeIndex + 1);
  }

  close() {
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.classList.remove('is-open');
    document.body.style.overflow = '';

    if (this.triggerElement) {
      this.triggerElement.focus();
    }
  }

  trapFocus(e) {
    const focusable = this.modal.querySelectorAll('button:not([disabled]), [tabindex="0"]');
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }
}

