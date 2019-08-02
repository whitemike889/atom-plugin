'use strict';

const fs = require('fs');
const path = require('path');
const ASSETS_PATH = process.env.PRODUCTION
  ? path.resolve(__dirname, '..', 'assets')
  : path.resolve(__dirname, '..', '..', '..', 'assets');
const logoSvg = String(fs.readFileSync(path.join(ASSETS_PATH, 'so.svg')));

class KSGLogo extends HTMLElement {
  static initClass() {
    customElements.define('ksg-logo', this);
    return this;
  }

  constructor() {
    super();
    this.innerHTML = logoSvg;
  }
}

module.exports = KSGLogo.initClass();
