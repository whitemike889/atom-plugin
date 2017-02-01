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
    let isEditing = false;

    this.subscription = this.editor.onDidChange(() => { isEditing = true; });
    this.subscription = this.editor.onDidStopChanging(() => { isEditing = false; });
    this.subscription = this.editor.onDidChangeCursorPosition(() => {
      if (isEditing) { return; }

      clearTimeout(timeout);

      const cursor = this.editor.getLastCursor();
      if (cursor.selection.getBufferRange().isEmpty()) {
        const position = cursor.getBufferPosition();

        timeout = setTimeout(() => this.activate(position), this.interval);
      }
    });
  }
};
