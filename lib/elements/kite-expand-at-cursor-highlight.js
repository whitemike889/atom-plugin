'use strict';

require('./kite-links');
const VirtualCursor = require('../virtual-cursor');

class KiteExpandAtCursorHighlight extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-at-cursor-highlight', {prototype: this.prototype});
  }

  detachedCallback() {
    this.subscriptions && this.subscriptions.dispose();
  }

  activate(editor, position) {
    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });
    this.marker = editor.markBufferRange(range, {
      invalidate: 'touch',
    });
    this.decoration = editor.decorateMarker(this.marker, {
      type: 'highlight',
      class: 'expand-at-cursor-highlight',
      item: this,
    });

    // TK why
    setTimeout(() => this.decoration.setProperties({type: 'highlight', class: 'expand-at-cursor-highlight animation'}), 0);
    setTimeout(() => this.decoration.destroy(), 800);
  }

  indicateError() {
    this.decoration.setProperties({type: 'highlight', class: 'expand-at-cursor-highlight animation error'});
  }
}

module.exports = KiteExpandAtCursorHighlight.initClass();
