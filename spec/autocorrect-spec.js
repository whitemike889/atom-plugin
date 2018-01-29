'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const {withKiteWhitelistedPaths, withRoutes, fakeKiteInstallPaths, fakeResponse} = require('./spec-helpers');
const projectPath = path.join(__dirname, 'fixtures');


fdescribe('autocorrect', () => {
  let kitePkg, kiteEditor, editor, buffer, jasmineContent, workspaceElement;

  fakeKiteInstallPaths();

  beforeEach(() => {
    jasmineContent = document.querySelector('#jasmine-content');
    workspaceElement = atom.views.getView(atom.workspace);

    jasmineContent.appendChild(workspaceElement);
  });

  describe('with the current project path not in the whitelist', () => {
    withKiteWhitelistedPaths(() => {
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

            it('changes the file content', () => {
              editor.save();

              waitsFor('buffer saved', () => buffer.buffer.save.calls.length > 0);
              runs(() => {
                expect(editor.getText()).toEqual('for x in list:\n    print(x)\n');
              });
            });
          });

        });
      });
    });
  });
});
