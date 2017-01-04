const {Point} = require('atom');
const {StateController} = require('kite-installer');
const {hoverPath, promisifyRequest, promisifyReadResponse} = require('./utils');
const VirtualCursor = require('./virtual-cursor');
const KiteHover = require('./elements/kite-hover');

module.exports = {
  showHoverAtPosition(editor, position) {
    position = Point.fromObject(position);
    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange();
    const path = hoverPath(editor, range);

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

        const marker = editor.markBufferRange(range, {invalidate: 'never'});
        editor.decorateMarker(marker, {
          'type': 'overlay',
          'item': hover,
        });
      }
    })
    .catch(err => {});
  },
};
