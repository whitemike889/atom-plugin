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
    ${renderSymbolHeader(symbol)}
    ${renderExtend(symbol)}

    <div class="expand-body">
      <p class="summary">${value.synopsis}</p>

      ${renderMembers(symbol)}
      ${renderExamples(symbol)}
      ${renderUsages(symbol)}

    </div>

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>

    <kite-expand-navigation></kite-expand-navigation>
    `;
  }
}

module.exports = KiteExpandModule.initClass();
