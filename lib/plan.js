'use strict';

const {StateController} = require('kite-installer');
const {promisifyRequest, promisifyReadResponse} = require('./utils');

const Plan = {
  can(feature) {
    return this.plan && this.plan.features && this.plan.features[feature] != null
      ? this.plan.features[feature]
      : this.isActivePro();
  },

  isPro() {
    return this.plan && this.plan.active_subscription === 'pro';
  },

  isActive() {
    return this.plan && this.plan.status === 'active';
  },

  isTrialing() {
    return this.plan && this.plan.status === 'trialing';
  },

  isActivePro() {
    this.isPro() && (this.isActive() || this.isTrialing());
  },

  clearPlanData() {
    delete Plan.queryPromise;
  },

   planPath() {
    return [
      '/clientapi/plan',
      `localtoken=${StateController.client.LOCAL_TOKEN}`,
    ].join('?');
  },

  queryPlan() {
    if (this.queryPromise) { return this.queryPromise; }

    const path = this.planPath();
    this.queryPromise = promisifyRequest(StateController.client.request({path}))
    .then(resp => {
      if (resp.statusCode !== 200) {
        throw new Error(`${resp.statusCode} status at ${path}`);
      }
      return promisifyReadResponse(resp);
    })
    .then(data => {
      this.plan = JSON.parse(data);

      return this.plan;
    });

    return this.queryPromise;
  },
};

module.exports = Plan;
