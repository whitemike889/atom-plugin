'use strict';

const {updateKitePaths} = require('kite-api');

module.exports = (action) => {
  beforeEach(() => {
    updateKitePaths(action.properties);
  });
};
