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

  beforeEach(() => {
    editor.setCursorBufferPosition([0, 3]);
    editor.setCursorBufferPosition([0, 4]);
    editor.setCursorBufferPosition([0, 5]);
    editor.setCursorBufferPosition([0, 6]);
    editor.setCursorBufferPosition([0, 7]);
  });

  it('triggers a did-activate event', () => {
    expect(spy).toHaveBeenCalled();
    expect(spy.callCount).toEqual(5);
  });
});
