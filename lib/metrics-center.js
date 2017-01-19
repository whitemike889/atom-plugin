'use strict';

const {CompositeDisposable} = require('atom');
const metrics = require('./metrics.js');
const KiteApp = require('./kite-app');

const MetricsCenter = {
  init() {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(KiteApp.onWillDownload(() => {
      metrics.track('download-and-install started');
    }));
    this.subscriptions.add(KiteApp.onDidDownload(() => {
      metrics.track('download succeeded');
    }));
    this.subscriptions.add(KiteApp.onDidFailDownload(err => {
      metrics.track('download failed', err);
    }));
    this.subscriptions.add(KiteApp.onWillInstall(() => {
      metrics.track('install started');
    }));
    this.subscriptions.add(KiteApp.onDidInstall(() => {
      metrics.track('download-and-install succeeded');
    }));
    this.subscriptions.add(KiteApp.onDidFailInstall(err => {
      metrics.track('install failed', err);
    }));
    this.subscriptions.add(KiteApp.onWillStart(() => {
      metrics.track('launch started');
    }));
    this.subscriptions.add(KiteApp.onDidStart(() => {
      metrics.track('launch succeeded');
    }));
    this.subscriptions.add(KiteApp.onDidFailStart(err => {
      metrics.track('launch failed', err);
    }));
    this.subscriptions.add(KiteApp.onWillAuthenticate(({email}) => {
      metrics.track('authentication started', {email});
    }));
    this.subscriptions.add(KiteApp.onDidAuthenticate(({email}) => {
      metrics.track('authentication succeeded', {email});
    }));
    this.subscriptions.add(KiteApp.onDidFailAuthenticate(err => {
      metrics.track('authentication failed', err);
    }));
    this.subscriptions.add(KiteApp.onWillWhitelist(path => {
      metrics.track('whitelisting started', {dir: path});
    }));
    this.subscriptions.add(KiteApp.onDidWhitelist(path => {
      metrics.track('whitelisting succeeded', {dir: path});
    }));
    this.subscriptions.add(KiteApp.onDidFailWhitelist(err => {
      metrics.track('whitelisting failed', {dir: err.content});
    }));
  },

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
  },
};

module.exports = MetricsCenter;
