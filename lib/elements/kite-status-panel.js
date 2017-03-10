'use strict';

require('./kite-logo');

// const {Emitter, CompositeDisposable} = require('atom');
// const {DisposableEvent} = require('../utils');
const {StateController: {STATES}} = require('kite-installer');
const Plan = require('../plan');

const dot = '<span class="dot">•</span>';

const pluralize = (n, singular, plural) => n === 1 ? singular : plural;

class KiteStatusPanel extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-status-panel', {
      prototype: this.prototype,
    });
  }

  setApp(app) {
    this.app = app;
  }

  show(target) {
    return Promise.all([
      Plan.queryPlan().catch(() => null),
      this.app.connect(),
    ])
    .then(([plan, status]) => {
      // plan.active_subscrition = 'pro';
      // plan.status = 'trialing';
      // plan.trial_days_remaining = 3;

      this.render(plan, status);

      document.body.appendChild(this);

      const box = target.getBoundingClientRect();

      this.style.cssText = `
        top: ${Math.round(box.top - 20)}px;
        left: ${Math.round(box.right)}px;
      `;
    });
  }

  render(plan, status) {
    this.innerHTML = `
      ${this.renderSubscription(plan)}
      ${this.renderStatus(status)}
    `;
  }

  renderStatus(status) {
    let content = '';
    switch (status) {
      case STATES.UNSUPPORTED:
        content = `<div class="text-danger">Kite engine is not available on your system ${dot}</div>`;
        break;

      case STATES.UNINSTALLED:
        content = `
          <div class="text-danger">Kite engine is not installed ${dot}</div>
          <a href="kite-atom-internal://install" class="btn btn-error">Install now</a>
        `;
        break;
      case STATES.INSTALLED:
        content = `
          <div class="text-danger">Kite engine is not running ${dot}</div>
          <a href="kite-atom-internal://install" class="btn btn-error">Launch now</a>
        `;
        break;
      case STATES.RUNNING:
        content = `
          <div class="text-danger">Kite engine is not reachable</div>
        `;
        break;
      case STATES.REACHABLE:
        content = `
          <div class="text-danger">Kite engine is not logged in ${dot}</div>
          <a href="kite-atom-internal://install" class="btn btn-error">Login now</a>
        `;
        break;
      case STATES.AUTHENTICATED:
        content = `
          <div class="ready">Kite engine is ready and working ${dot}</div>
        `;
        break;
    }

    return `<div class="status">${content}</div>`;
  }

  renderSubscription(plan) {
    if (!plan) { return ''; }

    let leftSide = '';
    let rightSide = '';

    const isPro = plan.active_subscrition === 'pro';
    const isActive = plan.status === 'active';
    const isTrialing = plan.status === 'trialing';
    const startedTrial = plan.started_kite_pro_trial;

    if (!isPro && isActive) {
      leftSide = '<kite-logo></kite-logo> Kite Basic';

      if (startedTrial) {
        rightSide = '<a href="https://alpha.kite.com/pro">Upgrade</a>';
      } else {
        rightSide = '<a href="https://alpha.kite.com/pro">Start Pro trial</a>';
      }
    } else if (isPro) {
      leftSide = '<kite-logo></kite-logo><span class="pro-badge">pro</span>';

      if (isTrialing) {
        const remains = [
          'Trial:',
          plan.trial_days_remaining,
          pluralize(plan.trial_days_remaining, 'day', 'days'),
          'left',
        ].join(' ');

        if (plan.trial_days_remaining < 5) {
          leftSide += `<span class="text-danger">${remains}</span>`;
        } else {
          leftSide += `<span>${remains}</span>`;
        }

        rightSide = '<a href="https://alpha.kite.com/pro">Upgrade</a>';
      } else {
        rightSide = '<a href="https://alpha.kite.com/pro">Account</a>';
      }
    }

    return `<div class="split-line">
      <div class="left">${leftSide}</div>
      <div class="right">${rightSide}</div>
    </div>`;
  }
}

module.exports = KiteStatusPanel.initClass();
