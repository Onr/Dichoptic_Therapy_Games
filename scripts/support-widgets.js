(function () {
  const STYLE_ID = 'support-widgets-style';

  const STYLE_CONTENT = `
    .support-widgets {
      margin: 2rem auto;
      padding: 1.5rem;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05));
      color: #f8f8ff;
      max-width: 960px;
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      font-family: 'Poppins', 'Segoe UI', sans-serif;
    }
    .support-widgets__grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      align-items: stretch;
    }
    .support-widgets__panel {
      background: rgba(14, 21, 48, 0.55);
      border-radius: 14px;
      padding: 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    .support-widgets__panel h3 {
      margin-top: 0;
      font-size: 1.2rem;
      color: #fff;
    }
    .support-widgets__panel p,
    .support-widgets__panel li,
    .support-widgets__panel label {
      font-size: 0.95rem;
      line-height: 1.6;
    }
    .support-widgets__links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .support-widgets__link,
    .support-widgets__feedback-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.6rem 1.1rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .support-widgets__link:hover,
    .support-widgets__feedback-toggle:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }
    .support-widgets__modal {
      position: fixed;
      inset: 0;
      background: rgba(7, 12, 26, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      z-index: 4000;
    }
    .support-widgets__modal[hidden] {
      display: none;
    }
    .support-widgets__dialog {
      background: #0f162e;
      border-radius: 20px;
      width: min(640px, 95vw);
      padding: 2rem;
      color: #fff;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .support-widgets__close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .support-widgets form {
      display: grid;
      gap: 1rem;
    }
    .support-widgets label {
      display: grid;
      gap: 0.35rem;
      font-weight: 600;
      color: #f3f5ff;
    }
    .support-widgets input[type="email"],
    .support-widgets select,
    .support-widgets textarea,
    .support-widgets input[type="text"] {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: rgba(12, 19, 41, 0.75);
      color: #fff;
      font-size: 0.95rem;
    }
    .support-widgets textarea {
      min-height: 100px;
      resize: vertical;
    }
    .support-widgets button[type="submit"],
    .support-widgets button[type="button"].support-widgets__feedback-toggle {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: #fff;
      border-radius: 999px;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .support-widgets button[type="submit"]:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.35);
    }
    .support-widgets__checkbox {
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
      font-weight: 500;
    }
    .support-widgets__checkbox input {
      margin-top: 0.2rem;
    }
    .support-widgets__status {
      font-size: 0.9rem;
      min-height: 1.4rem;
    }
    @media (max-width: 600px) {
      .support-widgets {
        padding: 1.25rem;
      }
      .support-widgets__dialog {
        padding: 1.5rem;
      }
    }
  `;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STYLE_CONTENT;
    document.head.appendChild(style);
  }

  function createWidgetMarkup(options) {
    const { includeNewsletter } = options;
    return `
      <section class="support-widgets" aria-label="Dichoptic therapy support tools">
        <div class="support-widgets__grid">
          <div class="support-widgets__panel">
            <h3>Quick dichoptic therapy cues</h3>
            <p>Keep your amblyopia training on track with short, eyes-open reminders you can glance at mid-session.</p>
            <ul>
              <li>Alternate fixation targets every 20–30 seconds to stimulate binocular balance.</li>
              <li>Pair red/green filters with bright ambient light to reduce ghosting and fatigue.</li>
              <li>Log how long fusion is comfortable so you can gradually increase play time.</li>
            </ul>
            <div class="support-widgets__links" role="navigation" aria-label="Helpful resources">
              <a class="support-widgets__link" href="index.html#faq">Read FAQ</a>
              <a class="support-widgets__link" href="index.html#therapy-tips">Therapy Tips</a>
              <a class="support-widgets__link" href="index.html#success-stories">Success Stories</a>
            </div>
          </div>
          <div class="support-widgets__panel">
            <h3>Have a feature idea?</h3>
            <p>Share your satisfaction level, any accessibility needs, or a wish-list item so we can improve the dichoptic training flow.</p>
            <button type="button" class="support-widgets__feedback-toggle">Open feedback form</button>
            <p class="support-widgets__status" data-feedback-status aria-live="polite"></p>
          </div>
          ${includeNewsletter ? `
          <div class="support-widgets__panel">
            <h3>Stay in sync with therapy research</h3>
            <p>Join our quarterly digest for dichoptic therapy news, success strategies, and accessibility upgrades.</p>
            <form class="support-widgets__newsletter" data-newsletter-form data-success-message="Thanks for subscribing! Check your inbox for confirmation." data-error-message="We couldn't save your request. Please try again.">
              <label for="support-widgets-email">Email address</label>
              <input type="email" id="support-widgets-email" name="email" required autocomplete="email" placeholder="you@example.com">
              <label for="support-widgets-interest">What updates matter most?</label>
              <select id="support-widgets-interest" name="interest">
                <option value="home-therapy">Home dichoptic therapy routines</option>
                <option value="research">Clinical research &amp; amblyopia breakthroughs</option>
                <option value="accessibility">Accessibility enhancements</option>
                <option value="game-updates">New game mechanics &amp; exercises</option>
              </select>
              <label class="support-widgets__checkbox">
                <input type="checkbox" name="consent" value="yes" required>
                <span>I agree to receive email updates about dichoptic therapy and understand I can unsubscribe at any time.</span>
              </label>
              <button type="submit">Subscribe</button>
              <p class="support-widgets__status" aria-live="polite"></p>
            </form>
          </div>
          ` : ''}
        </div>

        <div class="support-widgets__modal" role="dialog" aria-modal="true" aria-labelledby="support-feedback-title" hidden>
          <div class="support-widgets__dialog">
            <button type="button" class="support-widgets__close" aria-label="Close feedback form">×</button>
            <h3 id="support-feedback-title">Share your dichoptic therapy feedback</h3>
            <p>We save only the details below to a secure log so we can improve therapeutic balance without collecting personal data.</p>
            <form data-feedback-form data-success-message="Thanks! Your insights are logged for the next therapy sprint." data-error-message="We couldn't save your feedback. Please try again.">
              <label for="satisfaction-level">How satisfied are you with today's session?</label>
              <select id="satisfaction-level" name="satisfaction" required>
                <option value="">Select a rating</option>
                <option value="very-satisfied">Very satisfied</option>
                <option value="satisfied">Satisfied</option>
                <option value="neutral">Neutral</option>
                <option value="frustrated">Frustrated</option>
                <option value="stopped-session">Had to stop the session</option>
              </select>

              <label for="feature-requests">Which features or game modes would help your dichoptic therapy?</label>
              <textarea id="feature-requests" name="featureRequests" placeholder="e.g., adjustable contrast targets, cooperative play, progress charts"></textarea>

              <label for="accessibility-needs">Tell us about any accessibility needs (contrast, narration, controller options).</label>
              <textarea id="accessibility-needs" name="accessibilityNeeds"></textarea>

              <label for="optional-email">Email (optional, only if you want a follow-up)</label>
              <input type="email" id="optional-email" name="email" autocomplete="email" placeholder="you@example.com">

              <p class="support-widgets__checkbox">
                <input type="checkbox" id="feedback-consent" name="consent" value="yes">
                <label for="feedback-consent">Include my email so you can respond directly about these dichoptic therapy tools.</label>
              </p>

              <button type="submit">Submit feedback</button>
              <p class="support-widgets__status" aria-live="polite"></p>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  function toggleModal(modal, open) {
    if (!modal) return;
    if (open) {
      modal.removeAttribute('hidden');
      modal.dataset.open = 'true';
      const firstField = modal.querySelector('select, textarea, input');
      if (firstField) {
        firstField.focus({ preventScroll: false });
      }
      document.addEventListener('keydown', handleEscape, { once: true });
    } else {
      modal.setAttribute('hidden', '');
      modal.dataset.open = 'false';
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        toggleModal(modal, false);
      }
    }
  }

  async function submitJSON(url, payload) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      const message = data.error || response.statusText || 'Request failed';
      throw new Error(message);
    }

    return data;
  }

  function attachFeedbackHandlers(root) {
    const modal = root.querySelector('.support-widgets__modal');
    const openButton = root.querySelector('.support-widgets__feedback-toggle');
    const closeButton = root.querySelector('.support-widgets__close');
    const status = root.querySelector('[data-feedback-status]');
    const form = root.querySelector('form[data-feedback-form]');

    if (openButton && modal) {
      openButton.addEventListener('click', () => {
        status.textContent = '';
        toggleModal(modal, true);
      });
    }

    if (modal) {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          toggleModal(modal, false);
        }
      });
    }

    if (closeButton && modal) {
      closeButton.addEventListener('click', () => toggleModal(modal, false));
    }

    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const fieldStatus = form.querySelector('.support-widgets__status');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Sending…';
        }
        fieldStatus.textContent = '';

        const formData = new FormData(form);
        const payload = {
          satisfaction: formData.get('satisfaction'),
          featureRequests: formData.get('featureRequests') || '',
          accessibilityNeeds: formData.get('accessibilityNeeds') || '',
          email: formData.get('consent') ? (formData.get('email') || '') : ''
        };

        try {
          await submitJSON('/api/feedback', payload);
          const successMessage = form.dataset.successMessage || 'Thanks for sharing!';
          fieldStatus.textContent = successMessage;
          status.textContent = successMessage;
          form.reset();
          toggleModal(modal, false);
        } catch (error) {
          const errorMessage = form.dataset.errorMessage || 'Something went wrong. Please try again.';
          fieldStatus.textContent = error.message || errorMessage;
          status.textContent = error.message || errorMessage;
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit feedback';
          }
        }
      });
    }
  }

  function attachNewsletterHandlers(scope) {
    const forms = scope.querySelectorAll('form[data-newsletter-form]');
    forms.forEach((form) => {
      if (form.dataset.handlerAttached === 'true') {
        return;
      }
      form.dataset.handlerAttached = 'true';

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const email = (formData.get('email') || '').trim();
        const consentChecked = formData.get('consent');
        const statusField = form.querySelector('.support-widgets__status') || form.querySelector('[aria-live]');
        const submitButton = form.querySelector('button[type="submit"]');

        if (!consentChecked) {
          if (statusField) {
            statusField.textContent = 'Please provide consent to receive updates.';
          }
          return;
        }

        if (!email) {
          if (statusField) {
            statusField.textContent = 'Enter a valid email address to subscribe.';
          }
          return;
        }

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Subscribing…';
        }
        if (statusField) {
          statusField.textContent = '';
        }

        const payload = {
          email,
          interest: formData.get('interest') || 'general',
          consent: true
        };

        try {
          await submitJSON('/api/newsletter', payload);
          const successMessage = form.dataset.successMessage || 'Thanks for subscribing!';
          if (statusField) {
            statusField.textContent = successMessage;
          }
          form.reset();
        } catch (error) {
          const errorMessage = form.dataset.errorMessage || 'We could not save your request.';
          if (statusField) {
            statusField.textContent = error.message || errorMessage;
          }
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
          }
        }
      });
    });
  }

  function renderSupportWidgets(options = {}) {
    const { containerId, includeNewsletter = true } = options;
    if (!containerId) {
      console.warn('renderSupportWidgets: containerId is required');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`renderSupportWidgets: element with id "${containerId}" not found`);
      return;
    }

    ensureStyles();
    container.innerHTML = createWidgetMarkup({ includeNewsletter });
    attachFeedbackHandlers(container);
    attachNewsletterHandlers(container);
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureStyles();
    attachNewsletterHandlers(document);
  });

  window.renderSupportWidgets = renderSupportWidgets;
})();
