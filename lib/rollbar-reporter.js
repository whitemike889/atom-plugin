'use strict';

const rollbar = require('rollbar');
const kitePkg = require('../package.json');
const {distinctID, EDITOR_UUID, OS_VERSION} = require('./metrics');

rollbar.init('TOKEN');

class RollbarReporter {
  constructor() {
    this.subscription = atom.onDidThrowError(({column, line, message, originalError, url}) => {
      // We're only concerned by errors that originate or involve our code.
      if (/\/kite\/|\/kite-installer\//.test(originalError.stack)) {
        rollbar.handleErrorWithPayloadData(originalError, {
          column, line, message, url,
          distinctID: distinctID(),
          editor_uuid: EDITOR_UUID,
          editor: 'atom',
          atom_version: atom.getVersion(),
          kite_plugin_version: kitePkg.version,
          os: OS_VERSION,
        });
      }
    });
  }

  dispose() {
    this.subscription && this.subscription.dispose();
  }
}

module.exports = RollbarReporter;
