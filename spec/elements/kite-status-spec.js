'use struct';

const KiteApp = require('../../lib/kite-app');
const KiteStatus = require('../../lib/elements/kite-status');
const {fakeKiteInstallPaths, withKiteNotReachable, withKiteNotRunning, withKiteNotAuthenticated, withKiteWhitelistedPaths} = require('../spec-helpers');

describe('KiteStatus', () => {
  fakeKiteInstallPaths();

  let status;

  beforeEach(() => {
    status = new KiteStatus();
  });

  it('starts in an unknown state', () => {
    expect(status.getAttribute('status')).toEqual('unknown');
  });

  describe('when kite is not installed', () => {
    it('cjhanges its status to UNINSTALLED', () => {
      waitsForPromise(() => KiteApp.connect().then(() => {
        expect(status.getAttribute('status')).toEqual('uninstalled');
      }));
    });
  });

  withKiteNotRunning(() => {
    it('cjhanges its status to INSTALLED', () => {
      waitsForPromise(() => KiteApp.connect().then(() => {
        expect(status.getAttribute('status')).toEqual('installed');
      }));
    });
  });

  withKiteNotReachable(() => {
    it('cjhanges its status to RUNNING', () => {
      waitsForPromise(() => KiteApp.connect().then(() => {
        expect(status.getAttribute('status')).toEqual('running');
      }));
    });
  });

  withKiteNotAuthenticated(() => {
    it('cjhanges its status to REACHABLE', () => {
      waitsForPromise(() => KiteApp.connect().then(() => {
        expect(status.getAttribute('status')).toEqual('reachable');
      }));
    });
  });

  withKiteWhitelistedPaths(() => {
    it('cjhanges its status to AUTHENTICATED', () => {
      waitsForPromise(() => KiteApp.connect().then(() => {
        expect(status.getAttribute('status')).toEqual('authenticated');
      }));
    });
  });

  withKiteWhitelistedPaths([__dirname], () => {
    beforeEach(() => {
      atom.project.setPaths([__dirname]);
    });

    it('cjhanges its status to WHITELISTED', () => {
      waitsForPromise(() => KiteApp.connect().then(() => {
        expect(status.getAttribute('status')).toEqual('whitelisted');
      }));
    });

  });
});
