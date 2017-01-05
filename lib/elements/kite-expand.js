'use strict';

class KiteExpand extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand', {prototype: this.prototype});
  }
}

module.exports = KiteExpand.initClass();
