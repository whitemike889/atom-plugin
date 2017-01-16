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
    <section class="summary">
      ${renderSymbolHeader(symbol)}
      ${renderExtend(symbol)}
      <p>${symbol.synopsis}</p>
    </section>

    ${renderParameters(symbol)}
    ${renderInvocations(symbol)}
    ${renderUsages(symbol)}

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>
    `;
  }
}

module.exports = KiteExpandFunction.initClass();
