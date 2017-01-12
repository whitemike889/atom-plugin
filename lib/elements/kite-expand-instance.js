'use strict';

const {head} = require('../utils');
const {symbolType, symbolLabel} = require('../kite-data-utils');

class KiteExpandInstance extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-instance', {prototype: this.prototype});
  }

  setData(data) {
    const symbol = head(data.symbol);

    this.innerHTML = `
    <div class="expand-header split-line">
      <span class="name">${symbolLabel(symbol)}</span>
      <span class="type">${symbolType(symbol)}</span>
    </div>

    ${this.renderExtend(symbol)}

    <div class="expand-body">
      <p class="summary">${symbol.synopsis}</p>

      ${this.renderExamples(symbol)}
      ${this.renderUsages(symbol)}

    </div>

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>
    `;
  }

  renderExamples(symbol) {
    return `
    <section>
      <h4>Definition</h4>

      <ul>
        <li>
          <a class="pull-right" href="kite-atom-internal://goto">Go to <i class="icon icon-chevron-right"></i></a>

          <i class="icon icon-file-code"></i> <span class="file">src.py:234</span>
        </li>
      </ul>
    </section>`;
  }

  renderExtend(symbol) {
    symbol.bases
      ? `<div class="expand-extend split-line">
        <span class="name">
          <a href="kite-atom-internal://base/property">BaseCounter.name</a>
        </span>
        <span class="type"><a href="kite-atom-internal://base/return">str</a></span>
      </div>`
      : '';
  }

  renderUsages(symbol) {
    return `
    <section>
      <h4>Usages</h4>

      <ul>
        <li>
          <a class="pull-right" href="kite-atom-internal://goto">Go to <i class="icon icon-chevron-right"></i></a>

          <i class="icon icon-file-code"></i> <span class="file">example.py</span>
        </li>

        <li>
          <a class="pull-right" href="kite-atom-internal://goto">Go to <i class="icon icon-chevron-right"></i></a>

          <i class="icon icon-file-code"></i> <span class="file">rc/anotherfile.py</span>
          <pre><code>Counter.name = 'x'</code></pre>
        </li>
      </ul>
    </section>`;
  }
}

module.exports = KiteExpandInstance.initClass();
