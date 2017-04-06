'use strict';

const {openDocumentationInWebURL} = require('../urls');
const {renderValueHeader, renderExtend, renderUsages, renderParameters, renderExamples, renderDefinition, renderInvocations, valueDescription, debugData, renderLinks} = require('././html-utils');
const StickyTitle = require('./sticky-title');

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
      <section class="summary">${valueDescription(data)}</section>

      ${renderParameters(value)}
      ${renderExamples(data)}
      ${renderLinks(data)}
      ${renderDefinition(data)}
      ${renderInvocations(value)}
      ${renderUsages(data)}
      ${debugData(data)}
    </div>

    <footer>
      <div></div>
      <kite-open-link data-url="${openDocumentationInWebURL(value.id)}"></kite-open-link>
    </footer>
    `;
  }

  attachedCallback() {
    this.subscriptions = new StickyTitle(this.querySelectorAll('h4'), this.querySelector('.sections-wrapper'));
  }

  detachedCallback() {
    this.subscriptions && this.subscriptions.dispose();
  }
}

module.exports = KiteExpandFunction.initClass();
