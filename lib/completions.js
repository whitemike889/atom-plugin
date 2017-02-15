'use strict';

const metrics = require('./metrics.js');
const DataLoader = require('./data-loader');
let Kite;

// called to handle attribute completions
function getSuggestions(params) {
  if (!atom.config.get('kite.enableCompletions', false)) { return Promise.resolve([]); }
  if (!Kite) { Kite = require('./kite'); }

  return Kite.checkTextEditorWhitelistState(params.editor)
  .then(() =>
    DataLoader.getCompletionsAtPosition(params.editor, params.bufferPosition));
}

function onDidInsertSuggestion(ev) {
  // ev has three fields: editor, triggerPosition, suggestion
  metrics.track('completion used', {
    text: ev.suggestion.text,
    hasDocumentation: Kite.hasDocumentation(ev.suggestion),
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
