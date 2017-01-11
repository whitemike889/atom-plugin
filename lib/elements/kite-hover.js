'use strict';

const {symbolLabel, symbolType} = require('../hover-data-utils');

class KiteHover extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-hover', {prototype: this.prototype});
  }

  setData(data) {
    if (data && data.symbol && data.symbol.length) {

      const [symbol] = data.symbol;
      this.innerHTML = `
        <span class="name">${symbolLabel(symbol)}</span>
        <span class="type">${symbolType(symbol)}</span>
      `;

    } else {
      this.innerHTML = '';
    }
  }
}

module.exports = KiteHover.initClass();
