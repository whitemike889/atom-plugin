'use strict';

const {openDocumentationInWebURL} = require('../utils');
const {renderValueHeader, renderExtend, renderDefinition, renderUsages, valueDescription, renderExamples} = require('./html-utils');

class KiteExpandInstance extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-instance', {prototype: this.prototype});
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

      ${renderDefinition(value)}
      ${renderExamples(data)}
      ${renderUsages(data)}
    </div>

    <footer>
      <div></div>
      <kite-open-link data-url="${openDocumentationInWebURL(value.id)}"></kite-open-link>
    </footer>
    `;
  }
}

module.exports = KiteExpandInstance.initClass();
