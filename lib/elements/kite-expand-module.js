'use strict';

const {renderValueHeader, renderExtend, renderExamples, renderUsages, renderMembers, valueDescription} = require('./html-utils');

class KiteExpandModule extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-module', {prototype: this.prototype});
  }

  setData(data) {
    const {value} = data;

    this.innerHTML = `
    <section class="summary">
      ${renderValueHeader(value)}
      ${renderExtend(value)}
      <div class="description">${valueDescription(data)}</div>
    </section>

    ${renderMembers(value)}
    <div class="column">
      ${renderExamples(value)}
      ${renderUsages(value)}
    </div>

    <div class="footer-section">
      <kite-expand-navigation></kite-expand-navigation>
      <kite-open-link data-id="${value.id}"></kite-open-link>
    </div>
    `;
  }
}

module.exports = KiteExpandModule.initClass();
