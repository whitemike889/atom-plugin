'use strict';

require('./kite-logo');
require('./kite-open-link');
require('./kite-expand-navigation');
require('./navigable-stack');
require('./navigable-stack-breadcrumb');

const {CompositeDisposable} = require('atom');

const KiteExpandFunction = require('./kite-expand-function');
const KiteExpandInstance = require('./kite-expand-instance');
const KiteExpandModule = require('./kite-expand-module');
const DataLoader = require('../data-loader');
const VirtualCursor = require('../virtual-cursor');

const {head, parent, addDelegatedEventListener, DisposableEvent} = require('../utils');
const {symbolName, symbolKind, reportFromHover} = require('../kite-data-utils');

class KiteSidebar extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-sidebar', {
      prototype: this.prototype,
    });
  }

  createdCallback() {
    this.innerHTML = `
      <header>
        <kite-navigable-stack-breadcrumb></kite-navigable-stack-breadcrumb>
        <button class="btn icon icon-x"></button>
      </header>

      <kite-navigable-stack></kite-navigable-stack>
    `;

    this.closeBtn = this.querySelector('button.btn.icon-x');
    this.breadcrumb = this.querySelector('kite-navigable-stack-breadcrumb');
    this.content = this.querySelector('kite-navigable-stack');

    this.emptyData();
  }

  attachedCallback() {
    this.setAttribute('tabindex', '-1');
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(addDelegatedEventListener(this, 'click', 'section h4', (e) => {
      parent(e.target, 'section').classList.toggle('collapsed');
    }));

    this.subscriptions.add(new DisposableEvent(this.closeBtn, 'click', (e) => {
      atom.commands.dispatch(this, 'kite:close-sidebar');
    }));

    this.subscriptions.add(this.breadcrumb.subscribeToStack(this.content));
  }

  detachedCallback() {
    this.subscriptions.dispose();
  }

  clear() {
    this.content.clear();
    this.breadcrumb.clear();
  }

  emptyData() {
    this.clear();
    this.content.innerHTML = `
    <ul class='background-message centered'>
      <li>
        <kite-logo></kite-logo>
        No Results
      </li>
    </ul>
    `;
  }

  setData([hover, report]) {
    this.clear();

    let element, data, label;

    // So, as of 2017-01-25, we still have to juggle between hover
    // and report data. The following rules apply:
    // - for instances, we don't get any report, but eventhough we
    //   receive a report, we're not sure that the value repr
    //   give us the name
    // - for functions, types and modules we use the report in
    //   priority and then fallback to the hover first value
    const kind = symbolKind(head(hover.symbol));

    switch (kind) {
      case 'instance':
        element = new KiteExpandInstance();
        label = symbolName(head(hover.symbol));
        element.setData(hover);
        break;
      case 'function':
        element = new KiteExpandFunction();
        label = symbolName(head(hover.symbol));
        element.setData(report || reportFromHover(hover));
        break;
      case 'module':
      case 'type':
        element = new KiteExpandModule();
        label = symbolName(head(hover.symbol));
        element.setData(report || reportFromHover(hover));
        break;
      default:
        element = document.createElement('pre');
        label = 'unknown';
        element.innerHTML = `<code>${JSON.stringify(data, null, 2)}</code>`;
    }

    if (element) {
      this.stack(label, element);
    }
  }

  stack(label, element) {
    this.content.stack(label, element);
  }

  goto(depth) {
    if (typeof depth === 'string') {
      depth = this.breadcrumb.indexOf(depth);
    }

    this.content.goto(depth);
  }

  previous() {
    this.content.previous();
  }

  next() {
    this.content.next();
  }

  showDataAtPosition(editor, position) {
    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });

    return this.showDataAtRange(editor, range);
  }

  showDataAtRange(editor, range) {
    if (this.lastExpandRange && this.lastExpandRange.isEqual(range)) {
      return Promise.resolve();
    }

    this.lastExpandRange = range;

    if (range.isEmpty()) {
      this.emptyData();
      return Promise.resolve();
    }

    return DataLoader.getReportDataAtRange(editor, range)
    .then(([hover, report]) => {
      if (hover.symbol && hover.symbol.length) {
        this.setData([hover, report]);
      } else {
        this.emptyData();
      }
    });
  }
}

module.exports = KiteSidebar.initClass();
