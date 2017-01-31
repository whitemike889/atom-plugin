'use strict';

const fs = require('fs');
const path = require('path');
const logoSvg = String(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'logo-no-text.svg')));

class KiteLogo extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-logo', {
      prototype: this.prototype,
    });
  }

  createdCallback() {
    this.innerHTML = logoSvg;
  }
}

module.exports = KiteLogo.initClass();
