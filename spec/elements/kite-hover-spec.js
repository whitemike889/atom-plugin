'use strict';

const KiteHover = require('../../lib/elements/kite-hover');

describe('KiteHover', () => {
  let hover;

  beforeEach(() => {
    hover = new KiteHover();
  });

  describe('when the hover results has no symbols', () => {
    beforeEach(() => {
      hover.setData(require('../fixtures/empty-symbol.json'));
    });

    it('clears the whole hover content', () => {
      expect(hover.innerHTML).toEqual('');
    });
  });

  describe('when the hover results has one symbol', () => {
    describe('for a class method with a signature', () => {
      beforeEach(() => {
        hover.setData(require('../fixtures/test/increment.json'));
      });

      it('sets the name of the hover using the provided value', () => {
        const name = hover.querySelector('.name');

        expect(name.textContent).toEqual('Test.increment(n:int, *args, **kwargs)');
      });

      it('sets the return type of the hover using the provided value', () => {
        const type = hover.querySelector('.type');

        expect(type.textContent).toEqual('-> int');
      });
    });

    describe('for a class method without a signature', () => {
      beforeEach(() => {
        hover.setData(require('../fixtures/test/increment-without-signature.json'));
      });

      it('sets the name of the hover using the provided value', () => {
        const name = hover.querySelector('.name');

        expect(name.textContent).toEqual('Test.increment()');
      });

      it('leaves the type empty', () => {
        const type = hover.querySelector('.type');

        expect(type.textContent).toEqual('');
      });
    });

    describe('for a variable with a single type', () => {
      beforeEach(() => {
        hover.setData(require('../fixtures/variable.json'));
      });

      it('sets the name of the hover using the provided value', () => {
        const name = hover.querySelector('.name');

        expect(name.textContent).toEqual('variable');
      });

      it('sets the type of the hover using the provided value', () => {
        const type = hover.querySelector('.type');

        expect(type.textContent).toEqual('int');
      });
    });

    describe('for a variable with a union type', () => {
      beforeEach(() => {
        hover.setData(require('../fixtures/variable-with-union-type.json'));
      });

      it('sets the name of the hover using the provided value', () => {
        const name = hover.querySelector('.name');

        expect(name.textContent).toEqual('variable');
      });

      it('sets the type of the hover using the provided value', () => {
        const type = hover.querySelector('.type');

        expect(type.textContent).toEqual('int | list[int]');
      });

      describe('that have duplicated types', () => {
        beforeEach(() => {
          hover.setData(require('../fixtures/parameter.json'));
        });

        it('display only one instance for each unique type', () => {
          const type = hover.querySelector('.type');

          expect(type.textContent).toEqual('str | int');
        });
      });
    });

    describe('for a variable without single type', () => {
      beforeEach(() => {
        hover.setData(require('../fixtures/variable-without-type.json'));
      });

      it('sets the name of the hover using the provided value', () => {
        const name = hover.querySelector('.name');

        expect(name.textContent).toEqual('variable');
      });

      it('leaves the type empty', () => {
        const type = hover.querySelector('.type');
        expect(type.textContent).toEqual('');
      });
    });

    describe('for a function', () => {
      beforeEach(() => {
        hover.setData(require('../fixtures/hello.json'));
      });

      it('sets the name of the hover using the provided value', () => {
        const name = hover.querySelector('.name');

        expect(name.textContent).toEqual('hello()');
      });
    });
  });
});
