'use strict';

const {compact, flatten, head, last, uniq} = require('./utils');

const parameterName = (p, prefix = '') =>
  p
    ? `${prefix}<span class="parameter-name">${p.name}</span>`
    : undefined;

const parameterType = (p, prefix = '') =>
  p.inferred_value
    ? `${prefix}${uniq(p.inferred_value.map(v =>
      `<a href="#" class="parameter-type">${v.type}</a>`)).join(' <i>or</i> ')}`
    : '';

const parameterValue = p =>
  `${parameterName(p)}${parameterType(p, ':')}`;

const parameters = (d, withType = true) =>
  d.parameters
    ? (withType
      ? d.parameters.map(parameterValue)
      : d.parameters.map(p => parameterName(p)))
    : [];

const signature = ({detail}, withType = true) =>
  detail
    ? `<span class="signature">(${compact(flatten([
      parameters(detail, withType),
      parameterName(detail.vararg, '*'),
      parameterName(detail.kwarg, '**'),
    ])).join(', ')})</span>`
    : '<span class="signature">()</span>';

const valueName = value => last(value.repr.split(':'));

const valueLabel = value =>
  value.kind === 'function'
    ? valueName(value) + signature(value, false)
    : valueName(value);

const symbolName = s => {
  const value = head(s.value);
  return value.kind === 'instance'
    ? s.name
    : valueName(value);
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

const wrapType = (t) => `<a href="#" class="type-value">${t}</a>`;

const unionType = (vs, map) =>
  uniq(flatten(compact(vs.map(map))).map(wrapType)).join(' | ');

const returnType = (v) =>
  v && v.length ? `-> <span class="return-type">${v}</span>` : '';

const symbolValue = s => head(s.value);

const symbolKind = s => symbolValue(s).kind;

const reportFromHover = hover => ({
  value: symbolValue(head(hover.symbol)),
  report: hover.report,
});

const extractInstanceType = v => v.type;
const extractFunctionType = v =>
v.detail && v.detail.return_value
? v.detail.return_value.map(r => r.type)
: null;

const symbolType = s =>
  symbolKind(s) === 'function'
    ? returnType(unionType(s.value, extractFunctionType))
    : unionType(s.value, extractInstanceType);

const valueType = value =>
  value.kind === 'function'
    ? returnType(unionType([value], extractFunctionType))
    : unionType([value], extractInstanceType);

const symbolId = (symbol) =>
  symbol.id !== ''
    ? symbol.id
    : head(symbol.value).id;

module.exports = {
  signature,
  parameterName, parameterType, parameterValue,
  symbolName, symbolLabel, symbolType, symbolKind, symbolValue, symbolId,
  valueName, valueLabel, valueType,
  unionType, returnType,
  memberLabel,
  reportFromHover,
};
