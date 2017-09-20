'use strict';

const {openDocumentationInWebURL} = require('../urls');
const {renderSymbolHeader, renderExtend, renderDefinition, renderUsages, symbolDescription, renderExamples, debugData, renderLinks} = require('./html-utils');
const StickyTitle = require('./sticky-title');
const {idIsEmpty} = require('../kite-data-utils');

class KiteExpandInstance extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-instance', {prototype: this.prototype});
  }

  setData(data) {
    const {symbol} = data;

    this.innerHTML = `
    ${renderSymbolHeader(symbol)}
    ${renderExtend(symbol)}

    <div class="scroll-wrapper">
      <div class="sections-wrapper">
        <section class="summary">
          <h4>Summary</h4>
          ${symbolDescription(data)}
        </section>

        ${renderDefinition(symbol)}
        ${renderUsages(data)}
        ${renderExamples(data)}
        ${renderLinks(data)}
        ${debugData(data)}
      </div>
    </div>

    <footer>
      <div></div>
      ${!idIsEmpty(symbol.id)
        ? `<kite-open-link data-url="${openDocumentationInWebURL(symbol.id)}"></kite-open-link>`
      : ''}
    </footer>
    `;
  }

  attachedCallback() {
    this.sticky = new StickyTitle(this.querySelectorAll('h4'), this.querySelector('.sections-wrapper'));
  }

  detachedCallback() {
    this.sticky && this.sticky.dispose();
  }

  updateSticky() {
    this.sticky.measureWidthAndHeight();
  }
}

module.exports = KiteExpandInstance.initClass();
