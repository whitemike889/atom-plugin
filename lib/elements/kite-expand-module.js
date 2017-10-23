'use strict';

const {openDocumentationInWebURL} = require('../urls');
const {renderValueHeader, renderExtend, renderExamples, renderUsages, renderDefinition, renderMembers, renderDocs, debugData, renderLinks, renderParameters} = require('./html-utils');
const StickyTitle = require('./sticky-title');
const {idIsEmpty} = require('../kite-data-utils');
const {renderPatterns, renderLanguageSpecificArguments} = require('./function-utils');

class KiteExpandModule extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-module', {prototype: this.prototype});
  }

  setData(data) {
    const [value] = data.symbol.value;

    this.innerHTML = `
    ${renderValueHeader(value)}
    ${renderExtend(value)}

    <div class="scroll-wrapper">
      <div class="sections-wrapper">
        ${
          value.kind === 'type'
            ? `${renderPatterns(value, 'Popular Constructor Patterns')}
               ${renderParameters(value)}
               ${renderLanguageSpecificArguments(value)}`
            : ''
        }
        ${renderDocs(data)}
        ${renderMembers(value)}
        ${renderUsages(data)}
        ${renderExamples(data)}
        ${renderLinks(data)}
        ${renderDefinition(data)}
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

module.exports = KiteExpandModule.initClass();
