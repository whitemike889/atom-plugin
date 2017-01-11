'use strict';

class KiteExpandModule extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-module', {prototype: this.prototype});
  }

  setData(data) {
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

            <a href="kite-atom-internal://more-methods">See 27 more methods</a>
          </dd>
        </dl>
      </section>

      <section>
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
      </section>

      <section>
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
      </section>
    </div>

    <kite-open-link href="kite-atom-internal://open"></kite-open-link>

    <kite-expand-navigation></kite-expand-navigation>
    `;
  }
}

module.exports = KiteExpandModule.initClass();
