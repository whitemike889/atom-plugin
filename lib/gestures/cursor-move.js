'use strict';

const BaseGesture = require('./base');

module.exports = class CursorMoveGesture extends BaseGesture {
  constructor(editor, options) {
    super();
    this.editor = editor;
    this.options = options || {};
    this.interval = this.options.interval || 50;

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
      if (cursor.selection.getBufferRange().isEmpty()) {
        const position = cursor.getBufferPosition();

        timeout = setTimeout(() => this.activate(position), this.interval);
      }
    });
  }
};
