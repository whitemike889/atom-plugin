'use strict';

const KiteConnect = require('kite-connector');
const Status = require('../lib/status');
const {withKite, withKiteRoutes, withKitePaths} = require('kite-api/test/helpers/kite');
const {fakeResponse} = require('kite-api/test/helpers/http');
const {jsonPath} = require('./json/utils');

describe('status', () => {
  let status, kite;
  beforeEach(() => {
    atom.config.set('kite.pollingInterval', 100);
    jasmine.useMockClock();

    status = new Status();

    waitsForPromise(() => atom.packages.activatePackage('autocomplete-plus'));
  });

  afterEach(() => {
    status.dispose();
  });

  const activateModule = () => {
    beforeEach(() => {
      waitsForPromise(() => atom.packages.activatePackage('kite').then(pkg => {
        kite = pkg.mainModule;
        status.init(kite);
      }));
    });
  };

  describe('on creation', () => {
    it('provides an element through its getElement() method', () => {
      expect(status.getElement()).not.toBeUndefined();
    });

    it('starts in an unknown state', () => {
      expect(status.getElement().getAttribute('status')).toEqual('unknown');
    });
  });

  describe('on init', () => {
    beforeEach(() => {
      spyOn(status, 'pollStatus');
    });

    describe('with an empty window', () => {
      activateModule();

      it('registers the element as a tooltip provider', () => {
        expect(atom.tooltips.tooltips.get(status.getElement())).not.toBeUndefined();
      });

      it('does not start the polling routine', () => {
        expect(status.pollStatus).not.toHaveBeenCalled();

        advanceClock(200);

        expect(status.pollStatus).not.toHaveBeenCalled();
      });
    });

    describe('when there is a supported file already opened', () => {
      beforeEach(() => {
        waitsForPromise(() => atom.workspace.open('sample.py'));
      });

      activateModule();

      it('registers a polling routine based on pollingInterval', () => {
        expect(status.pollStatus).toHaveBeenCalled();

        advanceClock(200);

        expect(status.pollStatus.callCount).toEqual(2);
      });
    });

    describe('when a supported file is open after init', () => {
      activateModule();

      beforeEach(() => {
        waitsForPromise(() => atom.workspace.open('sample.py'));
      });

      it('registers a polling routine based on pollingInterval', () => {
        expect(status.pollStatus).toHaveBeenCalled();

        advanceClock(200);

        expect(status.pollStatus.callCount > 1).toBeTruthy();
      });

      describe('then closing that file', () => {
        let lastCount;
        beforeEach(() => {
          lastCount = status.pollStatus.callCount + 1;
          atom.workspace.getActiveTextEditor().destroy();
        });

        it('calls pollStatus to clear the status content', () => {
          expect(status.pollStatus.callCount > 1).toBeTruthy();
        });

        it('stops the polling routine', () => {
          advanceClock(200);

          expect(status.pollStatus.callCount).toEqual(lastCount);
        });
      });

      describe('then opening an unsupported file', () => {
        beforeEach(() => {
          waitsForPromise(() => atom.workspace.open('hello.json'));
        });

        it('calls pollStatus to clear the status content', () => {
          expect(status.pollStatus.callCount).toEqual(2);
        });

        it('stops the polling routine', () => {
          advanceClock(200);

          expect(status.pollStatus.callCount).toEqual(2);
        });
      });
    });

    describe('when there is an unsupported file already opened', () => {
      beforeEach(() => {
        waitsForPromise(() => atom.workspace.open('hello.json'));
      });

      activateModule();

      it('does not start the polling routine', () => {
        expect(status.pollStatus).not.toHaveBeenCalled();

        advanceClock(200);

        expect(status.pollStatus).not.toHaveBeenCalled();
      });

      describe('then opening a supported file', () => {
        beforeEach(() => {
          waitsForPromise(() => atom.workspace.open('sample.py'));
        });

        it('starts the polling routine', () => {
          expect(status.pollStatus).toHaveBeenCalled();

          advanceClock(200);

          expect(status.pollStatus.callCount).toEqual(2);
        });
      });
    });

    withKite({logged: true}, () => {
      withKitePaths({whitelist: [__dirname]}, undefined, () => {
        let editor, lastCount;

        activateModule();

        beforeEach(() => {
          waitsForPromise(() => atom.workspace.open('sample.py').then(e => {
            editor = e;
            advanceClock(10);
          }));
          waitsFor(() => kite.getModule('editors').isEditorWhitelisted(editor));
        });

        describe('when the whitelist state of the file changes', () => {
          withKiteRoutes([[() => true, () => fakeResponse(403)]]);

          beforeEach(() => {
            waitsFor('previous poll end', () => !status.isPolling);
            runs(() => {
              lastCount = status.pollStatus.callCount;
            });
          });

          it('poll the status on the change', () => {
            const editor = atom.workspace.getActiveTextEditor();
            const pos = editor.getBuffer().positionForCharacterIndex(4);
            editor.setCursorBufferPosition(pos);
            advanceClock(10);

            waitsFor('new status poll', () => status.pollStatus.callCount > lastCount);
          });
        });
      });
    });
  });

  describe('.pollStatus()', () => {
    activateModule();

    describe('when no supported editor is open', () => {
      it('makes no requests', () => {
        spyOn(KiteConnect.client, 'request').andCallThrough();

        status.pollStatus();
        const element = status.getElement();

        expect(KiteConnect.client.request).not.toHaveBeenCalled();

        expect(status.tooltipText).toEqual('');
        expect(element.getAttribute('status')).toEqual('unsupported');
        expect(element.getAttribute('is-syncing')).toBeNull();
        expect(element.getAttribute('is-indexing')).toBeNull();
        expect(element.querySelector('.text').textContent).toEqual('');
      });
    });

    describe('with a supported editor open', () => {
      let editor;
      beforeEach(() => {
        waitsForPromise(() => atom.workspace.open('sample.py').then(e => {
          editor = e;
        }));
        waitsFor(() => !status.isPolling);
      });

      it('calls /clientapi/status', () => {
        spyOn(KiteConnect.client, 'request').andCallThrough();

        status.pollStatus();

        expect(KiteConnect.client.request).toHaveBeenCalled();
        const arg = KiteConnect.client.request.calls[0].args[0];
        expect(arg.path).toEqual(`/clientapi/status?filename=${encodeURI(editor.getPath())}`);
      });

      withKite({installed: false}, () => {
        it('changes its status to UNINSTALLED', () => {
          waitsForPromise(() => status.pollStatus().then(() => {
            const element = status.getElement();
            expect(status.tooltipText).toEqual('Kite is not installed.');
            expect(element.getAttribute('status')).toEqual('uninstalled');
            expect(element.querySelector('.text').textContent).toEqual('Kite: not installed');
          }));
        });
      });

      withKite({running: false}, () => {
        it('changes its status to INSTALLED', () => {
          waitsForPromise(() => status.pollStatus().then(() => {
            const element = status.getElement();
            expect(status.tooltipText).toEqual('Kite is not running.');
            expect(element.getAttribute('status')).toEqual('installed');
            expect(element.querySelector('.text').textContent).toEqual('Kite: not running');
          }));
        });
      });

      withKite({reachable: false}, () => {
        it('changes its status to RUNNING', () => {
          waitsForPromise(() => status.pollStatus().then(() => {
            const element = status.getElement();
            expect(status.tooltipText).toEqual('Kite is running but not reachable.');
            expect(element.getAttribute('status')).toEqual('running');
          }));
        });
      });

      withKite({logged: false}, () => {
        withKiteRoutes([[() => true, () => fakeResponse(401)]]);

        it('changes its status to REACHABLE', () => {
          waitsForPromise(() => status.pollStatus().then(() => {
            const element = status.getElement();
            expect(status.tooltipText).toEqual('Kite is not authenticated.');
            expect(element.getAttribute('status')).toEqual('reachable');
            expect(element.querySelector('.text').textContent).toEqual('Kite: not logged in');
          }));
        });
      });

      withKite({logged: true}, () => {
        withKitePaths({}, undefined, () => {
          withKiteRoutes([[() => true, () => fakeResponse(403)]]);

          it('changes its status to AUTHENTICATED', () => {
            waitsForPromise(() => status.pollStatus().then(() => {
              const element = status.getElement();
              expect(status.tooltipText).toEqual('');
              expect(element.getAttribute('status')).toEqual('authenticated');
              expect(element.querySelector('.text').textContent).toEqual('');
            }));
          });
        });
      });

      describe('when the file status is ready', () => {
        withKite({logged: true}, () => {
          withKitePaths({whitelist: [__dirname]}, undefined, () => {
            withKiteRoutes([[
              o => /^\/clientapi\/status/.test(o.path),
              () => fakeResponse(200, '{"status": "ready"}'),
            ]]);

            it('changes its status to WHITELISTED', () => {
              waitsForPromise(() => status.pollStatus().then(() => {
                const element = status.getElement();
                expect(status.tooltipText).toEqual('Kite is ready.');
                expect(element.getAttribute('status')).toEqual('whitelisted');
                expect(element.querySelector('.text').textContent).toEqual('');
              }));
            });
          });
        });
      });
      describe('when the file status is syncing', () => {
        withKite({logged: true}, () => {
          withKitePaths({whitelist: [__dirname]}, undefined, () => {
            withKiteRoutes([[
              o => /^\/clientapi\/status/.test(o.path),
              () => fakeResponse(200, '{"status": "syncing"}'),
            ]]);

            it('changes its status to syncing WHITELISTED', () => {
              waitsForPromise(() => status.pollStatus().then(() => {
                const element = status.getElement();
                expect(status.tooltipText).toEqual('Kite engine is syncing your code');
                expect(element.getAttribute('status')).toEqual('whitelisted');
                expect(element.getAttribute('is-syncing')).toEqual('');
                expect(element.querySelector('.text').textContent).toEqual('');
              }));
            });
          });
        });
      });

      describe('when the file status is indexing', () => {
        withKite({logged: true}, () => {
          withKitePaths({whitelist: [__dirname]}, undefined, () => {
            withKiteRoutes([[
              o => /^\/clientapi\/status/.test(o.path),
              () => fakeResponse(200, '{"status": "indexing"}'),
            ]]);

            it('changes its status to indexing WHITELISTED', () => {
              waitsForPromise(() => status.pollStatus().then(() => {
                const element = status.getElement();
                expect(status.tooltipText).toEqual('Kite engine is indexing your code');
                expect(element.getAttribute('status')).toEqual('whitelisted');
                expect(element.getAttribute('is-indexing')).toEqual('');
                expect(element.querySelector('.text').textContent).toEqual('');
              }));
            });
          });
        });
      });

      describe('when the file is too big for kite', () => {
        beforeEach(() => {
          waitsForPromise(() => atom.workspace.open(jsonPath('data/whitelisted/too-large.py')));
        });

        withKite({logged: true}, () => {
          withKitePaths({whitelist: jsonPath('data/whitelisted')}, undefined, () => {
            withKiteRoutes([[
              o => /^\/clientapi\/status/.test(o.path),
              () => fakeResponse(200, '{"status": "ready"}'),
            ]]);

            it('changes its status to indexing WHITELISTED', () => {
              waitsForPromise(() => status.pollStatus().then(() => {
                const element = status.getElement();
                expect(status.tooltipText).toEqual('The current file is too large for Kite to handle');
                expect(element.getAttribute('status')).toEqual('whitelisted');
                expect(element.querySelector('.text').textContent).toEqual('');
              }));
            });
          });
        });
      });
    });
  });
});
