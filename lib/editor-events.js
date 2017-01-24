'use strict';

const {CompositeDisposable} = require('atom');

class EditorEvents {
  constructor(editor) {
    this.editor = editor;
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(editor.onDidChange(changes => {

    }));
    this.subscriptions.add(editor.onDidChangeSelectionRange(() => {

    }));
  }

  dispose() {
    delete this.editor;
    this.subscriptions.dispose();
  }
}

module.exports = EditorEvents;
