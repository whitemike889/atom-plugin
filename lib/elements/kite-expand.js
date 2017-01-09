'use strict';

require('./kite-logo');
require('./kite-open-link');
require('./kite-expand-navigation');

const {CompositeDisposable} = require('atom');

const KiteExpandFunction = require('./kite-expand-function');
const KiteExpandInstance = require('./kite-expand-instance');
const KiteExpandModule = require('./kite-expand-module');

const {head, parent, addDelegatedEventListener} = require('../utils');
const {symbolKind} = require('../hover-data-utils');

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

  setData(data) {
    if (typeof data === 'object') {
      data = symbolKind(head(data.symbol));
    }
    switch (data) {
      case 'instance':
        this.appendChild(new KiteExpandInstance());
        break;
      case 'function':
        this.appendChild(new KiteExpandFunction());
        break;
      case 'module':
        this.appendChild(new KiteExpandModule());
        break;
    }
  }
}

module.exports = KiteExpand.initClass();
