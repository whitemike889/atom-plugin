'use strict';

const {compact, flatten, head, last, uniq} = require('./utils');

const parameterName = (p, prefix = '') =>
  p
    ? `${prefix}<span class="parameter-name">${p.name}</span>`
    : undefined;

const parameterType = (p, prefix = '') =>
  p.inferred_value
    ? `${prefix}<span class="parameter-type">${uniq(p.inferred_value.map(v => v.type)).join('|')}</span>`
    : '';

const parameterValue = p =>
  `${parameterName(p)}${parameterType(p, ':')}`;

const parameters = d =>
  d.parameters
    ? d.parameters.map(parameterValue)
    : [];

const signature = ({detail}) =>
  detail
    ? `<span class="signature">(${compact(flatten([
      parameters(detail),
      parameterName(detail.vararg, '*'),
      parameterName(detail.kwarg, '**'),
    ])).join(', ')})</span>`
    : '<span class="signature">()</span>';

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

const returnType = (v) => v && v.length ? `-> <span class="return-type">${v}</span>` : '';

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
