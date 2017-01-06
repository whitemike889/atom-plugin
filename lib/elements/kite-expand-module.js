'use strict';

class KiteExpandModule extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-module', {prototype: this.prototype});
  }

  createdCallback() {
    this.innerHTML = `
    <div class="expand-header split-line">
      <span class="name">matplotlib.pyplot</span>
      <span class="type">module</span>
    </div>

    <div class="expand-body">
      <p class="summary">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <section>
        <h4>Top Members</h4>
        <dl>
          <dt>plot(*args, **kwargs)</dt>
          <dd>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat.</p>
          </dd>

          <dt>figure(num, figsize, dpi, facecolor, ...)</dt>
          <dd>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur.</p>

            <a href="kite-atom-internal://known-kwargs">See 27 more methods</a>
          </dd>
        </dl>
      </section>
    </div>

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>

    <kite-expand-navigation></kite-expand-navigation>
    `;
  }
}

module.exports = KiteExpandModule.initClass();
