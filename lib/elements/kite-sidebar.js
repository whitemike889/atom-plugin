'use strict';

require('./kite-logo');
require('./kite-open-link');
require('./kite-expand-navigation');

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
        <div class="btn-group">
          <a href="kite-atom-internal://sidebar-depth/previous" class="btn icon icon-chevron-left"></a>
          <a href="kite-atom-internal://sidebar-depth/next" class="btn icon icon-chevron-right"></a>
        </div>
        <ul class="breadcrumb"></ul>
        <button class="btn icon icon-x"></button>
      </header>

      <div class="sidebar-content"></div>
    `;

    this.content = this.querySelector('.sidebar-content');
    this.closeBtn = this.querySelector('button.btn.icon-x');
    this.navigationBtns = this.querySelector('.btn-group');
    this.breadcrumbList = this.querySelector('ul.breadcrumb');
    this.breadcrumb = [];

    this.emptyData();
    this.updateBreadcrumb();
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
  }

  detachedCallback() {
    this.subscriptions.dispose();
  }

  clearData() {
    this.content.innerHTML = '';
    this.removeAttribute('depth');
    this.removeAttribute('last-step');
    this.breadcrumb = [];
    this.updateBreadcrumb();
  }

  emptyData() {
    this.clearData();
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
    this.clearData();

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
    const depth = this.depth + 1;
    element.classList.add(`item-${depth}`);
    Array.prototype.slice.call(this.content.children, depth).forEach(el => el.remove());
    this.breadcrumb = this.breadcrumb.slice(0, depth);
    this.breadcrumb.push(label);
    this.content.appendChild(element);

    this.updateBreadcrumb();

    setTimeout(() => this.goto(depth), 100);
  }

  goto(depth) {
    if (typeof depth === 'string') {
      depth = Math.max(0, this.breadcrumb.indexOf(depth));
    }

    this.setAttribute('depth', depth);
    const breadcrumbItem = this.breadcrumbList.children[depth];
    if (breadcrumbItem) {
      this.breadcrumbList.scrollLeft = breadcrumbItem.offsetLeft;
    }

    depth === this.breadcrumb.length - 1
      ? this.setAttribute('last-step', '')
      : this.removeAttribute('last-step');
  }

  previous() {
    this.goto(Math.max(0, this.depth - 1));
  }

  next() {
    this.goto(Math.min(this.breadcrumb.length - 1, this.depth + 1));
  }

  get depth() {
    return parseInt(this.getAttribute('depth') || '-1', 10);
  }

  updateBreadcrumb() {
    if (this.breadcrumb.length > 1) {
      this.breadcrumbList.innerHTML = this.breadcrumb.map((b, i, a) =>
      `<li class="item-${i}"><a href="kite-atom-internal://sidebar-depth/${i}">${b}</a></li>`).join('');
      this.navigationBtns.style.display = '';
    } else {
      this.breadcrumbList.innerHTML = '';
      this.navigationBtns.style.display = 'none';
    }
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
