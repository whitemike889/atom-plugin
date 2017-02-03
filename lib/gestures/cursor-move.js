'use strict';

const BaseGesture = require('./base');

module.exports = class CursorMoveGesture extends BaseGesture {
  constructor(editor, options) {
    super();
    this.editor = editor;
    this.options = options || {};

    this.registerEvents();
  }

  dispose() {
    super.dispose();
    this.subscription.dispose();
  }

  registerEvents() {
    let isEditing = false;

    this.subscription = this.editor.getBuffer().onDidChange(changes => {
      isEditing = changes != null;
    });
    this.subscription = this.editor.onDidStopChanging(() => { isEditing = false; });
    this.subscription = this.editor.onDidChangeCursorPosition(() => {
      if (isEditing) { return; }

      const cursor = this.editor.getLastCursor();
      if (cursor.selection.getBufferRange().isEmpty()) {
        this.activate(cursor.getBufferPosition());
      }
    });
  }
};
