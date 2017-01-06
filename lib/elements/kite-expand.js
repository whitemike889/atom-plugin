'use strict';

require('./kite-open-link');
require('./kite-expand-navigation');

const KiteExpandFunction = require('./kite-expand-function');
const KiteExpandInstance = require('./kite-expand-instance');
const KiteExpandModule = require('./kite-expand-module');

const {head} = require('../utils');
const {symbolKind} = require('../hover-data-utils');

class KiteExpand extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand', {prototype: this.prototype});
  }

  createdCallback() {
    this.setAttribute('tabindex', '-1');
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
