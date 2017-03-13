'use strict';

class KiteTour extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-tour', {
      prototype: this.prototype,
    });
  }

  createdCallback() {
    this.innerHTML = `
    <div>Hello</div>
    `;
  }

  getTitle() {
    return 'Welcome to Kite';
  }

  getIconName() {
    return 'kite';
  }
}

module.exports = KiteTour.initClass();
