'use strict';

const {head} = require('../utils');
const {renderSymbolHeader, renderExtend, renderExamples, renderUsages, renderMembers} = require('./html-utils');

class KiteExpandModule extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-module', {prototype: this.prototype});
  }

  setData(data) {
    const symbol = head(data.symbol);
    const value = head(symbol.value);

    this.innerHTML = `
    <section class="summary">
      ${renderSymbolHeader(symbol)}
      ${renderExtend(symbol)}
      <p>${value.synopsis}</p>
    </section>

    ${renderMembers(symbol)}
    <section>
      ${renderExamples(symbol)}
      ${renderUsages(symbol)}
    </section>

    <kite-open-link data-id="${symbol.id}"></kite-open-link>

    <kite-expand-navigation></kite-expand-navigation>
    `;
  }
}

module.exports = KiteExpandModule.initClass();
