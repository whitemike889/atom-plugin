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

  abort() {
    clearTimeout(this.timeout);
  }

  registerEvents() {
    this.subscription = new DisposableEvent(this.editorElement, 'mousemove', (e) => {
      this.abort();

      if (!this.matchesModifiers(e)) { return; }
      if (e.target.matches(this.options.ignoredSelector)) { return; }
      this.timeout = setTimeout(() => {
        this.activate(this.bufferPositionForMouseEvent(e));
        delete this.timeout;
      }, this.interval);
    });
  }
};
