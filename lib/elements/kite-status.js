'use strict';

require('./kite-logo');
const {StateController: {STATES}} = require('kite-installer');
const KiteApp = require('../kite-app');

const TOOLTIPS = {
  [STATES.UNSUPPORTED]: 'Kite only supports macOS at the moment.',
  [STATES.UNINSTALLED]: 'Kite is not installed.',
  [STATES.INSTALLED]: 'Kite is not running.',
  [STATES.RUNNING]: 'Kite is running but not reachable.',
  [STATES.REACHABLE]: 'Kite is not authenticated.',
  [STATES.AUTHENTICATED]: 'Kite is not enabled for the current directory.',
  [STATES.WHITELISTED]: 'Kite is ready.',
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

class StatusItem extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-status', {prototype: this.prototype});
  }

  createdCallback() {
    this.innerHTML = '<kite-logo></kite-logo>';
    this.classList.add('inline-block');

    KiteApp.onDidChangeState(state => this.setState(state));
    this.setState(-1);
    this.tooltipText = '';
    this.tooltip = atom.tooltips.add(this, {
      title: () => this.tooltipText,
    });
  }

  setState(state) {
    if (state in STATUSES) {
      this.tooltipText = TOOLTIPS[state];
      this.setAttribute('status', STATUSES[state]);
    } else {
      this.tooltipText = `Kite is unknown state ${state}.`;
      this.setAttribute('status', 'unknown');
    }
  }

  onClick(func) {
    this.onclick = func;
  }
}

module.exports = StatusItem.initClass();
