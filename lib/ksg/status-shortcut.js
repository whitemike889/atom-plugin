'use strict';

const { CompositeDisposable } = require('atom');
require('../elements/ksg/ksg-logo');

module.exports = class KSGShortcut {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'ksg-shortcut';
    this.element.innerHTML = '<ksg-logo class="badge"></ksg-logo>';
    this.element.classList.add('inline-block');
  }

  init(Kite) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.tooltips.add(this.element, {
        title: () => 'Kite: Search Stack Overflow',
      })
    );
    this.clickListener = () => Kite.toggleKSG();
    this.element.addEventListener('click', this.clickListener);
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.subscriptions;
    this.element.removeEventListener('click', this.clickListener);
  }

  getElement() {
    return this.element;
  }
};
