'use strict';

require('./kite-logo');

class StatusItem extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-status', {prototype: this.prototype});
  }

  createdCallback() {
    this.innerHTML = '<kite-logo></kite-logo>';
    this.classList.add('inline-block');

    this.setState('unknown');
    this.tooltipText = '';
    this.tooltip = atom.tooltips.add(this, {
      title: () => this.tooltipText,
    });
  }

  setState(cls, description) {
    this.tooltipText = description;
    if (cls !== undefined) {
      this.setAttribute('status', cls);
    }
  }

  onClick(func) {
    this.onclick = func;
  }
}

module.exports = StatusItem.initClass();
