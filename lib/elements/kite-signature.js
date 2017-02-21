'use strict';

const {head} = require('../utils');
const {openSignatureInWebURL} = require('../urls');
const {valueLabel, valueType, valueName, callSignature} = require('../kite-data-utils');
const {
  highlightChunk,
  wrapLine,
  wrapPre,
} = require('../highlighter');

function processContent(content) {
  return wrapPre(
    content.split('\n')
    .map(highlightChunk)
    .map(wrapLine)
    .join(''));
}

class KiteSignature extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-signature', {
      prototype: this.prototype,
    });
  }

  detachedCallback() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  openInWeb() {
    this.querySelector('kite-open-link').open();
  }

  setData(data) {
    const call = head(data.calls);
    const name = valueName(call.callee);
    const patterns = call.signatures && call.signatures.length
      ? `
      <section>
        <h4>Popular Patterns</h4>
        <pre>${
          processContent(
            call.signatures
            .map(s => callSignature(s))
            .map(s => `${name}(${s})`)
            .join('\n'))
        }</pre>
      </section>`
      : '';
    this.innerHTML = `
    <div class="split-line">
      <div class="name">${valueLabel(call.callee, call.arg_index)}</div>
      <div class="type">${valueType(call.callee)}</div>
    </div>
    ${patterns}
    <kite-open-link data-url="${openSignatureInWebURL(call.callee.id)}"></kite-open-link>`;

  }
}

module.exports = KiteSignature.initClass();
