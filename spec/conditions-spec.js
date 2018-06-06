'use strict';

const MemoryStore = require('../lib/stores/memory');
const {all, any, once, oncePerWindow} = require('../lib/conditions');

const truthy = () => true;
const falsy = () => false;

describe('conditions', () => {
  describe('all()', () => {
    it('takes an array of conditions and returns true if all of them are true', () => {
      expect(all(truthy, truthy)()).toBeTruthy();
      expect(all(falsy, truthy)()).toBeFalsy();
      expect(all(truthy, falsy)()).toBeFalsy();
      expect(all(falsy, falsy)()).toBeFalsy();
    });
  });

  describe('any()', () => {
    it('takes an array of conditions and returns true if any of them are true', () => {
      expect(any(truthy, truthy)()).toBeTruthy();
      expect(any(falsy, truthy)()).toBeTruthy();
      expect(any(truthy, falsy)()).toBeTruthy();
      expect(all(falsy, falsy)()).toBeFalsy();
    });
  });

  describe('once()', () => {
    beforeEach(() => {
      once.store = new MemoryStore();
    });

    describe('when there nothing in storage', () => {
      it('returns true', () => {
        expect(once('kite.notifications.')({id: 'id'})).toBeTruthy();
      });
    });

    describe('when there is something in storage', () => {
      it('returns true', () => {
        once.store.setItem('kite.notifications.id', true);
        expect(once('kite.notifications.')({id: 'id'})).toBeFalsy();
      });
    });
  });

  describe('oncePerWindow()', () => {
    beforeEach(() => {
      oncePerWindow.store = new MemoryStore();
    });

    describe('when there nothing in storage', () => {
      it('returns true', () => {
        expect(oncePerWindow('kite.notifications.')({id: 'id'})).toBeTruthy();
      });
    });

    describe('when there is something in storage', () => {
      it('returns true', () => {
        oncePerWindow.store.setItem('kite.notifications.id', true);
        expect(oncePerWindow('kite.notifications.')({id: 'id'})).toBeFalsy();
      });
    });
  });

  // For now we'll rely on window rather than sessions
  xdescribe('oncePerSession()', () => {

  });
});
