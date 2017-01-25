'use strict';

const md5 = require('md5');
const {Range, Disposable} = require('atom');
const {StateController} = require('kite-installer');

const compact = a => a.filter(v => v && v.length);

const uniq = a => a.reduce((m, v) => m.indexOf(v) === -1 ? m.concat(v) : m, []);

const flatten = a =>
  a.reduce((m, o) => m.concat(Array.isArray(o) ? flatten(o) : o), []);

const head = a => a[0];
const last = a => a[a.length - 1];

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

function addDelegatedEventListener(object, event, selector, callback) {
  if (typeof selector === 'function') {
    callback = selector;
    selector = '*';
  }

  return new DisposableEvent(object, event, listener);

  function listener(e) {
    if (e.isPropagationStopped) { return; }

    let {target} = e;
    decorateEvent(e);
    nodeAndParents(target).forEach((node) => {
      const matched = node.matches(selector);
      if (e.isImmediatePropagationStopped || !matched) { return; }

      e.matchedTarget = node;
      callback(e);
    });
  }

  function decorateEvent(e) {
    const overriddenStop = window.Event.prototype.stopPropagation;
    e.stopPropagation = function() {
      this.isPropagationStopped = true;
      overriddenStop.apply(this, arguments);
    };

    const overriddenStopImmediate = window.Event.prototype.stopImmediatePropagation;
    e.stopImmediatePropagation = function() {
      this.isImmediatePropagationStopped = true;
      overriddenStopImmediate.apply(this, arguments);
    };
  }
}

function eachParent(node, block) {
  let parent = node.parentNode;

  while (parent) {
    block(parent);

    if (parent.nodeName === 'HTML') { break; }
    parent = parent.parentNode;
  }
}

function parents(node, selector = '*') {
  const parentNodes = [];

  eachParent(node, (parent) => {
    if (parent.matches && parent.matches(selector)) { parentNodes.push(parent); }
  });

  return parentNodes;
}

function parent(node, selector = '*') {
  return head(parents(node, selector));
}

function nodeAndParents(node, selector = '*') {
  return [node].concat(parents(node, selector));
}

function noShadowDOM() {
  return parseFloat(atom.getVersion()) >= 1.13;
}

function editorRoot(element) {
  return noShadowDOM() ? element : (element.shadowRoot || element);
}

function parseJSON(data, fallback) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
}

function tokensPath(editor) {
  const state = md5(editor.getText());
  const filename = editor.getPath();
  const buffer = filename.replace(/\//g, ':');
  return [
    `/api/buffer/atom/${buffer}/${state}/tokens`,
    `localtoken=${StateController.client.LOCAL_TOKEN}`,
  ].join('?');
}

function reportPath(data) {
  const symbol = head(data.symbol);
  const value = head(symbol.value);
  // const id = symbol.id !== ''
  //   ? `symbol/${symbol.id}`
  //   : `value/${value.id}`;

  const id = `value/${value.id}`;

  return [
    `/api/editor/${id}`,
    `localtoken=${StateController.client.LOCAL_TOKEN}`,
  ].join('?');
}

function openInWebURL(id) {
  const token = StateController.client.LOCAL_TOKEN;
  return `http://localhost:46624/clientapi/desktoplogin?d=/docs/python/${id}&localtoken=${token}`;

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
    [
      `selection_begin_bytes=${start}`,
      `selection_end_bytes=${end}`,
      `localtoken=${StateController.client.LOCAL_TOKEN}`,
    ].join('&'),
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
  reportPath,
  openInWebURL,
  secondsSince,
  promisifyRequest,
  promisifyReadResponse,
  addDelegatedEventListener,
  eachParent,
  parents,
  parent,
  nodeAndParents,
  DisposableEvent,
  compact, flatten, head, last, uniq,
  parseJSON,
};
