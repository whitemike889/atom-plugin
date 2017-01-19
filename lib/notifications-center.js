'use strict';

const {CompositeDisposable} = require('atom');
const {StateController: {STATES}} = require('kite-installer');

class NotificationsCenter {
  constructor(app) {
    this.app = app;
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(app.onDidChangeState(state => {
      if (state !== STATES.WHITELISTED) {
        const notif = atom.notifications.addWarning('Hello');
        console.log(notif);
      }
    }));
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.app;
  }
}

module.exports = NotificationsCenter;
