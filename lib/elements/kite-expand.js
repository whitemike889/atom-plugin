'use strict';

class KiteExpand extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand', {prototype: this.prototype});
  }

  setData(data) {
    this.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  }

}

module.exports = KiteExpand.initClass();
