'use strict';

const {head} = require('../utils');
const {renderSymbolHeader, renderExtend, renderUsages, renderParameters, renderInvocations} = require('././html-utils');


class KiteExpandFunction extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-function', {prototype: this.prototype});
  }

  setData(data) {
    const symbol = head(data.symbol);

    this.innerHTML = `
    ${renderSymbolHeader(symbol)}
    ${renderExtend(symbol)}

    <div class="expand-body">
      <p class="summary">${symbol.synopsis}</p>

      ${renderParameters(symbol)}
      ${renderInvocations(symbol)}
      ${renderUsages(symbol)}
    </div>

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>
    `;
  }
}

module.exports = KiteExpandFunction.initClass();
