'use strict';

const http = require('http');
const EditorEvents = require('../lib/editor-events');
const KiteApp = require('../lib/kite-app');
const {withFakeServer, fakeResponse} = require('./spec-helpers');

describe('EditorEvents', () => {
  let editor, events, app;

  withFakeServer([
    [
      o => /\/clientapi\/editor\/event/.test(o.path),
      o => fakeResponse(200),
    ], [
      o => /\/clientapi\/editor\/error/.test(o.path),
      o => fakeResponse(200),
    ],
  ], () => {
    describe('when attached to an editor', () => {
      beforeEach(() => {
        app = new KiteApp();

        waitsForPromise(() => atom.workspace.open('sample.py').then(e => {
          editor = e;
          events = new EditorEvents(e, app);
        }));
      });

      afterEach(() => {
        events.dispose();
      });

      describe('when an edit is made', () => {
        it('foo', () => {
          editor.moveLineDown();

          advanceClock(10);

          expect(http.request).toHaveBeenCalled();
          expect(http.request.callCount).toEqual(1);
        });
      });
    });
  });
});
