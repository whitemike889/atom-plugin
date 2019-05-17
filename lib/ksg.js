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
    this.insertionMarker = null;
    this.decoration = null;
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

    const pos = this.currentEditor.getCursorScreenPosition();
    const scrollBuffer = Math.ceil(this.currentEditor.rowsPerPage * 0.9);
    console.log('editor', this.currentEditor)
    console.log('position', pos, scrollBuffer)
    //TODO: with addition of codeblocks, may need more complex screen positioning logic
    // especially if we're near a bottom row...
    // eg whether to scroll (with codeblocks); whether to position element on top of current position...
    editor.scrollToScreenPosition({ row: pos.row + scrollBuffer, col: pos.col });

    this.insertionMarker = editor.markScreenPosition(pos, { invalidate: 'never'  });
    this.decoration = editor.decorateMarker(this.insertionMarker, {
      type: 'block', //could be 'overlay' too; test later
      item: this.element,
      class: 'kite-ksg-wrapper',
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

    this.insertionMarker && this.insertionMarker.destroy();
    this.decoration && this.decoration.destroy();
    this.insertionMarker = null;
    this.decoration = null;
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