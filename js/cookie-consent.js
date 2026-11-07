/**
 * Heritage Decks - GDPR Cookie Consent Manager
 * Provides accessible polite dialog with strict script gating and focus trapping.
 */

export class CookieConsentManager {
  constructor() {
    this.storageKey = 'heritage_decks_cookie_consent';
    this.banner = document.getElementById('cookie-banner');
    this.acceptBtn = document.getElementById('cookie-accept');
    this.declineBtn = document.getElementById('cookie-decline');
  }

  init() {
    if (!this.banner) return;

    const consent = localStorage.getItem(this.storageKey);
    if (!consent) {
      this.showBanner();
    } else if (consent === 'accepted') {
      this.enableAnalytics();
    }

    if (this.acceptBtn) {
      this.acceptBtn.addEventListener('click', () => {
        this.saveConsent('accepted');
      });
    }

    if (this.declineBtn) {
      this.declineBtn.addEventListener('click', () => {
        this.saveConsent('declined');
      });
    }
  }

  showBanner() {
    this.banner.classList.add('is-active');
    this.banner.removeAttribute('aria-hidden');

    // Keep focus inside banner
    const firstFocusable = this.banner.querySelector('button, a');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 200);
    }

    // Modal trap
    this.banner.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = this.banner.querySelectorAll('button, a[href]');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  hideBanner() {
    this.banner.classList.remove('is-active');
    this.banner.setAttribute('aria-hidden', 'true');
  }

  saveConsent(status) {
    localStorage.setItem(this.storageKey, status);
    this.hideBanner();
    if (status === 'accepted') {
      this.enableAnalytics();
    }
  }

  enableAnalytics() {
    // Unblock tracking or deferred analytics scripts strictly after explicit consent
    window.dispatchEvent(new CustomEvent('analyticsConsentGranted'));
  }
}

