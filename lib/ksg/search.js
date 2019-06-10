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
    // make sure results include only python related stuff
    if (!query.includes('python')) {
      query = `python ${query}`;
    }
    getKSGCompletions(query).then((data) => {
      // scrub preceding pythons from the data
      if (data.completions) {
        data.completions = data.completions.map(completion => {
          if (completion.toLowerCase().startsWith('python ')) {
            return completion.substring(completion.toLowerCase().indexOf('python ') + 'python '.length);
          }
          return completion;
        });
      }
      this.emitter.emit(SEARCH_MODEL_UPDATE, {payload: 'search model update', data});
    });
    // TODO: add error handling (what should that look like?)
    // maybe just an emission of `empty res`?
  }
};