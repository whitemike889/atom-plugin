'use strict';

const { Emitter } = require('atom');

const { CODEBLOCKS_MODEL_UPDATE } = require('./constants');

module.exports = class Codeblocks {
  constructor() {
    this.emitter = new Emitter();
  }

  dispose() {
    this.emitter && this.emitter.dispose();
  }

  onDidUpdate(callback) {
    return this.emitter.on(CODEBLOCKS_MODEL_UPDATE, callback);
  }

  stubMethod() {
    console.log('Codeblocks model stub method');
    this.emitter.emit(CODEBLOCKS_MODEL_UPDATE, {payload: 'codeblocks model update'});
  }
};