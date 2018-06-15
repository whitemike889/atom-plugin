'use strict';

const fs = require('fs');
const path = require('path');
const KiteAPI = require('kite-api');
const {withKite, withKitePaths} = require('kite-api/test/helpers/kite');

fdescribe('JSON tests', () => {
  beforeEach(() => {
    jasmine.useRealClock();
  });

  walk(jsonPath('tests'), (testFile) => {
    buildTest(require(testFile));
  });
});

function jsonPath(p) {
  return path.join(__dirname, 'json', p);
}

function walk(p, callback) {
  if (fs.existsSync(p)) {
    const stats = fs.lstatSync(p);

    if (stats.isDirectory()) {
      const content = fs.readdirSync(p);

      content.forEach(s => walk(path.join(p, s), callback));
    } else {
      callback(p);
    }
  }
}

function buildAction(action) {
  switch (action.action) {
    case 'open':
      waitsForPromise('file opened and focused', () => {
        return atom.workspace.open(jsonPath(action.properties.file));
      });
      break;
    case 'move-cursor':
      runs(() => {
        const editor = atom.workspace.getActiveTextEditor();
        if (action.properties.offset) {
          const pos = editor.getBuffer().positionForCharacterIndex(action.properties.offset);
          editor.setCursorBufferPosition(pos);
        }
      });
      break;
  }
}

function buildExpectation(expectation) {
  switch (expectation.expect) {
    case 'request':
      waitsFor(`request to '${expectation.properties.path}'`, function() {
        return KiteAPI.request.mostRecentCall.args[0].path === expectation.properties.path &&
        this.env.equals_(
          JSON.parse(KiteAPI.request.mostRecentCall.args[1]),
          loadResponseForEditor(
            jsonPath(expectation.properties.body),
            atom.workspace.getActiveTextEditor()));
      });
      break;
  }
}

function loadResponseForEditor(p, e) {
  const data = require(p);

  for (const k in data) {
    const v = data[k];
    if (v === 'filled-out-by-testrunner') {
      switch (k) {
        case 'source':
          data[k] = 'atom';
          break;
        case 'filename':
          data[k] = e.getPath();
          break;
      }
    }
  }

  return data;
}

function buildTest(data) {
  describe(data.description, () => {
    withKite({[data.setup.kited]: true}, () => {
      beforeEach(() => {
        spyOn(KiteAPI, 'request').andCallThrough();
        atom.project.setPaths([path.resolve(__dirname, '..')]);
        waitsForPromise('kite activation', () => atom.packages.activatePackage('kite'));
      });
      withKitePaths(data.setup, undefined, () => {
        it('', () => {
          data.runs.forEach(item => {
            switch (item.type) {
              case 'action':
                buildAction(item);
                break;
              case 'expect':
                buildExpectation(item);
                break;
            }
          });
        });
      });

    });
  });
}
