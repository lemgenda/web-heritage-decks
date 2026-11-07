/**
 * Heritage Decks - Contact Form Validation & Sanitization Module
 * Strict client-side validation, XSS prevention, and localized WCAG aria-invalid handling.
 */

export class ContactFormManager {
  constructor(i18nManager) {
    this.i18n = i18nManager;
    this.form = document.getElementById('contact-form');
    this.statusBox = document.getElementById('form-status');
  }

  init() {
    if (!this.form) return;
    this.form.setAttribute('novalidate', 'true');
    this.bindEvents();
  }

  msg(key, fallback) {
    if (this.i18n) {
      const val = this.i18n.getTranslation(`form.${key}`);
      if (val) return val;
    }
    return fallback;
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') {
          this.validateField(input);
        }
      });
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
    });
  }

  sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  validateField(field) {
    const errorSpan = document.getElementById(`${field.id}-error`);
    let isValid = true;
    let message = '';

    const val = field.value ? field.value.trim() : '';

    if (field.hasAttribute('required')) {
      if (field.type === 'checkbox') {
        if (!field.checked) {
          isValid = false;
          message = this.msg('errConsent', 'You must accept the privacy policy to submit an inquiry.');
        }
      } else if (!val) {
        isValid = false;
        message = this.msg('errRequired', 'This field is required.');
      }
    }

    if (isValid && field.type === 'email' && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        isValid = false;
        message = this.msg('errEmail', 'Please enter a valid email address.');
      }
    }

    if (isValid && field.type === 'tel' && val) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
      if (!phoneRegex.test(val)) {
        isValid = false;
        message = this.msg('errPhone', 'Please enter a valid telephone number.');
      }
    }

    if (!isValid) {
      field.setAttribute('aria-invalid', 'true');
      if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
      }
    } else {
      field.removeAttribute('aria-invalid');
      if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
      }
    }

    return isValid;
  }

  handleSubmit() {
    const fields = Array.from(this.form.querySelectorAll('input, select, textarea'));
    let firstInvalid = null;
    let isAllValid = true;

    fields.forEach((field) => {
      const valid = this.validateField(field);
      if (!valid) {
        isAllValid = false;
        if (!firstInvalid) {
          firstInvalid = field;
        }
      }
    });

    if (!isAllValid) {
      if (firstInvalid) {
        firstInvalid.focus();
      }
      if (this.statusBox) {
        this.statusBox.className = 'form-status status-error';
        this.statusBox.textContent = this.msg('errSummary', 'Please correct the errors in the form before submitting.');
        this.statusBox.removeAttribute('aria-hidden');
      }
      return;
    }

    // Process submission simulation
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      const sendingText = this.msg('sending', 'Sending inquiry...');
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> <span>${sendingText}</span>`;
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      this.form.reset();
      if (this.statusBox) {
        this.statusBox.className = 'form-status status-success';
        this.statusBox.textContent = this.msg('successMsg', 'Thank you! Master shipwright Perica Bajs and our team will contact you within 24 hours.');
        this.statusBox.removeAttribute('aria-hidden');
        this.statusBox.focus();
      }
    }, 1000);
  }
}
