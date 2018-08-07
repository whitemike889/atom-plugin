'use strict';

const {waitsFor, waitsForPromise, loadPayload, substituteFromContext, buildContext, itForExpectation} = require('../utils');
const KiteAPI = require('kite-api');

const callsMatching = (exPath, exMethod, exPayload, context = {}) => {
  const calls = KiteAPI.request.calls;

  exPath = substituteFromContext(exPath, context);
  exPayload = exPayload && substituteFromContext(loadPayload(exPayload), context);

  // console.log('--------------------')
  // console.log(exPath, exPayload)

  if (calls.length === 0) { return false; }

  return calls.reverse().filter((c) => {
    let [{path, method}, payload] = c.args;
    method = method || 'GET';

    // console.log(path, method, payload)

    return path === exPath && method === exMethod && (!exPayload || expect.eql(JSON.parse(payload), exPayload));
  });
};

let calls;
const getDesc = expectation => () => {
  const base = [
    expectation.properties.count,
    'requests to',
    expectation.properties.path,
    'in test',
    expectation.description,
    'but',
    calls.length,
    'were found',
  ];

  return base.join(' ');
};


module.exports = (expectation, not) => {
  beforeEach(() => {
    const promise = waitsFor(() => {
      calls = callsMatching(
          expectation.properties.path,
          expectation.properties.method,
          expectation.properties.body,
          buildContext());

      return calls.length === expectation.properties.count;
    }, 300);

    if (not) {
      waitsForPromise({label: getDesc(), shouldReject: true}, () => promise);
    } else {
      waitsForPromise({label: getDesc()}, () => promise);
    }
  });

  itForExpectation(expectation);
};
