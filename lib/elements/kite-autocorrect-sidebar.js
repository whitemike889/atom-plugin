'use strict';

const {CompositeDisposable} = require('atom');
const {DisposableEvent, stopPropagationAndDefault} = require('../utils');

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

  attachedCallback() {
    this.classList.toggle('dockable', this.Kite.isUsingDockForSidebar());

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.config.observe('kite.openAutocorrectSidebarOnSave', (v) => {
      this.input.checked = v;
    }));

    this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(() => {
      this.renderDiffs();
    }));

    this.subscriptions.add(new DisposableEvent(this.input, 'change', (e) => {
      atom.config.set('kite.openAutocorrectSidebarOnSave', this.input.checked);
    }));

    if (!this.Kite.isUsingDockForSidebar()) {
      this.subscriptions.add(new DisposableEvent(this.closeBtn, 'click', (e) => {
        atom.commands.dispatch(this, 'kite:close-sidebar');
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

    this.renderDiffs();
  }

  detachedCallback() {
    this.subscriptions.dispose();
  }

  renderDiffs() {
    const editor = atom.workspace.getActiveTextEditor();
    const kiteEditor = this.Kite.kiteEditorForEditor(editor);

    if (kiteEditor) {
      const diffsHTML = kiteEditor.fixesHistory.map(fix =>
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
        </div>`
      ).join('');

      this.content.innerHTML = `
        <div class="file">Corrections in ${editor.getFileName()}</div>
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
