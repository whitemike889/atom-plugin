'use strict';

const {StateController} = require('kite-installer');
const {hoverPath, promisifyRequest, promisifyReadResponse} = require('./utils');
const VirtualCursor = require('./virtual-cursor');
const KiteHover = require('./elements/kite-hover');

module.exports = {
  dismiss() {
    this.marker && this.marker.destroy();
    this.decoration && this.decoration.destroy();
    delete this.marker;
    delete this.decoration;
    delete this.lastRange;
  },

  showHoverAtPosition(editor, position) {
    const cursor = new VirtualCursor(editor);
    cursor.setScreenPosition(position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });

    if (this.lastRange && this.lastRange.isEqual(range)) {
      return Promise.resolve();
    }

    this.dismiss();

    if (range.isEmpty()) { return Promise.resolve(); }

    const path = hoverPath(editor, range);
    this.lastRange = range;

    return promisifyRequest(StateController.client.request({path}))
    .then(resp => {
      if (resp.statusCode !== 200) { throw new Error('not found'); }
      return promisifyReadResponse(resp);
    })
    .then(data => {
      data = JSON.parse(data);

      if (data.symbol && data.symbol.length) {
        const hover = new KiteHover();
        hover.setData(data);

        this.marker = editor.markBufferRange(range, {
          invalidate: 'touch',
        });
        this.decoration = editor.decorateMarker(this.marker, {
          type: 'overlay',
          position: 'tail',
          item: hover,
        });

      }
    })
    .catch(err => {});
  },
};
