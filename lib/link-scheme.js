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
      const uri = target && target.getAttribute('href');
      if (uri && this.schemeRegExp.test(uri)) {
        this.emitter.emit('did-click-link', {
          uri,
          target,
          path: uri.replace(this.schemeRegExp, ''),
        });
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
