'use strict';

const {Emitter} = require('atom');
const {StateController, AccountManager} = require('kite-installer');

const ATTEMPTS = 30;
const INTERVAL = 2500;

class KiteApp {
  constructor() {
    this.emitter = new Emitter();
  }

  onDidChangeState(listener) {
    return this.emitter.on('did-change-state', listener);
  }

  onKiteReady(listener) {
    return this.emitter.on('kite-ready', listener);
  }

  onWillDownload(listener) {
    return this.emitter.on('will-download', listener);
  }

  onDidDownload(listener) {
    return this.emitter.on('did-download', listener);
  }

  onDidFailDownload(listener) {
    return this.emitter.on('did-fail-download', listener);
  }

  onWillInstall(listener) {
    return this.emitter.on('will-install', listener);
  }

  onDidInstall(listener) {
    return this.emitter.on('did-install', listener);
  }

  onDidFailInstall(listener) {
    return this.emitter.on('did-fail-install', listener);
  }

  onWillStart(listener) {
    return this.emitter.on('will-start', listener);
  }

  onDidStart(listener) {
    return this.emitter.on('did-start', listener);
  }

  onDidFailStart(listener) {
    return this.emitter.on('did-fail-start', listener);
  }

  onWillAuthenticate(listener) {
    return this.emitter.on('will-authenticate', listener);
  }

  onDidAuthenticate(listener) {
    return this.emitter.on('did-authenticate', listener);
  }

  onDidFailAuthenticate(listener) {
    return this.emitter.on('did-fail-authenticate', listener);
  }

  onWillWhitelist(listener) {
    return this.emitter.on('will-whitelist', listener);
  }

  onDidWhitelist(listener) {
    return this.emitter.on('did-whitelist', listener);
  }

  onDidFailWhitelist(listener) {
    return this.emitter.on('did-fail-whitelist', listener);
  }

  reset() {
    delete this.previousState;
    delete this.ready;
  }

  connect() {
    const [path] = atom.project.getPaths();

    return this.checkPath(path);
  }

  install() {
    this.emitter.emit('will-download');
    return StateController.downloadKite({
      onDownload: () => this.emitter.emit('did-download'),
      onInstallStart: () => this.emitter.emit('will-install'),
    })
    .then(() => this.emitter.emit('did-install'))
    .catch(err => {
      switch (err.type) {
        case 'bad_status':
        case 'curl_error':
          this.emitter.emit('did-fail-download', err);
          break;
        default:
          this.emitter.emit('did-fail-install', err);
      }
    });
  }

  start() {
    this.emitter.emit('will-start');
    return StateController.runKiteAndWait(ATTEMPTS, INTERVAL)
    .then(() => this.emitter.emit('did-start'))
    .catch(err => this.emitter.emit('did-fail-start', err));
  }

  authenticate(data) {
    this.emitter.emit('will-authenticate', data);
    return AccountManager.login(data)
    .then(() => this.emitter.emit('did-authenticate', data))
    .catch(err => this.emitter.emit('did-fail-authenticate', err));
  }

  whitelist(path) {
    this.emitter.emit('will-whitelist', path);
    return StateController.whitelistPath(path)
    .then(() => this.emitter.emit('did-whitelist', path))
    .catch(err => this.emitter.emit('did-fail-whitelist', err));
  }

  checkPath(path) {
    return StateController.handleState(path).then(state => {
      if (state !== this.previousState) {
        this.emitter.emit('did-change-state', state);
        this.previousState = state;

        if (state === StateController.STATES.WHITELISTED && !this.ready) {
          this.emitter.emit('kite-ready');
          this.ready = true;
        }
      }

      return state;
    });
  }
}

module.exports = KiteApp;
