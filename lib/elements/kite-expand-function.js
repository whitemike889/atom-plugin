'use strict';

const {renderValueHeader, renderExtend, renderUsages, renderParameters, renderInvocations, valueDescription} = require('././html-utils');


class KiteExpandFunction extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-function', {prototype: this.prototype});
  }

  setData(data) {
    const {value} = data;
    this.innerHTML = `
    ${renderValueHeader(value)}
    ${renderExtend(value)}

    <div class="sections-wrapper">
      <section class="summary">
        <div class="description">${valueDescription(data)}</div>
      </section>

      ${renderParameters(value)}
      ${renderInvocations(value)}
      ${renderUsages(value)}
    </div>

    <footer>
      <div></div>
      <kite-open-link data-id="${value.id}"></kite-open-link>
    </footer>
    `;
  }
}

module.exports = KiteExpandFunction.initClass();
