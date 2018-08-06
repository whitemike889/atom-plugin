'use strict';

const path = require('path');
const KiteAPI = require('kite-api');
const {withKite, withKitePaths} = require('kite-api/test/helpers/kite');
const {jsonPath, walk, describeForTest, featureSetPath} = require('./json/utils');

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

const featureSet = require(featureSetPath());

describe('JSON tests', () => {
  beforeEach(() => {
    KiteAPI.request = safeRequest;
    jasmine.useRealClock();
    const jasmineContent = document.querySelector('#jasmine-content');

    const workspaceElement = atom.views.getView(atom.workspace);

    jasmineContent.appendChild(workspaceElement);

    atom.config.set('autocomplete-plus.enableAutoActivation', true);
    atom.config.set('autocomplete-plus.autoActivationDelay', 0);

    waitsForPromise(() => atom.packages.activatePackage('about'));
    runs(() => {
      atom.commands.dispatch(workspaceElement, 'application:about');
    });
    waitsForPromise('autocomplete-plus activation', () => atom.packages.activatePackage('autocomplete-plus'));
    waitsForPromise('language-python activation', () => atom.packages.activatePackage('language-python'));
  });

  afterEach(() => {
    KiteAPI.request = () => Promise.resolve();
  });

  featureSet.forEach(feature => {
    walk(jsonPath('tests', feature), (testFile) => {
      buildTest(require(testFile), testFile);
    });
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
    whitelist: setup.whitelist && setup.whitelist.map(p => jsonPath(p)),
    blacklist: setup.blacklist && setup.blacklist.map(p => jsonPath(p)),
    ignored: setup.ignored && setup.ignored.map(p => jsonPath(p)),
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
            case 'expect_not':
              return buildExpectation(s, f, true);
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

function buildExpectation(expectation, block, not) {
  return () => {

    EXPECTATIONS[expectation.type] && EXPECTATIONS[expectation.type](expectation, not);

    describe('', () => {
      block && block();
    });
  };
}
