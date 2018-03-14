'use strict';

let Kite, DataLoader, OverlayManager, WordHoverGesture,
  HyperClickMode, SidebarMode, screenPositionForMouseEvent,
  pixelPositionForMouseEvent, kiteUtils, CompositeDisposable,
  symbolId, metrics, md5;

class Fix {
  constructor(diffs) {
    this.diffs = diffs;
    this.timestamp = new Date();
  }
}

class KiteEditor {
  constructor(editor) {
    this.editor = editor;
    this.buffer = editor.getBuffer();
    this.editorElement = atom.views.getView(editor);
    this.fixesHistory = [];

    this.subscribeToEditor();
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.subscriptions;
    delete this.editorElement;
    delete this.editor;
    delete this.buffer;
  }

  subscribeToEditor() {
    if (!CompositeDisposable) {
      ({CompositeDisposable} = require('atom'));
      ({screenPositionForMouseEvent, pixelPositionForMouseEvent} = require('./utils'));
      HyperClickMode = require('./modes/hyperclick');
      WordHoverGesture = require('./gestures/word-hover');
      DataLoader = require('./data-loader');
      SidebarMode = require('./modes/sidebar');
    }

    const editor = this.editor;
    const subs = new CompositeDisposable();

    this.subscriptions = subs;
    // this.hyperClickMode = new HyperClickMode(this);
    this.mode = new SidebarMode(this);

    subs.add(this.mode);
    // subs.add(this.hyperClickMode);

    this.hoverGesture = new WordHoverGesture(editor, {
      ignoredSelector: 'atom-overlay, atom-overlay *',
    });
    subs.add(this.hoverGesture);

    subs.add(this.hoverGesture.onDidActivate(({position}) => {
      if (atom.config.get('kite.enableHoverUI')) {
        if (!OverlayManager) { OverlayManager = require('./overlay-manager'); }
        OverlayManager.showHoverAtPositionWithDelay(editor, position);
      }
    }));
    subs.add(this.hoverGesture.onDidDeactivate(() => {
      if (atom.config.get('kite.enableHoverUI')) {
        if (!OverlayManager) { OverlayManager = require('./overlay-manager'); }
        OverlayManager.dismissWithDelay();
      }
    }));

    subs.add(editor.onDidChangeCursorPosition(() => {
      if (!Kite) { Kite = require('./kite'); }
      if (typeof Kite.setStatusLabel === 'function') { Kite.setStatusLabel(this); }
    }));

    subs.add(editor.onDidDestroy(() => {
      if (!Kite) { Kite = require('./kite'); }
      Kite.unsubscribeFromEditor(editor);
    }));

    subs.add(editor.getBuffer().onWillSave(() => {
      if (!Kite) { Kite = require('./kite'); }
      if (Kite.isEditorWhitelisted(this.editor)) {
        return this.willSaveHook();
      }
      return null;
    }));
  }

  initialize() {
    if (!kiteUtils) {
      ({utils: kiteUtils} = require('kite-installer'));
    }

    return this.editor === atom.workspace.getActivePaneItem()
      ? DataLoader.isEditorAuthorized(this.editor)
      : Promise.resolve();
  }

  willSaveHook() {
    if (!atom.config.get('kite.enableAutocorrect')) {
      return Promise.resolve();
    }

    if (!md5) { md5 = require('md5'); }

    const requestStartTime = new Date();

    return Promise.all([
      DataLoader.postSaveValidationData(this.editor),
      DataLoader.getAutocorrectData(this.editor)
      .then(data => {
        const hash = md5(this.editor.getText());
        const status = Kite.getAutocorrectStatusItem();

        if (data.requested_buffer_hash !== hash) {
          status.textContent = '';
          DataLoader.postAutocorrectHashMismatchData(data, requestStartTime);
          return;
        }

        const fixes = data.diffs ? data.diffs.length : 0;

        this.lastCorrectionsData = data;

        if (fixes > 0) {
          this.buffer.setTextViaDiff(data.new_buffer);
          this.fixesHistory.unshift(new Fix(data.diffs));

          if (atom.config.get('kite.openAutocorrectSidebarOnSave') &&
             !Kite.isAutocorrectSidebarVisible()) {
            Kite.toggleAutocorrectSidebar(true);
          } else if (Kite.isAutocorrectSidebarVisible()) {
            Kite.autocorrectSidebar.renderDiffs(Kite.autocorrectSidebar.getCurrentEditorCorrectionsHistory());
            status.textContent = '';
          } else {
            status.textContent = `${fixes} ${fixes === 1 ? 'error' : 'errors'} fixed`;
          }
        } else {
          status.textContent = '';
        }
      }),
    ]).catch(() => {});
  }

  expandRange(range) {
    if (!metrics) { metrics = require('./metrics'); }

    metrics.featureRequested('expand_panel');
    metrics.featureRequested('documentation');
    return this.mode.expandRange(range);
  }

  expandId(id) {
    if (!metrics) { metrics = require('./metrics'); }

    metrics.featureRequested('expand_panel');
    metrics.featureRequested('documentation');
    return this.mode.expandId(id);
  }

  openInWebAtRange(range) {
    return DataLoader.openInWebAtRange(this.editor, range);
  }

  openDefinitionForId(id) {
    return DataLoader.getValueReportDataForId(id)
    .then((data) => this.openDefinition(data.report.definition));
  }

  openDefinitionAtRange(range) {
    const token = this.tokensList.tokenAtRange(range);
    return this.openTokenDefinition(token);
  }

  openDefinition(definition) {
    if (!metrics) { metrics = require('./metrics'); }

    if (definition.filename.trim() === '') { return Promise.resolve(false); }

    return new Promise((resolve, reject) => {
      metrics.featureRequested('definition');
      if (definition) {
        return atom.workspace.open(definition.filename)
        .then(editor => {
          metrics.featureFulfilled('definition');
          editor.setCursorBufferPosition([
            definition.line - 1, 0,
          ], {
            autoscroll: true,
          });
          return true;
        });
      }
      return false;
    });
  }

  showHyperClickHighlight(range) {
    this.hyperclickMarker = this.editor.markBufferRange(range, {
      invalidate: 'touch',
    });
    this.editor.decorateMarker(this.hyperclickMarker, {
      type: 'highlight',
      class: 'kite-hyperclick',
    });
  }

  hideHyperClickHighlight() {
    if (this.hyperclickMarker ) {
      this.hyperclickMarker.destroy();
      delete this.hyperclickMarker;
    }
  }

  screenPositionForMouseEvent(event) {
    return screenPositionForMouseEvent(this.editorElement, event);
  }

  pixelPositionForMouseEvent(event) {
    return pixelPositionForMouseEvent(this.editorElement, event);
  }
}

module.exports = KiteEditor;
