'use strict';

const { Emitter } = require('atom');

const { SEARCH_MODEL_UPDATE } = require('./constants');
const { getKSGCompletions } = require('../data-loader');

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

  executeQuery({ query }) {
    //add DataLoader call here
    getKSGCompletions(query).then((data) => {
      console.log('ksg completions resp data', data);
      this.emitter.emit(SEARCH_MODEL_UPDATE, {payload: 'search model update', data});
    });
    // TODO: add error handling (what should that look like?)
    // maybe just an emission of `empty res`?
  }
};