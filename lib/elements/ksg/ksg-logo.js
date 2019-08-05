'use strict';

const fs = require('fs');
const path = require('path');
const ASSETS_PATH = process.env.PRODUCTION
  ? path.resolve(__dirname, '..', 'assets')
  : path.resolve(__dirname, '..', '..', '..', 'assets');
const logoPath = path.join(ASSETS_PATH, 'so.png');

class KSGLogo extends HTMLElement {
  static initClass() {
    customElements.define('ksg-logo', this);
    return this;
  }

  constructor() {
    super();
    this.innerHTML = `<img src=${logoPath}></img>`;
  }
}

module.exports = KSGLogo.initClass();
