'use strict';

const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '..');

function jsonPath(p) {
  return path.join(base, 'json', p);
}

function walk(p, callback) {
  if (fs.existsSync(p)) {
    const stats = fs.lstatSync(p);

    if (stats.isDirectory()) {
      const content = fs.readdirSync(p);

      content.forEach(s => walk(path.join(p, s), callback));
    } else {
      callback(p);
    }
  }
}

function loadResponseForEditor(p, e) {
  const data = require(p);

  for (const k in data) {
    const v = data[k];
    if (v === 'filled-out-by-testrunner') {
      switch (k) {
        case 'source':
          data[k] = 'atom';
          break;
        case 'filename':
          data[k] = e.getPath();
          break;
      }
    }
  }

  return data;
}

module.exports = {
  jsonPath,
  walk,
  loadResponseForEditor,
};
