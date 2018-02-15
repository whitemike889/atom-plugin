'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const {withKiteWhitelistedPaths, withRoutes, fakeKiteInstallPaths, fakeResponse} = require('./spec-helpers');
const {click} = require('./helpers/events');
const projectPath = path.join(__dirname, 'fixtures');


fdescribe('autocorrect', () => {
  let kitePkg, kiteEditor, editor, buffer, jasmineContent, workspaceElement;

  fakeKiteInstallPaths();

  beforeEach(() => {
    jasmineContent = document.querySelector('#jasmine-content');
    workspaceElement = atom.views.getView(atom.workspace);

    // We want to test that our sidebar closes properly when not using the dock API.
    atom.config.set('kite.useDockForSidebar', false);
    atom.config.set('kite.openAutocorrectSidebarOnSave', false);

    jasmineContent.appendChild(workspaceElement);

    waitsForPromise(() => atom.packages.activatePackage('status-bar'));
    waitsForPromise(() => atom.packages.activatePackage('kite').then(pkg => {
      kitePkg = pkg.mainModule;
    }));
  });

  afterEach(() => {
    kitePkg && kitePkg.toggleAutocorrectSidebar(false);
  });

  describe('with the current project path not in the whitelist', () => {
    withKiteWhitelistedPaths(() => {
      describe('when activated', () => {
        describe('and there is a supported file open', () => {
          beforeEach(() => {
            waitsForPromise(() => atom.workspace.open('errored.py').then(e => {
              editor = e;
              buffer = editor.getBuffer();
              spyOn(buffer.buffer, 'save').andCallFake(() => Promise.resolve());
            }));
            waitsFor('kite editor', () => kiteEditor = kitePkg.kiteEditorForEditor(editor));
            waitsFor('kite editor tokens', () => kiteEditor.updateTokens());
            runs(() => {
              spyOn(kiteEditor, 'willSaveHook');
            });
          });

          it('does not invoke the will-save hook', () => {
            editor.save();

            waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 0);
            runs(() => {
              expect(kiteEditor.willSaveHook).not.toHaveBeenCalled();
            });
          });
        });
      });
    });
  });

  describe('with the current project path in the whitelist', () => {
    withKiteWhitelistedPaths([projectPath], () => {
      withRoutes([
        [
          o => /^\/clientapi\/editor\/autocorrect\/validation\/on-save$/.test(o.path),
          o => fakeResponse(200),
        ], [
          o => /^\/clientapi\/editor\/autocorrect$/.test(o.path),
          o => fakeResponse(200, fs.readFileSync(path.resolve(projectPath, 'autocorrect-no-fixes.json'))),
        ],
      ]);
      describe('when activated', () => {
        describe('and there is a supported file open', () => {
          beforeEach(() => {
            waitsForPromise(() => atom.packages.activatePackage('kite').then(pkg => {
              kitePkg = pkg.mainModule;
            }));
            waitsForPromise(() => atom.workspace.open('errored.py').then(e => {
              editor = e;
              buffer = editor.getBuffer();
              spyOn(buffer.buffer, 'save').andCallFake(() => Promise.resolve());
            }));
            waitsFor('kite editor', () => kiteEditor = kitePkg.kiteEditorForEditor(editor));
            waitsFor('kite editor tokens', () => kiteEditor.updateTokens());
            runs(() => {
              spyOn(kiteEditor, 'willSaveHook').andCallThrough();
            });
          });

          it('invokes the will-save hook', () => {
            editor.save();

            waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 0);
            runs(() => {
              expect(kiteEditor.willSaveHook).toHaveBeenCalled();
            });
          });

          it('sends the content of the buffer over to the save and autocorrect endpoint', () => {
            editor.save();

            waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 0);
            runs(() => {
              expect(http.request)
              .toHaveBeenCalledWithPath('/clientapi/editor/autocorrect/validation/on-save');
              expect(http.request)
              .toHaveBeenCalledWithPath('/clientapi/editor/autocorrect');
            });
          });

          describe('when there are no errors to fix', () => {
            it('does not change the file content', () => {
              const text = editor.getText();

              editor.save();

              waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 0);
              runs(() => {
                expect(editor.getText()).toEqual(text);
              });
            });
          });

          describe('when there are some errors to fix', () => {
            withRoutes([
              [
                o => /^\/clientapi\/editor\/autocorrect$/.test(o.path),
                o => fakeResponse(200, fs.readFileSync(path.resolve(projectPath, 'autocorrect-with-fixes.json'))),
              ],
            ]);

            beforeEach(() => {
              editor.save();

              waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 0);
            });

            it('changes the file content', () => {
              expect(editor.getText()).toEqual('for x in list:\n    print(x)\n');
            });

            it('displays the number of fixed errors in the status bar', () => {
              const status = kitePkg.getAutocorrectStatusItem();

              expect(status.textContent).toEqual('1 error fixed');
            });

            describe('saving the file again with no errors this time', () => {
              withRoutes([
                [
                  o => /^\/clientapi\/editor\/autocorrect$/.test(o.path),
                  o => fakeResponse(200, fs.readFileSync(path.resolve(projectPath, 'autocorrect-fixed-no-fixes.json'))),
                ],
              ]);

              beforeEach(() => {
                editor.save();

                waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 1);
              });

              it('does not change the file content', () => {
                expect(editor.getText()).toEqual('for x in list:\n    print(x)\n');
              });

              it('clears the status bar content', () => {
                const status = kitePkg.getAutocorrectStatusItem();

                expect(status.textContent).toEqual('');
              });
            });

            describe('clicking on the status', () => {
              let status, sidebar;

              beforeEach(() => {
                status = kitePkg.getAutocorrectStatusItem();
                click(status);
                sidebar = workspaceElement.querySelector('kite-autocorrect-sidebar');
              });

              it('opens the autocorrect sidebar panel', () => {
                expect(sidebar).not.toBeNull();
              });

              it('displays the diffs of last fix', () => {
                const diff = sidebar.querySelector('.diff');

                expect(diff).not.toBeNull();

                expect(diff.querySelector('del .line-number').textContent).toEqual('1');
                expect(diff.querySelector('del .line').textContent).toEqual('for x in list');

                expect(diff.querySelector('ins .line-number').textContent).toEqual('1');
                expect(diff.querySelector('ins .line').textContent).toEqual('for x in list:');
              });

              describe('then clicking on the sidebar close button', () => {
                beforeEach(() => {
                  const button = sidebar.querySelector('button.icon-x');

                  click(button);
                });

                it('removes the sidebar panel', () => {
                  expect(workspaceElement.querySelector('kite-autocorrect-sidebar')).toBeNull();
                });
              });
            });
          });

          describe('when there are some errors to fix but the hash mismatches', () => {
            let status;

            withRoutes([
              [
                o => /^\/clientapi\/editor\/autocorrect\/metrics$/.test(o.path),
                o => fakeResponse(200),
              ], [
                o => /^\/clientapi\/editor\/autocorrect$/.test(o.path),
                o => fakeResponse(200, fs.readFileSync(path.resolve(projectPath, 'autocorrect-hash-mismatch.json'))),
              ],
            ]);

            beforeEach(() => {
              editor.save();

              status = kitePkg.getAutocorrectStatusItem();

              waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 0);
            });

            it('does not change the file content', () => {
              expect(editor.getText()).toEqual('for x in list\n    print(x)\n');
            });

            it('clears the status bar content', () => {
              expect(status.textContent).toEqual('');
            });

            it('sends the received response to the metrics endpoint', () => {
              expect(http.request).toHaveBeenCalledWithPath('/clientapi/editor/autocorrect/metrics');
            });
          });

          describe('when the sidebar is open on a file fixes', () => {
            let sidebar, status;

            withRoutes([
              [
                o => /^\/clientapi\/editor\/autocorrect$/.test(o.path),
                o => fakeResponse(200, fs.readFileSync(path.resolve(projectPath, 'autocorrect-with-fixes.json'))),
              ],
            ]);

            beforeEach(() => {
              editor.save();

              status = kitePkg.getAutocorrectStatusItem();

              waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 0);
              runs(() => kitePkg.toggleAutocorrectSidebar());
              waitsFor('autocorrect sidebar', () => sidebar = workspaceElement.querySelector('kite-autocorrect-sidebar'));
              waitsFor('initial diff view', () => sidebar.querySelector('.diff'));
            });

            describe('then opening a new file', () => {
              beforeEach(() => {
                waitsForPromise(() => atom.workspace.open('sample.py'));
              });

              it('clears the sidebar content', () => {
                const diff = sidebar.querySelector('.diff');

                expect(diff).toBeNull();
              });

              it('clears the status bar content', () => {
                expect(status.textContent).toEqual('');
              });

              describe('and switching back to the previous file', () => {
                beforeEach(() => {
                  waitsForPromise(() => atom.workspace.open('errored.py'));
                });

                it('displays back the diffs for that file', () => {
                  expect(sidebar.querySelector('.diff')).not.toBeNull();
                });
              });

            });

            describe('when new fixes are made while sidebar is open', () => {
              withRoutes([
                [
                  o => /^\/clientapi\/editor\/autocorrect$/.test(o.path),
                  o => fakeResponse(200, fs.readFileSync(path.resolve(projectPath, 'autocorrect-fixed-with-fixes.json'))),
                ],
              ]);

              beforeEach(() => {
                editor.save();

                waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 1);
              });

              it('refreshes the sidebar content', () => {
                expect(sidebar.querySelectorAll('.diff').length).toEqual(2);
              });

              it('clears the status bar content', () => {
                expect(status.textContent).toEqual('');
              });
            });

            describe('toggling on the checkbox input', () => {
              it('activates the corresponding setting', () => {
                const input = sidebar.querySelector('input');
                input.checked = true;
                input.dispatchEvent(new window.Event('change'));

                expect(atom.config.get('kite.openAutocorrectSidebarOnSave')).toBeTruthy();
              });
            });
          });

          describe('when the openAutocorrectSidebarOnSave is true', () => {
            let sidebar, status;

            withRoutes([
              [
                o => /^\/clientapi\/editor\/autocorrect$/.test(o.path),
                o => fakeResponse(200, fs.readFileSync(path.resolve(projectPath, 'autocorrect-with-fixes.json'))),
              ],
            ]);

            beforeEach(() => {
              atom.config.set('kite.openAutocorrectSidebarOnSave', true);

              editor.save();

              status = kitePkg.getAutocorrectStatusItem();

              waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 0);
              waitsFor('autocorrect sidebar', () => sidebar = workspaceElement.querySelector('kite-autocorrect-sidebar'));
              waitsFor('initial diff view', () => sidebar.querySelector('.diff'));
            });

            it('does not show the fixes count in the status bar', () => {
              expect(status.textContent).toEqual('');
            });

            it('checks the checkbox', () => {
              expect(sidebar.querySelector('input').checked).toBeTruthy();
            });
          });
        });
      });
    });
  });
});
