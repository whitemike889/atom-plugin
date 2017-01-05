'use strict';

const MouseEventGesture = require('./mouse-event');
const {DisposableEvent} = require('../utils');

module.exports = class HoverGesture extends MouseEventGesture {
  constructor(editorElement, options) {
    super(editorElement, options);
    this.registerEvents();
  }

  dispose() {
    super.dispose();
    this.subscription.dispose();
  }

  registerEvents() {
    this.subscription = new DisposableEvent(this.editorElement, 'click', (e) => {
      if (!this.matchesModifiers(e)) { return; }
      this.emitter.emit('did-activate', this.bufferPositionForMouseEvent(e));
    });
  }
};
