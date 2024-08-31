import { deriveAccentColor } from './deriveAccentColor.js';

class CopyEmailComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isTouch = false;
    this.successMessageTimer = null;
  }

  connectedCallback() {
    if (!this.hasAttribute('email')) {
      console.error('CopyEmailComponent: The "email" attribute is required.');
      this.renderError();
    } else {
      this.render();
      this.setupEventListeners();
    }
  }

  static get observedAttributes() {
    return [
      'email', 
      'display-label', 
      'copy-success-message-duration', 
      'default-color', 
      'hover-color'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'email' && !newValue) {
        console.error('CopyEmailComponent: The "email" attribute is required.');
        this.renderError();
      } else {
        this.render();
      }
    }
  }

  renderError() {
    this.shadowRoot.innerHTML = `
      <span style="color: red; font-style: italic;">Error: Email is required</span>
    `;
  }

  render() {
    const displayLabel = this.getAttribute('display-label') || '';
    const defaultColor = this.getAttribute('default-color') || '#fff';
    const hoverColor = this.getAttribute('hover-color') || defaultColor;
    
    this.shadowRoot.innerHTML = /* html */`
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 0.5em;
          cursor: pointer;
          font-family: inherit;
          font-weight: inherit;
          text-decoration: inherit;
          font-size: inherit;
        }
        .label-container {
          display: inline-block;
          min-width: 6em;
          overflow: hidden;
          text-align: right;
        }
        .label, .hover-text, .success-message {
          white-space: nowrap;
        }
        .hover-text, .success-message {
          display: none;
        }
        .icon {
          margin-left: .5rem;
          font-size: 1.5em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.333em;
          position: relative;
          height: 1.5em;
        }
        .icon svg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
        }
        .envelope {
          fill: ${defaultColor};
          stroke: ${defaultColor};
          stroke-width: 2;
        }
        .arrow {
          fill: none;
          stroke: ${deriveAccentColor(defaultColor)};
          stroke-width: 2;
        }

        @media (hover: hover) {
          :host(:hover) .label {
            color: var(--hover-color);
          }
          :host(:hover) .envelope {
            fill: var(--hover-color);
            stroke: var(--hover-color);
          }
        }
      </style>
      
      <div class="label-container">
        <span class="label" style="color: ${defaultColor};" aria-live="polite">${displayLabel}</span>
        <span class="hover-text" style="color: ${hoverColor};" aria-live="polite">Copy Email</span>
        <span class="success-message" style="color: ${defaultColor};" aria-live="polite"></span>
      </div>
      <span class="icon" aria-label="Copy email" role="button" tabindex="0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 18" stroke-linecap="round" stroke-linejoin="round">
          <rect class="envelope" x="1" y="1" width="30" height="16" />
          <polyline class="arrow" points="1 4 16 12 31 4" />
        </svg>
      </span>
    `;

    this.shadowRoot.host.style.setProperty('--hover-color', hoverColor);
  }

  setupEventListeners() {
    const labelElement = this.shadowRoot.querySelector('.label');
    const hoverTextElement = this.shadowRoot.querySelector('.hover-text');
    const iconElement = this.shadowRoot.querySelector('.icon');

    window.addEventListener('touchstart', () => {
      this.isTouch = true;
    }, { once: true });

    iconElement.addEventListener('mouseover', () => {
      if (!this.isTouch && !this.successMessageTimer) {
        labelElement.style.display = 'none';
        hoverTextElement.style.display = 'inline';
      }
    });

    iconElement.addEventListener('mouseout', () => {
      if (!this.isTouch && !this.successMessageTimer) {
        hoverTextElement.style.display = 'none';
        labelElement.style.display = 'inline';
      }
    });

    iconElement.addEventListener('click', () => this.copyEmail());
    iconElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.copyEmail();
      }
    });
  }

  copyEmail() {
    const email = this.getAttribute('email');
    if (!email) {
      console.error('CopyEmailComponent: Cannot copy email. The "email" attribute is not set.');
      return;
    }

    const timeoutDuration = parseInt(this.getAttribute('copy-success-message-duration')) || 2000;
    const labelElement = this.shadowRoot.querySelector('.label');
    const hoverTextElement = this.shadowRoot.querySelector('.hover-text');
    const successMessageElement = this.shadowRoot.querySelector('.success-message');

    navigator.clipboard.writeText(email)
      .then(() => {
        labelElement.style.display = 'none';
        hoverTextElement.style.display = 'none';
        successMessageElement.textContent = 'Email copied!';
        successMessageElement.style.display = 'inline';
        
        clearTimeout(this.successMessageTimer);
        this.successMessageTimer = setTimeout(() => {
          successMessageElement.style.display = 'none';
          labelElement.style.display = 'inline';
          this.successMessageTimer = null;
        }, timeoutDuration);
      })
      .catch(err => {
        console.error('Failed to copy email: ', err);
        successMessageElement.textContent = 'Copy failed';
        successMessageElement.style.display = 'inline';
      });
  }
}

customElements.define('copy-email-component', CopyEmailComponent);
