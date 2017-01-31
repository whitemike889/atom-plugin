'use strict';

const {DisposableEvent} = require('../utils');
const NavigablePanel = require('./navigable-panel');

class KiteSidebar extends NavigablePanel {
  static initClass() {
    return document.registerElement('kite-sidebar', {
      prototype: this.prototype,
    });
  }

  createdCallback() {
    this.innerHTML = `
      <header>
        <kite-navigable-stack-breadcrumb></kite-navigable-stack-breadcrumb>
        <button class="btn icon icon-x"></button>
      </header>

      <kite-navigable-stack></kite-navigable-stack>
    `;

    this.closeBtn = this.querySelector('button.btn.icon-x');
    this.breadcrumb = this.querySelector('kite-navigable-stack-breadcrumb');
    this.content = this.querySelector('kite-navigable-stack');

    this.emptyData();
  }

  attachedCallback() {
    this.subscribe();

    this.subscriptions.add(new DisposableEvent(this.closeBtn, 'click', (e) => {
      atom.commands.dispatch(this, 'kite:close-sidebar');
    }));

  }

  detachedCallback() {
    this.unsubscribe();
  }

  emptyData() {
    this.clear();
    this.content.innerHTML = `
    <ul class='background-message centered'>
      <li>
        <kite-logo></kite-logo>
        No Results
      </li>
    </ul>
    `;
  }
}

module.exports = KiteSidebar.initClass();
