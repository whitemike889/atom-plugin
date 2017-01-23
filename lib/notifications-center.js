'use strict';

const {CompositeDisposable, Emitter} = require('atom');
const {StateController: {STATES}} = require('kite-installer');
const metrics = require('./metrics.js');

class NotificationsCenter {
  get NOTIFIERS() {
    return {
      [STATES.UNSUPPORTED]: 'warnNotSupported',
      [STATES.UNINSTALLED]: 'warnNotInstalled',
      [STATES.INSTALLED]: 'warnNotRunning',
      [STATES.RUNNING]: 'warnNotReachable',
      [STATES.REACHABLE]: 'warnNotAuthenticated',
      [STATES.AUTHENTICATED]: 'warnNotWhitelisted',
    };
  }

  get NOTIFICATION_METRICS() {
    return {
      [STATES.UNSUPPORTED]: 'not-supported',
      [STATES.UNINSTALLED]: 'not-installed',
      [STATES.INSTALLED]: 'not-running',
      [STATES.RUNNING]: 'not-reachable',
      [STATES.REACHABLE]: 'not-authenticated',
      [STATES.AUTHENTICATED]: 'not-whitelisted',
    };
  }

  constructor(app) {
    this.app = app;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.lastRejected = {};

    this.subscriptions.add(app.onDidChangeState(state => {
      if (this.shouldNotify(state)) { this.notify(state); }
    }));
  }

  onDidNotify(listener) {
    return this.emitter.on('did-notify', listener);
  }

  onDidRejectNotification(listener) {
    return this.emitter.on('did-reject-notification', listener);
  }

  onDidDismissNotification(listener) {
    return this.emitter.on('did-dismiss-notification', listener);
  }

  onDidClickNotificationButton(listener) {
    return this.emitter.on('did-click-notification-button', listener);
  }

  dispose() {
    this.subscriptions.dispose();
    this.emitter.dispose();
    delete this.app;
    delete this.subscriptions;
    delete this.emitter;
  }

  notify(state) {
    this[this.NOTIFIERS[state]] && this[this.NOTIFIERS[state]](state);
  }

  warnNotSupported(state) {
    this.instrumentNotification(
      state,
      atom.notifications.addError(
        "Kite doesn't support your OS", {
          description: 'Sorry, the Kite autocomplete engine only supports macOS at the moment.',
          icon: 'circle-slash',
          dismissable: true,
        }));
  }

  warnNotInstalled(state) {
    if (this.app.wasInstalledOnce()) {
      metrics.track('kite manually uninstalled - no notification');
    } else {
      this.instrumentNotification(
        state,
        atom.notifications.addWarning(
          'The Kite autocomplete engine is not installed', {
            description: 'Install Kite to get Python completions, documentation, and examples.',
            icon: 'circle-slash',
            dismissable: true,
            buttons: [{
              text: 'Install Kite',
              metric: 'install',
              onDidClick: dismiss => {
                dismiss();
                this.app.install();
              },
            }],
          }));
    }
  }

  warnNotRunning(state) {
    this.instrumentNotification(
      state,
      atom.notifications.addWarning(
        'The Kite autocomplete engine is not running', {
          description: 'Start the Kite background service to get Python completions, documentation, and examples.',
          icon: 'circle-slash',
          dismissable: true,
          buttons: [{
            text: 'Start Kite',
            metric: 'start',
            onDidClick: dismiss => {
              dismiss();
              this.app.start().catch(err => this.warnFailedStart(err));
            },
          }],
        }));
  }

  warnFailedStart(err) {
    this.instrumentNotification(
      'launch',
      atom.notifications.addError(
        'Unable to start Kite autocomplete engine', {
          description: JSON.stringify(err),
          dismissable: true,
          buttons: [{
            text: 'Retry',
            metric: 'retry',
            onDidClick: dismiss => {
              dismiss();
              this.app.start().catch(err => this.warnFailedStart(err));
            },
          }],
        }));
  }

  warnNotReachable(state) {
    this.instrumentNotification(
      state,
      atom.notifications.addError(
        'The Kite background service is running but not reachable', {
          description: 'Try killing Kite from the Activity Monitor.',
          dismissable: true,
        }));
  }

  warnNotAuthenticated(state) {
    this.instrumentNotification(
      state,
      atom.notifications.addWarning(
        'You need to login to the Kite autocomplete engine', {
          description: [
            'Kite needs to be authenticated, so that it can', 'access the index of your code stored on the cloud.',
          ].join(' '),
          icon: 'circle-slash',
          dismissable: true,
          buttons: [{
            text: 'Login',
            metric: 'login',
            onDidClick: dismiss => {
              dismiss();
              this.app.login();
            },
          }],
        }));
  }

  warnNotWhitelisted(state) {
    atom.notifications.addWarning('dummy');
  }

  shouldNotify(state) {
    return this.hasPythonFileOpen();
  }

  hasPythonFileOpen() {
    return atom.workspace.getTextEditors().some(e => /\.py$/.test(e.getPath() || ''));
  }

  /**
   * Takes a state/label and a notification and it'll add all the
   * tracking as well as monitoring the triggering of actions in
   * the notification.
   */
  instrumentNotification(state, notification) {
    const options = notification.getOptions();
    const type = notification.getType();
    const metric = typeof state === 'number'
      ? this.NOTIFICATION_METRICS[state]
      : state;

    this.emitter.emit('did-notify', {
      notification: metric, type,
    });

    let actionTriggered = false;

    if (options.buttons) {
      options.buttons.forEach(button => {
        const {onDidClick} = button;
        button.onDidClick = () => {
          actionTriggered = true;
          this.emitter.emit('did-click-notification-button', {
            button: button.metric,
            notification: metric,
            type,
          });
          onDidClick && onDidClick(() => notification.dismiss());
        };
      });
    }

    const sub = notification.onDidDismiss(() => {
      if (actionTriggered) {
        this.emitter.emit('did-dismiss-notification', {
          notification: metric, type,
        });
      } else {
        this.lastRejected[state] = new Date();
        this.emitter.emit('did-reject-notification', {
          notification: metric, type,
        });
      }
      sub.dispose();
    });

  }
}

module.exports = NotificationsCenter;
