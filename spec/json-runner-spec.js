'use strict';

const path = require('path');
const KiteAPI = require('kite-api');
const {withKite, withKitePaths} = require('kite-api/test/helpers/kite');
const {jsonPath, walk} = require('./json/utils');

const ACTIONS = {};
const EXPECTATIONS = {};

walk(jsonPath('actions'), file => {
  const key = path.basename(file).replace(path.extname(file), '');
  ACTIONS[key] = require(file);
});

walk(jsonPath('expectations'), file => {
  const key = path.basename(file).replace(path.extname(file), '');
  EXPECTATIONS[key] = require(file);
});

fdescribe('JSON tests', () => {
  beforeEach(() => {
    jasmine.useRealClock();
  });

  walk(jsonPath('tests'), (testFile) => {
    buildTest(require(testFile));
  });
});

function buildTest(data) {
  describe(data.description, () => {
    withKite({[data.setup.kited]: true}, () => {
      beforeEach(() => {
        spyOn(KiteAPI, 'request').andCallThrough();
        atom.project.setPaths([path.resolve(__dirname, '..')]);
        waitsForPromise('kite activation', () => atom.packages.activatePackage('kite'));
      });
      withKitePaths(data.setup, undefined, () => {
        data.test.reverse().reduce((f, s) => {
          switch (s.step) {
            case 'action':
              return buildAction(s, f);
            case 'expect':
              return buildExpectation(s, f);
            default:
              return f;
          }
        }, () => {})();
      });
    });
  });
}

function buildAction(action, block) {
  return () => describe(action.description, () => {
    ACTIONS[action.type] && ACTIONS[action.type](action);

    block && block();
  });
}

function buildExpectation(expectation, block) {
  return () => {
    EXPECTATIONS[expectation.type] && EXPECTATIONS[expectation.type](expectation);

    block && block();
  };
}
