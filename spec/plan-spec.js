'use strict';

const http = require('http');
const Plan = require('../lib/plan.js');
const {withFakeServer, fakeResponse} = require('./spec-helpers');

describe('Plan', () => {
  afterEach(() => {
    Plan.clearPlanData();
  });
  withFakeServer([[
    o => /\/clientapi\/plan/.test(o.path),
    o => fakeResponse(200, JSON.stringify({
      name: 'unknown',
      status: 'active',
      active_subscription: 'unknown',
      features: {
        drill_down: false,
        foo: true,
      },
    })),
  ]], () => {
    describe('.can()', () => {
      it('returns a promise that resolves with the feature permission', () => {
        waitsForPromise(() => Plan.can('drill_down').then(res => {
          expect(res).toBeFalsy();
        }));

        waitsForPromise(() => Plan.can('foo').then(res => {
          expect(res).toBeTruthy();
        }));

        waitsForPromise(() => Plan.can('bar').then(res => {
          expect(res).toBeFalsy();
        }));
      });

      it('calls the plan endpoint once if it has no data yet', () => {
        waitsForPromise(() => Plan.can('drill_down'));
        waitsForPromise(() => Plan.can('foo'));
        runs(() => {
          expect(http.request).toHaveBeenCalled();
          expect(http.request.callCount).toEqual(1);
        });
      });
    });
  });
});
