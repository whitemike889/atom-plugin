'use strict';

const {StateController} = require('kite-installer');

class KiteOpenLink extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-open-link', {
      prototype: this.prototype,
    });
  }

  attachedCallback() {
    const id = this.getAttribute('data-id');
    const token = StateController.client.LOCAL_TOKEN;
    const url = `http://localhost:46624/clientapi/dekstoplogin?u=/docs/python/${id}&localtoken=${token}`;
    this.innerHTML = `
    <a href="${url}">
      <span>Open in Kite <kbd>⌘K</kbd></span>
      <kite-logo/>
    </a>
    `;
  }
}

module.exports = KiteOpenLink.initClass();
