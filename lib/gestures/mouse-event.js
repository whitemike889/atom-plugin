'use strict';

const BaseGesture = require('./base');
const VirtualCursor = require('../virtual-cursor');
const {screenPositionForMouseEvent} = require('../utils');

module.exports = class MouseEventGesture extends BaseGesture {
  constructor(editor, tokensList, options) {
    super(editor, tokensList, options);
  }

  matchesModifiers(e) {
    return e.altKey == !!this.options.altKey &&
      e.ctrlKey == !!this.options.ctrlKey &&
      e.shiftKey == !!this.options.shiftKey &&
      e.metaKey == !!this.options.metaKey;
  }

  tokenForMouseEvent(event) {
    return this.tokensList.tokenForMouseEvent(event);
  }

  wordRangeForMouseEvent(event) {
    const position = screenPositionForMouseEvent(this.editorElement, event);
    const cursor = new VirtualCursor(this.editor);
    cursor.setScreenPosition(position);

    return cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });
  }
};
