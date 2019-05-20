'use strict';

const { TextEditor, CompositeDisposable } = require('atom');

const { addDelegatedEventListener, DisposableEvent } = require('../../utils');

class KSGSearch extends HTMLElement {
  constructor() {
    super();

    this.subscriptions = new CompositeDisposable();
    

    this.shadow = this.attachShadow({mode: 'open'});
    
    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'kite-ksg-search-wrapper');

    const style = document.createElement('style');
    style.textContent = `
    .kite-ksg-search-wrapper {
      position: relative;
      font-size: 3.0rem;
      width: 200px;
      height: 4.0rem;
      border: solid teal;
    }
  
    .kite-ksg-search-wrapper:focus-within{
      border: dashed saddlebrown;
    }
    `;

    this.shadow.appendChild(style);
    this.shadow.appendChild(this.wrapper);

    this.searchInput = new TextEditor({ placeholderText: 'Search the webz...', mini: true });

    // factor out styling the input code
    /* 
      Todo
      - get a blinking cursor in there
    */
    this.searchInputView = this.searchInput.getElement();
    this.subscriptions.add(new DisposableEvent(this.searchInputView, 'click', () => {
      this.setFocus();
    }));
    this.searchInputView.setWidth(100);
    this.searchInputView.setHeight(20);
    this.searchInputView.style.display = 'block';
    console.log('serachINput', this.searchInput, this.searchInputView);

    this.wrapper.appendChild(this.searchInputView);
    // TEST CASE
    //this.wrapper.appendChild(document.createTextNode('TEST SEARCH'));
  }

  connectedCallback() {
    //console.log('KSG search connected callback');
    //focus

    this.setFocus();
  }

  disconnectedCallback() {
    //console.log('KSG searchs disconnected callback');
    this.subscriptions && this.subscriptions.dispose();
  }

  setFocus() {
    console.log('setFocus');
    this.searchInputView.focus();
    this.searchInput.moveToBottom();
  }
}

customElements.define('kite-ksg-search', KSGSearch);
module.exports = KSGSearch;

/* TODO:
 - design element structure (attributes, events, etc.)
 - need for debouncing on keystrokes
*/