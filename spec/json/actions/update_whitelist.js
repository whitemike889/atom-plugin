'use strict';

const {updateKitePaths} = require('kite-api/test/helpers/kite');

module.exports = (action) => {
  beforeEach(() => {
    updateKitePaths(action.properties);
  });
};
