'use strict';

const {StateController, AccountManager} = require('kite-installer');
const KiteApp = require('../lib/kite-app');
const {fakeKiteInstallPaths, withKiteNotReachable, withKiteNotRunning, withKiteNotAuthenticated, withKiteWhitelistedPaths} = require('./spec-helpers');

describe('KiteApp', () => {
  fakeKiteInstallPaths();

  let changeSpy, readySpy, app;
  describe('.connect()', () => {
    beforeEach(() => {
      changeSpy = jasmine.createSpy();
      readySpy = jasmine.createSpy();
      app = new KiteApp();

      app.onDidChangeState(changeSpy);
      app.onKiteReady(readySpy);
    });

    describe('when kite is not installed', () => {
      it('returns a promise that is resolved with UNINSTALLED state', () => {
        waitsForPromise(() => app.connect().then(state => {
          expect(state).toEqual(StateController.STATES.UNINSTALLED);
          expect(changeSpy)
          .toHaveBeenCalledWith(StateController.STATES.UNINSTALLED);

          expect(readySpy).not.toHaveBeenCalled();
        }));
      });
    });

    withKiteNotRunning(() => {
      it('returns a promise that is resolved with INSTALLED state', () => {
        waitsForPromise(() => app.connect().then(state => {
          expect(state).toEqual(StateController.STATES.INSTALLED);
          expect(changeSpy)
          .toHaveBeenCalledWith(StateController.STATES.INSTALLED);

          expect(readySpy).not.toHaveBeenCalled();
        }));
      });
    });

    withKiteNotReachable(() => {
      it('returns a promise that is resolved with RUNNING state', () => {
        waitsForPromise(() => app.connect().then(state => {
          expect(state).toEqual(StateController.STATES.RUNNING);
          expect(changeSpy)
          .toHaveBeenCalledWith(StateController.STATES.RUNNING);

          expect(readySpy).not.toHaveBeenCalled();
        }));
      });
    });

    withKiteNotAuthenticated(() => {
      it('returns a promise that is resolved with REACHABLE state', () => {
        waitsForPromise(() => app.connect().then(state => {
          expect(state).toEqual(StateController.STATES.REACHABLE);
          expect(changeSpy)
          .toHaveBeenCalledWith(StateController.STATES.REACHABLE);

          expect(readySpy).not.toHaveBeenCalled();
        }));
      });
    });

    withKiteWhitelistedPaths(() => {
      it('returns a promise that is resolved with AUTHENTICATED state', () => {
        waitsForPromise(() => app.connect().then(state => {
          expect(state).toEqual(StateController.STATES.AUTHENTICATED);
          expect(changeSpy)
          .toHaveBeenCalledWith(StateController.STATES.AUTHENTICATED);

          expect(readySpy).not.toHaveBeenCalled();
        }));
      });
    });

    withKiteWhitelistedPaths([__dirname], () => {
      beforeEach(() => {
        atom.project.setPaths([__dirname]);
      });

      it('returns a promise that is resolved with WHITELISTED state', () => {
        waitsForPromise(() => app.connect().then(state => {
          expect(state).toEqual(StateController.STATES.WHITELISTED);
          expect(changeSpy)
          .toHaveBeenCalledWith(StateController.STATES.WHITELISTED);

          expect(readySpy).toHaveBeenCalled();
        }));
      });

      it('nevers trigger the kite ready event twice', () => {
        waitsForPromise(() => app.connect());
        waitsForPromise(() => app.checkPath('/path/to/dir'));
        waitsForPromise(() => app.checkPath(__dirname));
        runs(() => {
          expect(readySpy.callCount).toEqual(1);
        });
      });
    });
  });

  describe('.install()', () => {
    beforeEach(() => {
      spyOn(StateController, 'downloadKite').andCallFake(() => Promise.resolve());
    });

    it('calls the StateController.downloadKite method', () => {
      app.install();

      expect(StateController.downloadKite).toHaveBeenCalled();
    });
  });

  describe('.start()', () => {
    beforeEach(() => {
      spyOn(StateController, 'runKiteAndWait').andCallFake(() => Promise.resolve());
    });

    it('calls the StateController.runKiteAndWait method', () => {
      app.start();

      expect(StateController.runKiteAndWait).toHaveBeenCalledWith(30, 2500);
    });
  });

  describe('.authenticate()', () => {
    beforeEach(() => {
      spyOn(AccountManager, 'login').andCallFake(() => Promise.resolve());
    });

    it('calls the AccountManager.login method', () => {
      const data = {};

      app.authenticate(data);

      expect(AccountManager.login).toHaveBeenCalledWith(data);
    });
  });

  describe('.whitelist()', () => {
    beforeEach(() => {
      spyOn(StateController, 'whitelistPath').andCallFake(() => Promise.resolve());
    });

    it('calls the StateController.whitelistPath method', () => {
      const path = '/path/to/other/dir/';

      app.whitelist(path);

      expect(StateController.whitelistPath).toHaveBeenCalledWith(path);
    });
  });
});
