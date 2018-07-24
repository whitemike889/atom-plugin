'use strict';

module.exports = (action) => {
  beforeEach(() => {
    const editor = atom.workspace.getActiveTextEditor();
    const view = atom.views.getView(editor);
    const event = new CustomEvent('kite:docs-at-cursor', {bubbles: true, cancelable: true});
    view.dispatchEvent(event);
  });
};
