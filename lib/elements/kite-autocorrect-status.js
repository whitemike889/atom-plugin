'use strict';

let Kite;
const {CompositeDisposable, Emitter} = require('atom');
const {DisposableEvent} = require('../utils');

class KiteAutocorrectStatus extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-autocorrect-status', {
      prototype: this.prototype,
    });
  }

  onDidClick(listener) {
    return this.emitter.on('did-click', listener);
  }

  createdCallback() {
    this.emitter = new Emitter();
  }

  attachedCallback() {
    this.subscriptions = this.subscriptions || new CompositeDisposable();

    this.subscriptions.add(new DisposableEvent(this, 'click', () => {
      if (!Kite) { Kite = require('../kite'); }

      Kite.toggleAutocorrectSidebar();
    }));
  }
}

module.exports = KiteAutocorrectStatus.initClass();
