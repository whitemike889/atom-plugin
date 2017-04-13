'use strict';

require('./kite-logo');

const fs = require('fs');
const path = require('path');
const {CompositeDisposable, TextEditor} = require('atom');
const {DisposableEvent} = require('../utils');
const {StateController} = require('kite-installer');
const Plan = require('../plan');
const LinkScheme = require('../link-scheme');
const DataLoader = require('../data-loader');

const {STATES} = StateController;
const dot = '<span class="dot">•</span>';
const proLogoSvg = String(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'kitepro.svg')));

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

  hide() {
    if (this.parentNode) {
      this.parentNode.removeChild((this));
      this.subscriptions.dispose();
    }
  }

  pendingStatus(label) {
    const status = this.querySelector('.status');

    if (status) {
      status.innerHTML = `
      ${label}
      <span class='loading loading-spinner-small inline-block'></span>
      `;
    }
  }

  show(target) {
    return this.renderCurrent().then(() => {
      document.body.appendChild(this);

      this.setPosition(target);

      this.scheme = new LinkScheme('kite-atom-internal', this);

      this.subscriptions = new CompositeDisposable();

      this.subscriptions.add(this.scheme);

      this.subscriptions.add(this.scheme.onDidClickLink(opts => this.handleAction(opts)));

      this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(item => {
        if (item instanceof TextEditor) {
          this.renderCurrent().then(() => this.setPosition(target));
        }
      }));

      this.subscriptions.add(new DisposableEvent(window, 'resize', e => {
        this.setPosition(target);
      }));

      this.subscriptions.add(new DisposableEvent(document.body, 'click', e => {
        const {top, left, right, bottom} = this.getBoundingClientRect();
        const {pageX, pageY} = e;

        if (pageX < left || pageX > right || pageY < top || pageY > bottom) {
          this.hide();
        }
      }));
    });
  }

  pauseNotifications() {
    this.app.kite && this.app.kite.notifications.pauseNotifications();
  }

  resumeNotifications() {
    this.app.kite && this.app.kite.notifications.resumeNotifications();
  }

  handleAction({url}) {
    this.pauseNotifications();

    let promise;
    switch (url.host) {
      case 'install':
        this.pendingStatus('Installing Kite');
        promise = this.app.install();
        break;
      case 'start':
        this.pendingStatus('Launching Kite');
        promise = this.app.start();
        break;
      case 'login':
        this.pendingStatus('Login to Kite');
        promise = this.app.login();
        break;
      case 'whitelist':
        this.pendingStatus('Whitelisting path');
        promise = this.app.whitelist(url.path.replace(/^\//, ''))
        .then(() => {
          const editor = atom.workspace.getActiveTextEditor();
          const kiteEditor = this.app.kite.kiteEditorForEditor(editor);

          if (kiteEditor) {
            return kiteEditor.initialize();
          } else {
            return this.app.kite.subscribeToEditor(editor);
          }

        });
        break;
    }

    if (promise) {
      promise
      .then(() => this.renderCurrent())
      .then(() => this.resumeNotifications());
    } else {
      this.resumeNotifications();
    }
  }

  setPosition(target) {
    if (!target) { return; }

    const box = target.getBoundingClientRect();

    this.style.cssText = `
    top: ${Math.round(box.top - 20)}px;
    left: ${Math.round(box.right)}px;
    `;
  }

  renderCurrent() {
    const editor = atom.workspace.getActiveTextEditor();
    const promises = [
      Plan.queryPlan().catch(() => null),
      StateController.handleState(),
      DataLoader.getUserAccountInfo().catch(() => ({})),
    ];
    if (editor && this.app.isGrammarSupported(editor)) {
      promises.push(DataLoader.projectDirForEditor(editor).catch(() => null));
    }

    return Promise.all(promises).then(data => {
      this.render(...data);
    });
  }

  render(plan, status, account, projectDir) {
    this.innerHTML = `
      ${this.renderSubscription(plan, status)}
      ${this.renderEmailWarning(account)}
      ${this.renderLinks()}
      ${this.renderStatus(status, projectDir)}
    `;
  }

  renderLinks(plan, state) {
    let giftLink = '';

    if (!Plan.isActivePro()) {
      giftLink = `<li>
        <a href="#" class="kite-gift">Get free Pro! <i class="icon-kite-gift"></i></a>
      </li>`;
    }

    return `
    <ul class="links">
      ${giftLink}
      <li><a href="https://ga.kite.com/docs/">Search Python documentation</a></li>
      <li><a is="kite-localtoken-anchor"
         href="http://localhost:46624/settings">Settings</a></li>
      <li><a href="http://localhost:46624/settings/permissions">Permissions</a></li>
      <li><a href="http://help.kite.com/">Help</a></li>
    </ul>
    `;
  }

  renderEmailWarning(account) {
    return account.email_verified
      ? ''
      : `<div class="kite-warning-box">
        Please verify your email address

        <div class="actions">
          <a href="https://alpha.kite.com/account/resetPassword/request?email=${account.email}">Resend email</a>
        </div>
      </div>`;
  }

  renderStatus(status, projectDir) {
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
          <a href="kite-atom-internal://start" class="btn btn-error">Launch now</a>
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
          <a href="kite-atom-internal://login" class="btn btn-error">Login now</a>
        `;
        break;
      case STATES.AUTHENTICATED:
        const editor = atom.workspace.getActiveTextEditor();
        if (!editor || (editor && (!this.app.isGrammarSupported(editor) ||
            this.app.kite.isEditorWhitelisted(editor)))) {
          content = `
            <div class="ready">Kite engine is ready and working ${dot}</div>
          `;
        } else {
          const path = encodeURI(editor.getPath());
          const settingsURL = `http://localhost:46624/settings/permissions?filename=${path}`;
          content = `
            <div class="text-warning">Kite engine is not enabled for this file ${dot}</div>

            <a href="kite-atom-internal://whitelist/${projectDir}" class="btn btn-warning">Enable for ${projectDir}</a>
            <a href="${settingsURL}" class="btn btn-warning">Whitelist settings…</a>
          `;
        }

        break;
    }

    return `<div class="status">${content}</div>`;
  }

  renderSubscription(plan, status) {
    if (!plan || (status && status < STATES.AUTHENTICATED)) { return ''; }

    let leftSide = '';
    let rightSide = '';

    if (!Plan.isPro() && Plan.isActive()) {
      leftSide = '<kite-logo></kite-logo> Kite Basic';

      if (Plan.hasStartedTrial()) {
        rightSide = `<a is="kite-localtoken-anchor"
                     href="http://localhost:46624/redirect/pro">Upgrade</a>`;
      } else {
        rightSide = `<a is="kite-localtoken-anchor"
                     href="http://localhost:46624/redirect/trial">Start Pro trial</a>`;
      }
    } else if (Plan.isPro()) {
      leftSide = `<div class="pro">${proLogoSvg}</div>`;

      if (Plan.isTrialing()) {
        const days = Plan.remainingTrialDays();
        const remains = [
          'Trial:',
          days,
          pluralize(days, 'day', 'days'),
          'left',
        ].join(' ');

        if (days < 5) {
          leftSide += `<span class="kite-trial-days text-danger">${remains}</span>`;
        } else {
          leftSide += `<span class="kite-trial-days ">${remains}</span>`;
        }

        rightSide = `<a is="kite-localtoken-anchor"
                        href="http://localhost:46624/redirect/pro">Upgrade</a>`;
      } else {
        rightSide = `<a is="kite-localtoken-anchor"
                        href="http://localhost:46624/redirect/pro">Account</a>`;
      }
    }

    return `<div class="split-line">
      <div class="left">${leftSide}</div>
      <div class="right">${rightSide}</div>
    </div>`;
  }
}

module.exports = KiteStatusPanel.initClass();
