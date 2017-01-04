'use strict';

const md5 = require('md5');
const {Range, Disposable} = require('atom');

class DisposableEvent extends Disposable {
  constructor(target, event, listener) {
    const events = event.split(/\s+/g);

    if (typeof target.addEventListener === 'function') {
      super(() => events.forEach(e => target.removeEventListener(e, listener)));
      events.forEach(e => target.addEventListener(e, listener));
    } else if (typeof target.on === 'function') {
      super(() => events.forEach(e => target.off(e, listener)));
      events.forEach(e => target.on(e, listener));
    } else {
      throw new Error('The passed-in source must have either a addEventListener or on method');
    }
  }
}

function noShadowDOM() {
  return parseFloat(atom.getVersion()) >= 1.13;
}

function editorRoot(element) {
  return noShadowDOM() ? element : (element.shadowRoot || element);
}

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

function promisifyReadResponse(response) {
  return new Promise((resolve, reject) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => resolve(data));
    response.on('error', err => reject(err));
  });
}

module.exports = {
  noShadowDOM,
  editorRoot,
  hoverPath,
  tokensPath,
  secondsSince,
  promisifyRequest,
  promisifyReadResponse,
  DisposableEvent,
};
