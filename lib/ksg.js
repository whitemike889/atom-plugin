'use strict';

const { CompositeDisposable } = require('atom');
const KSGElement = require('./elements/ksg/kite-ksg');


/* 
  Questions / Design / ToDos
  - What are the component states? How do we communicate them to the elements appropriately?
*/
module.exports = class KSG {
  constructor() {
    this.element = new KSGElement();
    this._visible = false;
  }

  init(Kite) {
    // will need to pay attention to a notion of 'editors'
    this.subscriptions = new CompositeDisposable();
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.element;
    delete this.subscriptions;
  }

  show() {
    document.body.appendChild(this.element);
    this._visible = true;
  }

  hide() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this._visible = false;
  }

  get visible() {
    return this._visible;
  }

  getElement() {
    return this.element;
  }
};