'use strict';

const BaseGesture = require('./base');

module.exports = class CursorMoveGesture extends BaseGesture {
  constructor(editor) {
    super();
    this.editor = editor;

    this.registerEvents();
  }

  dispose() {
    super.dispose();
    this.subscription.dispose();
  }

  registerEvents() {
    this.subscription = this.editor.onDidChangeCursorPosition(() => {
      const cursor = this.editor.getLastCursor();
      const position = cursor.getBufferPosition();

      this.emitter.emit('did-activate', position);
    });
  }
};
