'use strict';

const {head} = require('../utils');
const {renderSymbolHeader, renderExtend, renderDefinition, renderUsages} = require('./html-utils');

class KiteExpandInstance extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-instance', {prototype: this.prototype});
  }

  setData(data) {
    const symbol = head(data.symbol);

    this.innerHTML = `
    ${renderSymbolHeader(symbol)}
    ${renderExtend(symbol)}

    <div class="expand-body">
      <p class="summary">${symbol.synopsis}</p>

      ${renderDefinition(symbol)}
      ${renderUsages(symbol)}

    </div>

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>
    `;
  }
}

module.exports = KiteExpandInstance.initClass();
