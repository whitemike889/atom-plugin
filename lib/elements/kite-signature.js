'use strict';

const {head} = require('../utils');
const {openSignatureInWebURL} = require('../urls');
const {valueLabel, valueName, callSignature} = require('../kite-data-utils');
const {highlightCode, debugData, proFeatures, pluralize} = require('./html-utils');
const Plan = require('../plan');

class KiteSignature extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-signature', {
      prototype: this.prototype,
    });
  }

  setListElement(listElement) {
    this.listElement = listElement;
  }

  detachedCallback() {
    if (this.parentNode) {
      this.listElement.maxVisibleSuggestions = atom.config.get('autocomplete-plus.maxVisibleSuggestions');
      this.parentNode.removeChild(this);
    }
  }

  attachedCallback() {
    this.listElement.maxVisibleSuggestions = this.compact
      ? atom.config.get('autocomplete-plus.maxVisibleSuggestions')
      : atom.config.get('kite.maxVisibleSuggestionsAlongSignature');

    this.checkWidth();
  }

  openInWeb() {
    const link = this.querySelector('kite-open-link');
    link && link.open();
  }

  setData(data, compact = false) {
    const call = head(data.calls);
    const name = valueName(call.callee);
    let extendedContent = '';

    if (!compact) {
      let patterns = '';
      if (call.signatures && call.signatures.length) {
        patterns = Plan.can('call_signatures_editor')
          ? `
            <section>
            <h4>Popular Patterns</h4>
            <pre>${
              highlightCode(
                call.signatures
                .map(s => callSignature(s))
                .map(s => `${name}(${s})`)
                .join('\n'))
              }</pre>
            </section>`
          : `<section>
              ${proFeatures(
                `To see ${call.signatures.length} ${pluralize(call.signatures.length, 'pattern', 'patterns')}`
              )}
            </section>`;
      }
      extendedContent = `
      ${patterns}
      <kite-open-link data-url="${openSignatureInWebURL(call.callee.id)}">web</kite-open-link>
      `;
    }

    this.innerHTML = `
    <div class="kite-signature-wrapper">
      <div class="name">${valueLabel(call.callee, call.arg_index)}</div>
      ${extendedContent}
    </div>
    ${debugData(data)}
    `;

    this.compact = compact;
    this.currentIndex = call.arg_index;

    if (this.parentNode) {
      this.checkWidth();
    }
  }

  checkWidth() {
    const name = this.querySelector('.name');
    if (name && name.scrollWidth > name.offsetWidth) {
      const missingWidth = name.scrollWidth - name.offsetWidth;
      const signature = name.querySelector('.signature');
      const parameters = [].slice.call(name.querySelectorAll('.parameter'));
      const half = name.scrollWidth;
      const parameter = parameters[this.currentIndex];
      const middle = parameter ?
        parameter.offsetLeft - parameter.offsetWidth / 2
        : half + 1;
      const removed = [];
      let gainedWidth = 0;
      const currentIndex = this.currentIndex;

      if (!signature) { return; }

      if (middle > half) {
        truncateLeft();

        if (gainedWidth < missingWidth) { truncateRight(); }
      } else {
        truncateRight();
        if (gainedWidth < missingWidth) { truncateLeft(); }
      }

      function truncateLeft() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'parameter ellipsis';
        ellipsis.textContent = '…0 more, ';
        signature.insertBefore(ellipsis, signature.firstElementChild);

        for (let i = 0; i < currentIndex; i++) {
          const parameter = parameters[i];
          removed.push(parameter);
          gainedWidth += parameter.offsetWidth;

          if (gainedWidth - ellipsis.offsetWidth >= missingWidth) {
            gainedWidth -= ellipsis.offsetWidth;
            removed.forEach(el => el.remove());
            ellipsis.textContent = `…${removed.length} more, `;
            removed.length = 0;
            return;
          }
        }

        if (removed.length) {
          gainedWidth -= ellipsis.offsetWidth;
          removed.forEach(el => el.remove());
          ellipsis.textContent = `…${removed.length} more, `;
          removed.length = 0;
        } else {
          ellipsis.remove();
        }
      }

      function truncateRight() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'parameter ellipsis';
        ellipsis.textContent = '0 more…';
        signature.appendChild(ellipsis);

        for (let i = parameters.length - 1; i > currentIndex; i--) {
          const parameter = parameters[i];
          removed.push(parameter);
          gainedWidth += parameter.offsetWidth;

          if (gainedWidth - ellipsis.offsetWidth >= missingWidth) {
            gainedWidth -= ellipsis.offsetWidth;
            removed.forEach(el => el.remove());
            ellipsis.textContent = `${removed.length} more…`;
            removed.length = 0;
            return;
          }
        }

        if (removed.length) {
          gainedWidth -= ellipsis.offsetWidth;
          removed.forEach(el => el.remove());
          ellipsis.textContent = `${removed.length} more…`;
          removed.length = 0;
        } else {
          ellipsis.remove();
        }
      }
    }
  }
}

module.exports = KiteSignature.initClass();
