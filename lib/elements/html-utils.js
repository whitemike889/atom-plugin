const {head} = require('../utils');
const {symbolLabel, symbolType, memberLabel, parameterName, parameterType} = require('../kite-data-utils');

function renderSymbolHeader(symbol) {
  return `
  <div class="expand-header split-line">
    <span class="name">${symbolLabel(symbol)}</span>
    <span class="type">${symbolType(symbol)}</span>
  </div>`;
}

function paramterize(string) {
  return string.toLowerCase().replace(/\s+/g, '-');
}

function section(title, content) {
  return `<section class="${paramterize(title)}">
    <h4>${title}</h4>

    ${content}
  </section>`;
}

function renderExtend(symbol) {
  return !symbol.bases || symbol.bases.length === 0
    ? ''
    : `
    <div class="expand-extend split-line">
      <span class="name">
        <a href="kite-atom-internal://base/method">BaseCounter.increment(n)</a>
      </span>
      <span class="type"><a href="kite-atom-internal://base/return">-> int</a></span>
    </div>`;
}

function renderExamples(symbol) {
  return section('Definition', `
  <ul>
    <li>
      <a class="pull-right" href="kite-atom-internal://goto">Go to <i class="icon icon-chevron-right"></i></a>

      <i class="icon icon-file-code"></i> <span class="file">src.py:234</span>
    </li>
  </ul>`);
}

function renderUsages(symbol) {
  return section('Usages', `
  <ul>
    <li>
      <a class="pull-right" href="kite-atom-internal://goto">Go to <i class="icon icon-chevron-right"></i></a>

      <i class="icon icon-file-code"></i> <span class="file">example.py</span>
    </li>

    <li>
      <a class="pull-right" href="kite-atom-internal://goto">Go to <i class="icon icon-chevron-right"></i></a>

      <i class="icon icon-file-code"></i> <span class="file">rc/anotherfile.py</span>
      <pre><code>Counter.name = 'x'</code></pre>
    </li>
  </ul>`);
}

function renderMembers(symbol) {
  const members = head(symbol.value).detail.members;

  return members.length === 0
    ? ''
    : section('Top members', `
      <dl>
        ${members.slice(0, 2).map(m => renderMember(m)).join('')}
      </dl>
      ${additionalMembersLink(members.length - 2)}`);
}

function renderMember(member) {
  return `
  <dt>${memberLabel(member)}</dt>
  <dd>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco
    laboris nisi ut aliquip ex ea commodo consequat.</p>
  </dd>`;
}

function additionalMembersLink(membersCount) {
  return membersCount <= 0
    ? ''
    : `<a href="kite-atom-internal://more-methods">See ${membersCount} more methods</a>`;
}

function renderParameters(symbol) {
  const detail = head(symbol.value).detail;

  return detail && ((detail.parameters && detail.parameters.length) || detail.vararg || detail.kwarg)
    ? section('Parameters', `
    <dl>
      ${detail.parameters.map(p => renderParameter(p)).join('')}
      ${renderParameter(detail.vararg, '*')}
      ${renderParameter(detail.kwarg, '**')}
    </dl>`)
    : '';
}

function renderParameter(param, prefix = '') {
  return !param
    ? ''
    : `<dt class="split-line">
      <span class="name">${parameterName(param, prefix)}</span>
      <span class="type">${parameterType(param)}</span>
    </dt>
    <dd>${param.synopsis}</dd>
    `;
}

function renderInvocations(symbol) {
  return section('Invocations', `<pre><code>Counter.increment(10)
Counter.increment(10, foo='bar')</code></pre>`);
}

module.exports = {
  renderSymbolHeader,
  renderExtend,
  renderUsages,
  renderExamples,
  renderMembers,
  renderParameters,
  renderParameter,
  renderInvocations,
};
