'use strict';

require('./kite-logo');
require('./kite-open-link');
require('./kite-expand-navigation');
require('./navigable-stack');
require('./navigable-stack-breadcrumb');

const url = require('url');
const {CompositeDisposable} = require('atom');

const KiteExpandFunction = require('./kite-expand-function');
const KiteExpandInstance = require('./kite-expand-instance');
const KiteExpandModule = require('./kite-expand-module');
const KiteMembersList = require('./kite-members-list');
const DataLoader = require('../data-loader');
const VirtualCursor = require('../virtual-cursor');
const LinkScheme = require('../link-scheme');

const {head, last, parent, addDelegatedEventListener, DisposableEvent} = require('../utils');
const {symbolName, symbolKind, reportFromHover, valueNameFromId} = require('../kite-data-utils');

class NavigablePanel extends HTMLElement {
  subscribe() {
    this.setAttribute('tabindex', '-1');
    this.subscriptions = this.subscriptions || new CompositeDisposable();
    this.subscriptions.add(addDelegatedEventListener(this, 'click', 'section h4', (e) => {
      parent(e.target, 'section').classList.toggle('collapsed');
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'click', 'a.internal_link', (e) => {
      const id = last(e.target.href.split('#'));
      this.stackDataForId(id, e.target);
      e.preventDefault();
    }));

    this.subscriptions.add(this.breadcrumb.subscribeToStack(this.content));

    this.createLinkScheme();
  }

  unsubscribe() {
    this.subscriptions.dispose();
  }

  clear() {
    this.content.clear();
    this.breadcrumb.clear();
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
        element.setData(report || reportFromHover(hover));
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
      // if (report) { this.addFakeUsageData(report); }

      // console.log(JSON.stringify(hover, null, 2));
      // console.log(JSON.stringify(report, null, 2));
      if (hover.symbol && hover.symbol.length) {
        this.setData([hover, report]);
      } else {
        this.emptyData();
      }
    });
  }

  createLinkScheme() {
    const scheme = new LinkScheme('kite-atom-internal', this);
    this.subscriptions.add(scheme);
    this.subscriptions.add(scheme.onDidClickLink(({url, target}) => {
      const {host, path} = url;
      switch (host) {
        case 'goto': {
          const [file, row] = path.split(':');
          atom.workspace.open(file).then(editor =>
            editor.setCursorBufferPosition([
              parseInt(row, 10) - 1, 0,
            ], {
              autoscroll: true,
            }));
          break;
        }
        case 'members-list': {
          const id = path.replace(/^\//, '');
          const key = `${id}.*`;

          if (this.breadcrumb.includes(key)) {
            this.goto(key);
          } else {
            DataLoader.getMembersDataForId(id)
            // DataLoader.getValueReportDataForId(id)
            // .then(data => data.value.detail)
            .then(data => {
              const element = new KiteMembersList();
              element.setData(data);

              this.stack(key, element);
            })
            .catch(this.invalidateLink(target));
          }

          break;
        }
        case 'example': {
          const id = path.replace(/^\//, '');
          DataLoader.getExampleDataForId(id)
          .then(data => console.log(JSON.stringify(data, null, 2)))
          .catch(err => console.error(err));
          break;
        }
        case 'type':
        case 'member': {
          const id = path.replace(/^\//, '').replace(/;/g, '.');

          this.stackDataForId(id, target);

          break;
        }
        case 'navigation-depth': {
          const step = path.replace(/^\//, '');
          if (step === 'previous') {
            this.previous();
          } else if (step === 'next') {
            this.next();
          } else {
            this.goto(parseInt(step, 10));
          }
        }
      }
    }));
  }

  stackDataForId(id, link) {
    DataLoader.getValueReportDataForId(id)
    .then(data => {
      // this.addFakeUsageData(data);

      let element, label;
      const kind = data.value.kind;

      switch (kind) {
        case 'function':
          element = new KiteExpandFunction();
          label = data.value.repr;
          element.setData(data);
          break;
        case 'instance':
          element = new KiteExpandInstance();
          label = valueNameFromId(data.value);
          element.setData(data);
          break;
        case 'module':
        case 'type':
          element = new KiteExpandModule();
          label = data.value.repr;
          element.setData(data);
          break;
        default:
          element = document.createElement('pre');
          label = 'unknown';
          element.innerHTML = `<code>${JSON.stringify(data, null, 2)}</code>`;
      }

      this.stack(label, element);
    })
    .catch(this.invalidateLink(link));
  }

  invalidateLink(target) {
    return (err) => {
      target.classList.add('unreachable');
      const {path} = url.parse(target.getAttribute('href'));
      this.subscriptions.add( atom.tooltips.add(target, {
        title: `No results available for <code>${path.replace(/^\//, '')}</code>`,
        html: true,
        class: 'kite-tooltip',
        trigger: 'hover',
        delay: { show: 0, hide: 100 },
      }));
      this.subscriptions.add(new DisposableEvent(target, 'click', e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
      }));

      const [tooltip] = atom.tooltips.tooltips.get(target);
      tooltip.show();

      throw err;
    };
  }

  addFakeUsageData(o) {
    o.report.usages = [
      {
        id: 'some.id',
        code: 'Counter.increment(x)',
        filename: __filename,
        line: 246,
        begin_bytes: 2,
        begin_runes: 2,
      },
    ];
  }
}

module.exports = NavigablePanel;
