'use strict';
const relativeDate = require('tiny-relative-date');
const {Emitter, CompositeDisposable, TextEditor} = require('atom');
const {parent, DisposableEvent, addDelegatedEventListener} = require('../utils');
const DataLoader = require('../data-loader');

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
    return 'Kite Autocorrect';
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
          <a href="#" class="icon icon-question"></a>
          <div class="settings-panel">
            <div class="control-group checkbox">
              <label>
                <input type="checkbox" class="input-checkbox"></input>
                <div class="setting-title">Enable automatic code clean-up</div>
              </label>
            </div>
            <div class="control-group select">
              <label>
                <div class="setting-title">Any time kite fixes code:</div>
                <select type="checkbox" class="form-control">
                  <option>Reopen this sidebar</option>
                  <option>Cleanup quietly</option>
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
    el.classList.add(confirmation ? 'confirmation' : 'hint');
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
      e.target.classList.add('clicked');
      parent(e.target, '.diff').classList.add('feedback-sent');

      this.showFeedbackFeedback(e.target, 'Thanks for your feedback!', {confirmation: true});
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'click', '.thumb-down', (e) => {
      DataLoader.postAutocorrectFeedbackData(this.getCurrentEditorLastCorrections(), -1);
      e.target.classList.add('clicked');
      parent(e.target, '.diff').classList.add('feedback-sent');

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
  }

  getCurrentEditorLastCorrections() {
    const editor = atom.workspace.getActiveTextEditor();
    const kiteEditor = this.Kite.kiteEditorForEditor(editor);
    return kiteEditor && kiteEditor.lastCorrectionsData;
  }
  getCurrentEditorCorrectionsHistory() {
    const editor = atom.workspace.getActiveTextEditor();
    const kiteEditor = this.Kite.kiteEditorForEditor(editor);
    return [kiteEditor && kiteEditor.fixesHistory, editor.getFileName()];
  }

  renderDiffs([history, filename] = []) {
    if (history && history.length) {
      const diffsHTML = history.map((fix, index) => {
        let html = '';
        switch (index) {
          case 0:
            html += `<div class="diff">
                <div class="file">Most recent code fixes</div>`;
            break;
          case 1:
            html += `<div class="diff history">
                <div class="file">Earlier corrections</div>`;
            break;
          default:
            html += '<div class="diff history">';
            break;
        }

        html += `
          <div class="timestamp">
            Fixed ${fix.diffs.length} ${fix.diffs.length === 1 ? 'error' : 'errors'} ${relativeDate(fix.timestamp)}
          </div>
          ${fix.diffs.map(d => this.renderDiff(d)).join('')}
          <div class="feedback-actions">
            <a class="thumb-up" aria-label="Send feedback to Kite if you like this change">👍</a>
            <a class="thumb-down" aria-label="Send feedback to Kite if you don’t like this change">👎</a>
            <span class="feedback-feedback"></span>
          </div>
        </div>`;

        return html;
      }).join('');

      this.content.innerHTML = `<div class="diffs">${diffsHTML}</div>`;
    } else {
      this.content.innerHTML = `
        <div class="diff">
          <div class="file">Most recent code fixes</div>
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
    this.appendMessage(`<h5>Kite just fixed your code for the first time</h5>
    <p>
      Kite will automatically fix the most common mistakes when
      you save your file. Automatic code clean-up uses machine learning
      and your feedback to constantly get better.
    </p>
    <a href="#">Learn about automatic code clean-up</a>`);

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

    return emphasis.reduce((t, {start_runes, end_runes}) => {
      const newText = `${
        text.slice(0, start_runes + offset)
      }<strong>${
        text.slice(start_runes + offset, end_runes + offset)
      }</strong>${
        text.slice(end_runes + offset)
      }`;

      offset += offsetIncrement;

      return newText;
    }, text);
  }

  loadModelInfo(version) {
    DataLoader.getAutocorrectModelInfo(version).then(data => {

      this.renderModelInfo(data);

      if (!this.isActivePaneItem()) {
        this.tabIcon = 'issue-opened';
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
      <h5>Just added ${relativeDate(data.date_shipped)}</h5>
      ${data.examples.map((e) => {
        return `
          <p>${e.synopsis}</p>
          ${this.renderDiff(e)}`;
      }).join('')}
      <a href="#">Learn about automatic code clean-up</a>
    `;

    this.appendMessage(html);
  }
}

module.exports = KiteAutocorrectSidebar.initClass();
