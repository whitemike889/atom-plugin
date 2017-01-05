'use strict';

const HoverGesture = require('../../lib/gestures/hover');
const {mousemove} = require('../helpers/events');
const {sleep} = require('../spec-helpers');

describe('HoverGesture', () => {
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
      gesture = new HoverGesture(editorElement);

      gesture.onDidActivate(spy);
    });

    describe('when the mouse is moved', () => {
      beforeEach(() => {
        mousemove(editorElement, {x: 5, y: 5});
      });

      it('does not triggers a did-activate instantly', () => {
        expect(spy).not.toHaveBeenCalled();
      });

      it('triggers a did-activate event after 50ms', (done) => {
        sleep(60);
        runs(() => {
          expect(spy).toHaveBeenCalled();
        });
      });
    });
  });

  describe('with modifiers', () => {
    beforeEach(() => {
      spy = jasmine.createSpy();
      gesture = new HoverGesture(editorElement, {
        altKey: true,
      });

      gesture.onDidActivate(spy);
    });

    describe('when the mouse is moved without modifier', () => {
      beforeEach(() => {
        mousemove(editorElement, {x: 5, y: 5});
      });

      it('does not trigger a did-activate event after 50ms', (done) => {
        sleep(60);
        runs(() => {
          expect(spy).not.toHaveBeenCalled();
        });
      });
    });

    describe('when the mouse is moved with the proper modifier', () => {
      beforeEach(() => {
        mousemove(editorElement, {x: 5, y: 5, altKey: true});
      });

      it('triggers a did-activate event after 50ms', (done) => {
        sleep(60);
        runs(() => {
          expect(spy).toHaveBeenCalled();
        });
      });
    });
  });
});
