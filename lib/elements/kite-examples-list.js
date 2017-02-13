'use strict';

const {CompositeDisposable} = require('atom');
const {renderExample} = require('./html-utils');

class KiteExamplesList extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-examples-list', {
      prototype: this.prototype,
    });
  }

  setData(data) {
    this.examples = data.report.examples || [];

    this.subscriptions = new CompositeDisposable();

    this.innerHTML = `
    <div class="examples-list">
      <ul>${this.examples.map(m => renderExample(m)).join('')}</ul>
    </div>
    `;

    this.list = this.querySelector('ul');
  }
}

module.exports = KiteExamplesList.initClass();
