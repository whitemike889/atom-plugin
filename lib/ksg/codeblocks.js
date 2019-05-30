'use strict';

const { Emitter } = require('atom');

const { CODEBLOCKS_MODEL_UPDATE } = require('./constants');

const { getKSGCodeBlocks } = require('../data-loader');

module.exports = class Codeblocks {

  static decorateCodeblocks(blocks, link, title) {
    return `>>>>>>> HEAD: ${title}
=======
# This code was inserted by Kite.
# You may need to alter it for it to work properly.

# Source: ${link}
${blocks.join('\n# BLOCK\n')}
>>>>>>> end of Kite Snippet
    `;
  }

  constructor() {
    this.emitter = new Emitter();
  }

  dispose() {
    this.emitter && this.emitter.dispose();
  }

  onDidUpdate(callback) {
    return this.emitter.on(CODEBLOCKS_MODEL_UPDATE, callback);
  }

  executeQuery({ query }) {
    //add DataLoader call here
    getKSGCodeBlocks(query).then((data) => {
      console.log('ksg codeblocks resp data', data);
      // we want more votes appearing first
      data && data.answers && data.answers.sort((a, b) => b.votes - a.votes);
      this.emitter.emit(CODEBLOCKS_MODEL_UPDATE, {payload: 'codeblocks model update', data});
    });
    // TODO: add error handling (what should that look like?)
    // maybe just an emission of `empty res`
    console.log('Codeblocks model stub method');
  }
};