'use strict';

const {Emitter} = require('atom');

module.exports = class BaseGesture {
  constructor() {
    this.emitter = new Emitter();
  }

  dispose() {
    this.emitter.dispose();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  activate(data) {
    if (!this.paused) { this.emitter.emit('did-activate', data); }
  }

  onDidActivate(listener) {
    return this.emitter.on('did-activate', listener);
  }
};
