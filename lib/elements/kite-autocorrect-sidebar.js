'use strict';
const relativeDate = require('tiny-relative-date');
const {Emitter, CompositeDisposable, TextEditor} = require('atom');
const {parent, stripLeadingSlash, DisposableEvent, addDelegatedEventListener} = require('../utils');
const DataLoader = require('../data-loader');
const metrics = require('../metrics');

const URI = 'atom://kite-autocorrect-sidebar';

class KiteAutocorrectSidebar extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-autocorrect-sidebar', {
      prototype: this.prototype,
    });
  }

  getURI() {
    return URI;
  }

  getIconName() {
    return this.tabIcon;
  }

  onDidChangeIcon(callback) {
    return this.emitter.on('did-change-icon', callback);
  }

  getTitle() {
    return 'Kite error rescue';
  }

  getPreferredLocation() {
    return atom.config.get('kite.sidebarPosition');
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }

  isPermanentDockItem() {
    return false;
  }

  getPreferredWidth() {
    return atom.config.get('kite.sidebarWidth');
  }

  createdCallback() {
    this.innerHTML = `
      <div class="kite-column">
        <div class="messages"></div>
        <div class="settings-view">
          <a href="http://help.kite.com" title="Learn about Kite error rescue" class="icon icon-question"></a>
          <div class="settings-panel">
            <div class="control-group checkbox">
              <label>
                <input type="checkbox" class="input-checkbox"></input>
                <div class="setting-title">Enable error rescue</div>
              </label>
            </div>
            <div class="control-group select">
              <label>
                <div class="setting-title">Any time code is fixed:</div>
                <select type="checkbox" class="form-control">
                  <option>Reopen this sidebar</option>
                  <option>Clean up quietly</option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <div class="content"></div>
      </div>
    `;

    this.emitter = new Emitter();
    this.messages = this.querySelector('.messages');
    this.content = this.querySelector('.content');
    this.input = this.querySelector('input');
    this.select = this.querySelector('select');
    this.element = this;
  }

  // Show hint or confirmation when the user hovers or clicks thumbs up/down
  showFeedbackFeedback(target, message, {confirmation} = {}) {
    let el = parent(target, '.feedback-actions').querySelector('.feedback-feedback');
    el.classList.toggle('confirmation', confirmation);
    el.classList.toggle('hint', !confirmation);
    el.innerHTML = message;
  }

  hideFeedbackFeedback(target) {
    let el = parent(target, '.feedback-actions').querySelector('.feedback-feedback');
    el.classList.remove('hint');
  }

  attachedCallback() {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.config.observe('kite.enableAutocorrect', (v) => {
      this.input.checked = v;
      parent(this.input, '.control-group').classList.toggle('checked', this.input.checked);
      parent(this.input, '.settings-view').classList.toggle('autocorrect-enabled', this.input.checked);
    }));

    this.subscriptions.add(atom.config.observe('kite.actionWhenKiteFixesCode', (v) => {
      this.select.value = v;
    }));

    if (atom.workspace.onDidChangeActiveTextEditor) {
      this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(() => {
        if (atom.workspace.getActiveTextEditor()) {
          this.renderDiffs(this.getCurrentEditorCorrectionsHistory());
        } else {
          this.clearContent();
        }
      }));
    } else {
      this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(item => {
        if (item instanceof TextEditor) {
          this.renderDiffs(this.getCurrentEditorCorrectionsHistory());
        } else {
          this.clearContent();
        }
      }));
    }

    this.subscriptions.add(atom.config.onDidChange('kite.actionWhenKiteFixesCode', ({oldValue}) => {
      if (oldValue === 'Reopen this sidebar') {
        metrics.sendFeatureMetric('atom_autocorrect_show_panel_disabled');
      } else {
        metrics.sendFeatureMetric('atom_autocorrect_show_panel_enabled');
      }
    }));

    this.subscriptions.add(new DisposableEvent(this.input, 'change', (e) => {
      parent(this.input, '.control-group').classList.toggle('checked', this.input.checked);
      atom.config.set('kite.enableAutocorrect', this.input.checked);
    }));

    this.subscriptions.add(new DisposableEvent(this.select, 'change', (e) => {
      atom.config.set('kite.actionWhenKiteFixesCode', this.select.value);
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'click', '.message-box .btn-close', (e) => {
      parent(e.target, '.message-box').remove();

      if (this.messages.matches(':empty')) {
        this.messages.classList.remove('has-messages');
      }
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'click', '.thumb-up', (e) => {
      DataLoader.postAutocorrectFeedbackData(this.getCurrentEditorLastCorrections(), +1);
      // Remove if clicked on another one before
      parent(e.target, '.diff').querySelectorAll('.clicked').forEach(el => el.classList.remove('clicked'));
      e.target.classList.add('clicked');

      this.showFeedbackFeedback(e.target, 'Thanks for your feedback!', {confirmation: true});
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'click', '.thumb-down', (e) => {
      DataLoader.postAutocorrectFeedbackData(this.getCurrentEditorLastCorrections(), -1);
      // Remove if clicked on another one before
      parent(e.target, '.diff').querySelectorAll('.clicked').forEach(el => el.classList.remove('clicked'));
      e.target.classList.add('clicked');

      this.showFeedbackFeedback(e.target, 'Thank you for your feedback!', {confirmation: true});
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'mouseover', '.thumb-up', (e) => {
      this.showFeedbackFeedback(e.target, 'Send feedback to Kite if you like this change',
          {confirmation: false});
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'mouseover', '.thumb-down', (e) => {
      this.showFeedbackFeedback(e.target, 'Send feedback to Kite if you don’t like this change',
          {confirmation: false});
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'mouseout', '.thumb-up, .thumb-down', (e) => {
      this.hideFeedbackFeedback(e.target);
    }));

    this.renderDiffs(this.getCurrentEditorCorrectionsHistory());
  }

  getPane() {
    return atom.workspace.paneForURI(this.getURI());
  }

  isActivePaneItem() {
    const pane = this.getPane();

    return pane && pane.activeItem === this;
  }

  clearContent() {
    this.content.innerHTML = '';
  }

  detachedCallback() {
    this.subscriptions.dispose();
    metrics.featureApplied('autocorrect', '_panel_closed');
  }

  getCurrentEditorLastCorrections() {
    const editor = atom.workspace.getActiveTextEditor();
    const kiteEditor = this.Kite.kiteEditorForEditor(editor);
    return kiteEditor && kiteEditor.lastCorrectionsData;
  }
  getCurrentEditorCorrectionsHistory() {
    const editor = atom.workspace.getActiveTextEditor();
    const kiteEditor = this.Kite.kiteEditorForEditor(editor);
    return [kiteEditor && kiteEditor.fixesHistory, editor.getFileName(), editor];
  }

  renderDiffs([history, filename, editor] = []) {
    if (history && history.length) {
      const diffsHTML = history.map((fix, index) => {
        let html = '';
        switch (index) {
          case 0:
            html += `<div class="diff">
                <h4>Most recent code fixes</h4>`;
            break;
          case 1:
            html += `<div class="diff history">
                <h4>Earlier fixes</h4>`;
            break;
          default:
            html += '<div class="diff history">';
            break;
        }

        const {row, column} = editor
          ? editor.getBuffer().positionForCharacterIndex(fix.diffs[0].new_buffer_offset_bytes)
          : {};

        html += `
          <div class="timestamp">
            Fixed ${relativeDate(fix.timestamp)}:
          </div>
          ${fix.diffs.map(d => this.renderDiff(d)).join('')}
          <kite-links class="feedback-actions">
            <a href="kite-atom-internal://goto/${encodeURI(stripLeadingSlash(editor ? editor.getPath() : filename))}:${row + 1}:${column + 1}"
               aria-label="">Go to code</a>
           <a class="thumb-up icon icon-thumbsup" aria-label="Send feedback to Kite if you like this change"></a>
           <a class="thumb-down icon icon-thumbsdown" aria-label="Send feedback to Kite if you don’t like this change"></a>
            <span class="feedback-feedback"></span>
          </kite-links>
        </div>`;

        return html;
      }).join('');

      this.content.innerHTML = `<div class="diffs">${diffsHTML}</div>`;
    } else {
      this.content.innerHTML = `
        <div class="diff">
          <h4>Most recent code fixes</h4>
          <div class="diffs">No fixes made to ${filename} yet.</div>
        </div>`;
    }
  }

  renderDiff(diff) {
    return [
      '<code class="diff-content">',
      (diff.deleted || diff.old).map(del => `<del>
          ${del.line != null ? `<div class="line-number">${del.line + 1}</div>` : ''}
          <div class="line">${this.addEmphasis(del.text, del.emphasis)}</div>
        </del>`).join(''),
      (diff.inserted || diff.new).map(ins => `<ins>
          ${ins.line != null ? `<div class="line-number">${ins.line + 1}</div>` : ''}
          <div class="line">${this.addEmphasis(ins.text, ins.emphasis)}</div>
        </ins>`).join(''),
      '</code>',
    ].join('');
  }

  showFirstRunExperience() {
    this.appendMessage(`<h4>Kite error rescue just fixed your code for the first time</h4>
    <p>
      Kite will automatically fix the most common mistakes when
      you save your file. Kite error rescue uses machine learning
      and your feedback to constantly get better.
    </p>
    <a href="http://help.kite.com">Learn about error rescue</a>`);
  }

  appendMessage(msg) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.innerHTML = `
      <button class="btn-close"><i class="icon icon-x"></i></button>
      ${msg}`;

    this.messages.classList.add('has-messages');
    this.messages.appendChild(messageBox);
  }

  addEmphasis(text, emphasis = []) {
    let offset = 0;
    const offsetIncrement = '<strong></strong>'.length;

    return emphasis && emphasis.length
      ? emphasis.reduce((t, {start_runes, end_runes}) => {
        const newText = `${
          text.slice(0, start_runes + offset)
        }<strong>${
          text.slice(start_runes + offset, end_runes + offset)
        }</strong>${
          text.slice(end_runes + offset)
        }`;

        offset += offsetIncrement;

        return newText;
      }, text)
      : text;
  }

  loadModelInfo(version) {
    DataLoader.getAutocorrectModelInfo(version).then(data => {

      this.renderModelInfo(data);

      if (!this.isActivePaneItem()) {
        this.tabIcon = 'info';
        this.emitter.emit('did-change-icon');

        const sub = this.getPane().onDidChangeActiveItem((item) => {
          if (item === this) {
            delete this.tabIcon;
            sub.dispose();
          }
        });
      }
    });
  }

  renderModelInfo(data) {
    const html = `
      <h4>Just added: New code fixes</h4>
      ${data.examples.map((e) => {
        return `
          <p>${e.synopsis}</p>
          ${this.renderDiff(e)}`;
      }).join('')}
      <a href="http://help.kite.com">Learn about error rescue</a>
    `;

    this.appendMessage(html);
  }
}

module.exports = KiteAutocorrectSidebar.initClass();
