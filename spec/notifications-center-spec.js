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
          waitsForPromise(() => app.connect().then(() => {
            const notificationElement = workspaceElement.querySelector('atom-notification');
            const notification = notificationElement.getModel();
            const options = notification.getOptions();

            expect(notificationElement).toExist();

            expect(notification.getType()).toEqual('warning');
            expect(notification.getMessage())
            .toEqual("Kite doesn't support your OS");

            expect(options.buttons).toBeUndefined();
            expect(options.dismissable).toBeTruthy();
            expect(options.description)
            .toEqual('Sorry, the Kite autocomplete engine only supports macOS at the moment.');
          }));
        });
      });

      withKiteNotRunning(() => {
        it('notifies the user', () => {
          waitsForPromise(() => app.connect().then(() => {
            const notificationElement = workspaceElement.querySelector('atom-notification');
            // const notification = notificationElement.getModel();

            expect(notificationElement).toExist();
          }));
        });
      });

      withKiteNotReachable(() => {
        it('notifies the user', () => {
          waitsForPromise(() => app.connect().then(() => {
            const notificationElement = workspaceElement.querySelector('atom-notification');
            // const notification = notificationElement.getModel();

            expect(notificationElement).toExist();
          }));
        });
      });

      withKiteNotAuthenticated(() => {
        it('notifies the user', () => {
          waitsForPromise(() => app.connect().then(() => {
            const notificationElement = workspaceElement.querySelector('atom-notification');
            // const notification = notificationElement.getModel();

            expect(notificationElement).toExist();
          }));
        });
      });

      withKiteWhitelistedPaths(() => {
        it('notifies the user', () => {
          waitsForPromise(() => app.connect().then(() => {
            const notificationElement = workspaceElement.querySelector('atom-notification');
            // const notification = notificationElement.getModel();

            expect(notificationElement).toExist();
          }));
        });
      });

      withKiteWhitelistedPaths([__dirname], () => {
        beforeEach(() => {
          atom.project.setPaths([__dirname]);
        });

        it('does not notify the user', () => {
          waitsForPromise(() => app.connect().then(() => {
            expect(workspaceElement.querySelector('atom-notification')).not.toExist();
          }));
        });
      });
    });
  });

  describe('when there is no python file open', () => {
    beforeEach(() => {
      waitsForPromise(() => atom.workspace.open('variable.json'));
    });

    describe('when kite is not installed', () => {
      it('does not notify the user', () => {
        waitsForPromise(() => app.connect().then(() => {
          expect(workspaceElement.querySelector('atom-notification')).not.toExist();
        }));
      });
    });

    withKiteNotRunning(() => {
      it('does not notify the user', () => {
        waitsForPromise(() => app.connect().then(() => {
          expect(workspaceElement.querySelector('atom-notification')).not.toExist();
        }));
      });
    });

    withKiteNotReachable(() => {
      it('does not notify the user', () => {
        waitsForPromise(() => app.connect().then(() => {
          expect(workspaceElement.querySelector('atom-notification')).not.toExist();
        }));
      });
    });

    withKiteNotAuthenticated(() => {
      it('does not notify the user', () => {
        waitsForPromise(() => app.connect().then(() => {
          expect(workspaceElement.querySelector('atom-notification')).not.toExist();
        }));
      });
    });

    withKiteWhitelistedPaths(() => {
      it('does not notify the user', () => {
        waitsForPromise(() => app.connect().then(() => {
          expect(workspaceElement.querySelector('atom-notification')).not.toExist();
        }));
      });
    });

    withKiteWhitelistedPaths([__dirname], () => {
      beforeEach(() => {
        atom.project.setPaths([__dirname]);
      });

      it('does not notify the user', () => {
        waitsForPromise(() => app.connect().then(() => {
          expect(workspaceElement.querySelector('atom-notification')).not.toExist();
        }));
      });
    });
  });
});
