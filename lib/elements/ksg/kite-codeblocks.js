'use strict';

const { TextEditor, CompositeDisposable, Emitter } = require('atom');

const { DisposableEvent } = require('../../utils');

const { CODEBLOCKS_CLICKED } = require('./constants');

class KSGCodeBlocks extends HTMLElement {
  constructor() {
    super();

    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(new DisposableEvent(this, 'click', (e) => {
      console.log('CODEBLOCKS EVENT');
      this.emitter.emit(CODEBLOCKS_CLICKED, {payload: 'codeblocks'});
    }));

    const wrapper = document.createElement('div');

    wrapper.setAttribute('class', 'kite-ksg-code-blocks-wrapper');

    // TEST CASE
    wrapper.appendChild(document.createTextNode('TEST CODEBLOCKS'));
    this.appendChild(wrapper);
  }

  connectedCallback() {
    //console.log('KSG codeblocks connected callback');
  }

  disconnectedCallback() {
    //console.log('KSG codeblocks disconnected callback');
    this.dispose();
  }

  dispose() {
    this.emitter && this.emitter.dispose();
    this.subscriptions && this.subscriptions.dispose();
  }

  // STUB for wiring testing
  onDidGetClicked(callback) {
    return this.emitter.on(CODEBLOCKS_CLICKED, callback);
  }
}

customElements.define('kite-ksg-code-blocks', KSGCodeBlocks);
module.exports = KSGCodeBlocks;

/* TODO:
 - design element structure (attributes, events, etc.)
*/