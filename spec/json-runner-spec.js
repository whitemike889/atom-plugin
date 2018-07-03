'use strict';

const path = require('path');
const KiteAPI = require('kite-api');
const {withKite, withKitePaths} = require('kite-api/test/helpers/kite');
const {jsonPath, walk, describeForTest} = require('./json/utils');

const ACTIONS = {};
const EXPECTATIONS = {};

walk(path.resolve(__dirname, 'json', 'actions'), '.js', file => {
  const key = path.basename(file).replace(path.extname(file), '');
  ACTIONS[key] = require(file);
});

walk(path.resolve(__dirname, 'json', 'expectations'), '.js', file => {
  const key = path.basename(file).replace(path.extname(file), '');
  EXPECTATIONS[key] = require(file);
});
const safeRequest = KiteAPI.request;

describe('JSON tests', () => {
  beforeEach(() => {
    KiteAPI.request = safeRequest;
    jasmine.useRealClock();
    const jasmineContent = document.querySelector('#jasmine-content');

    const workspaceElement = atom.views.getView(atom.workspace);

    jasmineContent.appendChild(workspaceElement);

    atom.config.set('autocomplete-plus.enableAutoActivation', true);
    atom.config.set('autocomplete-plus.autoActivationDelay', 0);

    waitsForPromise('autocomplete-plus activation', () => atom.packages.activatePackage('autocomplete-plus'));
    waitsForPromise('language-python activation', () => atom.packages.activatePackage('language-python'));
  });

  afterEach(() => {
    KiteAPI.request = () => Promise.resolve();
  });

  walk(jsonPath('tests'), (testFile) => {
    buildTest(require(testFile), testFile);
  });
});

function kiteSetup(setup) {
  switch (setup) {
    case 'authenticated':
      return {logged: true};
    default:
      return {};
  }
}

function pathsSetup(setup) {
  return {
    whitelist: setup.whitelist && setup.whitelist.map(jsonPath),
    blacklist: setup.blacklist && setup.blacklist.map(jsonPath),
    ignored: setup.ignored && setup.ignored.map(jsonPath),
  };
}

function buildTest(data, file) {
  describeForTest(data, `${data.description} ('${file}')`, () => {
    withKite(kiteSetup(data.setup.kited), () => {
      beforeEach(() => {
        spyOn(KiteAPI, 'request').andCallThrough();
        atom.project.setPaths([path.resolve(__dirname, '..')]);

        waitsForPromise('kite activation', () => atom.packages.activatePackage('kite'));
        // console.log('start ------------------------------------------');
      });

      afterEach(() => {
        // console.log('end ------------------------------------------');
      });
      withKitePaths(pathsSetup(data.setup), undefined, () => {
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

    describe('', () => {
      block && block();
    });
  });
}

function buildExpectation(expectation, block) {
  return () => {

    EXPECTATIONS[expectation.type] && EXPECTATIONS[expectation.type](expectation);

    describe('', () => {
      block && block();
    });
  };
}
