module.exports = class Codenav {
  constructor(kiteapi, notifCenter) {
    this.KiteAPI = kiteapi;
    this.notifications = notifCenter;
  }

  relatedCodeFromFile() {
    this.requireEditor()
      .then((textEditor) => this.relatedCodeFromFileWithEditor(textEditor));
  }

  relatedCodeFromLine() {
    this.requireEditor()
      .then((textEditor) => this.relatedCodeFromLineWithEditor(textEditor));
  }

  relatedCodeFromFileWithEditor(textEditor) {
    this.KiteAPI
      .requestRelatedCode('atom', textEditor.getPath(), null, null)
      .catch((err) => this.notifications.getRelatedCodeErrHandler(textEditor.getPath(), null)(err));
  }

  relatedCodeFromLineWithEditor(textEditor) {
    const zeroBasedLineNo = textEditor.getCursorBufferPosition().row;
    const oneBasedLineNo = zeroBasedLineNo + 1;

    const requireNonEmptyLine = new Promise((resolve, reject) => {
      if (textEditor.lineTextForBufferRow(zeroBasedLineNo) === '') {
        return reject({
          data: {
            responseData: 'ErrEmptyLine',
          },
        });
      }
      return resolve();
    });

    requireNonEmptyLine
      .then(() => this.KiteAPI.requestRelatedCode('atom', textEditor.getPath(), oneBasedLineNo, null))
      .catch((err) => this.notifications.getRelatedCodeErrHandler(textEditor.getPath(), oneBasedLineNo)(err));
  }

  requireEditor() {
    return new Promise((resolve, reject) => {
      const textEditor = atom.workspace.getActiveTextEditor();
      if (!textEditor) {
        return reject({
          data: {
            responseData: 'ErrNotTextEditor',
          },
        });
      }
      return resolve(textEditor);
    });
  }
};
