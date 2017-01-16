'use strict';

const KiteExpandModule = require('../../lib/elements/kite-expand-module');

describe('KiteExpandModule', () => {
  let json, element;

  beforeEach(() => {
    json = require('../fixtures/os.json');
    element = new KiteExpandModule();
    element.setData(json);
  });

  it('fills the name and type section with provided data', () => {
    expect(element.querySelector('.expand-header .name').textContent).toEqual('os');
    expect(element.querySelector('.expand-header .type').textContent).toEqual('module');
  });

  it('uses the synopsis to fill the summary', () => {
    expect(element.querySelector('section.summary p').textContent)
    .toEqual('This module provides a portable way of using operating system dependent functionality');
  });

  it('displays the first two members in the member section', () => {
    const dts = element.querySelectorAll('section.top-members dt');
    const dds = element.querySelectorAll('section.top-members dd');

    expect(dts.length).toEqual(2);
    expect(dds.length).toEqual(2);

    expect(dts[0].textContent).toEqual('spawnvp()');
    expect(dts[1].textContent).toEqual('WSTOPSIG()');
  });

  it('displays the show more link', () => {
    const link = element.querySelector('section.top-members a');

    expect(link.textContent).toEqual('See 228 more methods');
  });

  describe('when the module has no members', () => {
    beforeEach(() => {
      json = require('../fixtures/module-with-no-members.json');
      element.setData(json);
    });

    it('does not render a members section', () => {
      expect(element.querySelector('section.top-members')).not.toExist();
    });
  });

  describe('when the module has exactly two members', () => {
    beforeEach(() => {
      json = require('../fixtures/module-with-two-members.json');
      element.setData(json);
    });

    it('does not render the show more link', () => {
      const link = element.querySelector('section.top-members a');

      expect(link).not.toExist();
    });
  });
});
