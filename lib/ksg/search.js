'use strict';

const { Emitter } = require('atom');

const { SEARCH_MODEL_UPDATE } = require('./constants');

module.exports = class Search {
  constructor() {
    this.emitter = new Emitter();
  }

  dispose() {
    this.emitter && this.emitter.dispose();
  }

  onDidUpdate(callback) {
    return this.emitter.on(SEARCH_MODEL_UPDATE, callback);
  }

  stubMethod() {
    console.log('Search stub method');
    this.emitter.emit(SEARCH_MODEL_UPDATE, {payload: 'search model update'});
  }
};