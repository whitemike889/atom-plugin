'use strict';

const { CompositeDisposable, Emitter } = require('atom');

const { DisposableEvent } = require('../../utils');

const { 
  CODEBLOCKS_CLICKED, 
  CODEBLOCKS_ADD, 
  CODEBLOCK_CLICKED,
  CODEBLOCKS_SELECTED,
} = require('../../ksg/constants');

class KSGCodeBlocks extends HTMLElement {
  constructor() {
    super();

    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.groups = [];

    this.addWrapper();
  }

  connectedCallback() {
    if (!this.subscriptions) { this.subscriptions = new CompositeDisposable(); }
    if (!this.emitter) { this.emitter = new Emitter(); }
    if (!this.wrapper) { this.addWrapper(); }
  }

  addWrapper() {
    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'kite-ksg-code-blocks-wrapper');
    this.appendChild(this.wrapper);
  }

  disconnectedCallback() {
    this.dispose();
  }

  dispose() {
    this.clearGroups();
    this.emitter && this.emitter.dispose();
    this.subscriptions && this.subscriptions.dispose();
    this.wrapper && this.wrapper.parentNode && this.wrapper.parentNode.removeChild(this.wrapper);
    this.wrapper = null;
    delete this.emitter;
    delete this.subscriptions;
  }

  // STUB for wiring testing
  onDidGetClicked(callback) {
    return this.emitter.on(CODEBLOCKS_CLICKED, callback);
  }

  clearGroups() {
    // we assume that subscriptions is only holding codeblock related stuff
    this.subscriptions && this.subscriptions.dispose();
    this.subscriptions = new CompositeDisposable();

    this.groups.forEach(group => {
      this.wrapper && this.wrapper.removeChild(group);
      group.dispose();
    });
    this.groups = [];
  }

  onCodeblocksSelected(callback) {
    return this.emitter && this.emitter.on(CODEBLOCKS_SELECTED, callback);
  }

  updateView({ data }) {
    this.clearGroups();

    if (data && data.answers && data.answers.length > 0) {
      // fragment strategy for appending
      const groupFragment = document.createDocumentFragment();
      data.answers.forEach(answer => {
        const groupEl = new KSGCodeBlockGroup(answer);
        // we assume that subscriptions is only holding codeblock related Disposables
        this.subscriptions.add(groupEl.onAddAll((payload) => {
          this.emitter.emit(CODEBLOCKS_SELECTED, payload);
        }));

        groupFragment.appendChild(groupEl);
        this.groups.push(groupEl);
      });
      this.wrapper.appendChild(groupFragment);
    }
  }
}

class KSGCodeBlockGroup extends HTMLElement {
  constructor(answer = {}) {
    super();

    const {
      question_title,
      votes,
      is_accepted,
      code_blocks,
      answer_id,
    } = answer;

    const topEl = document.createElement('div');
    const metaInfoEl = document.createElement('div');
    const titleEl = document.createElement('span');
    const voteEl = document.createElement('span');
    const actionsEl = document.createElement('div');
    const addAllEl = document.createElement('span');

    topEl.setAttribute('class', 'ksg-codeblock-group-top');
    metaInfoEl.setAttribute('class', 'ksg-codeblock-group-meta');
    titleEl.setAttribute('class', 'ksg-codeblock-group-title');
    voteEl.setAttribute('class', 'ksg-codeblock-group-vote');
    actionsEl.setAttribute('class', 'ksg-codeblock-group-actions');
    addAllEl.setAttribute('class', 'ksg-codeblock-group-addall');

    this.subscriptions = new CompositeDisposable();
    this.emitter = new Emitter();
    this.subscriptions.add(new DisposableEvent(addAllEl, 'click', (e) => {
      if (this.blocks && this.blocks.length > 0) {
        const blockTexts = this.blocks.map(block => block.code);
        this.emitter.emit(CODEBLOCKS_ADD, {
          blocks: blockTexts,
          link: this.link,
        });
      }
    }));

    is_accepted && metaInfoEl.classList.add('accepted');

    //TODO: find appropriate way to truncate title
    // maybe add tooltip too?
    if (question_title) {
      const titleLink = document.createElement('a');
      const titleLinkIcon = document.createElement('span');
      titleLinkIcon.setAttribute('class', 'ksg-codeblocks-title-link-icon');
      titleLinkIcon.textContent = ' ⇗';
      this.link = `https://stackoverflow.com/a/${answer_id}`;
      titleLink.href = this.link;
      titleLink.appendChild(document.createTextNode(question_title));
      titleEl.appendChild(titleLink);
      titleEl.appendChild(titleLinkIcon);
    }

    typeof votes === 'number' && voteEl.appendChild(document.createTextNode(
      `${votes} votes ${is_accepted ? '✓' : ''}`
    ));

    code_blocks && code_blocks.length > 1 && addAllEl.appendChild(document.createTextNode(
      `Add all ${code_blocks.length} blocks`
    ));

    metaInfoEl.appendChild(titleEl);
    metaInfoEl.appendChild(voteEl);

    actionsEl.appendChild(addAllEl);

    topEl.appendChild(metaInfoEl);
    topEl.appendChild(actionsEl);

    this.appendChild(topEl);

    this.blocks = [];
    if (code_blocks && code_blocks.length > 0) {
      const fragment = document.createDocumentFragment();
      code_blocks.forEach(block => {
        const blockEl = new KSGCodeBlock(block);

        this.subscriptions.add(blockEl.onClicked(({ block }) => {
          console.log('codeblock click catcher', block);
          this.emitter.emit(CODEBLOCKS_ADD, {
            blocks: [block],
            link: this.link,
          });
        }));

        fragment.appendChild(blockEl);
        this.blocks.push(blockEl);
      });
      this.appendChild(fragment);
    }
  }

  onAddAll(callback) {
    return this.emitter && this.emitter.on(CODEBLOCKS_ADD, callback);
  }

  connectedCallback() {

  }

  disconnectedCallback() {
    this.dispose();
  }

  dispose() {
    this.blocks = [];
    this.subscriptions && this.subscriptions.dispose();
    this.emitter && this.emitter.dispose();
  }
}

class KSGCodeBlock extends HTMLElement {
  constructor(codeblock) {
    super();

    this.subscriptions = new CompositeDisposable();
    this.emitter = new Emitter();

    this.subscriptions.add(new DisposableEvent(this, 'click', (e) => {
      console.log('single codeblock click', e, this.code);
      this.emitter.emit(CODEBLOCK_CLICKED, { block: this.code });
    }));

    this._code = codeblock;

    this.appendChild(document.createTextNode(codeblock));
  }

  get code() {
    return this._code;
  }

  onClicked(callback) {
    return this.emitter && this.emitter.on(CODEBLOCK_CLICKED, callback);
  }

  dispose() {
    this.subscriptions && this.subscriptions.dispose();
    this.emitter && this.emitter.dispose();
  }

  disconnectedCallback() {
    this.dispose();
  }

}


customElements.define('kite-ksg-code-block', KSGCodeBlock);
customElements.define('kite-ksg-code-block-group', KSGCodeBlockGroup);
customElements.define('kite-ksg-code-blocks', KSGCodeBlocks);
module.exports = KSGCodeBlocks;