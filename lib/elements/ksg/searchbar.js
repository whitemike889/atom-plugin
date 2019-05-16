'use strict';

class KSGSearch extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({mode: 'open'});
    
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'kite-ksg-search-wrapper');

    const style = document.createElement('style');
    style.textContent = `
    .kite-ksg-search-wrapper {
      position: relative;
      color: red;
      font-size: 3.0rem;
    }
    `;

    shadow.appendChild(wrapper);
    shadow.appendChild(style);

    // TEST CASE
    wrapper.appendChild(document.createTextNode('TEST SEARCH'));
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