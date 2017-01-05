'use strict';

const BaseGesture = require('./base');
const {editorRoot} = require('../utils');

module.exports = class MouseEventGesture extends BaseGesture {
  constructor(editor, options) {
    super();
    this.editor = editor;
    this.editorElement = atom.views.getView(editor);
    this.options = options || {};
  }

  matchesModifiers(e) {
    return e.altKey == !!this.options.altKey &&
      e.ctrlKey == !!this.options.ctrlKey &&
      e.shiftKey == !!this.options.shiftKey &&
      e.metaKey == !!this.options.metaKey;
  }

  bufferPositionForMouseEvent(event) {
    const screenPosition = this.screenPositionForMouseEvent(event);

    return screenPosition
      ? this.editor.bufferPositionForScreenPosition(screenPosition)
      : null;
  }

  screenPositionForMouseEvent(event) {
    let pixelPosition = this.pixelPositionForMouseEvent(event);

    if (pixelPosition == null) { return null; }

    return this.editorElement.screenPositionForPixelPosition != null
        ? this.editorElement.screenPositionForPixelPosition(pixelPosition)
        : this.editor.screenPositionForPixelPosition(pixelPosition);
  }

  pixelPositionForMouseEvent(event) {
    let {clientX, clientY} = event;

    let scrollTarget = this.editorElement.getScrollTop
        ? this.editorElement
        : this.editor;

    let rootElement = editorRoot(this.editorElement);

    if (rootElement.querySelector('.lines') == null) { return null; }

    let {top, left} = rootElement.querySelector('.lines').getBoundingClientRect();
    top = (clientY - top) + scrollTarget.getScrollTop();
    left = (clientX - left) + scrollTarget.getScrollLeft();
    return {top, left};
  }
};
