'use strict';

const BaseGesture = require('./base');
const {editorRoot} = require('../utils');

module.exports = class MouseEventGesture extends BaseGesture {
  constructor(editorElement, options) {
    super();
    this.editorElement = editorElement;
    this.editor = editorElement.getModel();
    this.options = options || {};
  }

  matchesModifiers(e) {
    return e.altKey == !!this.options.altKey &&
      e.ctrlKey == !!this.options.ctrlKey &&
      e.shiftKey == !!this.options.shiftKey &&
      e.metaKey == !!this.options.metaKey;
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
