'use strict';

const os = require('os');
const KiteApp = require('../../lib/kite-app');
const KiteStatusPanel = require('../../lib/elements/kite-status-panel');
const {
  fakeKiteInstallPaths, fakeResponse, withPlan, withKiteAuthenticated,
  withRoutes, withKiteNotRunning, withKiteWhitelistedPaths,
  withKiteNotAuthenticated,
} = require('../spec-helpers');
const {click} = require('../helpers/events');

describe('KiteStatusPanel', () => {
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
          expect(link.href).toEqual('http://local.kite.com:46624/redirect/pro');
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
          expect(link.href).toEqual('http://local.kite.com:46624/redirect/pro');
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
          expect(link.href).toEqual('http://local.kite.com:46624/redirect/pro');
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
          expect(link.href).toEqual('http://local.kite.com:46624/redirect/trial');
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
          expect(link.href).toEqual('http://local.kite.com:46624/redirect/pro');
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
        const button = status.querySelector('a.btn');

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
          const button = status.querySelector('a.btn');

          spyOn(app, 'login').andReturn(Promise.resolve());
          click(button);

          expect(app.login).toHaveBeenCalled();
        });
      });
    });
  });

  withKiteWhitelistedPaths(() => {
    let editor;
    withPlan('community that did not trialed Kite yet', {
      status: 'active',
      active_subscription: 'community',
      features: {},
      trial_days_remaining: 0,
      started_kite_pro_trial: false,
    }, () => {
      describe('with a file not in the whitelist', () => {
        beforeEach(() => {
          app.kite = {
            isEditorWhitelisted(e) { return false; },
            notifications: {
              pauseNotifications() {},
              resumeNotifications() {},
            },
          };

          waitsForPromise(() => atom.workspace.open('sample.py').then(e => editor = e));
          waitsForPromise(() => status.show());
        });

        it('displays actions to whitelist the file and access the settings', () => {
          const state = status.querySelector('.status');

          expect(state.querySelector('.text-warning').textContent)
          .toEqual('Kite engine is not enabled for this file •');

          const buttons = state.querySelectorAll('a');
          const path = encodeURI(editor.getPath());
          const url = `http://local.kite.com:46624/settings/permissions?filename=${path}`;

          expect(buttons[0].href).toEqual(`kite-atom-internal://whitelist/${os.homedir()}`);
          expect(buttons[0].textContent).toEqual(`Enable for ${os.homedir()}`);

          expect(buttons[1].href).toEqual(url);
          expect(buttons[1].textContent).toEqual('Whitelist settings…');
        });

        describe('clicking on the whitelist button', () => {
          it('calls the whitelist endpoint', () => {
            const state = status.querySelector('.status');
            const button = state.querySelector('a');

            spyOn(app, 'whitelist').andReturn(Promise.resolve());
            click(button);

            expect(app.whitelist).toHaveBeenCalledWith(os.homedir());
          });
        });

        describe('clicking on the whitelist settings button', () => {
          it('calls the whitelist endpoint', () => {
            const state = status.querySelector('.status');
            const button = state.querySelector('a:last-child');
            const path = encodeURI(editor.getPath());
            const url = `http://local.kite.com:46624/settings/permissions?filename=${path}`;

            spyOn(atom.applicationDelegate, 'openExternal');
            click(button);

            expect(atom.applicationDelegate.openExternal).toHaveBeenCalledWith(url);
          });
        });
      });

      describe('when the user has a verified email', () => {
        beforeEach(() => {
          waitsForPromise(() => status.show());
        });

        it('does not display a verification warning', () => {
          expect(status.querySelector('.kite-warning-box')).not.toExist();
        });
      });

      describe('when the user has an unverified email', () => {
        withRoutes([[
          o => /^\/api\/account\/user/.test(o.path),
          o => fakeResponse(200, JSON.stringify({email_verified: false})),
        ]]);

        beforeEach(() => {
          waitsForPromise(() => status.show());
        });

        it('displays a verification warning', () => {
          expect(status.querySelector('.kite-warning-box')).toExist();
        });
      });
    });
  });
});
