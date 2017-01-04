'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const ready = require('../lib/ready.js');
const metrics = require('../lib/metrics.js');
const HoverManager = require('../lib/hover-manager');
const {hoverPath, editorRoot} = require('../lib/utils');
const {
  withKiteWhitelistedPaths, withRoutes, fakeResponse,
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

describe('HoverManager', () => {
  let editor, editorElement;

  const editorQuery = (selector) =>
    editorRoot(editorElement).querySelector(selector);

  const editorQueryAll = (selector) =>
    editorRoot(editorElement).querySelectorAll(selector);

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

    describe('.showHoverAtPosition()', () => {
      describe('when the position matches a word', () => {
        it('triggers a request for the editor at the given position', () => {
          HoverManager.showHoverAtPosition(editor, [2, 8]);

          expect(http.request.mostRecentCall.args[0].path)
          .toEqual(hoverPath(editor, [[2, 4], [2, 9]]));
        });
      });

      describe('when the position does not match a word', () => {
        it('does not triggers a request', () => {
          HoverManager.showHoverAtPosition(editor, [1, 0]);

          expect(http.request.mostRecentCall.args[0].path)
          .not.toEqual(hoverPath(editor, [[1, 0], [1, 0]]));
        });
      });

      describe('when the position match the position of a token', () => {
        let hover;

        withRoutes([
          [
            o => /^\/api\/buffer\/atom/.test(o.path),
            o => fakeResponse(200, fs.readFileSync(path.resolve(__dirname, 'fixtures/hello.json'))),
          ],
        ]);

        beforeEach(() => {
          waitsForPromise(() =>
            HoverManager.showHoverAtPosition(editor, [2, 8]));
          runs(() => hover = editorQuery('kite-hover'));
        });

        it('displays an overlay decoration with the results from the API', () => {
          expect(hover).toExist();
          expect(hover.textContent.trim()).toEqual('hello');
        });

        describe('querying the same range again', () => {
          beforeEach(() => {
            waitsForPromise(() =>
              HoverManager.showHoverAtPosition(editor, [2, 7]));
          });

          it('leaves the previous decoration in place', () => {
            const newHover = editorQuery('kite-hover');
            expect(newHover).toBe(hover);
          });

        });

        describe('querying a different range', () => {
          beforeEach(() => {
            waitsForPromise(() =>
              HoverManager.showHoverAtPosition(editor, [0, 1]));
          });

          it('destroys the previous decoration and creates a new one', () => {
            expect(editorQueryAll('kite-hover').length).toEqual(1);

            const newHover = editorQuery('kite-hover');
            expect(newHover).not.toBe(hover);
          });
        });
      });

      describe('when the position does not match the position of a token', () => {
        beforeEach(() => {
          waitsForPromise(() =>
            HoverManager.showHoverAtPosition(editor, [2, 8]));
        });

        it('does not displays an overlay decoration', () => {
          const hover = editorQuery('kite-hover');
          expect(hover).not.toExist();
        });
      });
    });
  });
});
