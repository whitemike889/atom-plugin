'use strict';

const BaseGesture = require('./base');

module.exports = class CursorMoveGesture extends BaseGesture {
  constructor(editor, options) {
    super();
    this.editor = editor;
    this.options = options || {};
    this.interval = this.options.interval || 100;

    this.registerEvents();
  }

  dispose() {
    super.dispose();
    this.subscription.dispose();
  }

  registerEvents() {
    let timeout;

    this.subscription = this.editor.onDidChangeCursorPosition(() => {
      clearTimeout(timeout);

      const cursor = this.editor.getLastCursor();
      const position = cursor.getBufferPosition();

      timeout = setTimeout(() => {
        this.emitter.emit('did-activate', position);
      }, this.interval);
    });
  }
};
