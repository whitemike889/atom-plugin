'use strict';

// const fs = require('fs');
const path = require('path');
// const http = require('http');
const ready = require('../lib/ready.js');
const metrics = require('../lib/metrics.js');
const ExpandManager = require('../lib/expand-manager');
// const {hoverPath, editorRoot} = require('../lib/utils');
const {
  withKiteWhitelistedPaths, //withRoutes, fakeResponse,
} = require('./spec-helpers');

const projectPath = path.join(__dirname, 'fixtures');

// By enabling this constant, it's possible to visually debug a test.
// It should only be used when a single test is focused as it will make every
// test last for one minute before completing.
// During that time the atom's workspace will be visible in the test. After that
// the normal test cleanup occurs and the workspace will be cleaned of all its
// content.
const VISUAL_DEBUG = false;
let jasmineContent;

describe('ExpandManager', () => {
  let editor, editorElement;

  // const editorQuery = (selector) => editorElement.querySelector(selector);
  //
  // const editorQueryAll = (selector) => editorElement.querySelectorAll(selector);

  beforeEach(() => {
    jasmineContent = !VISUAL_DEBUG
      ? document.body.querySelector('#jasmine-content')
      : document.body;

    const styleNode = document.createElement('style');
    styleNode.textContent = !VISUAL_DEBUG
      ? ''
      : `
        atom-workspace {
          z-index: 100000;
          position: relative;
        }
      `;

    jasmineContent.appendChild(styleNode);
    jasmineContent.appendChild(atom.views.getView(atom.workspace));

    spyOn(metrics, 'track');
    jasmine.useRealClock();
    atom.config.set('kite.checkReadiness', true);
    waitsForPromise(() => atom.packages.activatePackage('language-python'));
    waitsForPromise(() => atom.workspace.open('sample.py').then(e => {
      editor = e;
      editorElement = atom.views.getView(editor);
    }));
  });

  afterEach(() => {
    if (VISUAL_DEBUG) {
      let done = false;
      setTimeout(() => done = true, 59500);
      waitsFor('nothing', 60000, () => done);
    }
  });

  withKiteWhitelistedPaths([projectPath], () => {
    beforeEach(() => {
      waitsForPromise(() => atom.packages.activatePackage('kite'));
      waitsForPromise(() => ready.ensure());
    });

    describe('.showAtPosition()', () => {
      
    });
  });
});
