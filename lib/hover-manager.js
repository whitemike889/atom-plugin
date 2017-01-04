const {Point} = require('atom');
const {StateController} = require('kite-installer');
const {hoverPath, promisifyRequest} = require('./utils');

module.exports = {
  showHoverAtPosition(editor, position) {
    position = Point.fromObject(position);
    const range = editor.getLastCursor().getCurrentWordBufferRange();
    const path = hoverPath(editor, range);

    promisifyRequest(StateController.client.request({path})).then(resp => {
      console.log(resp.statusCode);
    });
  },
};
