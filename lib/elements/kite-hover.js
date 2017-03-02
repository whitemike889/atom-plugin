'use strict';

const {CompositeDisposable} = require('atom');
const {DisposableEvent} = require('../utils');
const {symbolLabel, symbolType} = require('../kite-data-utils');
const {debugData} = require('./html-utils');
const metrics = require('../metrics');
let Kite;

class KiteHover extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-hover', {prototype: this.prototype});
  }

  detachedCallback() {
    this.subscriptions && this.subscriptions.dispose();
  }

  attachedCallback() {
    this.classList.add('native-key-bindings');
    this.setAttribute('tabindex', '-1');
  }

  setData(data, editor, range) {
    if (data && data.symbol && data.symbol.length) {
      const [symbol] = data.symbol;

      this.innerHTML = `
      <div class="definition">
        <span class="name">${symbolLabel(symbol)}</span>
        <span class="type">${symbolType(symbol)}</span>
      </div>
      <div class="actions">
        <a class="icon icon-file-symlink-file">def</a>
        <a class="icon icon-link-external">web</a>
        <a class="icon icon-ellipsis">more</a>
      </div>
      ${debugData(data)}
      `;

      const def = this.querySelector('a.icon-file-symlink-file');
      const web = this.querySelector('a.icon-link-external');
      const more = this.querySelector('a.icon-ellipsis');

      this.subscriptions = new CompositeDisposable();

      this.subscriptions.add(new DisposableEvent(this, 'mousewheel', (e) => {
        e.stopPropagation();
      }));

      this.subscriptions.add(new DisposableEvent(def, 'click', (e) => {
        if (!Kite) { Kite = require('../kite'); }
        const kiteEditor = Kite.kiteEditorForEditor(editor);

        const token = kiteEditor.tokensList.tokenAtRange(range);
        kiteEditor.openTokenDefinition(token);
        kiteEditor.openTokenDefinition(token).then(res => {
          if (res) {
            metrics.track('Hover Go to definition clicked (with definition in report)');
          } else {
            metrics.track('Hover Go to definition clicked (without definition in report)');
          }
        });
      }));

      this.subscriptions.add(new DisposableEvent(web, 'click', (e) => {
        if (!Kite) { Kite = require('../kite'); }
        const kiteEditor = Kite.kiteEditorForEditor(editor);

        metrics.track('Hover Open in web clicked');
        kiteEditor.openInWebAtRange(range);
      }));

      this.subscriptions.add(new DisposableEvent(more, 'click', (e) => {
        if (!Kite) { Kite = require('../kite'); }
        const kiteEditor = Kite.kiteEditorForEditor(editor);

        metrics.track('Hover See info clicked');
        kiteEditor.expandRange(range);
      }));
    } else {
      this.innerHTML = '';
    }
  }
}

module.exports = KiteHover.initClass();
