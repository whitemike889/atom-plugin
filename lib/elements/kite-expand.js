'use strict';

require('./kite-open-link');
require('./kite-expand-navigation');

const KiteExpandFunction = require('./kite-expand-function');
const KiteExpandInstance = require('./kite-expand-instance');
const KiteExpandModule = require('./kite-expand-module');

class KiteExpand extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand', {prototype: this.prototype});
  }

  createdCallback() {
    this.setAttribute('tabindex', '-1');
  }

  setData(data) {
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
