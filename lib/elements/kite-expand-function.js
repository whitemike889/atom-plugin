'use strict';

const {head} = require('../utils');
const {renderSymbolHeader, renderExtend, renderUsages, renderParameters, renderInvocations, symbolDescription} = require('././html-utils');


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
      <div class="description">${symbolDescription(data)}</div>
    </section>

    ${renderParameters(symbol)}
    ${renderInvocations(symbol)}
    ${renderUsages(symbol)}

    <kite-open-link data-id="${symbol.id}"></kite-open-link>
    `;
  }
}

module.exports = KiteExpandFunction.initClass();
