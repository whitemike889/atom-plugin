'use strict';

var os = require('os');
const crypto = require('crypto');
const {Logger, StateController} = require('kite-installer');
const {metricsCounterPath} = require('./urls');
const localconfig = require('./localconfig.js');

const OS_VERSION = os.type() + ' ' + os.release();

const EDITOR_UUID = localStorage.getItem('metrics.userId');

// Generate a unique ID for this user and save it for future use.
function distinctID() {
  var id = localconfig.get('distinctID');
  if (id === undefined) {
    // use the atom UUID
    id = EDITOR_UUID || crypto.randomBytes(32).toString('hex');
    localconfig.set('distinctID', id);
  }
  return id;
}

function sendFeatureMetric(name) {
  const path = metricsCounterPath();

  Logger.debug('feature metric:', name);

  return StateController.client.request({
    path,
    method: 'POST',
  }, JSON.stringify({
    name,
    value: 1,
  })).then(resp => {
    Logger.logResponse(resp);
    return resp;
  });
}

function featureRequested(name) {
  sendFeatureMetric(`atom_${name}_requested`);
}
function featureFulfilled(name) {
  sendFeatureMetric(`atom_${name}_fulfilled`);
}

module.exports = {
  distinctID,
  featureRequested,
  featureFulfilled,
  EDITOR_UUID,
  OS_VERSION,
};
