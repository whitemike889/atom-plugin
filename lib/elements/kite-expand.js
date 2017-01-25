'use strict';

require('./kite-logo');
require('./kite-open-link');
require('./kite-expand-navigation');

const {CompositeDisposable} = require('atom');

const KiteExpandFunction = require('./kite-expand-function');
const KiteExpandInstance = require('./kite-expand-instance');
const KiteExpandModule = require('./kite-expand-module');

const {head, parent, addDelegatedEventListener} = require('../utils');
const {symbolKind, reportFromHover} = require('../kite-data-utils');

class KiteExpand extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand', {prototype: this.prototype});
  }

  attachedCallback() {
    this.setAttribute('tabindex', '-1');
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(addDelegatedEventListener(this, 'click', 'section h4', (e) => {
      parent(e.target, 'section').classList.toggle('collapsed');
    }));
  }

  detachedCallback() {
    this.subscriptions.dispose();
  }

  setData([hover, report]) {
    let element;
    let data;

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
        element.setData(hover);
        break;
      case 'function':
        element = new KiteExpandFunction();
        element.setData(report || reportFromHover(hover));
        break;
      case 'module':
      case 'type':
        element = new KiteExpandModule();
        element.setData(report || reportFromHover(hover));
        break;
      default:
        this.innerHTML = `<pre><code>${JSON.stringify(data, null, 2)}</code></pre>`;
    }

    if (element) {
      this.appendChild(element);
    }
  }
}

module.exports = KiteExpand.initClass();
