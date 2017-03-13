'use strict';

const {CompositeDisposable, Emitter} = require('atom');
const {Logger, StateController: {STATES}} = require('kite-installer');
const metrics = require('./metrics.js');

class NotificationsCenter {
  get NOTIFIERS() {
    return {
      [STATES.UNSUPPORTED]: 'warnNotSupported',
      // [STATES.UNINSTALLED]: 'warnNotInstalled',
      [STATES.INSTALLED]: 'warnNotRunning',
      [STATES.RUNNING]: 'warnNotReachable',
      [STATES.REACHABLE]: 'warnNotAuthenticated',
      // [STATES.AUTHENTICATED]: 'warnNotWhitelisted',
      // [STATES.WHITELISTED]: 'notifyReady',
    };
  }

  get NOTIFICATION_METRICS() {
    return {
      [STATES.UNSUPPORTED]: 'not-supported',
      // [STATES.UNINSTALLED]: 'not-installed',
      [STATES.INSTALLED]: 'not-running',
      [STATES.RUNNING]: 'not-reachable',
      [STATES.REACHABLE]: 'not-authenticated',
      // [STATES.AUTHENTICATED]: 'not-whitelisted',
      // [STATES.WHITELISTED]: 'ready',
    };
  }

  constructor(app) {
    this.app = app;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.lastShown = {};

    this.subscriptions.add(app.onDidGetState(state => {
      if (this.shouldNotify(state)) { this.notify(state); }
    }));

    this.subscriptions.add(app.onDidGetUnauthorized(err => {
      this.warnUnauthorized(err);
    }));

    this.subscriptions.add(app.onDidFailWhitelist(err => {
      this.warnWhitelistFailure(err);
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

  activateForcedNotifications() {
    this.forceNotification = true;
  }

  deactivateForcedNotifications() {
    this.forceNotification = false;
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
    this.instrumentNotification(atom.notifications.addError(
      "Kite doesn't support your OS", {
        metric: state,
        description: 'Sorry, the Kite engine only supports macOS at the moment.',
        icon: 'circle-slash',
        dismissable: true,
      }));
  }

  warnNotInstalled(state) {
    if (this.app.wasInstalledOnce()) {
      metrics.track('kite manually uninstalled - no notification');
    } else {
      this.instrumentNotification(atom.notifications.addWarning(
        'The Kite engine is not installed', {
          metric: state,
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
    this.instrumentNotification(atom.notifications.addWarning(
      'The Kite engine is not running', {
        metric: state,
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
    this.instrumentNotification(atom.notifications.addError(
      'Unable to start Kite engine', {
        metric: 'launch',
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
    this.instrumentNotification(atom.notifications.addError(
      'The Kite background service is running but not reachable', {
        metric: state,
        description: 'Try killing Kite from the Activity Monitor.',
        dismissable: true,
      }));
  }

  warnNotAuthenticated(state) {
    this.instrumentNotification(atom.notifications.addWarning(
      'You need to login to the Kite engine', {
        metric: state,
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

  warnUnauthorized(err) {
    this.instrumentNotification(atom.notifications.addError(
      'Unable to login', {
        metric: 'unauthorized',
        description: JSON.stringify(err),
        dismissable: true,
        buttons: [{
          text: 'Retry',
          metric: 'retry',
          onDidClick: dismiss => {
            dismiss();
            this.app.login();
          },
        }],
      }));
  }

  warnNotWhitelisted(editor, root) {
    const basepath = editor.getPath();
    const done = () => {
      this.preventBlacklistOnDismiss = false;
      delete this.lastWhitelistNotification;
    };

    if (this.lastWhitelistNotification) {
      this.preventBlacklistOnDismiss = true;
      this.lastWhitelistNotification.dismiss();
    }

    this.lastWhitelistNotification = this.instrumentNotification(atom.notifications.addWarning(
      `The Kite engine is disabled for ${basepath}`, {
        metric: STATES.AUTHENTICATED,
        key: editor.getPath(),
        description: 'Would you like to enable Kite for Python files in:',
        icon: 'circle-slash',
        dismissable: true,
        buttons: [{
          text: 'Settings',
          metric: 'whitelist settings',
          className: 'btn btn-default pull-right',
          onDidClick: dismiss => {
            done();
            dismiss();
            const url = `http://local.kite.com:46624/settings/permissions?filename=${editor.getPath()}&action=blacklist`;
            atom.applicationDelegate.openExternal(url);
          },
        }, {
          text: this.truncateLeft(root, 25),
          metric: 'enable root',
          onDidClick: dismiss => {
            done();
            dismiss();
            this.app.whitelist(root);
          },
        }, {
          text: 'Browse…',
          metric: 'pick directory',
          onDidClick: dismiss => {
            done();
            atom.applicationDelegate.pickFolder((res) => {
              let p;
              if (res && Array.isArray(res)) { [p] = res; } else { p = res; }

              if (p) {
                metrics.track('directory picked (via not-whitelisted warning)', {dir: p});
                dismiss();
                this.app.whitelist(p);
              } else {
                metrics.track('directory pick cancelled (via not-whitelisted warning)');
              }
            });
          },
        }],
      }), () => {
      if (!this.preventBlacklistOnDismiss) {
        this.app.blacklist(basepath, true);
      }
      done();
    });
  }

  warnWhitelistFailure(err) {
    const state = err.data || 0;
    const dirpath = err.path;

    if (state >= STATES.WHITELISTED) {
      Logger.warn(`whitelist failed because dir is already whitelisted (state ${state})`);
      return;
    }

    // show an error notification with an option to retry
    this.instrumentNotification(atom.notifications.addError(
      `Unable to enable Kite for ${dirpath}`, {
        metric: 'whitelisting-failed',
        description: JSON.stringify(err),
        dismissable: true,
        buttons: [{
          text: 'Retry',
          metric: 'retry',
          onDidClick: dismiss => {
            dismiss();
            this.app.whitelist(dirpath);
          },
        }],
      }));
  }

  notifyReady(state) {
    this.instrumentNotification(atom.notifications.addSuccess(
      'The Kite engine is ready', {
        metric: state,
        metricType: 'notification',
        description: 'We checked that the autocomplete engine is installed, running, responsive, and authenticated.',
        dismissable: true,
      }));
  }

  shouldNotify(key) {
    return this.forceNotification ||
          (this.app.hasActiveSupportedFile() && !this.lastShown[key]);
  }

  /**
   * Takes a state/label and a notification and it'll add all the
   * tracking as well as monitoring the triggering of actions in
   * the notification.
   */
  instrumentNotification(notification, dismissCallback) {
    const options = notification.getOptions();
    const type = options.metricType || notification.getType();
    const metric = typeof options.metric === 'number'
      ? this.NOTIFICATION_METRICS[options.metric]
      : options.metric;

    this.emit('did-notify', {
      notification: metric, type,
    });

    let actionTriggered = false;

    if (options.buttons) {
      options.buttons.forEach(button => {
        const {onDidClick} = button;
        button.onDidClick = () => {
          actionTriggered = true;
          this.emit('did-click-notification-button', {
            button: button.metric,
            notification: metric,
            type,
          });
          onDidClick && onDidClick(() => notification.dismiss());
        };
      });
    }
    this.lastShown[options.key || options.metric] = new Date();

    const sub = notification.onDidDismiss(() => {
      if (actionTriggered) {
        this.emit('did-dismiss-notification', {
          notification: metric, type,
        });
      } else {
        dismissCallback && dismissCallback();
        this.emit('did-reject-notification', {
          notification: metric, type,
        });
      }
      sub.dispose();
    });

    return notification;
  }

  emit(...args) {
    this.emitter && this.emitter.emit(...args);
  }

  truncateLeft(string, length) {
    return string.length <= length
      ? string
      : `…${string.slice(string.length - length)}`;
  }
}

module.exports = NotificationsCenter;
