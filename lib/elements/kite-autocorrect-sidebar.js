'use strict';

const {CompositeDisposable, TextEditor} = require('atom');
const {parent, DisposableEvent, stopPropagationAndDefault, addDelegatedEventListener} = require('../utils');
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
      <div class="kite-sidebar-resizer"></div>
      <div class="kite-column">
        <header>
          <button class="btn icon icon-x"></button>
        </header>
        <div class="content"></div>
        <footer>
          <label>
            <input type="checkbox"></input>
            Show this panel on every save
          </label>
        </footer>
      </div>
    `;

    this.closeBtn = this.querySelector('button.btn.icon-x');
    this.content = this.querySelector('.content');
    this.resizeHandle = this.querySelector('.kite-sidebar-resizer');
    this.input = this.querySelector('input');
    this.element = this;
  }

  // Show hint or confirmation when the user hovers or clicks thumbs up/down
  showFeedbackFeedback(target, message, {confirmation}={}) {
    let el = parent(target, '.feedback-actions').querySelector('.feedback-feedback')
    el.classList.add(confirmation ? 'confirmation' : 'hint')
    el.innerHTML = message;
  }

  hideFeedbackFeedback(target) {
    let el = parent(target, '.feedback-actions').querySelector('.feedback-feedback')
    el.classList.remove('hint')
  }

  attachedCallback() {
    this.classList.toggle('dockable', this.Kite.isUsingDockForSidebar());

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.config.observe('kite.openAutocorrectSidebarOnSave', (v) => {
      this.input.checked = v;
    }));

    if (atom.workspace.onDidChangeActiveTextEditor) {
      this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(() => {
        this.renderDiffs(this.getCurrentEditorCorrectionsHistory());
      }));
    } else {
      this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(item => {
        if (item instanceof TextEditor) {
          this.renderDiffs(this.getCurrentEditorCorrectionsHistory());
        }
      }));
    }

    this.subscriptions.add(new DisposableEvent(this.input, 'change', (e) => {
      atom.config.set('kite.openAutocorrectSidebarOnSave', this.input.checked);
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'click', '.thumb-up', (e) => {
      DataLoader.postAutocorrectFeedbackData(this.getCurrentEditorLastCorrections(), +1);
      e.target.classList.add('clicked');
      parent(e.target, '.diff').classList.add('feedback-sent');

      this.showFeedbackFeedback(e.target, 'Thanks for your feedback!', {confirmation: true})
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'click', '.thumb-down', (e) => {
      DataLoader.postAutocorrectFeedbackData(this.getCurrentEditorLastCorrections(), -1);
      e.target.classList.add('clicked');
      parent(e.target, '.diff').classList.add('feedback-sent');

      this.showFeedbackFeedback(e.target, 'Thank you for your feedback!', {confirmation: true})
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'mouseover', '.thumb-up', (e) => {
      this.showFeedbackFeedback(e.target, 'Send feedback to Kite if you like this change',
          {confirmation: false})
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'mouseover', '.thumb-down', (e) => {
      this.showFeedbackFeedback(e.target, 'Send feedback to Kite if you don’t like this change',
          {confirmation: false})
    }));

    this.subscriptions.add(addDelegatedEventListener(this, 'mouseout', '.thumb-up, .thumb-down', (e) => {
      this.hideFeedbackFeedback(e.target)
    }));

    if (!this.Kite.isUsingDockForSidebar()) {
      this.subscriptions.add(new DisposableEvent(this.closeBtn, 'click', (e) => {
        atom.commands.dispatch(this, 'kite:close-autocorrect-sidebar');
      }));

      this.subscriptions.add(new DisposableEvent(this.resizeHandle, 'mousedown', e => {
        this.startResize(e);
      }));

      this.subscriptions.add(atom.config.observe('kite.sidebarWidth', (width) => {
        this.style.width = `${width}px`;
      }));
    } else {
      this.style.width = null;
    }

    this.renderDiffs(this.getCurrentEditorCorrectionsHistory());
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
    if (history) {
      const diffsHTML = history.map(fix =>
        `<div class="diff">
          <div class="timestamp">
            Fixed ${fix.diffs.length} ${fix.diffs.length === 1 ? 'error' : 'errors'} on ${fix.timestamp}
          </div>
          ${fix.diffs.map(diff =>
            [
              '<code class="diff-content">',
              diff.deleted.map(del => `<del>
                <div class="line-number">${del.line + 1}</div>
                <div class="line">${del.text}</div>
              </del>`).join(''),
              diff.inserted.map(ins => `<ins>
                <div class="line-number">${ins.line + 1}</div>
                <div class="line">${ins.text}</div>
              </ins>`).join(''),
              '</code>',
            ].join('')
          ).join('')}
          <div class="feedback-actions">
            <a class="thumb-up" aria-label="Send feedback to Kite if you like this change">👍</a>
            <a class="thumb-down" aria-label="Send feedback to Kite if you don’t like this change">👎</a>
            <span class="feedback-feedback"></span>
          </div>
        </div>`
      ).join('');

      this.content.innerHTML = `
        <div class="file">Corrections in ${filename}</div>
        <div class="diffs">${diffsHTML}</div>
      `;
    } else {
      this.content.innerHTML = '';
    }
  }

  startResize(e) {
    const {pageX} = e;
    const initial = {
      startX: pageX,
      startWidth: this.offsetWidth,
      position: atom.config.get('kite.sidebarPosition'),
    };
    this.sizeChangedProgrammatically = true;
    this.initializeDragEvents(window, {
      'mousemove': stopPropagationAndDefault(e => this.resize(e, initial)),
      'mouseup': stopPropagationAndDefault(e => this.endResize(e, initial)),
    });
  }

  resize(e, {startX, startWidth, position}) {
    const {pageX} = e;
    const dif = pageX - startX;
    let width;

    if (position === 'left') {
      width = Math.min(1000, Math.max(100, startWidth + dif));
    } else {
      width = Math.min(1000, Math.max(100, startWidth - dif));
    }

    atom.config.set('kite.sidebarWidth', width);
  }

  endResize(e) {
    this.sizeChangedProgrammatically = false;
    this.dragSubscription.dispose();
    this.subscriptions.remove(this.dragSubscription);
  }

  initializeDragEvents(object, events) {
    this.dragSubscription = new CompositeDisposable();
    for (let event in events) {
      const callback = events[event];
      this.dragSubscription.add(new DisposableEvent(object, event, callback));
    }
    this.subscriptions.add(this.dragSubscription);
  }
}

module.exports = KiteAutocorrectSidebar.initClass();
