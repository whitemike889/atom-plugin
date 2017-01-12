'use strict';

const {compact, flatten, head, last, uniq} = require('./utils');

const parameterName = (p, prefix = '') =>
  p
    ? `${prefix}${p.name}`
    : undefined;

const parameterType = (p, prefix = '') =>
  p.inferred_value
    ? `${prefix}${uniq(p.inferred_value.map(v => v.type)).join('|')}`
    : '';

const parameterValue = p =>
  `${parameterName(p)}${parameterType(p, ':')}`;

const parameters = d =>
  d.parameters
    ? d.parameters.map(parameterValue)
    : [];

const signature = ({detail}) =>
  detail
    ? `(${compact(flatten([
      parameters(detail),
      parameterName(detail.vararg, '*'),
      parameterName(detail.kwarg, '**'),
    ])).join(', ')})`
    : '()';

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

const memberLabel = s => {
  const value = s.value ? head(s.value) : {};
  return value.kind === 'function'
    ? s.name + signature(value)
    : s.name;
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
  signature,
  parameterName, parameterType, parameterValue,
  symbolName, symbolLabel, symbolType, symbolKind,
  unionType, returnType,
  memberLabel,
};
