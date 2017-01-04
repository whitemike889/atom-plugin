'use strict';

const md5 = require('md5');
const {Range} = require('atom');

function tokensPath(editor) {
  const state = md5(editor.getText());
  const filename = editor.getPath();
  const buffer = filename.replace(/\//g, ':');
  return `/api/buffer/atom/${buffer}/${state}/tokens`;
}

function hoverPath(editor, range) {
  range = Range.fromObject(range);

  const state = md5(editor.getText());
  const filename = editor.getPath();
  const buffer = filename.replace(/\//g, ':');
  const start = editor.getBuffer().characterIndexForPosition(range.start);
  const end = editor.getBuffer().characterIndexForPosition(range.end);
  return [
    `/api/buffer/atom/${buffer}/${state}/hover`,
    `selection_begin_bytes=${start}&selection_end_bytes=${end}`,
  ].join('?');
}

// get time in seconds since the date
function secondsSince(when) {
  var now = new Date();
  return (now.getTime() - when.getTime()) / 1000.0;
}

function promisifyRequest(request) {
  return request.then
    ? request
    : new Promise((resolve, reject) => {
      request.on('response', resp => resolve(resp));
      request.on('error', err => reject(err));
    });
}

module.exports = {
  hoverPath,
  tokensPath,
  secondsSince,
  promisifyRequest,
};
