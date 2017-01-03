'use strict';

const KiteHover = require('../../lib/elements/kite-hover');

describe('KiteHover', () => {
  let tip;

  beforeEach(() => {
    tip = new KiteHover();
  });

  describe('when the hover results has no symbols', () => {
    beforeEach(() => {
      tip.setData(require('../fixtures/empty-symbol.json'));
    });

    it('clears the whole tip content', () => {
      expect(tip.innerHTML).toEqual('');
    });
  });

  describe('when the hover results has one symbol', () => {
    describe('for a class method with a signature', () => {
      beforeEach(() => {
        tip.setData(require('../fixtures/test/increment.json'));
      });

      it('sets the name of the tip using the provided value', () => {
        const name = tip.querySelector('.name');

        expect(name.textContent).toEqual('Test.increment(n:int, *args, **kwargs)');
      });

      it('sets the return type of the tip using the provided value', () => {
        const type = tip.querySelector('.type');

        expect(type.textContent).toEqual('-> int');
      });
    });

    describe('for a class method without a signature', () => {
      beforeEach(() => {
        tip.setData(require('../fixtures/test/increment-without-signature.json'));
      });

      it('sets the name of the tip using the provided value', () => {
        const name = tip.querySelector('.name');

        expect(name.textContent).toEqual('Test.increment');
      });

      it('leaves the type empty', () => {
        const type = tip.querySelector('.type');

        expect(type.textContent).toEqual('');
      });
    });

    describe('for a variable with a single type', () => {
      beforeEach(() => {
        tip.setData(require('../fixtures/variable.json'));
      });

      it('sets the name of the tip using the provided value', () => {
        const name = tip.querySelector('.name');

        expect(name.textContent).toEqual('variable');
      });

      it('sets the type of the tip using the provided value', () => {
        const type = tip.querySelector('.type');

        expect(type.textContent).toEqual('int');
      });
    });

    describe('for a variable with a union type', () => {
      beforeEach(() => {
        tip.setData(require('../fixtures/variable-with-union-type.json'));
      });

      it('sets the name of the tip using the provided value', () => {
        const name = tip.querySelector('.name');

        expect(name.textContent).toEqual('variable');
      });

      it('sets the type of the tip using the provided value', () => {
        const type = tip.querySelector('.type');

        expect(type.textContent).toEqual('int | list[int]');
      });
    });

    describe('for a variable without single type', () => {
      beforeEach(() => {
        tip.setData(require('../fixtures/variable-without-type.json'));
      });

      it('sets the name of the tip using the provided value', () => {
        const name = tip.querySelector('.name');

        expect(name.textContent).toEqual('variable');
      });

      it('leaves the type empty', () => {
        const type = tip.querySelector('.type');

        expect(type.textContent).toEqual('');
      });
    });

    describe('for a function', () => {
      beforeEach(() => {
        tip.setData(require('../fixtures/hello.json'));
      });

      it('sets the name of the tip using the provided value', () => {
        const name = tip.querySelector('.name');

        expect(name.textContent).toEqual('hello');
      });
    });
  });
});
