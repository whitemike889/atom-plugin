'use strict';

const WordSelectionGesture = require('../../lib/gestures/word-selection');

describe('WordSelectionGesture', () => {
  let editor, gesture, spy;

  beforeEach(() => {
    jasmine.useRealClock();
    waitsForPromise(() => atom.packages.activatePackage('language-python'));
    waitsForPromise(() => atom.workspace.open('sample.py').then(e => {
      editor = e;
      spy = jasmine.createSpy();
      gesture = new WordSelectionGesture(editor);
      gesture.onDidActivate(spy);
    }));
  });

  describe('when a whole word is selected', () => {
    beforeEach(() => {
      editor.setSelectedBufferRange([[0, 0], [0, 8]]);
    });

    it('triggers a did-activate event', () => {
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('when a portion of a word is selected', () => {
    beforeEach(() => {
      editor.setSelectedBufferRange([[0, 2], [0, 5]]);
    });

    it('does not trigger a did-activate event', () => {
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('when more than a word is selected', () => {
    beforeEach(() => {
      editor.setSelectedBufferRange([[0, 0], [0, 14]]);
    });

    it('does not trigger a did-activate event', () => {
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('when several lines are selected', () => {
    beforeEach(() => {
      editor.setSelectedBufferRange([[0, 5], [2, 2]]);
    });

    it('does not trigger a did-activate event', () => {
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
