'use strict';

const {renderValueHeader, renderExtend, renderUsages, renderParameters, renderInvocations, valueDescription} = require('././html-utils');


class KiteExpandFunction extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-function', {prototype: this.prototype});
  }

  setData(data) {
    const {value} = data;
    this.innerHTML = `
    <section class="summary">
      ${renderValueHeader(value)}
      ${renderExtend(value)}
      <div class="description">${valueDescription(data)}</div>
    </section>

    ${renderParameters(value)}

    <div class="column">
      ${renderInvocations(value)}
      ${renderUsages(value)}
    </div>

    <kite-open-link data-id="${value.id}"></kite-open-link>
    `;
  }
}

module.exports = KiteExpandFunction.initClass();
