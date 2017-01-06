'use strict';

class KiteExpandInstance extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-instance', {prototype: this.prototype});
  }

  createdCallback() {
    this.innerHTML = `
    <div class="expand-header split-line">
      <span class="name">Counter.name</span>
      <span class="type">str | list[str]</span>
    </div>

    <div class="expand-extend split-line">
      <span class="name">
        <a href="kite-atom-internal://base/property">BaseCounter.name</a>
      </span>
      <span class="type"><a href="kite-atom-internal://base/return">str</a></span>
    </div>

    <div class="expand-body">
      <p class="summary">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <section>
        <h4>Definition</h4>

      </section>

      <section>
        <h4>Usages</h4>

      </section>
    </div>

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>
    `;
  }
}

module.exports = KiteExpandInstance.initClass();
