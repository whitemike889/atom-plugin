'use strict';

class KiteOpenLink extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-open-link', {
      prototype: this.prototype,
    });
  }

  attachedCallback() {
    this.innerHTML = `
    <a href="${this.getAttribute('href')}">
      <span>Open in Kite <kbd>⌘K</kbd></span>
      <kite-logo/>
    </a>
    `;
  }
}

module.exports = KiteOpenLink.initClass();
