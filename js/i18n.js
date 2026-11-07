/**
 * Heritage Decks - i18n Localization Engine
 * Single-responsibility asynchronous translation manager.
 */

export class LocalizationManager {
  constructor() {
    this.currentLanguage = 'en';
    this.availableLanguages = ['en', 'hr', 'it'];
    this.translations = {};
    this.manifest = null;
  }

  /**
   * Initializes the localization engine.
   * Resolves initial language from URL (?lang=), localStorage, or browser navigator.
   */
  async init() {
    await this.loadManifest();
    const urlParams = new URLSearchParams(window.location.search);
    const paramLang = urlParams.get('lang');
    const storedLang = localStorage.getItem('heritage_decks_lang');
    const browserLang = (navigator.language || navigator.userLanguage || 'en').slice(0, 2).toLowerCase();

    let initialLang = 'en';
    if (paramLang && this.availableLanguages.includes(paramLang)) {
      initialLang = paramLang;
    } else if (storedLang && this.availableLanguages.includes(storedLang)) {
      initialLang = storedLang;
    } else if (this.availableLanguages.includes(browserLang)) {
      initialLang = browserLang;
    }

    await this.setLanguage(initialLang);
    this.bindLanguageSelectors();
  }

  /**
   * Loads the media manifest SSOT for dynamic alt-text localization.
   */
  async loadManifest() {
    try {
      const response = await fetch('images/image-manifest.json');
      if (response.ok) {
        this.manifest = await response.json();
      }
    } catch (error) {
      // Fallback silently if manifest is delayed
      this.manifest = null;
    }
  }

  /**
   * Loads language dictionary JSON.
   * @param {string} lang - 'en' | 'hr' | 'it'
   */
  async loadLanguage(lang) {
    if (this.translations[lang]) {
      return this.translations[lang];
    }
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language: ${lang}`);
      }
      const data = await response.json();
      this.translations[lang] = data;
      return data;
    } catch (error) {
      if (lang !== 'en') {
        return this.loadLanguage('en');
      }
      return null;
    }
  }

  /**
   * Gets nested string value by dot notation key (e.g. "hero.title").
   */
  getTranslation(key, dict = this.translations[this.currentLanguage]) {
    if (!dict) return null;
    const parts = key.split('.');
    let curr = dict;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        return null;
      }
    }
    return typeof curr === 'string' ? curr : null;
  }

  /**
   * Sets active language and updates the DOM elements.
   * @param {string} lang
   */
  async setLanguage(lang) {
    if (!this.availableLanguages.includes(lang)) {
      lang = 'en';
    }
    this.currentLanguage = lang;
    localStorage.setItem('heritage_decks_lang', lang);
    document.documentElement.setAttribute('lang', lang);

    const dict = await this.loadLanguage(lang);
    if (!dict) return;

    // Update document title and meta description
    if (dict.meta) {
      if (dict.meta.title) {
        document.title = dict.meta.title;
      }
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict.meta.description) {
        metaDesc.setAttribute('content', dict.meta.description);
      }
    }

    // Update text content for elements with data-i18n
    const translatableElements = document.querySelectorAll('[data-i18n]');
    translatableElements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = this.getTranslation(key, dict);
      if (val !== null) {
        el.textContent = val;
      }
    });

    // Update placeholders for form controls with data-i18n-placeholder
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = this.getTranslation(key, dict);
      if (val !== null) {
        el.setAttribute('placeholder', val);
      }
    });

    // Update aria-labels with data-i18n-aria-label
    const ariaElements = document.querySelectorAll('[data-i18n-aria-label]');
    ariaElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      const val = this.getTranslation(key, dict);
      if (val !== null) {
        el.setAttribute('aria-label', val);
      }
    });

    // Update image alt texts using image-manifest SSOT
    if (this.manifest) {
      const images = document.querySelectorAll('img[src]');
      images.forEach((img) => {
        const rawSrc = img.getAttribute('src');
        if (!rawSrc) return;
        // Normalize relative path
        const cleanPath = rawSrc.replace(/^(\.\/|\/)/, '');
        const entry = this.manifest[cleanPath];
        if (entry && entry.alt && entry.alt[this.currentLanguage]) {
          img.setAttribute('alt', entry.alt[this.currentLanguage]);
        }
      });
    }

    // Update language switcher state
    this.updateLanguageUI();

    // Dispatch custom event for modules that depend on language changes
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: this.currentLanguage, dictionary: dict }
    }));
  }

  /**
   * Binds click events to language selector buttons.
   */
  bindLanguageSelectors() {
    const langButtons = document.querySelectorAll('[data-set-lang]');
    langButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetLang = btn.getAttribute('data-set-lang');
        if (targetLang && targetLang !== this.currentLanguage) {
          this.setLanguage(targetLang);
        }
      });
    });
  }

  /**
   * Updates visual active state and ARIA pressed states on language toggles.
   */
  updateLanguageUI() {
    const langButtons = document.querySelectorAll('[data-set-lang]');
    langButtons.forEach((btn) => {
      const btnLang = btn.getAttribute('data-set-lang');
      const isActive = btnLang === this.currentLanguage;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }
}

