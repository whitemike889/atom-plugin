'use strict';

const {StateController} = require('kite-installer');
const {promisifyRequest, promisifyReadResponse} = require('./utils');

const Plan = {
  can(feature) {
    return this.queryPlan().then(data => data.features[feature] || false);
  },

  queryPlan() {
    const path = '/clientapi/plan';
    return promisifyRequest(StateController.client.request({path}))
    .then(resp => {
      if (resp.statusCode !== 200) {
        throw new Error(`${resp.statusCode} status at ${path}`);
      }
      return promisifyReadResponse(resp);
    })
    .then(data => JSON.parse(data));
  },
};

module.exports = Plan;
