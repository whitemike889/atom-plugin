'use strict';

// const {StateController} = require('kite-installer');
const NotificationsCenter = require('../lib/notifications-center');
const KiteApp = require('../lib/kite-app');
const {
  fakeKiteInstallPaths, withKiteNotReachable, withKiteNotRunning, withKiteNotAuthenticated, withKiteWhitelistedPaths,
} = require('./spec-helpers');

fdescribe('NotificationsCenter', () => {
  fakeKiteInstallPaths();

  beforeEach(() => {
    KiteApp.reset();
    NotificationsCenter.init();
  });

  afterEach(() => {
    NotificationsCenter.dispose();
  });

  describe('when there is a python file open', () => {
    beforeEach(() => {
      waitsForPromise(() =>
        atom.packages.activatePackage('language-python'));
      waitsForPromise(() => atom.workspace.open('sample.py'));
    });

    describe('and no notifications have been displayed before', () => {
      describe('when kite is not installed', () => {
        it('notifies the user', () => {
          waitsForPromise(() => KiteApp.connect().then(() => {
            expect(document.querySelector('atom-notification')).toExist();
          }));
        });
      });

      withKiteNotRunning(() => {
        it('notifies the user', () => {
          waitsForPromise(() => KiteApp.connect().then(() => {
            expect(document.querySelector('atom-notification')).toExist();
          }));
        });
      });

      withKiteNotReachable(() => {
        it('notifies the user', () => {
          waitsForPromise(() => KiteApp.connect().then(() => {
            expect(document.querySelector('atom-notification')).toExist();
          }));
        });
      });

      withKiteNotAuthenticated(() => {
        it('notifies the user', () => {
          waitsForPromise(() => KiteApp.connect().then(() => {
            expect(document.querySelector('atom-notification')).toExist();
          }));
        });
      });

      withKiteWhitelistedPaths(() => {
        it('does not notify the user', () => {
          waitsForPromise(() => KiteApp.connect().then(() => {
            expect(document.querySelector('atom-notification')).toExist();
          }));
        });
      });

      withKiteWhitelistedPaths([__dirname], () => {
        beforeEach(() => {
          atom.project.setPaths([__dirname]);
        });

        it('notifies the user', () => {
          waitsForPromise(() => KiteApp.connect().then(() => {
            expect(document.querySelector('atom-notification')).not.toExist();
          }));
        });
      });
    });
  });
});
