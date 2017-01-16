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
    <section class="summary">
      ${renderSymbolHeader(symbol)}
      ${renderExtend(symbol)}
      <p>${symbol.synopsis}</p>
    </section>

    ${renderDefinition(symbol)}
    ${renderUsages(symbol)}

    <kite-open-link data-id="${symbol.id}"></kite-open-link>
    `;
  }
}

module.exports = KiteExpandInstance.initClass();
