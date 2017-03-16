'use strict';

require('./kite-logo');

const {CompositeDisposable, TextEditor} = require('atom');
const {DisposableEvent} = require('../utils');
const {StateController} = require('kite-installer');
const Plan = require('../plan');
const LinkScheme = require('../link-scheme');
const DataLoader = require('../data-loader');

const {STATES} = StateController;
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

  handleAction({url}) {
    switch (url.host) {
      case 'install':
        this.app.install().then(() => this.renderCurrent());
        break;
      case 'start':
        this.app.start().then(() => this.renderCurrent());
        break;
      case 'login':
        break;
      case 'whitelist':
        this.app.whitelist(url.path.replace(/^\//, ''))
        .then(() => {
          const editor = atom.workspace.getActiveTextEditor();
          const kiteEditor = this.app.kite.kiteEditorForEditor(editor);

          if (kiteEditor) {
            return kiteEditor.initialize();
          } else {
            return this.app.kite.subscribeToEditor(editor);
          }

        })
        .then(() => this.renderCurrent());
        break;
      case 'whitelist-settings':
        break;
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
    ];
    if (editor && this.app.isGrammarSupported(editor)) {
      promises.push(DataLoader.projectDirForEditor(editor).catch(() => null));
    }

    return Promise.all(promises).then(data => {
      this.render(...data);
    });
  }

  hide() {
    if (this.parentNode) {
      this.parentNode.removeChild((this));
      this.subscriptions.dispose();
    }
  }

  render(plan, status, projectDir) {
    this.innerHTML = `
      ${this.renderSubscription(plan)}
      ${this.renderStatus(status, projectDir)}
    `;
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
        if (!this.app.isGrammarSupported(editor) ||
            this.app.kite.isEditorWhitelisted(editor)) {
          content = `
            <div class="ready">Kite engine is ready and working ${dot}</div>
          `;
        } else {
          content = `
            <div class="text-warning">Kite engine is not enabled for this file ${dot}</div>

            <a href="kite-atom-internal://whitelist/${projectDir}" class="btn btn-warning">Enable for ${projectDir}</a>
            <a href="kite-atom-internal://whitelist-settings" class="btn btn-warning">Whitelist settings…</a>
          `;
        }

        break;
    }

    return `<div class="status">${content}</div>`;
  }

  renderSubscription(plan) {
    if (!plan) { return ''; }

    let leftSide = '';
    let rightSide = '';

    if (!Plan.isPro() && Plan.isActive()) {
      leftSide = '<kite-logo></kite-logo> Kite Basic';

      if (Plan.hasStartedTrial()) {
        rightSide = '<a href="https://alpha.kite.com/pro">Upgrade</a>';
      } else {
        rightSide = '<a href="https://alpha.kite.com/pro">Start Pro trial</a>';
      }
    } else if (Plan.isPro()) {
      leftSide = '<kite-logo></kite-logo><span class="pro-badge">pro</span>';

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
