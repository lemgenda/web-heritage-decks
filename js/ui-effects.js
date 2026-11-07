/**
 * Heritage Decks - UI Effects and Interactions Module
 * Handles mobile drawer navigation, focus trapping, skip link behavior, and back-to-top scroll button.
 */

export class UIEffectsManager {
  constructor() {
    this.menuToggle = document.getElementById('menu-toggle');
    this.navMenu = document.getElementById('nav-menu');
    this.backToTopBtn = document.getElementById('back-to-top');
    this.header = document.querySelector('.site-header');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.isOpen = false;
  }

  init() {
    this.initMobileMenu();
    this.initScrollEffects();
    this.initBackToTop();
    this.initFilterTabs();
    this.initAccordionA11y();
  }

  initMobileMenu() {
    if (!this.menuToggle || !this.navMenu) return;

    this.menuToggle.addEventListener('click', () => {
      this.toggleMenu();
    });

    // Close menu on link click
    this.navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (this.isOpen) {
          this.closeMenu();
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
        this.menuToggle.focus();
      }
    });

    // Focus trap inside open mobile menu
    this.navMenu.addEventListener('keydown', (e) => {
      if (!this.isOpen || e.key !== 'Tab') return;
      const focusables = this.navMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });
  }

  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isOpen = true;
    this.navMenu.classList.add('is-open');
    this.menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    const firstFocusable = this.navMenu.querySelector('a, button');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }
  }

  closeMenu() {
    this.isOpen = false;
    this.navMenu.classList.remove('is-open');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  initScrollEffects() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (this.header) {
        if (scrollY > 50) {
          this.header.classList.add('is-scrolled');
        } else {
          this.header.classList.remove('is-scrolled');
        }
      }

      if (this.backToTopBtn) {
        if (scrollY > 300) {
          this.backToTopBtn.classList.add('is-visible');
          this.backToTopBtn.removeAttribute('aria-hidden');
        } else {
          this.backToTopBtn.classList.remove('is-visible');
          this.backToTopBtn.setAttribute('aria-hidden', 'true');
        }
      }
    }, { passive: true });
  }

  initBackToTop() {
    if (!this.backToTopBtn) return;
    this.backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      const skipLink = document.querySelector('.skip-link');
      if (skipLink) {
        skipLink.focus();
      }
    });
  }

  initFilterTabs() {
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-card');

    if (!filterButtons.length || !galleryItems.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-filter');

        filterButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        galleryItems.forEach((item) => {
          const itemCat = item.getAttribute('data-category');
          if (category === 'all' || itemCat === category) {
            item.style.display = '';
            item.removeAttribute('aria-hidden');
          } else {
            item.style.display = 'none';
            item.setAttribute('aria-hidden', 'true');
          }
        });
      });
    });
  }

  initAccordionA11y() {
    const detailsList = document.querySelectorAll('.faq-accordion details');
    detailsList.forEach((detail) => {
      detail.addEventListener('toggle', () => {
        const summary = detail.querySelector('summary');
        if (summary) {
          summary.setAttribute('aria-expanded', detail.open ? 'true' : 'false');
        }
      });
    });
  }
}

