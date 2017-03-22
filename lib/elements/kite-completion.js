'use strict';

const {CompositeDisposable} = require('atom');
const LinkScheme = require('../link-scheme');
let Kite;

class KiteCompletion extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-completion', {
      prototype: this.prototype,
    });
  }

  attachedCallback() {
    this.subscriptions = new CompositeDisposable();
    this.scheme = new LinkScheme('kite-atom-internal', this);

    this.subscriptions.add(this.scheme);
    this.subscriptions.add(this.scheme.onDidClickLink(({url}) => {
      if (!Kite) { Kite = require('../kite'); }
      const editor = atom.workspace.getActiveTextEditor();
      const kiteEditor = Kite.kiteEditorForEditor(editor);

      if (kiteEditor) {
        switch (url.host) {
          case 'definition': {
            kiteEditor.openIdDefinition(url.path.replace(/^\//, ''));
            break;
          }
          case 'expand': {
            kiteEditor.expandId(url.path.replace(/^\//, ''));
            break;
          }
        }
      }
    }));
  }

  detachedCallback() {
    this.subscriptions.dispose();
  }
}

module.exports = KiteCompletion.initClass();
