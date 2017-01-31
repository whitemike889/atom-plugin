'use strict';

const {humanizeKeystroke} = require('underscore-plus');
const {openInWebURL} = require('../utils');

class KiteOpenLink extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-open-link', {
      prototype: this.prototype,
    });
  }

  attachedCallback() {
    const id = this.getAttribute('data-id');
    const url = openInWebURL(id);

    const editor = atom.workspace.getActiveTextEditor();
    const editorElement = atom.views.getView(editor);
    const binding =  atom.keymaps.findKeyBindings({target: editorElement})
    .filter(k => k.command === 'kite:open-in-web-at-cursor')[0];

    const kbd = binding
      ? `<kbd>${humanizeKeystroke(binding.keystrokes)}</kbd>`
      : '';

    this.innerHTML = `
    <a href="${url}">
      <span><i>Open in Web</i>${kbd}</span>
    </a>
    <kite-logo/>
    `;
  }
}

module.exports = KiteOpenLink.initClass();
