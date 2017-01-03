'use strict';

const compact = a => a.filter(v => v && v.length);

const uniq = a => a.reduce((m, v) => m.indexOf(v) ? m.concat(v) : m, []);

const flatten = a =>
  a.reduce((m, o) => m.concat(Array.isArray(o) ? flatten(o) : o), []);

const head = a => a[0];

const signature = ({detail: d}) =>
  d
    ? `(${compact(flatten([d.parameters, d.vararg, d.kwarg])).join(', ')})`
    : '';

const symbolName = s => {
  const value = head(s.value);
  return value.kind === 'function'
    ? compact([value.module, s.name]).join('.') + signature(value)
    : compact([value.module, s.name]).join('.');
};

const unionType = (vs, map) => uniq(compact(vs.map(map))).join(' | ');

const returnType = (v) => v && v.length ? `-> ${v}` : '';

const symbolType = s =>
  head(s.value).kind === 'function'
    ? returnType(unionType(s.value, v => v.detail && v.detail.return_value))
    : unionType(s.value, v => v.type);

class KiteHover extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-hover', {prototype: this.prototype});
  }

  setData(data) {
    if (data && data.symbol && data.symbol.length) {

      const [symbol] = data.symbol;
      this.innerHTML = `
        <span class="name">${symbolName(symbol)}</span>
        <span class="type">${symbolType(symbol)}</span>
      `;

    } else {
      this.innerHTML = '';
    }
  }
}

module.exports = KiteHover.initClass();
