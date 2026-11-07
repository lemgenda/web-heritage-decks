/**
 * Heritage Decks - Central Application Orchestrator
 * Bootstraps single-responsibility modules: Theme, i18n, UI effects, Cookie Consent, and Contact Form.
 */

import { ThemeManager } from './theme.js';
import { LocalizationManager } from './i18n.js';
import { UIEffectsManager } from './ui-effects.js';
import { CookieConsentManager } from './cookie-consent.js';
import { ContactFormManager } from './contact-form.js';
import { ProjectGalleryManager } from './gallery-modal.js';

class AppOrchestrator {
  constructor() {
    this.themeManager = new ThemeManager();
    this.i18nManager = new LocalizationManager();
    this.uiEffectsManager = new UIEffectsManager();
    this.cookieConsentManager = new CookieConsentManager();
    this.contactFormManager = new ContactFormManager(this.i18nManager);
    this.projectGalleryManager = new ProjectGalleryManager(this.i18nManager);
  }

  async init() {
    // 1. Initialize theme to prevent flash of wrong theme
    this.themeManager.init();

    // 2. Initialize i18n engine and DOM translations
    await this.i18nManager.init();

    // 3. Initialize interactive UI effects (navigation, scroll, accordions)
    this.uiEffectsManager.init();

    // 4. Initialize GDPR cookie consent banner
    this.cookieConsentManager.init();

    // 5. Initialize contact form handling with localized strings
    this.contactFormManager.init();

    // 6. Initialize project gallery modal dialog
    await this.projectGalleryManager.init();
  }
}

// Bootstrap application once DOM content is parsed
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppOrchestrator();
  app.init().catch((err) => {
    console.error('Heritage Decks App initialization error:', err);
  });
});
