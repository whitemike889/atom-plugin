'use strict';

const KiteApp = require('../../lib/kite-app');
const KiteStatusPanel = require('../../lib/elements/kite-status-panel');
const {
  fakeKiteInstallPaths, withPlan, withFakeServer, withKiteAuthenticated,
  withKiteNotRunning, withKiteWhitelistedPaths, withKiteNotAuthenticated,
} = require('../spec-helpers');
const {click} = require('../helpers/events');

fdescribe('KiteStatusPanel', () => {
  fakeKiteInstallPaths();

  let status, app;

  beforeEach(() => {
    app = new KiteApp();
    status = new KiteStatusPanel();
    status.setApp(app);

    document.body.appendChild(status);
  });

  withKiteAuthenticated(() => {
    withPlan('active pro', {
      status: 'active',
      active_subscription: 'pro',
      features: {},
      trial_days_remaining: 0,
      started_kite_pro_trial: false,
    }, () => {
      it('displays a pro badge', () => {
        waitsForPromise(() => status.show().then(() => {
          expect(status.querySelector('.split-line .left .pro-badge')).toExist();
        }));
      });

      it('displays a link to the user account', () => {
        waitsForPromise(() => status.show().then(() => {
          const link = status.querySelector('.split-line .right a');
          expect(link).toExist();
          expect(link.textContent).toEqual('Account');
          expect(link.href).toEqual('http://localhost:46624/redirect/pro');
        }));
      });
    });

    withPlan('trialing pro with more than 5 days remaining', {
      status: 'trialing',
      active_subscription: 'pro',
      features: {},
      trial_days_remaining: 9,
      started_kite_pro_trial: true,
    }, () => {
      it('displays a pro badge with the remaining days', () => {
        waitsForPromise(() => status.show().then(() => {
          expect(status.querySelector('.split-line .left .pro-badge')).toExist();
          const days = status.querySelector('.split-line .left .kite-trial-days');
          expect(days).toExist();
          expect(days.textContent).toEqual('Trial: 9 days left');
        }));
      });

      it('displays a link to upgrade to a pro account', () => {
        waitsForPromise(() => status.show().then(() => {
          const link = status.querySelector('.split-line .right a');
          expect(link).toExist();
          expect(link.textContent).toEqual('Upgrade');
          expect(link.href).toEqual('http://localhost:46624/redirect/pro');
        }));
      });
    });

    withPlan('trialing pro with less than 5 days remaining', {
      status: 'trialing',
      active_subscription: 'pro',
      features: {},
      trial_days_remaining: 3,
      started_kite_pro_trial: true,
    }, () => {
      it('displays a pro badge with the remaining days in red text', () => {
        waitsForPromise(() => status.show().then(() => {
          expect(status.querySelector('.split-line .left .pro-badge')).toExist();
          const days = status.querySelector('.split-line .left .kite-trial-days');
          expect(days).toExist();
          expect(days.textContent).toEqual('Trial: 3 days left');
          expect(days.classList.contains('text-danger'));
        }));
      });

      it('displays a link to upgrade to a pro account', () => {
        waitsForPromise(() => status.show().then(() => {
          const link = status.querySelector('.split-line .right a');
          expect(link).toExist();
          expect(link.textContent).toEqual('Upgrade');
          expect(link.href).toEqual('http://localhost:46624/redirect/pro');
        }));
      });
    });

    withPlan('community that did not trialed Kite yet', {
      status: 'active',
      active_subscription: 'community',
      features: {},
      trial_days_remaining: 0,
      started_kite_pro_trial: false,
    }, () => {
      it('displays as a kite basic account', () => {
        waitsForPromise(() => status.show().then(() => {
          expect(status.querySelector('.split-line .left').textContent).toEqual('kite_vector_icon\n Kite Basic');
        }));
      });

      it('displays a link to start a trial', () => {
        waitsForPromise(() => status.show().then(() => {
          const link = status.querySelector('.split-line .right a');
          expect(link).toExist();
          expect(link.textContent).toEqual('Start Pro trial');
          expect(link.href).toEqual('http://localhost:46624/redirect/trial');
        }));
      });
    });

    withPlan('community that already did the Kite trial', {
      status: 'active',
      active_subscription: 'community',
      features: {},
      trial_days_remaining: 0,
      started_kite_pro_trial: true,
    }, () => {
      it('displays as a kite basic account', () => {
        waitsForPromise(() => status.show().then(() => {
          expect(status.querySelector('.split-line .left').textContent).toEqual('kite_vector_icon\n Kite Basic');
        }));
      });

      it('displays a link to upgrade to a pro account', () => {
        waitsForPromise(() => status.show().then(() => {
          const link = status.querySelector('.split-line .right a');
          expect(link).toExist();
          expect(link.textContent).toEqual('Upgrade');
          expect(link.href).toEqual('http://localhost:46624/redirect/pro');
        }));
      });
    });
  });

  withKiteNotRunning(() => {
    beforeEach(() => {
      waitsForPromise(() => status.show());
    });

    it('does not display the account status', () => {
      expect(status.querySelector('.split-line')).not.toExist();
    });

    it('displays an action to start kited', () => {
      const state = status.querySelector('.status');

      expect(state.querySelector('.text-danger').textContent)
      .toEqual('Kite engine is not running •');

      const button = state.querySelector('a');

      expect(button.href).toEqual('kite-atom-internal://start');
      expect(button.textContent).toEqual('Launch now');
    });

    describe('clicking on the button', () => {
      it('starts kited', () => {
        const button = status.querySelector('a');

        spyOn(app, 'start').andReturn(Promise.resolve());
        click(button);

        expect(app.start).toHaveBeenCalled();
      });
    });
  });

  withKiteNotAuthenticated(() => {
    withPlan('community that did not trialed Kite yet', {
      status: 'active',
      active_subscription: 'community',
      features: {},
      trial_days_remaining: 0,
      started_kite_pro_trial: false,
    }, () => {
      beforeEach(() => {
        waitsForPromise(() => status.show());
      });

      it('does not display the account status', () => {
        expect(status.querySelector('.split-line')).not.toExist();
      });

      it('displays an action to log into kited', () => {
        const state = status.querySelector('.status');

        expect(state.querySelector('.text-danger').textContent)
        .toEqual('Kite engine is not logged in •');

        const button = state.querySelector('a');

        expect(button.href).toEqual('kite-atom-internal://login');
        expect(button.textContent).toEqual('Login now');
      });

      describe('clicking on the button', () => {
        it('displays the kite login', () => {
          const button = status.querySelector('a');

          spyOn(app, 'login').andReturn(Promise.resolve());
          click(button);

          expect(app.login).toHaveBeenCalled();
        });
      });
    });
  });

  withKiteWhitelistedPaths(() => {
    withPlan('community that did not trialed Kite yet', {
      status: 'active',
      active_subscription: 'community',
      features: {},
      trial_days_remaining: 0,
      started_kite_pro_trial: false,
    }, () => {
    });
  });
});
