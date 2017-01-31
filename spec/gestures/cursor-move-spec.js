'use strict';

const CursorMoveGesture = require('../../lib/gestures/cursor-move');
const {sleep} = require('../spec-helpers');

describe('CursorMoveGesture', () => {
  let editor, gesture, spy;

  beforeEach(() => {
    jasmine.useRealClock();
    waitsForPromise(() => atom.packages.activatePackage('language-python'));
    waitsForPromise(() => atom.workspace.open('sample.py').then(e => {
      editor = e;
      spy = jasmine.createSpy();
      gesture = new CursorMoveGesture(editor, {interval: 50});
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

  it('does not trigger immediately', () => {
    expect(spy).not.toHaveBeenCalled();
  });

  it('triggers a did-activate event after 50ms', () => {
    sleep(60);
    runs(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.callCount).toEqual(1);
    });
  });
});
