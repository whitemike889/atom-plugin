'use strict';

const KSGCodeBlocks = require('./kite-codeblocks');
const KSGSearch = require('./kite-searchbar');

/**
 * will need to have nest custom elements...
 * how to do that?
 */
class KSG extends HTMLElement {
  constructor() {
    super();
    
    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'kite-ksg-inner');
    this.wrapper.appendChild(new KSGCodeBlocks());
    this.wrapper.appendChild(new KSGSearch());

    this.setAttribute('tabindex', -1);
    this.classList.add('native-key-bindings');
    // TEST CASE
    this.wrapper.appendChild(document.createTextNode('TEST BOLLOCKS'));
    this.appendChild(this.wrapper);
  }

  connectedCallback() {
    //console.log('KSG connected callback');
  }

  disconnectedCallback() {
    //console.log('KSG disconnected callback');
    this.reset();
  }

  reset() {
    console.log('STUB RESET METHOD');
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