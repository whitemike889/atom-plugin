const {jsonPath} = require('../utils');
const Kite = require('../../../lib/kite');

'use strict';

module.exports = (action) => {
  beforeEach(() => {
    let editor;
    waitsForPromise('file opened and focused', () => {
      return atom.workspace.open(jsonPath(action.properties.file))
      .then(e => {
        editor = e;
      })
      .catch(err => {
        throw err;
      });
    });
    waitsFor('kite editor', () =>
      !/\.py$/.test(action.properties.file) ||
      Kite.kiteEditorForEditor(editor), 50);

    waitsFor('kite whitelist state', () =>
      !/\.py$/.test(action.properties.file) ||
      Kite.whitelistedEditorIDs[editor.id] != undefined, 50);
  });
};
