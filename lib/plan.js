'use strict';

const {StateController} = require('kite-installer');
const {promisifyRequest, promisifyReadResponse} = require('./utils');

const Plan = {
  can(feature) {
    return this.queryPlan().then(data => data.features[feature] || false);
  },

  clearPlanData() {
    delete Plan.queryPromise;
  },

  queryPlan() {
    if (this.queryPromise) { return this.queryPromise; }

    const path = '/clientapi/plan';
    this.queryPromise = promisifyRequest(StateController.client.request({path}))
    .then(resp => {
      if (resp.statusCode !== 200) {
        throw new Error(`${resp.statusCode} status at ${path}`);
      }
      return promisifyReadResponse(resp);
    })
    .then(data => JSON.parse(data));

    return this.queryPromise;
  },
};

module.exports = Plan;
