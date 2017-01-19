'use strict';

const {CompositeDisposable} = require('atom');
const KiteApp = require('./kite-app');

const NotificationsCenter = {
  init() {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(KiteApp.onDidChangeState(state => {
      console.log(state);
    }));
  },

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
  },
};

module.exports = NotificationsCenter;
