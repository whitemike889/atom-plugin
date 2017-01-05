'use strict';

const {StateController} = require('kite-installer');
const {hoverPath, promisifyRequest, promisifyReadResponse} = require('./utils');
const VirtualCursor = require('./virtual-cursor');
const KiteHover = require('./elements/kite-hover');
const KiteExpand = require('./elements/kite-expand');

module.exports = {
  dismiss() {
    this.marker && this.marker.destroy();
    this.decoration && this.decoration.destroy();
    delete this.marker;
    delete this.decoration;
    delete this.lastHoverRange;
    delete this.lastExpandRange;
  },

  showHoverAtPosition(editor, position) {
    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });

    return this.showHoverAtRange(editor, range);
  },

  showHoverAtRange(editor, range) {
    if ((this.lastHoverRange && this.lastHoverRange.isEqual(range)) ||
        (this.lastExpandRange && this.lastExpandRange.isEqual(range))) {
      return Promise.resolve();
    }

    this.dismiss();

    if (range.isEmpty()) { return Promise.resolve(); }

    this.lastHoverRange = range;

    return this.getDataAtRange(editor, range).then(data => {
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

  showExpandAtPosition(editor, position) {
    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });

    return this.showExpandAtRange(editor, range);
  },

  showExpandAtRange(editor, range) {
    console.log('in there');
    if (this.lastExpandRange && this.lastExpandRange.isEqual(range)) {
      return Promise.resolve();
    }

    this.dismiss();

    if (range.isEmpty()) { return Promise.resolve(); }

    this.lastExpandRange = range;

    return this.getDataAtRange(editor, range).then(data => {
      console.log(data);
      if (data.symbol && data.symbol.length) {
        const hover = new KiteExpand();
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

  getDataAtRange(editor, range) {
    const path = hoverPath(editor, range);
    return promisifyRequest(StateController.client.request({path}))
    .then(resp => {
      if (resp.statusCode !== 200) { throw new Error('not found'); }
      return promisifyReadResponse(resp);
    })
    .then(data => JSON.parse(data));
  },
};
