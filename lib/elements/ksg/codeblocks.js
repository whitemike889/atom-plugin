'use strict';

// rendering is handled via setting
// this.innerHTML
// OR
// it may be handled by `this.attachShadow`, and then the manipulation of the 
// structure contained in the shadow root

class KSGCodeBlocks extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({mode: 'open'});
    const wrapper = document.createElement('div');

    wrapper.setAttribute('class', 'kite-ksg-code-blocks-wrapper');
    const style = document.createElement('style');
    style.textContent = `
    .kite-ksg-codeblock-wrapper {
      position: relative;
      color: blue;
      font-size: 3.0rem;
    }
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);

    // TEST CASE
    wrapper.appendChild(document.createTextNode('TEST CODEBLOCKS'));
  }

  connectedCallback() {
    console.log('KSG codeblocks connected callback');
  }

  disconnectedCallback() {
    console.log('KSG codeblocks disconnected callback');
  }
}

customElements.define('kite-ksg-code-blocks', KSGCodeBlocks);
module.exports = KSGCodeBlocks;

/* TODO:
 - design element structure (attributes, events, etc.)
*/