'use strict';

const {head} = require('../utils');
const {symbolName, symbolType, memberLabel} = require('../kite-data-utils');

class KiteExpandModule extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-module', {prototype: this.prototype});
  }

  setData(data) {
    const symbol = head(data.symbol);
    const value = head(symbol.value);

    this.innerHTML = `
    <div class="expand-header split-line">
      <span class="name">${symbolName(symbol)}</span>
      <span class="type">${symbolType(symbol)}</span>
    </div>

    <div class="expand-body">
      <p class="summary">${value.synopsis}</p>

      ${this.renderMembers(value.detail.members)}
      ${this.renderExamples(value.detail.examples)}
      ${this.renderUsages(value.detail.usages)}

    </div>

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>

    <kite-expand-navigation></kite-expand-navigation>
    `;
  }

  renderExamples(examples) {
    return `
    <section class="examples">
      <h4>Examples</h4>

      <ul>
        <li>
          <i class="icon icon-code"></i>
          <a href="kite-atom-internal://example" class="example">
            How to plot a 2D graph
            <i class="icon icon-chevron-right"></i>
          </a>
        </li>

        <li>
          <i class="icon icon-code"></i>
          <a href="kite-atom-internal://example" class="example">
            How to plot a 3D graph
            <i class="icon icon-chevron-right"></i>
          </a>
        </li>
      </ul>
    </section>`;
  }

  renderUsages(usages) {
    return `
    <section class="usages">
      <h4>Usages</h4>

      <ul>
        <li>
          <a class="pull-right" href="kite-atom-internal://goto">Go to <i class="icon icon-chevron-right"></i></a>

          <i class="icon icon-file-code"></i> <span class="file">example.py</span>
        </li>

        <li>
          <a class="pull-right" href="kite-atom-internal://goto">Go to <i class="icon icon-chevron-right"></i></a>

          <i class="icon icon-file-code"></i> <span class="file">rc/anotherfile.py</span>
          <pre><code>Counter.name = 'x'</code></pre>
        </li>
      </ul>
    </section>`;
  }

  renderMembers(members) {
    return members.length === 0
      ? ''
      : `<section class="members">
        <h4>Top Members</h4>
        <dl>${members.slice(0, 2).map(m => this.renderMember(m)).join('')}</dl>
        ${this.additionalMembersLink(members.length - 2)}
      </section>`;
  }

  renderMember(member) {
    return `
    <dt>${memberLabel(member)}</dt>
    <dd>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.</p>
    </dd>`;
  }

  additionalMembersLink(membersCount) {
    return membersCount <= 0
      ? ''
      : `<a href="kite-atom-internal://more-methods">See ${membersCount} more methods</a>`;
  }
}

module.exports = KiteExpandModule.initClass();
