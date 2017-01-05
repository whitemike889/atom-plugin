'use strict';

const CursorMoveGesture = require('../../lib/gestures/cursor-move');

describe('CursorMoveGesture', () => {
  let editor, gesture, spy;

  beforeEach(() => {
    jasmine.useRealClock();
    waitsForPromise(() => atom.packages.activatePackage('language-python'));
    waitsForPromise(() => atom.workspace.open('sample.py').then(e => {
      editor = e;
      spy = jasmine.createSpy();
      gesture = new CursorMoveGesture(editor);
      gesture.onDidActivate(spy);
    }));
  });

  describe('when inside a word', () => {
    beforeEach(() => {
      editor.setCursorBufferPosition([0, 3]);
    });

    it('triggers a did-activate event', () => {
      expect(spy).toHaveBeenCalled();
    });
  });
});
