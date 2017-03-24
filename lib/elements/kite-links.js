'use strict';

const {CompositeDisposable} = require('atom');
const LinkScheme = require('../link-scheme');
const metrics = require('../metrics');
let Kite;

const stripLeadingSlash = str => str.replace(/^\//, '');

const parseRangeInPath = (path) =>
  stripLeadingSlash(path).split('/').map(s => s.split(':').map(Number));

const parseDefinitionInPath = (path) =>
  stripLeadingSlash(path).split(':');

class KiteLinks extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-links', {
      prototype: this.prototype,
    });
  }

  attachedCallback() {
    const metric = this.getAttribute('metric');
    this.subscriptions = new CompositeDisposable();
    this.scheme = new LinkScheme('kite-atom-internal', this);

    this.subscriptions.add(this.scheme);
    this.subscriptions.add(this.scheme.onDidClickLink(({url, target}) => {
      if (!Kite) { Kite = require('../kite'); }
      const editor = atom.workspace.getActiveTextEditor();
      const kiteEditor = Kite.kiteEditorForEditor(editor);

      if (!editor || !kiteEditor) { return; }

      switch (url.host) {
        case 'goto': {
          const [filename, line] = parseDefinitionInPath(url.path);
          kiteEditor.openDefinition({filename, line})
          .then(() => {
            metrics.track(`${metric} Go to definition clicked (with definition in report)`);
          });
          break;
        }
        case 'goto-id': {
          const id = stripLeadingSlash(url.path);
          kiteEditor.openDefinitionForId(id)
          .then(() => {
            metrics.track(`${metric} Go to definition clicked (with definition in report)`);
          })
          .catch(() => {
            metrics.track(`${metric} Go to definition clicked (without definition in report)`);
            atom.notifications.addWarning(`Can't find a definition for id \`${id}\``, {
              dismissable: true,
            });
          });
          break;
        }
        case 'goto-range': {
          const range = parseRangeInPath(url.path);
          kiteEditor.openDefinitionAtRange(range).then(res => {
            if (res) {
              metrics.track(`${metric} Go to definition clicked (with definition in report)`);
            } else {
              metrics.track(`${metric} Go to definition clicked (without definition in report)`);
            }
          });
          break;
        }
        case 'open-range': {
          const range = parseRangeInPath(url.path);
          kiteEditor.openInWebAtRange(range);
          break;
        }
        case 'expand': {
          const id = stripLeadingSlash(url.path);
          kiteEditor.expandId(id);
          break;
        }
        case 'expand-range': {
          const range = parseRangeInPath(url.path);
          kiteEditor.expandRange(range);
          break;
        }
      }
    }));
  }

  detachedCallback() {
    this.subscriptions.dispose();
  }
}

module.exports = KiteLinks.initClass();
