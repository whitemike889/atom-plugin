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

  constructor(app) {
    this.app = app;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(app.onDidChangeState(state => {
      if (this.shouldNotify(state)) { this.notify(state); }
    }));
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

  shouldNotify(state) {
    return this.hasPythonFileOpen();
  }

  hasPythonFileOpen() {
    return atom.workspace.getTextEditors().some(e => /\.py$/.test(e.getPath() || ''));
  }

  warnNotSupported(state) {
    metrics.track('not-supported warning shown');
    atom.notifications.addError(
      "Kite doesn't support your OS", {
        description: 'Sorry, the Kite autocomplete engine only supports macOS at the moment.',
        icon: 'circle-slash',
        dismissable: true,
      }).onDidDismiss(() => {
        metrics.track('not-supported warning dismissed');
      });
  }
}

module.exports = NotificationsCenter;
