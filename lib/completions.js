'use strict';

const http = require('http');
const metrics = require('./metrics.js');
const {MAX_FILE_SIZE} = require('./constants');
const {promisifyRequest, promisifyReadResponse, parseJSON} = require('./utils');
const {StateController} = require('kite-installer');
let Kite;

// called to handle attribute completions
function getSuggestions(params) {
  if (!atom.config.get('kite.enableCompletions', false)) { return Promise.resolve([]); }
  if (!Kite) { Kite = require('./kite'); }
  if (!Kite.isEditorWhitelisted(params.editor)) { return Promise.resolve(); }

  const buffer = params.editor.getBuffer();
  const text = buffer.getText();
  // The TextBuffer class already provides position->char index conversion
  // with regard for unicode's surrogate pairs
  const cursorPosition = buffer.characterIndexForPosition(params.bufferPosition);
  const payload = {
    text,
    filename: params.editor.getPath(),
    cursor: cursorPosition,
  };

  // don't send content over 1mb
  if (payload.text.length > MAX_FILE_SIZE) {
    return Promise.reject(new Error('buffer contents too large, not attempting completions'));
  }

  const req =  http.request({
    host: StateController.client.hostname,
    port: StateController.client.port,
    path: '/clientapi/editor/completions',
    method: 'POST',
  });
  req.write(JSON.stringify(payload));
  req.end();

  return promisifyRequest(req)
  .then(resp => {
    if (resp.statusCode === 404) {
      // This means we had no completions for this cursor position.
      // Do not call reject() because that will generate an error in the console.
      return [];
    } else if (resp.statusCode !== 200) {
      return promisifyReadResponse(resp).then(data => {
        throw new Error(`Error ${resp.statusCode}: ${data}`);
      });
    } else {
      return promisifyReadResponse(resp);
    }
  })
  .then(data => {
    data = parseJSON(data, {});
    data.completions = data.completions || [];

    return data.completions.map((c) => ({
      text: c.display,
      type: c.hint,
      rightLabel: c.hint,
      description: c.documentation_text || '',
    }));
  });
}

function onDidInsertSuggestion(ev) {
  // ev has three fields: editor, triggerPosition, suggestion
  metrics.track('completion used', {
    text: ev.suggestion.text,
  });
}

module.exports = {
  selector: '.source.python',
  disableForSelector: '.source.python .comment, .source.python .string',
  inclusionPriority: 5,
  suggestionPriority: 5,
  excludeLowerPriority: false,
  getSuggestions: getSuggestions,
  onDidInsertSuggestion: onDidInsertSuggestion,
};
