'use strict';

const {openDocumentationInWebURL} = require('../urls');
const {renderValueHeader, renderExtend, renderUsages, renderParameters, renderExamples, renderDefinition, renderInvocations, symbolDescription, debugData, renderLinks} = require('./html-utils');
const {idIsEmpty} = require('../kite-data-utils');
const {renderPatterns, renderLanguageSpecificArguments} = require('./function-utils');
const StickyTitle = require('./sticky-title');

class KiteExpandFunction extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-function', {prototype: this.prototype});
  }

  setData(data) {
    const [value] = data.symbol.value;

    this.innerHTML = `
    ${renderValueHeader(value)}
    ${renderExtend(value)}

    <div class="scroll-wrapper">
      <div class="sections-wrapper">
        ${renderParameters(value)}
        ${renderPatterns(value)}
        ${renderLanguageSpecificArguments(value)}

        <section class="summary">
          <h4>Summary</h4>
          ${symbolDescription(data)}
        </section>

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
