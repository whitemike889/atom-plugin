'use strict';

class KSGSearch extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({mode: 'open'});
    
    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'kite-ksg-search-wrapper');

    this.shadow.appendChild(this.wrapper);

    this.searchInput = document.createElement('input');
    this.searchInput.setAttribute('type', 'text');
    this.searchInput.setAttribute('class', '.kite.-ksg-search-input');

    this.searchInput.addEventListener('input', e => {
      // e.data contains the character
      // need to get the full present value...
      // not registering backspace / delete - will need to take away buffer cursor as well
      console.log('input evt', e, this.searchInput);
    });

    this.wrapper.appendChild(this.searchInput);
    // TEST CASE
    //this.wrapper.appendChild(document.createTextNode('TEST SEARCH'));
  }

  connectedCallback() {
    //console.log('KSG search connected callback');
  }

  disconnectedCallback() {
    //console.log('KSG searchs disconnected callback');
  }
}

customElements.define('kite-ksg-search', KSGSearch);
module.exports = KSGSearch;

/* TODO:
 - design element structure (attributes, events, etc.)
 - need for debouncing on keystrokes
*/