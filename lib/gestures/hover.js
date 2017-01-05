'use strict';

const MouseEventGesture = require('./mouse-event');
const {DisposableEvent} = require('../utils');

module.exports = class HoverGesture extends MouseEventGesture {
  constructor(editorElement, options) {
    super(editorElement, options);

    const {interval} = this.options;
    this.interval = interval != null ? interval : 50;

    this.registerEvents();
  }

  dispose() {
    super.dispose();
    this.subscription.dispose();
  }

  registerEvents() {
    let timeout;

    this.subscription = new DisposableEvent(this.editorElement, 'mousemove', (e) => {
      clearTimeout(timeout);

      if (!this.matchesModifiers(e)) { return; }
      if (e.target.matches('kite-hover, kite-hover *')) { return; }
      timeout = setTimeout(() => {
        this.emitter.emit('did-activate', this.screenPositionForMouseEvent(e));
        timeout = null;
      }, this.interval);
    });
  }
};
