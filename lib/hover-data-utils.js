'use strict';

const {compact, flatten, head, uniq} = require('./utils');

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

const symbolKind = s => head(s.value).kind;

const symbolType = s =>
  symbolKind(s) === 'function'
    ? returnType(unionType(s.value, v => v.detail && v.detail.return_value))
    : unionType(s.value, v => v.type);

module.exports = {
  signature, symbolName, symbolType, symbolKind, unionType, returnType,
};
