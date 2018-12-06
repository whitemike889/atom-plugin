'use strict';

const {CompositeDisposable, Disposable} = require('atom');
const KiteAPI = require('kite-api');
const urls = require('kite-api/lib/url-helpers');
const {MAX_FILE_SIZE} = require('./constants');
require('./elements/kite-logo');

const {STATES} = KiteAPI;


const TOOLTIPS = {
  [STATES.UNSUPPORTED]: 'Kite only supports macOS at the moment.',
  [STATES.UNINSTALLED]: 'Kite is not installed.',
  [STATES.INSTALLED]: 'Kite is not running.',
  [STATES.RUNNING]: 'Kite is running but not reachable.',
  [STATES.REACHABLE]: 'Kite is not authenticated.',
  [STATES.AUTHENTICATED]: '',
  [STATES.WHITELISTED]: 'Kite is ready.',
  ready: 'Kite is ready.',
  sizeExceedsLimit: 'The current file is too large for Kite to handle',
  indexing: 'Kite engine is indexing your code',
  syncing: 'Kite engine is syncing your code',
};

const STATUSES = {
  [STATES.UNSUPPORTED]: 'unsupported',
  [STATES.UNINSTALLED]: 'uninstalled',
  [STATES.INSTALLED]: 'installed',
  [STATES.RUNNING]: 'running',
  [STATES.REACHABLE]: 'reachable',
  [STATES.AUTHENTICATED]: 'authenticated',
  [STATES.WHITELISTED]: 'whitelisted',
};

const LABELS = {
  [STATES.UNSUPPORTED]: '',
  [STATES.UNINSTALLED]: 'Kite: not installed',
  [STATES.INSTALLED]: 'Kite: not running',
  [STATES.RUNNING]: '',
  [STATES.REACHABLE]: 'Kite: not logged in',
  [STATES.AUTHENTICATED]: '',
  [STATES.WHITELISTED]: '',
};

module.exports = class Status {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'kite-status';
    this.element.setAttribute('status', 'unknown');
    this.element.innerHTML = `<kite-logo small class="badge"></kite-logo>
                      <kite-logo sync></kite-logo>
                      <span class="text"></span>`;
    this.element.classList.add('inline-block');
    this.tooltipText = '';
    this.statusText = this.element.querySelector('.text');
  }

  init(K) {
    this.subscriptions = new CompositeDisposable();
    this.editors = K.getModule('editors');

    this.subscriptions.add(atom.tooltips.add(this.element, {
      title: () => this.tooltipText,
    }));

    this.startPolling();
  }

  dispose() {

  }

  getElement() {
    return this.element;
  }

  startPolling() {
    const interval = setInterval(() => this.pollStatus(), atom.config.get('kite.pollingInterval'));
    this.pollingDisposable = new Disposable(() => {
      clearInterval(interval);
    });
    this.subscriptions.add(this.pollingDisposable);
  }

  pollStatus() {
    let promise;
    if (this.editors.hasActiveSupportedFile()) {
      const editor = atom.workspace.getActiveTextEditor();
      promise = KiteAPI.requestJSON({
        path: urls.statusPath(editor.getPath()),
      })
      .then(o => {
        this.element.removeAttribute('is-syncing');
        this.element.removeAttribute('is-indexing');

        this.statusText.innerHTML = LABELS[STATES.WHITELISTED];
        this.element.setAttribute('status', STATUSES[STATES.WHITELISTED]);
        if (o.status === 'indexing') {
          this.element.setAttribute('is-indexing', '');
          this.tooltipText = TOOLTIPS.indexing;
        } else if (o.status === 'syncing') {
          this.element.setAttribute('is-syncing', '');
          this.tooltipText = TOOLTIPS.syncing;
        } else {
          if (editor.getBuffer().getLength() > MAX_FILE_SIZE) {
            this.tooltipText = TOOLTIPS.sizeExceedsLimit;
          } else {
            this.tooltipText = TOOLTIPS[STATES.WHITELISTED];
          }
        }
      })
      .catch((err) => {
        const {state} = err.data;

        this.element.removeAttribute('is-syncing');
        this.element.removeAttribute('is-indexing');

        if (state != undefined) {
          this.tooltipText = TOOLTIPS[state];
          this.statusText.innerHTML = LABELS[state];
          this.element.setAttribute('status', STATUSES[state]);
        }
      });
    } else {
      this.element.removeAttribute('is-syncing');
      this.element.removeAttribute('is-indexing');
      this.element.setAttribute('status', 'unsupported');
      this.statusText.innerHTML = '';
      promise = Promise.resolve();
    }

    return promise;

  }
};
