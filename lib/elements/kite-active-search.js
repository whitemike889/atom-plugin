'use strict';

const {StateController, Logger} = require('kite-installer');
const {CompositeDisposable} = require('atom');
const {searchPath} = require('../urls');
const {promisifyReadResponse, addDelegatedEventListener, DisposableEvent} = require('../utils');

class KiteActiveSearch extends HTMLElement {
  static initClass() {
    atom.commands.add('kite-active-search', {
      'core:move-up'() {
        this.selectPreviousItem();
      },
      'core:move-down'() {
        this.selectNextItem();
      },
      'core:cancel'() {
        this.textEditor.setText('');
        this.collapse();
      },
      // 'core:confirm'() {
      //   this.toggleSelectedItem();
      // },
    });

    return document.registerElement('kite-active-search', {
      prototype: this.prototype,
    });
  }

  createdCallback() {
    this.setAttribute('tabindex', -1);
    this.collapse();
    this.hide();

    this.innerHTML = `
      <div class="select-list popover-list">
        <atom-text-editor mini placeholder-text="Search…"></atom-text-editor>
        <ol class="list-group"></ol>
      </div>
      <kite-expand style="display: none;"></kite-expand>
      <div class="expander icon-search"></div>
    `;

    this.subscriptions = new CompositeDisposable();
    this.textEditorView = this.querySelector('atom-text-editor');
    this.textEditor = this.textEditorView.getModel();
    this.expandView = this.querySelector('kite-expand');
    this.expander = this.querySelector('.expander');
    this.list = this.querySelector('ol');

    this.expandView.removeAttribute('tabindex');

    this.subscriptions.add(atom.config.observe('kite.activeSearchPosition', (pos, oldPos) => {
      this.setAttribute('position', pos);
    }));
    this.subscriptions.add(addDelegatedEventListener(this.list, 'click', 'li', e => {
      const {target} = e;
      this.selectItem(target);
    }));

    this.subscriptions.add(new DisposableEvent(this.expander, 'click', () => {
      this.expand();
    }));

    this.subscriptions.add(this.textEditor.onDidChange(() => {
      const text = this.textEditor.getText().trim();

      if (text !== '') {
        const path = searchPath(text);

        StateController.client.request({path}).then(resp => {
          Logger.logResponse(resp);
          if (resp.statusCode !== 200) {
            return promisifyReadResponse(resp).then(data => {
              throw new Error(`bad status ${resp.statusCode}: ${data}`);
            });
          }

          return promisifyReadResponse(resp);
        })
        .then(data => JSON.parse(data))
        .then(data => this.renderList(data));
      } else {
        this.clear();
      }
    }));
  }

  show() {
    this.style.display = '';
  }

  hide() {
    this.style.display = 'none';
  }

  collapse() {
    this.classList.add('collapsed');
  }

  expand() {
    this.classList.remove('collapsed');
    this.textEditorView.focus();
  }

  setApp(app) {
    this.app = app;
  }

  clear() {
    this.expandView.style.display = 'none';
    this.list.innerHTML = '';
    delete this.selectedItem;
  }

  renderList(results) {
    this.list.innerHTML = results.results.map(r =>
      `<li data-id="${r.result.id}">${r.result.repr}</li>`).join('');
    this.selectNextItem();
  }

  selectNextItem() {
    if (this.list.childNodes.length === 0) { return; }

    if (this.selectedItem && this.selectedItem.nextSibling) {
      this.selectItem(this.selectedItem.nextSibling);
    } else {
      this.selectItem(this.list.firstChild);
    }
  }

  selectPreviousItem() {
    if (this.list.childNodes.length === 0) { return; }

    if (this.selectedItem && this.selectedItem.previousSibling) {
      this.selectItem(this.selectedItem.previousSibling);
    } else {
      this.selectItem(this.list.lastChild);
    }
  }

  selectItem(item) {
    this.selectedItem && this.selectedItem.classList.remove('selected');
    this.selectedItem = item;
    this.selectedItem.classList.add('selected');
    this.loadItem(item.getAttribute('data-id'));
  }

  loadItem(id) {
    this.expandView.style.display = '';
    this.expandView.showDataForId(atom.workspace.getActiveTextEditor(), id);
  }
}

module.exports = KiteActiveSearch.initClass();
