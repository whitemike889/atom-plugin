'use strict';

const { TextEditor, CompositeDisposable, Emitter } = require('atom');

const { DisposableEvent } = require('../../utils');
const { SEARCH_CLICKED } = require('../../ksg/constants');

class KSGSearch extends HTMLElement {
  constructor() {
    super();

    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    
    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'kite-ksg-search-wrapper');

    this.searchInput = new TextEditor({ placeholderText: 'Search the webz...', mini: true });

    // factor out styling the input code
    /* 
      Todo
      - get a blinking cursor in there
    */
    this.searchInputView = this.searchInput.getElement();

    this.subscriptions.add(new DisposableEvent(this.searchInputView, 'click', (e) => {
      console.log('SEARCH EVENT');
      this.emitter.emit(SEARCH_CLICKED, {payload: 'search'});
    }));

    this.wrapper.appendChild(this.searchInputView);
    this.appendChild(this.wrapper);
    // TEST CASE
    //this.wrapper.appendChild(document.createTextNode('TEST SEARCH'));
  }

  connectedCallback() {
    //console.log('KSG search connected callback');
    //focus

    this.setFocus();
  }

  disconnectedCallback() {
    //console.log('KSG searchs disconnected callback');
    this.dispose();
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    this.emitter && this.emitter.dispose();
  }

  // STUB for wiring testing
  onDidGetClicked(callback) {
    return this.emitter.on(SEARCH_CLICKED, callback);
  }

  updateView(data) {
    console.log('SEARCH UPDATE VIEW', data);
  }

  setFocus() {
    console.log('setFocus');
    this.searchInputView.focus();
    this.searchInput.moveToBottom();
  }
}

customElements.define('kite-ksg-search', KSGSearch);
module.exports = KSGSearch;

/* TODO:
 - design element structure (attributes, events, etc.)
 - need for debouncing on keystrokes
*/