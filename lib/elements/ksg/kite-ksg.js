'use strict';

const KSGCodeBlocks = require('./codeblocks');
const KSGSearch = require('./searchbar');

/**
 * will need to have nest custom elements...
 * how to do that?
 */
class KSG extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({mode: 'open'});
    
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'kite-ksg-inner');
    const style = document.createElement('style');
    style.textContent = `
    .kite-ksg-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 1000;
    }
    `;

    shadow.appendChild(wrapper);
    shadow.appendChild(style);
    wrapper.appendChild(new KSGCodeBlocks());
    wrapper.appendChild(new KSGSearch());

    // TEST CASE
    wrapper.appendChild(document.createTextNode('TEST BOLLOCKS'));
  }

  connectedCallback() {
    //console.log('KSG connected callback');
  }

  disconnectedCallback() {
    //console.log('KSG disconnected callback');
  }
}

customElements.define('kite-ksg', KSG);
module.exports = KSG;

/* TODO:
 - design element structure (attributes, events, etc.)
 - what needs to happen on connection? on disconnection?
 - what data does this element need to hold and communicate to its
    two custom HTMLElement children?
  - what different states is this element designed to handle? How can it appropriately
      listen for changes?
*/

/*
  Some notes on usage;
  - controllers will get `new` elements to append to the DOM
  - these HTMLElement instances will be manipulable through exposed APIs (e.g. `setData`)

*/