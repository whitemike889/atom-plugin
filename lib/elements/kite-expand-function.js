'use strict';

const {head} = require('../utils');
const {symbolType, symbolLabel, parameterName, parameterType} = require('../kite-data-utils');


class KiteExpandFunction extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-function', {prototype: this.prototype});
  }

  setData(data) {
    const symbol = head(data.symbol);
    const value = head(symbol.value);

    this.innerHTML = `
    <div class="expand-header split-line">
      <span class="name">${symbolLabel(symbol)}</span>
      <span class="type">${symbolType(symbol)}</span>
    </div>

    ${this.renderExtend(symbol)}

    <div class="expand-body">
      <p class="summary">${symbol.synopsis}</p>

      ${this.renderParameters(value.detail)}
      ${this.renderInvocations(symbol)}
      ${this.renderUsages(symbol)}
    </div>

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>
    `;
  }

  renderParameters(detail) {
    return detail && ((detail.parameters && detail.parameters.length) || detail.vararg || detail.kwarg)
      ? `
      <section class="parameters">
        <h4>Params</h4>
        <dl>
          ${detail.parameters.map(p => this.renderParameter(p)).join('')}
          ${this.renderParameter(detail.vararg, '*')}
          ${this.renderParameter(detail.kwarg, '**')}
        </dl>
      </section>`
      : '';
  }

  renderParameter(param, prefix = '') {
    return !param
      ? ''
      : `<dt class="split-line">
        <span class="name">${parameterName(param, prefix)}</span>
        <span class="type">${parameterType(param)}</span>
      </dt>
      <dd>${param.synopsis}</dd>
      `;
  }

  renderInvocations(symbol) {
    return `<section class="invocations">
      <h4>Common Invocations</h4>

      <pre><code>Counter.increment(10)
Counter.increment(10, foo='bar')</code></pre>
    </section>`;
  }

  renderUsages(symbol) {
    return `<section class="usages">
      <h4>Usages</h4>

      <pre><a class="icon icon-file-code pull-right" href="kite-atom-internal://usage"></a><code>Counter.increment(10)</code></pre>
      <pre><a class="icon icon-file-code pull-right" href="kite-atom-internal://usage"></a><code>Counter.increment(10, foo='bar')</code></pre>
    </section>`;
  }

  renderExtend(symbol) {
    return !symbol.bases || symbol.bases.length === 0
      ? ''
      : `
    <div class="expand-extend split-line">
      <span class="name">
        <a href="kite-atom-internal://base/method">BaseCounter.increment(n)</a>
      </span>
      <span class="type"><a href="kite-atom-internal://base/return">-> int</a></span>
    </div>`;
  }
}

module.exports = KiteExpandFunction.initClass();
