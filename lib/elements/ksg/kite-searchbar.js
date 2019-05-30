'use strict';

const { TextEditor, CompositeDisposable, Emitter } = require('atom');
const debounce = require('lodash/debounce');

const { DisposableEvent } = require('../../utils');
const { 
  SEARCH_CLICKED, 
  SEARCH_DEBOUNCE, 
  SEARCH_QUERY_EVENT,
  SEARCH_QUERY_SELECTION_EVENT,
  SEARCH_NAV_DOWN,
  SEARCH_NAV_UP,
} = require('../../ksg/constants');

class KSGSearch extends HTMLElement {
  constructor() {
    super();

    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    
    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'kite-ksg-search-wrapper');

    this.searchInput = new TextEditor({ placeholderText: 'Search the webz...', mini: true });

    this.shouldCancelChangeQuery = false;
  
    this.searchInputView = this.searchInput.getElement();

    this.subscriptions.add(new DisposableEvent(this.searchInputView, 'focusout', (e) => {
      if (e.target !== this.searchInputView) {
        this.searchResults && this.searchResults.clearHighlight();
      }
    }));

    const debouncedSearchHandler = debounce((e) => {
      if (!this.shouldCancelChangeQuery) {
        this.emitter.emit(SEARCH_QUERY_EVENT, { query: this.searchInput.getText() });
      } else {
        this.shouldCancelChangeQuery = false;
      }
    }, SEARCH_DEBOUNCE, { leading: true });


    this.subscriptions.add(this.searchInput.onDidChange(debouncedSearchHandler));

    // STUB
    this.subscriptions.add(new DisposableEvent(this.searchInputView, 'click', (e) => {
      console.log('SEARCH EVENT');
      this.emitter.emit(SEARCH_CLICKED, {payload: 'search'});
    }));

    // how will this top layer interact with the bottom layer when both need to listen to the `Enter` key?
    // `target`?
    this.subscriptions.add(new DisposableEvent(this, 'keydown', (e) => {
      switch (e.code) {
        case 'ArrowDown':
          this.searchResults && this.searchResults.moveSelection(SEARCH_NAV_DOWN);
          break;

        case 'ArrowUp':
          this.searchResults && this.searchResults.moveSelection(SEARCH_NAV_UP);
          break;

        case 'Enter':
          if (this.searchResults && this.searchResults.hasSelected()) {
            // make selected query logic
            this.shouldCancelChangeQuery = true;
            this.searchInput.setText(this.searchResults.selectedQuery);
            this.searchResults.clear();
            this.emitter.emit(SEARCH_QUERY_SELECTION_EVENT, { query: this.searchInput.getText() });
          } else {
            // send current input
            if (this.searchInput.getText()) {
              this.searchResults && this.searchResults.clear();
              this.emitter.emit(SEARCH_QUERY_SELECTION_EVENT, { query: this.searchInput.getText() });
            }
          }
      }
    }));

    this.wrapper.appendChild(this.searchInputView);
    this.appendChild(this.wrapper);
  }

  connectedCallback() {
    this.setFocus();
  }

  disconnectedCallback() {
    this.dispose();
  }

  dispose() {
    this.clearSearchResults();
    this.searchResults && this.searchResults.dispose();
    this.searchResults = null;
    this.subscriptions && this.subscriptions.dispose();
    this.emitter && this.emitter.dispose();
  }

  // STUB for wiring testing
  onDidGetClicked(callback) {
    return this.emitter.on(SEARCH_CLICKED, callback);
  }

  onSearchQueryEvent(callback) {
    return this.emitter.on(SEARCH_QUERY_EVENT, callback);
  }

  onSearchQuerySelection(callback) {
    return this.emitter.on(SEARCH_QUERY_SELECTION_EVENT, callback);
  }

  clearSearchResults() {
    this.searchResults && this.searchResults.clear();
  }

  updateView({ data }) {
    if (!this.searchResults) {
      this.searchResults = new KSGSearchResults();
      this.wrapper.appendChild(this.searchResults);

      this.subscriptions.add(this.searchResults.onResultPropagation((resultText) => {
        this.shouldCancelChangeQuery = true;
        this.searchInput.setText(resultText);
        this.searchResults.clear();
        this.emitter.emit(SEARCH_QUERY_SELECTION_EVENT, { query: this.searchInput.getText() });
      }));
    }
    this.clearSearchResults();

    if (data && data.completions && data.completions.length > 0) {
      this.searchResults.appendResults(data.completions);
    }
    
    console.log('SEARCH UPDATE VIEW', data);
  }

  setFocus() {
    this.searchInputView.focus();
    this.searchInput.moveToBottom();
  }
}

