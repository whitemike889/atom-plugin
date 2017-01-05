'use strict';

const BaseGesture = require('./base');
const VirtualCursor = require('../virtual-cursor');

module.exports = class WordSelectionGesture extends BaseGesture {
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
    this.subscription = this.editor.onDidChangeSelectionRange(() => {
      const range = this.editor.getSelectedBufferRange();
      const cursor = new VirtualCursor(this.editor, [
        Math.floor((range.start.row + range.end.row) / 2),
        Math.floor((range.start.column + range.end.column) / 2),
      ]);
      const wordRange = cursor.getCurrentWordBufferRange({
        includeNonWordCharacters: false,
      });

      if (wordRange.isEqual(range) && !range.isEmpty()) {
        this.emitter.emit('did-activate', range);
      }
    });
  }
};
