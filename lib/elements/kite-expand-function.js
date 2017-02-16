'use strict';

const {openDocumentationInWebURL} = require('../urls');
const {renderValueHeader, renderExtend, renderUsages, renderParameters, renderExamples, renderDefinition, renderInvocations, valueDescription} = require('././html-utils');


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
      ${renderExamples(data)}
      ${renderDefinition(data)}
      ${renderInvocations(value)}
      ${renderUsages(data)}
    </div>

    <footer>
      <div></div>
      <kite-open-link data-url="${openDocumentationInWebURL(value.id)}"></kite-open-link>
    </footer>
    `;
  }
}

module.exports = KiteExpandFunction.initClass();
