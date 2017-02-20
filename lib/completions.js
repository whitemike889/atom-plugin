'use strict';

const metrics = require('./metrics.js');
const DataLoader = require('./data-loader');
const KiteSignature = require('./elements/kite-signature');
let Kite;

const KiteProvider = {
  selector: '.source.python',
  disableForSelector: '.source.python .comment, .source.python .string',
  inclusionPriority: 5,
  suggestionPriority: 5,
  excludeLowerPriority: false,

  // called to handle attribute completions
  getSuggestions(params) {
    if (this.isInsideFunctionCall(params)) {
      this.loadSignature(params);
    } else {
      this.clearSignature();
    }

    if (!atom.config.get('kite.enableCompletions', false)) { return Promise.resolve([]); }
    if (!Kite) { Kite = require('./kite'); }

    return Kite.checkTextEditorWhitelistState(params.editor)
    .then(() =>
    DataLoader.getCompletionsAtPosition(params.editor, params.bufferPosition));
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
    DataLoader.getSignaturesAtPosition(editor, bufferPosition)
    .then(data => {
      if (data) {
        const listElement = this.getSuggestionsListElement();

        this.signaturePanel = this.signaturePanel || new KiteSignature();

        this.signaturePanel.setData(data);

        listElement.insertBefore(this.signaturePanel, listElement.lastChild);
      }
    })
    .catch(err => console.error(err));
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
