'use strict';

const {Emitter, CompositeDisposable} = require('atom');
const {editorRoot, DisposableEvent} = require('../utils');

module.exports = class HoverGesture {
  constructor(editorElement, options) {
    const {interval} = options || {};

    this.emitter = new Emitter();
    this.editorElement = editorElement;
    this.editor = editorElement.getModel();
    this.interval = interval != null ? interval : 50;

    this.registerEvents();
  }

  dispose() {
    this.emitter.dispose();
    this.subscriptions.dispose();
  }

  registerEvents() {
    let timeout;

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(new DisposableEvent(this.editorElement, 'mousemove', (e) => {
      clearTimeout(timeout);
      if (e.target.matches('kite-hover, kite-hover *')) { return; }
      timeout = setTimeout(() => {
        this.emitter.emit('did-activate', this.screenPositionForMouseEvent(e));
        timeout = null;
      }, this.interval);
    }));
  }

  onDidActivate(listener) {
    return this.emitter.on('did-activate', listener);
  }

  onDidDismiss(listener) {
    return this.emitter.on('did-dismiss', listener);
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
