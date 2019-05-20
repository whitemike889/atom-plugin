'use strict';

const { CompositeDisposable } = require('atom');
const KSGElement = require('./elements/ksg/kite-ksg');


/* 
  Questions / Design / ToDos
  - What are the component states? How do we communicate them to the elements appropriately?
  - Do I want event Emitter functionality here? What would the use cases be?
*/
module.exports = class KSG {
  constructor() {
    this.element = new KSGElement();
    this._visible = false;
    this.currentEditor = null;
    // use below for reinsertion
    this.cachedCursorPos = null;
    this.modalPanel = null;
    this.searchQuery = '';
  }

  init(Kite) {
    // will need to pay attention to a notion of 'editors'
    this.subscriptions = new CompositeDisposable();
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.element;
    delete this.subscriptions;
  }

  show(editor) {
    this._visible = true;
    // if we attempt to show, and there's another ksg panel in another editor
    // we hide that other panel (we keep ksg as a singleton for now)
    if (this.currentEditor && this.currentEditor.id !== editor.id) {
      this.hide();
    }
    // do nothing if already showing in current editor
    if (this.currentEditor && this.currentEditor.id === editor.id) {
      return;
    }
    this.currentEditor = editor;

    this.modalPanel = atom.workspace.addModalPanel({
      item: this.element,
      autoFocus: true,
    });
  }

  scrollToInitialPosition() {
    //just "top" vs. "bottom"
    // then use that generated information to subsequently position searchbar; searchbar + codeblocks
  }

  hide() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.modalPanel && this.modalPanel.destroy();
    this.modalPanel = null;
    this.currentEditor = null;

    this._visible = false;
  }

  get visible() {
    return this._visible;
  }

  getElement() {
    return this.element;
  }
};