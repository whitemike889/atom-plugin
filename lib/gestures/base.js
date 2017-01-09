'use strict';

const {Emitter} = require('atom');

module.exports = class BaseGesture {
  constructor() {
    this.emitter = new Emitter();
  }

  dispose() {
    this.emitter.dispose();
  }

  activate(data) {
    this.emitter.emit('did-activate', data);
  }

  onDidActivate(listener) {
    return this.emitter.on('did-activate', listener);
  }
};
