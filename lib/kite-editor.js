'use strict';

const {CompositeDisposable} = require('atom');
const {head} = require('./utils');
const EditorEvents = require('./editor-events');
const DataLoader = require('./data-loader');

class KiteEditor {
  constructor(editor) {
    this.editor = editor;
    this.buffer = editor.getBuffer();
    this.editorElement = atom.views.getView(editor);
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(new EditorEvents(editor));

    this.subscriptions.add(editor.onDidStopChanging(() => {
      this.updateTokens();
    }));

    this.updateTokens();
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.subscriptions;
    delete this.editorElement;
    delete this.editor;
    delete this.buffer;
  }

  updateTokens() {
    DataLoader.getTokensForEditor(this.editor).then(tokens => {
      this.tokens = tokens.tokens;
      // console.log(this.tokens);
    });
  }

  tokenAtPosition(position) {
    const pos = this.buffer.characterIndexForPosition(position);
    return this.tokens
      ? head(this.tokens.filter(token => pos >= token.begin_bytes &&
                                         pos <= token.end_bytes))
      : null;
  }

  tokenForMouseEvent(event) {
    if (!event) { return null; }

    const position = this.screenPositionForMouseEvent(event);

    if (!position) { return null; }

    const bufferPosition = this.editor.bufferPositionForScreenPosition(position);

    return this.tokenAtPosition(bufferPosition);
  }

  screenPositionForMouseEvent(event) {
    const pixelPosition = this.pixelPositionForMouseEvent(event);

    if (pixelPosition == null) { return null; }

    return this.editorElement.screenPositionForPixelPosition != null
      ? this.editorElement.screenPositionForPixelPosition(pixelPosition)
      : this.editor.screenPositionForPixelPosition(pixelPosition);
  }

  pixelPositionForMouseEvent(event) {
    const {clientX, clientY} = event;

    const scrollTarget = (this.editorElement.getScrollTop != null)
      ? this.editorElement
      : this.editor;

    if (this.editorElement.querySelector('.lines') == null) { return null; }

    let {top, left} = this.editorElement.querySelector('.lines').getBoundingClientRect();
    top = (clientY - top) + scrollTarget.getScrollTop();
    left = (clientX - left) + scrollTarget.getScrollLeft();
    return {top, left};
  }
}

module.exports = KiteEditor;
