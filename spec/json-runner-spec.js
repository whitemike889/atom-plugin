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

const featureSet = require(featureSetPath());

describe('JSON tests', () => {
  beforeEach(() => {
    jasmine.useRealClock();
    const jasmineContent = document.querySelector('#jasmine-content');

    const workspaceElement = atom.views.getView(atom.workspace);

    jasmineContent.appendChild(workspaceElement);

    atom.config.set('autocomplete-plus.enableAutoActivation', true);
    atom.config.set('autocomplete-plus.autoActivationDelay', 0);

    waitsForPromise({label: 'about package activation'}, () => atom.packages.activatePackage('about'));
    runs(() => {
      atom.commands.dispatch(workspaceElement, 'application:about');
    });
    waitsForPromise({
      label: 'autocomplete-plus package activation',
    }, () => atom.packages.activatePackage('autocomplete-plus'));
    waitsForPromise({
      label: 'language-python package activation',
    }, () => atom.packages.activatePackage('language-python'));
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
    case 'unsupported':
      return {supported: false};
    case 'uninstalled':
      return {installed: false};
    case 'unreachable':
      return {reachable: false};
    case 'unlogged':
      return {logged: false};
    default:
      return {supported: false};
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

        waitsForPromise({label: 'kite activation'}, () => atom.packages.activatePackage('kite'));
        // console.log('start ------------------------------------------');
      });

      afterEach(() => {
        // console.log('end ------------------------------------------');
      });
      const block = () => {
        data.test.reverse().reduce((f, s) => {
          switch (s.step) {
            case 'action':
              return buildAction(s, data, f);
            case 'expect':
              return buildExpectation(s, data, f);
            case 'expect_not':
              return buildExpectation(s, data, f, true);
            default:
              return f;
          }
        }, () => {})();
      };
      if (/reachable|authenticated/.test(data.setup.kited)) {
        withKitePaths(pathsSetup(data.setup), undefined, block);
      } else {
        block();
      }
    });
  });
}

function buildAction(action, testData, block) {
  return () => describe(action.description, () => {
    ACTIONS[action.type] && ACTIONS[action.type](action, testData);

    describe('', () => {
      block && block();
    });
  });
}

function buildExpectation(expectation, testData, block, not) {
  return () => {

    EXPECTATIONS[expectation.type] && EXPECTATIONS[expectation.type](expectation, not, testData);

    describe('', () => {
      block && block();
    });
  };
}
