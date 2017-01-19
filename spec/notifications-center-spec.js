'use strict';

// const {StateController} = require('kite-installer');
const NotificationsCenter = require('../lib/notifications-center');
const KiteApp = require('../lib/kite-app');
const {
  fakeKiteInstallPaths, withKiteNotReachable, withKiteNotRunning,
  withKiteNotAuthenticated, withKiteWhitelistedPaths,
} = require('./spec-helpers');

describe('NotificationsCenter', () => {
  let app, notifications, notificationsPkg, workspaceElement;

  fakeKiteInstallPaths();

  beforeEach(() => {
    app = new KiteApp();
    notifications = new NotificationsCenter(app);
    workspaceElement = atom.views.getView(atom.workspace);

    waitsForPromise(() =>
      atom.packages.activatePackage('notifications').then(pkg => {
        notificationsPkg = pkg.mainModule;
        notificationsPkg.initializeIfNotInitialized();
      }));
  });

  afterEach(() => {
    notificationsPkg.lastNotification = null;
    atom.notifications.clear();
    notifications.dispose();
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
          waitsForPromise(() => app.connect());
          waitsFor(() =>
            workspaceElement.querySelector('atom-notification'));
        });
      });

      withKiteNotRunning(() => {
        it('notifies the user', () => {
          waitsForPromise(() => app.connect());
          waitsFor(() =>
            workspaceElement.querySelector('atom-notification'));
        });
      });

      withKiteNotReachable(() => {
        it('notifies the user', () => {
          waitsForPromise(() => app.connect());
          waitsFor(() =>
            workspaceElement.querySelector('atom-notification'));
        });
      });

      withKiteNotAuthenticated(() => {
        it('notifies the user', () => {
          waitsForPromise(() => app.connect());
          waitsFor(() =>
            workspaceElement.querySelector('atom-notification'));
        });
      });

      withKiteWhitelistedPaths(() => {
        it('does not notify the user', () => {
          waitsForPromise(() => app.connect());
          waitsFor(() =>
            workspaceElement.querySelector('atom-notification'));
        });
      });

      withKiteWhitelistedPaths([__dirname], () => {
        beforeEach(() => {
          atom.project.setPaths([__dirname]);
        });

        it('notifies the user', () => {
          waitsForPromise(() => app.connect().then(() => {
            expect(workspaceElement.querySelector('atom-notification')).not.toExist();
          }));
        });
      });
    });
  });
});
