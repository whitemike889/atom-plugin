'use strict';

// rendering is handled via setting
// this.innerHTML
// OR
// it may be handled by `this.attachShadow`, and then the manipulation of the 
// structure contained in the shadow root

class KSGCodeBlocks extends HTMLElement {
  constructor() {
    super();
    const wrapper = document.createElement('div');

    wrapper.setAttribute('class', 'kite-ksg-code-blocks-wrapper');

    // TEST CASE
    wrapper.appendChild(document.createTextNode('TEST CODEBLOCKS'));
    this.appendChild(wrapper);
  }

  connectedCallback() {
    //console.log('KSG codeblocks connected callback');
  }

  disconnectedCallback() {
    //console.log('KSG codeblocks disconnected callback');
  }
}

customElements.define('kite-ksg-code-blocks', KSGCodeBlocks);
module.exports = KSGCodeBlocks;

/* TODO:
 - design element structure (attributes, events, etc.)
*/