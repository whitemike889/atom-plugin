'use strict';

const {head} = require('../utils');
const {renderSymbolHeader, renderExtend, renderDefinition, renderUsages, symbolDescription} = require('./html-utils');

class KiteExpandInstance extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-instance', {prototype: this.prototype});
  }

  setData(data) {
    const symbol = head(data.symbol);

    this.innerHTML = `
    ${renderSymbolHeader(symbol)}
    ${renderExtend(symbol)}

    <div class="sections-wrapper">
      <section class="summary">
        <div class="description">${symbolDescription(data)}</div>
      </section>

      ${renderDefinition(symbol)}
      ${renderUsages(symbol)}
    </div>

    <footer>
      <div></div>
      <kite-open-link data-id="${symbol.id}"></kite-open-link>
    </footer>
    `;
  }
}

module.exports = KiteExpandInstance.initClass();
