'use strict';

const fs = require('fs');
const path = require('path');
const logoSvg = String(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'logo-no-text.svg')));

class KiteExpand extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand', {prototype: this.prototype});
  }

  createdCallback() {
    this.setAttribute('tabindex', '-1');
    this.innerHTML = `
      <div class="expand-header split-line">
        <span class="name">Counter.increment(n:int, **kwargs)</span>
        <span class="type">-> int | list[int]</span>
      </div>

      <div class="expand-extend split-line">
        <span class="name">
          <a href="kite-atom-internal://base/method">BaseCounter.increment(n)</a>
        </span>
        <span class="type"><a href="kite-atom-internal://base/return">-> int</a></span>
      </div>

      <div class="expand-body">
        <p class="summary">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>

        <section>
          <h4>Params</h4>
          <dl>
            <dt class="split-line">
              <span class="name">n</span>
              <span class="type">int | numbers.Real</span>
            </dt>
            <dd>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.</p>
            </dd>

            <dt class="split-line">
              <span class="name">**kwargs</span>
              <span class="type">dict</span>
            </dt>
            <dd>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur.</p>

              <a href="kite-atom-internal://known-kwargs">See 4 known kwargs</a>
            </dd>
          </dl>
        </section>

        <section>
          <h4>Common Invocations</h4>

          <pre><code>Counter.increment(10)
Counter.increment(10, foo='bar')</code></pre>
        </section>

        <section>
          <h4>Usages</h4>

          <pre><a class="icon icon-file pull-right" href="kite-atom-internal://open-usage"></a><code>Counter.increment(10)</code></pre>
          <pre><a class="icon icon-bookmark pull-right" href="kite-atom-internal://open-usage"></a><code>Counter.increment(10, foo='bar')</code></pre>
        </section>
      </div>

      <div class="expand-footer">
        <a href="kite-atom-internal://open">
          <span>Open in Kite <kbd>⌘K</kbd></span>
          ${logoSvg}
        </a>
      </div>

      <div class="expand-footer-navigation">
        <div class="btn-group">
          <a class="btn icon icon-chevron-left" href="kite-atom-internal://previous"></a>
          <a class="btn icon icon-chevron-right" href="kite-atom-internal://next"></a>
        </div>
      </div>
    `;
  }

  setData(data) {}
}

module.exports = KiteExpand.initClass();
