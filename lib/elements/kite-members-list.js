'use strict';

const fuzzaldrin = require('fuzzaldrin-plus');
const {CompositeDisposable} = require('atom');
const {renderMember} = require('./html-utils');
const {DisposableEvent} = require('../utils');

class KiteMembersList extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-members-list', {
      prototype: this.prototype,
    });
  }

  setData(data) {
    this.members = data.members;

    this.subscriptions = new CompositeDisposable();

    this.innerHTML = `
    <header class="settings-view">
      <atom-text-editor mini></atom-text-editor>
      <select class="form-control">
        <option value="unordered">No order</option>
        <option value="alphabetical_asc">Alphabetical</option>
      </select>
    </header>

    <div class="members-list">
      <ul>${this.members.map(m => renderMember(m)).join('')}</ul>
    </div>
    `;

    this.list = this.querySelector('ul');
    this.select = this.querySelector('select');
    this.editor = this.querySelector('atom-text-editor').getModel();

    this.subscriptions.add(new DisposableEvent(this.select, 'change', (e) => {
      this.sort(this.getSort());
    }));

    this.subscriptions.add(this.editor.onDidChange(() => {
      const query = this.editor.getText();
      const o = this.fuzzyFilter(query);

      for (const name in o) {
        const {score, matches} = o[name];
        const element = this.list.querySelector(`[data-name="${name}"]`);
        const repr = element.querySelector('.repr');

        element.style.display = score > 0 ? '' : 'none';

        if (matches.length > 0) {
          repr.innerHTML = '';
          repr.appendChild(this.buildMatchLabel(name, matches));
        } else {
          repr.textContent = name;
        }
      }

      if (query.length > 0) {
        this.sort((a, b) => o[b.name].score - o[a.name].score);
      } else {
        this.sort(this.getSort());
      }
    }));
  }

  sort(method) {
    this.applySort(this.members.slice().sort(method));
  }

  getSort() {
    switch (this.select.value) {
      case 'alphabetical_asc':
        const collator = this.getCollator();
        return (a, b) => collator.compare(a.name, b.name);
      default:
        return (a, b) => 0;
    }
  }

  applySort(sorted) {
    sorted.forEach((item, i) => {
      this.list.querySelector(`[data-name="${item.name}"]`).style.order = i;
    });
  }

  getCollator() {
    return this.collator
      ? this.collator
      : (this.collator = new Intl.Collator('en-US', {numeric: true}));
  }

  fuzzyFilter(query) {
    if (query.length === 0) {
      return this.members.reduce((m, i) => {
        m[i.name] = {score: 1, matches: []};
        return m;
      }, {});
    } else {
      return this.members.reduce((m, item) => {
        m[item.name] = {
          matches: fuzzaldrin.match(item.name, query),
          score: fuzzaldrin.score(item.name, query),
        };
        return m;
      }, {});
    }
  }

  buildMatchLabel(string, matches) {
    const span = document.createElement('span');
    span.title = name;

    let matchedChars = [];
    let lastIndex = 0;
    for (const matchIndex of matches) {
      const unmatched = string.substring(lastIndex, matchIndex);
      if (unmatched) {
        if (matchedChars.length > 0) {
          const matchSpan = document.createElement('span');
          matchSpan.classList.add('character-match');
          matchSpan.textContent = matchedChars.join('');
          span.appendChild(matchSpan);
          matchedChars = [];
        }

        span.appendChild(document.createTextNode(unmatched));
      }

      matchedChars.push(string[matchIndex]);
      lastIndex = matchIndex + 1;
    }

    if (matchedChars.length > 0) {
      const matchSpan = document.createElement('span');
      matchSpan.classList.add('character-match');
      matchSpan.textContent = matchedChars.join('');
      span.appendChild(matchSpan);
    }

    const unmatched = string.substring(lastIndex);
    if (unmatched) {
      span.appendChild(document.createTextNode(unmatched));
    }

    return span;
  }
}

module.exports = KiteMembersList.initClass();
