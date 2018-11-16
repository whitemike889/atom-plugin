'use strict';

const {CompositeDisposable} = require('atom');
const KiteAPI = require('kite-api');
const {flatten, compact} = require('./utils');
const DataLoader = require('./data-loader');
const KiteEditor = require('./kite-editor');

const EXTENSIONS_BY_LANGUAGES = {
  python: [
    'py',
  ],
  javascript: [
    'js',
  ],
};

module.exports = class KiteEditors {
  init(kite) {
    this.Kite = kite;
    this.subscriptions = new CompositeDisposable();
    this.kiteEditorByEditorID = [];
    this.whitelistedEditorByID = [];

    this.subscriptions.add(atom.workspace.observeTextEditors(editor => {
      if (this.isGrammarSupported(editor)) {
        this.subscribeToEditor(editor);
      }
    }));

    this.subscriptions.add(KiteAPI.onDidDetectWhitelistedPath(path => {
      this.getEditorsForPath(path).forEach(e => {
        this.whitelistedEditorByID[e.id] = true;
      });
    }));

    this.subscriptions.add(KiteAPI.onDidDetectNonWhitelistedPath(path => {
      this.getEditorsForPath(path).forEach(e => {
        this.whitelistedEditorByID[e.id] = false;
      });
    }));

    return DataLoader.getSupportedLanguages().then(languages => {
      this.supportedLanguages = languages;
    });
  }

  dispose() {
    delete this.kiteEditorByEditorID;
    this.subscriptions && this.subscriptions.dispose();
  }

  subscribeToEditor(editor) {
    // We don't want to subscribe twice to the same editor
    if (!this.hasEditorSubscription(editor)) {
      const kiteEditor = new KiteEditor(editor);
      this.kiteEditorByEditorID[editor.id] = kiteEditor;

      this.subscriptions.add(kiteEditor);

      const disposable = editor.onDidDestroy(() => {
        this.unsubscribeFromEditor(editor);
        this.subscriptions.remove(disposable);
      });

      this.subscriptions.add(disposable);
    }
  }

  unsubscribeFromEditor(editor) {
    if (!this.hasEditorSubscription(editor)) { return; }

    const kiteEditor = this.kiteEditorByEditorID[editor.id];
    kiteEditor.dispose();
    this.subscriptions.remove(kiteEditor);
    delete this.kiteEditorByEditorID[editor.id];
    delete this.whitelistedEditorByID[editor.id];
  }

  hasEditorSubscription(editor) {
    return this.kiteEditorForEditor(editor) != null;
  }

  kiteEditorForEditor(editor) {
    return editor && this.kiteEditorByEditorID && this.kiteEditorByEditorID[editor.id];
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  isEditorWhitelisted(editor) {
    return editor && this.whitelistedEditorByID && this.whitelistedEditorByID[editor.id];
  }

  isGrammarSupported(editor) {
    return this.supportedLanguages
      ? new RegExp(this.getSupportedLanguagesRegExp(this.supportedLanguages))
            .test(editor.getPath() || '')
      : /\.py$/.test(editor.getPath() || '');
  }

  getSupportedLanguagesRegExp(languages) {
    return `\.(${
      compact(flatten(languages.map(l => EXTENSIONS_BY_LANGUAGES[l]))).join('|')
    })$`;
  }

  getEditorsForPath(path) {
    return atom.workspace.getPaneItems().filter(i => i && i.getURI && i.getURI() === path);
  }
};
