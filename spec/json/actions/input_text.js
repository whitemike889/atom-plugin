'use strict';

module.exports = (action) => {
  beforeEach(() => {
    const editor = atom.workspace.getActiveTextEditor();
    if (action.properties.text) {
      editor.insertText(action.properties.text);
    }
  });
};
