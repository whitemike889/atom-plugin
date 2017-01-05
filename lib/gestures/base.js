'use strict';

const {Emitter} = require('atom');

module.exports = class BaseGesture {
  constructor() {
    this.emitter = new Emitter();
  }

  dispose() {
    this.emitter.dispose();
  }

  onDidActivate(listener) {
    return this.emitter.on('did-activate', listener);
  }
};
