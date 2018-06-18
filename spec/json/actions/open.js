const {jsonPath} = require('../utils');

'use strict';

module.exports = (action) => {
  beforeEach(() => {
    waitsForPromise('file opened and focused', () => {
      return atom.workspace.open(jsonPath(action.properties.file));
    });
  });
};
