'use strict';

const { CompositeDisposable, Emitter } = require('atom');

const KSGCodeBlocks = require('./kite-codeblocks');
const KSGSearch = require('./kite-searchbar');

const { CODEBLOCKS_EVENT, SEARCH_EVENT } = require('../../ksg/constants');

/**
 * will need to have nest custom elements...
 * how to do that?
 */
class KSG extends HTMLElement {
  constructor() {
    super();
    this.subscriptions = new CompositeDisposable();
    this.emitter = new Emitter();

    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'kite-ksg-inner');

    // TEST CASE
    this.wrapper.appendChild(document.createTextNode('TEST BOLLOCKS'));
    this.appendChild(this.wrapper);
  }

  connectedCallback() {
    if (!this.emitter) { this.emitter = new Emitter(); }
    if (!this.subscriptions) { this.subscriptions = new CompositeDisposable(); }

    this.setAttribute('tabindex', -1);
    this.codeBlocksElem = new KSGCodeBlocks();
    this.searchElem = new KSGSearch();

    this.subscriptions.add(this.codeBlocksElem.onDidGetClicked((payload) => {
      console.log('KITE KSG CODEBLOCKS CLICK LISTENER', payload);
      this.emitter.emit(CODEBLOCKS_EVENT, {payload: 'codeblocks event'});
    }));

    this.subscriptions.add(this.searchElem.onDidGetClicked((payload) => {
      console.log('KITE KSG SEARCH CLICK LISTENER', payload);
      this.emitter.emit(SEARCH_EVENT, {payload: 'search event'});
    }));

    this.wrapper.appendChild(this.codeBlocksElem);
    this.wrapper.appendChild(this.searchElem);
  }

  disconnectedCallback() {
    this.dispose();
  }

  onCodeBlocksEvent(callback) {
    return this.emitter.on(CODEBLOCKS_EVENT, callback);
  }

  onSearchEvent(callback) {
    return this.emitter.on(SEARCH_EVENT, callback);
  }

  updateSearch(payload) {
    console.log('UPDATE SEARCH KSG VIEW CONT', payload);
    this.searchElem && this.searchElem.updateView(payload);
  }

  updateCodeBlocks(payload) {
    console.log('UPDATE CODEBLOCKS KSG VIEW CONT', payload);
    this.codeBlocksElem && this.codeBlocksElem.updateView(payload);
  }

  dispose() {
    console.log('STUB RESET METHOD');
    this.codeBlocksElem && this.wrapper.removeChild(this.codeBlocksElem);
    this.searchElem && this.wrapper.removeChild(this.searchElem);

    this.subscriptions && this.subscriptions.dispose();
    this.emitter && this.emitter.dispose();
    delete this.emitter;
    delete this.subscriptions;

    this.codeBlocksElem = null;
    this.searchElem = null;
  }
}

customElements.define('kite-ksg', KSG);
module.exports = KSG;

/* TODO:
 - design element structure (attributes, events, etc.)
 - what needs to happen on connection? on disconnection?
 - what data does this element need to hold and communicate to its
    two custom HTMLElement children?
  - what different states is this element designed to handle? How can it appropriately
      listen for changes?
*/

/*
  Some notes on usage;
  - controllers will get `new` elements to append to the DOM
  - these HTMLElement instances will be manipulable through exposed APIs (e.g. `setData`)

*/