class KSGSearchResults extends HTMLElement {
  constructor() {
    super();

    this.selectedIdx = null;
    this.results = [];
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
  }

  dispose() {
    this.clear();
    this.emitter && this.emitter.dispose();
    this.subscriptions && this.subscriptions.dispose();
  }

  appendResults(results) {
    // to batch the DOM changes
    const fragment = document.createDocumentFragment();
    results.forEach(result => {
      const el = new KSGSearchResult(result);
      fragment.appendChild(el);
      this.results.push(el);
      this.subscriptions.add(el.onResultClick((resultText) => {
        this.emitter.emit('did-search-result-propagate', resultText);
      }));
    });
    this.appendChild(fragment);
  }

  onResultPropagation(callback) {
    return this.emitter.on('did-search-result-propagate', callback);
  }

  moveSelection(direction) {
    switch (direction) {
      case SEARCH_NAV_DOWN:
        if (this.selectedIdx === null) {
          this.selectedIdx = 0;
          this.results[this.selectedIdx].toggleHighlight();
        } else if (this.selectedIdx < this.results.length - 1) {
          this.results[this.selectedIdx].toggleHighlight();
          this.selectedIdx++;
          this.results[this.selectedIdx].toggleHighlight();
        }
        break;

      case SEARCH_NAV_UP:
        if (this.selectedIdx !== null) {
          this.results[this.selectedIdx].toggleHighlight();
          if (this.selectedIdx === 0) {
            this.selectedIdx = null;
          } else {
            this.selectedIdx--;
            this.results[this.selectedIdx].toggleHighlight();
          }
        }
        break;
    }
  }

  get selectedQuery() {
    if (this.selectedIdx !== null) {
      return this.results[this.selectedIdx].resultText;
    }
    return null;
  }

  hasSelected() {
    return this.selectedIdx !== null;
  }

  clearHighlight() {
    if (this.selectedIdx !== null) {
      this.results[this.selectedIdx].toggleHighlight();
      this.selectedIdx = null;
    }
  }

  clear() {
    while (this.lastChild) {
      this.lastChild.dispose && this.lastChild.dispose();
      this.removeChild(this.lastChild);
    }

    this.selectedIdx = null;
    this.results = [];
  }
}

class KSGSearchResult extends HTMLElement {
  constructor(resultText) {
    super();

    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(new DisposableEvent(this, 'click', (e) => {
      this.emitter.emit('search-result-clicked', this.resultText);
    }));

    this.resultText = resultText;
    this.isHighlighted = false;

    this.appendChild(document.createTextNode(this.resultText));
  }

  dispose() {
    this.emitter && this.emitter.dispose();
    this.subscriptions && this.subscriptions.dispose();
  }

  onResultClick(callback) {
    return this.emitter.on('search-result-clicked', callback);
  }

  toggleHighlight() {
    if (this.isHighlighted) {
      this.classList.remove('highlight-result');
    } else {
      this.classList.add('highlight-result');
    }
    this.isHighlighted = !this.isHighlighted;
  }
}

customElements.define('kite-ksg-search-results', KSGSearchResults);
customElements.define('kite-ksg-search-result', KSGSearchResult);
customElements.define('kite-ksg-search', KSGSearch);
module.exports = KSGSearch;