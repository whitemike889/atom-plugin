'use strict';

const fs = require('fs');
const path = require('path');
const KiteAPI = require('kite-api');
const {withKite} = require('kite-api/test/helpers/kite');

const walk = (p, callback) => {
  if (fs.existsSync(p)) {
    const stats = fs.lstatSync(p);

    if (stats.isDirectory()) {
      const content = fs.readdirSync(p);

      content.forEach(s => walk(path.join(p, s), callback));
    } else {
      callback(p);
    }
  }
};

const buildTest = (data) => {
  describe(data.description, () => {
    withKite({[data.setup.kited]: true}, () => {
      beforeEach(() => {
        spyOn(KiteAPI, 'request').andCallThrough();
        atom.project.setPaths([path.resolve(__dirname, '..')]);
        waitsForPromise('kite activation', () => atom.packages.activatePackage('kite'));
      });

      data.actions.forEach(action => {
        switch (action.type) {
          case 'focus':
            beforeEach(() => {
              waitsForPromise('file opened and focused', () => {
                return atom.workspace.open(action.properties.file).then(editor => {
                  if (action.properties.offset) {
                    const pos = editor.getBuffer().positionForCharacterIndex(action.properties.offset);
                    editor.setCursorBufferPosition(pos);
                  }
                });
              });
            });
            break;
        }
      });

      data.expect.forEach(expectation => {
        switch (expectation.type) {
          case 'request':
            it(`makes a ${expectation.properties.method} request to '${expectation.properties.path}'`, () => {
              waitsFor('request', () => KiteAPI.request.calls.some(call => call.args[0].path === expectation.properties.path));
            });
            break;
        }
      });
    });
  });
};

fdescribe('JSON tests', () => {
  walk(path.join(__dirname, 'json', 'tests'), (testFile) => {
    buildTest(require(testFile));
  });
});
