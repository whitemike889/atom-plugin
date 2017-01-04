'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const ready = require('../lib/ready.js');
const metrics = require('../lib/metrics.js');
const HoverManager = require('../lib/hover-manager');
const {hoverPath} = require('../lib/utils');
const {
  withKiteWhitelistedPaths, withRoutes, fakeResponse,
} = require('./spec-helpers');

const projectPath = path.join(__dirname, 'fixtures');

describe('HoverManager', () => {
  let editor;
  beforeEach(() => {
    spyOn(metrics, 'track');
    jasmine.useRealClock();
    atom.config.set('kite.checkReadiness', true);
    waitsForPromise(() => atom.packages.activatePackage('language-python'));
    waitsForPromise(() => atom.workspace.open('sample.py').then(e => {
      editor = e;
    }));
  });

  withKiteWhitelistedPaths([projectPath], () => {
    beforeEach(() => {
      waitsForPromise(() => atom.packages.activatePackage('kite'));
      waitsForPromise(() => ready.ensure());
    });

    describe('.showHoverAtPosition()', () => {
      it('triggers a request for the editor at the given position', () => {
        HoverManager.showHoverAtPosition(editor, [3, 8]);

        expect(http.request.mostRecentCall.args[0].path)
        .toEqual(hoverPath(editor, [[3, 5], [3, 10]]));
      });

      describe('when the position match the position of a token', () => {
        withRoutes([
          [
            o => /^\/api\/buffer\/atom/.test(o.path),
            o => fakeResponse(200, fs.readFileSync('./fixtures/hello.json')),
          ],
        ]);

      });
    });
  });
});
