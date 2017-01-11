'use strict';

const {compact, flatten, head, last, uniq} = require('./utils');

const parameterValue = p =>
  p.inferred_value
    ? `${p.name}:${p.inferred_value.map(v => v.type).join('|')}`
    : p.name;

const parameters = d =>
  d.parameters
    ? d.parameters.map(parameterValue)
    : [];

const signature = ({detail}) =>
  detail
    ? `(${compact(flatten([
      parameters(detail),
      detail.vararg,
      detail.kwarg,
    ])).join(', ')})`
    : '';

const symbolName = s => {
  const value = head(s.value);
  return value.kind === 'instance'
    ? s.name
    : last(value.repr.split(':'));
};

const symbolLabel = s => {
  const value = head(s.value);
  return value.kind === 'function'
    ? symbolName(s) + signature(value)
    : symbolName(s);
};

const unionType = (vs, map) =>
  uniq(compact(flatten(vs).map(map))).join(' | ');

const returnType = (v) => v && v.length ? `-> ${v}` : '';

const symbolKind = s => head(s.value).kind;

const extractInstanceType = v => v.type;
const extractFunctionType = v =>
  v.detail && v.detail.return_value
    ? v.detail.return_value.map(r => r.type)
    : null;

const symbolType = s =>
  symbolKind(s) === 'function'
    ? returnType(unionType(s.value, extractFunctionType))
    : unionType(s.value, extractInstanceType);

module.exports = {
  signature, symbolName, symbolLabel, symbolType, symbolKind, unionType, returnType,
};
