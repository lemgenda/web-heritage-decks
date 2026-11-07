/**
 * Heritage Decks - Theme Switcher Module
 * Handles Light / Dark theme toggling with WCAG 2.2 AA compliant contrast preservation.
 */

export class ThemeManager {
  constructor() {
    this.storageKey = 'heritage_decks_theme';
    this.currentTheme = 'dark'; // Dark luxury nautical as default
  }

  init() {
    const savedTheme = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }

    this.applyTheme(this.currentTheme);
    this.bindEvents();

    // Listen to system preference changes if user hasn't explicitly set preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
    this.updateToggleButtons();
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  bindEvents() {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
    });
  }

  updateToggleButtons() {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach((btn) => {
      const isDark = this.currentTheme === 'dark';
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      const icon = btn.querySelector('i');
      if (icon) {
        if (isDark) {
          icon.className = 'fas fa-sun';
        } else {
          icon.className = 'fas fa-moon';
        }
      }
    });
  }
}

