'use strict';

const ClickGesture = require('../../lib/gestures/click');
const {click} = require('../helpers/events');

describe('ClickGesture', () => {
  let editor, editorElement, gesture, spy;

  beforeEach(() => {
    jasmine.useRealClock();
    waitsForPromise(() => atom.packages.activatePackage('language-python'));
    waitsForPromise(() => atom.workspace.open('sample.py').then(e => {
      editor = e;
      editorElement = atom.views.getView(editor);
    }));
  });

  describe('without any modifier', () => {
    beforeEach(() => {
      spy = jasmine.createSpy();
      gesture = new ClickGesture(editorElement);

      gesture.onDidActivate(spy);
    });

    describe('when the mouse is clicked', () => {
      beforeEach(() => {
        click(editorElement, {x: 5, y: 5});
      });

      it('triggers a did-activate', (done) => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('with modifiers', () => {
    beforeEach(() => {
      spy = jasmine.createSpy();
      gesture = new ClickGesture(editorElement, {
        altKey: true,
      });

      gesture.onDidActivate(spy);
    });

    describe('when the mouse is clicked without modifier', () => {
      beforeEach(() => {
        click(editorElement, {x: 5, y: 5});
      });

      it('does not trigger a did-activate event', (done) => {
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('when the mouse is clicked with the proper modifier', () => {
      beforeEach(() => {
        click(editorElement, {x: 5, y: 5, altKey: true});
      });

      it('triggers a did-activate event', (done) => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
