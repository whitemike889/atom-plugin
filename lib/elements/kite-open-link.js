'use strict';

const fs = require('fs');
const path = require('path');
const logoSvg = String(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'logo-no-text.svg')));

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
      ${logoSvg}
    </a>
    `;
  }
}

module.exports = KiteOpenLink.initClass();
