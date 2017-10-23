'use strict';

const {openDocumentationInWebURL} = require('../urls');
const {renderSymbolHeader, renderExtend, renderUsages, renderParameters, renderExamples, renderDefinition, renderInvocations, debugData, renderLinks, renderReturnType, renderDocs} = require('./html-utils');
const {idIsEmpty} = require('../kite-data-utils');
const {renderPatterns, renderLanguageSpecificArguments} = require('./function-utils');
const StickyTitle = require('./sticky-title');

class KiteExpandFunction extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-function', {prototype: this.prototype});
  }

  setData(data) {
    const {symbol} = data;
    const [value] = symbol.value;

    this.innerHTML = `
    ${renderSymbolHeader(symbol)}
    ${renderExtend(value)}

    <div class="scroll-wrapper">
      <div class="sections-wrapper">
        ${renderParameters(value)}
        ${renderReturnType(symbol)}
        ${renderPatterns(value)}
        ${renderLanguageSpecificArguments(value)}
        ${renderDocs(data)}
        ${renderUsages(data)}
        ${renderExamples(data)}
        ${renderDefinition(data)}
        ${renderLinks(data)}
        ${renderInvocations(value)}
        ${debugData(data)}
      </div>
    </div>

    <footer>
      <div></div>
      ${!idIsEmpty(value.id)
        ? `<kite-open-link data-url="${openDocumentationInWebURL(value.id)}"></kite-open-link>`
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

module.exports = KiteExpandFunction.initClass();
