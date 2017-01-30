'use strict';
const {renderMember} = require('./html-utils');

class KiteMembersList extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-members-list', {
      prototype: this.prototype,
    });
  }

  setData(data) {
    const {value} = data;

    this.innerHTML = `<dl>${value.detail.members.map(m => renderMember(m)).join('')}</dl>`;
  }
}

module.exports = KiteMembersList.initClass();
