'use strict';

class KiteMembersList extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-members-list', {
      prototype: this.prototype,
    });
  }

  attachedCallback() {
    this.innerHTML = 'Members List';
  }

  setData(data) {
    
  }
}

module.exports = KiteMembersList.initClass();
