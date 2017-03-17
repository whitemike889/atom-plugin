'use strict';

const {appendToken} = require('../urls');

class KiteLocaltokenAnchor extends HTMLAnchorElement {
  static initClass() {
    return document.registerElement('kite-localtoken-anchor', {
      prototype: this.prototype,
      extends: 'a',
    });
  }
  createdCallback() {
    this.addEventListener('click', (e) => {
      console.log('here');
      e.preventDefault();
      e.stopPropagation();
      atom.applicationDelegate.openExternal(appendToken(this.getAttribute('href')));
    });
  }
}

module.exports = KiteLocaltokenAnchor.initClass();
