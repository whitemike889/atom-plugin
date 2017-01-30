'use strict';

const {renderValueHeader, renderExtend, renderExamples, renderUsages, renderMembers, valueDescription} = require('./html-utils');

class KiteExpandModule extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-module', {prototype: this.prototype});
  }

  setData(data) {
    const {value} = data;

    this.innerHTML = `
    ${renderValueHeader(value)}
    ${renderExtend(value)}

    <section class="summary">
      <div class="description">${valueDescription(data)}</div>
    </section>

    ${renderMembers(value)}
    ${renderExamples(value)}
    ${renderUsages(value)}

    <footer>
      <kite-expand-navigation></kite-expand-navigation>
      <kite-open-link data-id="${value.id}"></kite-open-link>
    </footer>
    `;
  }
}

module.exports = KiteExpandModule.initClass();
