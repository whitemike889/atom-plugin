'use strict';

const { CompositeDisposable } = require('atom');
const KSGElement = require('../elements/ksg/kite-ksg');
const SearchModel = require('./search');
const CodeblocksModel = require('./codeblocks');
const {
  SEARCH_QUERY_SELECTION_EVENT,
  CODEBLOCKS_SELECTION_EVENT,
} = require('./constants');

module.exports = class KSG {
  constructor() {
    this.element = new KSGElement();
    this.codeblocks = new CodeblocksModel();
    this.search = new SearchModel();

    this._visible = false;
    this._needsRefresh = true;
    this.currentEditor = null;
    // use below for reinsertion
    this.cachedCursorPos = null;
    this.modalPanel = null;
  }

  init(Kite) {
    // will need to pay attention to a notion of 'editors'
    this._needsRefresh = false;
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
        switch (payload.type) {
          case SEARCH_QUERY_SELECTION_EVENT:
            this.codeblocks.executeQuery(payload);
            break;
          
          case CODEBLOCKS_SELECTION_EVENT:
            this.insertCodeblocks(payload);
            break;
        }
      })
    );

    this.subscriptions.add(
      this.element.onSearchEvent((payload) => {
        this.search.executeQuery(payload);
      })
    );

    this.subscriptions.add(
      this.codeblocks.onDidUpdate((payload) => {
        this.element.updateCodeBlocks(payload);
      })
    );

    this.subscriptions.add(
      this.search.onDidUpdate((payload) => {
        this.element.updateSearch(payload);
      })
    );
  }

  insertCodeblocks({ blocks, link }) {
    const title = this.currentEditor
      ? this.currentEditor.getTitle()
      : '';
    const decoratedBlocks = CodeblocksModel.decorateCodeblocks(blocks, link, title);
    // will by default insert at last cursor position
    this.currentEditor && this.currentEditor.insertText(decoratedBlocks, { autoIndent: false });
    // we close the KSG widget on the completion of this action
    this.hide();
  }

  dispose() {
    this.hide();
    this.subscriptions && this.subscriptions.dispose();
    this.element && this.element.dispose();
    this.search && this.search.dispose();
    this.codeblocks && this.codeblocks.dispose();
    delete this.element;
    delete this.subscriptions;
    delete this.search;
    delete this.codeblocks;
  }

  get needsRefresh() {
    return this._needsRefresh;
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
    if (this.needsRefresh) {
      this.subscriptions && this.subscriptions.dispose();
      this.init();
    }
  }

  hide() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.modalPanel && this.modalPanel.destroy();
    this.modalPanel = null;
    this.currentEditor = null;

    this._visible = false;
    this._needsRefresh = true;
  }

  get visible() {
    return this._visible;
  }

  getElement() {
    return this.element;
  }
};