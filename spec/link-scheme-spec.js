'use strict';

const LinkScheme = require('../lib/link-scheme');
const {click} = require('./helpers/events');

describe('LinkScheme', () => {
  let scheme, spy, jasmineContent;
  beforeEach(() => {
    jasmineContent = document.querySelector('#jasmine-content');
    scheme = new LinkScheme('kite-atom-internal');
    spy = jasmine.createSpy();

    scheme.onDidClickLink(spy);
  });

  describe('when a link is clicked', () => {
    let link;
    describe('whose href match the scheme', () => {
      beforeEach(() => {
        link = document.createElement('a');
        link.href = 'kite-atom-internal://dummy/path';
        jasmineContent.appendChild(link);

        click(link);
      });

      it('emits a did-click-link event', () => {
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('whose href does not match the scheme', () => {
      beforeEach(() => {
        link = document.createElement('a');
        link.href = 'foo://dummy/path';
        jasmineContent.appendChild(link);

        click(link);
      });

      it('does not emit a did-click-link event', () => {
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });
});
