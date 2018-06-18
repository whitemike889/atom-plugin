'use strict';

const KiteAPI = require('kite-api');
const {loadResponseForEditor} = require('../utils');

module.exports = (expectation) => {
  beforeEach(() => {
    waitsFor(`request to '${expectation.properties.path}'`, function() {
      return KiteAPI.request.mostRecentCall.args[0].path === expectation.properties.path &&
        KiteAPI.request.mostRecentCall.args[0].method === expectation.properties.method &&
        this.env.equals_(
          JSON.parse(KiteAPI.request.mostRecentCall.args[1]),
          loadResponseForEditor(
            expectation.properties.body,
            atom.workspace.getActiveTextEditor()));
    });
  });

  it(expectation.description, () => {});
};
