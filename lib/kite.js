'use strict';

// Contents of this plugin will be reset by Kite on start.
// Changes you make are not guaranteed to persist.

const child_process = require('child_process');
const {CompositeDisposable, TextEditor} = require('atom');
const {AccountManager, StateController} = require('kite-installer');
const completions = require('./completions.js');
const metrics = require('./metrics.js');

const KiteApp = require('./kite-app');
const KiteStatus = require('./elements/kite-status');
const NotificationsCenter = require('./notifications-center');
const MetricsCenter = require('./metrics-center');
const HoverGesture = require('./gestures/hover');
const WordSelectionGesture = require('./gestures/word-selection');
const CursorMoveGesture = require('./gestures/cursor-move');
const OverlayManager = require('./overlay-manager');
const LinkScheme = require('./link-scheme');
const EditorEvents = require('./editor-events');
const DataLoader = require('./data-loader');

module.exports = {
  activate() {
    AccountManager.initClient(
      StateController.client.hostname,
      StateController.client.port,
      ''
    );

    // We store all the subscriptions into a composite disposable to release
    // them on deactivation
    this.subscriptions = new CompositeDisposable();

    // This helps to track to which editor we've actually
    // subscribed
    this.subscriptionsByEditorID = {};
    this.whitelistedEditorIDs = {};

    // send the activated event
    metrics.track('activated');

    // install hooks for editor events and send the activate event
    // this.subscriptions.add(events.onActivate());

    // run "apm upgrade kite"
    this.selfUpdate();

    this.app = new KiteApp();
    this.notifications = new NotificationsCenter(this.app);
    this.metrics = new MetricsCenter(this.app);

    // All these objects have a dispose method so we can just
    // add them to the subscription.
    this.subscriptions.add(this.app);
    this.subscriptions.add(this.notifications);
    this.subscriptions.add(this.metrics);

    this.getStatusItem().setApp(this.app);

    this.subscriptions.add(this.getStatusItem().onDidClick(() => {
      this.notifications.activateForcedNotifications();
      this.connect().then(() => {
        this.notifications.deactivateForcedNotifications();
      });
    }));

    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(item => {
      if (item instanceof TextEditor) {
        this.checkTextEditor(item);
      }
    }));

    // if supported files were open before Kite gets ready we
    // need to subscribe to these editors as well
    this.subscriptions.add(this.app.onKiteReady(() => {
      atom.workspace.getTextEditors()
      .filter(e => this.isGrammarSupported(e))
      .forEach(e => this.subscribeToEditor(e));
    }));

    // Whenever an action is accomplished through the kite app
    // we need to check again the state of the app
    this.subscriptions.add(this.app.onDidInstall(() => this.connect()));

    this.subscriptions.add(this.app.onDidStart(() => this.connect()));

    this.subscriptions.add(this.app.onDidAuthenticate(() => {
      this.connect();
      this.app.saveUserID();
    }));

    this.subscriptions.add(this.app.onDidWhitelist(() => {
      this.connect();
      this.app.saveUserID();
    }));

    // We try to connect at startup
    this.connect();

    // Allow esc key to close expand view
    this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
      'core:cancel'() { OverlayManager.dismiss(); },
      'kite:expand-at-cursor'() {
        const editor = atom.workspace.getActiveTextEditor();
        const position = editor.getLastCursor().getBufferPosition();
        OverlayManager.showExpandAtPosition(editor, position);
      },
      'kite:open-in-web-at-cursor'() {
        const editor = atom.workspace.getActiveTextEditor();
        const position = editor.getLastCursor().getBufferPosition();
        DataLoader.openInWebAtPosition(editor, position);
      },
    }));

    const scheme = new LinkScheme('kite-atom-internal');
    this.subscriptions.add(scheme);
    this.subscriptions.add(scheme.onDidClickLink(({uri}) => {
      console.log(`link to ${uri} clicked`);
    }));

    this.subscriptions.add(atom.commands.add('kite-expand', {
      'core:cancel'() { this.remove(); },
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'kite:show-expanded-function-panel'() {
        appendExpand(require('../spec/fixtures/test/increment.json'));
      },
      'kite:show-expanded-instance-panel'() {
        appendExpand(require('../spec/fixtures/variable.json'));
      },
      'kite:show-expanded-module-panel'() {
        appendExpand(require('../spec/fixtures/os.json'));
      },
    }));

    if (!atom.packages.getLoadedPackage('autocomplete-python') && !atom.inSpecMode()) {
      this.trackCompletions();
    }

    function appendExpand(data) {
      const KiteExpand = require('./elements/kite-expand');
      const expand = new KiteExpand();

      expand.setData([data]);
      expand.style.cssText = `
        position: fixed;
        right: 40px;
        top: 40px;
        z-index: 1000;
      `;
      document.body.appendChild(expand);
      expand.focus();
    }
  },

  connect() {
    const editor = atom.workspace.getActiveTextEditor();
    return editor
      ? this.checkTextEditor(atom.workspace.getActiveTextEditor())
      : this.app.connect();
  },

  checkTextEditor(editor) {
    return this.app.checkPath(editor.getPath()).then(state => {
      // we only subscribe to the editor if it's a
      // python file in a whitelisted directory
      if (this.isGrammarSupported(editor) &&
          state === KiteApp.STATES.WHITELISTED) {
        this.subscribeToEditor(editor);
        this.whitelistedEditorIDs[editor.id] = true;
      }
    });
  },

  deactivate() {
    // Release all subscriptions on deactivation
    this.subscriptions.dispose();
    delete this.subscriptionsByEditorID;
  },

  selfUpdate() {
    var apm = atom.packages.getApmPath();
    child_process.spawn(apm, ['update', 'kite']);
  },

  consumeStatusBar(statusbar) {
    statusbar.addRightTile({item: this.getStatusItem()});
  },

  getStatusItem() {
    if (this.status) { return this.status; }

    this.status = new KiteStatus();
    return this.status;
  },

  completions() {
    return completions;
  },

  isGrammarSupported(editor) {
    return /\.py$/.test(editor.getPath() || '');
  },

  subscribeToEditor(editor) {
    // We don't want to subscribe twice to the same editor
    if (this.subscriptionsByEditorID[editor.id]) {
      return;
    }

    const expandGesture = new WordSelectionGesture(editor);
    const cursorGesture = new CursorMoveGesture(editor);
    const hoverGesture = new HoverGesture(editor, {
      ignoredSelector: 'atom-overlay, atom-overlay *',
    });
    const subs = new CompositeDisposable();
    this.subscriptions.add(subs);
    this.subscriptionsByEditorID[editor.id] = subs;

    subs.add(new EditorEvents(editor));
    subs.add(hoverGesture);
    subs.add(expandGesture);
    subs.add(cursorGesture);

    // We don't want hover to make the expand panel disappear, so we're
    // pausing the hover gesture until the expand panel is dismissed.
    // Moving a cursor wil still hide the expand panel though.
    subs.add(OverlayManager.onDidShowExpand(() => {
      hoverGesture.pause();
    }));

    subs.add(OverlayManager.onDidDismiss(() => {
      hoverGesture.resume();
    }));

    subs.add(hoverGesture.onDidActivate(position => {
      OverlayManager.showHoverAtPositionWithDelay(editor, position);
    }));

    subs.add(cursorGesture.onDidActivate(position => {
      OverlayManager.showHoverAtPositionWithDelay(editor, position);
    }));

    subs.add(expandGesture.onDidActivate(position => {
      OverlayManager.showExpandAtPosition(editor, position);
    }));

    subs.add(editor.onDidDestroy(() => {
      subs.dispose();
      this.subscriptions.remove(subs);
      delete this.subscriptionsByEditorID[editor.id];
    }));
  },

  trackCompletions() {
    atom.packages.activatePackage('autocomplete-plus')
    .then(autocompletePlus => {
      const { getSuggestions } = completions;
      completions.getSuggestions = (...args) => {
        return getSuggestions.apply(completions, args)
          .then(suggestions => {
            completions.lastSuggestions = suggestions;
            return suggestions;
          }).catch(err => {
            completions.lastSuggestions = [];
            throw err;
          });
      };

      const autocompleteManager = autocompletePlus.mainModule.getAutocompleteManager();

      if (!autocompleteManager || !autocompleteManager.confirm || !autocompleteManager.displaySuggestions) { return; }

      const safeConfirm = autocompleteManager.confirm;
      const safeDisplaySuggestions = autocompleteManager.displaySuggestions;
      autocompleteManager.displaySuggestions = (suggestions, options) => {
        this.trackSuggestions(suggestions, autocompleteManager.editor);
        return safeDisplaySuggestions.call(autocompleteManager, suggestions, options);
      };

      autocompleteManager.confirm = suggestion => {
        this.trackUsedSuggestion(suggestion, autocompleteManager.editor);
        return safeConfirm.call(autocompleteManager, suggestion);
      };
    });
  },

  trackSuggestions(suggestions, editor) {
    if (/\.py$/.test(editor.getPath())) {
      let hasKiteSuggestions = suggestions.some(s => s.provider === completions);

      if (hasKiteSuggestions) {
        this.track('Atom shows Kite completions');
      } else {
        this.track('Atom shows no Kite completions');
      }
    }
  },

  trackUsedSuggestion(suggestion, editor) {
    if (/\.py$/.test(editor.getPath())) {
      if (completions.lastSuggestions &&
          completions.lastSuggestions.includes(suggestion)) {
        this.track('used completion returned by Kite', suggestion.text);
      } else {
        this.track('used completion not returned by Kite', suggestion.text);
      }
    }
  },

  hasSameSuggestion(suggestion, suggestions) {
    return suggestions.some(s => s.text === suggestion.text);
  },

  track(msg, data) {
    metrics.track(msg, data);
  },
};
