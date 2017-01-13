'use strict';

// Contents of this plugin will be reset by Kite on start. Changes you make
// are not guaranteed to persist.

const child_process = require('child_process');
const {CompositeDisposable} = require('atom');
const {AccountManager} = require('kite-installer');
const events = require('./events.js');
const completions = require('./completions.js');
const ready = require('./ready.js');
const metrics = require('./metrics.js');

const HoverGesture = require('./gestures/hover');
const WordSelectionGesture = require('./gestures/word-selection');
const CursorMoveGesture = require('./gestures/cursor-move');
const OverlayManager = require('./overlay-manager');
const LinkScheme = require('./link-scheme');

module.exports = {
  activate: function() {
    AccountManager.initClient('127.0.0.1', 46624, '');

    // We store all the subscriptions into a composite disposable to release
    // them on deactivation
    this.subscriptions = new CompositeDisposable();

    // send the activated event
    metrics.track('activated');

    // install hooks for editor events and send the activate event
    this.subscriptions.add(events.onActivate());

    // install hooks for readiness checker and check that Kite is running
    this.subscriptions.add(ready.onActivate());

    // run "apm upgrade kite"
    if (!atom.inDevMode()) { this.selfUpdate(); }

    // watch for the user checking the "check kite status" config item
    var firstObservation = true;
    // A setting new value is passed as first argument to the observer function
    this.subscriptions.add(atom.config.observe('kite.checkReadiness', (checkReadiness) => {
      // atom always fires this observer when the observer is registered
      // but we do not want to show the notification at every startup
      if (firstObservation) {
        firstObservation = false;
        return;
      }

      // only respond when the checkbox is set to true
      if (!checkReadiness) {
        return;
      }

      // the config item is just a stand-in for a button so set it back to false
      setTimeout(() => {
        atom.config.set('kite.checkReadiness', false);
      }, 500);

      // check that kite is running and show a success notification if so
      metrics.track('readiness config checkbox touched');
      ready.ensureAndNotify();
    }));

    this.subscriptions.add(ready.onKiteReady(() => {
      this.subscriptions.add(atom.workspace.observeTextEditors(editor => {
        if (/\.py$/.test(editor.getPath() || '')) {
          const expandGesture = new WordSelectionGesture(editor);
          const cursorGesture = new CursorMoveGesture(editor);
          const hoverGesture = new HoverGesture(editor, {
            ignoredSelector: 'atom-overlay, atom-overlay *',
          });
          const subs = new CompositeDisposable();

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
            OverlayManager.showHoverAtPosition(editor, position);
          }));

          subs.add(cursorGesture.onDidActivate(position => {
            OverlayManager.showHoverAtPosition(editor, position);
          }));

          subs.add(expandGesture.onDidActivate(position => {
            OverlayManager.showExpandAtPosition(editor, position);
          }));

          subs.add(editor.onDidDestroy(() => {
            subs.dispose();
          }));
        }
      }));
    }));

    // Allow esc key to close expand view
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'core:cancel'() { OverlayManager.dismiss(); },
      'kite:expand-at-cursor'() {
        const editor = atom.workspace.getActiveTextEditor();
        const position = editor.getLastCursor().getBufferPosition();
        OverlayManager.showExpandAtPosition(editor, position);
      },
    }));

    // Allow esc key to close the login form
    this.subscriptions.add(atom.commands.add('.kite-login-panel', {
      'core:cancel'() { this.cancel(); },
    }));

    const scheme = new LinkScheme('kite-atom-internal');
    this.subscriptions.add(scheme);
    this.subscriptions.add(scheme.onDidClickLink(({uri}) => {
      console.log(`link to ${uri} clicked`);
    }));

    //
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

    function appendExpand(data) {
      const KiteExpand = require('./elements/kite-expand');
      const expand = new KiteExpand();

      expand.setData(data);
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
  deactivate: function() {
    // Release all subscriptions on deactivation
    this.subscriptions.dispose();
  },
  selfUpdate: function() {
    var apm = atom.packages.getApmPath();
    child_process.spawn(apm, ['update', 'kite']);
  },
  consumeStatusBar: function(statusbar) {
    statusbar.addRightTile({
      item: ready.getStatusItem(),
    });
  },
  completions: function() {
    return completions;
  },
};
