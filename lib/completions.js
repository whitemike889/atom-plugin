'use strict';

const metrics = require('./metrics.js');
const DataLoader = require('./data-loader');
const KiteSignature = require('./elements/kite-signature');
let Kite;

<<<<<<< HEAD
// called to handle attribute completions
function getSuggestions(params) {
  if (!atom.config.get('kite.enableCompletions', false)) { return Promise.resolve([]); }
  if (!Kite) { Kite = require('./kite'); }

  // DataLoader.getSignaturesAtPosition(params.editor, params.bufferPosition);

  return DataLoader.getCompletionsAtPosition(params.editor, params.bufferPosition);
}

function onDidInsertSuggestion(ev) {
  // ev has three fields: editor, triggerPosition, suggestion
  metrics.track('completion used', {
    text: ev.suggestion.text,
    hasDocumentation: Kite.hasDocumentation(ev.suggestion),
  });
}

module.exports = {
=======
const KiteProvider = {
>>>>>>> master
  selector: '.source.python',
  disableForSelector: '.source.python .comment, .source.python .string',
  inclusionPriority: 5,
  suggestionPriority: 5,
  excludeLowerPriority: false,

  // called to handle attribute completions
  getSuggestions(params) {
    if (this.isInsideFunctionCall(params)) {
      metrics.track('completion in function call');
      this.loadSignature(params);
    } else {
      this.clearSignature();
    }

    if (!atom.config.get('kite.enableCompletions', false)) { return Promise.resolve([]); }
    if (!Kite) { Kite = require('./kite'); }

    return Kite.checkTextEditorWhitelistState(params.editor)
    .then(() =>
      DataLoader.getCompletionsAtPosition(params.editor, params.bufferPosition)
    );
  },

  onDidInsertSuggestion(ev) {
    // ev has three fields: editor, triggerPosition, suggestion
    metrics.track('completion used', {
      text: ev.suggestion.text,
      hasDocumentation: Kite.hasDocumentation(ev.suggestion),
    });
  },

  isInsideFunctionCall({scopeDescriptor}) {
    return scopeDescriptor.scopes.some(s => s === 'meta.function-call.python');
  },

  loadSignature({editor, bufferPosition}) {
    const line = editor.getTextInRange([
      [bufferPosition.row, 0],
      bufferPosition,
    ]);

    const compact = line.match(/[\(,]\s*$/) == null;

    DataLoader.getSignaturesAtPosition(editor, bufferPosition)
    .then(data => {
      if (data) {
        const listElement = this.getSuggestionsListElement();

        listElement.maxVisibleSuggestions = compact
          ? atom.config.get('autocomplete-plus.maxVisibleSuggestions')
          : atom.config.get('kite.maxVisibleSuggestionsAlongSignature');

        this.signaturePanel = this.signaturePanel || new KiteSignature();

        this.signaturePanel.setData(data, compact);
        atom.config.get('kite.hideDocumentationWhenSignatureIsAvailable')
          ? this.signaturePanel.setAttribute('no-documentation', '')
          : this.signaturePanel.removeAttribute('no-documentation');

        listElement.insertBefore(this.signaturePanel, listElement.lastChild);

        metrics.track('signature shown in autocomplete-plus');
      }
    })
    .catch(err => {
      metrics.track('retrieving signature failed', {error: err});
    });
  },

  clearSignature() {
    if (this.signaturePanel && this.signaturePanel.parentNode) {
      this.signaturePanel.parentNode.removeChild(this.signaturePanel);
    }
  },

  getSuggestionsListElement() {
    if (!atom.packages.getAvailablePackageNames().includes('autocomplete-plus')) {
      return null;
    }

    if (this.suggestionListElement) { return this.suggestionListElement; }

    const pkg = atom.packages.getActivePackage('autocomplete-plus').mainModule;
    this.suggestionListElement = atom.views.getView(pkg.autocompleteManager.suggestionList);

    if (!this.suggestionListElement.ol) {
      this.suggestionListElement.renderList();
    }

    return this.suggestionListElement;
  },
};

module.exports = KiteProvider;
