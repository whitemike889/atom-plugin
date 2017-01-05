'use strict';

const {Emitter} = require('atom');
const {addDelegatedEventListener} = require('./utils');

module.exports = class LinkScheme {
  constructor(scheme) {
    this.scheme = scheme;
    this.schemeRegExp = new RegExp(`^${this.scheme}://`);
    this.emitter = new Emitter();
    this.subscription = addDelegatedEventListener(document, 'click', 'a', (e) => {
      const {target} = e;
      const uri = target.href && target.getAttribute('href');
      if (uri && this.schemeRegExp.test(uri)) {
        e.preventDefault();
        this.emitter.emit('did-click-link', {uri, target});
      }
    });
  }

  dispose() {
    this.subscription.dispose();
    this.emitter.dispose();
  }

  onDidClickLink(listener) {
    this.emitter.on('did-click-link', listener);
  }
};
