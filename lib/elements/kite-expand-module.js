'use strict';

const {head} = require('../utils');
const {renderSymbolHeader, renderExtend, renderExamples, renderUsages, renderMembers, symbolDescription} = require('./html-utils');

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
      <div class="description">${symbolDescription(data)}</div>
    </section>

    ${renderMembers(symbol)}
    <div class="column">
      ${renderExamples(symbol)}
      ${renderUsages(symbol)}
    </div>

    <div class="footer-section">
      <kite-expand-navigation></kite-expand-navigation>
      <kite-open-link data-id="${value.id}"></kite-open-link>
    </div>
    `;
  }
}

module.exports = KiteExpandModule.initClass();
