'use strict';

const { CompositeDisposable } = require('atom');
const KSGElement = require('../elements/ksg/kite-ksg');
const SearchModel = require('./search');
const CodeblocksModel = require('./codeblocks');


/* 
  Questions / Design / ToDos
  - What are the component states? How do we communicate them to the elements appropriately?
  - Do I want event Emitter functionality here? What would the use cases be?
*/
module.exports = class KSG {
  constructor() {
    this.element = new KSGElement();
    this.codeblocks = new CodeblocksModel();
    this.search = new SearchModel();

    this._visible = false;
    this._disposed = false;
    this.currentEditor = null;
    // use below for reinsertion
    this.cachedCursorPos = null;
    this.modalPanel = null;
    this.searchQuery = '';
  }

  init(Kite) {
    // will need to pay attention to a notion of 'editors'
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add(this.element, {
        'core:close': () => this.hide(),
        'core:cancel': () => this.hide(),
        // what other commands (e.g. `core:confirm`) need to be added here?
        'kite:ksg': () => {
          this.visible ? this.hide() : this.show(atom.workspace.getActiveTextEditor());
        },
      })
    );

    this.subscriptions.add(
      this.element.onCodeBlocksEvent((payload) => {
        console.log('ONCODEBLOCKS EVENT', payload);
        this.codeblocks.stubMethod();
      })
    );

    this.subscriptions.add(
      this.element.onSearchEvent((payload) => {
        console.log('ONSEARCH EVENT', payload);
        this.search.stubMethod();
      })
    );

    this.subscriptions.add(
      this.codeblocks.onDidUpdate((payload) => {
        console.log('ONCODEBLOCKS MODEL UPDATE', payload);
        this.element.updateCodeBlocks(payload);
      })
    );

    this.subscriptions.add(
      this.search.onDidUpdate((payload) => {
        console.log('ONSEARCH MODEL UPDATE', payload);
        this.element.updateSearch(payload);
      })
    );
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    this.element && this.element.dispose();
    this.search && this.search.dispose();
    this.codeblocks && this.codeblocks.dispose();
    delete this.element;
    delete this.subscriptions;
    delete this.search;
    delete this.codeblocks;
  }

  get disposed() {
    return this._disposed;
  }

  show(editor) {
    console.log('show')
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
    console.log('hide')
    // currentEditor will insert the text at the last active cursor position

    // below needs to be made more sophisticated
    this.currentEditor.insertText('\nSTUB INSERTION\n');
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