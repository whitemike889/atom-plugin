'use strict';

require('./kite-logo');
require('./kite-open-link');
require('./kite-expand-navigation');

const {CompositeDisposable} = require('atom');

const KiteExpandFunction = require('./kite-expand-function');
const KiteExpandInstance = require('./kite-expand-instance');
const KiteExpandModule = require('./kite-expand-module');

const {head, parent, addDelegatedEventListener} = require('../utils');
const {symbolKind} = require('../kite-data-utils');

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

  setData(kind) {
    let data, element;
    if (typeof kind === 'object') {
      data = kind;
      kind = symbolKind(head(kind.symbol));
    }
    switch (kind) {
      case 'instance':
        element = new KiteExpandInstance();
        break;
      case 'function':
        element = new KiteExpandFunction();
        break;
      case 'module':
        element = new KiteExpandModule();
        break;
      default:
        this.innerHTML = `<pre><code>${JSON.stringify(data, null, 2)}</code></pre>`;
    }

    if (element) {
      element.setData(data);
      this.appendChild(element);
    }
  }
}

module.exports = KiteExpand.initClass();
