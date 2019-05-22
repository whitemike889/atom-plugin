'use strict';

const { CompositeDisposable } = require('atom');
const KSGElement = require('../elements/ksg/kite-ksg');


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
      })
    );

    this.subscriptions.add(
      this.element.onSearchEvent((payload) => {
        console.log('ONSEARCH EVENT', payload);
      })
    );
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    this.element.dispose();
    delete this.element;
    delete this.subscriptions;
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