module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
 // Contents of this plugin will be reset by Kite on start.
// Changes you make are not guaranteed to persist.

let child_process, CompositeDisposable, AccountManager, Logger, completions, metrics, KiteApp, KiteStatusPanel, NotificationsCenter, RollbarReporter, OverlayManager, KiteEditors, DataLoader, KSG, DisposableEvent, Disposable, KiteAPI, VirtualCursor, NodeClient, KiteConnect, Status;
const Kite = module.exports = {
  getModule(name) {
    return this.modules && this.modules[name];
  },

  hasModule(name) {
    return this.modules && !!this.modules[name];
  },

  registerModule(name, mod) {
    if (!name) {
      throw new Error('module name is mandatory');
    }

    if (this.modules && name in this.modules) {
      throw new Error(`a module with name '${name}' has already been registered`);
    }

    if (typeof mod != 'object' || !mod.init || !mod.dispose) {
      throw new Error('module must be an object with init and dispose method');
    }

    this.modules = this.modules || {};
    this.modules[name] = mod;
    this.requestModuleInit(mod);
  },

  disposeModules() {
    this.modules && Object.values(this.modules).forEach(mod => mod.dispose());
    delete this.modules;
  },

  requestModuleInit(mod) {
    this.modulesToActivate = this.modulesToActivate || [];
    this.modulesToActivate.push(mod);

    if (this.activationRequested) {
      return;
    }

    this.activationRequested = true;
    requestAnimationFrame(() => {
      this.modulesToActivate.forEach(mod => mod.init(this));
      delete this.modulesToActivate;
      delete this.activationRequested;
    });
  },

  activate() {
    // Lazy load all the things, at least all the things we need during activation
    // In terms of performance it means that all these requires won't be measured
    // in the package loading time but in the activation time.
    if (!AccountManager) {
      __webpack_require__(1);

      ({
        CompositeDisposable,
        Disposable
      } = __webpack_require__(2));
      ({
        AccountManager,
        Logger
      } = __webpack_require__(7));
      KiteApp = __webpack_require__(120);
      KiteAPI = __webpack_require__(121);
      KiteConnect = __webpack_require__(122);
      NodeClient = __webpack_require__(128);
      NotificationsCenter = __webpack_require__(143);
      RollbarReporter = __webpack_require__(152);
      metrics = __webpack_require__(149);
      DataLoader = __webpack_require__(154);
      KiteEditors = __webpack_require__(160);
      Status = __webpack_require__(171);
      KSG = __webpack_require__(173);
    }

    metrics.featureRequested('starting'); // We store all the subscriptions into a composite disposable to release
    // them on deactivation

    this.subscriptions = new CompositeDisposable();

    if (!atom.inSpecMode()) {
      this.subscriptions.add(atom.config.observe('kite.developerMode', value => {
        if (value && KiteConnect.client instanceof NodeClient) {
          KiteConnect.toggleRequestDebug();
        } else if (!value && !(KiteConnect.client instanceof NodeClient)) {
          KiteConnect.toggleRequestDebug();
        }
      }));
    }

    this.registerModule('editors', new KiteEditors());
    this.registerModule('status', new Status());
    this.registerModule('ksg', new KSG()); // run "apm upgrade kite"

    this.selfUpdate();
    this.app = new KiteApp(this);
    this.notifications = new NotificationsCenter(this.app);
    this.reporter = new RollbarReporter(); // All these objects have a dispose method so we can just
    // add them to the subscription.

    this.subscriptions.add(this.app);
    this.subscriptions.add(this.notifications);
    this.subscriptions.add(this.reporter);
    this.getStatusPanel().setApp(this.app);

    const clickListener = () => {
      metrics.featureRequested('status_panel');
      this.getStatusPanel().show(this.getStatusItem()).then(() => {
        metrics.featureFulfilled('status_panel');
      });
    };

    const item = this.getStatusItem();
    item.addEventListener('click', clickListener);
    this.subscriptions.add(new Disposable(() => {
      item.removeEventListener('click', clickListener);
    })); // We listen to any opened URI to catch when the user open the settings
    // panel and pick the kite settings

    this.subscriptions.add(atom.workspace.onDidOpen(e => {
      if (e.uri === 'atom://config' && !this.settingsViewSubscription) {
        if (!DisposableEvent) {
          ({
            DisposableEvent
          } = __webpack_require__(5));
        }

        const settingsView = e.item;
        this.settingsViewSubscription = new DisposableEvent(settingsView.element, 'mouseup', () => {
          setTimeout(() => {
            const kiteSettings = settingsView.panelsByName['kite'];

            if (kiteSettings && kiteSettings.element.style.display !== 'none') {
              metrics.featureRequested('settings');
              metrics.featureFulfilled('settings');
            }
          }, 100);
        });
        this.subscriptions.add(this.settingsViewSubscription);
      }
    })); // Whenever an action is accomplished through the kite app
    // we need to check again the state of the app

    this.subscriptions.add(this.app.onDidInstall(() => this.connect('onDidInstall')));
    this.subscriptions.add(this.app.onDidStart(() => this.connect('onDidStart'))); // CONFIG
    // Removing old configuration options

    const kiteCfg = atom.config.getAll('kite');
    const validKeys = ['showWelcomeNotificationOnStartup', 'enableCompletions', 'enableHoverUI', 'enableSnippets', 'maxVisibleSuggestionsAlongSignature', 'loggingLevel', 'pollingInterval', 'developerMode', 'startKiteAtStartup'];

    if (kiteCfg.length) {
      const kiteCfgKeys = Object.keys(kiteCfg[0].value);
      kiteCfgKeys.forEach(k => {
        if (validKeys.indexOf(k) === -1) {
          atom.config.unset(`kite.${k}`);
        }
      });
    }

    this.subscriptions.add(atom.config.observe('kite.loggingLevel', level => {
      Logger.LEVEL = Logger.LEVELS[level.toUpperCase()];
    }));
    this.subscriptions.add(atom.config.observe('core.useTreeSitterParsers', using => {
      if (using) {
        const notif = atom.notifications.addWarning('Kite is not configured properly', {
          description: 'You must turn off Atom\'s tree-sitter parser for Kite to show you information on how to call functions. <a href="https://help.kite.com/article/80-why-do-i-need-to-turn-off-tree-sitter">Learn more</a>\n\nRestart will occur after a few seconds.',
          dismissable: true,
          buttons: [{
            text: 'Turn off and restart',

            onDidClick() {
              atom.config.set('core.useTreeSitterParsers', false);
              notif.dismiss();
              setTimeout(() => {
                atom.reload();
              }, 1500);
            }

          }]
        });
      }
    })); // COMMANDS

    this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
      // Allow esc key to close expand view
      // TODO: hook up to close KSG if open
      'core:cancel': () => {
        if (!OverlayManager) {
          OverlayManager = __webpack_require__(168);
        }

        OverlayManager.dismiss();
        this.closeKSG();
      },
      'kite:docs-at-cursor': () => {
        this.expandAtCursor();
      }
    }));
    this.subscriptions.add(atom.commands.add('atom-overlay kite-expand', {
      'core:cancel'() {
        this.remove();
      }

    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'kite:ksg': () => this.toggleKSG(),
      'kite:tutorial': () => this.openKiteTutorial(true),
      'kite:engine-settings': () => this.openSettings(),
      'kite:open-copilot': () => this.openCopilot(),
      'kite:package-settings': () => atom.applicationDelegate.openExternal('atom://settings-view/show-package?package=kite'),
      'kite:help': () => atom.applicationDelegate.openExternal('https://help.kite.com/category/43-atom-integration'),
      'kite:status': () => {
        metrics.featureRequested('status_panel');
        this.getStatusPanel().show(this.getStatusItem()).then(() => {
          metrics.featureFulfilled('status_panel');
        });
      }
    })); // START

    console.log('MUSAH');
    this.patchCompletions(); // onboarding handling
    //open kite onboarding if flag indicates so

    if (atom.config.get('kite.showWelcomeNotificationOnStartup')) {
      this.openKiteTutorial();
    } // Store the last expand at cursor highlight. This is necessary
    // for navigable panel to turn it red when no data comes back.


    this.lastExpandAtCursorHighlight = null; // We try to connect at startup

    this.app.connect('activation').then(state => {
      if (state === KiteApp.STATES.UNINSTALLED && !this.app.wasInstalledOnce()) {
        this.app.installFlow();
      } else if (state !== KiteApp.STATES.UNINSTALLED) {
        this.app.saveUserID();

        if (state === KiteApp.STATES.NOT_RUNNING && atom.config.get('kite.startKiteAtStartup')) {
          this.app.start().then(() => this.app.connect('activation'));
        }
      }
    });
    metrics.featureFulfilled('starting');
  },

  connect(src) {
    return this.app.connect(src);
  },

  getEditorsForPath(path) {
    return atom.workspace.getPaneItems().filter(i => i && i.getURI && i.getURI() === path);
  },

  deactivate() {
    this.disposeModules(); // Release all subscriptions on deactivation

    metrics.featureRequested('stopping');
    this.subscriptions.dispose();
    metrics.featureFulfilled('stopping');
  },

  selfUpdate() {
    if (!child_process) {
      child_process = __webpack_require__(16);
    }

    const apm = atom.packages.getApmPath();
    child_process.spawn(apm, ['update', 'kite']);
  },

  consumeStatusBar(statusbar) {
    statusbar.addRightTile({
      item: this.getStatusItem()
    });
  },

  activateAndShowItem(item) {
    if (item) {
      const dock = atom.workspace.paneContainerForURI(item.getURI());
      const pane = atom.workspace.paneForURI(item.getURI());

      if (pane && dock) {
        dock.show();
        pane.setActiveItem(item);
      }
    }
  },

  expandAtCursor(editor) {
    editor = editor || atom.workspace.getActiveTextEditor();

    if (!editor) {
      return;
    }

    const position = editor.getLastCursor().getBufferPosition();
    this.highlightWordAtPosition(editor, position);

    if (!editor.getPath()) {
      return;
    }

    DataLoader.getHoverDataAtPosition(editor, position).then(data => {
      const [symbol] = data.symbol;

      if (symbol && symbol.id) {
        atom.applicationDelegate.openExternal(`kite://docs/${symbol.id}`);
      }
    });
  },

  highlightWordAtPosition(editor, position, cls = '') {
    if (!VirtualCursor) {
      VirtualCursor = __webpack_require__(165);
    }

    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false
    });
    const marker = editor.markBufferRange(range, {
      invalidate: 'touch'
    });
    const decoration = editor.decorateMarker(marker, {
      type: 'highlight',
      "class": `expand-at-cursor-highlight ${cls}`,
      item: this
    }); // Timed for all transition to be finished by then

    setTimeout(() => decoration.destroy(), 800);
  },

  getStatusItem() {
    return this.getModule('status').getElement();
  },

  getStatusPanel() {
    if (this.statusPanel) {
      return this.statusPanel;
    }

    if (!KiteStatusPanel) {
      KiteStatusPanel = __webpack_require__(177);
    }

    this.statusPanel = new KiteStatusPanel();
    return this.statusPanel;
  },

  completions() {
    if (!completions) {
      completions = __webpack_require__(178);
    }

    return completions;
  },

  toggleKSG() {
    const KSGModule = this.getModule('ksg');

    if (KSGModule) {
      const editor = atom.workspace.getActiveTextEditor();
      KSGModule.visible ? KSGModule.hide() : KSGModule.show(editor);
    }
  },

  closeKSG() {
    const KSGModule = this.getModule('ksg');
    KSGModule && KSGModule.hide();
  },

  openPermissions() {
    const url = 'kite://settings/permissions';
    atom.applicationDelegate.openExternal(url);
  },

  openSettings() {
    const url = 'kite://settings';
    atom.applicationDelegate.openExternal(url);
  },

  openKiteTutorial(fromCommand) {
    if (fromCommand) {
      KiteAPI.getOnboardingFilePath('atom').then(path => {
        atom.workspace.open(path);
      })["catch"](err => {
        this.notifications.warnOnboardingFileFailure();
      });
    } else {
      KiteAPI.isKiteLocal().then(isLocal => {
        if (isLocal) {
          // then attempt live onboarding
          KiteAPI.getKiteSetting('has_done_onboarding').then(hasDone => {
            if (!hasDone) {
              KiteAPI.getOnboardingFilePath('atom').then(path => {
                atom.workspace.open(path);
                KiteAPI.setKiteSetting('has_done_onboarding', true);
              })["catch"](err => {
                this.notifications.onboardingNotifications();
              });
            } else {
              // do welcome notification without onboarding reference
              this.notifications.onboardingNotifications();
            }
          });
        } else {
          // do welcome notification without onboarding reference
          this.notifications.onboardingNotifications();
        }
      });
    }
  },

  openCopilot() {
    const url = 'kite://home';
    atom.applicationDelegate.openExternal(url);
  },

  isSaveAll() {
    return this.saveAllTriggered;
  },

  patchCompletions() {
    atom.packages.activatePackage('autocomplete-python').then(acp => {
      const safeProvider = acp.mainModule.provider.getSuggestions;

      acp.mainModule.provider.getSuggestions = options => {
        const {
          prefix
        } = options;
        const res = safeProvider.call(acp.mainModule.provider, options);
        return res && res.then ? res.then(res => /\($/.test(prefix) ? [] : res) : /\($/.test(prefix) ? [] : res;
      };
    })["catch"](() => {});
    atom.packages.activatePackage('autocomplete-plus').then(autocompletePlus => {
      const acp = autocompletePlus.mainModule;
      const manager = acp.autocompleteManager || acp.getAutocompleteManager();
      const list = manager.suggestionList;
      const listElement = list.suggestionListElement ? list.suggestionListElement : atom.views.getView(list); // Override Atom's snippets package to trigger completions request
      // on tab stop, using autocomplete-plus's findSuggestions function.

      if (atom.config.get('kite.enableSnippets')) {
        atom.packages.activatePackage('snippets').then(snippetsPkg => {
          const snippets = snippetsPkg.mainModule;
          const safeGoToNextTabStop = snippets && snippets.goToNextTabStop;
          const safeGoToPreviousTabStop = snippets && snippets.goToPreviousTabStop;

          snippets.goToNextTabStop = editor => {
            manager.findSuggestions(false);
            return safeGoToNextTabStop.call(snippets, editor);
          };

          snippets.goToPreviousTabStop = editor => {
            manager.findSuggestions(false);
            return safeGoToPreviousTabStop.call(snippets, editor);
          };
        });
      }

      const safeUpdate = listElement && listElement.updateDescription;
      const safeDisplay = manager && manager.displaySuggestions;
      const safeShowOrHide = manager && manager.showOrHideSuggestionListForBufferChanges;
      const safeConfirm = manager && manager.confirm;
      const safeReplaceTextWithMatch = manager && manager.replaceTextWithMatch;
      const safeCursorMoved = manager && manager.cursorMoved;
      const safeHide = manager && manager.hideSuggestionList;

      if (safeDisplay) {
        const element = listElement.element ? listElement.element : listElement;
        let confirmed;
        this.subscriptions.add(new Disposable(() => {
          listElement.updateDescription = safeUpdate;
          manager.displaySuggestions = safeDisplay;
          manager.showOrHideSuggestionListForBufferChanges = safeShowOrHide;
          manager.confirm = safeConfirm;
          manager.replaceTextWithMatch = safeReplaceTextWithMatch;
          manager.cursorMoved = safeCursorMoved;
          manager.hideSuggestionList = safeHide;
        }));

        manager.confirm = suggestion => {
          confirmed = true;
          requestAnimationFrame(() => confirmed = false);
          return safeConfirm.call(manager, suggestion);
        };

        manager.replaceTextWithMatch = suggestion => {
          if (atom.config.get('kite.enableSnippets')) {
            // Tweak behavior of ACP text replacement
            const editor = manager.editor;

            if (!editor) {
              return;
            }

            const cursor = editor.getLastCursor();
            const replacementRange = suggestion.replacementRange;

            if (!cursor || !replacementRange) {
              return;
            }

            editor.transact(() => {
              // Move cursor to end position
              cursor.setBufferPosition(replacementRange.end); // Select up to and including the start position

              cursor.selection.selectToBufferPosition(replacementRange.begin); // Insert suggestion

              if (suggestion.snippet && manager.snippetsManager) {
                manager.snippetsManager.insertSnippet(suggestion.snippet, editor, cursor);
                manager.findSuggestions(false);
              } else {
                cursor.selection.insertText(suggestion.text ? suggestion.text : suggestion.snippet, {
                  autoIndentNewline: editor.shouldAutoIndent(),
                  autoDecreaseIndent: editor.shouldAutoIndent()
                });
              }
            });
          } else {
            safeReplaceTextWithMatch.call(manager, suggestion);
          }
        };

        manager.hideSuggestionList = () => {
          const editor = atom.workspace.getActiveTextEditor();

          if (typeof editor !== 'undefined') {
            const position = editor.getCursorBufferPosition();

            if (completions.isSignaturePanelVisible() && (completions.isInsideFunctionCall(editor, position) || completions.isOnFunctionCallBrackets(editor, position))) {
              manager.suggestionList.changeItems(null);
              element.querySelector('.suggestion-description').style.display = 'none';
            } else {
              safeHide.call(manager);
            }
          }
        };

        manager.cursorMoved = event => {
          const editor = event.cursor.editor;
          const position = event.newBufferPosition;

          if (completions && (completions.isInsideFunctionCall(editor, position) || completions.isOnFunctionCallBrackets(editor, position)) && completions.isSignaturePanelVisible()) {
            manager.suggestionList.changeItems(null);
            element.querySelector('.suggestion-description').style.display = 'none';
            completions.loadSignature({
              editor,
              position
            }).then(shown => {
              if (!shown) {
                safeHide.call();
              }
            }); // refresh sig
          } else {
            safeCursorMoved.call(manager, event);
          }
        };

        manager.showOrHideSuggestionListForBufferChanges = options => {
          if (confirmed) {
            // autocomplete-plus operates on the last change, so do we
            const change = options.changes[options.changes.length - 1]; // we know we have confirmed a suggestion for a 1 char entry with a
            // 1 char trigger, we cancel the new suggestion request and hide
            // the suggestions using the same routine than autocomplete-plus

            if (change.oldText.length === 1 && change.newText.length === 1) {
              manager.cancelNewSuggestionsRequest();
              manager.hideSuggestionList();
            } else {
              safeShowOrHide.call(manager, options);
            }
          } else {
            safeShowOrHide.call(manager, options);
          }
        }; // this line below is needed to update the manager's callback reference for onDidChangeText from the
        // original showOrHideSuggestionListForBufferChanges, since that was bound
        // see https://github.com/atom/autocomplete-plus/blob/master/lib/autocomplete-manager.js#L106


        manager.buffer && manager.buffer.onDidChangeText(manager.showOrHideSuggestionListForBufferChanges);

        manager.displaySuggestions = (suggestions, options) => {
          if (element.querySelector('kite-signature')) {
            const desc = element.querySelector('.suggestion-description');

            if (desc) {
              if (suggestions.length === 0) {
                desc.style.display = 'none';
                return;
              } else {
                desc.style.display = '';
              }
            }

            if (parseFloat(autocompletePlus.metadata.version) >= 2.36) {
              manager.showSuggestionList(manager.getUniqueSuggestions(suggestions, s => s.text), options);
            } else {
              manager.showSuggestionList(manager.getUniqueSuggestions(suggestions), options);
            }
          } else {
            safeDisplay.call(manager, suggestions, options);
          }
        };
      }

      if (safeUpdate) {
        listElement.updateDescription = item => {
          safeUpdate.call(listElement, item);

          if (!item) {
            if (listElement.model && listElement.model.items) {
              item = listElement.model.items[listElement.selectedIndex];
            }
          }

          if (item && item.descriptionHTML) {
            listElement.descriptionContainer.classList.add('kite-completions');
            listElement.descriptionContent.innerHTML = item.descriptionHTML;

            if (typeof listElement.setDescriptionMoreLink === 'function') {
              listElement.setDescriptionMoreLink(item);
            }
          }
        };

        if (!listElement.ol) {
          listElement.renderList();
        }
      } else {
        listElement.descriptionContainer.classList.remove('kite-completions');
      }
    });
  }

};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {
  CompositeDisposable,
  Emitter
} = __webpack_require__(2);

const LinkScheme = __webpack_require__(3);

const {
  copilotProtocolSupported
} = __webpack_require__(5);

let Kite;

const {
  stripLeadingSlash,
  parseRangeInPath,
  parsePositionInPath,
  parseDefinitionInPath
} = __webpack_require__(5);

class KiteLinks extends HTMLElement {
  static initClass() {
    customElements.define('kite-links', this);
    return this;
  }

  onDidClickMoreLink(listener) {
    return this.emitter.on('did-click-more-link', listener);
  }

  onDidClickActionLink(listener) {
    if (this.emitter.disposed) {
      return null;
    }

    return this.emitter.on('did-click-action-link', listener);
  }

  constructor() {
    super();
    this.emitter = new Emitter();
  }

  connectedCallback() {
    this.subscriptions = new CompositeDisposable();
    this.scheme = new LinkScheme('kite-atom-internal', this);
    this.subscriptions.add(this.scheme);
    this.subscriptions.add(this.emitter);
    this.subscriptions.add(this.scheme.onDidClickLink(({
      url,
      target
    }) => {
      if (!Kite) {
        Kite = __webpack_require__(0);
      }

      const editor = atom.workspace.getActiveTextEditor();
      const kiteEditor = Kite.getModule('editors').kiteEditorForEditor(editor);
      const emitAction = this.getAttribute('emit-action');

      switch (url.host) {
        case 'open-settings':
          emitAction && this.emitter.emit('did-click-action-link');
          atom.applicationDelegate.openExternal('atom://settings-view/show-package?package=kite');
          return;

        case 'open-copilot-settings':
          emitAction && this.emitter.emit('did-click-action-link');
          atom.applicationDelegate.openExternal('kite://settings');
          return;

        case 'open-copilot-permissions':
          emitAction && this.emitter.emit('did-click-action-link');
          atom.applicationDelegate.openExternal(`kite://settings/permissions${url.path || ''}`);
          return;

        case 'open-search-docs':
          emitAction && this.emitter.emit('did-click-action-link');
          const path = url.path ? url.path : '';
          copilotProtocolSupported() // this will open the copilot
          ? atom.applicationDelegate.openExternal(`kite://docs${path}`) //this will open the webdocs via our desktoplogin endpoint to ensure that account information is communicated
          // to the webapp
          : atom.applicationDelegate.openExternal(`http://localhost:46624/clientapi/desktoplogin?d=/python/docs${path}`);
          return;

        case 'open-kite-plugin-help':
          emitAction && this.emitter.emit('did-click-action-link');
          atom.applicationDelegate.openExternal('http://help.kite.com/category/43-atom-integration');
          return;
      }

      if (!editor || !kiteEditor) {
        return;
      }

      switch (url.host) {
        case 'goto':
          {
            const [filename, line, column] = parseDefinitionInPath(url.path);
            kiteEditor.openDefinition({
              filename,
              line,
              column
            })["catch"](err => {
              atom.notifications.addWarning('Can\'t find the definition', {
                dismissable: true
              });
            });
            break;
          }

        case 'goto-id':
          {
            const id = stripLeadingSlash(url.path);
            kiteEditor.openDefinitionForId(id)["catch"](() => {
              atom.notifications.addWarning(`Can't find a definition for id \`${id}\``, {
                dismissable: true
              });
            });
            break;
          }

        case 'goto-range':
          {
            const range = parseRangeInPath(url.path);
            kiteEditor.openDefinitionAtRange(range)["catch"](err => {
              atom.notifications.addWarning(`Can't find a definition at range \`${range}\``, {
                dismissable: true
              });
            });
            break;
          }

        case 'goto-position':
          {
            const position = parsePositionInPath(url.path);
            kiteEditor.openDefinitionAtPosition(position)["catch"](err => {
              atom.notifications.addWarning(`Can't find a definition at position \`${position}\``, {
                dismissable: true
              });
            });
            break;
          }

        case 'expand-position':
          {
            this.emitter.emit('did-click-more-link');
            const position = parsePositionInPath(url.path);
            kiteEditor.expandPosition(position);
            break;
          }

        case 'type':
        case 'expand':
          {
            this.emitter.emit('did-click-more-link');
            const id = stripLeadingSlash(url.path);
            atom.applicationDelegate.openExternal(`kite://docs/${encodeURI(id)}`);
            break;
          }
      }
    }));
  }

  disconnectedCallback() {
    this.subscriptions && this.subscriptions.dispose();
  }

}

module.exports = KiteLinks.initClass();

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("atom");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const url = __webpack_require__(4);

const {
  Emitter
} = __webpack_require__(2);

const {
  addDelegatedEventListener
} = __webpack_require__(5);

module.exports = class LinkScheme {
  constructor(scheme, container = document) {
    this.scheme = scheme;
    this.schemeRegExp = new RegExp(`^${this.scheme}://`);
    this.emitter = new Emitter();
    this.subscription = addDelegatedEventListener(container, 'click', 'a', e => {
      const {
        target
      } = e;
      const uri = target && target.getAttribute('href');

      if (uri && this.schemeRegExp.test(uri)) {
        e.stopPropagation();
        this.emitter.emit('did-click-link', {
          target,
          url: url.parse(uri)
        });
      }
    });
  }

  dispose() {
    this.subscription.dispose();
    this.emitter.dispose();
  }

  onDidClickLink(listener) {
    return this.emitter.on('did-click-link', listener);
  }

};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const os = __webpack_require__(6);

const {
  Disposable
} = __webpack_require__(2);

const compact = a => a.filter(v => v && v !== '');

const uniq = a => a.reduce((m, v) => m.indexOf(v) === -1 ? m.concat(v) : m, []);

const flatten = a => a.reduce((m, o) => m.concat(Array.isArray(o) ? flatten(o) : o), []);

const head = a => a[0];

const last = a => a[a.length - 1];

const log = v => {
  console.log(v);
  return v;
};

const getDetails = (o, ...details) => o.detail || o.details && details.reduce((m, k) => {
  return m || o.details[k];
}, null);

const evalPath = (o, ...path) => path.reduce((m, k) => {
  if (k === '*' && m) {
    k = head(Object.keys(m));
  }

  return m && typeof m[k] !== 'undefined' ? m[k] : undefined;
}, o);

const detailLang = o => o && o.language_details ? head(Object.keys(o.language_details)).toLowerCase() : 'python';

const detailGet = (o, ...k) => evalPath(o, 'language_details', '*', ...k);

const detailExist = (o, ...k) => detailGet(o, ...k) != null;

const detailNotEmpty = (o, ...k) => {
  const v = detailGet(o, ...k);
  return v != null && v.length > 0;
};

const getFunctionDetails = o => {
  const type = head(Object.keys(o.details).filter(k => o.details[k]));

  if (type === 'function') {
    return o.details["function"];
  } else if (type === 'type') {
    return detailGet(o.details.type, 'constructor');
  }

  return null;
};

const merge = (a, b) => {
  const c = {};

  for (const k in a) {
    c[k] = a[k];
  }

  for (const k in b) {
    c[k] = b[k];
  }

  return c;
};

const truncate = (s, l) => s.length > l ? s.slice(0, l) + '…' : s;

const stripLeadingSlash = str => str.replace(/^\//, '');

const parseRangeInPath = path => stripLeadingSlash(path).split('/').map(s => s.split(':').map(Number));

const parsePositionInPath = path => stripLeadingSlash(path).split(':').map(Number);

const parseDefinitionInPath = path => (os.platform() === 'win32' ? stripLeadingSlash(path) : path).split(/:(?=\d)/).map(decodeURI).map(s => /^\d+$/.test(s) ? parseInt(s, 10) : s);

class DisposableEvent extends Disposable {
  constructor(target, event, listener) {
    const events = event.split(/\s+/g);

    if (typeof target.addEventListener === 'function') {
      super(() => events.forEach(e => target.removeEventListener(e, listener)));
      events.forEach(e => target.addEventListener(e, listener));
    } else if (typeof target.on === 'function') {
      super(() => events.forEach(e => target.off(e, listener)));
      events.forEach(e => target.on(e, listener));
    } else {
      throw new Error('The passed-in source must have either a addEventListener or on method');
    }
  }

}

function addDelegatedEventListener(object, event, selector, callback) {
  if (typeof selector === 'function') {
    callback = selector;
    selector = '*';
  }

  return new DisposableEvent(object, event, listener);

  function listener(e) {
    if (e.isPropagationStopped) {
      return;
    }

    let {
      target
    } = e;
    decorateEvent(e);
    nodeAndParents(target).forEach(node => {
      const matched = node.matches(selector);

      if (e.isImmediatePropagationStopped || !matched) {
        return;
      }

      e.matchedTarget = node;
      callback(e);
    });
  }

  function decorateEvent(e) {
    const overriddenStop = window.Event.prototype.stopPropagation;

    e.stopPropagation = function () {
      this.isPropagationStopped = true;
      overriddenStop.apply(this, arguments);
    };

    const overriddenStopImmediate = window.Event.prototype.stopImmediatePropagation;

    e.stopImmediatePropagation = function () {
      this.isImmediatePropagationStopped = true;
      overriddenStopImmediate.apply(this, arguments);
    };
  }
}

function eachParent(node, block) {
  let parent = node.parentNode;

  while (parent) {
    block(parent);

    if (parent.nodeName === 'HTML') {
      break;
    }

    parent = parent.parentNode;
  }
}

function parents(node, selector = '*') {
  const parentNodes = [];
  eachParent(node, parent => {
    if (parent.matches && parent.matches(selector)) {
      parentNodes.push(parent);
    }
  });
  return parentNodes;
}

function parent(node, selector = '*') {
  return head(parents(node, selector));
}

function nodeAndParents(node, selector = '*') {
  return [node].concat(parents(node, selector));
}

function noShadowDOM() {
  return parseFloat(atom.getVersion()) >= 1.13;
}

function editorRoot(element) {
  return noShadowDOM() ? element : element.shadowRoot || element;
}

function parseJSON(data, fallback) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
} // get time in seconds since the date


function secondsSince(when) {
  var now = new Date();
  return (now.getTime() - when.getTime()) / 1000.0;
}

function promisifyRequest(request) {
  return request.then ? request : new Promise((resolve, reject) => {
    request.on('response', resp => resolve(resp));
    request.on('error', err => reject(err));
  });
}

function promisifyReadResponse(response) {
  return new Promise((resolve, reject) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => resolve(data));
    response.on('error', err => reject(err));
  });
}

function delayPromise(factory, timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      factory().then(resolve, reject);
    }, timeout);
  });
}

function isWithinTextOfLine(editorElement, event) {
  const pixelPosition = pixelPositionForMouseEvent(editorElement, event);
  const defaultCharWidth = editorElement.getDefaultCharWidth ? editorElement.getDefaultCharWidth(pixelPosition) : editorElement.getModel().getDefaultCharWidth(pixelPosition);
  const screenPosition = editorElement.screenPositionForPixelPosition ? editorElement.screenPositionForPixelPosition(pixelPosition) : editorElement.getModel().screenPositionForPixelPosition(pixelPosition);
  const lineLengthForRow = editorElement.lineLengthForScreenRow ? editorElement.lineLengthForScreenRow(screenPosition.row) : editorElement.getModel().lineLengthForScreenRow(screenPosition.row);
  const maxLeftPixelPos = defaultCharWidth * (lineLengthForRow + 4); // extra chars for better ui

  return maxLeftPixelPos >= pixelPosition.left;
}

function bufferPositionForMouseEvent(editorElement, event) {
  return editorElement.getModel().bufferPositionForScreenPosition(screenPositionForMouseEvent(editorElement, event));
}

function screenPositionForMouseEvent(editorElement, event) {
  const pixelPosition = pixelPositionForMouseEvent(editorElement, event);

  if (pixelPosition == null) {
    return null;
  }

  return editorElement.screenPositionForPixelPosition != null ? editorElement.screenPositionForPixelPosition(pixelPosition) : editorElement.getModel().screenPositionForPixelPosition(pixelPosition);
}

function screenPositionForPixelPosition(editorElement, position) {
  if (position == null) {
    return null;
  }

  position = pixelPositionInEditorCoordinates(editorElement, position);
  return editorElement.screenPositionForPixelPosition != null ? editorElement.screenPositionForPixelPosition(position) : editorElement.getModel().screenPositionForPixelPosition(position);
}

function pixelPositionInEditorCoordinates(editorElement, position) {
  const {
    left: x,
    top: y
  } = position;
  const scrollTarget = editorElement.getScrollTop != null ? editorElement : editorElement.getModel();

  if (editorElement.querySelector('.lines') == null) {
    return null;
  }

  let {
    top,
    left
  } = editorElement.querySelector('.lines').getBoundingClientRect();
  top = y - top;
  left = x - left;

  if (parseFloat(atom.getVersion()) < 1.19) {
    top += scrollTarget.getScrollTop();
    left += scrollTarget.getScrollLeft();
  }

  return {
    top,
    left
  };
}

function pixelPositionForMouseEvent(editorElement, event) {
  const {
    clientX: left,
    clientY: top
  } = event;
  return pixelPositionInEditorCoordinates(editorElement, {
    top,
    left
  });
}

const stopPropagationAndDefault = f => function (e) {
  e.stopPropagation();
  e.preventDefault();
  return f && f.call(this, e);
};

const USER_ID_INDEX = 1;
const PATH_ID_INDEX = 4;

function idToDottedPath(id) {
  if (id.includes(';')) {
    const idarr = id.split(';');

    switch (idarr.length) {
      // value id
      case 5:
        //form: [language];[userID];[machineID];[colon delineated filepath];[dottedPath]
        //local example: python;7;3e51855fc9b0accd7bbe1eafebc9b967;:Users:dane:Desktop:stuff:whitelist:foo.py;Foo.foo
        //global example: python;;;;re
        //here we assume a value id... which could be global or local
        const valueIdPath = idarr[1] === '' ? idarr.slice(PATH_ID_INDEX).join('.') //global
        : idarr.slice(USER_ID_INDEX).join(';'); //local

        return valueIdPath;
      // symbol id

      case 6:
        //form: [language];[userID];[machineID];[colon delineated filepath];[dottedPath];[symbol]
        //local example: python;7;3e51855fc9b0accd7bbe1eafebc9b967;:Users:dane:Desktop:stuff:whitelist:foo.py;Foo;foo
        //global example: python;;;;;re
        //here we assume a symbol id
        const symbolIdPath = idarr[1] === '' ? idarr.slice(PATH_ID_INDEX).filter(part => part !== '').join('.') //global assumption => no userId
        : idarr.slice(USER_ID_INDEX).join(';'); //local assumption - recreate symbolId w/o language

        return symbolIdPath;

      default:
        return '';
    }
  }

  return '';
}

function copilotProtocolSupported() {
  return os.platform() !== 'darwin';
}

module.exports = {
  addDelegatedEventListener,
  bufferPositionForMouseEvent,
  compact,
  copilotProtocolSupported,
  delayPromise,
  detailExist,
  detailGet,
  detailLang,
  detailNotEmpty,
  DisposableEvent,
  eachParent,
  editorRoot,
  flatten,
  getDetails,
  getFunctionDetails,
  head,
  idToDottedPath,
  isWithinTextOfLine,
  last,
  log,
  merge,
  nodeAndParents,
  noShadowDOM,
  parent,
  parents,
  parseJSON,
  pixelPositionForMouseEvent,
  promisifyReadResponse,
  promisifyRequest,
  screenPositionForMouseEvent,
  screenPositionForPixelPosition,
  secondsSince,
  stopPropagationAndDefault,
  truncate,
  stripLeadingSlash,
  parseRangeInPath,
  parseDefinitionInPath,
  parsePositionInPath,
  uniq
};

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

const os = __webpack_require__(6);

const AccountManager = __webpack_require__(8);
const Errors = __webpack_require__(56);
const Logger = __webpack_require__(57);
const Metrics = __webpack_require__(60);
const StateController = __webpack_require__(66);
const NodeClient = __webpack_require__(21);
const BrowserClient = __webpack_require__(43);
const utils = __webpack_require__(15);
const install = __webpack_require__(67);

module.exports = {
  AccountManager: AccountManager,
  Errors: Errors,
  Logger: Logger,
  Metrics: Metrics,
  StateController: StateController,
  NodeClient: NodeClient,
  BrowserClient: BrowserClient,
  utils: utils,
  install: install,
};

if (typeof atom !== 'undefined') {
  const startFlow = (flow) => {
    const Install = install.Install;
    const installer = new Install(flow(), {
      path: atom.project.getPaths()[0] || os.homedir(),
    }, {
      failureStep: 'termination',
      title: 'Kite Install',
    });

    const initialClient = AccountManager.client;
    AccountManager.client = new NodeClient('alpha.kite.com', -1, '', true);

    atom.workspace.getActivePane().addItem(installer);
    atom.workspace.getActivePane().activateItem(installer);

    installer.start()
    .then(result => console.log(result))
    .catch(err => console.error(err))
    .then(() => {
      AccountManager.client = initialClient;
    });
  };

  module.exports.AtomHelper = __webpack_require__(112);

  module.exports.startInstallFlow = () => {
    startFlow(install.atom().defaultFlow);
  };

  module.exports.startInstallFlowACP = () => {
    startFlow(install.atom().autocompletePythonFlow);
  };

  module.exports.activate = function(state) {
    // This package isn't intended to be loaded as a production Atom package,
    // so we'll set the environment to debug here.
    Logger.LEVEL = Logger.LEVELS.DEBUG;
    Metrics.Tracker.source = 'kite_installer_debug';

    atom.commands.add('atom-workspace', {
      'install-kite': () => { this.startInstallFlow(); },
      'install-kite-ACP': () => { this.startInstallFlowACP(); },
    });
  };
}


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const KiteAPI = __webpack_require__(9);

module.exports = KiteAPI.Account;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const os = __webpack_require__(6);
const http = __webpack_require__(10);
const https = __webpack_require__(11);
const querystring = __webpack_require__(12);
const KiteConnector = __webpack_require__(13);
const KiteStateError = __webpack_require__(19);
const KiteRequestError = __webpack_require__(17);
const utils = __webpack_require__(15);
const NodeClient = __webpack_require__(21);
const BrowserClient = __webpack_require__(43);
const EventEmitter = __webpack_require__(14);
const EditorConfig = __webpack_require__(47);
const MemoryStore = __webpack_require__(48);
const {STATES} = KiteConnector;
const {MAX_FILE_SIZE} = __webpack_require__(49);
const {merge, checkArguments, checkArgumentKeys} = __webpack_require__(50);
const urls = __webpack_require__(51);

const KiteAPI = {
  STATES,

  emitter: new EventEmitter(),

  editorConfig: new EditorConfig(new MemoryStore()),

  toggleRequestDebug() {
    KiteConnector.toggleRequestDebug();
    this.Account.toggleRequestDebug();
  },

  requestJSON(...args) {
    return this.request(...args)
    .then(resp => utils.handleResponseData(resp))
    .then(data => JSON.parse(data));
  },

  isKiteLocal() {
    return this.request({
      path: '/clientapi/iskitelocal',
      method: 'GET',
    })
    .then(() => true)
    .catch(() => false);
  },

  setKiteSetting(key, value) {
    return this.requestJSON({
      path: `/clientapi/settings/${key}`,
      method: 'POST',
    }, JSON.stringify(value));
  },

  getKiteSetting(key) {
    return this.requestJSON({
      path: `/clientapi/settings/${key}`,
      method: 'GET',
    });
  },

  getSupportedLanguages() {
    return this.requestJSON({
      path: '/clientapi/languages',
    });
  },

  getOnboardingFilePath() {
    return this.requestJSON({
      path: '/clientapi/plugins/onboarding_file',
    });
  },

  canAuthenticateUser() {
    return KiteConnector.isKiteReachable()
    .then(() => utils.reversePromise(
      KiteConnector.isUserAuthenticated(),
      new KiteStateError('Kite is already authenticated', {
        state: STATES.AUTHENTICATED,
      })));
  },

  authenticateUser(email, password) {
    checkArguments(this.authenticateUser, email, password);
    return this.canAuthenticateUser()
    .then(() => this.request({
      path: '/clientapi/login',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }, {email, password}))
    .then(() => this.saveUserID());
  },

  authenticateSessionID(key) {
    // Unlike authenticateUser above, this method does not check to see if a
    // user is already authenticated before trying to authenticate. This
    // method is only used in specialized flows, so we're special-casing it
    // here.
    checkArguments(this.authenticateSessionID, key);
    return KiteConnector.isKiteReachable()
    .then(() => this.request({
      path: '/clientapi/authenticate',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }, {key}))
    .then(resp => this.saveUserID());
  },

  saveUserID() {
    return this.requestJSON({
      path: '/clientapi/user',
      method: 'GET',
    })
    .then(data => data.id && this.editorConfig.set('distinctID', data.id))
    .catch(() => {});
  },

  getHoverDataAtPosition(filename, source, position, editor) {
    checkArguments(this.getHoverDataAtPosition, filename, source, position);
    const path = urls.hoverPath(filename, source, position, editor);

    return this.requestJSON({path});
  },

  getReportDataAtPosition(filename, source, position, editor) {
    checkArguments(this.getReportDataAtPosition, filename, source, position, editor);
    return this.getHoverDataAtPosition(filename, source, position, editor)
    .then(data => this.getReportDataFromHover(data));
  },

  getReportDataFromHover(data) {
    const id = data.symbol[0].id;
    return !idIsEmpty(id)
      ? this.getSymbolReportDataForId(id)
        .then(report => [data, report])
        .catch(err => [data])
      : [data];
  },

  getSymbolReportDataForId(id) {
    checkArguments(this.getSymbolReportDataForId, id);
    return this.requestJSON({
      path: `/api/editor/symbol/${id}`,
    });
  },

  getValueReportDataForId(id) {
    checkArguments(this.getValueReportDataForId, id);
    return this.requestJSON({
      path: `/api/editor/value/${id}`,
    })
    .then(report => {
      if (report.value && idIsEmpty(report.value.id)) {
        report.value.id = id;
      }
      return report;
    });
  },

  getMembersDataForId(id, page = 0, limit = 999) {
    checkArguments(this.getMembersDataForId, id);
    const path = urls.membersPath(id, page, limit);

    return this.requestJSON({path});
  },

  getUsagesDataForValueId(id, page = 0, limit = 999) {
    checkArguments(this.getUsagesDataForValueId, id);
    const path = urls.usagesPath(id, page, limit);

    return this.requestJSON({path});
  },

  getUsageDataForId(id) {
    checkArguments(this.getUsageDataForId, id);
    return this.requestJSON({
      path: `/api/editor/usages/${id}`,
    })
    .then(report => {
      if (report.value && idIsEmpty(report.value.id)) {
        report.value.id = id;
      }
      return report;
    });
  },

  getExampleDataForId(id) {
    checkArguments(this.getExampleDataForId, id);
    return this.requestJSON({
      path: `/api/python/curation/${id}`,
    });
  },

  getUserAccountInfo() {
    return this.requestJSON({path: '/api/account/user'});
  },

  getStatus(filename) {
    return filename
      ? this.requestJSON({path: urls.statusPath(filename)})
        .catch((err) => ({status: 'ready'}))
      : Promise.resolve({status: 'ready'});
  },

  getCompletionsAtPosition(filename, source, position, editor) {
    checkArguments(this.getCompletionsAtPosition, filename, source, position, editor);
    if (source.length > MAX_FILE_SIZE) { return Promise.resolve([]); }

    const payload = {
      text: source,
      editor,
      filename,
      cursor_runes: position,
    };

    return this.requestJSON({
      path: '/clientapi/editor/completions',
      method: 'POST',
    }, JSON.stringify(payload))
    .then(data => data.completions || [])
    .catch(err => []);
  },

  getSignaturesAtPosition(filename, source, position, editor) {
    checkArguments(this.getSignaturesAtPosition, filename, source, position, editor);
    if (source.length > MAX_FILE_SIZE) { return Promise.resolve(); }

    const payload = {
      text: source,
      editor,
      filename,
      cursor_runes: position,
    };

    return this.requestJSON({
      path: '/clientapi/editor/signatures',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  getAutocorrectData(filename, source, editorMeta) {
    checkArguments(this.getAutocorrectData, filename, source, editorMeta);

    if (source.length > MAX_FILE_SIZE) { return Promise.resolve(); }

    const payload = {
      metadata: this.getAutocorrectMetadata('autocorrect_request', editorMeta),
      buffer: source,
      filename,
      language: 'python',
    };

    return this.requestJSON({
      path: '/clientapi/editor/autocorrect',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  getAutocorrectModelInfo(version, editorMeta) {
    checkArguments(this.getAutocorrectModelInfo, version, editorMeta);

    const payload = {
      metadata: this.getAutocorrectMetadata('model_info_request', editorMeta),
      language: 'python',
      version,
    };

    return this.requestJSON({
      path: '/api/editor/autocorrect/model-info',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  getAutocorrectMetadata(event, editorMeta) {
    checkArguments(this.getAutocorrectMetadata, event, editorMeta);
    checkArgumentKeys(this.getAutocorrectMetadata, editorMeta, 'editorMeta', 'source', 'plugin_version');
    return merge({
      event,
      os_name: this.getOsName(),
    }, editorMeta);
  },

  getOsName() {
    return {
      darwin: 'macos',
      win32: 'windows',
    }[os.platform()];
  },

  postSaveValidationData(filename, source, editorMeta) {
    checkArguments(this.postSaveValidationData, filename, source, editorMeta);

    if (source.length > MAX_FILE_SIZE) { return Promise.resolve(); }

    const payload = {
      metadata: this.getAutocorrectMetadata('validation_onsave', editorMeta),
      buffer: source,
      filename,
      language: 'python',
    };

    return this.request({
      path: '/clientapi/editor/autocorrect/validation/on-save',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  postAutocorrectFeedbackData(response, feedback, editorMeta) {
    checkArguments(this.postAutocorrectFeedbackData, response, feedback, editorMeta);

    const payload = {
      metadata: this.getAutocorrectMetadata('feedback_diffset', editorMeta),
      response,
      feedback,
    };

    return this.request({
      path: '/clientapi/editor/autocorrect/feedback',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  postAutocorrectHashMismatchData(response, requestStartTime, editorMeta) {
    checkArguments(this.postAutocorrectHashMismatchData, response, requestStartTime, editorMeta);

    const payload = {
      metadata: this.getAutocorrectMetadata('metrics_hash_mismatch', editorMeta),
      response,
      response_time: new Date() - requestStartTime,
    };

    return this.request({
      path: '/clientapi/editor/autocorrect/metrics',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  sendFeatureMetric(name) {
    checkArguments(this.sendFeatureMetric, name);

    return this.request({
      path: '/clientapi/metrics/counters',
      method: 'POST',
    }, JSON.stringify({
      name,
      value: 1,
    }));
  },

  featureRequested(name, editor) {
    checkArguments(this.featureRequested, name, editor);
    this.sendFeatureMetric(`${editor}_${name}_requested`);
  },

  featureFulfilled(name, editor) {
    checkArguments(this.featureFulfilled, name, editor);
    this.sendFeatureMetric(`${editor}_${name}_fulfilled`);
  },

  featureApplied(name, editor, suffix = '') {
    checkArguments(this.featureApplied, name, editor);
    this.sendFeatureMetric(`${editor}_${name}_applied${suffix}`);
  },

  Account: {
    client: KiteConnector.client,

    initClient(hostname, port, base, ssl) {
      this.client.hostname = hostname;
      this.client.port = port;
      this.client.base = base;
      this.client.protocol = ssl ? https : http;
    },

    disposeClient() {},

    toggleRequestDebug() {
      if (this.client instanceof NodeClient) {
        this.client = new BrowserClient(this.client.hostname, this.client.port, this.client.base, this.client.protocol === https);
      } else {
        this.client = new NodeClient(this.client.hostname, this.client.port, this.client.base, this.client.protocol === 'https');
      }
    },

    checkEmail(data) {
      if (!data || !data.email) {
        return Promise.reject(new Error('No email provided'));
      }
      return this.client.request({
        path: '/api/account/check-email',
        method: 'POST',
      }, JSON.stringify(data))
      .then(checkStatusAndInvokeCallback('Unable to check email'));
    },

    createAccount(data, callback) {
      if (!data || !data.email) {
        return Promise.reject(new Error('No email provided'));
      }

      const content = querystring.stringify(data);
      let promise;
      if (data.password) {
        promise = this.client.request({
          path: '/api/account/create',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }, content);
      } else {
        promise = this.client.request({
          path: '/api/account/createPasswordless',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }, content);
      }

      return promise.then(checkStatusAndInvokeCallback('Unable to create an account', callback));
    },

    login(data, callback) {
      if (!data) {
        return Promise.reject(new Error('No login data provided'));
      }
      if (!data.email) {
        return Promise.reject(new Error('No email provided'));
      }
      if (!data.password) {
        return Promise.reject(new Error('No password provided'));
      }
      const content = querystring.stringify(data);
      return this.client.request({
        path: '/api/account/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }, content)
      .then(checkStatusAndInvokeCallback('Unable to login into Kite', callback));
    },

    resetPassword(data, callback) {
      if (!data || !data.email) {
        return Promise.reject(new Error('No email provided'));
      }
      const content = querystring.stringify(data);
      return this.client.request({
        path: '/api/account/reset-password/request',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }, content)
      .then(checkStatusAndInvokeCallback('Unable to reset passwords', callback));
    },
  },
};

const idIsEmpty = (id) =>
  !id || id === '' ||
  (id.indexOf(';') !== -1 && id.split(';')[1] === '');

const delegate = (methods, source, target) => {
  methods.forEach(method => target[method] = (...args) => source[method](...args));
  return target;
};

const checkStatusAndInvokeCallback = (message, callback) => resp => {
  callback && callback(resp);
  return new Promise((resolve, reject) => {
    if (resp.statusCode >= 400) {
      utils.handleResponseData(resp).then(respData => {
        reject(new KiteRequestError(message, {
          responseStatus: resp.statusCode,
          response: resp,
          responseData: respData,
        }));
      }, reject);
    } else {
      resolve(resp);
    }
  });
};

delegate([
  'arch',
  'canInstallKite',
  'canRunKite',
  'canRunKiteEnterprise',
  'checkHealth',
  'downloadKite',
  'downloadKiteRelease',
  'hasBothKiteInstalled',
  'hasManyKiteEnterpriseInstallation',
  'hasManyKiteInstallation',
  'installKite',
  'isAdmin',
  'isKiteEnterpriseInstalled',
  'isKiteEnterpriseRunning',
  'isKiteInstalled',
  'isKiteReachable',
  'isKiteRunning',
  'isKiteSupported',
  'isOSSupported',
  'isOSVersionSupported',
  'isUserAuthenticated',
  'onDidFailRequest',
  'request',
  'runKite',
  'runKiteAndWait',
  'runKiteEnterprise',
  'runKiteEnterpriseAndWait',
  'toggleRequestDebug',
  'waitForKite',
], KiteConnector, KiteAPI);

module.exports = KiteAPI;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("querystring");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const os = __webpack_require__(6);
const EventEmitter = __webpack_require__(14);

const utils = __webpack_require__(15);
const KiteStateError = __webpack_require__(19);
const KiteRequestError = __webpack_require__(17);
const {STATES} = __webpack_require__(20);
const NodeClient = __webpack_require__(21);
const BrowserClient = __webpack_require__(43);

module.exports = {
  STATES,

  adapter: (() => {
    switch (os.platform()) {
      case 'darwin': return __webpack_require__(44);
      case 'win32': return __webpack_require__(45);
      default: return __webpack_require__(46);
    }
  })(),

  emitter: new EventEmitter(),

  client: new NodeClient('localhost', '46624'),

  toggleRequestDebug() {
    if (this.client instanceof NodeClient) {
      this.client = new BrowserClient(this.client.hostname, this.client.port);
    } else {
      this.client = new NodeClient(this.client.hostname, this.client.port);
    }
  },

  onDidFailRequest(listener) {
    this.emitter.on('did-fail-request', listener);
    return {
      dispose: () => {
        this.emitter.removeListener('did-fail-request', listener);
      },
    };
  },

  request(options, data, timeout) {
    return this.client.request(options, data, timeout)
    .catch(() => {
      let promise = Promise.resolve();
      if (utils.shouldAddCatchProcessing(options.path)) {
        promise = promise.then(() => this.isKiteSupported())
              .then(() => this.isKiteInstalled())
              .then(() => this.isKiteRunning());
      }
      return promise.then(() => {
        throw new KiteStateError('Kite could not be reached when attempting a request', {
          state: STATES.UNREACHABLE,
          request: options,
          requestData: data,
        });
      });
    })
    .then(resp => {
      return resp.statusCode >= 400
        ? utils.handleResponseData(resp).then(respData => {
          throw new KiteRequestError('bad_status', {
            responseStatus: resp.statusCode,
            request: options,
            requestData: data,
            response: resp,
            responseData: respData,
          });
        })
        : resp;
    })
    .catch(err => {
      this.emitter.emit('did-fail-request', err);
      throw err;
    });
  },

  checkHealth() {
    const extractErr = ([err]) => {
      throw err;
    };

    return this.isKiteSupported()
    .then(() =>
      utils.anyPromise([this.isKiteInstalled(), this.isKiteEnterpriseInstalled()]).catch(extractErr))
    .then(() =>
      utils.anyPromise([this.isKiteRunning(), this.isKiteEnterpriseRunning()]).catch(extractErr))
    .then(() => this.isKiteReachable())
    .then(() => STATES.READY)
    .catch(err => {
      if (!err.data || err.data.state == null) { throw err; }
      return err.data.state;
    });
  },

  // FIXME: This method is now deprecated, use checkHealth instead.
  handleState() {
    return this.checkHealth();
  },

  isKiteSupported() {
    return this.adapter.isKiteSupported()
      ? Promise.resolve()
      : Promise.reject(new KiteStateError('Kite is currently not support on your platform', {
        state: STATES.UNSUPPORTED,
      }));
  },

  isKiteInstalled() {
    return this.adapter.isKiteInstalled();
  },

  isKiteRunning() {
    return this.adapter.isKiteRunning();
  },

  canInstallKite() {
    return this.isKiteSupported()
    .then(() =>
      utils.reversePromise(this.adapter.isKiteInstalled(),
        new KiteStateError('Kite is already installed', {
          state: STATES.INSTALLED,
        })));
  },

  installKite(options) {
    return this.adapter.installKite(options);
  },

  downloadKiteRelease(options) {
    return this.adapter.downloadKiteRelease(options);
  },

  downloadKite(url, options) {
    return this.adapter.downloadKite(url, options);
  },

  canRunKite() {
    return this.isKiteInstalled()
    .then(() =>
      utils.reversePromise(this.isKiteRunning(),
        new KiteStateError('Kite is already runnning', {
          state: STATES.RUNNING,
        })));
  },

  runKite() {
    return this.adapter.runKite();
  },

  runKiteAndWait(attempts, interval) {
    return this.runKite().then(() => this.waitForKite(attempts, interval));
  },

  isKiteReachable() {
    return this.client.request({
      path: '/clientapi/ping',
      method: 'GET',
    }, null, 200); // in tests, this took no longer than 15ms to respond
  },

  waitForKite(attempts, interval) {
    return utils.retryPromise(() => this.isKiteReachable(), attempts, interval);
  },

  isKiteEnterpriseInstalled() {
    return this.adapter.isKiteEnterpriseInstalled();
  },

  isKiteEnterpriseRunning() {
    return this.adapter.isKiteEnterpriseRunning();
  },

  canRunKiteEnterprise() {
    return this.isKiteEnterpriseInstalled()
    .then(() =>
      utils.reversePromise(this.isKiteEnterpriseRunning(),
        new KiteStateError('Kite Enterprise is already runnning', {
          state: STATES.RUNNING,
        })));
  },

  runKiteEnterprise() {
    return this.adapter.runKiteEnterprise();
  },

  runKiteEnterpriseAndWait(attempts, interval) {
    return this.runKiteEnterprise().then(() => this.waitForKite(attempts, interval));
  },

  hasBothKiteInstalled() {
    return this.adapter.hasBothKiteInstalled();
  },

  hasManyKiteInstallation() {
    return this.adapter.hasManyKiteInstallation();
  },

  hasManyKiteEnterpriseInstallation() {
    return this.adapter.hasManyKiteEnterpriseInstallation();
  },

  isAdmin() {
    return this.adapter.isAdmin();
  },

  arch() {
    return this.adapter.arch();
  },

  isOSSupported() {
    return this.adapter.isOSSupported();
  },

  isOSVersionSupported() {
    return this.adapter.isOSVersionSupported();
  },

  isUserAuthenticated() {
    return this.client.request({
      path: '/clientapi/user',
      method: 'GET',
    })
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          return utils.handleResponseData(resp);
        case 401:
          throw new KiteStateError('Kite is not authenticated', {
            state: STATES.UNLOGGED,
          });
        default:
          return utils.handleResponseData(resp).then(respData => {
            throw new KiteRequestError('Invalid response status when checking Kite authentication', {
              responseStatus: resp.statusCode,
              request: {
                path: '/clientapi/user',
                method: 'GET',
              },
              response: resp,
              responseData: respData,
            });
          });
      }
    });
  },
};


/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const http = __webpack_require__(10);
const https = __webpack_require__(11);
const child_process = __webpack_require__(16);
const KiteRequestError = __webpack_require__(17);
const KiteProcessError = __webpack_require__(18);

function deepMerge(a, b) {
  a = JSON.parse(JSON.stringify(a || {}));
  b = JSON.parse(JSON.stringify(b || {}));
  const c = Object.assign({}, a);

  Object.keys(b).forEach(k => {
    if (c[k] && typeof c[k] == 'object') {
      c[k] = deepMerge(c[k], b[k]);
    } else {
      c[k] = b[k];
    }
  });

  return c;
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.on('response', resp => resolve(resp));
    request.on('error', err => reject(err));
  });
}

function promisifyStream(stream) {
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve());
    stream.on('error', err => reject(err));
  });
}

function request(url) {
  return url.indexOf('https://') === 0
    ? https.request(url)
    : http.request(url);
}

function hasHeader(header, headers) {
  return header in headers ? header : false;
}

function isRedirection(resp) {
  return resp.statusCode >= 300 &&
         resp.statusCode < 400 &&
         hasHeader('location', resp.headers);
}

// Given a request this function will follow the redirection until a
// code different that 303 is returned
function followRedirections(req) {
  return promisifyRequest(req)
  .then(resp => {
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return resp;
    } else if (isRedirection(resp)) {
      const location = resp.headers.location;
      const req = request(location);
      req.end();
      return followRedirections(req);
    } else {
      throw new KiteRequestError('Invalid response status when following redirection', {
        request: req,
        response: resp,
        responseStatus: resp.statusCode,
      });
    }
  });
}

function parseSetCookies(cookies) {
  if (!Array.isArray(cookies) || !cookies.length) {
    return [];
  }
  var parse = (cookie) => {
    var parsed = {
      Path: '',
      Domain: '',
      Expires: new Date('0001-01-01T00:00:00Z'),
      RawExpires: '',
      MaxAge: 0,
      Secure: false,
      HttpOnly: false,
      Raw: '',
      Unparsed: null,
    };
    cookie.split('; ').forEach((raw) => {
      if (raw === 'HttpOnly') {
        parsed.HttpOnly = true;
        return;
      }
      if (raw === 'Secure') {
        parsed.Secure = true;
        return;
      }
      var idx = raw.indexOf('=');
      var key = raw.substring(0, idx);
      var val = raw.substring(idx + 1);
      if (key === 'Expires') {
        val = new Date(val);
      }
      if (key in parsed) {
        parsed[key] = val;
      } else {
        parsed.Name = key;
        parsed.Value = val;
      }
    });
    return parsed;
  };
  return cookies.map(parse);
}

function findCookie(cookies, name) {
  return cookies.filter(c => c.Name === name)[0];
}

function dumpCookies(cookies) {
  return cookies.map((c) => c.Name + '=' + c.Value).join('; ');
}

function handleResponseData(resp, callback) {
  if (callback) {
    let data = '';
    resp.on('data', (chunk) => data += chunk);
    resp.on('end', () => callback(data));
    return null;
  } else {
    return new Promise((resolve, reject) => {
      let data = '';
      resp.on('data', (chunk) => data += chunk);
      resp.on('error', err => reject(err));
      resp.on('end', () => resolve(data));
    });
  }
}

// Returns a new Promise that resolve if the passed-in promise is rejected and
// will be rejected with the provided error if the passed-in promise resolve.
function reversePromise(promise, rejectionMessage, resolutionMessage) {
  return new Promise((resolve, reject) => {
    promise
    .then(() => reject(rejectionMessage))
    .catch(() => resolve(resolutionMessage));
  });
}

// Given a function returning a promise, it returns a new Promise that will be
// resolved if one of the promises returned by the function resolves. If no
// promises have been resolved after the specified amount of attempts the
// returned promise will be rejected
function retryPromise(doAttempt, attempts, interval) {
  return new Promise((resolve, reject) => {
    makeAttempt(0, resolve, reject);
  });

  function makeAttempt(n, resolve, reject) {
    var retryOrReject = (err) => {
      n + 1 >= attempts
        ? reject(err)
        : makeAttempt(n + 1, resolve, reject);
    };
    setTimeout(() =>
      doAttempt().then(resolve, retryOrReject),
      n ? interval : 0);
  }
}

// Spawns a child process and returns a promise that will be resolved if
// the process ends with a code of 0, otherwise the promise will be rejected
// with an error object of the provided rejectionType.
function spawnPromise(cmd, cmdArgs, cmdOptions, rejectionType, rejectionMessage) {
  const args = [cmd];

  if (cmdArgs) {
    if (typeof cmdArgs === 'string') {
      rejectionType = cmdArgs;
      rejectionMessage = cmdOptions;
    } else {
      args.push(cmdArgs);
    }
  }

  if (cmdOptions) {
    if (typeof cmdOptions === 'string') {
      rejectionMessage = rejectionType;
      rejectionType = cmdOptions;
    } else {
      args.push(cmdOptions);
    }
  }

  return new Promise((resolve, reject) => {
    const proc = child_process.spawn(...args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => stdout +=  data);
    proc.stderr.on('data', data => stdout +=  data);

    const error = new Error();

    proc.on('close', code => {
      code
        ? reject(new KiteProcessError(rejectionType,
          {
            message: rejectionMessage,
            stderr,
            stdout,
            callStack: error.stack,
            cmd: `${cmd} ${(typeof cmdOptions != 'string' ? cmdArgs || [] : []).join(' ')}`,
            options: typeof cmdOptions != 'string' ? cmdOptions : undefined,
          }))
        : resolve(stdout);
    });
  });
}

function anyPromise(arrayOfPromises) {
  // For each promise that resolves or rejects,
  // make them all resolve.
  // Record which ones did resolve or reject
  const resolvingPromises = arrayOfPromises.map(promise => {
    return promise
    .then(result => ({resolve: true, result: result}))
    .catch(error => ({resolve: false, result: error}));
  });

  return Promise.all(resolvingPromises).then(results => {
    const resolved = results.reduce((m, r) => {
      if (m) { return m; }
      if (r.resolve) { return r; }
      return null;
    }, null);


    if (resolved) {
      return resolved.result;
    } else {
      throw results.map(r => r.result);
    }
  });
}

// Exec a child process and returns a promise that will be resolved if
// the process ends with success, otherwise the promise will be rejected
// with an error object of the provided rejectionType.
function execPromise(cmd, cmdOptions, rejectionType, rejectionMessage) {
  const args = [cmd];

  if (cmdOptions) {
    if (cmdOptions === 'string') {
      rejectionMessage = rejectionType;
      rejectionType = cmdOptions;
      cmdOptions = {};
    }
  } else {
    cmdOptions = {};
  }

  args.push(cmdOptions);

  const error = new Error();

  return new Promise((resolve, reject) => {
    child_process.exec(...args, (err, stdout, stderr) => {
      if (err) {
        reject(new KiteProcessError(rejectionType,
          {
            message: rejectionMessage,
            stdout,
            stderr,
            callStack: error.stack,
            cmd,
            options: typeof cmdOptions != 'string' ? cmdOptions : undefined,
          }));
      }
      resolve(stdout);
    });
  });
}

// Calls the passed-in function if its actually a function.
function guardCall(fn) { typeof fn === 'function' && fn(); }

// Attempts to parse a json string and returns the fallback if it can't.
function parseJSON(json, fallback) {
  try { return JSON.parse(json) || fallback; } catch (e) { return fallback; }
}

// evaluates whether a particular path should have extra processing
// done on it in the case of a Promise rejection
// NB: this should be taken out with a more robust refactor
function shouldAddCatchProcessing(path) {
  return !path.startsWith('/clientapi/editor');
}

module.exports = {
  anyPromise,
  deepMerge,
  dumpCookies,
  execPromise,
  findCookie,
  followRedirections,
  guardCall,
  handleResponseData,
  parseJSON,
  parseSetCookies,
  promisifyRequest,
  promisifyStream,
  retryPromise,
  reversePromise,
  shouldAddCatchProcessing,
  spawnPromise,
};


/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class KiteRequestError extends Error {
  get type() { return 'bad_status'; }

  constructor(message, data) {
    super(message);
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class KiteProcessError extends Error {
  constructor(type, data) {
    super(type);
    this.data = data;
    this.message = `${type}: ${data.message}\ncmd: ${data.cmd}\nstdout: ${data.stdout}\nstderr: ${data.stderr}`;
    Error.captureStackTrace(this, this.constructor);
  }
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class KiteStateError extends Error {
  get type() { return 'bad_state'; }

  constructor(message, data) {
    super(message);
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  STATES: {
    UNSUPPORTED: 0,
    UNINSTALLED: 1,
    NOT_RUNNING: 2,
    UNREACHABLE: 3,
    UNLOGGED: 4,
    READY: 4,

    // legacy states, prefer the ones above for health checks
    INSTALLED: 2,
    RUNNING: 3,
    REACHABLE: 4,
    AUTHENTICATED: 4,
  },

  LEVELS: {
    SILLY: 0,
    VERBOSE: 1,
    DEBUG: 2,
    INFO: 3,
    WARNING: 4,
    ERROR: 5,
  },
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const http = __webpack_require__(10);
const https = __webpack_require__(11);
const FormData = __webpack_require__(22);

const utils = __webpack_require__(15);

module.exports = class NodeClient {
  constructor(hostname, port, base = '', ssl = false) {
    this.hostname = hostname;
    this.port = port;
    this.base = base;
    this.protocol = ssl ? https : http;
    this.cookies = {};
  }

  request(opts, data, timeout) {
    return new Promise((resolve, reject) => {
      let form;

      opts.hostname = this.hostname;
      if (this.port > 0) { opts.port = this.port; }
      opts.path = this.base + opts.path;
      opts.headers = opts.headers || {};
      this.writeCookies(opts.headers);

      if (opts.headers['Content-Type'] === 'multipart/form-data' ||
          opts.headers['content-type'] === 'multipart/form-data') {
        delete opts.headers['Content-Type'];
        delete opts.headers['content-type'];

        form = new FormData();
        for (const key in data) {
          form.append(key, data[key]);
        }

        const headers = form.getHeaders();
        for (const key in headers) {
          opts.headers[key] = headers[key];
        }
      }

      const req = this.protocol.request(opts, resp => {
        this.readCookies(resp);
        resolve(resp);
      });
      req.on('error', err => reject(err));
      if (timeout != null) {
        req.setTimeout(timeout, () => reject(new Error('timeout')));
      }
      if (form) {
        form.pipe(req);
      } else {
        if (data) { req.write(data); }
        req.end();
      }
    });
  }

  readCookies(resp) {
    utils.parseSetCookies(resp.headers['set-cookie']).forEach(c => {
      this.cookies[c.Name] = c;
    });
  }

  writeCookies(hdrs) {
    const cookies = [];
    for (var k in this.cookies) {
      cookies.push(this.cookies[k]);
    }
    if (cookies.length) {
      hdrs.Cookies = utils.dumpCookies(cookies);
    }
  }
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var CombinedStream = __webpack_require__(23);
var util = __webpack_require__(24);
var path = __webpack_require__(27);
var http = __webpack_require__(10);
var https = __webpack_require__(11);
var parseUrl = __webpack_require__(4).parse;
var fs = __webpack_require__(28);
var mime = __webpack_require__(29);
var asynckit = __webpack_require__(32);
var populate = __webpack_require__(42);

// Public API
module.exports = FormData;

// make it a Stream
util.inherits(FormData, CombinedStream);

/**
 * Create readable "multipart/form-data" streams.
 * Can be used to submit forms
 * and file uploads to other web applications.
 *
 * @constructor
 * @param {Object} options - Properties to be added/overriden for FormData and CombinedStream
 */
function FormData(options) {
  if (!(this instanceof FormData)) {
    return new FormData();
  }

  this._overheadLength = 0;
  this._valueLength = 0;
  this._valuesToMeasure = [];

  CombinedStream.call(this);

  options = options || {};
  for (var option in options) {
    this[option] = options[option];
  }
}

FormData.LINE_BREAK = '\r\n';
FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

FormData.prototype.append = function(field, value, options) {

  options = options || {};

  // allow filename as single option
  if (typeof options == 'string') {
    options = {filename: options};
  }

  var append = CombinedStream.prototype.append.bind(this);

  // all that streamy business can't handle numbers
  if (typeof value == 'number') {
    value = '' + value;
  }

  // https://github.com/felixge/node-form-data/issues/38
  if (util.isArray(value)) {
    // Please convert your array into string
    // the way web server expects it
    this._error(new Error('Arrays are not supported.'));
    return;
  }

  var header = this._multiPartHeader(field, value, options);
  var footer = this._multiPartFooter();

  append(header);
  append(value);
  append(footer);

  // pass along options.knownLength
  this._trackLength(header, value, options);
};

FormData.prototype._trackLength = function(header, value, options) {
  var valueLength = 0;

  // used w/ getLengthSync(), when length is known.
  // e.g. for streaming directly from a remote server,
  // w/ a known file a size, and not wanting to wait for
  // incoming file to finish to get its size.
  if (options.knownLength != null) {
    valueLength += +options.knownLength;
  } else if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === 'string') {
    valueLength = Buffer.byteLength(value);
  }

  this._valueLength += valueLength;

  // @check why add CRLF? does this account for custom/multiple CRLFs?
  this._overheadLength +=
    Buffer.byteLength(header) +
    FormData.LINE_BREAK.length;

  // empty or either doesn't have path or not an http response
  if (!value || ( !value.path && !(value.readable && value.hasOwnProperty('httpVersion')) )) {
    return;
  }

  // no need to bother with the length
  if (!options.knownLength) {
    this._valuesToMeasure.push(value);
  }
};

FormData.prototype._lengthRetriever = function(value, callback) {

  if (value.hasOwnProperty('fd')) {

    // take read range into a account
    // `end` = Infinity –> read file till the end
    //
    // TODO: Looks like there is bug in Node fs.createReadStream
    // it doesn't respect `end` options without `start` options
    // Fix it when node fixes it.
    // https://github.com/joyent/node/issues/7819
    if (value.end != undefined && value.end != Infinity && value.start != undefined) {

      // when end specified
      // no need to calculate range
      // inclusive, starts with 0
      callback(null, value.end + 1 - (value.start ? value.start : 0));

    // not that fast snoopy
    } else {
      // still need to fetch file size from fs
      fs.stat(value.path, function(err, stat) {

        var fileSize;

        if (err) {
          callback(err);
          return;
        }

        // update final size based on the range options
        fileSize = stat.size - (value.start ? value.start : 0);
        callback(null, fileSize);
      });
    }

  // or http response
  } else if (value.hasOwnProperty('httpVersion')) {
    callback(null, +value.headers['content-length']);

  // or request stream http://github.com/mikeal/request
  } else if (value.hasOwnProperty('httpModule')) {
    // wait till response come back
    value.on('response', function(response) {
      value.pause();
      callback(null, +response.headers['content-length']);
    });
    value.resume();

  // something else
  } else {
    callback('Unknown stream');
  }
};

FormData.prototype._multiPartHeader = function(field, value, options) {
  // custom header specified (as string)?
  // it becomes responsible for boundary
  // (e.g. to handle extra CRLFs on .NET servers)
  if (typeof options.header == 'string') {
    return options.header;
  }

  var contentDisposition = this._getContentDisposition(value, options);
  var contentType = this._getContentType(value, options);

  var contents = '';
  var headers  = {
    // add custom disposition as third element or keep it two elements if not
    'Content-Disposition': ['form-data', 'name="' + field + '"'].concat(contentDisposition || []),
    // if no content type. allow it to be empty array
    'Content-Type': [].concat(contentType || [])
  };

  // allow custom headers.
  if (typeof options.header == 'object') {
    populate(headers, options.header);
  }

  var header;
  for (var prop in headers) {
    if (!headers.hasOwnProperty(prop)) continue;
    header = headers[prop];

    // skip nullish headers.
    if (header == null) {
      continue;
    }

    // convert all headers to arrays.
    if (!Array.isArray(header)) {
      header = [header];
    }

    // add non-empty headers.
    if (header.length) {
      contents += prop + ': ' + header.join('; ') + FormData.LINE_BREAK;
    }
  }

  return '--' + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
};

FormData.prototype._getContentDisposition = function(value, options) {

  var filename
    , contentDisposition
    ;

  if (typeof options.filepath === 'string') {
    // custom filepath for relative paths
    filename = path.normalize(options.filepath).replace(/\\/g, '/');
  } else if (options.filename || value.name || value.path) {
    // custom filename take precedence
    // formidable and the browser add a name property
    // fs- and request- streams have path property
    filename = path.basename(options.filename || value.name || value.path);
  } else if (value.readable && value.hasOwnProperty('httpVersion')) {
    // or try http response
    filename = path.basename(value.client._httpMessage.path);
  }

  if (filename) {
    contentDisposition = 'filename="' + filename + '"';
  }

  return contentDisposition;
};

FormData.prototype._getContentType = function(value, options) {

  // use custom content-type above all
  var contentType = options.contentType;

  // or try `name` from formidable, browser
  if (!contentType && value.name) {
    contentType = mime.lookup(value.name);
  }

  // or try `path` from fs-, request- streams
  if (!contentType && value.path) {
    contentType = mime.lookup(value.path);
  }

  // or if it's http-reponse
  if (!contentType && value.readable && value.hasOwnProperty('httpVersion')) {
    contentType = value.headers['content-type'];
  }

  // or guess it from the filepath or filename
  if (!contentType && (options.filepath || options.filename)) {
    contentType = mime.lookup(options.filepath || options.filename);
  }

  // fallback to the default content type if `value` is not simple value
  if (!contentType && typeof value == 'object') {
    contentType = FormData.DEFAULT_CONTENT_TYPE;
  }

  return contentType;
};

FormData.prototype._multiPartFooter = function() {
  return function(next) {
    var footer = FormData.LINE_BREAK;

    var lastPart = (this._streams.length === 0);
    if (lastPart) {
      footer += this._lastBoundary();
    }

    next(footer);
  }.bind(this);
};

FormData.prototype._lastBoundary = function() {
  return '--' + this.getBoundary() + '--' + FormData.LINE_BREAK;
};

FormData.prototype.getHeaders = function(userHeaders) {
  var header;
  var formHeaders = {
    'content-type': 'multipart/form-data; boundary=' + this.getBoundary()
  };

  for (header in userHeaders) {
    if (userHeaders.hasOwnProperty(header)) {
      formHeaders[header.toLowerCase()] = userHeaders[header];
    }
  }

  return formHeaders;
};

FormData.prototype.getBoundary = function() {
  if (!this._boundary) {
    this._generateBoundary();
  }

  return this._boundary;
};

FormData.prototype._generateBoundary = function() {
  // This generates a 50 character boundary similar to those used by Firefox.
  // They are optimized for boyer-moore parsing.
  var boundary = '--------------------------';
  for (var i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16);
  }

  this._boundary = boundary;
};

// Note: getLengthSync DOESN'T calculate streams length
// As workaround one can calculate file size manually
// and add it as knownLength option
FormData.prototype.getLengthSync = function() {
  var knownLength = this._overheadLength + this._valueLength;

  // Don't get confused, there are 3 "internal" streams for each keyval pair
  // so it basically checks if there is any value added to the form
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }

  // https://github.com/form-data/form-data/issues/40
  if (!this.hasKnownLength()) {
    // Some async length retrievers are present
    // therefore synchronous length calculation is false.
    // Please use getLength(callback) to get proper length
    this._error(new Error('Cannot calculate proper length in synchronous way.'));
  }

  return knownLength;
};

// Public API to check if length of added values is known
// https://github.com/form-data/form-data/issues/196
// https://github.com/form-data/form-data/issues/262
FormData.prototype.hasKnownLength = function() {
  var hasKnownLength = true;

  if (this._valuesToMeasure.length) {
    hasKnownLength = false;
  }

  return hasKnownLength;
};

FormData.prototype.getLength = function(cb) {
  var knownLength = this._overheadLength + this._valueLength;

  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }

  if (!this._valuesToMeasure.length) {
    process.nextTick(cb.bind(this, null, knownLength));
    return;
  }

  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
    if (err) {
      cb(err);
      return;
    }

    values.forEach(function(length) {
      knownLength += length;
    });

    cb(null, knownLength);
  });
};

FormData.prototype.submit = function(params, cb) {
  var request
    , options
    , defaults = {method: 'post'}
    ;

  // parse provided url if it's string
  // or treat it as options object
  if (typeof params == 'string') {

    params = parseUrl(params);
    options = populate({
      port: params.port,
      path: params.pathname,
      host: params.hostname,
      protocol: params.protocol
    }, defaults);

  // use custom params
  } else {

    options = populate(params, defaults);
    // if no port provided use default one
    if (!options.port) {
      options.port = options.protocol == 'https:' ? 443 : 80;
    }
  }

  // put that good code in getHeaders to some use
  options.headers = this.getHeaders(params.headers);

  // https if specified, fallback to http in any other case
  if (options.protocol == 'https:') {
    request = https.request(options);
  } else {
    request = http.request(options);
  }

  // get content length and fire away
  this.getLength(function(err, length) {
    if (err) {
      this._error(err);
      return;
    }

    // add content length
    request.setHeader('Content-Length', length);

    this.pipe(request);
    if (cb) {
      request.on('error', cb);
      request.on('response', cb.bind(this, null));
    }
  }.bind(this));

  return request;
};

FormData.prototype._error = function(err) {
  if (!this.error) {
    this.error = err;
    this.pause();
    this.emit('error', err);
  }
};

FormData.prototype.toString = function () {
  return '[object FormData]';
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var util = __webpack_require__(24);
var Stream = __webpack_require__(25).Stream;
var DelayedStream = __webpack_require__(26);

module.exports = CombinedStream;
function CombinedStream() {
  this.writable = false;
  this.readable = true;
  this.dataSize = 0;
  this.maxDataSize = 2 * 1024 * 1024;
  this.pauseStreams = true;

  this._released = false;
  this._streams = [];
  this._currentStream = null;
  this._insideLoop = false;
  this._pendingNext = false;
}
util.inherits(CombinedStream, Stream);

CombinedStream.create = function(options) {
  var combinedStream = new this();

  options = options || {};
  for (var option in options) {
    combinedStream[option] = options[option];
  }

  return combinedStream;
};

CombinedStream.isStreamLike = function(stream) {
  return (typeof stream !== 'function')
    && (typeof stream !== 'string')
    && (typeof stream !== 'boolean')
    && (typeof stream !== 'number')
    && (!Buffer.isBuffer(stream));
};

CombinedStream.prototype.append = function(stream) {
  var isStreamLike = CombinedStream.isStreamLike(stream);

  if (isStreamLike) {
    if (!(stream instanceof DelayedStream)) {
      var newStream = DelayedStream.create(stream, {
        maxDataSize: Infinity,
        pauseStream: this.pauseStreams,
      });
      stream.on('data', this._checkDataSize.bind(this));
      stream = newStream;
    }

    this._handleErrors(stream);

    if (this.pauseStreams) {
      stream.pause();
    }
  }

  this._streams.push(stream);
  return this;
};

CombinedStream.prototype.pipe = function(dest, options) {
  Stream.prototype.pipe.call(this, dest, options);
  this.resume();
  return dest;
};

CombinedStream.prototype._getNext = function() {
  this._currentStream = null;

  if (this._insideLoop) {
    this._pendingNext = true;
    return; // defer call
  }

  this._insideLoop = true;
  try {
    do {
      this._pendingNext = false;
      this._realGetNext();
    } while (this._pendingNext);
  } finally {
    this._insideLoop = false;
  }
};

CombinedStream.prototype._realGetNext = function() {
  var stream = this._streams.shift();


  if (typeof stream == 'undefined') {
    this.end();
    return;
  }

  if (typeof stream !== 'function') {
    this._pipeNext(stream);
    return;
  }

  var getStream = stream;
  getStream(function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      stream.on('data', this._checkDataSize.bind(this));
      this._handleErrors(stream);
    }

    this._pipeNext(stream);
  }.bind(this));
};

CombinedStream.prototype._pipeNext = function(stream) {
  this._currentStream = stream;

  var isStreamLike = CombinedStream.isStreamLike(stream);
  if (isStreamLike) {
    stream.on('end', this._getNext.bind(this));
    stream.pipe(this, {end: false});
    return;
  }

  var value = stream;
  this.write(value);
  this._getNext();
};

CombinedStream.prototype._handleErrors = function(stream) {
  var self = this;
  stream.on('error', function(err) {
    self._emitError(err);
  });
};

CombinedStream.prototype.write = function(data) {
  this.emit('data', data);
};

CombinedStream.prototype.pause = function() {
  if (!this.pauseStreams) {
    return;
  }

  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.pause) == 'function') this._currentStream.pause();
  this.emit('pause');
};

CombinedStream.prototype.resume = function() {
  if (!this._released) {
    this._released = true;
    this.writable = true;
    this._getNext();
  }

  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.resume) == 'function') this._currentStream.resume();
  this.emit('resume');
};

CombinedStream.prototype.end = function() {
  this._reset();
  this.emit('end');
};

CombinedStream.prototype.destroy = function() {
  this._reset();
  this.emit('close');
};

CombinedStream.prototype._reset = function() {
  this.writable = false;
  this._streams = [];
  this._currentStream = null;
};

CombinedStream.prototype._checkDataSize = function() {
  this._updateDataSize();
  if (this.dataSize <= this.maxDataSize) {
    return;
  }

  var message =
    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
  this._emitError(new Error(message));
};

CombinedStream.prototype._updateDataSize = function() {
  this.dataSize = 0;

  var self = this;
  this._streams.forEach(function(stream) {
    if (!stream.dataSize) {
      return;
    }

    self.dataSize += stream.dataSize;
  });

  if (this._currentStream && this._currentStream.dataSize) {
    this.dataSize += this._currentStream.dataSize;
  }
};

CombinedStream.prototype._emitError = function(err) {
  this._reset();
  this.emit('error', err);
};


/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var Stream = __webpack_require__(25).Stream;
var util = __webpack_require__(24);

module.exports = DelayedStream;
function DelayedStream() {
  this.source = null;
  this.dataSize = 0;
  this.maxDataSize = 1024 * 1024;
  this.pauseStream = true;

  this._maxDataSizeExceeded = false;
  this._released = false;
  this._bufferedEvents = [];
}
util.inherits(DelayedStream, Stream);

DelayedStream.create = function(source, options) {
  var delayedStream = new this();

  options = options || {};
  for (var option in options) {
    delayedStream[option] = options[option];
  }

  delayedStream.source = source;

  var realEmit = source.emit;
  source.emit = function() {
    delayedStream._handleEmit(arguments);
    return realEmit.apply(source, arguments);
  };

  source.on('error', function() {});
  if (delayedStream.pauseStream) {
    source.pause();
  }

  return delayedStream;
};

Object.defineProperty(DelayedStream.prototype, 'readable', {
  configurable: true,
  enumerable: true,
  get: function() {
    return this.source.readable;
  }
});

DelayedStream.prototype.setEncoding = function() {
  return this.source.setEncoding.apply(this.source, arguments);
};

DelayedStream.prototype.resume = function() {
  if (!this._released) {
    this.release();
  }

  this.source.resume();
};

DelayedStream.prototype.pause = function() {
  this.source.pause();
};

DelayedStream.prototype.release = function() {
  this._released = true;

  this._bufferedEvents.forEach(function(args) {
    this.emit.apply(this, args);
  }.bind(this));
  this._bufferedEvents = [];
};

DelayedStream.prototype.pipe = function() {
  var r = Stream.prototype.pipe.apply(this, arguments);
  this.resume();
  return r;
};

DelayedStream.prototype._handleEmit = function(args) {
  if (this._released) {
    this.emit.apply(this, args);
    return;
  }

  if (args[0] === 'data') {
    this.dataSize += args[1].length;
    this._checkIfMaxDataSizeExceeded();
  }

  this._bufferedEvents.push(args);
};

DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
  if (this._maxDataSizeExceeded) {
    return;
  }

  if (this.dataSize <= this.maxDataSize) {
    return;
  }

  this._maxDataSizeExceeded = true;
  var message =
    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.'
  this.emit('error', new Error(message));
};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 * @private
 */

var db = __webpack_require__(30)
var extname = __webpack_require__(27).extname

/**
 * Module variables.
 * @private
 */

var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/
var TEXT_TYPE_REGEXP = /^text\//i

/**
 * Module exports.
 * @public
 */

exports.charset = charset
exports.charsets = { lookup: charset }
exports.contentType = contentType
exports.extension = extension
exports.extensions = Object.create(null)
exports.lookup = lookup
exports.types = Object.create(null)

// Populate the extensions/types maps
populateMaps(exports.extensions, exports.types)

/**
 * Get the default charset for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function charset (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type)
  var mime = match && db[match[1].toLowerCase()]

  if (mime && mime.charset) {
    return mime.charset
  }

  // default text/* to utf-8
  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
    return 'UTF-8'
  }

  return false
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} str
 * @return {boolean|string}
 */

function contentType (str) {
  // TODO: should this even be in this module?
  if (!str || typeof str !== 'string') {
    return false
  }

  var mime = str.indexOf('/') === -1
    ? exports.lookup(str)
    : str

  if (!mime) {
    return false
  }

  // TODO: use content-type or other module
  if (mime.indexOf('charset') === -1) {
    var charset = exports.charset(mime)
    if (charset) mime += '; charset=' + charset.toLowerCase()
  }

  return mime
}

/**
 * Get the default extension for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function extension (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type)

  // get extensions
  var exts = match && exports.extensions[match[1].toLowerCase()]

  if (!exts || !exts.length) {
    return false
  }

  return exts[0]
}

/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */

function lookup (path) {
  if (!path || typeof path !== 'string') {
    return false
  }

  // get the extension ("ext" or ".ext" or full path)
  var extension = extname('x.' + path)
    .toLowerCase()
    .substr(1)

  if (!extension) {
    return false
  }

  return exports.types[extension] || false
}

/**
 * Populate the extensions and types maps.
 * @private
 */

function populateMaps (extensions, types) {
  // source preference (least -> most)
  var preference = ['nginx', 'apache', undefined, 'iana']

  Object.keys(db).forEach(function forEachMimeType (type) {
    var mime = db[type]
    var exts = mime.extensions

    if (!exts || !exts.length) {
      return
    }

    // mime -> extensions
    extensions[type] = exts

    // extension -> mime
    for (var i = 0; i < exts.length; i++) {
      var extension = exts[i]

      if (types[extension]) {
        var from = preference.indexOf(db[types[extension]].source)
        var to = preference.indexOf(mime.source)

        if (types[extension] !== 'application/octet-stream' &&
          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
          // skip the remapping
          continue
        }
      }

      // set the extension -> mime
      types[extension] = type
    }
  })
}


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(tracker) {
  var prev = null;
  return {
    trackUncaught: () => {
      if (prev === null) {
        prev = window.onerror;
        window.onerror = (msg, url, line, col, err) => {
          tracker.trackEvent('uncaught error', {
            uncaughtError: { msg, url, line, col },
          });
        };
      }
    },
    ignoreUncaught: () => {
      if (prev !== null) {
        window.onerror = prev;
        prev = null;
      }
    },
  };
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {LEVELS} = __webpack_require__(20);
const NullReporter = __webpack_require__(58);
const ConsoleReporter = __webpack_require__(59);

module.exports =  {
  LEVELS,
  LEVEL: LEVELS.INFO,

  output: typeof console != 'undefined' ? ConsoleReporter : NullReporter,

  silly(...msgs) { this.log(LEVELS.SILLY, ...msgs); },
  verbose(...msgs) { this.log(LEVELS.VERBOSE, ...msgs); },
  debug(...msgs) { this.log(LEVELS.DEBUG, ...msgs); },
  info(...msgs) { this.log(LEVELS.INFO, ...msgs); },
  warn(...msgs) { this.log(LEVELS.WARNING, ...msgs); },
  error(...msgs) { this.log(LEVELS.ERROR, ...msgs); },
  log(level, ...msgs) {
    if (level >= this.LEVEL && !this.SILENT) {
      this.output.log(level, ...msgs);
    }
  },
  logRequest() {},
  logResponse() {},
};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  log() {},
};


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {LEVELS} = __webpack_require__(20);

module.exports = {
  TRACE_ALL: false,
  METHODS: {
    [LEVELS.SILLY]: 'debug' in console ? 'debug' : 'log',
    [LEVELS.VERBOSE]: 'debug' in console ? 'debug' : 'log',
    [LEVELS.DEBUG]: 'log',
    [LEVELS.INFO]: 'info' in console ? 'info' : 'log',
    [LEVELS.WARNING]: 'warn' in console ? 'warn' : 'error',
    [LEVELS.ERROR]: 'error',
  },

  log(level, ...msgs) {
    console[this.METHODS[level]](...msgs);
  },
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var os = __webpack_require__(6);
const crypto = __webpack_require__(61);
const mixpanel = __webpack_require__(62);

const localconfig = __webpack_require__(64);
const kitePkg = __webpack_require__(65);
const Logger = __webpack_require__(57);

const MIXPANEL_TOKEN = 'fb6b9b336122a8b29c60f4c28dab6d03';

const OS_VERSION = os.type() + ' ' + os.release();

const client = mixpanel.init(MIXPANEL_TOKEN, {
  protocol: 'https',
});

const EDITOR_UUID = typeof localStorage !== 'undefined'
  ? localStorage.getItem('metrics.userId')
  : undefined;

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

// Send an event to mixpanel
function track(eventName, properties) {
  if (!module.exports.enabled) { return; }

  var eventData = {
    distinct_id: distinctID(),
    editor_uuid: EDITOR_UUID,
    kite_installer_version: kitePkg.version,
    os_name: os.type(),
    os_release: os.release(),
  };

  if (typeof atom !== 'undefined') {
    eventData.editor = 'atom';
    eventData.editor_version = atom.getVersion();
  }

  for (var key in properties || {}) {
    eventData[key] = properties[key];
  }
  Logger.debug(`track: ${ eventName }`, eventData);
  client.track(eventName, eventData);
}

var Tracker = {
  source: null,
  props: null,
  trackEvent: function(eventName, extras) {
    extras = extras || {};
    extras.source = this.source;
    for (var key in this.props) {
      extras[key] = this.props[key];
    }
    track(eventName, extras);
  },
};

module.exports = {
  enabled: true,
  distinctID,
  track,
  Tracker,
};


/***/ }),
/* 61 */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

/*
    Heavily inspired by the original js library copyright Mixpanel, Inc.
    (http://mixpanel.com/)

    Copyright (c) 2012 Carl Sverre

    Released under the MIT license.
*/

var http        = __webpack_require__(10),
    https       = __webpack_require__(11),
    querystring = __webpack_require__(12),
    Buffer      = __webpack_require__(63).Buffer,
    util        = __webpack_require__(24);

var REQUEST_LIBS = {
    http: http,
    https: https
};

var create_client = function(token, config) {
    var metrics = {};

    if(!token) {
        throw new Error("The Mixpanel Client needs a Mixpanel token: `init(token)`");
    }

    // Default config
    metrics.config = {
        test: false,
        debug: false,
        verbose: false,
        host: 'api.mixpanel.com',
        protocol: 'http'
    };

    metrics.token = token;

    /**
        send_request(data)
        ---
        this function sends an async GET request to mixpanel

        data:object                     the data to send in the request
        callback:function(err:Error)    callback is called when the request is
                                        finished or an error occurs
    */
    metrics.send_request = function(endpoint, data, callback) {
        callback = callback || function() {};
        var event_data = new Buffer(JSON.stringify(data));
        var request_data = {
            'data': event_data.toString('base64'),
            'ip': 0,
            'verbose': metrics.config.verbose ? 1 : 0
        };

        var request_lib = REQUEST_LIBS[metrics.config.protocol];
        if (!request_lib) {
            throw new Error(
                "Mixpanel Initialization Error: Unsupported protocol " + metrics.config.protocol + ". " +
                "Supported protocols are: " + Object.keys(REQUEST_LIBS)
            );
        }

        if (endpoint === '/import') {
            var key = metrics.config.key;
            if (!key) {
                throw new Error("The Mixpanel Client needs a Mixpanel api key when importing old events: `init(token, { key: ... })`");
            }
            request_data.api_key = key;
        }

        var request_options = {
            host: metrics.config.host,
            port: metrics.config.port,
            headers: {}
        };

        if (metrics.config.test) { request_data.test = 1; }

        var query = querystring.stringify(request_data);

        request_options.path = [endpoint,"?",query].join("");

        request_lib.get(request_options, function(res) {
            var data = "";
            res.on('data', function(chunk) {
               data += chunk;
            });

            res.on('end', function() {
                var e;
                if (metrics.config.verbose) {
                    try {
                        var result = JSON.parse(data);
                        if(result.status != 1) {
                            e = new Error("Mixpanel Server Error: " + result.error);
                        }
                    }
                    catch(ex) {
                        e = new Error("Could not parse response from Mixpanel");
                    }
                }
                else {
                    e = (data !== '1') ? new Error("Mixpanel Server Error: " + data) : undefined;
                }

                callback(e);
            });
        }).on('error', function(e) {
            if (metrics.config.debug) {
                console.log("Got Error: " + e.message);
            }
            callback(e);
        });
    };

    /**
        track(event, properties, callback)
        ---
        this function sends an event to mixpanel.

        event:string                    the event name
        properties:object               additional event properties to send
        callback:function(err:Error)    callback is called when the request is
                                        finished or an error occurs
    */
    metrics.track = function(event, properties, callback) {
        if (typeof(properties) === 'function' || !properties) {
            callback = properties;
            properties = {};
        }

        // if properties.time exists, use import endpoint
        var endpoint = (typeof(properties.time) === 'number') ? '/import' : '/track';

        properties.token = metrics.token;
        properties.mp_lib = "node";

        var data = {
            'event' : event,
            'properties' : properties
        };

        if (metrics.config.debug) {
            console.log("Sending the following event to Mixpanel:");
            console.log(data);
        }

        metrics.send_request(endpoint, data, callback);
    };

    var parse_time = function(time) {
        if (time === void 0) {
            throw new Error("Import methods require you to specify the time of the event");
        } else if (Object.prototype.toString.call(time) === '[object Date]') {
            time = Math.floor(time.getTime() / 1000);
        }
        return time;
    };

    /**
        import(event, properties, callback)
        ---
        This function sends an event to mixpanel using the import
        endpoint.  The time argument should be either a Date or Number,
        and should signify the time the event occurred.

        It is highly recommended that you specify the distinct_id
        property for each event you import, otherwise the events will be
        tied to the IP address of the sending machine.

        For more information look at:
        https://mixpanel.com/docs/api-documentation/importing-events-older-than-31-days

        event:string                    the event name
        time:date|number                the time of the event
        properties:object               additional event properties to send
        callback:function(err:Error)    callback is called when the request is
                                        finished or an error occurs
    */
    metrics.import = function(event, time, properties, callback) {
        if (typeof(properties) === 'function' || !properties) {
            callback = properties;
            properties = {};
        }

        properties.time = parse_time(time);

        metrics.track(event, properties, callback);
    };

    /**
        import_batch(event_list, options, callback)
        ---
        This function sends a list of events to mixpanel using the import
        endpoint. The format of the event array should be:

        [
            {
                "event": "event name",
                "properties": {
                    "time": new Date(), // Number or Date; required for each event
                    "key": "val",
                    ...
                }
            },
            {
                "event": "event name",
                "properties": {
                    "time": new Date()  // Number or Date; required for each event
                }
            },
            ...
        ]

        See import() for further information about the import endpoint.

        Options:
            max_batch_size: the maximum number of events to be transmitted over
                            the network simultaneously. useful for capping bandwidth
                            usage.

        N.B.: the Mixpanel API only accepts 50 events per request, so regardless
        of max_batch_size, larger lists of events will be chunked further into
        groups of 50.

        event_list:array                    list of event names and properties
        options:object                      optional batch configuration
        callback:function(error_list:array) callback is called when the request is
                                            finished or an error occurs
    */
    metrics.import_batch = function(event_list, options, callback) {
        var batch_size = 50, // default: Mixpanel API permits 50 events per request
            total_events = event_list.length,
            max_simultaneous_events = total_events,
            completed_events = 0,
            event_group_idx = 0,
            request_errors = [];

        if (typeof(options) === 'function' || !options) {
            callback = options;
            options = {};
        }
        if (options.max_batch_size) {
            max_simultaneous_events = options.max_batch_size;
            if (options.max_batch_size < batch_size) {
                batch_size = options.max_batch_size;
            }
        }

        var send_next_batch = function() {
            var properties,
                event_batch = [];

            // prepare batch with required props
            for (var ei = event_group_idx; ei < total_events && ei < event_group_idx + batch_size; ei++) {
                properties = event_list[ei].properties;
                properties.time = parse_time(properties.time);
                if (!properties.token) {
                    properties.token = metrics.token;
                }
                event_batch.push(event_list[ei]);
            }

            if (event_batch.length > 0) {
                metrics.send_request('/import', event_batch, function(e) {
                    completed_events += event_batch.length;
                    if (e) {
                        request_errors.push(e);
                    }
                    if (completed_events < total_events) {
                        send_next_batch();
                    } else if (callback) {
                        callback(request_errors);
                    }
                });
                event_group_idx += batch_size;
            }
        };

        if (metrics.config.debug) {
            console.log(
                "Sending " + event_list.length + " events to Mixpanel in " +
                Math.ceil(total_events / batch_size) + " requests"
            );
        }

        for (var i = 0; i < max_simultaneous_events; i += batch_size) {
            send_next_batch();
        }
    };

    /**
        alias(distinct_id, alias)
        ---
        This function creates an alias for distinct_id

        For more information look at:
        https://mixpanel.com/docs/integration-libraries/using-mixpanel-alias

        distinct_id:string              the current identifier
        alias:string                    the future alias
    */
    metrics.alias = function(distinct_id, alias, callback) {
        var properties = {
            distinct_id: distinct_id,
            alias: alias
        };

        metrics.track('$create_alias', properties, callback);
    };

    metrics.people = {
        /** people.set_once(distinct_id, prop, to, modifiers, callback)
            ---
            The same as people.set but in the words of mixpanel:
            mixpanel.people.set_once

            " This method allows you to set a user attribute, only if
             it is not currently set. It can be called multiple times
             safely, so is perfect for storing things like the first date
             you saw a user, or the referrer that brought them to your
             website for the first time. "

        */
        set_once: function(distinct_id, prop, to, modifiers, callback) {
            var $set = {};

            if (typeof(prop) === 'object') {
                if (typeof(to) === 'object') {
                    callback = modifiers;
                    modifiers = to;
                } else {
                    callback = to;
                }
                $set = prop;
            } else {
                $set[prop] = to;
                if (typeof(modifiers) === 'function' || !modifiers) {
                    callback = modifiers;
                }
            }

            modifiers = modifiers || {};
            modifiers.set_once = true;

            this._set(distinct_id, $set, callback, modifiers);
        },

        /**
            people.set(distinct_id, prop, to, modifiers, callback)
            ---
            set properties on an user record in engage

            usage:

                mixpanel.people.set('bob', 'gender', 'm');

                mixpanel.people.set('joe', {
                    'company': 'acme',
                    'plan': 'premium'
                });
        */
        set: function(distinct_id, prop, to, modifiers, callback) {
            var $set = {};

            if (typeof(prop) === 'object') {
                if (typeof(to) === 'object') {
                    callback = modifiers;
                    modifiers = to;
                } else {
                    callback = to;
                }
                $set = prop;
            } else {
                $set[prop] = to;
                if (typeof(modifiers) === 'function' || !modifiers) {
                    callback = modifiers;
                }
            }

            this._set(distinct_id, $set, callback, modifiers);
        },

        // used internally by set and set_once
        _set: function(distinct_id, $set, callback, options) {
            options = options || {};
            var set_key = (options && options.set_once) ? "$set_once" : "$set";

            var data = {
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };
            data[set_key] = $set;

            if ('ip' in $set) {
                data.$ip = $set.ip;
                delete $set.ip;
            }

            if ($set.$ignore_time) {
                data.$ignore_time = $set.$ignore_time;
                delete $set.$ignore_time;
            }

            data = merge_modifiers(data, options);

            if (metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.increment(distinct_id, prop, by, modifiers, callback)
            ---
            increment/decrement properties on an user record in engage

            usage:

                mixpanel.people.increment('bob', 'page_views', 1);

                // or, for convenience, if you're just incrementing a counter by 1, you can
                // simply do
                mixpanel.people.increment('bob', 'page_views');

                // to decrement a counter, pass a negative number
                mixpanel.people.increment('bob', 'credits_left', -1);

                // like mixpanel.people.set(), you can increment multiple properties at once:
                mixpanel.people.increment('bob', {
                    counter1: 1,
                    counter2: 3,
                    counter3: -2
                });
        */
        increment: function(distinct_id, prop, by, modifiers, callback) {
            var $add = {};

            if (typeof(prop) === 'object') {
                if (typeof(by) === 'object') {
                    callback = modifiers;
                    modifiers = by;
                } else {
                    callback = by;
                }
                Object.keys(prop).forEach(function(key) {
                    var val = prop[key];

                    if (isNaN(parseFloat(val))) {
                        if (metrics.config.debug) {
                            console.error("Invalid increment value passed to mixpanel.people.increment - must be a number");
                            console.error("Passed " + key + ":" + val);
                        }
                        return;
                    } else {
                        $add[key] = val;
                    }
                });
            } else {
                if (typeof(by) === 'number' || !by) {
                    by = by || 1;
                    $add[prop] = by;
                    if (typeof(modifiers) === 'function') {
                        callback = modifiers;
                    }
                } else if (typeof(by) === 'function') {
                    callback = by;
                    $add[prop] = 1;
                } else {
                    callback = modifiers;
                    modifiers = (typeof(by) === 'object') ? by : {};
                    $add[prop] = 1;
                }
            }

            var data = {
                '$add': $add,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            data = merge_modifiers(data, modifiers);

            if (metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.append(distinct_id, prop, value, modifiers, callback)
            ---
            Append a value to a list-valued people analytics property.

            usage:

                // append a value to a list, creating it if needed
                mixpanel.people.append('pages_visited', 'homepage');

                // like mixpanel.people.set(), you can append multiple properties at once:
                mixpanel.people.append({
                    list1: 'bob',
                    list2: 123
                });
        */
        append: function(distinct_id, prop, value, modifiers, callback) {
            var $append = {};

            if (typeof(prop) === 'object') {
                if (typeof(value) === 'object') {
                    callback = modifiers;
                    modifiers = value;
                } else {
                    callback = value;
                }
                Object.keys(prop).forEach(function(key) {
                    $append[key] = prop[key];
                });
            } else {
                $append[prop] = value;
                if (typeof(modifiers) === 'function') {
                    callback = modifiers;
                }
            }

            var data = {
                '$append': $append,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            data = merge_modifiers(data, modifiers);

            if (metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.track_charge(distinct_id, amount, properties, modifiers, callback)
            ---
            Record that you have charged the current user a certain
            amount of money.

            usage:

                // charge a user $29.99
                mixpanel.people.track_charge('bob', 29.99);

                // charge a user $19 on the 1st of february
                mixpanel.people.track_charge('bob', 19, { '$time': new Date('feb 1 2012') });
        */
        track_charge: function(distinct_id, amount, properties, modifiers, callback) {
            if (typeof(properties) === 'function' || !properties) {
                callback = properties || function() {};
                properties = {};
            } else {
                if (typeof(modifiers) === 'function' || !modifiers) {
                    callback = modifiers || function() {};
                    if (properties.$ignore_time || properties.hasOwnProperty("$ip")) {
                        modifiers = {};
                        Object.keys(properties).forEach(function(key) {
                            modifiers[key] = properties[key];
                            delete properties[key];
                        });
                    }
                }
            }

            if (typeof(amount) !== 'number') {
                amount = parseFloat(amount);
                if (isNaN(amount)) {
                    console.error("Invalid value passed to mixpanel.people.track_charge - must be a number");
                    return;
                }
            }

            properties.$amount = amount;

            if (properties.hasOwnProperty('$time')) {
                var time = properties.$time;
                if (Object.prototype.toString.call(time) === '[object Date]') {
                    properties.$time = time.toISOString();
                }
            }

            var data = {
                '$append': { '$transactions': properties },
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            data = merge_modifiers(data, modifiers);

            if (metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.clear_charges(distinct_id, modifiers, callback)
            ---
            Clear all the current user's transactions.

            usage:

                mixpanel.people.clear_charges('bob');
        */
        clear_charges: function(distinct_id, modifiers, callback) {
            var data = {
                '$set': { '$transactions': [] },
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if (typeof(modifiers) === 'function') { callback = modifiers; }

            data = merge_modifiers(data, modifiers);

            if (metrics.config.debug) {
                console.log("Clearing this user's charges:", distinct_id);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.delete_user(distinct_id, modifiers, callback)
            ---
            delete an user record in engage

            usage:

                mixpanel.people.delete_user('bob');
        */
        delete_user: function(distinct_id, modifiers, callback) {
            var data = {
                '$delete': '',
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if (typeof(modifiers) === 'function') { callback = modifiers; }

            data = merge_modifiers(data, modifiers);

            if (metrics.config.debug) {
                console.log("Deleting the user from engage:", distinct_id);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
         people.union(distinct_id, data, modifiers, callback)
         ---
         merge value(s) into a list-valued people analytics property.

         usage:

            mixpanel.people.union('bob', {'browsers': 'firefox'});

            mixpanel.people.union('bob', {'browsers', ['chrome'], os: ['linux']});
         */
        union: function(distinct_id, data, modifiers, callback) {
            var $union = {};

            if (typeof(data) !== 'object' || util.isArray(data)) {
                if (metrics.config.debug) {
                    console.error("Invalid value passed to mixpanel.people.union - data must be an object with array values");
                }
                return;
            }

            Object.keys(data).forEach(function(key) {
                var val = data[key];
                if (util.isArray(val)) {
                    var merge_values = val.filter(function(v) {
                        return typeof(v) === 'string' || typeof(v) === 'number';
                    });
                    if (merge_values.length > 0) {
                        $union[key] = merge_values;
                    }
                } else if (typeof(val) === 'string' || typeof(val) === 'number') {
                    $union[key] = [val];
                } else {
                    if (metrics.config.debug) {
                        console.error("Invalid argument passed to mixpanel.people.union - values must be a scalar value or array");
                        console.error("Passed " + key + ':', val);
                    }
                    return;
                }
            });

            if (Object.keys($union).length === 0) {
                return;
            }

            data = {
                '$union': $union,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if (typeof(modifiers) === 'function') {
                callback = modifiers;
            }

            data = merge_modifiers(data, modifiers);

            if (metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
         people.unset(distinct_id, prop, modifiers, callback)
         ---
         delete a property on an user record in engage

         usage:

            mixpanel.people.unset('bob', 'page_views');

            mixpanel.people.unset('bob', ['page_views', 'last_login']);
         */
        unset: function(distinct_id, prop, modifiers, callback) {
            var $unset = [];

            if (util.isArray(prop)) {
                $unset = prop;
            } else if (typeof(prop) === 'string') {
                $unset = [prop];
            } else {
                if (metrics.config.debug) {
                    console.error("Invalid argument passed to mixpanel.people.unset - must be a string or array");
                    console.error("Passed: " + prop);
                }
                return;
            }

            var data = {
                '$unset': $unset,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if (typeof(modifiers) === 'function') {
                callback = modifiers;
            }

            data = merge_modifiers(data, modifiers);

            if (metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        }
    };

    var merge_modifiers = function(data, modifiers) {
        if (modifiers) {
            if (modifiers.$ignore_alias) {
                data.$ignore_alias = modifiers.$ignore_alias;
            }
            if (modifiers.$ignore_time) {
                data.$ignore_time = modifiers.$ignore_time;
            }
            if (modifiers.hasOwnProperty("$ip")) {
                data.$ip = modifiers.$ip;
            }
            if (modifiers.hasOwnProperty("$time")) {
                data.$time = parse_time(modifiers.$time);
            }
        }
        return data;
    };

    /**
        set_config(config)
        ---
        Modifies the mixpanel config

        config:object       an object with properties to override in the
                            mixpanel client config
    */
    metrics.set_config = function(config) {
        for (var c in config) {
            if (config.hasOwnProperty(c)) {
                if (c == "host") { // Split host, into host and port.
                    metrics.config.host = config[c].split(':')[0];
                    var port = config[c].split(':')[1];
                    if (port) {
                        metrics.config.port = Number(port);
                    }
                } else {
                    metrics.config[c] = config[c];
                }
            }
        }
    };

    if (config) {
        metrics.set_config(config);
    }

    return metrics;
};

// module exporting
module.exports = {
    Client: function(token) {
        console.warn("The function `Client(token)` is deprecated.  It is now called `init(token)`.");
        return create_client(token);
    },
    init: create_client
};


/***/ }),
/* 63 */
/***/ (function(module, exports) {

module.exports = require("buffer");

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(28);
const os = __webpack_require__(6);
const path = __webpack_require__(27);

const Logger = __webpack_require__(57);
const configPath = typeof atom !== 'undefined' && atom.config.getUserConfigPath()
  ? path.join(path.dirname(atom.config.getUserConfigPath()), 'kite-config.json')
  : path.join(os.homedir(), '.kite', 'kite-config.json');

var config = null;

try {
  Logger.verbose(`initializing localconfig from ${ configPath }...`);
  var str = fs.readFileSync(configPath, {encoding: 'utf8'});
  config = JSON.parse(str);
} catch (err) {
  config = {};
}

function persist() {
  var str = JSON.stringify(config, null, 2); // serialize with whitespace for human readability
  fs.writeFile(configPath, str, 'utf8', (err) => {
    if (err) {
      Logger.error(`failed to persist localconfig to ${ configPath }`, err);
    }
  });
}

// get gets a value from storage
function get(key, fallback) {
  return key in config ? config[key] : fallback;
}

// set assigns a value to storage and asynchronously persists it to disk
function set(key, value) {
  config[key] = value;
  persist();   // will write to disk asynchronously
}

module.exports = {
  get: get,
  set: set,
};


/***/ }),
/* 65 */
/***/ (function(module) {

module.exports = {"_from":"kite-installer@^3.2.0","_id":"kite-installer@3.8.0","_inBundle":false,"_integrity":"sha512-92rNi6BKMmBMRMzdd0ET1gBn7a7g6EYejTAuer+yq2f1Z4jnEAZH1JHeZgn/ukULUol5sCNdbUDVbAk7mbLxVQ==","_location":"/kite-installer","_phantomChildren":{"form-data":"2.3.3","md5":"2.2.1"},"_requested":{"type":"range","registry":true,"raw":"kite-installer@^3.2.0","name":"kite-installer","escapedName":"kite-installer","rawSpec":"^3.2.0","saveSpec":null,"fetchSpec":"^3.2.0"},"_requiredBy":["/"],"_resolved":"https://registry.npmjs.org/kite-installer/-/kite-installer-3.8.0.tgz","_shasum":"6a8c354b04a6a95d4577fdfee8ca4b3f94f754fb","_spec":"kite-installer@^3.2.0","_where":"/Users/dane/github/kite","author":{"name":"Daniel Hung"},"bundleDependencies":false,"dependencies":{"kite-api":"2.14.0","kite-connector":"2.8.0","mixpanel":"^0.5.0","rollbar":"^2.4.4"},"deprecated":false,"description":"Javascript library to install and manage Kite","devDependencies":{"babel-eslint":"^7.1.1","codecov":"^1.0.0","eslint":"^3.6.0","eslint-config":"^0.3.0","eslint-config-fbjs":"^1.1.1","eslint-plugin-babel":"^4.0.0","eslint-plugin-flowtype":"^2.29.1","eslint-plugin-jasmine":"^2.2.0","eslint-plugin-prefer-object-spread":"^1.1.0","eslint-plugin-react":"^6.8.0","expect.js":"^0.3.1","fbjs":"^0.8.6","jsdom":"^9.8.3","mocha":"^5.2.0","mocha-jsdom":"^1.1.0","nyc":"^13.0.1","sinon":"^2.3.5"},"keywords":[],"license":"SEE LICENSE IN LICENSE","main":"./lib/index.js","name":"kite-installer","scripts":{"coverage":"npm run lcov_report && codecov","lcov_report":"nyc report --reporter=lcov","lint":"eslint .","lint:fix":"eslint --fix .","test":"nyc mocha --timeout 20000 --recursive test/*.test.js test/**/*.test.js","test-nocov":"mocha --timeout 20000 --recursive test/*.test.js test/**/*.test.js"},"version":"3.8.0"};

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const KiteAPI = __webpack_require__(9);
const KiteConnector = __webpack_require__(13);
const {STATES} = __webpack_require__(20);

const StateController = {
  STATES,

  get support() {
    return KiteConnector.adapter;
  },

  get releaseURL() {
    return this.support.releaseURL;
  },

  get downloadPath() {
    return this.support.downloadPath;
  },

  get installPath() {
    return this.support.installPath;
  },

  /*
    The old client.request method was not failing due to invalid status code
    so we're just returning the response in that case so that the legacy
    code can continue working until we decide to change it completely.
  */
  client: {
    request(...args) {
      return KiteAPI.request(...args).catch(err => {
        if (err.resp) {
          return err.resp;
        }
        throw err;
      });
    },
  },
};

[
  ['handleState', 'checkHealth'],
  ['pathInWhitelist', 'isPathWhitelisted'],
].forEach(([a, b]) => {
  StateController[a] = (...args) => KiteAPI[b](...args);
});

[
  'arch',
  'isAdmin',
  'isOSSupported',
  'isOSVersionSupported',
  'hasManyKiteInstallation',
  'hasManyKiteEnterpriseInstallation',
  'hasBothKiteInstalled',
].forEach(method => {
  StateController[method] = (...args) => KiteConnector.adapter[method](...args);
});

[
  'isKiteSupported',
  'isKiteInstalled',
  'isKiteEnterpriseInstalled',
  'canInstallKite',
  'downloadKiteRelease',
  'downloadKite',
  'installKite',
  'isKiteRunning',
  'canRunKite',
  'runKite',
  'runKiteAndWait',
  'isKiteEnterpriseRunning',
  'canRunKiteEnterprise',
  'runKiteEnterprise',
  'runKiteEnterpriseAndWait',
  'isKiteReachable',
  'waitForKite',
  'isUserAuthenticated',
  'canAuthenticateUser',
  'authenticateUser',
  'authenticateSessionID',
  'isPathWhitelisted',
  'canWhitelistPath',
  'whitelistPath',
  'blacklistPath',
  'saveUserID',
].forEach(method => {
  StateController[method] = (...args) => KiteAPI[method](...args);
});

module.exports = StateController;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {


const Authenticate = __webpack_require__(68);
const BranchStep = __webpack_require__(71);
const CheckEmail = __webpack_require__(72);
const CreateAccount = __webpack_require__(73);
const Download = __webpack_require__(74);
const Flow = __webpack_require__(75);
const GetEmail = __webpack_require__(77);
const InputEmail = __webpack_require__(78);
const Install = __webpack_require__(79);
const KiteVsJedi = __webpack_require__(104);
const Login = __webpack_require__(105);
const ParallelSteps = __webpack_require__(106);
const PassStep = __webpack_require__(107);
const VoidStep = __webpack_require__(108);

const KiteAPI = __webpack_require__(9);

module.exports = {
  Authenticate,
  BranchStep,
  CheckEmail,
  CreateAccount,
  Download,
  Flow,
  GetEmail,
  InputEmail,
  Install,
  KiteVsJedi,
  Login,
  ParallelSteps,
  VoidStep,

  atom: () => {
    const InstallElement = __webpack_require__(109);
    const InputEmailElement = __webpack_require__(111);
    const InstallWaitElement = __webpack_require__(113);
    const InstallEndElement = __webpack_require__(114);
    const InstallErrorElement = __webpack_require__(115);
    const KiteVsJediElement = __webpack_require__(116);
    const LoginElement = __webpack_require__(117);
    const NotAdminElement = __webpack_require__(118);
    const InstallPlugin = __webpack_require__(119);

    return {
      InstallElement,
      InputEmailElement,
      InstallWaitElement,
      InstallEndElement,
      InstallErrorElement,
      KiteVsJediElement,
      LoginElement,
      InstallPlugin,

      defaultFlow: () => {
        return [
          new BranchStep([
            {
              match: (data) => KiteAPI.isAdmin(),
              step: new GetEmail({name: 'get-email'}),
            }, {
              match: (data) => !KiteAPI.isAdmin(),
              step: new VoidStep({
                name: 'not-admin',
                view: new NotAdminElement('kite_installer_not_admin_step'),
              }),
            },
          ], {
            name: 'admin-check',
          }),
          new InputEmail({
            name: 'input-email',
            view: new InputEmailElement('kite_installer_input_email_step'),
          }),
          new CheckEmail({
            name: 'check-email',
            failureStep: 'input-email',
          }),
          new BranchStep([
            {
              match: (data) => data.account.exists,
              step: new Login({
                name: 'login',
                view: new LoginElement('kite_installer_login_step'),
                failureStep: 'account-switch',
                backStep: 'input-email',
              }),
            }, {
              match: (data) => !data.account.exists,
              step: new CreateAccount({name: 'create-account'}),
            },
          ], {
            name: 'account-switch',
          }),
          new ParallelSteps([
            new Flow([
              new Download({name: 'download'}),
              new Authenticate({name: 'authenticate'}),
              new InstallPlugin({name: 'install-plugin'}),
            ], {name: 'download-flow'}),
            new PassStep({
              name: 'wait-step',
              view: new InstallWaitElement('kite_installer_wait_step'),
            }),
          ], {
            name: 'download-and-wait',
          }),
          new BranchStep([
            {
              match: (data) => !data.error,
              step: new VoidStep({
                name: 'end',
                view: new InstallEndElement('kite_installer_install_end_step'),
              }),
            }, {
              match: (data) => data.error,
              step: new VoidStep({
                name: 'error',
                view: new InstallErrorElement('kite_installer_install_error_step'),
              }),
            },
          ], {name: 'termination'}),
        ];
      },

      autocompletePythonFlow: () => {
        return [
          new KiteVsJedi({
            name: 'kite-vs-jedi',
            view: new KiteVsJediElement('kite_installer_choose_kite_step'),
          }),
          new BranchStep([
            {
              match: (data) => true,
              step: new GetEmail({name: 'get-email'}),
            },
            {
              match: (data) => false,
              step: new VoidStep({
                name: 'not-admin',
                view: new NotAdminElement('kite_installer_not_admin_step'),
              }),
            },
          ], {
            name: 'admin-check',
          }),
          new InputEmail({
            name: 'input-email',
            view: new InputEmailElement('kite_installer_input_email_step'),
          }),
          new CheckEmail({
            name: 'check-email',
            failureStep: 'input-email',
          }),
          new BranchStep([
            {
              match: (data) => data.skipped,
              step: new PassStep({name: 'skip-email'}),
            },
            {
              match: (data) => !data.skipped && data.account.exists,
              step: new Login({
                name: 'login',
                view: new LoginElement('kite_installer_login_step'),
                failureStep: 'account-switch',
                backStep: 'input-email',
              }),
            },
            {
              match: (data) => !data.skipped && !data.account.exists,
              step: new CreateAccount({name: 'create-account'}),
            },
          ], {
            name: 'account-switch',
          }),
          new ParallelSteps([
            new Flow([
              new Download({name: 'download'}),
              new Authenticate({name: 'authenticate'}),
              new InstallPlugin({name: 'install-plugin'}),
            ], {name: 'download-flow'}),
            new PassStep({
              name: 'wait-step',
              view: new InstallWaitElement('kite_installer_wait_step'),
            }),
          ], {
            name: 'download-and-wait',
          }),
          new BranchStep([
            {
              match: (data) => !data.error,
              step: new VoidStep({
                name: 'end',
                view: new InstallEndElement('kite_installer_install_end_step'),
              }),
            },
            {
              match: (data) => data.error,
              step: new VoidStep({
                name: 'error',
                view: new InstallErrorElement('kite_installer_install_error_step'),
              }),
            },
          ], {name: 'termination'}),
        ];
      },
    };
  },
};


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);
const KiteAPI = __webpack_require__(9);
const {retryPromise} = __webpack_require__(15);
const Metrics = __webpack_require__(60);

module.exports = class Authenticate extends BaseStep {
  constructor(options = {}) {
    super(options);
    this.cooldown = options.cooldown || 1500;
    this.tries = options.tries || 10;
  }
  start(state, install) {
    install.updateState({authenticate: {done: false}});

    let promise;

    if (!state.account || !state.account.sessionId) {
      promise = Promise.resolve();
    } else {
      promise = retryPromise(() => KiteAPI.authenticateSessionID(state.account.sessionId), this.tries, this.cooldown);
    }

    return promise.then(() => {
      Metrics.Tracker.trackEvent('kite_installer_user_authenticated');
      install.updateState({authenticate: {done: true}});
    });
  }
};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CompositeDisposable = __webpack_require__(70);

module.exports = class BaseStep {
  constructor(options = {}) {
    this.options = options;
    this.name = options.name;
    this.failureStep = options.failureStep;
    this.view = options.view;
    this.subscriptions = new CompositeDisposable();
  }

  start() { return Promise.resolve(); }

  release() { this.subscriptions.dispose(); }

  getView() { return this.view; }
};


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class CompositeDisposable {
  constructor(disposables = []) {
    this.disposables = disposables;
  }

  add(disposable) {
    if (disposable && !this.disposables.includes(disposable)) {
      this.disposables.push(disposable);
    }
  }

  remove(disposable) {
    if (disposable && this.disposables.includes(disposable)) {
      this.disposables = this.disposables.filter(d => d != disposable);
    }
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
  }
};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);

module.exports = class BranchStep extends BaseStep {
  constructor(branches, options) {
    super(options);
    this.branches = branches;
  }

  start(data) {
    return new Promise((resolve, reject) => {
      const result = this.branches.reduce((p, cond) => {
        if (p) { return p; }

        return cond.match(data) ? {step: cond.step, data} : null;
      }, null);

      result
        ? resolve(result)
        : reject();
    });
  }
};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);
const AccountManager = __webpack_require__(8);

module.exports = class CheckEmail extends BaseStep {
  start({account}) {
    if (account.skipped) {
      return Promise.resolve({skipped: true});
    }

    return AccountManager.checkEmail(account)
    .catch(err => {
      if (err.resp) {
        return err.resp;
      } else {
        throw err;
      }
    })
    .then(() => {
      return {
        error: null,
        account: {
          email: account.email,
          invalid: false,
          exists: false,
          hasPassword: false,
          reason: null,
        },
      };
    }).catch(err => {
      if (err.data && err.data.response) {
        const json = JSON.parse(err.data.responseData);
        switch (err.data.responseStatus) {
          case 403:
          case 404:
          case 409:
            if (json.email_invalid) {
              const err = new Error(json.fail_reason);
              err.data = {
                account: {
                  email: account.email,
                  invalid: json.email_invalid,
                  exists: json.account_exists,
                  hasPassword: json.has_password,
                  reason: json.fail_reason,
                },
              };
              throw err;
            } else {
              return {
                error: null,
                account: {
                  email: account.email,
                  invalid: json.email_invalid,
                  exists: json.account_exists,
                  hasPassword: json.has_password,
                  reason: json.fail_reason,
                },
              };
            }
        }
        return undefined;
      } else {
        throw err;
      }
    });
  }
};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);
const AccountManager = __webpack_require__(8);
const utils = __webpack_require__(15);

module.exports = class CreateAccount extends BaseStep {
  start({account: {email}}, err) {
    return AccountManager.createAccount({email}).then(resp => {
      const cookies = utils.parseSetCookies(resp.headers['set-cookie']);
      return {
        account: {
          sessionId: utils.findCookie(cookies, 'kite-session').Value,
        },
      };
    });
  }
};


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const KiteAPI = __webpack_require__(9);
const {retryPromise} = __webpack_require__(15);
const Metrics = __webpack_require__(60);

const BaseStep = __webpack_require__(69);

module.exports = class Download extends BaseStep {
  constructor(options) {
    super(options);

    this.installInterval = 1500;
    this.runInterval = 2500;
  }

  start(state, install) {
    return KiteAPI.downloadKiteRelease({
      reinstall: true,
      onDownloadProgress: (length, total, ratio) => {
        install.updateState({download: {length, total, ratio}});
      },
    })
    .then(() => {
      Metrics.Tracker.trackEvent('kite_installer_kite_app_downloaded');
      install.updateState({
        download: {done: true},
        install: {done: false},
      });
      return retryPromise(() => KiteAPI.installKite(), 5, this.installInterval);
    })
    .then(() => retryPromise(() => KiteAPI.isKiteInstalled(), 10, this.installInterval))
    .then(() => {
      Metrics.Tracker.trackEvent('kite_installer_kite_app_installed');
      install.updateState({
        install: {done: true},
        running: {done: false},
      });
      return KiteAPI.runKiteAndWait(30, this.runInterval)
      .then(() => {
        Metrics.Tracker.trackEvent('kite_installer_kite_app_started');
        install.updateState({running: {done: true}});
      });
    });
  }
};


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Emitter = __webpack_require__(76);
const BaseStep = __webpack_require__(69);

module.exports = class Flow extends BaseStep {
  constructor(steps = [], options) {
    super(options);
    this.currentStepIndex = 0;
    this.emitter = new Emitter();
    this.steps = steps;
  }

  onDidChangeCurrentStep(listener) {
    return this.emitter.on('did-change-current-step', listener);
  }

  onDidFailStep(listener) {
    return this.emitter.on('did-fail-step', listener);
  }

  start(state, install) {
    this.install = install;
    const firstStep = this.steps[this.currentStepIndex];
    return firstStep
      ? this.executeStep(firstStep)
      : Promise.resolve();
  }

  executeStep(step) {
    if (this.currentStep) { this.currentStep.release(); }

    this.currentStep = step;
    const stepIndex = this.steps.indexOf(step);
    this.currentStepIndex = stepIndex !== -1
      ? stepIndex
      : this.currentStepIndex;

    this.emitter.emit('did-change-current-step', step);

    return step
    .start(this.install.state, this.install)
    .catch((err) => {
      this.emitter.emit('did-fail-step', {error: err, step});

      this.install.updateState({
        error: {
          message: err.message,
          stack: err.stack,
        },
      });

      if (step.failureStep) {
        return this.executeStep(this.getStepByName(step.failureStep));
      } else {
        if (this.options.failureStep && this.getStepByName(this.options.failureStep)) {
          return this.executeStep(this.getStepByName(this.options.failureStep));
        } else {
          throw err;
        }
      }
    })
    .then((data) => {
      if (data && data.step) {
        const step = typeof data.step === 'string'
          ? this.getStepByName(data.step)
          : data.step;
        this.install.updateState(data.data);
        return this.executeStep(step);
      } else {
        this.install.updateState(data);
        return this.executeNextStep(data);
      }
    });
  }

  executeNextStep(data) {
    const nextStep = this.getNextStep(this.currentStepIndex);
    return nextStep
      ? this.executeStep(nextStep)
      : data;
  }

  getCurrentStep() {
    return this.currentStep && this.currentStep.getCurrentStep
      ? this.currentStep.getCurrentStep()
      : this.currentStep;
  }

  getStepByName(name) {
    return this.steps.reduce((m, s) => {
      if (m) { return m; }
      if (s.name === name) { return s; }
      return m;
    }, null);
  }

  getNextStep(index) {
    return this.steps[index + 1];
  }
};


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class Emitter {
  constructor() {
    this.listeners = {};
  }

  on(event, listener) {
    this.listeners[event] = this.listeners[event] || [];

    if (listener && !this.listeners[event].includes(listener)) {
      this.listeners[event].push(listener);
      return {
        dispose: () => {
          this.listeners[event] = this.listeners[event].filter(l => l !== listener);
        },
      };
    } else {
      return {
        dispose: () => {},
      };
    }
  }

  emit(event, data) {
    this.listeners[event] && this.listeners[event].forEach(listener => {
      listener(data);
    });
  }
};


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(28);
const os = __webpack_require__(6);
const path = __webpack_require__(27);

const Logger = __webpack_require__(57);
const {Tracker} = __webpack_require__(60);
const BaseStep = __webpack_require__(69);

module.exports = class GetEmail extends BaseStep {
  start() {
    return new Promise((resolve, reject) => {
      const gitconfig = String(fs.readFileSync(path.join(os.homedir(), '.gitconfig')));

      const lines = gitconfig.split('\n');
      const line = lines.filter(line => /^\s*email\s=/.test(line))[0];

      resolve({account: {email: line ? line.split('=')[1].trim() : undefined}});
    }).catch(err => {
      Tracker.trackEvent('error parsing gitconfig', { error: err.message });
      Logger.error('error parsing gitconfig:', err);
      return {account: {email: undefined}};
    });
  }
};


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);

module.exports = class InputEmail extends BaseStep {
  start(state, install) {
    return new Promise((resolve, reject) => {
      this.subscriptions.add(install.on('did-submit-email', data => {
        resolve({account: data});
      }));

      this.subscriptions.add(install.on('did-skip-email', data => {
        resolve({account: data});
      }))
    });
  }
};


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Emitter = __webpack_require__(76);
const Flow = __webpack_require__(75);
const {deepMerge} = __webpack_require__(15);
const Rollbar = __webpack_require__(80);
const rollbar = new Rollbar('0d9bba1cb93446a8af003823e0e85ce8');

module.exports = class Install {
  /*
  interface Step {
    get name : String
    get failureStep : String
    get view : HTMLElement?
    start(state : Object, install : Install) : Promise
  }
  */
  constructor(steps, state = {}, options = {}) {
    this.emitter = new Emitter();
    this.flow = new Flow(steps, options);
    this.state = state;
    this.options = options;

    this.flow.onDidFailStep(({error}) => {
      error && rollbar.error(error, error.data);
    });
  }

  getTitle() {
    return this.options.title || 'Kite Install';
  }

  // Atom is using `on` unless these methods exists, so to avoid any issue
  // we have them defined here.
  onDidChangeTitle() {}
  onDidChangeModified() {}

  on(event, listener) {
    return this.emitter.on(event, listener);
  }

  observeState(listener) {
    listener && listener(this.state);
    return this.onDidUdpdateState(listener);
  }

  onDidDestroy(listener) {
    return this.emitter.on('did-destroy', listener);
  }

  onDidUdpdateState(listener) {
    return this.emitter.on('did-update-state', listener);
  }

  onDidChangeCurrentStep(listener) {
    return this.flow.onDidChangeCurrentStep(listener);
  }

  onDidFailStep(listener) {
    return this.flow.onDidFailStep(listener);
  }

  start() {
    return this.flow.start(this.state, this);
  }

  emit(event, data) {
    this.emitter.emit(event, data);
  }

  destroy() {
    this.emit('did-destroy');
  }


  getCurrentStepView() {
    const step = this.getCurrentStep();
    return step && step.getView();
  }

  getCurrentStep() {
    return this.flow.getCurrentStep();
  }

  updateState(o) {
    this.state = deepMerge(this.state, o);
    if (o && o.error === null) {
      delete this.state.error;
    }
    this.emitter.emit('did-update-state', this.state);
  }
};


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var util = __webpack_require__(24);
var os = __webpack_require__(6);

var packageJson = __webpack_require__(81);
var Client = __webpack_require__(82);
var _ = __webpack_require__(84);
var API = __webpack_require__(90);
var logger = __webpack_require__(93);

var Transport = __webpack_require__(94);
var urllib = __webpack_require__(4);
var jsonBackup = __webpack_require__(95);

var transforms = __webpack_require__(96);
var sharedTransforms = __webpack_require__(102);
var sharedPredicates = __webpack_require__(103);

function Rollbar(options, client) {
  if (_.isType(options, 'string')) {
    var accessToken = options;
    options = {};
    options.accessToken = accessToken;
  }
  if (options.minimumLevel !== undefined) {
    options.reportLevel = options.minimumLevel;
    delete options.minimumLevel;
  }
  this.options = _.handleOptions(Rollbar.defaultOptions, options);
  // On the server we want to ignore any maxItems setting
  delete this.options.maxItems;
  this.options.environment = this.options.environment || 'unspecified';
  logger.setVerbose(this.options.verbose);
  this.lambdaContext = null;
  this.lambdaTimeoutHandle = null;
  var transport = new Transport();
  var api = new API(this.options, transport, urllib, jsonBackup);
  this.client = client || new Client(this.options, api, logger, 'server');
  addTransformsToNotifier(this.client.notifier);
  addPredicatesToQueue(this.client.queue);
  this.setupUnhandledCapture();
}

var _instance = null;
Rollbar.init = function(options, client) {
  if (_instance) {
    return _instance.global(options).configure(options);
  }
  _instance = new Rollbar(options, client);
  return _instance;
};

function handleUninitialized(maybeCallback) {
  var message = 'Rollbar is not initialized';
  logger.error(message);
  if (maybeCallback) {
    maybeCallback(new Error(message));
  }
}

Rollbar.prototype.global = function(options) {
  options = _.handleOptions(options);
  // On the server we want to ignore any maxItems setting
  delete options.maxItems;
  this.client.global(options);
  return this;
};
Rollbar.global = function(options) {
  if (_instance) {
    return _instance.global(options);
  } else {
    handleUninitialized();
  }
};

Rollbar.prototype.configure = function(options, payloadData) {
  var oldOptions = this.options;
  var payload = {};
  if (payloadData) {
    payload = {payload: payloadData};
  }
  this.options = _.handleOptions(oldOptions, options, payload);
  // On the server we want to ignore any maxItems setting
  delete this.options.maxItems;
  logger.setVerbose(this.options.verbose);
  this.client.configure(options, payloadData);
  this.setupUnhandledCapture();
  return this;
};
Rollbar.configure = function(options, payloadData) {
  if (_instance) {
    return _instance.configure(options, payloadData);
  } else {
    handleUninitialized();
  }
};

Rollbar.prototype.lastError = function() {
  return this.client.lastError;
};
Rollbar.lastError = function() {
  if (_instance) {
    return _instance.lastError();
  } else {
    handleUninitialized();
  }
};

Rollbar.prototype.log = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.log(item);
  return {uuid: uuid};
};
Rollbar.log = function() {
  if (_instance) {
    return _instance.log.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Rollbar.prototype.debug = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.debug(item);
  return {uuid: uuid};
};
Rollbar.debug = function() {
  if (_instance) {
    return _instance.debug.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Rollbar.prototype.info = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.info(item);
  return {uuid: uuid};
};
Rollbar.info = function() {
  if (_instance) {
    return _instance.info.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Rollbar.prototype.warn = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.warn(item);
  return {uuid: uuid};
};
Rollbar.warn = function() {
  if (_instance) {
    return _instance.warn.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};


Rollbar.prototype.warning = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.warning(item);
  return {uuid: uuid};
};
Rollbar.warning = function() {
  if (_instance) {
    return _instance.warning.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};


Rollbar.prototype.error = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.error(item);
  return {uuid: uuid};
};
Rollbar.error = function() {
  if (_instance) {
    return _instance.error.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};
Rollbar.prototype._uncaughtError = function() {
  var item = this._createItem(arguments);
  item._isUncaught = true;
  var uuid = item.uuid;
  this.client.error(item);
  return {uuid: uuid};
};

Rollbar.prototype.critical = function() {
  var item = this._createItem(arguments);
  var uuid = item.uuid;
  this.client.critical(item);
  return {uuid: uuid};
};
Rollbar.critical = function() {
  if (_instance) {
    return _instance.critical.apply(_instance, arguments);
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Rollbar.prototype.buildJsonPayload = function(item) {
  return this.client.buildJsonPayload(item);
};
Rollbar.buildJsonPayload = function() {
  if (_instance) {
    return _instance.buildJsonPayload.apply(_instance, arguments);
  } else {
    handleUninitialized();
  }
};

Rollbar.prototype.sendJsonPayload = function(jsonPayload) {
  return this.client.sendJsonPayload(jsonPayload);
};
Rollbar.sendJsonPayload = function() {
  if (_instance) {
    return _instance.sendJsonPayload.apply(_instance, arguments);
  } else {
    handleUninitialized();
  }
};

Rollbar.prototype.wait = function(callback) {
  this.client.wait(callback);
};
Rollbar.wait = function(callback) {
  if (_instance) {
    return _instance.wait(callback)
  } else {
    var maybeCallback = _getFirstFunction(arguments);
    handleUninitialized(maybeCallback);
  }
};

Rollbar.prototype.errorHandler = function() {
  return function(err, request, response, next) {
    var cb = function(rollbarError) {
      if (rollbarError) {
        logger.error('Error reporting to rollbar, ignoring: ' + rollbarError);
      }
      return next(err, request, response);
    };
    if (!err) {
      return next(err, request, response);
    }

    if (err instanceof Error) {
      return this.error(err, request, cb);
    }
    return this.error('Error: ' + err, request, cb);
  }.bind(this);
};
Rollbar.errorHandler = function() {
  if (_instance) {
    return _instance.errorHandler()
  } else {
    handleUninitialized();
  }
};

Rollbar.prototype.lambdaHandler = function(handler, timeoutHandler) {
  if (handler.length <= 2) {
    return this.asyncLambdaHandler(handler, timeoutHandler);
  }
  return this.syncLambdaHandler(handler, timeoutHandler);
};

Rollbar.prototype.asyncLambdaHandler = function(handler, timeoutHandler) {
  var self = this;
  var _timeoutHandler = function(event, context) {
    var message = 'Function timed out';
    var custom = {
      originalEvent: event,
      originalRequestId: context.awsRequestId,
    };
    self.error(message, custom);
  };
  var shouldReportTimeouts = self.options.captureLambdaTimeouts;
  return function(event, context) {
    return new Promise(function(resolve, reject) {
      self.lambdaContext = context;
      if (shouldReportTimeouts) {
        var timeoutCb = (timeoutHandler || _timeoutHandler).bind(null, event, context);
        self.lambdaTimeoutHandle = setTimeout(timeoutCb, context.getRemainingTimeInMillis() - 1000);
      }
      handler(event, context)
        .then(function(resp) {
          clearTimeout(self.lambdaTimeoutHandle);
          resolve(resp);
        })
        .catch(function(err) {
          self.error(err);
          self.wait(function() {
            clearTimeout(self.lambdaTimeoutHandle);
            reject(err);
          });
        });
    });
  };
};
Rollbar.prototype.syncLambdaHandler = function(handler, timeoutHandler) {
  var self = this;
  var _timeoutHandler = function(event, context, cb) {
    var message = 'Function timed out';
    var custom = {
      originalEvent: event,
      originalRequestId: context.awsRequestId,
    };
    self.error(message, custom);
  };
  var shouldReportTimeouts = self.options.captureLambdaTimeouts;
  return function(event, context, callback) {
    self.lambdaContext = context;
    if (shouldReportTimeouts) {
      var timeoutCb = (timeoutHandler || _timeoutHandler).bind(null, event, context, callback);
      self.lambdaTimeoutHandle = setTimeout(timeoutCb, context.getRemainingTimeInMillis() - 1000);
    }
    try {
      handler(event, context, function(err, resp) {
        if (err) {
          self.error(err);
        }
        self.wait(function() {
          clearTimeout(self.lambdaTimeoutHandle);
          callback(err, resp);
        });
      });
    } catch (err) {
      self.error(err);
      self.wait(function() {
        clearTimeout(self.lambdaTimeoutHandle);
        throw err;
      });
    }
  };
};
Rollbar.lambdaHandler = function(handler) {
  if (_instance) {
    return _instance.lambdaHandler(handler);
  } else {
    handleUninitialized();
  }
};

function wrapCallback(r, f) {
  return function() {
    var err = arguments[0];
    if (err) {
      r.error(err);
    }
    return f.apply(this, arguments);
  };
}

Rollbar.prototype.wrapCallback = function(f) {
  return wrapCallback(this, f);
};
Rollbar.wrapCallback = function(f) {
  if (_instance) {
    return _instance.wrapCallback(f);
  } else {
    handleUninitialized();
  }
};

Rollbar.prototype.captureEvent = function() {
  var event = _.createTelemetryEvent(arguments);
  return this.client.captureEvent(event.type, event.metadata, event.level);
};
Rollbar.captureEvent = function() {
  if (_instance) {
    return _instance.captureEvent.apply(_instance, arguments);
  } else {
    handleUninitialized();
  }
};

/** DEPRECATED **/

Rollbar.prototype.reportMessage = function(message, level, request, callback) {
  logger.log('reportMessage is deprecated');
  if (_.isFunction(this[level])) {
    return this[level](message, request, callback);
  } else {
    return this.error(message, request, callback);
  }
};
Rollbar.reportMessage = function(message, level, request, callback) {
  if (_instance) {
    return _instance.reportMessage(message, level, request, callback);
  } else {
    handleUninitialized(callback);
  }
};

Rollbar.prototype.reportMessageWithPayloadData = function(message, payloadData, request, callback) {
  logger.log('reportMessageWithPayloadData is deprecated');
  return this.error(message, request, payloadData, callback);
};
Rollbar.reportMessageWithPayloadData = function(message, payloadData, request, callback) {
  if (_instance) {
    return _instance.reportMessageWithPayloadData(message, payloadData, request, callback);
  } else {
    handleUninitialized(callback);
  }
};


Rollbar.prototype.handleError = function(err, request, callback) {
  logger.log('handleError is deprecated');
  return this.error(err, request, callback);
};
Rollbar.handleError = function(err, request, callback) {
  if (_instance) {
    return _instance.handleError(err, request, callback);
  } else {
    handleUninitialized(callback);
  }
};


Rollbar.prototype.handleErrorWithPayloadData = function(err, payloadData, request, callback) {
  logger.log('handleErrorWithPayloadData is deprecated');
  return this.error(err, request, payloadData, callback);
};
Rollbar.handleErrorWithPayloadData = function(err, payloadData, request, callback) {
  if (_instance) {
    return _instance.handleErrorWithPayloadData(err, payloadData, request, callback);
  } else {
    handleUninitialized(callback);
  }
};

Rollbar.handleUncaughtExceptions = function(accessToken, options) {
  if (_instance) {
    options = options || {};
    options.accessToken = accessToken;
    return _instance.configure(options);
  } else {
    handleUninitialized();
  }
};

Rollbar.handleUnhandledRejections = function(accessToken, options) {
  if (_instance) {
    options = options || {};
    options.accessToken = accessToken;
    return _instance.configure(options);
  } else {
    handleUninitialized();
  }
};

Rollbar.handleUncaughtExceptionsAndRejections = function(accessToken, options) {
  if (_instance) {
    options = options || {};
    options.accessToken = accessToken;
    return _instance.configure(options);
  } else {
    handleUninitialized();
  }
};

/** Internal **/

function addTransformsToNotifier(notifier) {
  notifier
    .addTransform(transforms.baseData)
    .addTransform(transforms.handleItemWithError)
    .addTransform(transforms.addBody)
    .addTransform(sharedTransforms.addMessageWithError)
    .addTransform(sharedTransforms.addTelemetryData)
    .addTransform(transforms.addRequestData)
    .addTransform(transforms.addLambdaData)
    .addTransform(sharedTransforms.addConfigToPayload)
    .addTransform(transforms.scrubPayload)
    .addTransform(sharedTransforms.userTransform(logger))
    .addTransform(sharedTransforms.itemToPayload);
}

function addPredicatesToQueue(queue) {
  queue
    .addPredicate(sharedPredicates.checkLevel)
    .addPredicate(sharedPredicates.userCheckIgnore(logger))
    .addPredicate(sharedPredicates.urlIsNotBlacklisted(logger))
    .addPredicate(sharedPredicates.urlIsWhitelisted(logger))
    .addPredicate(sharedPredicates.messageIsIgnored(logger));
}

Rollbar.prototype._createItem = function(args) {
  var requestKeys = ['headers', 'protocol', 'url', 'method', 'body', 'route'];
  return _.createItem(args, logger, this, requestKeys, this.lambdaContext);
};

function _getFirstFunction(args) {
  for (var i = 0, len = args.length; i < len; ++i) {
    if (_.isFunction(args[i])) {
      return args[i];
    }
  }
  return undefined;
}

Rollbar.prototype.setupUnhandledCapture = function() {
  if (this.options.captureUncaught || this.options.handleUncaughtExceptions) {
    this.handleUncaughtExceptions();
  }
  if (this.options.captureUnhandledRejections || this.options.handleUnhandledRejections) {
    this.handleUnhandledRejections();
  }
};

Rollbar.prototype.handleUncaughtExceptions = function() {
  var exitOnUncaught = !!this.options.exitOnUncaughtException;
  delete this.options.exitOnUncaughtException;

  addOrReplaceRollbarHandler('uncaughtException', function(err) {
    if (!this.options.captureUncaught && !this.options.handleUncaughtExceptions) {
      return;
    }

    this._uncaughtError(err, function(err) {
      if (err) {
        logger.error('Encountered error while handling an uncaught exception.');
        logger.error(err);
      }
    });
    if (exitOnUncaught) {
      setImmediate(function() {
        this.wait(function() {
          process.exit(1);
        });
      }.bind(this));
    }
  }.bind(this));
};

Rollbar.prototype.handleUnhandledRejections = function() {
  addOrReplaceRollbarHandler('unhandledRejection', function(reason) {
    if (!this.options.captureUnhandledRejections && !this.options.handleUnhandledRejections) {
      return;
    }

    this._uncaughtError(reason, function(err) {
      if (err) {
        logger.error('Encountered error while handling an uncaught exception.');
        logger.error(err);
      }
    });
  }.bind(this));
};

function addOrReplaceRollbarHandler(event, action) {
  // We only support up to two arguments which is enough for how this is used
  // rather than dealing with `arguments` and `apply`
  var fn = function(a, b) {
    action(a, b);
  };
  fn._rollbarHandler = true;

  var listeners = process.listeners(event);
  var len = listeners.length;
  for (var i = 0; i < len; ++i) {
    if (listeners[i]._rollbarHandler) {
      process.removeListener(event, listeners[i]);
    }
  }
  process.on(event, fn);
}

function RollbarError(message, nested) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  this.message = message;
  this.nested = nested;
  this.name = this.constructor.name;
}
util.inherits(RollbarError, Error);
Rollbar.Error = RollbarError;

Rollbar.defaultOptions = {
  host: os.hostname(),
  environment: "none" || false,
  framework: 'node-js',
  showReportedMessageTraces: false,
  notifier: {
    name: 'node_rollbar',
    version: packageJson.version
  },
  scrubHeaders: packageJson.defaults.server.scrubHeaders,
  scrubFields: packageJson.defaults.server.scrubFields,
  addRequestData: null,
  reportLevel: packageJson.defaults.reportLevel,
  verbose: false,
  enabled: true,
  sendConfig: false,
  includeItemsInTelemetry: false,
  captureEmail: false,
  captureUsername: false,
  captureIp: true,
  captureLambdaTimeouts: true
};

module.exports = Rollbar;


/***/ }),
/* 81 */
/***/ (function(module) {

module.exports = {"_from":"rollbar@^2.3.8","_id":"rollbar@2.7.0","_inBundle":false,"_integrity":"sha512-xMEZRcebflLiE6PqAm4h980FXH5J20R1tJ1s/cWDB9s0Uaw4rSSRX5oodtb3JkXblG7abTJRmku9Iz2WADOw3w==","_location":"/rollbar","_phantomChildren":{},"_requested":{"type":"range","registry":true,"raw":"rollbar@^2.3.8","name":"rollbar","escapedName":"rollbar","rawSpec":"^2.3.8","saveSpec":null,"fetchSpec":"^2.3.8"},"_requiredBy":["/","/kite-installer"],"_resolved":"https://registry.npmjs.org/rollbar/-/rollbar-2.7.0.tgz","_shasum":"6c2ad649b4f294681c70b5ec23eded77b2a76554","_spec":"rollbar@^2.3.8","_where":"/Users/dane/github/kite","browser":"dist/rollbar.umd.min.js","bugs":{"url":"https://github.com/rollbar/rollbar.js/issues"},"bundleDependencies":false,"cdn":{"host":"cdnjs.cloudflare.com"},"defaults":{"endpoint":"api.rollbar.com/api/1/item/","browser":{"scrubFields":["pw","pass","passwd","password","secret","confirm_password","confirmPassword","password_confirmation","passwordConfirmation","access_token","accessToken","secret_key","secretKey","secretToken","cc-number","card number","cardnumber","cardnum","ccnum","ccnumber","cc num","creditcardnumber","credit card number","newcreditcardnumber","new credit card","creditcardno","credit card no","card#","card #","cc-csc","cvc2","cvv2","ccv2","security code","card verification","name on credit card","name on card","nameoncard","cardholder","card holder","name des karteninhabers","card type","cardtype","cc type","cctype","payment type","expiration date","expirationdate","expdate","cc-exp"]},"server":{"scrubHeaders":["authorization","www-authorization","http_authorization","omniauth.auth","cookie","oauth-access-token","x-access-token","x_csrf_token","http_x_csrf_token","x-csrf-token"],"scrubFields":["pw","pass","passwd","password","password_confirmation","passwordConfirmation","confirm_password","confirmPassword","secret","secret_token","secretToken","secret_key","secretKey","api_key","access_token","accessToken","authenticity_token","oauth_token","token","user_session_secret","request.session.csrf","request.session._csrf","request.params._csrf","request.cookie","request.cookies"]},"logLevel":"debug","reportLevel":"debug","uncaughtErrorLevel":"error","maxItems":0,"itemsPerMin":60},"dependencies":{"async":"~1.2.1","console-polyfill":"0.3.0","debug":"2.6.9","decache":"^3.0.5","error-stack-parser":"1.3.3","json-stringify-safe":"~5.0.0","lru-cache":"~2.2.1","request-ip":"~2.0.1","uuid":"3.0.x"},"deprecated":false,"description":"Error tracking and logging from JS to Rollbar","devDependencies":{"babel-core":"^6.26.3","babel-eslint":"^10.0.1","babel-loader":"^8.0.4","bluebird":"^3.3.5","browserstack-api":"0.0.5","chai":"^4.2.0","chalk":"^1.1.1","eslint":"^5.16.0","eslint-loader":"^2.1.2","express":"^4.16.4","glob":"^5.0.14","grunt":"^1.0.3","grunt-blanket-mocha":"^1.0.0","grunt-bumpup":"^0.6.3","grunt-cli":"^1.3.2","grunt-contrib-concat":"~0.3.0","grunt-contrib-connect":"^2.0.0","grunt-contrib-copy":"~0.5.0","grunt-contrib-jshint":"^2.0.0","grunt-contrib-uglify":"^4.0.0","grunt-contrib-watch":"^1.1.0","grunt-express":"^1.4.1","grunt-karma":"^3.0.1","grunt-karma-coveralls":"^2.5.4","grunt-mocha":"^1.1.0","grunt-mocha-cov":"^0.4.0","grunt-parallel":"^0.5.1","grunt-saucelabs":"^9.0.0","grunt-tagrelease":"~0.3.0","grunt-text-replace":"^0.4.0","grunt-vows":"^0.4.2","grunt-webpack":"^3.1.3","istanbul-instrumenter-loader":"^2.0.0","jade":"~0.27.7","jasmine-core":"^2.3.4","jquery-mockjax":"^2.0.1","karma":"^4.0.1","karma-browserstack-launcher":"^0.1.5","karma-chai":"^0.1.0","karma-chrome-launcher":"^2.2.0","karma-expect":"^1.1.0","karma-firefox-launcher":"^0.1.6","karma-html2js-preprocessor":"^1.1.0","karma-jquery":"^0.1.0","karma-mocha":"^0.2.0","karma-mocha-reporter":"^1.1.1","karma-phantomjs-launcher":"^1.0.4","karma-requirejs":"^0.2.2","karma-safari-launcher":"^0.1.1","karma-sinon":"^1.0.4","karma-sourcemap-loader":"^0.3.5","karma-webpack":"^3.0.5","mocha":"^5.2.0","mootools":"^1.5.1","nock":"^9.0.7","node-libs-browser":"^0.5.2","phantomjs":"^2.1.0","request":"^2.88.0","requirejs":"^2.1.20","script-loader":"0.6.1","sinon":"^7.3.0","stackframe":"^0.2.2","strict-loader":"^0.1.2","time-grunt":"^1.0.0","uglifyjs-webpack-plugin":"^2.1.2","vows":"~0.7.0","webpack":"^4.30.0","webpack-dev-server":"^3.1.10"},"homepage":"https://github.com/rollbar/rollbar.js#readme","license":"MIT","main":"src/server/rollbar.js","name":"rollbar","optionalDependencies":{"decache":"^3.0.5"},"plugins":{"jquery":{"version":"0.0.8"}},"repository":{"type":"git","url":"git+ssh://git@github.com/rollbar/rollbar.js.git"},"scripts":{"build":"grunt","lint":"eslint","test":"grunt test","test-browser":"grunt test-browser","test-server":"grunt test-server","test_ci":"grunt test"},"types":"./index.d.ts","version":"2.7.0"};

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

var RateLimiter = __webpack_require__(83);
var Queue = __webpack_require__(87);
var Notifier = __webpack_require__(88);
var Telemeter = __webpack_require__(89);
var _ = __webpack_require__(84);

/*
 * Rollbar - the interface to Rollbar
 *
 * @param options
 * @param api
 * @param logger
 */
function Rollbar(options, api, logger, platform) {
  this.options = _.merge(options);
  this.logger = logger;
  Rollbar.rateLimiter.configureGlobal(this.options);
  Rollbar.rateLimiter.setPlatformOptions(platform, this.options);
  this.api = api;
  this.queue = new Queue(Rollbar.rateLimiter, api, logger, this.options);
  this.notifier = new Notifier(this.queue, this.options);
  this.telemeter = new Telemeter(this.options);
  this.lastError = null;
  this.lastErrorHash = 'none';
}

var defaultOptions = {
  maxItems: 0,
  itemsPerMinute: 60
};

Rollbar.rateLimiter = new RateLimiter(defaultOptions);

Rollbar.prototype.global = function(options) {
  Rollbar.rateLimiter.configureGlobal(options);
  return this;
};

Rollbar.prototype.configure = function(options, payloadData) {
  var oldOptions = this.options;
  var payload = {};
  if (payloadData) {
    payload = {payload: payloadData};
  }
  this.options = _.merge(oldOptions, options, payload);
  this.notifier && this.notifier.configure(this.options);
  this.telemeter && this.telemeter.configure(this.options);
  this.global(this.options);
  return this;
};

Rollbar.prototype.log = function(item) {
  var level = this._defaultLogLevel();
  return this._log(level, item);
};

Rollbar.prototype.debug = function(item) {
  this._log('debug', item);
};

Rollbar.prototype.info = function(item) {
  this._log('info', item);
};

Rollbar.prototype.warn = function(item) {
  this._log('warning', item);
};

Rollbar.prototype.warning = function(item) {
  this._log('warning', item);
};

Rollbar.prototype.error = function(item) {
  this._log('error', item);
};

Rollbar.prototype.critical = function(item) {
  this._log('critical', item);
};

Rollbar.prototype.wait = function(callback) {
  this.queue.wait(callback);
};

Rollbar.prototype.captureEvent = function(type, metadata, level) {
  return this.telemeter.captureEvent(type, metadata, level);
};

Rollbar.prototype.captureDomContentLoaded = function(ts) {
  return this.telemeter.captureDomContentLoaded(ts);
};

Rollbar.prototype.captureLoad = function(ts) {
  return this.telemeter.captureLoad(ts);
};

Rollbar.prototype.buildJsonPayload = function(item) {
  return this.api.buildJsonPayload(item);
};

Rollbar.prototype.sendJsonPayload = function(jsonPayload) {
  this.api.postJsonPayload(jsonPayload);
};

/* Internal */

Rollbar.prototype._log = function(defaultLevel, item) {
  var callback;
  if (item.callback) {
    callback = item.callback;
    delete item.callback;
  }
  if (this._sameAsLastError(item)) {
    if (callback) {
      var error = new Error('ignored identical item');
      error.item = item;
      callback(error);
    }
    return;
  }
  try {
    item.level = item.level || defaultLevel;
    this.telemeter._captureRollbarItem(item);
    item.telemetryEvents = this.telemeter.copyEvents();
    this.notifier.log(item, callback);
  } catch (e) {
    this.logger.error(e);
  }
};

Rollbar.prototype._defaultLogLevel = function() {
  return this.options.logLevel || 'debug';
};

Rollbar.prototype._sameAsLastError = function(item) {
  if (!item._isUncaught) {
    return false;
  }
  var itemHash = generateItemHash(item);
  if (this.lastErrorHash === itemHash) {
    return true;
  }
  this.lastError = item.err;
  this.lastErrorHash = itemHash;
  return false;
};

function generateItemHash(item) {
  var message = item.message || '';
  var stack = (item.err || {}).stack || String(item.err);
  return message + '::' + stack;
}

module.exports = Rollbar;


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);

/*
 * RateLimiter - an object that encapsulates the logic for counting items sent to Rollbar
 *
 * @param options - the same options that are accepted by configureGlobal offered as a convenience
 */
function RateLimiter(options) {
  this.startTime = _.now();
  this.counter = 0;
  this.perMinCounter = 0;
  this.platform = null;
  this.platformOptions = {};
  this.configureGlobal(options);
}

RateLimiter.globalSettings = {
  startTime: _.now(),
  maxItems: undefined,
  itemsPerMinute: undefined
};

/*
 * configureGlobal - set the global rate limiter options
 *
 * @param options - Only the following values are recognized:
 *    startTime: a timestamp of the form returned by (new Date()).getTime()
 *    maxItems: the maximum items
 *    itemsPerMinute: the max number of items to send in a given minute
 */
RateLimiter.prototype.configureGlobal = function(options) {
  if (options.startTime !== undefined) {
    RateLimiter.globalSettings.startTime = options.startTime;
  }
  if (options.maxItems !== undefined) {
    RateLimiter.globalSettings.maxItems = options.maxItems;
  }
  if (options.itemsPerMinute !== undefined) {
    RateLimiter.globalSettings.itemsPerMinute = options.itemsPerMinute;
  }
};

/*
 * shouldSend - determine if we should send a given item based on rate limit settings
 *
 * @param item - the item we are about to send
 * @returns An object with the following structure:
 *  error: (Error|null)
 *  shouldSend: bool
 *  payload: (Object|null)
 *  If shouldSend is false, the item passed as a parameter should not be sent to Rollbar, and
 *  exactly one of error or payload will be non-null. If error is non-null, the returned Error will
 *  describe the situation, but it means that we were already over a rate limit (either globally or
 *  per minute) when this item was checked. If error is null, and therefore payload is non-null, it
 *  means this item put us over the global rate limit and the payload should be sent to Rollbar in
 *  place of the passed in item.
 */
RateLimiter.prototype.shouldSend = function(item, now) {
  now = now || _.now();
  var elapsedTime = now - this.startTime;
  if (elapsedTime < 0 || elapsedTime >= 60000) {
    this.startTime = now;
    this.perMinCounter = 0;
  }

  var globalRateLimit = RateLimiter.globalSettings.maxItems;
  var globalRateLimitPerMin = RateLimiter.globalSettings.itemsPerMinute;

  if (checkRate(item, globalRateLimit, this.counter)) {
    return shouldSendValue(this.platform, this.platformOptions, globalRateLimit + ' max items reached', false);
  } else if (checkRate(item, globalRateLimitPerMin, this.perMinCounter)) {
    return shouldSendValue(this.platform, this.platformOptions, globalRateLimitPerMin + ' items per minute reached', false);
  }
  this.counter++;
  this.perMinCounter++;

  var shouldSend = !checkRate(item, globalRateLimit, this.counter);
  var perMinute = shouldSend;
  shouldSend = shouldSend && !checkRate(item, globalRateLimitPerMin, this.perMinCounter);
  return shouldSendValue(this.platform, this.platformOptions, null, shouldSend, globalRateLimit, globalRateLimitPerMin, perMinute);
};

RateLimiter.prototype.setPlatformOptions = function(platform, options) {
  this.platform = platform;
  this.platformOptions = options;
};

/* Helpers */

function checkRate(item, limit, counter) {
  return !item.ignoreRateLimit && limit >= 1 && counter > limit;
}

function shouldSendValue(platform, options, error, shouldSend, globalRateLimit, limitPerMin, perMinute) {
  var payload = null;
  if (error) {
    error = new Error(error);
  }
  if (!error && !shouldSend) {
    payload = rateLimitPayload(platform, options, globalRateLimit, limitPerMin, perMinute);
  }
  return {error: error, shouldSend: shouldSend, payload: payload};
}

function rateLimitPayload(platform, options, globalRateLimit, limitPerMin, perMinute) {
  var environment = options.environment || (options.payload && options.payload.environment);
  var msg;
  if (perMinute) {
    msg = 'item per minute limit reached, ignoring errors until timeout';
  } else {
    msg = 'maxItems has been hit, ignoring errors until reset.';
  }
  var item = {
    body: {
      message: {
        body: msg,
        extra: {
          maxItems: globalRateLimit,
          itemsPerMinute: limitPerMin
        }
      }
    },
    language: 'javascript',
    environment: environment,
    notifier: {
      version: (options.notifier && options.notifier.version) || options.version
    }
  };
  if (platform === 'browser') {
    item.platform = 'browser';
    item.framework = 'browser-js';
    item.notifier.name = 'rollbar-browser-js';
  } else if (platform === 'server') {
    item.framework = options.framework || 'node-js';
    item.notifier.name = options.notifier.name;
  } else if (platform === 'react-native') {
    item.framework = options.framework || 'react-native';
    item.notifier.name = options.notifier.name;
  }
  return item;
}

module.exports = RateLimiter;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

var merge = __webpack_require__(85);

var RollbarJSON = {};
var __initRollbarJSON = false;
function setupJSON() {
  if (__initRollbarJSON) {
    return;
  }
  __initRollbarJSON = true;

  if (isDefined(JSON)) {
    if (isNativeFunction(JSON.stringify)) {
      RollbarJSON.stringify = JSON.stringify;
    }
    if (isNativeFunction(JSON.parse)) {
      RollbarJSON.parse = JSON.parse;
    }
  }
  if (!isFunction(RollbarJSON.stringify) || !isFunction(RollbarJSON.parse)) {
    var setupCustomJSON = __webpack_require__(86);
    setupCustomJSON(RollbarJSON);
  }
}
setupJSON();

/*
 * isType - Given a Javascript value and a string, returns true if the type of the value matches the
 * given string.
 *
 * @param x - any value
 * @param t - a lowercase string containing one of the following type names:
 *    - undefined
 *    - null
 *    - error
 *    - number
 *    - boolean
 *    - string
 *    - symbol
 *    - function
 *    - object
 *    - array
 * @returns true if x is of type t, otherwise false
 */
function isType(x, t) {
  return t === typeName(x);
}

/*
 * typeName - Given a Javascript value, returns the type of the object as a string
 */
function typeName(x) {
  var name = typeof x;
  if (name !== 'object') {
    return name;
  }
  if (!x) {
    return 'null';
  }
  if (x instanceof Error) {
    return 'error';
  }
  return ({}).toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

/* isFunction - a convenience function for checking if a value is a function
 *
 * @param f - any value
 * @returns true if f is a function, otherwise false
 */
function isFunction(f) {
  return isType(f, 'function');
}

/* isNativeFunction - a convenience function for checking if a value is a native JS function
 *
 * @param f - any value
 * @returns true if f is a native JS function, otherwise false
 */
function isNativeFunction(f) {
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var funcMatchString = Function.prototype.toString.call(Object.prototype.hasOwnProperty)
    .replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?');
  var reIsNative = RegExp('^' + funcMatchString + '$');
  return isObject(f) && reIsNative.test(f);
}

/* isObject - Checks if the argument is an object
 *
 * @param value - any value
 * @returns true is value is an object function is an object)
*/
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/*
 * isDefined - a convenience function for checking if a value is not equal to undefined
 *
 * @param u - any value
 * @returns true if u is anything other than undefined
 */
function isDefined(u) {
  return !isType(u, 'undefined');
}

/*
 * isIterable - convenience function for checking if a value can be iterated, essentially
 * whether it is an object or an array.
 *
 * @param i - any value
 * @returns true if i is an object or an array as determined by `typeName`
 */
function isIterable(i) {
  var type = typeName(i);
  return (type === 'object' || type === 'array');
}

/*
 * isError - convenience function for checking if a value is of an error type
 *
 * @param e - any value
 * @returns true if e is an error
 */
function isError(e) {
  // Detect both Error and Firefox Exception type
  return isType(e, 'error') || isType(e, 'exception');
}

function traverse(obj, func, seen) {
  var k, v, i;
  var isObj = isType(obj, 'object');
  var isArray = isType(obj, 'array');
  var keys = [];

  if (isObj && seen.indexOf(obj) !== -1) {
    return obj;
  }
  seen.push(obj);

  if (isObj) {
    for (k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        keys.push(k);
      }
    }
  } else if (isArray) {
    for (i = 0; i < obj.length; ++i) {
      keys.push(i);
    }
  }

  var result = isObj ? {} : [];
  var same = true;
  for (i = 0; i < keys.length; ++i) {
    k = keys[i];
    v = obj[k];
    result[k] = func(k, v, seen);
    same = same && result[k] === obj[k];
  }

  return (keys.length != 0 && !same) ? result : obj;
}

function redact() {
  return '********';
}

// from http://stackoverflow.com/a/8809472/1138191
function uuid4() {
  var d = now();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
}

var LEVELS = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
  critical: 4
};

function sanitizeUrl(url) {
  var baseUrlParts = parseUri(url);
  if (!baseUrlParts) {
    return '(unknown)';
  }

  // remove a trailing # if there is no anchor
  if (baseUrlParts.anchor === '') {
    baseUrlParts.source = baseUrlParts.source.replace('#', '');
  }

  url = baseUrlParts.source.replace('?' + baseUrlParts.query, '');
  return url;
}

var parseUriOptions = {
  strictMode: false,
  key: [
    'source',
    'protocol',
    'authority',
    'userInfo',
    'user',
    'password',
    'host',
    'port',
    'relative',
    'path',
    'directory',
    'file',
    'query',
    'anchor'
  ],
  q: {
    name: 'queryKey',
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

function parseUri(str) {
  if (!isType(str, 'string')) {
    return undefined;
  }

  var o = parseUriOptions;
  var m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str);
  var uri = {};

  for (var i = 0, l = o.key.length; i < l; ++i) {
    uri[o.key[i]] = m[i] || '';
  }

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) {
      uri[o.q.name][$1] = $2;
    }
  });

  return uri;
}

function addParamsAndAccessTokenToPath(accessToken, options, params) {
  params = params || {};
  params.access_token = accessToken;
  var paramsArray = [];
  var k;
  for (k in params) {
    if (Object.prototype.hasOwnProperty.call(params, k)) {
      paramsArray.push([k, params[k]].join('='));
    }
  }
  var query = '?' + paramsArray.sort().join('&');

  options = options || {};
  options.path = options.path || '';
  var qs = options.path.indexOf('?');
  var h = options.path.indexOf('#');
  var p;
  if (qs !== -1 && (h === -1 || h > qs)) {
    p = options.path;
    options.path = p.substring(0,qs) + query + '&' + p.substring(qs+1);
  } else {
    if (h !== -1) {
      p = options.path;
      options.path = p.substring(0,h) + query + p.substring(h);
    } else {
      options.path = options.path + query;
    }
  }
}

function formatUrl(u, protocol) {
  protocol = protocol || u.protocol;
  if (!protocol && u.port) {
    if (u.port === 80) {
      protocol = 'http:';
    } else if (u.port === 443) {
      protocol = 'https:';
    }
  }
  protocol = protocol || 'https:';

  if (!u.hostname) {
    return null;
  }
  var result = protocol + '//' + u.hostname;
  if (u.port) {
    result = result + ':' + u.port;
  }
  if (u.path) {
    result = result + u.path;
  }
  return result;
}

function stringify(obj, backup) {
  var value, error;
  try {
    value = RollbarJSON.stringify(obj);
  } catch (jsonError) {
    if (backup && isFunction(backup)) {
      try {
        value = backup(obj);
      } catch (backupError) {
        error = backupError;
      }
    } else {
      error = jsonError;
    }
  }
  return {error: error, value: value};
}

function jsonParse(s) {
  var value, error;
  try {
    value = RollbarJSON.parse(s);
  } catch (e) {
    error = e;
  }
  return {error: error, value: value};
}

function makeUnhandledStackInfo(
  message,
  url,
  lineno,
  colno,
  error,
  mode,
  backupMessage,
  errorParser
) {
  var location = {
    url: url || '',
    line: lineno,
    column: colno
  };
  location.func = errorParser.guessFunctionName(location.url, location.line);
  location.context = errorParser.gatherContext(location.url, location.line);
  var href = document && document.location && document.location.href;
  var useragent = window && window.navigator && window.navigator.userAgent;
  return {
    'mode': mode,
    'message': error ? String(error) : (message || backupMessage),
    'url': href,
    'stack': [location],
    'useragent': useragent
  };
}

function wrapCallback(logger, f) {
  return function(err, resp) {
    try {
      f(err, resp);
    } catch (e) {
      logger.error(e);
    }
  };
}

function createItem(args, logger, notifier, requestKeys, lambdaContext) {
  var message, err, custom, callback, request;
  var arg;
  var extraArgs = [];

  for (var i = 0, l = args.length; i < l; ++i) {
    arg = args[i];

    var typ = typeName(arg);
    switch (typ) {
      case 'undefined':
        break;
      case 'string':
        message ? extraArgs.push(arg) : message = arg;
        break;
      case 'function':
        callback = wrapCallback(logger, arg);
        break;
      case 'date':
        extraArgs.push(arg);
        break;
      case 'error':
      case 'domexception':
      case 'exception': // Firefox Exception type
        err ? extraArgs.push(arg) : err = arg;
        break;
      case 'object':
      case 'array':
        if (arg instanceof Error || (typeof DOMException !== 'undefined' && arg instanceof DOMException)) {
          err ? extraArgs.push(arg) : err = arg;
          break;
        }
        if (requestKeys && typ === 'object' && !request) {
          for (var j = 0, len = requestKeys.length; j < len; ++j) {
            if (arg[requestKeys[j]] !== undefined) {
              request = arg;
              break;
            }
          }
          if (request) {
            break;
          }
        }
        custom ? extraArgs.push(arg) : custom = arg;
        break;
      default:
        if (arg instanceof Error || (typeof DOMException !== 'undefined' && arg instanceof DOMException)) {
          err ? extraArgs.push(arg) : err = arg;
          break;
        }
        extraArgs.push(arg);
    }
  }

  if (extraArgs.length > 0) {
    // if custom is an array this turns it into an object with integer keys
    custom = merge(custom);
    custom.extraArgs = extraArgs;
  }

  var item = {
    message: message,
    err: err,
    custom: custom,
    timestamp: now(),
    callback: callback,
    uuid: uuid4()
  };
  if (custom && custom.level !== undefined) {
    item.level = custom.level;
    delete custom.level;
  }
  if (requestKeys && request) {
    item.request = request;
  }
  if (lambdaContext) {
    item.lambdaContext = lambdaContext;
  }
  item._originalArgs = args;
  return item;
}

var TELEMETRY_TYPES = ['log', 'network', 'dom', 'navigation', 'error', 'manual'];
var TELEMETRY_LEVELS = ['critical', 'error', 'warning', 'info', 'debug'];

function arrayIncludes(arr, val) {
  for (var k = 0; k < arr.length; ++k) {
    if (arr[k] === val) {
      return true;
    }
  }

  return false;
}

function createTelemetryEvent(args) {
  var type, metadata, level;
  var arg;

  for (var i = 0, l = args.length; i < l; ++i) {
    arg = args[i];

    var typ = typeName(arg);
    switch (typ) {
      case 'string':
        if (arrayIncludes(TELEMETRY_TYPES, arg)) {
          type = arg;
        } else if (arrayIncludes(TELEMETRY_LEVELS, arg)) {
          level = arg;
        }
        break;
      case 'object':
        metadata = arg;
        break;
      default:
        break;
    }
  }
  var event = {
    type: type || 'manual',
    metadata: metadata || {},
    level: level
  };

  return event;
}

/*
 * get - given an obj/array and a keypath, return the value at that keypath or
 *       undefined if not possible.
 *
 * @param obj - an object or array
 * @param path - a string of keys separated by '.' such as 'plugin.jquery.0.message'
 *    which would correspond to 42 in `{plugin: {jquery: [{message: 42}]}}`
 */
function get(obj, path) {
  if (!obj) {
    return undefined;
  }
  var keys = path.split('.');
  var result = obj;
  try {
    for (var i = 0, len = keys.length; i < len; ++i) {
      result = result[keys[i]];
    }
  } catch (e) {
    result = undefined;
  }
  return result;
}

function set(obj, path, value) {
  if (!obj) {
    return;
  }
  var keys = path.split('.');
  var len = keys.length;
  if (len < 1) {
    return;
  }
  if (len === 1) {
    obj[keys[0]] = value;
    return;
  }
  try {
    var temp = obj[keys[0]] || {};
    var replacement = temp;
    for (var i = 1; i < len - 1; ++i) {
      temp[keys[i]] = temp[keys[i]] || {};
      temp = temp[keys[i]];
    }
    temp[keys[len-1]] = value;
    obj[keys[0]] = replacement;
  } catch (e) {
    return;
  }
}

function scrub(data, scrubFields) {
  scrubFields = scrubFields || [];
  var paramRes = _getScrubFieldRegexs(scrubFields);
  var queryRes = _getScrubQueryParamRegexs(scrubFields);

  function redactQueryParam(dummy0, paramPart) {
    return paramPart + redact();
  }

  function paramScrubber(v) {
    var i;
    if (isType(v, 'string')) {
      for (i = 0; i < queryRes.length; ++i) {
        v = v.replace(queryRes[i], redactQueryParam);
      }
    }
    return v;
  }

  function valScrubber(k, v) {
    var i;
    for (i = 0; i < paramRes.length; ++i) {
      if (paramRes[i].test(k)) {
        v = redact();
        break;
      }
    }
    return v;
  }

  function scrubber(k, v, seen) {
    var tmpV = valScrubber(k, v);
    if (tmpV === v) {
      if (isType(v, 'object') || isType(v, 'array')) {
        return traverse(v, scrubber, seen);
      }
      return paramScrubber(tmpV);
    } else {
      return tmpV;
    }
  }

  return traverse(data, scrubber, []);
}

function _getScrubFieldRegexs(scrubFields) {
  var ret = [];
  var pat;
  for (var i = 0; i < scrubFields.length; ++i) {
    pat = '^\\[?(%5[bB])?' + scrubFields[i] + '\\[?(%5[bB])?\\]?(%5[dD])?$';
    ret.push(new RegExp(pat, 'i'));
  }
  return ret;
}


function _getScrubQueryParamRegexs(scrubFields) {
  var ret = [];
  var pat;
  for (var i = 0; i < scrubFields.length; ++i) {
    pat = '\\[?(%5[bB])?' + scrubFields[i] + '\\[?(%5[bB])?\\]?(%5[dD])?';
    ret.push(new RegExp('(' + pat + '=)([^&\\n]+)', 'igm'));
  }
  return ret;
}

function formatArgsAsString(args) {
  var i, len, arg;
  var result = [];
  for (i = 0, len = args.length; i < len; ++i) {
    arg = args[i];
    switch (typeName(arg)) {
      case 'object':
        arg = stringify(arg);
        arg = arg.error || arg.value;
        if (arg.length > 500) {
          arg = arg.substr(0, 497) + '...';
        }
        break;
      case 'null':
        arg = 'null';
        break;
      case 'undefined':
        arg = 'undefined';
        break;
      case 'symbol':
        arg = arg.toString();
        break;
    }
    result.push(arg);
  }
  return result.join(' ');
}

function now() {
  if (Date.now) {
    return +Date.now();
  }
  return +new Date();
}

function filterIp(requestData, captureIp) {
  if (!requestData || !requestData['user_ip'] || captureIp === true) {
    return;
  }
  var newIp = requestData['user_ip'];
  if (!captureIp) {
    newIp = null;
  } else {
    try {
      var parts;
      if (newIp.indexOf('.') !== -1) {
        parts = newIp.split('.');
        parts.pop();
        parts.push('0');
        newIp = parts.join('.');
      } else if (newIp.indexOf(':') !== -1) {
        parts = newIp.split(':');
        if (parts.length > 2) {
          var beginning = parts.slice(0, 3);
          var slashIdx = beginning[2].indexOf('/');
          if (slashIdx !== -1) {
            beginning[2] = beginning[2].substring(0, slashIdx);
          }
          var terminal = '0000:0000:0000:0000:0000';
          newIp = beginning.concat(terminal).join(':');
        }
      } else {
        newIp = null;
      }
    } catch (e) {
      newIp = null;
    }
  }
  requestData['user_ip'] = newIp;
}

function handleOptions(current, input, payload) {
  var result = merge(current, input, payload);
  if (!input || input.overwriteScrubFields) {
    return result;
  }
  if (input.scrubFields) {
    result.scrubFields = (current.scrubFields || []).concat(input.scrubFields);
  }
  return result;
}

module.exports = {
  addParamsAndAccessTokenToPath: addParamsAndAccessTokenToPath,
  createItem: createItem,
  createTelemetryEvent: createTelemetryEvent,
  filterIp: filterIp,
  formatArgsAsString: formatArgsAsString,
  formatUrl: formatUrl,
  get: get,
  handleOptions: handleOptions,
  isError: isError,
  isFunction: isFunction,
  isIterable: isIterable,
  isNativeFunction: isNativeFunction,
  isType: isType,
  jsonParse: jsonParse,
  LEVELS: LEVELS,
  makeUnhandledStackInfo: makeUnhandledStackInfo,
  merge: merge,
  now: now,
  redact: redact,
  sanitizeUrl: sanitizeUrl,
  scrub: scrub,
  set: set,
  stringify: stringify,
  traverse: traverse,
  typeName: typeName,
  uuid4: uuid4
};


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

function merge() {
  var i, src, copy, clone, name,
      result = {},
     current = null,
      length = arguments.length;

  for (i=0; i < length; i++) {
    current = arguments[i];
    if (current == null) {
      continue;
    }

    for (name in current) {
      src = result[name];
      copy = current[name];
      if (result !== copy) {
        if (copy && isPlainObject(copy)) {
          clone = src && isPlainObject(src) ? src : {};
          result[name] = merge(clone, copy);
        } else if (typeof copy !== 'undefined') {
          result[name] = copy;
        }
      }
    }
  }
  return result;
}

module.exports = merge;


/***/ }),
/* 86 */
/***/ (function(module, exports) {

//  json3.js
//  2017-02-21
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
//  See http://www.JSON.org/js.html
//  This code should be minified before deployment.
//  See http://javascript.crockford.com/jsmin.html

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.
//          This has been modified to use JSON-js/json_parse_state.js as the
//          parser instead of the one built around eval found in JSON-js/json2.js

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
//                          +a[5], +a[6]));
//                  }
//              }
//              return value;
//          });

//          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
//              var d;
//              if (typeof value === "string" &&
//                      value.slice(0, 5) === "Date(" &&
//                      value.slice(-1) === ")") {
//                  d = new Date(value.slice(5, -1));
//                  if (d) {
//                      return d;
//                  }
//              }
//              return value;
//          });

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
  for, this
  */

/*property
  JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
  getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
  lastIndex, length, parse, prototype, push, replace, slice, stringify,
  test, toJSON, toString, valueOf
  */

var setupCustomJSON = function(JSON) {

  var rx_one = /^[\],:{}\s]*$/;
  var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
  var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
  var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  function f(n) {
    // Format integers to have at least two digits.
    return n < 10
      ? "0" + n
      : n;
  }

  function this_value() {
    return this.valueOf();
  }

  if (typeof Date.prototype.toJSON !== "function") {

    Date.prototype.toJSON = function () {

      return isFinite(this.valueOf())
        ? this.getUTCFullYear() + "-" +
        f(this.getUTCMonth() + 1) + "-" +
        f(this.getUTCDate()) + "T" +
        f(this.getUTCHours()) + ":" +
        f(this.getUTCMinutes()) + ":" +
        f(this.getUTCSeconds()) + "Z"
        : null;
    };

    Boolean.prototype.toJSON = this_value;
    Number.prototype.toJSON = this_value;
    String.prototype.toJSON = this_value;
  }

  var gap;
  var indent;
  var meta;
  var rep;


  function quote(string) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

    rx_escapable.lastIndex = 0;
    return rx_escapable.test(string)
      ? "\"" + string.replace(rx_escapable, function (a) {
        var c = meta[a];
        return typeof c === "string"
          ? c
          : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
      }) + "\""
    : "\"" + string + "\"";
  }


  function str(key, holder) {

    // Produce a string from holder[key].

    var i;          // The loop counter.
    var k;          // The member key.
    var v;          // The member value.
    var length;
    var mind = gap;
    var partial;
    var value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === "object" &&
        typeof value.toJSON === "function") {
      value = value.toJSON(key);
    }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

    if (typeof rep === "function") {
      value = rep.call(holder, key, value);
    }

    // What happens next depends on the value's type.

    switch (typeof value) {
      case "string":
        return quote(value);

      case "number":

        // JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(value)
          ? String(value)
          : "null";

      case "boolean":
      case "null":

        // If the value is a boolean or null, convert it to a string. Note:
        // typeof null does not produce "null". The case is included here in
        // the remote chance that this gets fixed someday.

        return String(value);

        // If the type is "object", we might be dealing with an object or an array or
        // null.

      case "object":

        // Due to a specification blunder in ECMAScript, typeof null is "object",
        // so watch out for that case.

        if (!value) {
          return "null";
        }

        // Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

        // Is the value an array?

        if (Object.prototype.toString.apply(value) === "[object Array]") {

          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || "null";
          }

          // Join all of the elements together, separated with commas, and wrap them in
          // brackets.

          v = partial.length === 0
            ? "[]"
            : gap
            ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
            : "[" + partial.join(",") + "]";
          gap = mind;
          return v;
        }

        // If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === "object") {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === "string") {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (
                      gap
                      ? ": "
                      : ":"
                      ) + v);
              }
            }
          }
        } else {

          // Otherwise, iterate through all of the keys in the object.

          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (
                      gap
                      ? ": "
                      : ":"
                      ) + v);
              }
            }
          }
        }

        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0
          ? "{}"
          : gap
          ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
          : "{" + partial.join(",") + "}";
        gap = mind;
        return v;
    }
  }

  // If the JSON object does not yet have a stringify method, give it one.

  if (typeof JSON.stringify !== "function") {
    meta = {    // table of character substitutions
      "\b": "\\b",
      "\t": "\\t",
      "\n": "\\n",
      "\f": "\\f",
      "\r": "\\r",
      "\"": "\\\"",
      "\\": "\\\\"
    };
    JSON.stringify = function (value, replacer, space) {

      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.

      var i;
      gap = "";
      indent = "";

      // If the space parameter is a number, make an indent string containing that
      // many spaces.

      if (typeof space === "number") {
        for (i = 0; i < space; i += 1) {
          indent += " ";
        }

        // If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === "string") {
        indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== "function" &&
          (typeof replacer !== "object" ||
           typeof replacer.length !== "number")) {
        throw new Error("JSON.stringify");
      }

      // Make a fake root object containing our value under the key of "".
      // Return the result of stringifying the value.

      return str("", {"": value});
    };
  }


  // If the JSON object does not yet have a parse method, give it one.

  if (typeof JSON.parse !== "function") {
    JSON.parse = (function () {

      // This function creates a JSON parse function that uses a state machine rather
      // than the dangerous eval function to parse a JSON text.

      var state;      // The state of the parser, one of
      // 'go'         The starting state
      // 'ok'         The final, accepting state
      // 'firstokey'  Ready for the first key of the object or
      //              the closing of an empty object
      // 'okey'       Ready for the next key of the object
      // 'colon'      Ready for the colon
      // 'ovalue'     Ready for the value half of a key/value pair
      // 'ocomma'     Ready for a comma or closing }
      // 'firstavalue' Ready for the first value of an array or
      //              an empty array
      // 'avalue'     Ready for the next value of an array
      // 'acomma'     Ready for a comma or closing ]
      var stack;      // The stack, for controlling nesting.
      var container;  // The current container object or array
      var key;        // The current key
      var value;      // The current value
      var escapes = { // Escapement translation table
        "\\": "\\",
        "\"": "\"",
        "/": "/",
        "t": "\t",
        "n": "\n",
        "r": "\r",
        "f": "\f",
        "b": "\b"
      };
      var string = {   // The actions for string tokens
        go: function () {
          state = "ok";
        },
        firstokey: function () {
          key = value;
          state = "colon";
        },
        okey: function () {
          key = value;
          state = "colon";
        },
        ovalue: function () {
          state = "ocomma";
        },
        firstavalue: function () {
          state = "acomma";
        },
        avalue: function () {
          state = "acomma";
        }
      };
      var number = {   // The actions for number tokens
        go: function () {
          state = "ok";
        },
        ovalue: function () {
          state = "ocomma";
        },
        firstavalue: function () {
          state = "acomma";
        },
        avalue: function () {
          state = "acomma";
        }
      };
      var action = {

        // The action table describes the behavior of the machine. It contains an
        // object for each token. Each object contains a method that is called when
        // a token is matched in a state. An object will lack a method for illegal
        // states.

        "{": {
          go: function () {
            stack.push({state: "ok"});
            container = {};
            state = "firstokey";
          },
          ovalue: function () {
            stack.push({container: container, state: "ocomma", key: key});
            container = {};
            state = "firstokey";
          },
          firstavalue: function () {
            stack.push({container: container, state: "acomma"});
            container = {};
            state = "firstokey";
          },
          avalue: function () {
            stack.push({container: container, state: "acomma"});
            container = {};
            state = "firstokey";
          }
        },
        "}": {
          firstokey: function () {
            var pop = stack.pop();
            value = container;
            container = pop.container;
            key = pop.key;
            state = pop.state;
          },
          ocomma: function () {
            var pop = stack.pop();
            container[key] = value;
            value = container;
            container = pop.container;
            key = pop.key;
            state = pop.state;
          }
        },
        "[": {
          go: function () {
            stack.push({state: "ok"});
            container = [];
            state = "firstavalue";
          },
          ovalue: function () {
            stack.push({container: container, state: "ocomma", key: key});
            container = [];
            state = "firstavalue";
          },
          firstavalue: function () {
            stack.push({container: container, state: "acomma"});
            container = [];
            state = "firstavalue";
          },
          avalue: function () {
            stack.push({container: container, state: "acomma"});
            container = [];
            state = "firstavalue";
          }
        },
        "]": {
          firstavalue: function () {
            var pop = stack.pop();
            value = container;
            container = pop.container;
            key = pop.key;
            state = pop.state;
          },
          acomma: function () {
            var pop = stack.pop();
            container.push(value);
            value = container;
            container = pop.container;
            key = pop.key;
            state = pop.state;
          }
        },
        ":": {
          colon: function () {
            if (Object.hasOwnProperty.call(container, key)) {
              throw new SyntaxError("Duplicate key '" + key + "\"");
            }
            state = "ovalue";
          }
        },
        ",": {
          ocomma: function () {
            container[key] = value;
            state = "okey";
          },
          acomma: function () {
            container.push(value);
            state = "avalue";
          }
        },
        "true": {
          go: function () {
            value = true;
            state = "ok";
          },
          ovalue: function () {
            value = true;
            state = "ocomma";
          },
          firstavalue: function () {
            value = true;
            state = "acomma";
          },
          avalue: function () {
            value = true;
            state = "acomma";
          }
        },
        "false": {
          go: function () {
            value = false;
            state = "ok";
          },
          ovalue: function () {
            value = false;
            state = "ocomma";
          },
          firstavalue: function () {
            value = false;
            state = "acomma";
          },
          avalue: function () {
            value = false;
            state = "acomma";
          }
        },
        "null": {
          go: function () {
            value = null;
            state = "ok";
          },
          ovalue: function () {
            value = null;
            state = "ocomma";
          },
          firstavalue: function () {
            value = null;
            state = "acomma";
          },
          avalue: function () {
            value = null;
            state = "acomma";
          }
        }
      };

      function debackslashify(text) {

        // Remove and replace any backslash escapement.

        return text.replace(/\\(?:u(.{4})|([^u]))/g, function (ignore, b, c) {
          return b
            ? String.fromCharCode(parseInt(b, 16))
            : escapes[c];
        });
      }

      return function (source, reviver) {

        // A regular expression is used to extract tokens from the JSON text.
        // The extraction process is cautious.

        var result;
        var tx = /^[\u0020\t\n\r]*(?:([,:\[\]{}]|true|false|null)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|"((?:[^\r\n\t\\\"]|\\(?:["\\\/trnfb]|u[0-9a-fA-F]{4}))*)")/;

        // Set the starting state.

        state = "go";

        // The stack records the container, key, and state for each object or array
        // that contains another object or array while processing nested structures.

        stack = [];

        // If any error occurs, we will catch it and ultimately throw a syntax error.

        try {

          // For each token...

          while (true) {
            result = tx.exec(source);
            if (!result) {
              break;
            }

            // result is the result array from matching the tokenizing regular expression.
            //  result[0] contains everything that matched, including any initial whitespace.
            //  result[1] contains any punctuation that was matched, or true, false, or null.
            //  result[2] contains a matched number, still in string form.
            //  result[3] contains a matched string, without quotes but with escapement.

            if (result[1]) {

              // Token: Execute the action for this state and token.

              action[result[1]][state]();

            } else if (result[2]) {

              // Number token: Convert the number string into a number value and execute
              // the action for this state and number.

              value = +result[2];
              number[state]();
            } else {

              // String token: Replace the escapement sequences and execute the action for
              // this state and string.

              value = debackslashify(result[3]);
              string[state]();
            }

            // Remove the token from the string. The loop will continue as long as there
            // are tokens. This is a slow process, but it allows the use of ^ matching,
            // which assures that no illegal tokens slip through.

            source = source.slice(result[0].length);
          }

          // If we find a state/token combination that is illegal, then the action will
          // cause an error. We handle the error by simply changing the state.

        } catch (e) {
          state = e;
        }

        // The parsing is finished. If we are not in the final "ok" state, or if the
        // remaining source contains anything except whitespace, then we did not have
        //a well-formed JSON text.

        if (state !== "ok" || (/[^\u0020\t\n\r]/.test(source))) {
          throw (state instanceof SyntaxError)
            ? state
            : new SyntaxError("JSON");
        }

        // If there is a reviver function, we recursively walk the new structure,
        // passing each name/value pair to the reviver function for possible
        // transformation, starting with a temporary root object that holds the current
        // value in an empty key. If there is not a reviver function, we simply return
        // that value.

        return (typeof reviver === "function")
          ? (function walk(holder, key) {
            var k;
            var v;
            var val = holder[key];
            if (val && typeof val === "object") {
              for (k in value) {
                if (Object.prototype.hasOwnProperty.call(val, k)) {
                  v = walk(val, k);
                  if (v !== undefined) {
                    val[k] = v;
                  } else {
                    delete val[k];
                  }
                }
              }
            }
            return reviver.call(holder, key, val);
          }({"": value}, ""))
        : value;
      };
    }());
  }
}

module.exports = setupCustomJSON;


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);

/*
 * Queue - an object which handles which handles a queue of items to be sent to Rollbar.
 *   This object handles rate limiting via a passed in rate limiter, retries based on connection
 *   errors, and filtering of items based on a set of configurable predicates. The communication to
 *   the backend is performed via a given API object.
 *
 * @param rateLimiter - An object which conforms to the interface
 *    rateLimiter.shouldSend(item) -> bool
 * @param api - An object which conforms to the interface
 *    api.postItem(payload, function(err, response))
 * @param logger - An object used to log verbose messages if desired
 * @param options - see Queue.prototype.configure
 */
function Queue(rateLimiter, api, logger, options) {
  this.rateLimiter = rateLimiter;
  this.api = api;
  this.logger = logger;
  this.options = options;
  this.predicates = [];
  this.pendingItems = [];
  this.pendingRequests = [];
  this.retryQueue = [];
  this.retryHandle = null;
  this.waitCallback = null;
  this.waitIntervalID = null;
}

/*
 * configure - updates the options this queue uses
 *
 * @param options
 */
Queue.prototype.configure = function(options) {
  this.api && this.api.configure(options);
  var oldOptions = this.options;
  this.options = _.merge(oldOptions, options);
  return this;
};

/*
 * addPredicate - adds a predicate to the end of the list of predicates for this queue
 *
 * @param predicate - function(item, options) -> (bool|{err: Error})
 *  Returning true means that this predicate passes and the item is okay to go on the queue
 *  Returning false means do not add the item to the queue, but it is not an error
 *  Returning {err: Error} means do not add the item to the queue, and the given error explains why
 *  Returning {err: undefined} is equivalent to returning true but don't do that
 */
Queue.prototype.addPredicate = function(predicate) {
  if (_.isFunction(predicate)) {
    this.predicates.push(predicate);
  }
  return this;
};

Queue.prototype.addPendingItem = function(item) {
  this.pendingItems.push(item);
};

Queue.prototype.removePendingItem = function(item) {
  var idx = this.pendingItems.indexOf(item);
  if (idx !== -1) {
    this.pendingItems.splice(idx, 1);
  }
};

/*
 * addItem - Send an item to the Rollbar API if all of the predicates are satisfied
 *
 * @param item - The payload to send to the backend
 * @param callback - function(error, repsonse) which will be called with the response from the API
 *  in the case of a success, otherwise response will be null and error will have a value. If both
 *  error and response are null then the item was stopped by a predicate which did not consider this
 *  to be an error condition, but nonetheless did not send the item to the API.
 *  @param originalError - The original error before any transformations that is to be logged if any
 */
Queue.prototype.addItem = function(item, callback, originalError, originalItem) {
  if (!callback || !_.isFunction(callback)) {
    callback = function() { return; };
  }
  var predicateResult = this._applyPredicates(item);
  if (predicateResult.stop) {
    this.removePendingItem(originalItem);
    callback(predicateResult.err);
    return;
  }
  this._maybeLog(item, originalError);
  this.removePendingItem(originalItem);
  this.pendingRequests.push(item);
  try {
    this._makeApiRequest(item, function(err, resp) {
      this._dequeuePendingRequest(item);
      callback(err, resp);
    }.bind(this));
  } catch (e) {
    this._dequeuePendingRequest(item);
    callback(e);
  }
};

/*
 * wait - Stop any further errors from being added to the queue, and get called back when all items
 *   currently processing have finished sending to the backend.
 *
 * @param callback - function() called when all pending items have been sent
 */
Queue.prototype.wait = function(callback) {
  if (!_.isFunction(callback)) {
    return;
  }
  this.waitCallback = callback;
  if (this._maybeCallWait()) {
    return;
  }
  if (this.waitIntervalID) {
    this.waitIntervalID = clearInterval(this.waitIntervalID);
  }
  this.waitIntervalID = setInterval(function() {
    this._maybeCallWait();
  }.bind(this), 500);
};

/* _applyPredicates - Sequentially applies the predicates that have been added to the queue to the
 *   given item with the currently configured options.
 *
 * @param item - An item in the queue
 * @returns {stop: bool, err: (Error|null)} - stop being true means do not add item to the queue,
 *   the error value should be passed up to a callbak if we are stopping.
 */
Queue.prototype._applyPredicates = function(item) {
  var p = null;
  for (var i = 0, len = this.predicates.length; i < len; i++) {
    p = this.predicates[i](item, this.options);
    if (!p || p.err !== undefined) {
      return {stop: true, err: p.err};
    }
  }
  return {stop: false, err: null};
};

/*
 * _makeApiRequest - Send an item to Rollbar, callback when done, if there is an error make an
 *   effort to retry if we are configured to do so.
 *
 * @param item - an item ready to send to the backend
 * @param callback - function(err, response)
 */
Queue.prototype._makeApiRequest = function(item, callback) {
  var rateLimitResponse = this.rateLimiter.shouldSend(item);
  if (rateLimitResponse.shouldSend) {
    this.api.postItem(item, function(err, resp) {
      if (err) {
        this._maybeRetry(err, item, callback);
      } else {
        callback(err, resp);
      }
    }.bind(this));
  } else if (rateLimitResponse.error) {
    callback(rateLimitResponse.error);
  } else {
    this.api.postItem(rateLimitResponse.payload, callback);
  }
};

// These are errors basically mean there is no internet connection
var RETRIABLE_ERRORS = ['ECONNRESET', 'ENOTFOUND', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE', 'EAI_AGAIN'];

/*
 * _maybeRetry - Given the error returned by the API, decide if we should retry or just callback
 *   with the error.
 *
 * @param err - an error returned by the API transport
 * @param item - the item that was trying to be sent when this error occured
 * @param callback - function(err, response)
 */
Queue.prototype._maybeRetry = function(err, item, callback) {
  var shouldRetry = false;
  if (this.options.retryInterval) {
    for (var i = 0, len = RETRIABLE_ERRORS.length; i < len; i++) {
      if (err.code === RETRIABLE_ERRORS[i]) {
        shouldRetry = true;
        break;
      }
    }
  }
  if (shouldRetry) {
    this._retryApiRequest(item, callback);
  } else {
    callback(err);
  }
};

/*
 * _retryApiRequest - Add an item and a callback to a queue and possibly start a timer to process
 *   that queue based on the retryInterval in the options for this queue.
 *
 * @param item - an item that failed to send due to an error we deem retriable
 * @param callback - function(err, response)
 */
Queue.prototype._retryApiRequest = function(item, callback) {
  this.retryQueue.push({item: item, callback: callback});

  if (!this.retryHandle) {
    this.retryHandle = setInterval(function() {
      while (this.retryQueue.length) {
        var retryObject = this.retryQueue.shift();
        this._makeApiRequest(retryObject.item, retryObject.callback);
      }
    }.bind(this), this.options.retryInterval);
  }
};

/*
 * _dequeuePendingRequest - Removes the item from the pending request queue, this queue is used to
 *   enable to functionality of providing a callback that clients can pass to `wait` to be notified
 *   when the pending request queue has been emptied. This must be called when the API finishes
 *   processing this item. If a `wait` callback is configured, it is called by this function.
 *
 * @param item - the item previously added to the pending request queue
 */
Queue.prototype._dequeuePendingRequest = function(item) {
  var idx = this.pendingRequests.indexOf(item);
  if (idx !== -1) {
    this.pendingRequests.splice(idx, 1);
    this._maybeCallWait();
  }
};

Queue.prototype._maybeLog = function(data, originalError) {
  if (this.logger && this.options.verbose) {
    var message = originalError;
    message = message || _.get(data, 'body.trace.exception.message');
    message = message || _.get(data, 'body.trace_chain.0.exception.message');
    if (message) {
      this.logger.error(message);
      return;
    }
    message = _.get(data, 'body.message.body');
    if (message) {
      this.logger.log(message);
    }
  }
};

Queue.prototype._maybeCallWait = function() {
  if (_.isFunction(this.waitCallback) && this.pendingItems.length === 0 && this.pendingRequests.length === 0) {
    if (this.waitIntervalID) {
      this.waitIntervalID = clearInterval(this.waitIntervalID);
    }
    this.waitCallback();
    return true;
  }
  return false;
};

module.exports = Queue;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);

/*
 * Notifier - the internal object responsible for delegating between the client exposed API, the
 * chain of transforms necessary to turn an item into something that can be sent to Rollbar, and the
 * queue which handles the communcation with the Rollbar API servers.
 *
 * @param queue - an object that conforms to the interface: addItem(item, callback)
 * @param options - an object representing the options to be set for this notifier, this should have
 * any defaults already set by the caller
 */
function Notifier(queue, options) {
  this.queue = queue;
  this.options = options;
  this.transforms = [];
}

/*
 * configure - updates the options for this notifier with the passed in object
 *
 * @param options - an object which gets merged with the current options set on this notifier
 * @returns this
 */
Notifier.prototype.configure = function(options) {
  this.queue && this.queue.configure(options);
  var oldOptions = this.options;
  this.options = _.merge(oldOptions, options);
  return this;
};

/*
 * addTransform - adds a transform onto the end of the queue of transforms for this notifier
 *
 * @param transform - a function which takes three arguments:
 *    * item: An Object representing the data to eventually be sent to Rollbar
 *    * options: The current value of the options for this notifier
 *    * callback: function(err: (Null|Error), item: (Null|Object)) the transform must call this
 *    callback with a null value for error if it wants the processing chain to continue, otherwise
 *    with an error to terminate the processing. The item should be the updated item after this
 *    transform is finished modifying it.
 */
Notifier.prototype.addTransform = function(transform) {
  if (_.isFunction(transform)) {
    this.transforms.push(transform);
  }
  return this;
};

/*
 * log - the internal log function which applies the configured transforms and then pushes onto the
 * queue to be sent to the backend.
 *
 * @param item - An object with the following structure:
 *    message [String] - An optional string to be sent to rollbar
 *    error [Error] - An optional error
 *
 * @param callback - A function of type function(err, resp) which will be called with exactly one
 * null argument and one non-null argument. The callback will be called once, either during the
 * transform stage if an error occurs inside a transform, or in response to the communication with
 * the backend. The second argument will be the response from the backend in case of success.
 */
Notifier.prototype.log = function(item, callback) {
  if (!callback || !_.isFunction(callback)) {
    callback = function() {};
  }

  if (!this.options.enabled) {
    return callback(new Error('Rollbar is not enabled'));
  }

  this.queue.addPendingItem(item);
  var originalError = item.err;
  this._applyTransforms(item, function(err, i) {
    if (err) {
      this.queue.removePendingItem(item);
      return callback(err, null);
    }
    this.queue.addItem(i, callback, originalError, item);
  }.bind(this));
};

/* Internal */

/*
 * _applyTransforms - Applies the transforms that have been added to this notifier sequentially. See
 * `addTransform` for more information.
 *
 * @param item - An item to be transformed
 * @param callback - A function of type function(err, item) which will be called with a non-null
 * error and a null item in the case of a transform failure, or a null error and non-null item after
 * all transforms have been applied.
 */
Notifier.prototype._applyTransforms = function(item, callback) {
  var transformIndex = -1;
  var transformsLength = this.transforms.length;
  var transforms = this.transforms;
  var options = this.options;

  var cb = function(err, i) {
    if (err) {
      callback(err, null);
      return;
    }

    transformIndex++;

    if (transformIndex === transformsLength) {
      callback(null, i);
      return;
    }

    transforms[transformIndex](i, options, cb);
  };

  cb(null, item);
};

module.exports = Notifier;


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);

var MAX_EVENTS = 100;

function Telemeter(options) {
  this.queue = [];
  this.options = _.merge(options);
  var maxTelemetryEvents = this.options.maxTelemetryEvents || MAX_EVENTS;
  this.maxQueueSize = Math.max(0, Math.min(maxTelemetryEvents, MAX_EVENTS));
}

Telemeter.prototype.configure = function(options) {
  var oldOptions = this.options;
  this.options = _.merge(oldOptions, options);
  var maxTelemetryEvents = this.options.maxTelemetryEvents || MAX_EVENTS;
  var newMaxEvents = Math.max(0, Math.min(maxTelemetryEvents, MAX_EVENTS));
  var deleteCount = 0;
  if (this.maxQueueSize > newMaxEvents) {
    deleteCount = this.maxQueueSize - newMaxEvents;
  }
  this.maxQueueSize = newMaxEvents;
  this.queue.splice(0, deleteCount);
};

Telemeter.prototype.copyEvents = function() {
  var events = Array.prototype.slice.call(this.queue, 0);
  if (_.isFunction(this.options.filterTelemetry)) {
    try {
      var i = events.length;
      while (i--) {
        if (this.options.filterTelemetry(events[i])) {
          events.splice(i, 1);
        }
      }
    } catch (e) {
      this.options.filterTelemetry = null;
    }
  }
  return events;
};

Telemeter.prototype.capture = function(type, metadata, level, rollbarUUID, timestamp) {
  var e = {
    level: getLevel(type, level),
    type: type,
    timestamp_ms: timestamp || _.now(),
    body: metadata,
    source: 'client'
  };
  if (rollbarUUID) {
    e.uuid = rollbarUUID;
  }

  try {
    if (_.isFunction(this.options.filterTelemetry) && this.options.filterTelemetry(e)) {
      return false;
    }
  } catch (exc) {
    this.options.filterTelemetry = null;
  }

  this.push(e);
  return e;
};

Telemeter.prototype.captureEvent = function(type, metadata, level, rollbarUUID) {
  return this.capture(type, metadata, level, rollbarUUID);
};

Telemeter.prototype.captureError = function(err, level, rollbarUUID, timestamp) {
  var metadata = {
    message: err.message || String(err)
  };
  if (err.stack) {
    metadata.stack = err.stack;
  }
  return this.capture('error', metadata, level, rollbarUUID, timestamp);
};

Telemeter.prototype.captureLog = function(message, level, rollbarUUID, timestamp) {
  return this.capture('log', {
    message: message
  }, level, rollbarUUID, timestamp);
};

Telemeter.prototype.captureNetwork = function(metadata, subtype, rollbarUUID, requestData) {
  subtype = subtype || 'xhr';
  metadata.subtype = metadata.subtype || subtype;
  if (requestData) {
    metadata.request = requestData;
  }
  var level = this.levelFromStatus(metadata.status_code);
  return this.capture('network', metadata, level, rollbarUUID);
};

Telemeter.prototype.levelFromStatus = function(statusCode) {
  if (statusCode >= 200 && statusCode < 400) {
    return 'info';
  }
  if (statusCode === 0 || statusCode >= 400) {
    return 'error';
  }
  return 'info';
};

Telemeter.prototype.captureDom = function(subtype, element, value, checked, rollbarUUID) {
  var metadata = {
    subtype: subtype,
    element: element
  };
  if (value !== undefined) {
    metadata.value = value;
  }
  if (checked !== undefined) {
    metadata.checked = checked;
  }
  return this.capture('dom', metadata, 'info', rollbarUUID);
};

Telemeter.prototype.captureNavigation = function(from, to, rollbarUUID) {
  return this.capture('navigation', {from: from, to: to}, 'info', rollbarUUID);
};

Telemeter.prototype.captureDomContentLoaded = function(ts) {
  return this.capture('navigation', {subtype: 'DOMContentLoaded'}, 'info', undefined, ts && ts.getTime());
  /**
   * If we decide to make this a dom event instead, then use the line below:
  return this.capture('dom', {subtype: 'DOMContentLoaded'}, 'info', undefined, ts && ts.getTime());
  */
};
Telemeter.prototype.captureLoad = function(ts) {
  return this.capture('navigation', {subtype: 'load'}, 'info', undefined, ts && ts.getTime());
  /**
   * If we decide to make this a dom event instead, then use the line below:
  return this.capture('dom', {subtype: 'load'}, 'info', undefined, ts && ts.getTime());
  */
};

Telemeter.prototype.captureConnectivityChange = function(type, rollbarUUID) {
  return this.captureNetwork({change: type}, 'connectivity', rollbarUUID);
};

// Only intended to be used internally by the notifier
Telemeter.prototype._captureRollbarItem = function(item) {
  if (!this.options.includeItemsInTelemetry) {
    return;
  }
  if (item.err) {
    return this.captureError(item.err, item.level, item.uuid, item.timestamp);
  }
  if (item.message) {
    return this.captureLog(item.message, item.level, item.uuid, item.timestamp);
  }
  if (item.custom) {
    return this.capture('log', item.custom, item.level, item.uuid, item.timestamp);
  }
};

Telemeter.prototype.push = function(e) {
  this.queue.push(e);
  if (this.queue.length > this.maxQueueSize) {
    this.queue.shift();
  }
};

function getLevel(type, level) {
  if (level) {
    return level;
  }
  var defaultLevel = {
    error: 'error',
    manual: 'info'
  };
  return defaultLevel[type] || 'info';
}

module.exports = Telemeter;


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);
var helpers = __webpack_require__(91);
var truncation = __webpack_require__(92);

var defaultOptions = {
  hostname: 'api.rollbar.com',
  path: '/api/1/item/',
  search: null,
  version: '1',
  protocol: 'https:',
  port: 443
};

/**
 * Api is an object that encapsulates methods of communicating with
 * the Rollbar API.  It is a standard interface with some parts implemented
 * differently for server or browser contexts.  It is an object that should
 * be instantiated when used so it can contain non-global options that may
 * be different for another instance of RollbarApi.
 *
 * @param options {
 *    accessToken: the accessToken to use for posting items to rollbar
 *    endpoint: an alternative endpoint to send errors to
 *        must be a valid, fully qualified URL.
 *        The default is: https://api.rollbar.com/api/1/item
 *    proxy: if you wish to proxy requests provide an object
 *        with the following keys:
 *          host or hostname (required): foo.example.com
 *          port (optional): 123
 *          protocol (optional): https
 * }
 */
function Api(options, t, u, j) {
  this.options = options;
  this.transport = t;
  this.url = u;
  this.jsonBackup = j;
  this.accessToken = options.accessToken;
  this.transportOptions = _getTransport(options, u);
}

/**
 *
 * @param data
 * @param callback
 */
Api.prototype.postItem = function(data, callback) {
  var transportOptions = helpers.transportOptions(this.transportOptions, 'POST');
  var payload = helpers.buildPayload(this.accessToken, data, this.jsonBackup);
  this.transport.post(this.accessToken, transportOptions, payload, callback);
};

/**
 *
 * @param data
 * @param callback
 */
Api.prototype.buildJsonPayload = function(data, callback) {
  var payload = helpers.buildPayload(this.accessToken, data, this.jsonBackup);

  var stringifyResult = truncation.truncate(payload);
  if (stringifyResult.error) {
    if (callback) {
      callback(stringifyResult.error);
    }
    return null;
  }

  return stringifyResult.value;
};

/**
 *
 * @param jsonPayload
 * @param callback
 */
Api.prototype.postJsonPayload = function(jsonPayload, callback) {
  var transportOptions = helpers.transportOptions(this.transportOptions, 'POST');
  this.transport.postJsonPayload(this.accessToken, transportOptions, jsonPayload, callback);
};

Api.prototype.configure = function(options) {
  var oldOptions = this.oldOptions;
  this.options = _.merge(oldOptions, options);
  this.transportOptions = _getTransport(this.options, this.url);
  if (this.options.accessToken !== undefined) {
    this.accessToken = this.options.accessToken;
  }
  return this;
};

function _getTransport(options, url) {
  return helpers.getTransportFromOptions(options, defaultOptions, url);
}

module.exports = Api;


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);

function buildPayload(accessToken, data, jsonBackup) {
  if (!_.isType(data.context, 'string')) {
    var contextResult = _.stringify(data.context, jsonBackup);
    if (contextResult.error) {
      data.context = 'Error: could not serialize \'context\'';
    } else {
      data.context = contextResult.value || '';
    }
    if (data.context.length > 255) {
      data.context = data.context.substr(0, 255);
    }
  }
  return {
    access_token: accessToken,
    data: data
  };
}

function getTransportFromOptions(options, defaults, url) {
  var hostname = defaults.hostname;
  var protocol = defaults.protocol;
  var port = defaults.port;
  var path = defaults.path;
  var search = defaults.search;

  var proxy = options.proxy;
  if (options.endpoint) {
    var opts = url.parse(options.endpoint);
    hostname = opts.hostname;
    protocol = opts.protocol;
    port = opts.port;
    path = opts.pathname;
    search = opts.search;
  }
  return {
    hostname: hostname,
    protocol: protocol,
    port: port,
    path: path,
    search: search,
    proxy: proxy
  };
}

function transportOptions(transport, method) {
  var protocol = transport.protocol || 'https:';
  var port = transport.port || (protocol === 'http:' ? 80 : protocol === 'https:' ? 443 : undefined);
  var hostname = transport.hostname;
  var path = transport.path;
  if (transport.search) {
    path = path + transport.search;
  }
  if (transport.proxy) {
    path = protocol + '//' + hostname + path;
    hostname = transport.proxy.host || transport.proxy.hostname;
    port = transport.proxy.port;
    protocol = transport.proxy.protocol || protocol;
  }
  return {
    protocol: protocol,
    hostname: hostname,
    path: path,
    port: port,
    method: method
  };
}

function appendPathToPath(base, path) {
  var baseTrailingSlash = /\/$/.test(base);
  var pathBeginningSlash = /^\//.test(path);

  if (baseTrailingSlash && pathBeginningSlash) {
    path = path.substring(1);
  } else if (!baseTrailingSlash && !pathBeginningSlash) {
    path = '/' + path;
  }

  return base + path;
}

module.exports = {
  buildPayload: buildPayload,
  getTransportFromOptions: getTransportFromOptions,
  transportOptions: transportOptions,
  appendPathToPath: appendPathToPath
};


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);

function raw(payload, jsonBackup) {
  return [payload, _.stringify(payload, jsonBackup)];
}

function selectFrames(frames, range) {
  var len = frames.length;
  if (len > range * 2) {
    return frames.slice(0, range).concat(frames.slice(len - range));
  }
  return frames;
}

function truncateFrames(payload, jsonBackup, range) {
  range = (typeof range === 'undefined') ? 30 : range;
  var body = payload.data.body;
  var frames;
  if (body.trace_chain) {
    var chain = body.trace_chain;
    for (var i = 0; i < chain.length; i++) {
      frames = chain[i].frames;
      frames = selectFrames(frames, range);
      chain[i].frames = frames;
    }
  } else if (body.trace) {
    frames = body.trace.frames;
    frames = selectFrames(frames, range);
    body.trace.frames = frames;
  }
  return [payload, _.stringify(payload, jsonBackup)];
}

function maybeTruncateValue(len, val) {
  if (!val) {
    return val;
  }
  if (val.length > len) {
    return val.slice(0, len - 3).concat('...');
  }
  return val;
}

function truncateStrings(len, payload, jsonBackup) {
  function truncator(k, v, seen) {
    switch (_.typeName(v)) {
      case 'string':
        return maybeTruncateValue(len, v);
      case 'object':
      case 'array':
        return _.traverse(v, truncator, seen);
      default:
        return v;
    }
  }
  payload = _.traverse(payload, truncator, []);
  return [payload, _.stringify(payload, jsonBackup)];
}

function truncateTraceData(traceData) {
  if (traceData.exception) {
    delete traceData.exception.description;
    traceData.exception.message = maybeTruncateValue(255, traceData.exception.message);
  }
  traceData.frames = selectFrames(traceData.frames, 1);
  return traceData;
}

function minBody(payload, jsonBackup) {
  var body = payload.data.body;
  if (body.trace_chain) {
    var chain = body.trace_chain;
    for (var i = 0; i < chain.length; i++) {
      chain[i] = truncateTraceData(chain[i]);
    }
  } else if (body.trace) {
    body.trace = truncateTraceData(body.trace);
  }
  return [payload, _.stringify(payload, jsonBackup)];
}

function needsTruncation(payload, maxSize) {
  return payload.length > maxSize;
}

function truncate(payload, jsonBackup, maxSize) {
  maxSize = (typeof maxSize === 'undefined') ? (512 * 1024) : maxSize;
  var strategies = [
    raw,
    truncateFrames,
    truncateStrings.bind(null, 1024),
    truncateStrings.bind(null, 512),
    truncateStrings.bind(null, 256),
    minBody
  ];
  var strategy, results, result;

  while ((strategy = strategies.shift())) {
    results = strategy(payload, jsonBackup);
    payload = results[0];
    result = results[1];
    if (result.error || !needsTruncation(result.value, maxSize)) {
      return result;
    }
  }
  return result;
}

module.exports = {
  truncate: truncate,

  /* for testing */
  raw: raw,
  truncateFrames: truncateFrames,
  truncateStrings: truncateStrings,
  maybeTruncateValue: maybeTruncateValue
};


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var verbose = true;

var logger = {
  /* eslint-disable no-console */
  log: function() {
    if (verbose) {
      console.log.apply(console, arguments);
    }
  },
  error: function() {
    if (verbose) {
      console.error.apply(console, arguments);
    }
  },
  /* eslint-enable no-console */
  setVerbose: function(val) {
    verbose = val;
  }
};

module.exports = logger;


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);
var truncation = __webpack_require__(92);
var logger = __webpack_require__(93);

var http = __webpack_require__(10);
var https = __webpack_require__(11);
var jsonBackup = __webpack_require__(95);

var MAX_RATE_LIMIT_INTERVAL = 60;

/*
 * accessToken may be embedded in payload but that should not be assumed
 *
 * options: {
 *   hostname
 *   protocol
 *   path
 *   port
 *   method
 * }
 *
 * params is an object containing key/value pairs to be
 *    appended to the path as 'key=value&key=value'
 *
 * payload is an unserialized object
 */
function Transport() {
  this.rateLimitExpires = 0;
}

Transport.prototype.get = function(accessToken, options, params, callback, transportFactory) {
  var t;
  if (!callback || !_.isFunction(callback)) {
    callback = function() {};
  }
  options = options || {};
  _.addParamsAndAccessTokenToPath(accessToken, options, params);
  options.headers = _headers(accessToken, options);
  if (transportFactory) {
    t = transportFactory(options);
  } else {
    t = _transport(options);
  }
  if (!t) {
    logger.error('Unknown transport based on given protocol: ' + options.protocol);
    return callback(new Error('Unknown transport'));
  }
  var req = t.request(options, function(resp) {
    this.handleResponse(resp, callback);
  }.bind(this));
  req.on('error', function(err) {
    callback(err);
  });
  req.end();
}

Transport.prototype.post = function(accessToken, options, payload, callback, transportFactory) {
  var t;
  if (!callback || !_.isFunction(callback)) {
    callback = function() {};
  }
  if (_currentTime() < this.rateLimitExpires) {
    return callback(new Error('Exceeded rate limit'));
  }
  options = options || {};
  if (!payload) {
    return callback(new Error('Cannot send empty request'));
  }
  var stringifyResult = truncation.truncate(payload, jsonBackup);
  if (stringifyResult.error) {
    logger.error('Problem stringifying payload. Giving up');
    return callback(stringifyResult.error);
  }
  var writeData = stringifyResult.value;
  options.headers = _headers(accessToken, options, writeData);
  if (transportFactory) {
    t = transportFactory(options);
  } else {
    t = _transport(options);
  }
  if (!t) {
    logger.error('Unknown transport based on given protocol: ' + options.protocol);
    return callback(new Error('Unknown transport'));
  }
  var req = t.request(options, function(resp) {
    this.handleResponse(resp, _wrapPostCallback(callback));
  }.bind(this));
  req.on('error', function(err) {
    callback(err);
  });
  if (writeData) {
    req.write(writeData);
  }
  req.end();
}

Transport.prototype.updateRateLimit = function(resp) {
  var remaining = parseInt(resp.headers['x-rate-limit-remaining'] || 0);
  var remainingSeconds = Math.min(MAX_RATE_LIMIT_INTERVAL, resp.headers['x-rate-limit-remaining-seconds'] || 0);
  var currentTime = _currentTime();

  if ((resp.statusCode === 429) && (remaining === 0)) {
    this.rateLimitExpires = currentTime + remainingSeconds;
  } else {
    this.rateLimitExpires = currentTime;
  }
}

Transport.prototype.handleResponse = function(resp, callback) {
  this.updateRateLimit(resp);

  var respData = [];
  resp.setEncoding('utf8');
  resp.on('data', function(chunk) {
    respData.push(chunk);
  });

  resp.on('end', function() {
    respData = respData.join('');
    _parseApiResponse(respData, callback);
  });
}

/** Helpers **/

function _headers(accessToken, options, data) {
  var headers = (options && options.headers) || {};
  headers['Content-Type'] = 'application/json';
  if (data) {
    try {
      headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
    } catch (e) {
      logger.error('Could not get the content length of the data');
    }
  }
  headers['X-Rollbar-Access-Token'] = accessToken;
  return headers;
}

function _transport(options) {
  return {'http:': http, 'https:': https}[options.protocol];
}

function _parseApiResponse(data, callback) {
  var parsedData = _.jsonParse(data);
  if (parsedData.error) {
    logger.error('Could not parse api response, err: ' + parsedData.error);
    return callback(parsedData.error);
  }
  data = parsedData.value;

  if (data.err) {
    logger.error('Received error: ' + data.message);
    return callback(new Error('Api error: ' + (data.message || 'Unknown error')));
  }

  callback(null, data);
}

function _wrapPostCallback(callback) {
  return function(err, data) {
    if (err) {
      return callback(err);
    }
    if (data.result && data.result.uuid) {
      logger.log([
          'Successful api response.',
          ' Link: https://rollbar.com/occurrence/uuid/?uuid=' + data.result.uuid
      ].join(''));
    } else {
      logger.log('Successful api response');
    }
    callback(null, data.result);
  }
}

function _currentTime() {
  return Math.floor(Date.now() / 1000);
}

module.exports = Transport;


/***/ }),
/* 95 */
/***/ (function(module, exports) {

exports = module.exports = stringify
exports.getSerialize = serializer

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function serializer(replacer, cycleReplacer) {
  var stack = [], keys = []

  if (cycleReplacer == null) cycleReplacer = function(key, value) {
    if (stack[0] === value) return "[Circular ~]"
    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
  }

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    }
    else stack.push(value)

    return replacer == null ? value : replacer.call(this, key, value)
  }
}


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var async = __webpack_require__(97);
var parser = __webpack_require__(98);
var requestIp = __webpack_require__(100);
var url = __webpack_require__(4);
var _ = __webpack_require__(84);

function baseData(item, options, callback) {
  var environment = (options.payload && options.payload.environment) || options.environment;
  var data = {
    timestamp: Math.round(item.timestamp / 1000),
    environment: item.environment || environment,
    level: item.level || 'error',
    language: 'javascript',
    framework: item.framework || options.framework,
    uuid: item.uuid,
    notifier: JSON.parse(JSON.stringify(options.notifier))
  };

  if (options.codeVersion) {
    data.code_version = options.codeVersion;
  } else if (options.code_version) {
    data.code_version = options.code_version;
  }

  var props = Object.getOwnPropertyNames(item.custom || {});
  props.forEach(function (name) {
    if (!data.hasOwnProperty(name)) {
      data[name] = item.custom[name];
    }
  });

  data.server = {
    host: options.host,
    argv: process.argv.concat(),
    pid: process.pid
  };

  if (options.branch) {
    data.server.branch = options.branch;
  }
  if (options.root) {
    data.server.root = options.root;
  }

  item.data = data;
  callback(null, item);
}

function addMessageData(item, options, callback) {
  item.data = item.data || {};
  item.data.body = item.data.body || {};
  var message = item.message || '';
  item.data.body.message = {
    body: message
  };
  callback(null, item);
}

function addErrorData(item, options, callback) {
  if (item.stackInfo) {
    item.data = item.data || {};
    item.data.body = item.data.body || {};
    item.data.body.trace_chain = item.stackInfo;
  }
  callback(null, item);
}

function addBody(item, options, callback) {
  if (item.stackInfo) {
    addErrorData(item, options, callback);
  } else {
    addMessageData(item, options, callback);
  }
}

function handleItemWithError(item, options, callback) {
  if (!item.err) {
    return callback(null, item);
  }

  var err = item.err;
  var errors = [];
  var chain = [];
  do {
    errors.push(err);
    err = err.nested;
  } while (err !== undefined);
  item.stackInfo = chain;

  var cb = function(e) {
    if (e) {
      item.message = item.err.message || item.err.description || item.message || String(item.err);
      delete item.err;
      delete item.stackInfo;
    }
    callback(null, item);
  };
  async.eachSeries(errors, _buildTraceData(chain), cb);
}

function addRequestData(item, options, callback) {
  item.data = item.data || {};

  var req = item.request;
  if (!req) {
    callback(null, item);
    return;
  }

  if (options.addRequestData && _.isFunction(options.addRequestData)) {
    options.addRequestData(item.data, req);
    callback(null, item);
    return;
  }

  var requestData = _buildRequestData(req);
  _.filterIp(requestData, options.captureIp);
  item.data.request = requestData;

  if (req.route) {
    item.data.context = req.route.path;
  } else {
    try {
      item.data.context = req.app._router.matchRequest(req).path;
    } catch (ignore) {
      // Ignored
    }
  }

  var captureEmail = options.captureEmail;
  var captureUsername = options.captureUsername;
  if (req.rollbar_person) {
    var person = req.rollbar_person;
    if (!captureEmail && person.email) {
      person.email = null;
    }
    if (!captureUsername && person.username) {
      person.username = null;
    }
    item.data.person = person;
  } else if (req.user) {
    item.data.person = {id: req.user.id};
    if (req.user.username && captureUsername) {
      item.data.person.username = req.user.username;
    }
    if (req.user.email && captureEmail) {
      item.data.person.email = req.user.email;
    }
  } else if (req.user_id || req.userId) {
    var userId = req.user_id || req.userId;
    if (_.isFunction(userId)) {
      userId = userId();
    }
    item.data.person = {id: userId};
  }

  callback(null, item);
}

function addLambdaData(item, options, callback) {
  var c = item.lambdaContext;
  if (!c) {
    callback(null, item);
    return;
  }

  var data = {
    remainingTimeInMillis: c.getRemainingTimeInMillis(),
    callbackWaitsForEmptyEventLoop: c.callbackWaitsForEmptyEventLoop,
    functionName: c.functionName,
    functionVersion: c.functionVersion,
    arn: c.invokedFunctionArn,
    requestId: c.awsRequestId
  };

  item.data = item.data || {};
  item.data.custom = item.data.custom || {};
  item.data.custom.lambda = data;

  callback(null, item);
}

function scrubPayload(item, options, callback) {
  var scrubHeaders = options.scrubHeaders || [];
  var scrubFields = options.scrubFields || [];
  scrubFields = scrubHeaders.concat(scrubFields);
  item.data = _.scrub(item.data, scrubFields);
  callback(null, item);
}

/** Helpers **/

function _buildTraceData(chain) {
  return function(ex, cb) {
    parser.parseException(ex, function (err, errData) {
      if (err) {
        return cb(err);
      }

      chain.push({
        frames: errData.frames,
        exception: {
          class: errData['class'],
          message: errData.message
        }
      });

      return cb(null);
    });
  };
}

function _extractIp(req) {
  var ip = req.ip;
  if (!ip) {
    ip = requestIp.getClientIp(req);
  }
  return ip;
}

function _buildRequestData(req) {
  var headers = req.headers || {};
  var host = headers.host || '<no host>';
  var proto = req.protocol || ((req.socket && req.socket.encrypted) ? 'https' : 'http' );
  var parsedUrl;
  if (_.isType(req.url, 'string')) {
    parsedUrl = url.parse(req.url, true);
  } else {
    parsedUrl = req.url || {};
  }
  parsedUrl.protocol = parsedUrl.protocol || proto;
  parsedUrl.host = parsedUrl.host || host;
  var reqUrl = url.format(parsedUrl);
  var data = {
    url: reqUrl,
    user_ip: _extractIp(req),
    headers: headers,
    method: req.method
  };
  if (parsedUrl.search && parsedUrl.search.length > 0) {
    data.GET = parsedUrl.query;
  }

  var body = req.body || req.payload;
  if (body) {
    var bodyParams = {};
    if (_.isIterable(body)) {
      for (var k in body) {
        if (Object.prototype.hasOwnProperty.call(body, k)) {
          bodyParams[k] = body[k];
        }
      }
      data[req.method] = bodyParams;
    } else {
      data.body = body;
    }
  }
  return data;
}

module.exports = {
  baseData: baseData,
  handleItemWithError: handleItemWithError,
  addBody: addBody,
  addMessageData: addMessageData,
  addErrorData: addErrorData,
  addRequestData: addRequestData,
  addLambdaData: addLambdaData,
  scrubPayload: scrubPayload
};



/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}

    // global on the server, window in the browser
    var root, previous_async;

    if (typeof window == 'object' && this === window) {
        root = window;
    }
    else if (typeof global == 'object' && this === global) {
        root = global;
    }
    else {
        root = this;
    }

    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(this, arguments);
        };
    }

    function _once(fn) {
        var called = false;
        return function() {
            if (called) return;
            called = true;
            fn.apply(this, arguments);
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _each(coll, iterator) {
        return _isArrayLike(coll) ?
            _arrayEach(coll, iterator) :
            _forEachOf(coll, iterator);
    }

    function _arrayEach(arr, iterator) {
      var index = -1,
          length = arr.length;

      while (++index < length) {
        iterator(arr[index], index, arr);
      }
    }

    function _map(arr, iterator) {
      var index = -1,
          length = arr.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iterator(arr[index], index, arr);
      }
      return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    function _baseSlice(arr, start) {
        start = start || 0;
        var index = -1;
        var length = arr.length;

        if (start) {
          length -= start;
          length = length < 0 ? 0 : length;
        }
        var result = Array(length);

        while (++index < length) {
          result[index] = arr[index + start];
        }
        return result;
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate;
    if (typeof setImmediate === 'function') {
        _setImmediate = setImmediate;
    }

    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (_setImmediate) {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                _setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (_setImmediate) {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              _setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];
        var size = _isArrayLike(object) ? object.length : _keys(object).length;
        var completed = 0;
        if (!size) {
            return callback(null);
        }
        _each(object, function (value, key) {
            iterator(object[key], key, only_once(done));
        });
        function done(err) {
          if (err) {
              callback(err);
          }
          else {
              completed += 1;
              if (completed >= size) {
                  callback(null);
              }
          }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.nextTick(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(limit, fn) {
        return function (obj, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        var results = [];
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    function _mapLimit(limit) {
        return doParallelLimit(limit, _asyncMap);
    }

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err || null, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, index, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, index, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    function _detect(eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = noop;
                }
                else {
                    callback();
                }
            });
        }, function () {
            main_callback();
        });
    }
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.any =
    async.some = function (arr, iterator, main_callback) {
        async.eachOf(arr, function (x, _, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = noop;
                }
                callback();
            });
        }, function () {
            main_callback(false);
        });
    };

    async.all =
    async.every = function (arr, iterator, main_callback) {
        async.eachOf(arr, function (x, _, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = noop;
                }
                callback();
            });
        }, function () {
            main_callback(true);
        });
    };

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, callback) {
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            function taskCallback(err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _arrayEach(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            }
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && !!~dep.indexOf(k)) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                }
                else {
                    var args = _baseSlice(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            };
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(function (err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        async.eachOfSeries(tasks, function (task, key, callback) {
            task(function (err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = _baseSlice(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(_baseSlice(arguments))
            );
        };
    };

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = _baseSlice(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback(null);
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback(null);
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = _baseSlice(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback(null);
            }
        });
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                   q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                  q.tasks.unshift(item);
                } else {
                  q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while(workers < q.concurrency && q.tasks.length){
                        var tasks = payload ?
                            q.tasks.splice(0, payload) :
                            q.tasks.splice(0, q.tasks.length);

                        var data = _map(tasks, function (task) {
                            return task.data;
                        });

                        if (q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
              var mid = beg + ((end - beg + 1) >>> 1);
              if (compare(item, sequence[mid]) >= 0) {
                  beg = mid;
              } else {
                  end = mid - 1;
              }
          }
          return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return function (fn) {
            var args = _baseSlice(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = _baseSlice(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        function memoized() {
            var args = _baseSlice(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = _baseSlice(arguments);
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        }
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = _baseSlice(arguments);

            var callback = args.slice(-1)[0];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = _baseSlice(arguments, 1);
                    cb(err, nextargs);
                }]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn, fns /*args...*/) {
        function go() {
            var that = this;
            var args = _baseSlice(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, _, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        }
        if (arguments.length > 2) {
            var args = _baseSlice(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    }

    async.applyEach = function (/*fns, args...*/) {
        var args = _baseSlice(arguments);
        return _applyEach.apply(null, [async.eachOf].concat(args));
    };
    async.applyEachSeries = function (/*fns, args...*/) {
        var args = _baseSlice(arguments);
        return _applyEach.apply(null, [async.eachOfSeries].concat(args));
    };


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return function (/*...args, callback*/) {
            var args = _baseSlice(arguments);
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        };
    }

    async.ensureAsync = ensureAsync;

    // Node.js
    if ( true && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
            return async;
        }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
    // included directly via <script> tag
    else {}

}());


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var logger = __webpack_require__(93);
var async = __webpack_require__(97);
var fs = __webpack_require__(28);
var lru = __webpack_require__(99);
var util = __webpack_require__(24);

var linesOfContext = 3;
var tracePattern =
  /^\s*at (?:([^(]+(?: \[\w\s+\])?) )?\(?(.+?)(?::(\d+):(\d+)(?:, <js>:(\d+):(\d+))?)?\)?$/;

var jadeTracePattern = /^\s*at .+ \(.+ (at[^)]+\))\)$/;
var jadeFramePattern = /^\s*(>?) [0-9]+\|(\s*.+)$/m;


var cache = lru({max: 100});
var pendingReads = {};

exports.cache = cache;
exports.pendingReads = pendingReads;


/*
 * Internal
 */


function getMultipleErrors(errors) {
  var errArray, key;

  if (errors === null || errors === undefined) {
    return null;
  }

  if (typeof errors !== 'object') {
    return null;
  }

  if (util.isArray(errors)) {
    return errors;
  }

  errArray = [];

  for (key in errors) {
    if (Object.prototype.hasOwnProperty.call(errors, key)) {
      errArray.push(errors[key]);
    }
  }
  return errArray;
}


function parseJadeDebugFrame(body) {
  var lines, lineNumSep, filename, lineno, numLines, msg, i,
    contextLine, preContext, postContext, line, jadeMatch;

  // Given a Jade exception body, return a frame object
  lines = body.split('\n');
  lineNumSep = lines[0].indexOf(':');
  filename = lines[0].slice(0, lineNumSep);
  lineno = parseInt(lines[0].slice(lineNumSep + 1), 10);
  numLines = lines.length;
  msg = lines[numLines - 1];

  lines = lines.slice(1, numLines - 1);

  preContext = [];
  postContext = [];
  for (i = 0; i < numLines - 2; ++i) {
    line = lines[i];
    jadeMatch = line.match(jadeFramePattern);
    if (jadeMatch) {
      if (jadeMatch[1] === '>') {
        contextLine = jadeMatch[2];
      } else {
        if (!contextLine) {
          if (jadeMatch[2]) {
            preContext.push(jadeMatch[2]);
          }
        } else {
          if (jadeMatch[2]) {
            postContext.push(jadeMatch[2]);
          }
        }
      }
    }
  }

  preContext = preContext.slice(0, Math.min(preContext.length, linesOfContext));
  postContext = postContext.slice(0, Math.min(postContext.length, linesOfContext));

  return {
    frame: {
      method: '<jade>',
      filename: filename,
      lineno: lineno,
      code: contextLine,
      context: {
        pre: preContext,
        post: postContext
      }
    },
    message: msg
  };
}


function extractContextLines(frame, fileLines) {
  frame.code = fileLines[frame.lineno - 1];
  frame.context = {
    pre: fileLines.slice(Math.max(0, frame.lineno - (linesOfContext + 1)), frame.lineno - 1),
    post: fileLines.slice(frame.lineno, frame.lineno + linesOfContext)
  };
}


function parseFrameLine(line, callback) {
  var matched, curLine, data, frame;

  curLine = line;
  matched = curLine.match(jadeTracePattern);
  if (matched) {
    curLine = matched[1];
  }
  matched = curLine.match(tracePattern);
  if (!matched) {
    return callback(null, null);
  }

  data = matched.slice(1);
  frame = {
    method: data[0] || '<unknown>',
    filename: data[1],
    lineno: Math.floor(data[2]),
    colno: Math.floor(data[3])
  };

  // For coffeescript, lineno and colno refer to the .coffee positions
  // The .js lineno and colno will be stored in compiled_*
  if (data[4]) {
    frame.compiled_lineno = Math.floor(data[4]);
  }

  if (data[5]) {
    frame.compiled_colno = Math.floor(data[5]);
  }

  callback(null, frame);
}


function shouldReadFrameFile(frameFilename, callback) {
  var isValidFilename, isCached, isPending;

  isValidFilename = frameFilename[0] === '/' || frameFilename[0] === '.';
  isCached = !!cache.get(frameFilename);
  isPending = !!pendingReads[frameFilename];

  callback(isValidFilename && !isCached && !isPending);
}


function readFileLines(filename, callback) {
  try {
    fs.readFile(filename, function (err, fileData) {
      var fileLines;
      if (err) {
        return callback(err);
      }

      fileLines = fileData.toString('utf8').split('\n');
      return callback(null, fileLines);
    });
  } catch (e) {
    logger.log(e);
  }
}


/* Older versions of node do not have fs.exists so we implement our own */
function checkFileExists(filename, callback) {
  if (fs.exists !== undefined) {
    fs.exists(filename, callback);
  } else {
    fs.stat(filename, function (err) {
      callback(!err);
    });
  }
}


function gatherContexts(frames, callback) {
  var frameFilenames = [];

  frames.forEach(function (frame) {
    if (frameFilenames.indexOf(frame.filename) === -1) {
      frameFilenames.push(frame.filename);
    }
  });

  async.filter(frameFilenames, shouldReadFrameFile, function (results) {
    var tempFileCache;

    tempFileCache = {};

    function gatherFileData(filename, callback) {
      readFileLines(filename, function (err, lines) {
        if (err) {
          return callback(err);
        }

        // Cache this in a temp cache as well as the LRU cache so that
        // we know we will have all of the necessary file contents for
        // each filename in tempFileCache.
        tempFileCache[filename] = lines;
        cache.set(filename, lines);

        return callback(null);
      });
    }

    function gatherContextLines(frame, callback) {
      var lines = tempFileCache[frame.filename] || cache.get(frame.filename);

      if (lines) {
        extractContextLines(frame, lines);
      }
      callback(null);
    }

    async.filter(results, checkFileExists, function (filenames) {
      async.each(filenames, gatherFileData, function (err) {
        if (err) {
          return callback(err);
        }
        async.eachSeries(frames, gatherContextLines, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, frames);
        });
      });
    });

  });
}

/*
 * Public API
 */


exports.parseException = function (exc, callback) {
  var multipleErrs = getMultipleErrors(exc.errors);

  return exports.parseStack(exc.stack, function (err, stack) {
    var message, clss, ret, firstErr, jadeMatch, jadeData;

    if (err) {
      logger.error('could not parse exception, err: ' + err);
      return callback(err);
    }
    message = String(exc.message || '<no message>') ;
    clss = String(exc.name || '<unknown>');

    ret = {
      class: clss,
      message: message,
      frames: stack
    };

    if (multipleErrs && multipleErrs.length) {
      firstErr = multipleErrs[0];
      ret = {
        class: clss,
        message: String(firstErr.message || '<no message>'),
        frames: stack
      };
    }

    jadeMatch = message.match(jadeFramePattern);
    if (jadeMatch) {
      jadeData = parseJadeDebugFrame(message);
      ret.message = jadeData.message;
      ret.frames.push(jadeData.frame);
    }
    return callback(null, ret);
  });
};


exports.parseStack = function (stack, callback) {
  var lines, _stack = stack;

  // Some JS frameworks (e.g. Meteor) might bury the stack property
  while (typeof _stack === 'object') {
    _stack = _stack && _stack.stack;
  }

  // grab all lines except the first
  lines = (_stack || '').split('\n').slice(1);

  // Parse out all of the frame and filename info
  async.map(lines, parseFrameLine, function (err, frames) {
    if (err) {
      return callback(err);
    }
    frames.reverse();
    async.filter(frames, function (frame, callback) { callback(!!frame); }, function (results) {
      gatherContexts(results, callback);
    });
  });
};


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

;(function () { // closure for web browsers

if ( true && module.exports) {
  module.exports = LRUCache
} else {
  // just set the global for non-node platforms.
  this.LRUCache = LRUCache
}

function hOP (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function naiveLength () { return 1 }

function LRUCache (options) {
  if (!(this instanceof LRUCache)) {
    return new LRUCache(options)
  }

  var max
  if (typeof options === 'number') {
    max = options
    options = { max: max }
  }

  if (!options) options = {}

  max = options.max

  var lengthCalculator = options.length || naiveLength

  if (typeof lengthCalculator !== "function") {
    lengthCalculator = naiveLength
  }

  if (!max || !(typeof max === "number") || max <= 0 ) {
    // a little bit silly.  maybe this should throw?
    max = Infinity
  }

  var allowStale = options.stale || false

  var maxAge = options.maxAge || null

  var dispose = options.dispose

  var cache = Object.create(null) // hash of items by key
    , lruList = Object.create(null) // list of items in order of use recency
    , mru = 0 // most recently used
    , lru = 0 // least recently used
    , length = 0 // number of items in the list
    , itemCount = 0


  // resize the cache when the max changes.
  Object.defineProperty(this, "max",
    { set : function (mL) {
        if (!mL || !(typeof mL === "number") || mL <= 0 ) mL = Infinity
        max = mL
        // if it gets above double max, trim right away.
        // otherwise, do it whenever it's convenient.
        if (length > max) trim()
      }
    , get : function () { return max }
    , enumerable : true
    })

  // resize the cache when the lengthCalculator changes.
  Object.defineProperty(this, "lengthCalculator",
    { set : function (lC) {
        if (typeof lC !== "function") {
          lengthCalculator = naiveLength
          length = itemCount
          for (var key in cache) {
            cache[key].length = 1
          }
        } else {
          lengthCalculator = lC
          length = 0
          for (var key in cache) {
            cache[key].length = lengthCalculator(cache[key].value)
            length += cache[key].length
          }
        }

        if (length > max) trim()
      }
    , get : function () { return lengthCalculator }
    , enumerable : true
    })

  Object.defineProperty(this, "length",
    { get : function () { return length }
    , enumerable : true
    })


  Object.defineProperty(this, "itemCount",
    { get : function () { return itemCount }
    , enumerable : true
    })

  this.forEach = function (fn, thisp) {
    thisp = thisp || this
    var i = 0;
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) if (lruList[k]) {
      i++
      var hit = lruList[k]
      fn.call(thisp, hit.value, hit.key, this)
    }
  }

  this.keys = function () {
    var keys = new Array(itemCount)
    var i = 0
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) if (lruList[k]) {
      var hit = lruList[k]
      keys[i++] = hit.key
    }
    return keys
  }

  this.values = function () {
    var values = new Array(itemCount)
    var i = 0
    for (var k = mru - 1; k >= 0 && i < itemCount; k--) if (lruList[k]) {
      var hit = lruList[k]
      values[i++] = hit.value
    }
    return values
  }

  this.reset = function () {
    if (dispose) {
      for (var k in cache) {
        dispose(k, cache[k].value)
      }
    }
    cache = {}
    lruList = {}
    lru = 0
    mru = 0
    length = 0
    itemCount = 0
  }

  // Provided for debugging/dev purposes only. No promises whatsoever that
  // this API stays stable.
  this.dump = function () {
    return cache
  }

  this.dumpLru = function () {
    return lruList
  }

  this.set = function (key, value) {
    if (hOP(cache, key)) {
      // dispose of the old one before overwriting
      if (dispose) dispose(key, cache[key].value)
      if (maxAge) cache[key].now = Date.now()
      cache[key].value = value
      this.get(key)
      return true
    }

    var len = lengthCalculator(value)
    var age = maxAge ? Date.now() : 0
    var hit = new Entry(key, value, mru++, len, age)

    // oversized objects fall out of cache automatically.
    if (hit.length > max) {
      if (dispose) dispose(key, value)
      return false
    }

    length += hit.length
    lruList[hit.lu] = cache[key] = hit
    itemCount ++

    if (length > max) trim()
    return true
  }

  this.has = function (key) {
    if (!hOP(cache, key)) return false
    var hit = cache[key]
    if (maxAge && (Date.now() - hit.now > maxAge)) {
      return false
    }
    return true
  }

  this.get = function (key) {
    if (!hOP(cache, key)) return
    var hit = cache[key]
    if (maxAge && (Date.now() - hit.now > maxAge)) {
      this.del(key)
      return allowStale ? hit.value : undefined
    }
    shiftLU(hit)
    hit.lu = mru ++
    lruList[hit.lu] = hit
    return hit.value
  }

  this.del = function (key) {
    del(cache[key])
  }

  function trim () {
    while (lru < mru && length > max)
      del(lruList[lru])
  }

  function shiftLU(hit) {
    delete lruList[ hit.lu ]
    while (lru < mru && !lruList[lru]) lru ++
  }

  function del(hit) {
    if (hit) {
      if (dispose) dispose(hit.key, hit.value)
      length -= hit.length
      itemCount --
      delete cache[ hit.key ]
      shiftLU(hit)
    }
  }
}

// classy, since V8 prefers predictable objects.
function Entry (key, value, mru, len, age) {
  this.key = key
  this.value = value
  this.lu = mru
  this.length = len
  this.now = age
}

})()


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

const is = __webpack_require__(101);

/**
 * Parse x-forwarded-for headers.
 *
 * @param {string} value - The value to be parsed.
 * @return {string|null} First known IP address, if any.
 */
function getClientIpFromXForwardedFor(value) {
    if (!is.existy(value)) {
        return null;
    }

    if (is.not.string(value)) {
        throw new TypeError(`Expected a string, got "${typeof value}"`);
    }

    // x-forwarded-for may return multiple IP addresses in the format:
    // "client IP, proxy 1 IP, proxy 2 IP"
    // Therefore, the right-most IP address is the IP address of the most recent proxy
    // and the left-most IP address is the IP address of the originating client.
    // source: http://docs.aws.amazon.com/elasticloadbalancing/latest/classic/x-forwarded-headers.html
    // Azure Web App's also adds a port for some reason, so we'll only use the first part (the IP)
    const forwardedIps = value.split(',').map((e) => {
        const ip = e.trim();
        if (ip.includes(':')) {
            const splitted = ip.split(':');
            // make sure we only use this if it's ipv4 (ip:port)
            if (splitted.length === 2) {
                return splitted[0];
            }
        }
        return ip;
    });

    // Sometimes IP addresses in this header can be 'unknown' (http://stackoverflow.com/a/11285650).
    // Therefore taking the left-most IP address that is not unknown
    // A Squid configuration directive can also set the value to "unknown" (http://www.squid-cache.org/Doc/config/forwarded_for/)
    return forwardedIps.find(is.ip);
}

/**
 * Determine client IP address.
 *
 * @param req
 * @returns {string} ip - The IP address if known, defaulting to empty string if unknown.
 */
function getClientIp(req) {
    // Server is probably behind a proxy.
    if (req.headers) {
        // Standard headers used by Amazon EC2, Heroku, and others.
        if (is.ip(req.headers['x-client-ip'])) {
            return req.headers['x-client-ip'];
        }

        // Load-balancers (AWS ELB) or proxies.
        const xForwardedFor = getClientIpFromXForwardedFor(req.headers['x-forwarded-for']);
        if (is.ip(xForwardedFor)) {
            return xForwardedFor;
        }

        // Cloudflare.
        // @see https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-
        // CF-Connecting-IP - applied to every request to the origin.
        if (is.ip(req.headers['cf-connecting-ip'])) {
            return req.headers['cf-connecting-ip'];
        }

        // Akamai and Cloudflare: True-Client-IP.
        if (is.ip(req.headers['true-client-ip'])) {
            return req.headers['true-client-ip'];
        }

        // Default nginx proxy/fcgi; alternative to x-forwarded-for, used by some proxies.
        if (is.ip(req.headers['x-real-ip'])) {
            return req.headers['x-real-ip'];
        }

        // (Rackspace LB and Riverbed's Stingray)
        // http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
        // https://splash.riverbed.com/docs/DOC-1926
        if (is.ip(req.headers['x-cluster-client-ip'])) {
            return req.headers['x-cluster-client-ip'];
        }

        if (is.ip(req.headers['x-forwarded'])) {
            return req.headers['x-forwarded'];
        }

        if (is.ip(req.headers['forwarded-for'])) {
            return req.headers['forwarded-for'];
        }

        if (is.ip(req.headers.forwarded)) {
            return req.headers.forwarded;
        }
    }

    // Remote address checks.
    if (is.existy(req.connection)) {
        if (is.ip(req.connection.remoteAddress)) {
            return req.connection.remoteAddress;
        }
        if (is.existy(req.connection.socket) && is.ip(req.connection.socket.remoteAddress)) {
            return req.connection.socket.remoteAddress;
        }
    }

    if (is.existy(req.socket) && is.ip(req.socket.remoteAddress)) {
        return req.socket.remoteAddress;
    }

    if (is.existy(req.info) && is.ip(req.info.remoteAddress)) {
        return req.info.remoteAddress;
    }

    return null;
}

/**
 * Expose request IP as a middleware.
 *
 * @param {object} [options] - Configuration.
 * @param {string} [options.attributeName] - Name of attribute to augment request object with.
 * @return {*}
 */
function mw(options) {
    // Defaults.
    const configuration = is.not.existy(options) ? {} : options;

    // Validation.
    if (is.not.object(configuration)) {
        throw new TypeError('Options must be an object!');
    }

    const attributeName = configuration.attributeName || 'clientIp';
    return (req, res, next) => {
        req[attributeName] = getClientIp(req); // eslint-disable-line no-param-reassign
        next();
    };
}

module.exports = {
    getClientIpFromXForwardedFor,
    getClientIp,
    mw,
};


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * is.js 0.8.0
 * Author: Aras Atasaygin
 */

// AMD with global, Node, or global
;(function(root, factory) {    // eslint-disable-line no-extra-semi
    if (true) {
        // AMD. Register as an anonymous module.
        !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.is = factory());
        }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function() {

    // Baseline
    /* -------------------------------------------------------------------------- */

    // define 'is' object and current version
    var is = {};
    is.VERSION = '0.8.0';

    // define interfaces
    is.not = {};
    is.all = {};
    is.any = {};

    // cache some methods to call later on
    var toString = Object.prototype.toString;
    var slice = Array.prototype.slice;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    // helper function which reverses the sense of predicate result
    function not(func) {
        return function() {
            return !func.apply(null, slice.call(arguments));
        };
    }

    // helper function which call predicate function per parameter and return true if all pass
    function all(func) {
        return function() {
            var params = getParams(arguments);
            var length = params.length;
            for (var i = 0; i < length; i++) {
                if (!func.call(null, params[i])) {
                    return false;
                }
            }
            return true;
        };
    }

    // helper function which call predicate function per parameter and return true if any pass
    function any(func) {
        return function() {
            var params = getParams(arguments);
            var length = params.length;
            for (var i = 0; i < length; i++) {
                if (func.call(null, params[i])) {
                    return true;
                }
            }
            return false;
        };
    }

    // build a 'comparator' object for various comparison checks
    var comparator = {
        '<': function(a, b) { return a < b; },
        '<=': function(a, b) { return a <= b; },
        '>': function(a, b) { return a > b; },
        '>=': function(a, b) { return a >= b; }
    }

    // helper function which compares a version to a range
    function compareVersion(version, range) {
        var string = (range + '');
        var n = +(string.match(/\d+/) || NaN);
        var op = string.match(/^[<>]=?|/)[0];
        return comparator[op] ? comparator[op](version, n) : (version == n || n !== n);
    }

    // helper function which extracts params from arguments
    function getParams(args) {
        var params = slice.call(args);
        var length = params.length;
        if (length === 1 && is.array(params[0])) {    // support array
            params = params[0];
        }
        return params;
    }

    // Type checks
    /* -------------------------------------------------------------------------- */

    // is a given value Arguments?
    is.arguments = function(value) {    // fallback check is for IE
        return toString.call(value) === '[object Arguments]' ||
            (value != null && typeof value === 'object' && 'callee' in value);
    };

    // is a given value Array?
    is.array = Array.isArray || function(value) {    // check native isArray first
        return toString.call(value) === '[object Array]';
    };

    // is a given value Boolean?
    is.boolean = function(value) {
        return value === true || value === false || toString.call(value) === '[object Boolean]';
    };

    // is a given value Char?
    is.char = function(value) {
        return is.string(value) && value.length === 1;
    };

    // is a given value Date Object?
    is.date = function(value) {
        return toString.call(value) === '[object Date]';
    };

    // is a given object a DOM node?
    is.domNode = function(object) {
        return is.object(object) && object.nodeType > 0;
    };

    // is a given value Error object?
    is.error = function(value) {
        return toString.call(value) === '[object Error]';
    };

    // is a given value function?
    is['function'] = function(value) {    // fallback check is for IE
        return toString.call(value) === '[object Function]' || typeof value === 'function';
    };

    // is given value a pure JSON object?
    is.json = function(value) {
        return toString.call(value) === '[object Object]';
    };

    // is a given value NaN?
    is.nan = function(value) {    // NaN is number :) Also it is the only value which does not equal itself
        return value !== value;
    };

    // is a given value null?
    is['null'] = function(value) {
        return value === null;
    };

    // is a given value number?
    is.number = function(value) {
        return is.not.nan(value) && toString.call(value) === '[object Number]';
    };

    // is a given value object?
    is.object = function(value) {
        return Object(value) === value;
    };

    // is a given value RegExp?
    is.regexp = function(value) {
        return toString.call(value) === '[object RegExp]';
    };

    // are given values same type?
    // prevent NaN, Number same type check
    is.sameType = function(value, other) {
        var tag = toString.call(value);
        if (tag !== toString.call(other)) {
            return false;
        }
        if (tag === '[object Number]') {
            return !is.any.nan(value, other) || is.all.nan(value, other);
        }
        return true;
    };
    // sameType method does not support 'all' and 'any' interfaces
    is.sameType.api = ['not'];

    // is a given value String?
    is.string = function(value) {
        return toString.call(value) === '[object String]';
    };

    // is a given value undefined?
    is.undefined = function(value) {
        return value === void 0;
    };

    // is a given value window?
    // setInterval method is only available for window object
    is.windowObject = function(value) {
        return value != null && typeof value === 'object' && 'setInterval' in value;
    };

    // Presence checks
    /* -------------------------------------------------------------------------- */

    //is a given value empty? Objects, arrays, strings
    is.empty = function(value) {
        if (is.object(value)) {
            var length = Object.getOwnPropertyNames(value).length;
            if (length === 0 || (length === 1 && is.array(value)) ||
                    (length === 2 && is.arguments(value))) {
                return true;
            }
            return false;
        }
        return value === '';
    };

    // is a given value existy?
    is.existy = function(value) {
        return value != null;
    };

    // is a given value falsy?
    is.falsy = function(value) {
        return !value;
    };

    // is a given value truthy?
    is.truthy = not(is.falsy);

    // Arithmetic checks
    /* -------------------------------------------------------------------------- */

    // is a given number above minimum parameter?
    is.above = function(n, min) {
        return is.all.number(n, min) && n > min;
    };
    // above method does not support 'all' and 'any' interfaces
    is.above.api = ['not'];

    // is a given number decimal?
    is.decimal = function(n) {
        return is.number(n) && n % 1 !== 0;
    };

    // are given values equal? supports numbers, strings, regexes, booleans
    // TODO: Add object and array support
    is.equal = function(value, other) {
        // check 0 and -0 equity with Infinity and -Infinity
        if (is.all.number(value, other)) {
            return value === other && 1 / value === 1 / other;
        }
        // check regexes as strings too
        if (is.all.string(value, other) || is.all.regexp(value, other)) {
            return '' + value === '' + other;
        }
        if (is.all.boolean(value, other)) {
            return value === other;
        }
        return false;
    };
    // equal method does not support 'all' and 'any' interfaces
    is.equal.api = ['not'];

    // is a given number even?
    is.even = function(n) {
        return is.number(n) && n % 2 === 0;
    };

    // is a given number finite?
    is.finite = isFinite || function(n) {
        return is.not.infinite(n) && is.not.nan(n);
    };

    // is a given number infinite?
    is.infinite = function(n) {
        return n === Infinity || n === -Infinity;
    };

    // is a given number integer?
    is.integer = function(n) {
        return is.number(n) && n % 1 === 0;
    };

    // is a given number negative?
    is.negative = function(n) {
        return is.number(n) && n < 0;
    };

    // is a given number odd?
    is.odd = function(n) {
        return is.number(n) && n % 2 === 1;
    };

    // is a given number positive?
    is.positive = function(n) {
        return is.number(n) && n > 0;
    };

    // is a given number above maximum parameter?
    is.under = function(n, max) {
        return is.all.number(n, max) && n < max;
    };
    // least method does not support 'all' and 'any' interfaces
    is.under.api = ['not'];

    // is a given number within minimum and maximum parameters?
    is.within = function(n, min, max) {
        return is.all.number(n, min, max) && n > min && n < max;
    };
    // within method does not support 'all' and 'any' interfaces
    is.within.api = ['not'];

    // Regexp checks
    /* -------------------------------------------------------------------------- */
    // Steven Levithan, Jan Goyvaerts: Regular Expressions Cookbook
    // Scott Gonzalez: Email address validation

    // dateString match m/d/yy and mm/dd/yyyy, allowing any combination of one or two digits for the day and month, and two or four digits for the year
    // eppPhone match extensible provisioning protocol format
    // nanpPhone match north american number plan format
    // time match hours, minutes, and seconds, 24-hour clock
    var regexes = {
        affirmative: /^(?:1|t(?:rue)?|y(?:es)?|ok(?:ay)?)$/,
        alphaNumeric: /^[A-Za-z0-9]+$/,
        caPostalCode: /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z]\s?[0-9][A-Z][0-9]$/,
        creditCard: /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/,
        dateString: /^(1[0-2]|0?[1-9])([\/-])(3[01]|[12][0-9]|0?[1-9])(?:\2)(?:[0-9]{2})?[0-9]{2}$/,
        email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i, // eslint-disable-line no-control-regex
        eppPhone: /^\+[0-9]{1,3}\.[0-9]{4,14}(?:x.+)?$/,
        hexadecimal: /^(?:0x)?[0-9a-fA-F]+$/,
        hexColor: /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
        ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
        ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
        nanpPhone: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
        socialSecurityNumber: /^(?!000|666)[0-8][0-9]{2}-?(?!00)[0-9]{2}-?(?!0000)[0-9]{4}$/,
        timeString: /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/,
        ukPostCode: /^[A-Z]{1,2}[0-9RCHNQ][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$|^[A-Z]{2}-?[0-9]{4}$/,
        url: /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i,
        usZipCode: /^[0-9]{5}(?:-[0-9]{4})?$/
    };

    function regexpCheck(regexp, regexes) {
        is[regexp] = function(value) {
            return regexes[regexp].test(value);
        };
    }

    // create regexp checks methods from 'regexes' object
    for (var regexp in regexes) {
        if (regexes.hasOwnProperty(regexp)) {
            regexpCheck(regexp, regexes);
        }
    }

    // simplify IP checks by calling the regex helpers for IPv4 and IPv6
    is.ip = function(value) {
        return is.ipv4(value) || is.ipv6(value);
    };

    // String checks
    /* -------------------------------------------------------------------------- */

    // is a given string or sentence capitalized?
    is.capitalized = function(string) {
        if (is.not.string(string)) {
            return false;
        }
        var words = string.split(' ');
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            if (word.length) {
                var chr = word.charAt(0);
                if (chr !== chr.toUpperCase()) {
                    return false;
                }
            }
        }
        return true;
    };

    // is string end with a given target parameter?
    is.endWith = function(string, target) {
        if (is.not.string(string)) {
            return false;
        }
        target += '';
        var position = string.length - target.length;
        return position >= 0 && string.indexOf(target, position) === position;
    };
    // endWith method does not support 'all' and 'any' interfaces
    is.endWith.api = ['not'];

    // is a given string include parameter target?
    is.include = function(string, target) {
        return string.indexOf(target) > -1;
    };
    // include method does not support 'all' and 'any' interfaces
    is.include.api = ['not'];

    // is a given string all lowercase?
    is.lowerCase = function(string) {
        return is.string(string) && string === string.toLowerCase();
    };

    // is a given string palindrome?
    is.palindrome = function(string) {
        if (is.not.string(string)) {
            return false;
        }
        string = string.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
        var length = string.length - 1;
        for (var i = 0, half = Math.floor(length / 2); i <= half; i++) {
            if (string.charAt(i) !== string.charAt(length - i)) {
                return false;
            }
        }
        return true;
    };

    // is a given value space?
    // horizantal tab: 9, line feed: 10, vertical tab: 11, form feed: 12, carriage return: 13, space: 32
    is.space = function(value) {
        if (is.not.char(value)) {
            return false;
        }
        var charCode = value.charCodeAt(0);
        return (charCode > 8 && charCode < 14) || charCode === 32;
    };

    // is string start with a given target parameter?
    is.startWith = function(string, target) {
        return is.string(string) && string.indexOf(target) === 0;
    };
    // startWith method does not support 'all' and 'any' interfaces
    is.startWith.api = ['not'];

    // is a given string all uppercase?
    is.upperCase = function(string) {
        return is.string(string) && string === string.toUpperCase();
    };

    // Time checks
    /* -------------------------------------------------------------------------- */

    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    // is a given dates day equal given day parameter?
    is.day = function(date, day) {
        return is.date(date) && day.toLowerCase() === days[date.getDay()];
    };
    // day method does not support 'all' and 'any' interfaces
    is.day.api = ['not'];

    // is a given date in daylight saving time?
    is.dayLightSavingTime = function(date) {
        var january = new Date(date.getFullYear(), 0, 1);
        var july = new Date(date.getFullYear(), 6, 1);
        var stdTimezoneOffset = Math.max(january.getTimezoneOffset(), july.getTimezoneOffset());
        return date.getTimezoneOffset() < stdTimezoneOffset;
    };

    // is a given date future?
    is.future = function(date) {
        var now = new Date();
        return is.date(date) && date.getTime() > now.getTime();
    };

    // is date within given range?
    is.inDateRange = function(date, start, end) {
        if (is.not.date(date) || is.not.date(start) || is.not.date(end)) {
            return false;
        }
        var stamp = date.getTime();
        return stamp > start.getTime() && stamp < end.getTime();
    };
    // inDateRange method does not support 'all' and 'any' interfaces
    is.inDateRange.api = ['not'];

    // is a given date in last month range?
    is.inLastMonth = function(date) {
        return is.inDateRange(date, new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date());
    };

    // is a given date in last week range?
    is.inLastWeek = function(date) {
        return is.inDateRange(date, new Date(new Date().setDate(new Date().getDate() - 7)), new Date());
    };

    // is a given date in last year range?
    is.inLastYear = function(date) {
        return is.inDateRange(date, new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date());
    };

    // is a given date in next month range?
    is.inNextMonth = function(date) {
        return is.inDateRange(date, new Date(), new Date(new Date().setMonth(new Date().getMonth() + 1)));
    };

    // is a given date in next week range?
    is.inNextWeek = function(date) {
        return is.inDateRange(date, new Date(), new Date(new Date().setDate(new Date().getDate() + 7)));
    };

    // is a given date in next year range?
    is.inNextYear = function(date) {
        return is.inDateRange(date, new Date(), new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    };

    // is the given year a leap year?
    is.leapYear = function(year) {
        return is.number(year) && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
    };

    // is a given dates month equal given month parameter?
    is.month = function(date, month) {
        return is.date(date) && month.toLowerCase() === months[date.getMonth()];
    };
    // month method does not support 'all' and 'any' interfaces
    is.month.api = ['not'];

    // is a given date past?
    is.past = function(date) {
        var now = new Date();
        return is.date(date) && date.getTime() < now.getTime();
    };

    // is a given date in the parameter quarter?
    is.quarterOfYear = function(date, quarter) {
        return is.date(date) && is.number(quarter) && quarter === Math.floor((date.getMonth() + 3) / 3);
    };
    // quarterOfYear method does not support 'all' and 'any' interfaces
    is.quarterOfYear.api = ['not'];

    // is a given date indicate today?
    is.today = function(date) {
        var now = new Date();
        var todayString = now.toDateString();
        return is.date(date) && date.toDateString() === todayString;
    };

    // is a given date indicate tomorrow?
    is.tomorrow = function(date) {
        var now = new Date();
        var tomorrowString = new Date(now.setDate(now.getDate() + 1)).toDateString();
        return is.date(date) && date.toDateString() === tomorrowString;
    };

    // is a given date weekend?
    // 6: Saturday, 0: Sunday
    is.weekend = function(date) {
        return is.date(date) && (date.getDay() === 6 || date.getDay() === 0);
    };

    // is a given date weekday?
    is.weekday = not(is.weekend);

    // is a given dates year equal given year parameter?
    is.year = function(date, year) {
        return is.date(date) && is.number(year) && year === date.getFullYear();
    };
    // year method does not support 'all' and 'any' interfaces
    is.year.api = ['not'];

    // is a given date indicate yesterday?
    is.yesterday = function(date) {
        var now = new Date();
        var yesterdayString = new Date(now.setDate(now.getDate() - 1)).toDateString();
        return is.date(date) && date.toDateString() === yesterdayString;
    };

    // Environment checks
    /* -------------------------------------------------------------------------- */

    var freeGlobal = is.windowObject(typeof global == 'object' && global) && global;
    var freeSelf = is.windowObject(typeof self == 'object' && self) && self;
    var thisGlobal = is.windowObject(typeof this == 'object' && this) && this;
    var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

    var document = freeSelf && freeSelf.document;
    var previousIs = root.is;

    // store navigator properties to use later
    var navigator = freeSelf && freeSelf.navigator;
    var appVersion = (navigator && navigator.appVersion || '').toLowerCase();
    var userAgent = (navigator && navigator.userAgent || '').toLowerCase();
    var vendor = (navigator && navigator.vendor || '').toLowerCase();

    // is current device android?
    is.android = function() {
        return /android/.test(userAgent);
    };
    // android method does not support 'all' and 'any' interfaces
    is.android.api = ['not'];

    // is current device android phone?
    is.androidPhone = function() {
        return /android/.test(userAgent) && /mobile/.test(userAgent);
    };
    // androidPhone method does not support 'all' and 'any' interfaces
    is.androidPhone.api = ['not'];

    // is current device android tablet?
    is.androidTablet = function() {
        return /android/.test(userAgent) && !/mobile/.test(userAgent);
    };
    // androidTablet method does not support 'all' and 'any' interfaces
    is.androidTablet.api = ['not'];

    // is current device blackberry?
    is.blackberry = function() {
        return /blackberry/.test(userAgent) || /bb10/.test(userAgent);
    };
    // blackberry method does not support 'all' and 'any' interfaces
    is.blackberry.api = ['not'];

    // is current browser chrome?
    // parameter is optional
    is.chrome = function(range) {
        var match = /google inc/.test(vendor) ? userAgent.match(/(?:chrome|crios)\/(\d+)/) : null;
        return match !== null && compareVersion(match[1], range);
    };
    // chrome method does not support 'all' and 'any' interfaces
    is.chrome.api = ['not'];

    // is current device desktop?
    is.desktop = function() {
        return is.not.mobile() && is.not.tablet();
    };
    // desktop method does not support 'all' and 'any' interfaces
    is.desktop.api = ['not'];

    // is current browser edge?
    // parameter is optional
    is.edge = function(range) {
        var match = userAgent.match(/edge\/(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // edge method does not support 'all' and 'any' interfaces
    is.edge.api = ['not'];

    // is current browser firefox?
    // parameter is optional
    is.firefox = function(range) {
        var match = userAgent.match(/(?:firefox|fxios)\/(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // firefox method does not support 'all' and 'any' interfaces
    is.firefox.api = ['not'];

    // is current browser internet explorer?
    // parameter is optional
    is.ie = function(range) {
        var match = userAgent.match(/(?:msie |trident.+?; rv:)(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // ie method does not support 'all' and 'any' interfaces
    is.ie.api = ['not'];

    // is current device ios?
    is.ios = function() {
        return is.iphone() || is.ipad() || is.ipod();
    };
    // ios method does not support 'all' and 'any' interfaces
    is.ios.api = ['not'];

    // is current device ipad?
    // parameter is optional
    is.ipad = function(range) {
        var match = userAgent.match(/ipad.+?os (\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // ipad method does not support 'all' and 'any' interfaces
    is.ipad.api = ['not'];

    // is current device iphone?
    // parameter is optional
    is.iphone = function(range) {
        // original iPhone doesn't have the os portion of the UA
        var match = userAgent.match(/iphone(?:.+?os (\d+))?/);
        return match !== null && compareVersion(match[1] || 1, range);
    };
    // iphone method does not support 'all' and 'any' interfaces
    is.iphone.api = ['not'];

    // is current device ipod?
    // parameter is optional
    is.ipod = function(range) {
        var match = userAgent.match(/ipod.+?os (\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // ipod method does not support 'all' and 'any' interfaces
    is.ipod.api = ['not'];

    // is current operating system linux?
    is.linux = function() {
        return /linux/.test(appVersion);
    };
    // linux method does not support 'all' and 'any' interfaces
    is.linux.api = ['not'];

    // is current operating system mac?
    is.mac = function() {
        return /mac/.test(appVersion);
    };
    // mac method does not support 'all' and 'any' interfaces
    is.mac.api = ['not'];

    // is current device mobile?
    is.mobile = function() {
        return is.iphone() || is.ipod() || is.androidPhone() || is.blackberry() || is.windowsPhone();
    };
    // mobile method does not support 'all' and 'any' interfaces
    is.mobile.api = ['not'];

    // is current state offline?
    is.offline = not(is.online);
    // offline method does not support 'all' and 'any' interfaces
    is.offline.api = ['not'];

    // is current state online?
    is.online = function() {
        return !navigator || navigator.onLine === true;
    };
    // online method does not support 'all' and 'any' interfaces
    is.online.api = ['not'];

    // is current browser opera?
    // parameter is optional
    is.opera = function(range) {
        var match = userAgent.match(/(?:^opera.+?version|opr)\/(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // opera method does not support 'all' and 'any' interfaces
    is.opera.api = ['not'];

    // is current browser phantomjs?
    // parameter is optional
    is.phantom = function(range) {
        var match = userAgent.match(/phantomjs\/(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // phantom method does not support 'all' and 'any' interfaces
    is.phantom.api = ['not'];

    // is current browser safari?
    // parameter is optional
    is.safari = function(range) {
        var match = userAgent.match(/version\/(\d+).+?safari/);
        return match !== null && compareVersion(match[1], range);
    };
    // safari method does not support 'all' and 'any' interfaces
    is.safari.api = ['not'];

    // is current device tablet?
    is.tablet = function() {
        return is.ipad() || is.androidTablet() || is.windowsTablet();
    };
    // tablet method does not support 'all' and 'any' interfaces
    is.tablet.api = ['not'];

    // is current device supports touch?
    is.touchDevice = function() {
        return !!document && ('ontouchstart' in freeSelf ||
            ('DocumentTouch' in freeSelf && document instanceof DocumentTouch));
    };
    // touchDevice method does not support 'all' and 'any' interfaces
    is.touchDevice.api = ['not'];

    // is current operating system windows?
    is.windows = function() {
        return /win/.test(appVersion);
    };
    // windows method does not support 'all' and 'any' interfaces
    is.windows.api = ['not'];

    // is current device windows phone?
    is.windowsPhone = function() {
        return is.windows() && /phone/.test(userAgent);
    };
    // windowsPhone method does not support 'all' and 'any' interfaces
    is.windowsPhone.api = ['not'];

    // is current device windows tablet?
    is.windowsTablet = function() {
        return is.windows() && is.not.windowsPhone() && /touch/.test(userAgent);
    };
    // windowsTablet method does not support 'all' and 'any' interfaces
    is.windowsTablet.api = ['not'];

    // Object checks
    /* -------------------------------------------------------------------------- */

    // has a given object got parameterized count property?
    is.propertyCount = function(object, count) {
        if (is.not.object(object) || is.not.number(count)) {
            return false;
        }
        var n = 0;
        for (var property in object) {
            if (hasOwnProperty.call(object, property) && ++n > count) {
                return false;
            }
        }
        return n === count;
    };
    // propertyCount method does not support 'all' and 'any' interfaces
    is.propertyCount.api = ['not'];

    // is given object has parameterized property?
    is.propertyDefined = function(object, property) {
        return is.object(object) && is.string(property) && property in object;
    };
    // propertyDefined method does not support 'all' and 'any' interfaces
    is.propertyDefined.api = ['not'];

    // Array checks
    /* -------------------------------------------------------------------------- */

    // is a given item in an array?
    is.inArray = function(value, array) {
        if (is.not.array(array)) {
            return false;
        }
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    };
    // inArray method does not support 'all' and 'any' interfaces
    is.inArray.api = ['not'];

    // is a given array sorted?
    is.sorted = function(array, sign) {
        if (is.not.array(array)) {
            return false;
        }
        var predicate = comparator[sign] || comparator['>='];
        for (var i = 1; i < array.length; i++) {
            if (!predicate(array[i], array[i - 1])) {
                return false;
            }
        }
        return true;
    };

    // API
    // Set 'not', 'all' and 'any' interfaces to methods based on their api property
    /* -------------------------------------------------------------------------- */

    function setInterfaces() {
        var options = is;
        for (var option in options) {
            if (hasOwnProperty.call(options, option) && is['function'](options[option])) {
                var interfaces = options[option].api || ['not', 'all', 'any'];
                for (var i = 0; i < interfaces.length; i++) {
                    if (interfaces[i] === 'not') {
                        is.not[option] = not(is[option]);
                    }
                    if (interfaces[i] === 'all') {
                        is.all[option] = all(is[option]);
                    }
                    if (interfaces[i] === 'any') {
                        is.any[option] = any(is[option]);
                    }
                }
            }
        }
    }
    setInterfaces();

    // Configuration methods
    // Intentionally added after setInterfaces function
    /* -------------------------------------------------------------------------- */

    // change namespace of library to prevent name collisions
    // var preferredName = is.setNamespace();
    // preferredName.odd(3);
    // => true
    is.setNamespace = function() {
        root.is = previousIs;
        return this;
    };

    // set optional regexes to methods
    is.setRegexp = function(regexp, name) {
        for (var r in regexes) {
            if (hasOwnProperty.call(regexes, r) && (name === r)) {
                regexes[r] = regexp;
            }
        }
    };

    return is;
}));


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);

function itemToPayload(item, options, callback) {
  var payloadOptions = options.payload || {};
  if (payloadOptions.body) {
    delete payloadOptions.body;
  }

  var data = _.merge(item.data, payloadOptions);
  if (item._isUncaught) {
    data._isUncaught = true;
  }
  if (item._originalArgs) {
    data._originalArgs = item._originalArgs;
  }
  callback(null, data);
}

function addTelemetryData(item, options, callback) {
  if (item.telemetryEvents) {
    _.set(item, 'data.body.telemetry', item.telemetryEvents);
  }
  callback(null, item);
}

function addMessageWithError(item, options, callback) {
  if (!item.message) {
    callback(null, item);
    return;
  }
  var tracePath = 'data.body.trace_chain.0';
  var trace = _.get(item, tracePath);
  if (!trace) {
    tracePath = 'data.body.trace';
    trace = _.get(item, tracePath);
  }
  if (trace) {
    if (!(trace.exception && trace.exception.description)) {
      _.set(item, tracePath+'.exception.description', item.message);
      callback(null, item);
      return;
    }
    var extra = _.get(item, tracePath+'.extra') || {};
    var newExtra =  _.merge(extra, {message: item.message});
    _.set(item, tracePath+'.extra', newExtra);
  }
  callback(null, item);
}

function userTransform(logger) {
  return function(item, options, callback) {
    var newItem = _.merge(item);
    try {
      if (_.isFunction(options.transform)) {
        options.transform(newItem.data, item);
      }
    } catch (e) {
      options.transform = null;
      logger.error('Error while calling custom transform() function. Removing custom transform().', e);
      callback(null, item);
      return;
    }
    callback(null, newItem);
  }
}

function addConfigToPayload(item, options, callback) {
  if (!options.sendConfig) {
    return callback(null, item);
  }
  var configKey = '_rollbarConfig';
  var custom = _.get(item, 'data.custom') || {};
  custom[configKey] = options;
  item.data.custom = custom;
  callback(null, item);
}

module.exports = {
  itemToPayload: itemToPayload,
  addTelemetryData: addTelemetryData,
  addMessageWithError: addMessageWithError,
  userTransform: userTransform,
  addConfigToPayload: addConfigToPayload
};


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(84);

function checkLevel(item, settings) {
  var level = item.level;
  var levelVal = _.LEVELS[level] || 0;
  var reportLevel = settings.reportLevel;
  var reportLevelVal = _.LEVELS[reportLevel] || 0;

  if (levelVal < reportLevelVal) {
    return false;
  }
  return true;
}

function userCheckIgnore(logger) {
  return function(item, settings) {
    var isUncaught = !!item._isUncaught;
    delete item._isUncaught;
    var args = item._originalArgs;
    delete item._originalArgs;
    try {
      if (_.isFunction(settings.onSendCallback)) {
        settings.onSendCallback(isUncaught, args, item);
      }
    } catch (e) {
      settings.onSendCallback = null;
      logger.error('Error while calling onSendCallback, removing', e);
    }
    try {
      if (_.isFunction(settings.checkIgnore) && settings.checkIgnore(isUncaught, args, item)) {
        return false;
      }
    } catch (e) {
      settings.checkIgnore = null;
      logger.error('Error while calling custom checkIgnore(), removing', e);
    }
    return true;
  }
}

function urlIsNotBlacklisted(logger) {
  return function(item, settings) {
    return !urlIsOnAList(item, settings, 'blacklist', logger);
  }
}

function urlIsWhitelisted(logger) {
  return function(item, settings) {
    return urlIsOnAList(item, settings, 'whitelist', logger);
  }
}

function urlIsOnAList(item, settings, whiteOrBlack, logger) {
  // whitelist is the default
  var black = false;
  if (whiteOrBlack === 'blacklist') {
    black = true;
  }
  var list, trace, frame, filename, frameLength, url, listLength, urlRegex;
  var i, j;

  try {
    list = black ? settings.hostBlackList : settings.hostWhiteList;
    listLength = list && list.length;
    trace = _.get(item, 'body.trace');

    // These two checks are important to come first as they are defaults
    // in case the list is missing or the trace is missing or not well-formed
    if (!list || listLength === 0) {
      return !black;
    }
    if (!trace || !trace.frames || trace.frames.length === 0) {
      return !black;
    }

    frameLength = trace.frames.length;
    for (i = 0; i < frameLength; i++) {
      frame = trace.frames[i];
      filename = frame.filename;

      if (!_.isType(filename, 'string')) {
        return !black;
      }

      for (j = 0; j < listLength; j++) {
        url = list[j];
        urlRegex = new RegExp(url);

        if (urlRegex.test(filename)) {
          return true;
        }
      }
    }
  } catch (e)
  /* istanbul ignore next */
  {
    if (black) {
      settings.hostBlackList = null;
    } else {
      settings.hostWhiteList = null;
    }
    var listName = black ? 'hostBlackList' : 'hostWhiteList';
    logger.error('Error while reading your configuration\'s ' + listName + ' option. Removing custom ' + listName + '.', e);
    return !black;
  }
  return false;
}

function messageIsIgnored(logger) {
  return function(item, settings) {
    var exceptionMessage, i, ignoredMessages,
        len, messageIsIgnored, rIgnoredMessage,
        body, traceMessage, bodyMessage;

    try {
      messageIsIgnored = false;
      ignoredMessages = settings.ignoredMessages;

      if (!ignoredMessages || ignoredMessages.length === 0) {
        return true;
      }

      body = item.body;
      traceMessage = _.get(body, 'trace.exception.message');
      bodyMessage = _.get(body, 'message.body');

      exceptionMessage = traceMessage || bodyMessage;

      if (!exceptionMessage){
        return true;
      }

      len = ignoredMessages.length;
      for (i = 0; i < len; i++) {
        rIgnoredMessage = new RegExp(ignoredMessages[i], 'gi');
        messageIsIgnored = rIgnoredMessage.test(exceptionMessage);

        if (messageIsIgnored) {
          break;
        }
      }
    } catch(e)
    /* istanbul ignore next */
    {
      settings.ignoredMessages = null;
      logger.error('Error while reading your configuration\'s ignoredMessages option. Removing custom ignoredMessages.');
    }

    return !messageIsIgnored;
  }
}

module.exports = {
  checkLevel: checkLevel,
  userCheckIgnore: userCheckIgnore,
  urlIsNotBlacklisted: urlIsNotBlacklisted,
  urlIsWhitelisted: urlIsWhitelisted,
  messageIsIgnored: messageIsIgnored
};


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);

module.exports = class KiteVsJedi extends BaseStep {
  start(state, install) {
    return new Promise((resolve, reject) => {
      install.on('did-pick-install', () => resolve());
      install.on('did-skip-install', () => install.destroy());
    });
  }
};


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {parseSetCookies, findCookie} = __webpack_require__(15);
const AccountManager = __webpack_require__(8);
const BaseStep = __webpack_require__(69);

module.exports = class Login extends BaseStep {
  start({account: {email}} = {}, install) {
    this.install = install;
    return new Promise((resolve, reject) => {
      this.subscriptions.add(install.on('did-submit-credentials', ({email, password}) =>
        resolve(this.onSubmit({email, password}))));

      this.subscriptions.add(install.on('did-click-back', () => {
        resolve({step: this.options.backStep, data: {error: null}});
      }));

      this.subscriptions.add(install.on('did-forgot-password', () => {
        AccountManager.resetPassword({email}).then(resp => {
          if (resp.statusCode === 200) {
            install.emit('did-reset-password', email);
          }
          return;
        });
      }));
    });
  }

  onSubmit(data) {
    this.install.updateState({error: null, account: data});
    return AccountManager.login(data)
    .then((resp) => {
      return {
        account: {
          sessionId: findCookie(parseSetCookies(resp.headers['set-cookie']), 'kite-session').Value,
        },
      };
    });
  }
};


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);
const {deepMerge} = __webpack_require__(15);

module.exports = class ParallelSteps extends BaseStep {
  constructor(steps, options) {
    super(options);
    this.steps = steps;
  }

  start(state, install) {
    return Promise.all(this.steps.map(step => step.start(state, install)))
    .then((results) => {
      return results.reduce((memo, o) => {
        return o ? deepMerge(memo, o) : memo;
      });
    });
  }

  getView() {
    return this.view || this.steps.map(s => s.view).filter(s => s)[0];
  }
};


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);

module.exports = class PassStep extends BaseStep {
  start(data) {
    return Promise.resolve(data);
  }
};


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);

module.exports = class VoidStep extends BaseStep {
  constructor(options, action) {
    super(options);
    this.action = action;
  }
  start() {
    this.action && this.action();
    return new Promise(() => {});
  }
};


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {CompositeDisposable} = __webpack_require__(2);
const path = __webpack_require__(27);
const Install = __webpack_require__(79);
const {logo} =  __webpack_require__(110);

const Metrics = __webpack_require__(60);

class InstallElement extends HTMLElement {
  static initClass() {
    const elementClass = document.registerElement('kite-atom-install', {
      prototype: this.prototype,
    });
    atom.themes.requireStylesheet(path.resolve(__dirname, '..', '..', '..', 'styles', 'install.less'));
    atom.views.addViewProvider(Install, model => {
      const element = new elementClass();
      element.setModel(model);
      return element;
    });
    return elementClass;
  }

  createdCallback() {
    this.classList.add('native-key-bindings');
    this.innerHTML = `
    <div class="install-wrapper">
      <div class="logo">${logo}</div>

      <div class="progress-indicators">
        <div class="download-kite invisible">
          <progress max='100' class="inline-block"></progress>
          <span class="inline-block">Downloading Kite</span>
        </div>
        <div class="install-kite hidden">
          <span class='loading loading-spinner-tiny inline-block'></span>
          <span class="inline-block">Installing Kite</span>
        </div>
        <div class="run-kite hidden">
          <span class='loading loading-spinner-tiny inline-block'></span>
          <span class="inline-block">Starting Kite</span>
        </div>
        <div class="authenticate-user hidden">
          <span class='loading loading-spinner-tiny inline-block'></span>
          <span class="inline-block">Authenticating your account</span>
        </div>
        <div class="install-plugin hidden">
          <span class='loading loading-spinner-tiny inline-block'></span>
          <span class="inline-block">Installing the Kite plugin</span>
        </div>
      </div>

      <div class="content"></div>
    </div>`;

    this.logo = this.querySelector('.logo');
    this.content = this.querySelector('.content');
    this.progress = this.querySelector('progress');
    this.downloadKite = this.querySelector('.download-kite');
    this.installKite = this.querySelector('.install-kite');
    this.runKite = this.querySelector('.run-kite');
    this.authenticateUser = this.querySelector('.authenticate-user');
    this.installPlugin = this.querySelector('.install-plugin');
    this.indicators = this.querySelector('.progress-indicators');
  }

  detachedCallback() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.install;
    delete this.subscriptions;
  }

  setModel(install) {
    this.subscriptions = new CompositeDisposable();
    this.install = install;

    this.subscriptions.add(this.install.onDidChangeCurrentStep(() => {
      this.updateView();
    }));

    this.subscriptions.add(this.install.observeState(state => {
      if (typeof state.kiteLogoVisible !== 'undefined') {
        this.logo.classList.toggle('hidden', !state.kiteLogoVisible);
      }

      if (state.download) {
        if (state.download.done) {
          this.downloadKite.classList.add('hidden');
        } else {
          this.downloadKite.classList.remove('invisible');
        }

        if (state.download.ratio) {
          this.progress.value = Math.round(state.download.ratio * 100);
        }
      }

      if (state.install) {
        this.installKite.classList.toggle('hidden', state.install.done);
      }

      if (state.running) {
        this.runKite.classList.toggle('hidden', state.running.done);
      }

      if (state.authenticate) {
        this.authenticateUser.classList.toggle('hidden', state.authenticate.done);
      }

      if (state.plugin) {
        this.installPlugin.classList.toggle('hidden', state.plugin.done);
      }
    }));

    this.subscriptions.add(this.install.on('encountered-fatal-error', () => {
      this.indicators.classList.add('hidden');
    }));
  }

  getModel() {
    return this.install;
  }

  updateView() {
    if (this.currentView) { this.currentView.release(); }

    const view = this.install.getCurrentStepView();
    if (view) {
      if (this.content.children.length) {
        [].slice.call(this.content.children).forEach(n => this.content.removeChild(n));
      }
      this.content.appendChild(view);
      view.init(this.install);
      this.currentView = view;

      if (this.currentView.name) {
        Metrics.Tracker.trackEvent(`${ this.currentView.name }_shown`,
          this.install.state.error ? {error: this.install.state.error.message} : {});
      }
    }
  }
}

module.exports = InstallElement.initClass();


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(28);
const path = __webpack_require__(27);

const logo = String(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'assets', 'logo.svg')));

const logoSmall = String(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'assets', 'logo-small.svg')));

const screenshot = path.resolve(__dirname, '..', '..', '..', 'assets', 'plotscreenshot.png');

const demoVideo = path.resolve(__dirname, '..', '..', '..', 'assets', 'demo.mp4');

module.exports = {logo, logoSmall, screenshot, demoVideo};


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {CompositeDisposable} = __webpack_require__(2);
const {addDisposableEventListener} = __webpack_require__(112);

class InputEmailElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div>
      <p>Great! Create an account with your email address.</p>
    </div>
    <form novalidate>
      <input class="input-text" name="email" type="email"></input>
      <button class="btn btn-primary btn-block">Continue</button>
      <div class="status hidden"></div>
    </form>
    <center>
      <div class="dismiss secondary-actions">
        <a class="skip-email">Continue without email</a>
      </div>
    </center>

    `;
    this.form = this.querySelector('form');
    this.input = this.querySelector('input');
    this.submit = this.querySelector('button');
    this.status = this.querySelector('.status');
    this.skipButton = this.querySelector('a.skip-email');
  }

  get data() { return {email: this.input.value}; }

  release() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.install;
    delete this.subscriptions;
  }

  init(install) {
    this.subscriptions = new CompositeDisposable();
    this.install = install;
    this.classList.remove('disabled');

    this.subscriptions.add(install.observeState(state => this.onStateChange(state)));

    this.subscriptions.add(addDisposableEventListener(this.form, 'submit', () => {
      this.hideError();
      this.classList.add('disabled');
      this.install.emit('did-submit-email', this.data);
    }));

    this.subscriptions.add(addDisposableEventListener(this.skipButton, 'click', () => {
      this.install.emit('did-skip-email', {skipped: true});
    }));
  }

  onStateChange(state) {
    this.input.value = state.account.email || '';
    if (state.error) {
      console.log(state.error);
      this.status.textContent = state.error.message;
      this.status.classList.remove('hidden');
    } else {
      this.hideError();
    }
  }

  hideError() {
    this.status.textContent = '';
    this.status.classList.add('hidden');
  }
}

customElements.define('kite-atom-input-email', InputEmailElement);

module.exports = InputEmailElement;


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {Disposable} = __webpack_require__(2);
const {spawnPromise} = __webpack_require__(15);

const AtomHelper = {
  get apm() {
    return atom.packages.getApmPath();
  },

  addDisposableEventListener(target, event, listener) {
    target.addEventListener(event, listener);
    return new Disposable(() => target.removeEventListener(event, listener));
  },

  isPackageInstalled: function() {
    return atom.packages.getAvailablePackageNames().includes('kite')
      ? Promise.resolve()
      : Promise.reject();
  },

  installPackage: function() {
    return this.apm && atom && !atom.packages.getAvailablePackageNames().includes('kite')
      ? spawnPromise(this.apm, ['install', 'kite'])
      : Promise.resolve();
  },

  activatePackage: function() {
    return atom && !atom.packages.getActivePackage('kite')
      ? atom.packages.activatePackage('kite')
      : Promise.resolve();
  },

  deactivatePackage: function() {
    if (!atom) {
      return false;
    }
    if (atom.packages.isPackageActive('kite')) {
      atom.packages.deactivatePackage('kite');
    }
    if (atom.packages.isPackageLoaded('kite')) {
      atom.packages.unloadPackage('kite');
    }
    return true;
  },

  enablePackage: function() {
    return atom ? atom.packages.enablePackage('kite') : null;
  },

  disablePackage: function() {
    return atom ? atom.packages.disablePackage('kite') : null;
  },

  refreshPackage: function() {
    if (!atom || !this.apm) {
      return null;
    }
    return new Promise((resolve, reject) => {
      this.deactivatePackage();
      var proc = this.installPackage();
      proc.on('close', (code) => {
        if (code) {
          reject(code);
        } else {
          this.activatePackage().then(() => {
            this.enablePackage();
          });
          resolve();
        }
      });
    });
  },
};

module.exports = AtomHelper;


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {screenshot} =  __webpack_require__(110);


class InstallWaitElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div class="welcome-to-kite">
      <div class="warning">
        <span class="icon">⚠️</span>
        <span class="message">Kite is still installing on your machine. Please do not close this tab until installation has finished.</span>
      </div>
      <div class="description">
        <div class="content">
          <p>Kite provides the best Python completions in the world</p>
          <ul>
            <li>1.5x more completions than the basic engine</li>
            <li>Completions ranked by your current code context</li>
            <li>Full line of code completions</li>
            <li>Works locally without an internet connection</li>
          </ul>
        </div>
        <div class="description-screenshot"><img src="${screenshot}"></div>
      </div>
      <p>
        Kite is under active development. You can expect our completions
        to improve significantly and become more intelligent over the coming
        months.</p>
      <p class="feedback">Send us feedback at <a href="mailto:feedback@kite.com">feedback@kite.com</a></p>
    </div>
    `;
  }

  init(install) {
    this.install = install;
    this.install.emit('did-skip-whitelist');
  }

  release() {}
}

customElements.define('kite-atom-install-wait', InstallWaitElement);

module.exports = InstallWaitElement;


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {logoSmall, screenshot} =  __webpack_require__(110);

class InstallEndElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div class="welcome-to-kite">
      <div class="welcome-title">
        <h3>Welcome to Kite!</h3>
        <div class="title-logo">${logoSmall}</div>
      </div>
      <div class="warning">
        <span class="icon">🎉</span>
        <span class="message">Kite is now integrated with Atom. You\'ll see your completions improve over the next few minutes as Kite analyzes your code.</span>
      </div>
      <div class="description">
        <div class="content">
          <p>Kite provides the best Python completions in the world</p>
          <ul>
            <li>1.5x more completions than the basic engine</li>
            <li>Completions ranked by your current code context</li>
            <li>Full line of code completions</li>
            <li>Works locally without an internet connection</li>
          </ul>
        </div>
        <div class="description-screenshot"><img src="${screenshot}"></div>
      </div>
      <p>
        Kite is under active development. You can expect our completions
        to improve significantly and become more intelligent over the coming
        months.</p>
      <p class="feedback">Send us feedback at <a href="mailto:feedback@kite.com">feedback@kite.com</a></p>
    </div>
    `;
  }

  init(install) {
    this.install = install;
    this.install.updateState({kiteLogoVisible: false});
  }

  release() {}
}

customElements.define('kite-atom-install-end', InstallEndElement);

module.exports = InstallEndElement;


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class InstallErrorElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
  }

  init(install) {
    this.install = install;
    this.install.emit('encountered-fatal-error');
    this.innerHTML = `
    <div class="content">
      <p>
        We've encountered an error!
        Please email <a href="mailto:feedback@kite.com">feedback@kite.com</a>
        with the contents of the error message below to get help.
      </p>
    </div>
    <br>
    <div class="status">
      <h4>${install.state.error.message}</h4>
      <pre>${install.state.error.stack}</pre>
    </div>
    `;
  }

  release() {}
}

customElements.define('kite-atom-install-error', InstallErrorElement);

module.exports = InstallErrorElement;


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {CompositeDisposable} = __webpack_require__(2);
const {addDisposableEventListener} = __webpack_require__(112);

const {demoVideo} =  __webpack_require__(110);

class KiteVsJediElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <h2><span class="icon">📦</span> autocomplete-python installed successfully</h2>
    <div id="kite" class="inset-panel kite-description">
      <h3>Level up your completions with Kite</h3>
      <div class="columns">
        <div class="body">
          <div class="summary">
            Kite is a native app that runs locally on your computer and uses machine learning to provide advanced completions
          </div>
          <ul class="features">
            <li class="feature icon icon-check">All the features of autocomplete-python and...</li>
            <li class="feature icon icon-check">1.5x more completions</li>
            <li class="feature icon icon-check">Completions ranked by code context</li>
            <li class="feature icon icon-check">Full line of code completions</li>
            <li class="feature icon icon-check">100% local - no internet connection required</li>
            <li class="feature icon icon-check">100% free to use</li>
          </ul>
          <div class="more">
            <a href="https://kite.com">Learn more</a>
          </div>
        </div>
        <div class="actions">
          <video autoplay loop playsinline>
            <source src="${demoVideo}" type="video/mp4">
          </video>
          <div class="cta-container">
            <center>
              <button class="btn btn-primary">
                <span class="icon icon-cloud-download"></span>Add Kite
              </button>
            </center>
          </div>
        </div>
      </div>
    </div>
    <div class="dismiss">
      <a href="#">Dismiss</a>
    </div>
    `;

    this.skipButton = this.querySelector('.dismiss a');
    this.nextButton = this.querySelector('#kite .actions .cta-container .btn');
  }

  init(install) {
    this.install = install;
    this.subscriptions = new CompositeDisposable();

    this.install.updateState({kiteLogoVisible: false});

    this.subscriptions.add(addDisposableEventListener(this.skipButton, 'click', () => {
      this.install.emit('did-skip-install');
    }));

    this.subscriptions.add(addDisposableEventListener(this.nextButton, 'click', () => {
      this.install.updateState({kiteLogoVisible: true});
      this.install.emit('did-pick-install');
    }));
  }

  release() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.subscriptions;
  }
}

customElements.define('kite-atom-kite-vs-jedi', KiteVsJediElement);

module.exports = KiteVsJediElement;


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {CompositeDisposable} = __webpack_require__(2);
const {addDisposableEventListener} = __webpack_require__(112);

class LoginElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <p>It seems like you already have a Kite account. Sign in with your login info.</p>
    <form novalidate>
      <input class='input-text' name="email" type="email"></input>
      <input class='input-text' name="password" type="password"></input>
      <button class="btn btn-primary btn-block" type="submit">Sign in</button>
      <div class="secondary-actions">
        <a class="back">Back</a>
        <a class="reset-password secondary-cta">Forgot password</a>
      </div>
      <div class="status hidden"></div>
    </form>
    `;

    this.form = this.querySelector('form');
    this.input = this.querySelector('input[type="email"]');
    this.password = this.querySelector('input[type="password"]');
    this.submit = this.querySelector('button[type="submit"]');
    this.backButton = this.querySelector('a.back');
    this.forgotPassword = this.querySelector('a.reset-password');
    this.status = this.querySelector('.status');
  }

  get data() {
    return {email: this.input.value, password: this.password.value};
  }

  release() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.install;
    delete this.subscriptions;
  }

  init(install) {
    this.subscriptions = new CompositeDisposable();
    this.install = install;
    this.classList.remove('disabled');

    this.subscriptions.add(install.on('did-reset-password', email => {
      atom.notifications.addSuccess(
        `Instructions on how to reset your password should
         have been sent to ${email}`);
    }));

    this.subscriptions.add(addDisposableEventListener(this.form, 'submit', () => {
      this.classList.add('disabled');
      this.install.emit('did-submit-credentials', this.data);
    }));

    this.subscriptions.add(addDisposableEventListener(this.forgotPassword, 'click', () => {
      this.install.emit('did-forgot-password');
    }));

    this.subscriptions.add(addDisposableEventListener(this.backButton, 'click', () => {
      this.install.emit('did-click-back');
    }));

    this.subscriptions.add(install.observeState(state => this.onStateChange(state)));
  }

  onStateChange(state) {
    if (state.account.email) {
      this.input.value = state.account.email;
    }

    if (state.account.password) {
      this.input.password = state.account.password;
    }

    if (state.error) {
      this.status.textContent = state.error.message;
      this.status.classList.remove('hidden');
    } else {
      this.hideError();
    }
  }

  hideError() {
    this.status.textContent = '';
    this.status.classList.add('hidden');
  }
}

customElements.define('kite-atom-login', LoginElement);

module.exports = LoginElement;


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {CompositeDisposable} = __webpack_require__(2);
const {addDisposableEventListener} = __webpack_require__(112);

class NotAdminElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div class="content">
      <p>It seems like you don't have administrator privileges. Please restart Atom as an administrator and try installing Kite again.</p>
      <p>You can also <a class="download-link" href="https://kite.com/download">manually install Kite</a>.</p>
      <p class="dismiss"><a class="dismiss-link" href="#">Don't show this again</a></p>
    </div>
    `;

    this.dismissButton = this.querySelector('.dismiss-link');
  }

  init(install) {
    this.install = install;
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(addDisposableEventListener(this.dismissButton, 'click', () => {
      this.install.destroy();
      this.install.emit('not-admin-dismissed');
    }));

    this.install.emit('not-admin-shown');
  }

  release() {}
}

customElements.define('kite-atom-install-not-admin', NotAdminElement);

module.exports = NotAdminElement;


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const BaseStep = __webpack_require__(69);
const AtomHelper = __webpack_require__(112);
const Metrics = __webpack_require__(60);

module.exports = class InstallPlugin extends BaseStep {
  start(state, install) {
    install.updateState({plugin: {done: false}});
    return AtomHelper.installPackage()
    .then(() => new Promise((resolve) => {
      setTimeout(() => {
        AtomHelper.activatePackage();
        resolve();
      }, 200);
    }))
    .then(() => {
      Metrics.Tracker.trackEvent('kite_installer_kite_plugin_installed');
      install.updateState({plugin: {done: true}});
    });
  }
};


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let os, path, Emitter, Logger, Errors, Metrics, promisifyReadResponse, localconfig, errors, flatten, compact, NodeClient, KiteAPI;

const ensureKiteDeps = () => {
  if (!KiteAPI) {
    ({
      Errors,
      Metrics
    } = __webpack_require__(7));
    KiteAPI = __webpack_require__(121);
    Logger = __webpack_require__(139);
    NodeClient = __webpack_require__(128);
    errors = Errors();
  }
};

const ensureUtils = () => {
  if (!promisifyReadResponse) {
    ({
      promisifyReadResponse,
      flatten,
      compact
    } = __webpack_require__(5));
  }
};

const ATTEMPTS = 30;
const INTERVAL = 2500;
const EXTENSIONS_BY_LANGUAGES = {
  python: ['py'],
  javascript: ['js']
};

class KiteApp {
  static get STATES() {
    ensureKiteDeps();
    return KiteAPI.STATES;
  }

  constructor(kite) {
    if (!Emitter) {
      ({
        Emitter
      } = __webpack_require__(2));
    }

    this.emitter = new Emitter();
    this.kite = kite;
  }

  onDidGetState(listener) {
    return this.emitter.on('did-get-state', listener);
  }

  onDidChangeState(listener) {
    return this.emitter.on('did-change-state', listener);
  }

  onKiteReady(listener) {
    return this.emitter.on('kite-ready', listener);
  }

  onWillDownload(listener) {
    return this.emitter.on('will-download', listener);
  }

  onDidDownload(listener) {
    return this.emitter.on('did-download', listener);
  }

  onDidFailDownload(listener) {
    return this.emitter.on('did-fail-download', listener);
  }

  onDidSkipInstall(listener) {
    return this.emitter.on('did-skip-install', listener);
  }

  onWillInstall(listener) {
    return this.emitter.on('will-install', listener);
  }

  onDidInstall(listener) {
    return this.emitter.on('did-install', listener);
  }

  onDidFailInstall(listener) {
    return this.emitter.on('did-fail-install', listener);
  }

  onWillStart(listener) {
    return this.emitter.on('will-start', listener);
  }

  onDidStart(listener) {
    return this.emitter.on('did-start', listener);
  }

  onDidFailStart(listener) {
    return this.emitter.on('did-fail-start', listener);
  }

  onDidShowLogin(listener) {
    return this.emitter.on('did-show-login', listener);
  }

  onDidSubmitLogin(listener) {
    return this.emitter.on('did-submit-login', listener);
  }

  onDidShowLoginError(listener) {
    return this.emitter.on('did-show-login-error', listener);
  }

  onDidShowSignupError(listener) {
    return this.emitter.on('did-show-signup-error', listener);
  }

  onDidCancelLogin(listener) {
    return this.emitter.on('did-cancel-login', listener);
  }

  onDidResetPassword(listener) {
    return this.emitter.on('did-reset-password', listener);
  }

  onWillAuthenticate(listener) {
    return this.emitter.on('will-authenticate', listener);
  }

  onDidAuthenticate(listener) {
    return this.emitter.on('did-authenticate', listener);
  }

  onDidFailAuthenticate(listener) {
    return this.emitter.on('did-fail-authenticate', listener);
  }

  onDidGetUnauthorized(listener) {
    return this.emitter.on('did-get-unauthorized', listener);
  }

  reset() {
    delete this.previousState;
    delete this.ready;
  }

  dispose() {
    this.emitter.dispose();
  }

  connect(src) {
    ensureKiteDeps();
    return KiteAPI.checkHealth().then(state => {
      if (state >= KiteAPI.STATES.INSTALLED) {
        localStorage.setItem('kite.wasInstalled', true);
      } //hack around false positive login notifications
      //basic idea is to create a 'canNotify' predicate based on the source of the connect
      //call and a comparison between a current polled state and a previous one


      let canNotify = false;

      if (state === KiteAPI.STATES.RUNNING || state === KiteAPI.STATES.REACHABLE) {
        if (this.previousPolledState && this.previousPolledState === state && (src === 'activation' || src === 'pollingInterval')) {
          canNotify = true;
        }
      } else {
        canNotify = true;
      }

      this.emitter.emit('did-get-state', {
        state,
        canNotify
      });

      if (state !== this.previousState) {
        this.emitter.emit('did-change-state', state);
        this.previousState = state;

        if (state === KiteAPI.STATES.READY && !this.ready) {
          this.emitter.emit('kite-ready');
          this.ready = true;
        }
      } //only set this.previousPolledState under certain callers of connect


      if (src === 'activation' || src === 'pollingInterval') {
        this.previousPolledState = state;
      }

      return state;
    });
  }

  installFlow() {
    ensureKiteDeps();
    return Promise.all([KiteAPI.canInstallKite(), localStorage.getItem('kite.no-admin-privileges') ? Promise.reject('User does not have admin privileges') : Promise.resolve()]).then(([values]) => {
      Metrics.Tracker.name = 'atom';
      Metrics.Tracker.props = {};
      Metrics.Tracker.props.lastEvent = event;
      this.showInstallFlow({});
    }, err => {
      Logger.error('rejected with data:', err);
    });
  }

  showInstallFlow(variant) {
    ensureKiteDeps();

    if (!errors) {
      errors = Errors();
    }

    const {
      install: {
        Install,
        atom: atomInstall
      }
    } = __webpack_require__(7);

    const {
      defaultFlow
    } = atomInstall();
    const install = new Install(defaultFlow(), {
      path: atom.project.getPaths()[0] || os.homedir()
    }, {
      failureStep: 'termination',
      title: 'Kite Install'
    });
    const initialClient = KiteAPI.Account.client;
    KiteAPI.Account.client = new NodeClient('alpha.kite.com', -1, '', true);
    errors.trackUncaught();
    atom.workspace.getActivePane().addItem(install);
    atom.workspace.getActivePane().activateItem(install);
    install.start()["catch"](err => console.error(err)).then(() => {
      KiteAPI.Account.client = initialClient;
    });
    return install;
  }

  install() {
    ensureKiteDeps();
    this.emitter.emit('will-download');
    return KiteAPI.downloadKiteRelease({
      install: true,
      onDownload: () => this.emitter.emit('did-download'),
      onInstallStart: () => this.emitter.emit('will-install')
    }).then(() => this.emitter.emit('did-install'))["catch"](err => {
      switch (err.type) {
        case 'bad_status':
        case 'curl_error':
          this.emitter.emit('did-fail-download', err);
          break;

        default:
          this.emitter.emit('did-fail-install', err);
      }

      throw err;
    });
  }

  wasInstalledOnce() {
    return localStorage.getItem('kite.wasInstalled') === 'true';
  }

  start() {
    ensureKiteDeps();
    this.emitter.emit('will-start');
    return KiteAPI.runKiteAndWait(ATTEMPTS, INTERVAL).then(() => this.emitter.emit('did-start'))["catch"](err => {
      this.emitter.emit('did-fail-start', err);
      throw err;
    });
  }

  startEnterprise() {
    ensureKiteDeps();
    this.emitter.emit('will-start');
    return KiteAPI.runKiteEnterpriseAndWait(ATTEMPTS, INTERVAL).then(() => this.emitter.emit('did-start'))["catch"](err => {
      this.emitter.emit('did-fail-start', err);
      throw err;
    });
  }

  login() {
    atom.applicationDelegate.openExternal('kite://home');
  }

  copilotSettings() {
    atom.applicationDelegate.openExternal('kite://settings');
  }

  saveUserID() {
    ensureKiteDeps();
    ensureUtils();
    return KiteAPI.request({
      path: '/clientapi/user',
      method: 'GET'
    }).then(resp => {
      Logger.logResponse(resp);

      if (resp.statusCode !== 200) {
        throw new Error('Unable to reach user endpoint');
      }

      return promisifyReadResponse(resp);
    }).then(data => {
      data = JSON.parse(data);

      if (data.id !== undefined) {
        if (!localconfig) {
          localconfig = __webpack_require__(142);
        }

        localconfig.set('distinctID', data.id);
      }
    })["catch"](err => {});
  }

  getRootDirectory(editor) {
    if (!os) {
      os = __webpack_require__(6);
    }

    if (!path) {
      path = __webpack_require__(27);
    }

    const [projectPath] = atom.project.getPaths();
    const basepath = editor ? editor.getPath() || projectPath : projectPath;
    return basepath && path.relative(os.homedir(), basepath).indexOf('..') === 0 ? path.parse(basepath).root : os.homedir();
  }

  getSupportedLanguagesRegExp(languages) {
    ensureUtils();
    return `\.(${compact(flatten(languages.map(l => EXTENSIONS_BY_LANGUAGES[l]))).join('|')})$`;
  }

}

module.exports = KiteApp;

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const os = __webpack_require__(6);
const http = __webpack_require__(10);
const https = __webpack_require__(11);
const querystring = __webpack_require__(12);
const KiteConnector = __webpack_require__(122);
const KiteStateError = __webpack_require__(126);
const KiteRequestError = __webpack_require__(124);
const utils = __webpack_require__(123);
const NodeClient = __webpack_require__(128);
const BrowserClient = __webpack_require__(129);
const EventEmitter = __webpack_require__(14);
const EditorConfig = __webpack_require__(134);
const MemoryStore = __webpack_require__(135);
const {STATES} = KiteConnector;
const {MAX_FILE_SIZE} = __webpack_require__(136);
const {merge, checkArguments, checkArgumentKeys} = __webpack_require__(137);
const urls = __webpack_require__(138);

const KiteAPI = {
  STATES,

  emitter: new EventEmitter(),

  editorConfig: new EditorConfig(new MemoryStore()),

  toggleRequestDebug() {
    KiteConnector.toggleRequestDebug();
    this.Account.toggleRequestDebug();
  },

  requestJSON(...args) {
    return this.request(...args)
    .then(resp => utils.handleResponseData(resp))
    .then(data => JSON.parse(data));
  },

  isKiteLocal() {
    return this.request({
      path: '/clientapi/iskitelocal',
      method: 'GET',
    })
    .then(() => true)
    .catch(() => false);
  },

  setKiteSetting(key, value) {
    return this.requestJSON({
      path: `/clientapi/settings/${key}`,
      method: 'POST',
    }, JSON.stringify(value));
  },

  getKiteSetting(key) {
    return this.requestJSON({
      path: `/clientapi/settings/${key}`,
      method: 'GET',
    });
  },

  getSupportedLanguages() {
    return this.requestJSON({
      path: '/clientapi/languages',
    });
  },

  getOnboardingFilePath() {
    return this.requestJSON({
      path: '/clientapi/plugins/onboarding_file',
    });
  },

  canAuthenticateUser() {
    return KiteConnector.isKiteReachable()
    .then(() => utils.reversePromise(
      KiteConnector.isUserAuthenticated(),
      new KiteStateError('Kite is already authenticated', {
        state: STATES.AUTHENTICATED,
      })));
  },

  authenticateUser(email, password) {
    checkArguments(this.authenticateUser, email, password);
    return this.canAuthenticateUser()
    .then(() => this.request({
      path: '/clientapi/login',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }, {email, password}))
    .then(() => this.saveUserID());
  },

  authenticateSessionID(key) {
    // Unlike authenticateUser above, this method does not check to see if a
    // user is already authenticated before trying to authenticate. This
    // method is only used in specialized flows, so we're special-casing it
    // here.
    checkArguments(this.authenticateSessionID, key);
    return KiteConnector.isKiteReachable()
    .then(() => this.request({
      path: '/clientapi/authenticate',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }, {key}))
    .then(resp => this.saveUserID());
  },

  saveUserID() {
    return this.requestJSON({
      path: '/clientapi/user',
      method: 'GET',
    })
    .then(data => data.id && this.editorConfig.set('distinctID', data.id))
    .catch(() => {});
  },

  getHoverDataAtPosition(filename, source, position, editor) {
    checkArguments(this.getHoverDataAtPosition, filename, source, position);
    const path = urls.hoverPath(filename, source, position, editor);

    return this.requestJSON({path});
  },

  getReportDataAtPosition(filename, source, position, editor) {
    checkArguments(this.getReportDataAtPosition, filename, source, position, editor);
    return this.getHoverDataAtPosition(filename, source, position, editor)
    .then(data => this.getReportDataFromHover(data));
  },

  getReportDataFromHover(data) {
    const id = data.symbol[0].id;
    return !idIsEmpty(id)
      ? this.getSymbolReportDataForId(id)
        .then(report => [data, report])
        .catch(err => [data])
      : [data];
  },

  getSymbolReportDataForId(id) {
    checkArguments(this.getSymbolReportDataForId, id);
    return this.requestJSON({
      path: `/api/editor/symbol/${id}`,
    });
  },

  getValueReportDataForId(id) {
    checkArguments(this.getValueReportDataForId, id);
    return this.requestJSON({
      path: `/api/editor/value/${id}`,
    })
    .then(report => {
      if (report.value && idIsEmpty(report.value.id)) {
        report.value.id = id;
      }
      return report;
    });
  },

  getMembersDataForId(id, page = 0, limit = 999) {
    checkArguments(this.getMembersDataForId, id);
    const path = urls.membersPath(id, page, limit);

    return this.requestJSON({path});
  },

  getUsagesDataForValueId(id, page = 0, limit = 999) {
    checkArguments(this.getUsagesDataForValueId, id);
    const path = urls.usagesPath(id, page, limit);

    return this.requestJSON({path});
  },

  getUsageDataForId(id) {
    checkArguments(this.getUsageDataForId, id);
    return this.requestJSON({
      path: `/api/editor/usages/${id}`,
    })
    .then(report => {
      if (report.value && idIsEmpty(report.value.id)) {
        report.value.id = id;
      }
      return report;
    });
  },

  getExampleDataForId(id) {
    checkArguments(this.getExampleDataForId, id);
    return this.requestJSON({
      path: `/api/python/curation/${id}`,
    });
  },

  getUserAccountInfo() {
    return this.requestJSON({path: '/api/account/user'});
  },

  getStatus(filename) {
    return filename
      ? this.requestJSON({path: urls.statusPath(filename)})
        .catch((err) => ({status: 'ready'}))
      : Promise.resolve({status: 'ready'});
  },

  getCompletionsAtPosition(filename, source, position, editor) {
    checkArguments(this.getCompletionsAtPosition, filename, source, position, editor);
    if (source.length > MAX_FILE_SIZE) { return Promise.resolve([]); }

    const payload = {
      text: source,
      editor,
      filename,
      cursor_runes: position,
    };

    return this.requestJSON({
      path: '/clientapi/editor/completions',
      method: 'POST',
    }, JSON.stringify(payload))
    .then(data => data.completions || [])
    .catch(err => []);
  },

  getSnippetCompletionsAtPosition(filename, source, editor, start_position, end_position = start_position) {
    checkArguments(this.getSnippetCompletionsAtPosition, filename, source, editor, start_position, end_position);
    if (source.length > MAX_FILE_SIZE) { return Promise.resolve([]); }
    const payload = {
      text: source,
      editor,
      filename,
      position: {
        begin: start_position,
        end: end_position,
      },
    };
    return this.requestJSON({
      path: '/clientapi/editor/complete',
      method: 'POST',
    }, JSON.stringify(payload))
    .then(data => data.completions || [])
    .catch(_ => []);
  },

  getSignaturesAtPosition(filename, source, position, editor) {
    checkArguments(this.getSignaturesAtPosition, filename, source, position, editor);
    if (source.length > MAX_FILE_SIZE) { return Promise.resolve(); }

    const payload = {
      text: source,
      editor,
      filename,
      cursor_runes: position,
    };

    return this.requestJSON({
      path: '/clientapi/editor/signatures',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  getKSGCompletions(query) {
    checkArguments(this.getKSGCompletions, query);
    return this.requestJSON({ path: `/clientapi/ksg/completions?query=${encodeURIComponent(query)}` })
      .catch(() => {});
  },

  getKSGCodeBlocks(query) {
    checkArguments(this.getKSGCodeBlocks, query);
    return this.requestJSON({ path: `/clientapi/ksg/codeblocks?query=${encodeURIComponent(query)}` })
      .catch(() => {});
  },

  getAutocorrectData(filename, source, editorMeta) {
    checkArguments(this.getAutocorrectData, filename, source, editorMeta);

    if (source.length > MAX_FILE_SIZE) { return Promise.resolve(); }

    const payload = {
      metadata: this.getAutocorrectMetadata('autocorrect_request', editorMeta),
      buffer: source,
      filename,
      language: 'python',
    };

    return this.requestJSON({
      path: '/clientapi/editor/autocorrect',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  getAutocorrectModelInfo(version, editorMeta) {
    checkArguments(this.getAutocorrectModelInfo, version, editorMeta);

    const payload = {
      metadata: this.getAutocorrectMetadata('model_info_request', editorMeta),
      language: 'python',
      version,
    };

    return this.requestJSON({
      path: '/api/editor/autocorrect/model-info',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  getAutocorrectMetadata(event, editorMeta) {
    checkArguments(this.getAutocorrectMetadata, event, editorMeta);
    checkArgumentKeys(this.getAutocorrectMetadata, editorMeta, 'editorMeta', 'source', 'plugin_version');
    return merge({
      event,
      os_name: this.getOsName(),
    }, editorMeta);
  },

  getOsName() {
    return {
      darwin: 'macos',
      win32: 'windows',
      linux: 'linux',
    }[os.platform()];
  },

  postSaveValidationData(filename, source, editorMeta) {
    checkArguments(this.postSaveValidationData, filename, source, editorMeta);

    if (source.length > MAX_FILE_SIZE) { return Promise.resolve(); }

    const payload = {
      metadata: this.getAutocorrectMetadata('validation_onsave', editorMeta),
      buffer: source,
      filename,
      language: 'python',
    };

    return this.request({
      path: '/clientapi/editor/autocorrect/validation/on-save',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  postAutocorrectFeedbackData(response, feedback, editorMeta) {
    checkArguments(this.postAutocorrectFeedbackData, response, feedback, editorMeta);

    const payload = {
      metadata: this.getAutocorrectMetadata('feedback_diffset', editorMeta),
      response,
      feedback,
    };

    return this.request({
      path: '/clientapi/editor/autocorrect/feedback',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  postAutocorrectHashMismatchData(response, requestStartTime, editorMeta) {
    checkArguments(this.postAutocorrectHashMismatchData, response, requestStartTime, editorMeta);

    const payload = {
      metadata: this.getAutocorrectMetadata('metrics_hash_mismatch', editorMeta),
      response,
      response_time: new Date() - requestStartTime,
    };

    return this.request({
      path: '/clientapi/editor/autocorrect/metrics',
      method: 'POST',
    }, JSON.stringify(payload))
    .catch(() => {});
  },

  sendFeatureMetric(name) {
    checkArguments(this.sendFeatureMetric, name);

    return this.request({
      path: '/clientapi/metrics/counters',
      method: 'POST',
    }, JSON.stringify({
      name,
      value: 1,
    }));
  },

  featureRequested(name, editor) {
    checkArguments(this.featureRequested, name, editor);
    this.sendFeatureMetric(`${editor}_${name}_requested`);
  },

  featureFulfilled(name, editor) {
    checkArguments(this.featureFulfilled, name, editor);
    this.sendFeatureMetric(`${editor}_${name}_fulfilled`);
  },

  featureApplied(name, editor, suffix = '') {
    checkArguments(this.featureApplied, name, editor);
    this.sendFeatureMetric(`${editor}_${name}_applied${suffix}`);
  },

  Account: {
    client: KiteConnector.client,

    initClient(hostname, port, base, ssl) {
      this.client.hostname = hostname;
      this.client.port = port;
      this.client.base = base;
      this.client.protocol = ssl ? https : http;
    },

    disposeClient() {},

    toggleRequestDebug() {
      if (this.client instanceof NodeClient) {
        this.client = new BrowserClient(this.client.hostname, this.client.port, this.client.base, this.client.protocol === https);
      } else {
        this.client = new NodeClient(this.client.hostname, this.client.port, this.client.base, this.client.protocol === 'https');
      }
    },

    checkEmail(data) {
      if (!data || !data.email) {
        return Promise.reject(new Error('No email provided'));
      }
      return this.client.request({
        path: '/api/account/check-email',
        method: 'POST',
      }, JSON.stringify(data))
      .then(checkStatusAndInvokeCallback('Unable to check email'));
    },

    createAccount(data, callback) {
      if (!data || !data.email) {
        return Promise.reject(new Error('No email provided'));
      }

      const content = querystring.stringify(data);
      let promise;
      if (data.password) {
        promise = this.client.request({
          path: '/api/account/create',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }, content);
      } else {
        promise = this.client.request({
          path: '/api/account/createPasswordless',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }, content);
      }

      return promise.then(checkStatusAndInvokeCallback('Unable to create an account', callback));
    },

    login(data, callback) {
      if (!data) {
        return Promise.reject(new Error('No login data provided'));
      }
      if (!data.email) {
        return Promise.reject(new Error('No email provided'));
      }
      if (!data.password) {
        return Promise.reject(new Error('No password provided'));
      }
      const content = querystring.stringify(data);
      return this.client.request({
        path: '/api/account/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }, content)
      .then(checkStatusAndInvokeCallback('Unable to login into Kite', callback));
    },

    resetPassword(data, callback) {
      if (!data || !data.email) {
        return Promise.reject(new Error('No email provided'));
      }
      const content = querystring.stringify(data);
      return this.client.request({
        path: '/api/account/reset-password/request',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }, content)
      .then(checkStatusAndInvokeCallback('Unable to reset passwords', callback));
    },
  },
};

const idIsEmpty = (id) =>
  !id || id === '' ||
  (id.indexOf(';') !== -1 && id.split(';')[1] === '');

const delegate = (methods, source, target) => {
  methods.forEach(method => target[method] = (...args) => source[method](...args));
  return target;
};

const checkStatusAndInvokeCallback = (message, callback) => resp => {
  callback && callback(resp);
  return new Promise((resolve, reject) => {
    if (resp.statusCode >= 400) {
      utils.handleResponseData(resp).then(respData => {
        reject(new KiteRequestError(message, {
          responseStatus: resp.statusCode,
          response: resp,
          responseData: respData,
        }));
      }, reject);
    } else {
      resolve(resp);
    }
  });
};

delegate([
  'arch',
  'canInstallKite',
  'canRunKite',
  'canRunKiteEnterprise',
  'checkHealth',
  'downloadKite',
  'downloadKiteRelease',
  'hasBothKiteInstalled',
  'hasManyKiteEnterpriseInstallation',
  'hasManyKiteInstallation',
  'installKite',
  'isAdmin',
  'isKiteEnterpriseInstalled',
  'isKiteEnterpriseRunning',
  'isKiteInstalled',
  'isKiteReachable',
  'isKiteRunning',
  'isKiteSupported',
  'isOSSupported',
  'isOSVersionSupported',
  'isUserAuthenticated',
  'onDidFailRequest',
  'request',
  'runKite',
  'runKiteAndWait',
  'runKiteEnterprise',
  'runKiteEnterpriseAndWait',
  'toggleRequestDebug',
  'waitForKite',
], KiteConnector, KiteAPI);

module.exports = KiteAPI;


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const os = __webpack_require__(6);
const EventEmitter = __webpack_require__(14);

const utils = __webpack_require__(123);
const KiteStateError = __webpack_require__(126);
const KiteRequestError = __webpack_require__(124);
const {STATES} = __webpack_require__(127);
const NodeClient = __webpack_require__(128);
const BrowserClient = __webpack_require__(129);

module.exports = {
  STATES,

  adapter: (() => {
    switch (os.platform()) {
      case 'darwin': return __webpack_require__(130);
      case 'win32': return __webpack_require__(131);
      case 'linux': return __webpack_require__(132);
      default: return __webpack_require__(133);
    }
  })(),

  emitter: new EventEmitter(),

  client: new NodeClient('localhost', '46624'),

  toggleRequestDebug() {
    if (this.client instanceof NodeClient) {
      this.client = new BrowserClient(this.client.hostname, this.client.port);
    } else {
      this.client = new NodeClient(this.client.hostname, this.client.port);
    }
  },

  onDidFailRequest(listener) {
    this.emitter.on('did-fail-request', listener);
    return {
      dispose: () => {
        this.emitter.removeListener('did-fail-request', listener);
      },
    };
  },

  request(options, data, timeout) {
    return this.client.request(options, data, timeout)
    .catch(() => {
      let promise = Promise.resolve();
      if (utils.shouldAddCatchProcessing(options.path)) {
        promise = promise.then(() => this.isKiteSupported())
              .then(() => this.isKiteInstalled())
              .then(() => this.isKiteRunning());
      }
      return promise.then(() => {
        throw new KiteStateError('Kite could not be reached when attempting a request', {
          state: STATES.UNREACHABLE,
          request: options,
          requestData: data,
        });
      });
    })
    .then(resp => {
      return resp.statusCode >= 400
        ? utils.handleResponseData(resp).then(respData => {
          throw new KiteRequestError('bad_status', {
            responseStatus: resp.statusCode,
            request: options,
            requestData: data,
            response: resp,
            responseData: respData,
          });
        })
        : resp;
    })
    .catch(err => {
      this.emitter.emit('did-fail-request', err);
      throw err;
    });
  },

  checkHealth() {
    const extractErr = ([err]) => {
      throw err;
    };

    return this.isKiteSupported()
    .then(() =>
      utils.anyPromise([this.isKiteInstalled(), this.isKiteEnterpriseInstalled()]).catch(extractErr))
    .then(() =>
      utils.anyPromise([this.isKiteRunning(), this.isKiteEnterpriseRunning()]).catch(extractErr))
    .then(() => this.isKiteReachable())
    .then(() => STATES.READY)
    .catch(err => {
      if (!err.data || err.data.state == null) { throw err; }
      return err.data.state;
    });
  },

  // FIXME: This method is now deprecated, use checkHealth instead.
  handleState() {
    return this.checkHealth();
  },

  isKiteSupported() {
    return this.adapter.isKiteSupported()
      ? Promise.resolve()
      : Promise.reject(new KiteStateError('Kite is currently not support on your platform', {
        state: STATES.UNSUPPORTED,
      }));
  },

  isKiteInstalled() {
    return this.adapter.isKiteInstalled();
  },

  isKiteRunning() {
    return this.adapter.isKiteRunning();
  },

  canInstallKite() {
    return this.isKiteSupported()
    .then(() =>
      utils.reversePromise(this.adapter.isKiteInstalled(),
        new KiteStateError('Kite is already installed', {
          state: STATES.INSTALLED,
        })));
  },

  installKite(options) {
    return this.adapter.installKite(options);
  },

  downloadKiteRelease(options) {
    return this.adapter.downloadKiteRelease(options);
  },

  downloadKite(url, options) {
    return this.adapter.downloadKite(url, options);
  },

  canRunKite() {
    return this.isKiteInstalled()
    .then(() =>
      utils.reversePromise(this.isKiteRunning(),
        new KiteStateError('Kite is already runnning', {
          state: STATES.RUNNING,
        })));
  },

  runKite() {
    return this.adapter.runKite();
  },

  runKiteAndWait(attempts, interval) {
    return this.runKite().then(() => this.waitForKite(attempts, interval));
  },

  isKiteReachable() {
    return this.client.request({
      path: '/clientapi/ping',
      method: 'GET',
    }, null, 200); // in tests, this took no longer than 15ms to respond
  },

  waitForKite(attempts, interval) {
    return utils.retryPromise(() => this.isKiteReachable(), attempts, interval);
  },

  isKiteEnterpriseInstalled() {
    return this.adapter.isKiteEnterpriseInstalled();
  },

  isKiteEnterpriseRunning() {
    return this.adapter.isKiteEnterpriseRunning();
  },

  canRunKiteEnterprise() {
    return this.isKiteEnterpriseInstalled()
    .then(() =>
      utils.reversePromise(this.isKiteEnterpriseRunning(),
        new KiteStateError('Kite Enterprise is already runnning', {
          state: STATES.RUNNING,
        })));
  },

  runKiteEnterprise() {
    return this.adapter.runKiteEnterprise();
  },

  runKiteEnterpriseAndWait(attempts, interval) {
    return this.runKiteEnterprise().then(() => this.waitForKite(attempts, interval));
  },

  hasBothKiteInstalled() {
    return this.adapter.hasBothKiteInstalled();
  },

  hasManyKiteInstallation() {
    return this.adapter.hasManyKiteInstallation();
  },

  hasManyKiteEnterpriseInstallation() {
    return this.adapter.hasManyKiteEnterpriseInstallation();
  },

  isAdmin() {
    return this.adapter.isAdmin();
  },

  arch() {
    return this.adapter.arch();
  },

  isOSSupported() {
    return this.adapter.isOSSupported();
  },

  isOSVersionSupported() {
    return this.adapter.isOSVersionSupported();
  },

  isUserAuthenticated() {
    return this.client.request({
      path: '/clientapi/user',
      method: 'GET',
    })
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          return utils.handleResponseData(resp);
        case 401:
          throw new KiteStateError('Kite is not authenticated', {
            state: STATES.UNLOGGED,
          });
        default:
          return utils.handleResponseData(resp).then(respData => {
            throw new KiteRequestError('Invalid response status when checking Kite authentication', {
              responseStatus: resp.statusCode,
              request: {
                path: '/clientapi/user',
                method: 'GET',
              },
              response: resp,
              responseData: respData,
            });
          });
      }
    });
  },
};


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const http = __webpack_require__(10);
const https = __webpack_require__(11);
const child_process = __webpack_require__(16);
const KiteRequestError = __webpack_require__(124);
const KiteProcessError = __webpack_require__(125);

function deepMerge(a, b) {
  a = JSON.parse(JSON.stringify(a || {}));
  b = JSON.parse(JSON.stringify(b || {}));
  const c = Object.assign({}, a);

  Object.keys(b).forEach(k => {
    if (c[k] && typeof c[k] == 'object') {
      c[k] = deepMerge(c[k], b[k]);
    } else {
      c[k] = b[k];
    }
  });

  return c;
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.on('response', resp => resolve(resp));
    request.on('error', err => reject(err));
  });
}

function promisifyStream(stream) {
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve());
    stream.on('error', err => reject(err));
  });
}

function request(url) {
  return url.indexOf('https://') === 0
    ? https.request(url)
    : http.request(url);
}

function hasHeader(header, headers) {
  return header in headers ? header : false;
}

function isRedirection(resp) {
  return resp.statusCode >= 300 &&
         resp.statusCode < 400 &&
         hasHeader('location', resp.headers);
}

// Given a request this function will follow the redirection until a
// code different that 303 is returned
function followRedirections(req) {
  return promisifyRequest(req)
  .then(resp => {
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return resp;
    } else if (isRedirection(resp)) {
      const location = resp.headers.location;
      const req = request(location);
      req.end();
      return followRedirections(req);
    } else {
      throw new KiteRequestError('Invalid response status when following redirection', {
        request: req,
        response: resp,
        responseStatus: resp.statusCode,
      });
    }
  });
}

function parseSetCookies(cookies) {
  if (!Array.isArray(cookies) || !cookies.length) {
    return [];
  }
  var parse = (cookie) => {
    var parsed = {
      Path: '',
      Domain: '',
      Expires: new Date('0001-01-01T00:00:00Z'),
      RawExpires: '',
      MaxAge: 0,
      Secure: false,
      HttpOnly: false,
      Raw: '',
      Unparsed: null,
    };
    cookie.split('; ').forEach((raw) => {
      if (raw === 'HttpOnly') {
        parsed.HttpOnly = true;
        return;
      }
      if (raw === 'Secure') {
        parsed.Secure = true;
        return;
      }
      var idx = raw.indexOf('=');
      var key = raw.substring(0, idx);
      var val = raw.substring(idx + 1);
      if (key === 'Expires') {
        val = new Date(val);
      }
      if (key in parsed) {
        parsed[key] = val;
      } else {
        parsed.Name = key;
        parsed.Value = val;
      }
    });
    return parsed;
  };
  return cookies.map(parse);
}

function findCookie(cookies, name) {
  return cookies.filter(c => c.Name === name)[0];
}

function dumpCookies(cookies) {
  return cookies.map((c) => c.Name + '=' + c.Value).join('; ');
}

function handleResponseData(resp, callback) {
  if (callback) {
    let data = '';
    resp.on('data', (chunk) => data += chunk);
    resp.on('end', () => callback(data));
    return null;
  } else {
    return new Promise((resolve, reject) => {
      let data = '';
      resp.on('data', (chunk) => data += chunk);
      resp.on('error', err => reject(err));
      resp.on('end', () => resolve(data));
    });
  }
}

// Returns a new Promise that resolve if the passed-in promise is rejected and
// will be rejected with the provided error if the passed-in promise resolve.
function reversePromise(promise, rejectionMessage, resolutionMessage) {
  return new Promise((resolve, reject) => {
    promise
    .then(() => reject(rejectionMessage))
    .catch(() => resolve(resolutionMessage));
  });
}

// Given a function returning a promise, it returns a new Promise that will be
// resolved if one of the promises returned by the function resolves. If no
// promises have been resolved after the specified amount of attempts the
// returned promise will be rejected
function retryPromise(doAttempt, attempts, interval) {
  return new Promise((resolve, reject) => {
    makeAttempt(0, resolve, reject);
  });

  function makeAttempt(n, resolve, reject) {
    var retryOrReject = (err) => {
      n + 1 >= attempts
        ? reject(err)
        : makeAttempt(n + 1, resolve, reject);
    };
    setTimeout(() =>
      doAttempt().then(resolve, retryOrReject),
      n ? interval : 0);
  }
}

// Spawns a child process and returns a promise that will be resolved if
// the process ends with a code of 0, otherwise the promise will be rejected
// with an error object of the provided rejectionType.
function spawnPromise(cmd, cmdArgs, cmdOptions, rejectionType, rejectionMessage) {
  const args = [cmd];

  if (cmdArgs) {
    if (typeof cmdArgs === 'string') {
      rejectionType = cmdArgs;
      rejectionMessage = cmdOptions;
    } else {
      args.push(cmdArgs);
    }
  }

  if (cmdOptions) {
    if (typeof cmdOptions === 'string') {
      rejectionMessage = rejectionType;
      rejectionType = cmdOptions;
    } else {
      args.push(cmdOptions);
    }
  }

  return new Promise((resolve, reject) => {
    const proc = child_process.spawn(...args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => stdout +=  data);
    proc.stderr.on('data', data => stdout +=  data);

    const error = new Error();

    proc.on('close', code => {
      code
        ? reject(new KiteProcessError(rejectionType,
          {
            message: rejectionMessage,
            stderr,
            stdout,
            callStack: error.stack,
            cmd: `${cmd} ${(typeof cmdOptions != 'string' ? cmdArgs || [] : []).join(' ')}`,
            options: typeof cmdOptions != 'string' ? cmdOptions : undefined,
          }))
        : resolve(stdout);
    });
  });
}

function anyPromise(arrayOfPromises) {
  // For each promise that resolves or rejects,
  // make them all resolve.
  // Record which ones did resolve or reject
  const resolvingPromises = arrayOfPromises.map(promise => {
    return promise
    .then(result => ({resolve: true, result: result}))
    .catch(error => ({resolve: false, result: error}));
  });

  return Promise.all(resolvingPromises).then(results => {
    const resolved = results.reduce((m, r) => {
      if (m) { return m; }
      if (r.resolve) { return r; }
      return null;
    }, null);


    if (resolved) {
      return resolved.result;
    } else {
      throw results.map(r => r.result);
    }
  });
}

// Exec a child process and returns a promise that will be resolved if
// the process ends with success, otherwise the promise will be rejected
// with an error object of the provided rejectionType.
function execPromise(cmd, cmdOptions, rejectionType, rejectionMessage) {
  const args = [cmd];

  if (cmdOptions) {
    if (cmdOptions === 'string') {
      rejectionMessage = rejectionType;
      rejectionType = cmdOptions;
      cmdOptions = {};
    }
  } else {
    cmdOptions = {};
  }

  args.push(cmdOptions);

  const error = new Error();

  return new Promise((resolve, reject) => {
    child_process.exec(...args, (err, stdout, stderr) => {
      if (err) {
        reject(new KiteProcessError(rejectionType,
          {
            message: rejectionMessage,
            stdout,
            stderr,
            callStack: error.stack,
            cmd,
            options: typeof cmdOptions != 'string' ? cmdOptions : undefined,
          }));
      }
      resolve(stdout);
    });
  });
}

// Calls the passed-in function if its actually a function.
function guardCall(fn) { typeof fn === 'function' && fn(); }

// Attempts to parse a json string and returns the fallback if it can't.
function parseJSON(json, fallback) {
  try { return JSON.parse(json) || fallback; } catch (e) { return fallback; }
}

// evaluates whether a particular path should have extra processing
// done on it in the case of a Promise rejection
// NB: this should be taken out with a more robust refactor
function shouldAddCatchProcessing(path) {
  return !path.startsWith('/clientapi/editor');
}

// should be wrapped in try/catch
function whoami() {
  return String(child_process.execSync('whoami')).trim();
}

module.exports = {
  anyPromise,
  deepMerge,
  dumpCookies,
  execPromise,
  findCookie,
  followRedirections,
  guardCall,
  handleResponseData,
  parseJSON,
  parseSetCookies,
  promisifyRequest,
  promisifyStream,
  retryPromise,
  reversePromise,
  shouldAddCatchProcessing,
  spawnPromise,
  whoami,
};


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class KiteRequestError extends Error {
  get type() { return 'bad_status'; }

  constructor(message, data) {
    super(message);
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
};


/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class KiteProcessError extends Error {
  constructor(type, data) {
    super(type);
    this.data = data;
    this.message = `${type}: ${data.message}\ncmd: ${data.cmd}\nstdout: ${data.stdout}\nstderr: ${data.stderr}`;
    Error.captureStackTrace(this, this.constructor);
  }
};


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class KiteStateError extends Error {
  get type() { return 'bad_state'; }

  constructor(message, data) {
    super(message);
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
};


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  STATES: {
    UNSUPPORTED: 0,
    UNINSTALLED: 1,
    NOT_RUNNING: 2,
    UNREACHABLE: 3,
    UNLOGGED: 4,
    READY: 4,

    // legacy states, prefer the ones above for health checks
    INSTALLED: 2,
    RUNNING: 3,
    REACHABLE: 4,
    AUTHENTICATED: 4,
  },

  LEVELS: {
    SILLY: 0,
    VERBOSE: 1,
    DEBUG: 2,
    INFO: 3,
    WARNING: 4,
    ERROR: 5,
  },
};


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const http = __webpack_require__(10);
const https = __webpack_require__(11);
const FormData = __webpack_require__(22);

const utils = __webpack_require__(123);

module.exports = class NodeClient {
  constructor(hostname, port, base = '', ssl = false) {
    this.hostname = hostname;
    this.port = port;
    this.base = base;
    this.protocol = ssl ? https : http;
    this.cookies = {};
  }

  request(opts, data, timeout) {
    return new Promise((resolve, reject) => {
      let form;

      opts.hostname = this.hostname;
      if (this.port > 0) { opts.port = this.port; }
      opts.path = this.base + opts.path;
      opts.headers = opts.headers || {};
      this.writeCookies(opts.headers);

      if (opts.headers['Content-Type'] === 'multipart/form-data' ||
          opts.headers['content-type'] === 'multipart/form-data') {
        delete opts.headers['Content-Type'];
        delete opts.headers['content-type'];

        form = new FormData();
        for (const key in data) {
          form.append(key, data[key]);
        }

        const headers = form.getHeaders();
        for (const key in headers) {
          opts.headers[key] = headers[key];
        }
      }

      const req = this.protocol.request(opts, resp => {
        this.readCookies(resp);
        resolve(resp);
      });
      req.on('error', err => reject(err));
      if (timeout != null) {
        req.setTimeout(timeout, () => reject(new Error('timeout')));
      }
      if (form) {
        form.pipe(req);
      } else {
        if (data) { req.write(data); }
        req.end();
      }
    });
  }

  readCookies(resp) {
    utils.parseSetCookies(resp.headers['set-cookie']).forEach(c => {
      this.cookies[c.Name] = c;
    });
  }

  writeCookies(hdrs) {
    const cookies = [];
    for (var k in this.cookies) {
      cookies.push(this.cookies[k]);
    }
    if (cookies.length) {
      hdrs.Cookies = utils.dumpCookies(cookies);
    }
  }
};


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const utils = __webpack_require__(123);

const createResponse = (status, raw, req, headers = {}) => {
  const resp = {
    statusCode: status,
    req,
    on(event, callback) {
      switch (event) {
        case 'data':
          callback(raw);
          break;
        case 'end':
          callback();
          break;
      }
    },
  };
  for (let k in headers) { resp[k] = headers[k]; }
  resp.headers = resp.headers || {};

  return resp;
};

module.exports = class BrowserClient {
  constructor(hostname, port, base, ssl) {
    base = base || '';
    ssl = ssl || false;
    this.hostname = hostname;
    this.port = port;
    this.base = base;
    this.protocol = ssl ? 'https' : 'http';
    this.cookies = {};
  }

  request(opts, data, timeout) {
    const domain = this.port && this.port !== -1
      ? `${this.hostname}:${this.port}`
      : this.hostname;
    const url = `${this.protocol}://${domain}${this.base}${opts.path}`;
    const method = opts.method || 'GET';

    return new Promise((resolve, reject) => {
      const query = new XMLHttpRequest();
      query.addEventListener('error', reject);
      query.addEventListener('abort', reject);
      query.addEventListener('load', () => {
        const raw = query.responseText;

        resolve(createResponse(query.status, raw, {
          method,
          path: opts.path,
          url,
        }));
      });

      query.open(method, url);
      if (timeout) {
        query.timeout = timeout; // Set timeout to 4 seconds (4000 milliseconds)
        query.ontimeout = () => { reject(new Error('Request Timeout')); };
      }

      if (opts.headers) {
        if (opts.headers['Content-Type'] === 'multipart/form-data' ||
            opts.headers['content-type'] === 'multipart/form-data') {
          delete opts.headers['Content-Type'];
          delete opts.headers['content-type'];

          const form = new FormData();

          for (const key in data) {
            form.append(key, data[key]);
          }
          data = form;
        }

        for (const header in opts.headers) {
          query.setRequestHeader(header, opts.headers[header]);
        }
      }
      if (!opts.headers || !opts.headers['Cache-Control']) {
        query.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
      }

      query.send(data);
    });
  }

  readCookies(resp) {
    utils.parseSetCookies(resp.headers['set-cookie']).forEach(c => {
      this.cookies[c.Name] = c;
    });
  }

  writeCookies(hdrs) {
    var cookies = [];
    for (var k in this.cookies) {
      cookies.push(this.cookies[k]);
    }
    if (cookies.length) {
      hdrs.Cookies = utils.dumpCookies(cookies);
    }
  }
};


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const os = __webpack_require__(6);
const fs = __webpack_require__(28);
const path = __webpack_require__(27);
const https = __webpack_require__(11);
const child_process = __webpack_require__(16);
const utils = __webpack_require__(123);
const KiteStateError = __webpack_require__(126);
const {STATES} = __webpack_require__(127);

const OSXSupport = {
  RELEASE_URL: 'https://alpha.kite.com/release/dls/mac/current',
  APPS_PATH: '/Applications/',
  KITE_DMG_PATH: '/tmp/Kite.dmg',
  KITE_VOLUME_PATH: '/Volumes/Kite/',
  KITE_APP_PATH: {mounted: '/Volumes/Kite/Kite.app', defaultInstalled: '/Applications/Kite.app'},
  KITE_SIDEBAR_PATH: '/Applications/Kite.app/Contents/MacOS/KiteSidebar.app',
  KITE_BUNDLE_ID: 'com.kite.Kite',
  SESSION_FILE_PATH: path.join(os.homedir(), '.kite', 'session.json'),

  get releaseURL() {
    return this.RELEASE_URL;
  },

  get downloadPath() {
    return this.KITE_DMG_PATH;
  },

  get installPath() {
    return this.allInstallPaths[0];
  },

  get allInstallPaths() {
    let paths = String(child_process.spawnSync('mdfind', [
      'kMDItemCFBundleIdentifier = "com.kite.Kite"',
    ]).stdout).trim().split('\n');
    if (paths.indexOf(this.KITE_APP_PATH.defaultInstalled) === -1 && this.checkDefaultAppPath()) {
      paths.push(this.KITE_APP_PATH.defaultInstalled);
    }
    return paths.filter(p => p !== '');
  },

  get enterpriseInstallPath() {
    return this.allEnterpriseInstallPaths[0];
  },

  get allEnterpriseInstallPaths() {
    return String(child_process.spawnSync('mdfind', [
      'kMDItemCFBundleIdentifier = "enterprise.kite.Kite"',
    ]).stdout).trim().split('\n');
  },

  get sessionFilePath() {
    return this.SESSION_FILE_PATH;
  },

  isAdmin() {
    try {
      const user = utils.whoami();
      const adminUsers = String(child_process.execSync('dscacheutil -q group -a name admin'))
      .split('\n')
      .filter(l => /^users:/.test(l))[0]
      .trim()
      .replace(/users:\s+/, '')
      .split(/\s/g);
      return adminUsers.includes(user);
    } catch (e) {
      return false;
    }
  },

  arch() {
    return os.arch();
  },

  isOSSupported() {
    return true;
  },

  isOSVersionSupported() {
    return parseFloat(os.release()) >= 14;
  },

  isKiteSupported() {
    return this.isOSVersionSupported();
  },

  checkDefaultAppPath() {
    return fs.existsSync(this.KITE_APP_PATH.defaultInstalled);
  },

  isKiteInstalled() {
    return utils.spawnPromise(
      'mdfind',
      ['kMDItemCFBundleIdentifier = "com.kite.Kite"'],
      'mdfind_error',
      'Unable to run mdfind and verify that Kite is installed')
    .then(res => {
      if ((!res || res.trim() === '') && !this.checkDefaultAppPath()) {
        throw new KiteStateError('Unable to find Kite application install using mdfind', {
          state: STATES.UNINSTALLED,
        });
      }
    });
  },

  hasManyKiteInstallation() {
    return this.allInstallPaths.length > 1;
  },

  hasManyKiteEnterpriseInstallation() {
    return this.allEnterpriseInstallPaths.length > 1;
  },

  hasBothKiteInstalled() {
    return Promise.all([
      this.isKiteInstalled(),
      this.isKiteEnterpriseInstalled(),
    ]);
  },

  isKiteEnterpriseInstalled() {
    return utils.spawnPromise(
      'mdfind',
      ['kMDItemCFBundleIdentifier = "enterprise.kite.Kite"'],
      'mdfind_error',
      'Unable to run mdfind and verify that kite enterprise is installed')
    .then(res => {
      if (!res || res.trim() === '') {
        throw new KiteStateError('Unable to find Kite Enterprise application install using mdfind', {
          state: STATES.UNINSTALLED,
        });
      }
    });
  },

  downloadKiteRelease(opts) {
    return this.downloadKite(this.releaseURL, opts || {});
  },

  downloadKite(url, opts) {
    opts = opts || {};
    return this.streamKiteDownload(url, opts.onDownloadProgress)
    .then(() => utils.guardCall(opts.onDownload))
    .then(() => opts.install && this.installKite(opts));
  },

  streamKiteDownload(url, progress) {
    const req = https.request(url);
    req.end();

    return utils.followRedirections(req)
    .then(resp => {
      if (progress) {
        const total = parseInt(resp.headers['content-length'], 10);
        let length = 0;

        resp.on('data', chunk => {
          length += chunk.length;
          progress(length, total, length / total);
        });
      }

      return utils.promisifyStream(
        resp.pipe(fs.createWriteStream(this.downloadPath))
      )
      .then(() => new Promise((resolve, reject) => {
        setTimeout(resolve, 100);
      }));
    });
  },

  installKite(opts) {
    opts = opts || {};

    utils.guardCall(opts.onInstallStart);
    return utils.spawnPromise(
      'hdiutil',
      ['attach', '-nobrowse', this.KITE_DMG_PATH],
      'mount_error',
      'Unable to mount Kite.dmg')
    .then(() => utils.guardCall(opts.onMount))
    .then(() => utils.spawnPromise(
      'cp',
      ['-r', this.KITE_APP_PATH.mounted, this.APPS_PATH],
      'cp_error',
      'Unable to copy Kite.app in the applications directory'))
    .then(() => utils.guardCall(opts.onCopy))
    .then(() => utils.spawnPromise(
      'hdiutil',
      ['detach', this.KITE_VOLUME_PATH],
      'unmount_error',
      'Unable to unmount Kite.dmg'))
    .then(() => utils.guardCall(opts.onUnmount))
    .then(() => utils.spawnPromise(
      'rm', [this.KITE_DMG_PATH],
      'rm_error',
      'Unable to remove Kite.dmg'))
    .then(() => utils.guardCall(opts.onRemove))
    // mdfind takes some time to index the app location, so we need to
    // wait for the install to fully complete. Runs 10 times at 1.5s
    // intervals.
    .then(() => utils.retryPromise(() => this.isKiteInstalled(), 10, 1500));
  },

  isKiteRunning() {
    return utils.spawnPromise(
      '/bin/ps',
      ['-axco', 'command'],
      {encoding: 'utf8'},
      'ps_error',
      'Unable to run the ps command and verify that Kite is running')
    .then(stdout => {
      const procs = stdout.split('\n');
      if (!procs.some(s => /^Kite$/.test(s))) {
        throw new KiteStateError('Kite process could not be found in the processes list', {
          state: STATES.NOT_RUNNING,
        });
      }
    });
  },

  runKite() {
    const env = Object.assign({}, process.env);
    delete env['ELECTRON_RUN_AS_NODE'];

    return this.isKiteRunning()
    .catch(() => utils.spawnPromise(
      'defaults',
      ['write', 'com.kite.Kite', 'shouldReopenSidebar', '0'],
      'defaults_error',
      'Unable to run defaults command')
    .then(() =>
    utils.spawnPromise(
      'open',
      ['-a', this.installPath, '--args', '--plugin-launch', '--channel=autocomplete-python'],
      { env: env },
      'open_error',
      'Unable to run the open command to start Kite'
    )));
  },

  isKiteEnterpriseRunning() {
    return utils.spawnPromise(
      '/bin/ps',
      ['-axco', 'command'],
      {encoding: 'utf8'},
      'ps_error',
      'Unable to run the ps command and verify that Kite enterprise is running')
    .then(stdout => {
      const procs = stdout.split('\n');
      if (!procs.some(s => /^KiteEnterprise$/.test(s))) {
        throw new KiteStateError('Kite Enterprise process could not be found in the processes list', {
          state: STATES.NOT_RUNNING,
        });
      }
    });
  },

  runKiteEnterprise() {
    const env = Object.assign({}, process.env);
    delete env['ELECTRON_RUN_AS_NODE'];

    return utils.spawnPromise(
      'defaults',
      ['write', 'enterprise.kite.Kite', 'shouldReopenSidebar', '0'],
      'defaults_error',
      'Unable to run defaults command')
    .then(() =>
      utils.spawnPromise(
        'open',
        ['-a', this.enterpriseInstallPath],
        { env: env },
        'open_error',
        'Unable to run the open command and start Kite enterprise'));
  },
};

module.exports = OSXSupport;


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const os = __webpack_require__(6);
const fs = __webpack_require__(28);
const path = __webpack_require__(27);
const https = __webpack_require__(11);
const child_process = __webpack_require__(16);
const utils = __webpack_require__(123);
const KiteStateError = __webpack_require__(126);
const KiteProcessError = __webpack_require__(125);

const {STATES} = __webpack_require__(127);

const KEY_BAT = `"${path.join(__dirname, 'read-key.bat')}"`;
const ARCH_BAT = `"${path.join(__dirname, 'read-arch.bat')}"`;
let COMPUTED_INSTALL_PATH;

const WindowsSupport = {
  RELEASE_URL: 'https://alpha.kite.com/release/dls/windows/current',
  KITE_INSTALLER_PATH: path.join(os.tmpdir(), 'KiteSetup.exe'),
  SESSION_FILE_PATH: path.join(process.env.LOCALAPPDATA, 'Kite', 'session.json'),

  // We're only setting the install path in tests
  set KITE_EXE_PATH(path) {
    COMPUTED_INSTALL_PATH = path;
  },
  get KITE_EXE_PATH() {
    if (!COMPUTED_INSTALL_PATH) {
      let installDir, fallbackInstallDir;

      if (process.env.ProgramW6432) {
        fallbackInstallDir = path.join(process.env.ProgramW6432, 'Kite');
      } else {
        // TODO: report that even the fallback needed a fallback
        fallbackInstallDir = 'C:\\Program Files\\Kite';
      }

      try {
        const registryDir = String(child_process.execSync(KEY_BAT)).trim();

        installDir = registryDir !== 'not found'
          ? registryDir
          : fallbackInstallDir;
      } catch (err) {
        installDir = fallbackInstallDir;
      }
      COMPUTED_INSTALL_PATH = path.join(installDir, 'kited.exe');
    }

    return COMPUTED_INSTALL_PATH;
  },

  get releaseURL() {
    return this.RELEASE_URL;
  },

  get downloadPath() {
    return this.KITE_INSTALLER_PATH;
  },

  get installPath() {
    return this.KITE_EXE_PATH;
  },

  get enterpriseInstallPath() {
    return null;
  },

  get allInstallPaths() {
    return [this.installPath];
  },

  get allEnterpriseInstallPaths() {
    return [];
  },

  get sessionFilePath() {
    return this.SESSION_FILE_PATH;
  },

  isAdmin() {
    try {
      // Note that this method can still fail if the server has not been started
      // but it has the merit of being simple and reliable
      // see https://stackoverflow.com/questions/4051883/batch-script-how-to-check-for-admin-rights
      // for details
      child_process.execSync('net session');
      return true;
    } catch (e) {
      return false;
    }
  },

  arch() {
    if (!this.cachedArch) { this.cachedArch = os.arch(); }

    // for backwards compatibility, we don't just return the direct result of the os call
    if (this.cachedArch === 'x32') { return '32bit'; }
    if (this.cachedArch === 'x64') { return '64bit'; }

    return this.cachedArch;
  },

  isOSSupported() {
    return true;
  },

  isOSVersionSupported() {
    return parseFloat(os.release()) >= 6.1 &&
           this.arch() === '64bit';
  },

  isKiteSupported() {
    return this.isOSVersionSupported();
  },

  isKiteInstalled() {
    return new Promise((resolve, reject) => {
      fs.exists(this.KITE_EXE_PATH, (exists) => {
        if (exists) {
          resolve();
        } else {
          reject(new KiteStateError('', {
            state: STATES.UNINSTALLED,
          }));
        }
      });
    });
  },

  isKiteEnterpriseInstalled() {
    return Promise.reject(new KiteStateError('Kite Enterprise is currently not supported on windows', {
      state: STATES.UNSUPPORTED,
    }));
  },

  hasManyKiteInstallation() {
    return this.allInstallPaths.length > 1;
  },

  hasManyKiteEnterpriseInstallation() {
    return this.allEnterpriseInstallPaths.length > 1;
  },

  hasBothKiteInstalled() {
    return Promise.all([
      this.isKiteInstalled(),
      this.isKiteEnterpriseInstalled(),
    ]);
  },

  downloadKiteRelease(opts) {
    return this.downloadKite(this.releaseURL, opts || {});
  },

  downloadKite(url, opts) {
    opts = opts || {};
    return this.streamKiteDownload(url, opts.onDownloadProgress)
    .then(() => utils.guardCall(opts.onDownload))
    .then(() => opts.install && this.installKite(opts));
  },

  streamKiteDownload(url, progress) {
    const req = https.request(url);
    req.end();

    return utils.followRedirections(req)
    .then(resp => {
      if (progress) {
        const total = parseInt(resp.headers['content-length'], 10);
        let length = 0;

        resp.on('data', chunk => {
          length += chunk.length;
          progress(length, total, length / total);
        });
      }

      return utils.promisifyStream(
        resp.pipe(fs.createWriteStream(this.downloadPath))
      )
      .then(() => new Promise((resolve, reject) => {
        setTimeout(resolve, 100);
      }));
    });
  },

  installKite(opts) {
    opts = opts || {};
    var env = Object.create(process.env);
    env.KITE_SKIP_ONBOARDING = '1';

    utils.guardCall(opts.onInstallStart);
    return utils.execPromise(
      `"${this.KITE_INSTALLER_PATH}"` + ' --skip-onboarding --plugin-launch --channel=autocomplete-python',
      {env: env},
      'kite_install_error',
      'Unable to run Kite installer')
    .then(() => utils.guardCall(opts.onCopy))
    .then(() => fs.unlinkSync(this.KITE_INSTALLER_PATH))
    .then(() => utils.guardCall(opts.onRemove));
  },

  isKiteRunning() {
    return utils.spawnPromise(
      'tasklist',
      'tasklist_error',
      'Unable to run the tasklist command and verify whether kite is running or not')
    .then(stdout => {
      const procs = stdout.split('\n');
      if (procs.every(l => l.indexOf('kited.exe') === -1)) {
        throw new KiteStateError('Unable to find kited.exe process in the tasks list', {
          state: STATES.NOT_RUNNING,
        });
      }
    });
  },

  runKite() {
    return this.isKiteRunning()
    .catch(() => {
      var env = Object.create(process.env);
      env.KITE_SKIP_ONBOARDING = '1';
      delete env["ELECTRON_RUN_AS_NODE"];

      try {
        child_process.spawn(
          this.KITE_EXE_PATH,
          ['--plugin-launch', '--channel=autocomplete-python'],
          {detached: true, env: env});
      } catch (err) {
        throw new KiteProcessError('kite_exe_error',
          {
            message: 'Unable to run kite executable',
            callStack: err.stack,
            cmd: this.KITE_EXE_PATH,
            options: {detached: true, env: env},
          });
      }
    });
  },

  isKiteEnterpriseRunning() {
    return Promise.reject(new KiteStateError('Kite Enterprise is currently not supported on windows', {
      state: STATES.UNSUPPORTED,
    }));
  },

  runKiteEnterprise() {
    return Promise.reject(new KiteStateError('Kite Enterprise is currently not supported on windows', {
      state: STATES.UNSUPPORTED,
    }));
  },
};

module.exports = WindowsSupport;


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const os = __webpack_require__(6);
const fs = __webpack_require__(28);
const path = __webpack_require__(27);
const https = __webpack_require__(11);
const child_process = __webpack_require__(16);

const utils = __webpack_require__(123);
const KiteStateError = __webpack_require__(126);
const KiteProcessError = __webpack_require__(125);

const {STATES} = __webpack_require__(127);

const LinuxSupport = {
  RELEASE_URL: 'https://linux.kite.com/dls/linux/current',
  SESSION_FILE_PATH: path.join(os.homedir(), '.kite', 'session.json'),
  KITE_DEB_PATH: '/tmp/kite-installer.deb',
  KITED_PATH: path.join(os.homedir(), '.local', 'share', 'kite', 'kited'),
  FALLBACK_KITED_PATH: '/opt/kite/kited',
  KITED_PROCESS: /kited/,
  KITE_CURRENT_LINK: '/opt/kite/current',

  memKitedInstallPath: null,

  get releaseURL() {
    return this.RELEASE_URL;
  },

  get downloadPath() {
    return this.KITE_DEB_PATH;
  },

  get installPath() {
    if (!this.memKitedInstallPath) {
      if (fs.existsSync(this.KITED_PATH)) {
        this.memKitedInstallPath = this.KITED_PATH;
      } else {
        this.memKitedInstallPath = this.FALLBACK_KITED_PATH;
      }
    }
    return this.memKitedInstallPath;
  },

  resetInstallPath() {
    this.memKitedInstallPath = null;
  },

  get allInstallPaths() {
    return [this.installPath];
  },

  get enterpriseInstallPath() {
    return null;
  },

  get allEnterpriseInstallPaths() {
    return null;
  },

  get sessionFilePath() {
    return this.SESSION_FILE_PATH;
  },

  hasManyKiteInstallation() {
    return this.allInstallPaths.length > 1;
  },

  hasManyKiteEnterpriseInstallation() {
    return false;
  },

  isAdmin() {
    try {
      const user = utils.whoami();
      const adminUsers = String(child_process.execSync('getent group root adm admin sudo'))
      .split('\n')
      .map(line => line.substring(line.lastIndexOf(':') + 1))
      .reduce((acc, val) => {
        val.split(',').forEach(token => acc.push(token.trim()));
        return acc;
      }, []);
      return adminUsers.includes(user);
    } catch (e) {
      return false;
    }
  },

  arch() {
    return os.arch();
  },

  isOSSupported() {
    return true;
  },

  isOSVersionSupported() {
    return true;
  },

  isKiteSupported() {
    return this.isOSSupported() && this.isOSVersionSupported();
  },

  isKiteInstalled() {
    return new Promise((resolve, reject) => {
      fs.exists(this.installPath, exists => {
        if (exists) {
          resolve();
        } else {
          reject(new KiteStateError('', {
            state: STATES.UNINSTALLED,
          }));
        }
      });
    });
  },

  // TODO(dane): move outside of specific adapter with same methods in osx and windows
  downloadKiteRelease(opts) {
    return this.downloadKite(this.releaseURL, opts || {});
  },

  downloadKite(url, opts) {
    // TODO(dane): move outside of specific adapter with same methods in osx and windows
    opts = opts || {};
    return this.streamKiteDownload(url, opts.onDownloadProgress)
    .then(() => utils.guardCall(opts.onDownload))
    .then(() => opts.install && this.installKite(opts));
  },

  // TODO(dane): move outside of specific adapter with same methods in osx and windows
  streamKiteDownload(url, progress) {
    const req = https.request(url);
    req.end();

    return utils.followRedirections(req)
    .then(resp => {
      if (progress) {
        const total = parseInt(resp.headers['content-length'], 10);
        let length = 0;

        resp.on('data', chunk => {
          length += chunk.length;
          progress(length, total, length / total);
        });
      }
      return utils.promisifyStream(
        resp.pipe(fs.createWriteStream(this.downloadPath))
      )
      .then(() => new Promise((resolve, reject) => {
        setTimeout(resolve, 100);
      }));
    });
  },

  installKite(opts) {
    opts = opts || {};

    utils.guardCall(opts.onInstallStart);
    return utils.spawnPromise(
      'apt',
      ['install', '-f', this.KITE_DEB_PATH],
      { gid: 27 }, //sudo group
      'apt install error',
      'unable to install kite from kite-installer.deb')
    .catch((err) => {
      // if permissions error, send message directing how complete with
      // given deb path
      if (err.code === 'EPERM' || err.errno === 'EPERM') {
        throw new KiteProcessError('kite-installer.deb EPERM', {
          message: `Installing ${this.KITE_DEB_PATH} failed due to lacking root permissions.
          In your command line, try running \`sudo apt install -f ${this.KITE_DEB_PATH}\` to finish installing Kite`,
          cmd: `apt install -f ${this.KITE_DEB_PATH}`,
        });
      } else {
        throw err;
      }
    })
    .then(() => this.resetInstallPath()) // force recalculation of mem'd path on successful install
    .then(() => utils.guardCall(opts.onMount))
    .then(() => fs.unlinkSync(this.KITE_DEB_PATH))
    .then(() => utils.guardCall(opts.onRemove));
  },

  isKiteRunning() {
    return utils.spawnPromise(
      '/bin/ps',
      ['-axo', 'pid,command'],
      {encoding: 'utf-8'},
      'ps_error',
      'unable to run the ps command and verify that Kite is running')
    .then(stdout => {
      const procs = stdout.split('\n');

      if (!procs.some(p => this.KITED_PROCESS.test(p))) {
        throw new KiteStateError('Kite process could not be found in the processes list', {
          state: STATES.NOT_RUNNING,
        });
      }
    });
  },

  runKite() {
    return this.isKiteRunning()
    .catch(() => {
      const env = Object.assign({}, process.env);
      env.SKIP_KITE_ONBOARDING = '1';
      delete env['ELECTRON_RUN_AS_NODE'];

      try {
        if (!fs.existsSync(this.installPath)) {
          throw new Error('kited is not installed');
        }
        child_process.spawn(
          this.installPath,
          ['--plugin-launch', '--channel=autocomplete-python'],
          { detached: true, env });
      } catch (e) {
        throw new KiteProcessError('kited_error',
          {
            message: (e.message && e.message === 'kited is not installed') || 'unable to run kited binary',
            callStack: e.stack,
            cmd: this.installPath,
            options: { detached: true, env },
          });
      }
    });
  },

  hasBothKiteInstalled() {
    return Promise.all([
      this.isKiteInstalled(),
      this.isKiteEnterpriseInstalled(),
    ]);
  },

  isKiteEnterpriseInstalled() {
    return this.notSupported();
  },

  isKiteEnterpriseRunning() {
    return this.notSupported();
  },

  runKiteEnterprise() {
    return this.notSupported();
  },

  notSupported() {
    return Promise.reject(
      new KiteStateError('Your platform is currently not supported', {
        state: STATES.UNSUPPORTED,
      }));
  },
};

module.exports = LinuxSupport;


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const KiteStateError = __webpack_require__(126);

const {STATES} = __webpack_require__(127);

module.exports = {
  get releaseURL() {
    return null;
  },

  get downloadPath() {
    return null;
  },

  get installPath() {
    return null;
  },

  get allInstallPaths() {
    return null;
  },

  get enterpriseInstallPath() {
    return null;
  },

  get allEnterpriseInstallPaths() {
    return null;
  },

  get sessionFilePath() {
    return null;
  },

  hasManyKiteInstallation() {
    return false;
  },

  hasManyKiteEnterpriseInstallation() {
    return false;
  },

  isAdmin() {
    return false;
  },

  arch() {
    return null;
  },

  isOSSupported() {
    return false;
  },

  isOSVersionSupported() {
    return false;
  },

  isKiteSupported() {
    return false;
  },

  isKiteInstalled() {
    return this.notSupported();
  },

  downloadKite(opts) {
    return this.notSupported();
  },

  installKite(opts) {
    return this.notSupported();
  },

  isKiteRunning() {
    return this.notSupported();
  },

  runKite() {
    return this.notSupported();
  },

  hasBothKiteInstalled() {
    return Promise.all([
      this.isKiteInstalled(),
      this.isKiteEnterpriseInstalled(),
    ]);
  },

  isKiteEnterpriseInstalled() {
    return this.notSupported();
  },

  isKiteEnterpriseRunning() {
    return this.notSupported();
  },

  runKiteEnterprise() {
    return this.notSupported();
  },

  notSupported() {
    return Promise.reject(
      new KiteStateError('Your platform is currently not supported', {
        state: STATES.UNSUPPORTED,
      }));
  },
};


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class EditorConfig {
  constructor(store) {
    this.store = store;
  }

  get(path) {
    return (this.content
      ? Promise.resolve(this.content)
      : this.store.get()
        .then(data => parse(data))
        .then(data => {
          this.content = data;
          return data;
        }))
    .then(data => readValueAtPath(path, data));
  }

  set(path, value) {
    return this.get().then(data =>
      this.store.set(stringify(writeValueAtPath(path, value, data))));
  }
};

function parse(data) {
  return data ? JSON.parse(data) : data;
}

function stringify(data) {
  return JSON.stringify(data);
}

function readValueAtPath(path, object) {
  if (!path) { return object; }

  return path.split(/\./g).reduce((memo, key) => {
    if (memo == undefined) { return memo; }
    return memo[key];
  }, object);
}

function writeValueAtPath(path, value, object) {
  if (!object) { object = {}; }

  return path.split(/\./g).reduce((memo, key, i, a) => {
    if (i === a.length - 1) {
      memo[key] = value;
      return object;
    } else if (memo[key] == undefined) {
      memo[key] = {};
      return memo[key];
    }
    return memo[key];
  }, object);
}


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class MemoryStore {
  constructor() {}

  set(content) {
    this.content = content;
    return Promise.resolve();
  }
  get() {
    return Promise.resolve(this.content);
  }
};


/***/ }),
/* 136 */
/***/ (function(module, exports) {


// MAX_FILE_SIZE is the maximum file size to send to Kite
const MAX_FILE_SIZE = Math.pow(2, 20); // 1048576

// MAX_PAYLOAD_SIZE is the maximum length for a POST reqest body
const MAX_PAYLOAD_SIZE = Math.pow(2, 21); // 2097152

module.exports = {
  MAX_FILE_SIZE,
  MAX_PAYLOAD_SIZE,
};


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function merge(a, b) {
  const c = {};
  for (const k in a) { c[k] = a[k]; }
  for (const k in b) { c[k] = b[k]; }
  return c;
}

function reject(key, a) {
  const b = {};
  for (const k in a) {
    if (k !== key) { b[k] = a[k]; }
  }
  return b;
}

function parseSignature(fn) {
  const [, name, signature] = /(\w+)\(([^\)]+)\)/.exec(fn.toString());
  const parameters = signature.split(/,\s*/);
  return [name, parameters];
}

function checkArguments(fn, ...args) {
  const [name, parameters] = parseSignature(fn);
  const missingArguments = [];
  args.forEach((arg, i) => {
    if (arg == null) { missingArguments.push(parameters[i]); }
  });
  if (missingArguments.length) {
    throw new Error(
      `Missing argument${missingArguments.length > 1 ? 's' : ''} ${missingArguments.join(', ')} in ${name}`);
  }
}

function checkArgumentKeys(fn, arg, argName, ...keys) {
  const missingKeys = [];
  keys.forEach((key, i) => {
    if (arg[key] == null) { missingKeys.push(key); }
  });
  if (missingKeys.length) {
    throw new Error(
      `Missing mandatory key${
        missingKeys.length > 1 ? 's' : ''
      } ${missingKeys.join(', ')} in argument ${argName} of ${fn.name}`);
  }
}

module.exports = {
  checkArgumentKeys,
  checkArguments,
  merge,
  reject,
};


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const md5 = __webpack_require__(52);

function hoverPath(filename, source, position, editor) {
  const state = md5(source);
  const buffer = cleanPath(filename);
  return [
    `/api/buffer/${editor}/${buffer}/${state}/hover`,
    `cursor_runes=${position}`,
  ].join('?');
}

function membersPath(id, page, limit) {
  return [
    `/api/editor/value/${id}/members`,
    [
      `offset=${page}`,
      `limit=${limit}`,
    ].join('&'),
  ].join('?');
}

function usagesPath(id, page, limit) {
  return [
    `/api/editor/value/${id}/usages`,
    [
      `offset=${page}`,
      `limit=${limit}`,
    ].join('&'),
  ].join('?');
}

function shouldNotifyPath(path) {
  return `/clientapi/permissions/notify?filename=${encodeURI(path)}`;
}

function statusPath(path) {
  return `/clientapi/status?filename=${encodeURI(path)}`;
}

function projectDirPath(path) {
  return `/clientapi/projectdir?filename=${encodeURI(path)}`;
}

function cleanPath(p) {
  return encodeURI(p)
  .replace(/^([A-Z]):/, '/windows/$1')
  .replace(/\/|\\|%5C/g, ':');
}

module.exports = {
  cleanPath,
  hoverPath,
  membersPath,
  projectDirPath,
  shouldNotifyPath,
  statusPath,
  usagesPath,
};


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {LEVELS} = __webpack_require__(127);
const NullReporter = __webpack_require__(140);
const ConsoleReporter = __webpack_require__(141);

module.exports =  {
  LEVELS,
  LEVEL: LEVELS.INFO,

  output: typeof console != 'undefined' ? ConsoleReporter : NullReporter,

  silly(...msgs) { this.log(LEVELS.SILLY, ...msgs); },
  verbose(...msgs) { this.log(LEVELS.VERBOSE, ...msgs); },
  debug(...msgs) { this.log(LEVELS.DEBUG, ...msgs); },
  info(...msgs) { this.log(LEVELS.INFO, ...msgs); },
  warn(...msgs) { this.log(LEVELS.WARNING, ...msgs); },
  error(...msgs) { this.log(LEVELS.ERROR, ...msgs); },
  log(level, ...msgs) {
    if (level >= this.LEVEL && !this.SILENT) {
      this.output.log(level, ...msgs);
    }
  },
  logRequest() {},
  logResponse() {},
};


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  log() {},
};


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {LEVELS} = __webpack_require__(127);

module.exports = {
  TRACE_ALL: false,
  METHODS: {
    [LEVELS.SILLY]: 'debug' in console ? 'debug' : 'log',
    [LEVELS.VERBOSE]: 'debug' in console ? 'debug' : 'log',
    [LEVELS.DEBUG]: 'log',
    [LEVELS.INFO]: 'info' in console ? 'info' : 'log',
    [LEVELS.WARNING]: 'warn' in console ? 'warn' : 'error',
    [LEVELS.ERROR]: 'error',
  },

  log(level, ...msgs) {
    console[this.METHODS[level]](...msgs);
  },
};


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const fs = __webpack_require__(28);

const os = __webpack_require__(6);

const path = __webpack_require__(27);

const {
  Logger
} = __webpack_require__(7);

const configPath = path.join(path.dirname(atom.config.getUserConfigPath() || os.homedir()), 'kite-config.json');
var config = null;

(function () {
  try {
    Logger.verbose(`initializing localconfig from ${configPath}...`);
    var str = fs.readFileSync(configPath, {
      encoding: 'utf8'
    });
    config = JSON.parse(str);
  } catch (err) {
    config = {};
  }
})();

function persist() {
  var str = JSON.stringify(config, null, 2); // serialize with whitespace for human readability

  !atom.inSpecMode() && fs.writeFile(configPath, str, 'utf8', err => {
    if (err) {
      Logger.error(`failed to persist localconfig to ${configPath}`, err);
    }
  });
} // get gets a value from storage


function get(key, fallback) {
  return key in config ? config[key] : fallback;
} // set assigns a value to storage and asynchronously persists it to disk


function set(key, value) {
  config[key] = value;
  persist(); // will write to disk asynchronously
}

module.exports = {
  get: get,
  set: set
};

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const os = __webpack_require__(6);

const {
  CompositeDisposable,
  Emitter
} = __webpack_require__(2);

const KiteAPI = __webpack_require__(121);

const {
  STATES
} = KiteAPI;

const {
  fromSetting,
  all
} = __webpack_require__(144);

const toSentence = a => `${a.slice(0, -1).join(', ')} and ${a.pop()}`;

const KiteNotification = __webpack_require__(146);

const NotificationQueue = __webpack_require__(147);

const metrics = __webpack_require__(149);

class NotificationsCenter {
  get NOTIFIERS() {
    return {
      [STATES.UNSUPPORTED]: 'warnNotSupported',
      // [STATES.UNINSTALLED]: 'warnNotInstalled',
      // [STATES.INSTALLED]: 'warnNotRunning',
      [STATES.RUNNING]: 'warnNotReachable',
      [STATES.REACHABLE]: 'warnNotAuthenticated' // [STATES.WHITELISTED]: 'notifyReady',

    };
  }

  get NOTIFICATION_METRICS() {
    return {
      [STATES.UNSUPPORTED]: 'not-supported',
      // [STATES.UNINSTALLED]: 'not-installed',
      // [STATES.INSTALLED]: 'not-running',
      [STATES.RUNNING]: 'not-reachable',
      [STATES.REACHABLE]: 'not-authenticated' // [STATES.WHITELISTED]: 'ready',

    };
  }

  pauseNotifications() {
    this.paused = true;
  }

  resumeNotifications() {
    this.paused = false;
  }

  constructor(app) {
    this.app = app;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.lastShown = {};
    this.queue = new NotificationQueue();
    this.subscriptions.add(app.onDidGetState(({
      state,
      canNotify
    }) => {
      if (canNotify && this.shouldNotify(state)) {
        this.notify(state);
      }
    }));
    this.subscriptions.add(this.queue.onDidNotify(notification => {
      const {
        type,
        metric,
        key
      } = this.extractNotificationMetrics(notification);
      this.lastShown[key] = new Date();
      this.emit('did-notify', {
        notification: metric,
        type
      });
    }));
    this.subscriptions.add(this.queue.onDidClickNotificationButton(({
      notification,
      button
    }) => {
      const {
        type,
        metric
      } = this.extractNotificationMetrics(notification);
      this.emit('did-click-notification-button', {
        button: button.metric,
        notification: metric,
        type
      });
    }));
    this.subscriptions.add(this.queue.onDidDismissNotification(notification => {
      const {
        type,
        metric
      } = this.extractNotificationMetrics(notification);
      this.emit('did-dismiss-notification', {
        notification: metric,
        type
      });
    }));
    this.subscriptions.add(this.queue.onDidRejectNotification(notification => {
      const {
        type,
        metric
      } = this.extractNotificationMetrics(notification);
      this.emit('did-reject-notification', {
        notification: metric,
        type
      });
    }));
  }

  extractNotificationMetrics(notification) {
    const options = notification.options;
    const type = options.metricType || notification.level;
    const metric = typeof options.metric === 'number' ? this.NOTIFICATION_METRICS[options.metric] : options.metric;
    const key = options.key || options.metric;
    return {
      type,
      metric,
      key
    };
  }

  onDidNotify(listener) {
    return this.emitter.on('did-notify', listener);
  }

  onDidRejectNotification(listener) {
    return this.emitter.on('did-reject-notification', listener);
  }

  onDidDismissNotification(listener) {
    return this.emitter.on('did-dismiss-notification', listener);
  }

  onDidClickNotificationButton(listener) {
    return this.emitter.on('did-click-notification-button', listener);
  }

  activateForcedNotifications() {
    this.forceNotification = true;
  }

  deactivateForcedNotifications() {
    this.forceNotification = false;
  }

  dispose() {
    this.queue.abort();
    this.subscriptions.dispose();
    this.emitter.dispose();
    delete this.app;
    delete this.subscriptions;
    delete this.emitter;
  }

  notify(state) {
    this[this.NOTIFIERS[state]] && this[this.NOTIFIERS[state]](state);
  }

  onboardingNotifications(hasSeenOnboarding) {
    this.queue.addInfo('Kite is now integrated with Atom', {
      dismissable: true,
      description: 'Kite is an AI-powered programming assistant that shows you the right information at the right time to keep you in the flow.',
      buttons: [{
        text: 'Learn how to use Kite',

        onDidClick(dismiss) {
          atom.applicationDelegate.openExternal('http://help.kite.com/category/43-atom-integration');
          atom.config.set('kite.showWelcomeNotificationOnStartup', false);
          dismiss && dismiss();
        }

      }, {
        text: "Don't show this again",

        onDidClick(dismiss) {
          atom.config.set('kite.showWelcomeNotificationOnStartup', false);
          dismiss && dismiss();
        }

      }]
    }, {
      condition: all(fromSetting('kite.showWelcomeNotificationOnStartup'), () => !atom.inSpecMode())
    });
  }

  warnNotSupported(state) {
    let description = 'Sorry, the Kite engine only supports macOS and Windows at the moment.';

    switch (os.platform()) {
      case 'win32':
        const arch = KiteAPI.arch();

        if (arch !== '64bit') {
          description = `Sorry, the Kite engine only supports Windows7 and higher with a 64bit architecture.
          Your version is actually recognised as: ${arch}`;
        } else {
          description = 'Sorry, the Kite engine only supports Windows7 and higher.';
        }

        break;

      case 'darwin':
        description = 'Sorry, the Kite engine only supports OSX 10.10 (Yosemite) and higher.';
        break;

      case 'linux':
        description = 'Sorry, the Kite engine only supports Ubuntu 18.04 and higher';
        break;
    }

    this.queue.addError("Kite doesn't support your OS", {
      description,
      icon: 'circle-slash'
    }, {
      metric: state
    });
  }

  warnNotInstalled(state) {
    if (!this.app.wasInstalledOnce()) {
      this.queue.addWarning('The Kite engine is not installed', {
        description: 'Install Kite to get Python completions, documentation, and examples.',
        icon: 'circle-slash',
        buttons: [{
          text: 'Install Kite',
          metric: 'install',
          onDidClick: dismiss => {
            dismiss && dismiss();
            this.app && this.app.install();
          }
        }]
      }, {
        metric: state
      });
    }
  }

  warnNotRunning(state) {
    Promise.all([KiteAPI.isKiteInstalled().then(() => true)["catch"](() => false), KiteAPI.isKiteEnterpriseInstalled().then(() => true)["catch"](() => false)]).then(([kiteInstalled, kiteEnterpriseInstalled]) => {
      if (KiteAPI.hasManyKiteInstallation() || KiteAPI.hasManyKiteEnterpriseInstallation()) {
        this.queue.addWarning('The Kite engine is not running', {
          description: 'You have multiple versions of Kite installed. Please launch your desired one.',
          icon: 'circle-slash'
        }, {
          metric: state
        });
      } else if (kiteInstalled && kiteEnterpriseInstalled) {
        this.queue.addWarning('The Kite engine is not running', {
          description: 'Start the Kite background service to get Python completions, documentation, and examples.',
          icon: 'circle-slash',
          buttons: [{
            text: 'Start Kite',
            metric: 'start',
            onDidClick: dismiss => {
              dismiss && dismiss();
              this.app && this.app.start()["catch"](err => this.warnFailedStart(err));
            }
          }, {
            text: 'Start Kite Enterprise',
            metric: 'startEnterprise',
            onDidClick: dismiss => {
              dismiss && dismiss();
              this.app && this.app.startEnterprise()["catch"](err => this.warnFailedStartEnterprise(err));
            }
          }]
        }, {
          metric: state
        });
      } else if (kiteInstalled) {
        this.queue.addWarning('The Kite engine is not running', {
          description: 'Start the Kite background service to get Python completions, documentation, and examples.',
          icon: 'circle-slash',
          buttons: [{
            text: 'Start Kite',
            metric: 'start',
            onDidClick: dismiss => {
              dismiss && dismiss();
              this.app && this.app.start()["catch"](err => this.warnFailedStart(err));
            }
          }]
        }, {
          metric: state
        });
      } else if (kiteEnterpriseInstalled) {
        this.queue.addWarning('The Kite engine is not running', {
          description: 'Start the Kite background service to get Python completions, documentation, and examples.',
          icon: 'circle-slash',
          buttons: [{
            text: 'Start Kite Enterprise',
            metric: 'startEnterprise',
            onDidClick: dismiss => {
              dismiss && dismiss();
              this.app && this.app.startEnterprise()["catch"](err => this.warnFailedStartEnterprise(err));
            }
          }]
        }, {
          metric: state
        });
      }
    });
  }

  warnFailedStart(err) {
    this.queue.addError('Unable to start Kite engine', {
      description: JSON.stringify(err),
      buttons: [{
        text: 'Retry',
        metric: 'retry',
        onDidClick: dismiss => {
          dismiss && dismiss();
          this.app && this.app.start()["catch"](err => this.warnFailedStart(err));
        }
      }]
    }, {
      metric: 'launch'
    });
  }

  warnFailedStartEnterprise(err) {
    this.queue.addError('Unable to start Kite engine', {
      description: JSON.stringify(err),
      buttons: [{
        text: 'Retry',
        metric: 'retryEnterprise',
        onDidClick: dismiss => {
          dismiss && dismiss();
          this.app && this.app.startEnterprise()["catch"](err => this.warnFailedStartEnterprise(err));
        }
      }]
    }, {
      metric: 'launchEnterprise'
    });
  }

  warnNotReachable(state) {
    this.queue.addError('The Kite background service is running but not reachable', {
      description: 'Try killing Kite from the Activity Monitor.'
    }, {
      metric: state
    });
  }

  warnNotAuthenticated(state) {
    if (navigator.onLine && !document.querySelector('kite-login')) {
      this.queue.addWarning('You need to login to the Kite engine', {
        description: ['Kite needs to be authenticated to access', 'the index of your code stored on the cloud.'].join(' '),
        icon: 'circle-slash',
        buttons: [{
          text: 'Login',
          metric: 'login',
          onDidClick: dismiss => {
            dismiss && dismiss();
            this.app && this.app.login();
          }
        }]
      }, {
        metric: state
      });
    }
  }

  warnUnauthorized(err) {
    this.queue.addError('Unable to login', {
      description: JSON.stringify(err),
      buttons: [{
        text: 'Retry',
        metric: 'retry',
        onDidClick: dismiss => {
          dismiss && dismiss();
          this.app && this.app.login();
        }
      }]
    }, {
      metric: 'unauthorized'
    });
  }

  warnOnboardingFileFailure() {
    this.queue.addWarning('We were unable to open the tutorial', {
      description: 'We had an internal error setting up our interactive tutorial. Try again later, or email us at feedback@kite.com',
      buttons: [{
        text: 'OK',
        onDidClick: dismiss => dismiss && dismiss()
      }]
    });
  }

  notifyReady(state) {
    this.queue.addSuccess('The Kite engine is ready', {
      description: 'We checked that the autocomplete engine is installed, running, responsive, and authenticated.'
    }, {
      metric: state,
      metricType: 'notification'
    });
  }

  shouldNotify(state) {
    return this.forceNotification || this.app && this.app.kite.getModule('editors').hasActiveSupportedFile() && !this.lastShown[state] && !this.paused;
  }

  emit(...args) {
    this.emitter && this.emitter.emit(...args);
  }

  truncateLeft(string, length) {
    return string.length <= length ? string : `…${string.slice(string.length - length)}`;
  }

}

module.exports = NotificationsCenter;

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const MemoryStore = __webpack_require__(145);

const all = (...fs) => a => fs.every(f => f(a));

const any = (...fs) => a => fs.some(f => f(a));

const fromSetting = (key, value) => a => value ? atom.config.get(key) === value : atom.config.get(key);

const once = s => a => !once.store.getItem(`${s || ''}${a.id}`);

const oncePerWindow = s => a => !oncePerWindow.store.getItem(`${s || ''}${a.id}`);

once.store = localStorage;
oncePerWindow.store = new MemoryStore();
module.exports = {
  all,
  any,
  fromSetting,
  once,
  oncePerWindow
};

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class MemoryStore {
  constructor() {
    this.content = {};
  }

  setItem(key, content) {
    this.content[key] = String(content);
    return content;
  }

  getItem(key) {
    return this.content[key];
  }

  removeItem(key) {
    delete this.content[key];
  }

};

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {
  Emitter
} = __webpack_require__(2);

const capitalize = s => s.replace(/^\w/, m => m.toUpperCase());

const parameterize = s => s.toLowerCase().replace(/[^\w]+/g, '-');

module.exports = class KiteNotification {
  constructor(level, title, notificationOptions = {}, options = {}) {
    this.level = level;
    this.title = title;
    this.emitter = new Emitter();
    this.notificationOptions = notificationOptions;
    this.options = options;
    this.notificationOptions.dismissable = this.notificationOptions.dismissable != null ? this.notificationOptions.dismissable : true;
    this.id = options.id || parameterize(title);
  }

  onDidNotify(listener) {
    return this.emitter.on('did-notify', listener);
  }

  onDidRejectNotification(listener) {
    return this.emitter.on('did-reject-notification', listener);
  }

  onDidDismissNotification(listener) {
    return this.emitter.on('did-dismiss-notification', listener);
  }

  onDidClickNotificationButton(listener) {
    return this.emitter.on('did-click-notification-button', listener);
  }

  execute() {
    return new Promise((resolve, reject) => {
      const {
        condition,
        onDidDismiss
      } = this.options;

      if (!condition || condition()) {
        this.notification = atom.notifications[`add${capitalize(this.level)}`](this.title, this.notificationOptions);
        this.instrumentNotification(this.notification, res => {
          onDidDismiss && onDidDismiss(res);
          resolve(res);
        });
      } else {
        resolve();
      }
    });
  }

  dismiss() {
    this.notification && this.notification.dismiss();
  }

  instrumentNotification(notification, dismissCallback) {
    this.emitter.emit('did-notify', this);
    let actionTriggered;

    if (this.notificationOptions.buttons) {
      this.notificationOptions.buttons.forEach(button => {
        const {
          onDidClick
        } = button;

        button.onDidClick = () => {
          actionTriggered = button.text;
          this.emitter.emit('did-click-notification-button', {
            notification: this,
            button
          });
          onDidClick && onDidClick(() => notification.dismiss());
        };
      });
    }

    const sub = notification.onDidDismiss(() => {
      dismissCallback && dismissCallback(actionTriggered);

      if (actionTriggered) {
        this.emitter.emit('did-dismiss-notification', this);
      } else {
        this.emitter.emit('did-reject-notification', this);
      }

      this.emitter.dispose();
      sub.dispose();
    });
    return notification;
  }

};

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {
  Emitter,
  CompositeDisposable
} = __webpack_require__(2);

const KiteNotification = __webpack_require__(146);

const KiteModal = __webpack_require__(148);

module.exports = class NotificationQueue {
  constructor() {
    this.queue = [];
    this.promise = Promise.resolve();
    this.emitter = new Emitter();
  }

  onDidNotify(listener) {
    return this.emitter.on('did-notify', listener);
  }

  onDidRejectNotification(listener) {
    return this.emitter.on('did-reject-notification', listener);
  }

  onDidDismissNotification(listener) {
    return this.emitter.on('did-dismiss-notification', listener);
  }

  onDidClickNotificationButton(listener) {
    return this.emitter.on('did-click-notification-button', listener);
  }

  abort() {
    this.aborted = true;
    this.activeNotification && this.activeNotification.dismiss();
  }

  add(queuedNotification) {
    if (typeof queuedNotification == 'function') {
      return this.promise = this.promise.then(() => this.aborted ? null : queuedNotification()).then(notification => {
        this.activeNotification = notification;
        return this.execute(notification);
      }).then(() => {
        delete this.activeNotification;
      });
    } else {
      return this.promise = this.promise.then(() => {
        if (this.aborted) {
          return null;
        } else {
          this.activeNotification = queuedNotification;
          return this.execute(queuedNotification);
        }
      }).then(() => {
        delete this.activeNotification;
      });
    }
  }

  execute(notification) {
    if (notification) {
      this.subscribeToNotification(notification);
      return notification.execute();
    }

    return null;
  }

  subscribeToNotification(notification) {
    const sub = new CompositeDisposable();

    const forwardEvent = t => e => this.emitter.emit(t, e);

    const forwardEventAndDispose = t => e => {
      this.emitter.emit(t, e);
      sub.dispose();
    };

    sub.add(notification.onDidNotify(forwardEvent('did-notify')));
    sub.add(notification.onDidClickNotificationButton(forwardEvent('did-click-notification-button')));
    sub.add(notification.onDidDismissNotification(forwardEventAndDispose('did-dismiss-notification')));
    sub.add(notification.onDidRejectNotification(forwardEventAndDispose('did-reject-notification')));
  }

  addModal(item, options) {
    return this.add(new KiteModal(item, options));
  }

  addInfo(title, notificationOptions, queueOptions) {
    return this.add(new KiteNotification('info', title, notificationOptions, queueOptions));
  }

  addSuccess(title, notificationOptions, queueOptions) {
    return this.add(new KiteNotification('success', title, notificationOptions, queueOptions));
  }

  addWarning(title, notificationOptions, queueOptions) {
    return this.add(new KiteNotification('warning', title, notificationOptions, queueOptions));
  }

  addError(title, notificationOptions, queueOptions) {
    return this.add(new KiteNotification('error', title, notificationOptions, queueOptions));
  }

  addFatalError(title, notificationOptions, queueOptions) {
    return this.add(new KiteNotification('fatalError', title, notificationOptions, queueOptions));
  }

};

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const {
  Emitter
} = __webpack_require__(2);

module.exports = class KiteModal {
  constructor({
    content,
    buttons
  } = {}, options = {}) {
    this.content = content;
    this.buttons = buttons;
    this.options = options;
    this.emitter = new Emitter();
  }

  onDidNotify(listener) {
    return this.emitter.on('did-notify', listener);
  }

  onDidRejectNotification(listener) {
    return this.emitter.on('did-reject-notification', listener);
  }

  onDidDismissNotification(listener) {
    return this.emitter.on('did-dismiss-notification', listener);
  }

  onDidClickNotificationButton(listener) {
    return this.emitter.on('did-click-notification-button', listener);
  }

  dismiss() {
    this.destroy();
  }

  destroy() {
    this.modal.destroy();
    delete this.modal;
  }

  execute() {
    return new Promise((resolve, reject) => {
      const {
        condition,
        onDidDestroy
      } = this.options;

      if (!condition || condition()) {
        const item = document.createElement('div');
        item.innerHTML = this.content;

        if (this.buttons) {
          const buttons = document.createElement('div');
          buttons.className = 'modal-metrics-row';
          this.buttons.forEach((btn, i) => {
            const container = document.createElement('div');
            container.className = 'modal-metrics-cell';
            container.innerHTML = `
            <button tabindex="${i}"
                    class="btn btn-${btn.className || 'default'} btn-block">
              ${btn.text}
            </button>`;
            const button = container.querySelector('button');
            button.addEventListener('click', () => {
              btn.onDidClick && btn.onDidClick(this);
            });
            buttons.appendChild(container);
          });
          item.appendChild(buttons);
        }

        this.modal = atom.workspace.addModalPanel({
          item,
          autoFocus: true
        });
        const sub = this.modal.onDidDestroy(() => {
          onDidDestroy && onDidDestroy();
          sub.dispose();
          this.emitter.dispose();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

};

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var os = __webpack_require__(6);

const crypto = __webpack_require__(61);

const KiteAPI = __webpack_require__(121);

const {
  metricsCounterPath
} = __webpack_require__(150);

const localconfig = __webpack_require__(142);

const version = __webpack_require__(151).version;

const OS_VERSION = os.type() + ' ' + os.release();
const EDITOR_UUID = localStorage.getItem('metrics.userId'); // Generate a unique ID for this user and save it for future use.

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
  return !atom.inSpecMode() && KiteAPI.request({
    path,
    method: 'POST'
  }, JSON.stringify({
    name,
    value: 1
  }))["catch"](() => {});
}

function featureRequested(name) {
  sendFeatureMetric(`atom_${name}_requested`);
}

function featureFulfilled(name) {
  sendFeatureMetric(`atom_${name}_fulfilled`);
}

function featureApplied(name, suffix = '') {
  sendFeatureMetric(`atom_${name}_applied${suffix}`);
}

function getOsName() {
  switch (os.platform()) {
    case 'darwin':
      return 'macos';

    case 'win32':
      return 'windows';

    case 'linux':
      return 'linux';

    default:
      return '';
  }
}

module.exports = {
  distinctID,
  featureApplied,
  sendFeatureMetric,
  featureRequested,
  featureFulfilled,
  getOsName,
  version,
  EDITOR_UUID,
  OS_VERSION
};

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const md5 = __webpack_require__(52);

const {
  Point,
  Range
} = __webpack_require__(2);

const {
  head
} = __webpack_require__(5);

function tokensPath(editor) {
  const state = md5(editor.getText());
  const filename = editor.getPath();
  const buffer = cleanPath(filename);
  return `/api/buffer/atom/${buffer}/${state}/tokens`;
}

function languagesPath() {
  return '/clientapi/languages';
}

function metricsCounterPath() {
  return '/clientapi/metrics/counters';
}

function accountPath() {
  return '/api/account/user';
}

function signaturePath() {
  return '/clientapi/editor/signatures';
}

function authorizedPath(editor) {
  return `/clientapi/permissions/authorized?filename=${encodeURI(editor.getPath())}`;
}

function searchPath(query, offset = 0, limit = 10) {
  return ['/api/editor/search', [`q=${encodeURI(query)}`, `offset=${offset}`, `limit=${limit}`].join('&')].join('?');
}

function projectDirPath(path) {
  return ['/clientapi/projectdir', `filename=${encodeURI(path)}`].join('?');
}

function shouldNotifyPath(path) {
  return ['/clientapi/permissions/notify', `filename=${encodeURI(path)}`].join('?');
}

function completionsPath() {
  return '/clientapi/editor/completions';
}

function statusPath(path) {
  return ['/clientapi/status', `filename=${encodeURI(path)}`].join('?');
}

function reportPath(data) {
  const value = head(head(data.symbol).value);
  return valueReportPath(value.id);
}

function valueReportPath(id) {
  return `/api/editor/value/${id}`;
}

function symbolReportPath(id) {
  return `/api/editor/symbol/${id}`;
}

function membersPath(id, page = 0, limit = 999) {
  return [`/api/editor/value/${id}/members`, [`offset=${page}`, `limit=${limit}`].join('&')].join('?');
}

function usagesPath(id, page = 0, limit = 999) {
  return [`/api/editor/value/${id}/usages`, [`offset=${page}`, `limit=${limit}`].join('&')].join('?');
}

function usagePath(id) {
  return `/api/editor/usages/${id}`;
}

function examplePath(id) {
  return `/api/python/curation/${id}`;
}

function openExampleInWebURL(id) {
  return `http://localhost:46624/clientapi/desktoplogin?d=/examples/python/${escapeId(id)}`;
}

function hoverPath(editor, range) {
  range = Range.fromObject(range);
  const state = md5(editor.getText());
  const filename = editor.getPath();
  const buffer = cleanPath(filename);
  const start = editor.getBuffer().characterIndexForPosition(range.start);
  const end = editor.getBuffer().characterIndexForPosition(range.end);
  return [`/api/buffer/atom/${buffer}/${state}/hover`, [`selection_begin_runes=${start}`, `selection_end_runes=${end}`].join('&')].join('?');
}

function hoverPositionPath(editor, position) {
  position = Point.fromObject(position);
  const state = md5(editor.getText());
  const filename = editor.getPath();
  const buffer = cleanPath(filename);
  const pos = editor.getBuffer().characterIndexForPosition(position);
  return [`/api/buffer/atom/${buffer}/${state}/hover`, `cursor_runes=${pos}`].join('?');
}

function escapeId(id) {
  return encodeURI(String(id)).replace(/;/g, '%3B');
}

function cleanPath(p) {
  return encodeURI(p).replace(/^([A-Z]):/, '/windows/$1').replace(/\/|\\|%5C/g, ':');
}

function internalURL(path) {
  return `kite-atom-internal://${path}`;
}

function internalGotoURL(def) {
  return internalURL(`goto/${encodeURI(def.filename)}:${def.line}`);
}

function internalGotoIdURL(id) {
  return internalURL(`goto-id/${id}`);
}

function internalExpandURL(id) {
  return internalURL(`expand/${id}`);
}

function internalGotoRangeURL(range) {
  return internalURL(`goto-range/${serializeRangeForPath(range)}`);
}

function internalOpenRangeInWebURL(range) {
  return internalURL(`open-range/${serializeRangeForPath(range)}`);
}

function internalExpandPositionURL(position) {
  return internalURL(`expand-position/${serializePositionForPath(position)}`);
}

function internalGotoPositionURL(position) {
  return internalURL(`goto-position/${serializePositionForPath(position)}`);
}

function internalOpenPositionInWebURL(position) {
  return internalURL(`open-position/${serializePositionForPath(position)}`);
}

function serializeRangeForPath(range) {
  return `${serializePositionForPath(range.start)}/${serializePositionForPath(range.end)}`;
}

function serializePositionForPath(position) {
  return `${position.row}:${position.column}`;
}

module.exports = {
  accountPath,
  authorizedPath,
  completionsPath,
  examplePath,
  hoverPath,
  hoverPositionPath,
  internalExpandPositionURL,
  internalExpandURL,
  internalGotoIdURL,
  internalGotoPositionURL,
  internalGotoRangeURL,
  internalGotoURL,
  internalOpenPositionInWebURL,
  internalOpenRangeInWebURL,
  internalURL,
  languagesPath,
  membersPath,
  metricsCounterPath,
  openExampleInWebURL,
  projectDirPath,
  reportPath,
  searchPath,
  serializeRangeForPath,
  shouldNotifyPath,
  signaturePath,
  statusPath,
  symbolReportPath,
  tokensPath,
  usagePath,
  usagesPath,
  valueReportPath
};

/***/ }),
/* 151 */
/***/ (function(module) {

module.exports = {"name":"kite","main":"./dist/main","version":"0.157.0","description":"Python coding assistant featuring AI-powered autocompletions, advanced function signatures, and instant documentation","repository":"https://github.com/kiteco/atom-plugin","keywords":[],"license":"SEE LICENSE IN LICENSE","engines":{"atom":">=1.0.0 <2.0.0"},"scripts":{"lint":"eslint .","lint:fix":"eslint --fix .","build-prod":"webpack --config config/webpack.config.js --mode production","prepublishOnly":"rm -rf node_modules && rm -f package-lock.json && apm install && rm -rf dist && npm run build-prod","build-dev":"webpack --config config/webpack.config.js --mode none","clean-dev-install":"apm unlink && rm -rf node_modules && rm -f package-lock.json && apm install && rm -rf dist && npm run build-dev && apm link"},"configSchema":{"showWelcomeNotificationOnStartup":{"type":"boolean","default":true,"title":"Show welcome notification on startup","description":"Whether or not to show the Kite welcome notification on startup."},"enableCompletions":{"type":"boolean","default":true,"title":"Enable completions","description":"Automatically show completions from Kite as you type."},"enableHoverUI":{"type":"boolean","default":true,"title":"Enable hover","description":"Show a quick summary of a symbol when you hover your mouse over it."},"enableSnippets":{"type":"boolean","default":false,"title":"Enable snippets","description":"Enable snippets feature (Experimental)"},"maxVisibleSuggestionsAlongSignature":{"type":"integer","default":5,"title":"Completions limit with function signature","description":"Maximum number of completions that can be shown when a function signature is also shown."},"loggingLevel":{"type":"string","default":"info","enum":["silly","verbose","debug","info","warning","error"],"title":"Logging level","description":"The verbosity level of Kite logs."},"pollingInterval":{"type":"integer","default":15000,"min":1000,"max":60000,"title":"Polling interval","description":"Interval in milliseconds at which the Kite package polls Kite Engine to get the status of the current file."},"developerMode":{"type":"boolean","default":false,"title":"Developer mode","description":"Displays JSON data from Kite Engine that's used when rendering a UI element."},"startKiteAtStartup":{"type":"boolean","default":true,"title":"Start Kite Engine on startup","description":"Automatically start Kite Engine on editor startup if it's not already running."},"signatureKwargsVisible":{"type":"boolean","default":false,"title":"Show function keyword arguments","description":"Show inferred keyword arguments for a function when the function signature panel is shown"},"signaturePopularPatternsVisible":{"type":"boolean","default":false,"title":"Show function call examples","description":"Show examples on how to call a function when the function signature panel is shown"}},"providedServices":{"autocomplete.provider":{"versions":{"2.0.0":"completions"}}},"consumedServices":{"status-bar":{"versions":{"^1.0.0":"consumeStatusBar"}}},"dependencies":{"analytics-node":"^3.1.1","element-resize-detector":"^1.1.11","fuzzaldrin-plus":"^0.4.1","getmac":"1.2.1","kite-installer":"^3.2.0","kite-api":"git://github.com/kiteco/kite-api-js.git#ksg-endpoints","kite-connector":"^3.0.0","md5":"^2.2.0","rollbar":"^2.3.8","underscore-plus":"^1","tiny-relative-date":"^1.3.0"},"devDependencies":{"@babel/core":"^7.4.3","@babel/preset-env":"^7.4.3","babel-eslint":"^6.1.2","babel-loader":"^8.0.5","editors-json-tests":"git://github.com/kiteco/editors-json-tests.git#master","eslint":"^3.11.1","eslint-config":"^0.3.0","eslint-config-fbjs":"^1.1.1","eslint-plugin-babel":"^3.3.0","eslint-plugin-flowtype":"^2.29.1","eslint-plugin-jasmine":"^2.2.0","eslint-plugin-prefer-object-spread":"^1.1.0","eslint-plugin-react":"^5.2.2","fbjs":"^0.8.6","javascript-obfuscator":"^0.8.3","sinon":"^2.3.5","webpack":"^4.30.0","webpack-cli":"^3.3.0"}};

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const kitePkg = __webpack_require__(151);

const {
  distinctID,
  EDITOR_UUID,
  OS_VERSION
} = __webpack_require__(149);

if (!atom.inSpecMode()) {
  window._rollbarConfig = {
    accessToken: 'd1aa81c4290d409e847153a29b2872b3',
    autoInstrument: false,
    payload: {
      environment: 'production',
      distinctID: distinctID(),
      editor_uuid: EDITOR_UUID,
      editor: 'atom',
      atom_version: atom.getVersion(),
      kite_plugin_version: kitePkg.version,
      os: OS_VERSION
    }
  }; // We still want to load the browser version for security purpose

  __webpack_require__(153);

  class RollbarReporter {
    constructor() {
      this.subscription = atom.onDidThrowError(({
        column,
        line,
        message,
        originalError,
        url
      }) => {
        // We're only concerned by errors that originate or involve our code
        // but not when working on it.
        if (/\/kite\/|\/kite-installer\//.test(originalError.stack) && !/kite$/.test(atom.project.getPaths()[0] || '')) {
          window.Rollbar.error(originalError);
        }
      });
    }

    dispose() {
      this.subscription && this.subscription.dispose();
    }

  }

  module.exports = RollbarReporter;
} else {
  module.exports = class Dummy {
    dispose() {}

  };
}

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var merge = __webpack_require__(9);

var RollbarJSON = {};
var __initRollbarJSON = false;
function setupJSON() {
  if (__initRollbarJSON) {
    return;
  }
  __initRollbarJSON = true;

  if (isDefined(JSON)) {
    if (isNativeFunction(JSON.stringify)) {
      RollbarJSON.stringify = JSON.stringify;
    }
    if (isNativeFunction(JSON.parse)) {
      RollbarJSON.parse = JSON.parse;
    }
  }
  if (!isFunction(RollbarJSON.stringify) || !isFunction(RollbarJSON.parse)) {
    var setupCustomJSON = __webpack_require__(10);
    setupCustomJSON(RollbarJSON);
  }
}
setupJSON();

/*
 * isType - Given a Javascript value and a string, returns true if the type of the value matches the
 * given string.
 *
 * @param x - any value
 * @param t - a lowercase string containing one of the following type names:
 *    - undefined
 *    - null
 *    - error
 *    - number
 *    - boolean
 *    - string
 *    - symbol
 *    - function
 *    - object
 *    - array
 * @returns true if x is of type t, otherwise false
 */
e.exports=function(e){return null!=e&&(n(e)||function(e){return"function"==typeof e.readFloatLE&&"function"==typeof e.slice&&n(e.slice(0,0))}(e)||!!e._isBuffer)}},function(e,t,n){"use strict";e.exports=function(e){var t=null;return{trackUncaught:()=>{null===t&&(t=window.onerror,window.onerror=((t,n,i,a,o)=>{e.trackEvent("uncaught error",{uncaughtError:{msg:t,url:n,line:i,col:a}})}))},ignoreUncaught:()=>{null!==t&&(window.onerror=t,t=null)}}}},function(e,t,n){"use strict";e.exports={log(){}}},function(e,t,n){"use strict";const{LEVELS:i}=n(13);e.exports={TRACE_ALL:!1,METHODS:{[i.SILLY]:"debug"in console?"debug":"log",[i.VERBOSE]:"debug"in console?"debug":"log",[i.DEBUG]:"log",[i.INFO]:"info"in console?"info":"log",[i.WARNING]:"warn"in console?"warn":"error",[i.ERROR]:"error"},log(e,...t){console[this.METHODS[e]](...t)}}},function(e,t,n){var i=n(9),a=n(4),o=n(33),s=n(98).Buffer,r=n(16),c={http:i,https:a},l=function(e,t){var n={};if(!e)throw new Error("The Mixpanel Client needs a Mixpanel token: `init(token)`");n.config={test:!1,debug:!1,verbose:!1,host:"api.mixpanel.com",protocol:"http"},n.token=e,n.send_request=function(e,t,i){i=i||function(){};var a={data:new s(JSON.stringify(t)).toString("base64"),ip:0,verbose:n.config.verbose?1:0},r=c[n.config.protocol];if(!r)throw new Error("Mixpanel Initialization Error: Unsupported protocol "+n.config.protocol+". Supported protocols are: "+Object.keys(c));if("/import"===e){var l=n.config.key;if(!l)throw new Error("The Mixpanel Client needs a Mixpanel api key when importing old events: `init(token, { key: ... })`");a.api_key=l}var u={host:n.config.host,port:n.config.port,headers:{}};n.config.test&&(a.test=1);var p=o.stringify(a);u.path=[e,"?",p].join(""),r.get(u,function(e){var t="";e.on("data",function(e){t+=e}),e.on("end",function(){var e;if(n.config.verbose)try{var a=JSON.parse(t);1!=a.status&&(e=new Error("Mixpanel Server Error: "+a.error))}catch(t){e=new Error("Could not parse response from Mixpanel")}else e="1"!==t?new Error("Mixpanel Server Error: "+t):void 0;i(e)})}).on("error",function(e){n.config.debug&&console.log("Got Error: "+e.message),i(e)})},n.track=function(e,t,i){"function"!=typeof t&&t||(i=t,t={});var a="number"==typeof t.time?"/import":"/track";t.token=n.token,t.mp_lib="node";var o={event:e,properties:t};n.config.debug&&(console.log("Sending the following event to Mixpanel:"),console.log(o)),n.send_request(a,o,i)};var i=function(e){if(void 0===e)throw new Error("Import methods require you to specify the time of the event");return"[object Date]"===Object.prototype.toString.call(e)&&(e=Math.floor(e.getTime()/1e3)),e};n.import=function(e,t,a,o){"function"!=typeof a&&a||(o=a,a={}),a.time=i(t),n.track(e,a,o)},n.import_batch=function(e,t,a){var o=50,s=e.length,r=s,c=0,l=0,u=[];"function"!=typeof t&&t||(a=t,t={}),t.max_batch_size&&(r=t.max_batch_size,t.max_batch_size<o&&(o=t.max_batch_size));var p=function(){for(var t,r=[],d=l;d<s&&d<l+o;d++)(t=e[d].properties).time=i(t.time),t.token||(t.token=n.token),r.push(e[d]);r.length>0&&(n.send_request("/import",r,function(e){c+=r.length,e&&u.push(e),c<s?p():a&&a(u)}),l+=o)};n.config.debug&&console.log("Sending "+e.length+" events to Mixpanel in "+Math.ceil(s/o)+" requests");for(var d=0;d<r;d+=o)p()},n.alias=function(e,t,i){var a={distinct_id:e,alias:t};n.track("$create_alias",a,i)},n.people={set_once:function(e,t,n,i,a){var o={};"object"==typeof t?("object"==typeof n?(a=i,i=n):a=n,o=t):(o[t]=n,"function"!=typeof i&&i||(a=i)),(i=i||{}).set_once=!0,this._set(e,o,a,i)},set:function(e,t,n,i,a){var o={};"object"==typeof t?("object"==typeof n?(a=i,i=n):a=n,o=t):(o[t]=n,"function"!=typeof i&&i||(a=i)),this._set(e,o,a,i)},_set:function(e,t,i,o){var s=(o=o||{})&&o.set_once?"$set_once":"$set",r={$token:n.token,$distinct_id:e};r[s]=t,"ip"in t&&(r.$ip=t.ip,delete t.ip),t.$ignore_time&&(r.$ignore_time=t.$ignore_time,delete t.$ignore_time),r=a(r,o),n.config.debug&&(console.log("Sending the following data to Mixpanel (Engage):"),console.log(r)),n.send_request("/engage",r,i)},increment:function(e,t,i,o,s){var r={};"object"==typeof t?("object"==typeof i?(s=o,o=i):s=i,Object.keys(t).forEach(function(e){var i=t[e];isNaN(parseFloat(i))?n.config.debug&&(console.error("Invalid increment value passed to mixpanel.people.increment - must be a number"),console.error("Passed "+e+":"+i)):r[e]=i})):"number"!=typeof i&&i?"function"==typeof i?(s=i,r[t]=1):(s=o,o="object"==typeof i?i:{},r[t]=1):(i=i||1,r[t]=i,"function"==typeof o&&(s=o));var c={$add:r,$token:n.token,$distinct_id:e};c=a(c,o),n.config.debug&&(console.log("Sending the following data to Mixpanel (Engage):"),console.log(c)),n.send_request("/engage",c,s)},append:function(e,t,i,o,s){var r={};"object"==typeof t?("object"==typeof i?(s=o,o=i):s=i,Object.keys(t).forEach(function(e){r[e]=t[e]})):(r[t]=i,"function"==typeof o&&(s=o));var c={$append:r,$token:n.token,$distinct_id:e};c=a(c,o),n.config.debug&&(console.log("Sending the following data to Mixpanel (Engage):"),console.log(c)),n.send_request("/engage",c,s)},track_charge:function(e,t,i,o,s){if("function"!=typeof i&&i?"function"!=typeof o&&o||(s=o||function(){},(i.$ignore_time||i.hasOwnProperty("$ip"))&&(o={},Object.keys(i).forEach(function(e){o[e]=i[e],delete i[e]}))):(s=i||function(){},i={}),"number"!=typeof t&&(t=parseFloat(t),isNaN(t)))console.error("Invalid value passed to mixpanel.people.track_charge - must be a number");else{if(i.$amount=t,i.hasOwnProperty("$time")){var r=i.$time;"[object Date]"===Object.prototype.toString.call(r)&&(i.$time=r.toISOString())}var c={$append:{$transactions:i},$token:n.token,$distinct_id:e};c=a(c,o),n.config.debug&&(console.log("Sending the following data to Mixpanel (Engage):"),console.log(c)),n.send_request("/engage",c,s)}},clear_charges:function(e,t,i){var o={$set:{$transactions:[]},$token:n.token,$distinct_id:e};"function"==typeof t&&(i=t),o=a(o,t),n.config.debug&&console.log("Clearing this user's charges:",e),n.send_request("/engage",o,i)},delete_user:function(e,t,i){var o={$delete:"",$token:n.token,$distinct_id:e};"function"==typeof t&&(i=t),o=a(o,t),n.config.debug&&console.log("Deleting the user from engage:",e),n.send_request("/engage",o,i)},union:function(e,t,i,o){var s={};"object"!=typeof t||r.isArray(t)?n.config.debug&&console.error("Invalid value passed to mixpanel.people.union - data must be an object with array values"):(Object.keys(t).forEach(function(e){var i=t[e];if(r.isArray(i)){var a=i.filter(function(e){return"string"==typeof e||"number"==typeof e});a.length>0&&(s[e]=a)}else{if("string"!=typeof i&&"number"!=typeof i)return void(n.config.debug&&(console.error("Invalid argument passed to mixpanel.people.union - values must be a scalar value or array"),console.error("Passed "+e+":",i)));s[e]=[i]}}),0!==Object.keys(s).length&&(t={$union:s,$token:n.token,$distinct_id:e},"function"==typeof i&&(o=i),t=a(t,i),n.config.debug&&(console.log("Sending the following data to Mixpanel (Engage):"),console.log(t)),n.send_request("/engage",t,o)))},unset:function(e,t,i,o){var s=[];if(r.isArray(t))s=t;else{if("string"!=typeof t)return void(n.config.debug&&(console.error("Invalid argument passed to mixpanel.people.unset - must be a string or array"),console.error("Passed: "+t)));s=[t]}var c={$unset:s,$token:n.token,$distinct_id:e};"function"==typeof i&&(o=i),c=a(c,i),n.config.debug&&(console.log("Sending the following data to Mixpanel (Engage):"),console.log(c)),n.send_request("/engage",c,o)}};var a=function(e,t){return t&&(t.$ignore_alias&&(e.$ignore_alias=t.$ignore_alias),t.$ignore_time&&(e.$ignore_time=t.$ignore_time),t.hasOwnProperty("$ip")&&(e.$ip=t.$ip),t.hasOwnProperty("$time")&&(e.$time=i(t.$time))),e};return n.set_config=function(e){for(var t in e)if(e.hasOwnProperty(t))if("host"==t){n.config.host=e[t].split(":")[0];var i=e[t].split(":")[1];i&&(n.config.port=Number(i))}else n.config[t]=e[t]},t&&n.set_config(t),n};e.exports={Client:function(e){return console.warn("The function `Client(token)` is deprecated.  It is now called `init(token)`."),l(e)},init:l}},function(e,t){e.exports=require("buffer")},function(e,t,n){"use strict";const i=n(8),a=n(2),o=n(3),s=n(29),r="undefined"!=typeof atom&&atom.config.getUserConfigPath()?o.join(o.dirname(atom.config.getUserConfigPath()),"kite-config.json"):o.join(a.homedir(),".kite","kite-config.json");var c=null;try{s.verbose(`initializing localconfig from ${r}...`);var l=i.readFileSync(r,{encoding:"utf8"});c=JSON.parse(l)}catch(e){c={}}e.exports={get:function(e,t){return e in c?c[e]:t},set:function(e,t){var n;c[e]=t,n=JSON.stringify(c,null,2),i.writeFile(r,n,"utf8",e=>{e&&s.error(`failed to persist localconfig to ${r}`,e)})}}},function(e){e.exports={_args:[[{raw:"kite-installer@^3.2.0",scope:null,escapedName:"kite-installer",name:"kite-installer",rawSpec:"^3.2.0",spec:">=3.2.0 <4.0.0",type:"range"},"/Users/kite/atom-plugin"]],_from:"kite-installer@>=3.2.0 <4.0.0",_hasShrinkwrap:!1,_id:"kite-installer@3.8.0",_inCache:!0,_location:"/kite-installer",_nodeVersion:"11.12.0",_npmOperationalInternal:{host:"s3://npm-registry-packages",tmp:"tmp/kite-installer_3.8.0_1554337451659_0.9984139595740766"},_npmUser:{name:"dane-at-kite",email:"dane@kite.com"},_npmVersion:"6.7.0",_phantomChildren:{"form-data":"2.3.3",md5:"2.2.1"},_requested:{raw:"kite-installer@^3.2.0",scope:null,escapedName:"kite-installer",name:"kite-installer",rawSpec:"^3.2.0",spec:">=3.2.0 <4.0.0",type:"range"},_requiredBy:["/"],_resolved:"https://registry.npmjs.org/kite-installer/-/kite-installer-3.8.0.tgz",_shasum:"6a8c354b04a6a95d4577fdfee8ca4b3f94f754fb",_shrinkwrap:null,_spec:"kite-installer@^3.2.0",_where:"/Users/kite/atom-plugin",author:{name:"Daniel Hung"},dependencies:{"kite-api":"2.14.0","kite-connector":"2.8.0",mixpanel:"^0.5.0",rollbar:"^2.4.4"},description:"Javascript library to install and manage Kite",devDependencies:{"babel-eslint":"^7.1.1",codecov:"^1.0.0",eslint:"^3.6.0","eslint-config":"^0.3.0","eslint-config-fbjs":"^1.1.1","eslint-plugin-babel":"^4.0.0","eslint-plugin-flowtype":"^2.29.1","eslint-plugin-jasmine":"^2.2.0","eslint-plugin-prefer-object-spread":"^1.1.0","eslint-plugin-react":"^6.8.0","expect.js":"^0.3.1",fbjs:"^0.8.6",jsdom:"^9.8.3",mocha:"^5.2.0","mocha-jsdom":"^1.1.0",nyc:"^13.0.1",sinon:"^2.3.5"},directories:{},dist:{integrity:"sha512-92rNi6BKMmBMRMzdd0ET1gBn7a7g6EYejTAuer+yq2f1Z4jnEAZH1JHeZgn/ukULUol5sCNdbUDVbAk7mbLxVQ==",shasum:"6a8c354b04a6a95d4577fdfee8ca4b3f94f754fb",tarball:"https://registry.npmjs.org/kite-installer/-/kite-installer-3.8.0.tgz",fileCount:70,unpackedSize:3058926,"npm-signature":"-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJcpU6sCRA9TVsSAnZWagAAj8wP/13cf2Cds+7PXwGzFvFq\nKWR4Pa86NwzJCzGAcndILqgegJUol8cuajvC0i9nFuDAoEBLpjrj4qqVK7t8\ndqlIKSjm/+1MR4/HjFayZYLL/EvySoQ5ADHIs8lNvwXF/rRdFVAMsoqr6NBl\npNAvX1izsO4nKFKZsvtr1Uhkg51o5QQuD5Rx9zoztgnfvBxHzqlO5RojHiox\n5LGkN0fOMto7TgjYKW7BSPWF0sODYEm/eEPdedDpCnS0eYbMMzTf7dv8ASBv\nRtlWcBetpXLMl6n8rM3bp/lAd2r8cI6ApicgVZI9OldZyoiIiCwY2L3J/nhK\n9+Njw6boT1baROqitGqfLhuNXBtMndDywQMRqbQUKPV7LRFYxzL6GBQne7B8\nrpePQuHoglTNmaV6nej36BaWaWyXpnrRcAYGhwQJwidJE3h1cR/IfHvW7Ols\n57WXbsJ+tJ3UfjUgSNIvjOPfqq4MY5kdmSJG6cN7f8t7HfCW16dBp7L0Tr2t\nZFG3zjgcHIZUomGuBLCeNRVLosbP5VT0F8QqBF8EjS7EPlb8P+hfJ58+P0dB\n4ghcPOi3fw1TDQ+A+REaKHU62hB4QRmkJ5PybE2R/CmUs132+wG1ynedTfyk\njuUPyUOIc55Gk/YNkULiTncx4A0sHMMf/XGjpiD23aQWpTQTpFWPL+Oh0Ynk\ndef/\r\n=VDza\r\n-----END PGP SIGNATURE-----\r\n"},gitHead:"d89adbf0a62b3ffab604f7cf9f1639963c2b294c",keywords:[],license:"SEE LICENSE IN LICENSE",main:"./lib/index.js",maintainers:[{name:"abe33",email:"cedric.nehemie@gmail.com"},{name:"adamsmith",email:"adam@kite.com"},{name:"dane-at-kite",email:"dane@kite.com"},{name:"dbratz1177",email:"danebratz@gmail.com"},{name:"dhung09",email:"dhung09@gmail.com"},{name:"intrepidlemon",email:"admin@intrepidlemon.com"},{name:"taraku",email:"tarakju@gmail.com"}],name:"kite-installer",optionalDependencies:{},readme:"ERROR: No README data found!",scripts:{coverage:"npm run lcov_report && codecov",lcov_report:"nyc report --reporter=lcov",lint:"eslint .","lint:fix":"eslint --fix .",test:"nyc mocha --timeout 20000 --recursive test/*.test.js test/**/*.test.js","test-nocov":"mocha --timeout 20000 --recursive test/*.test.js test/**/*.test.js"},version:"3.8.0"}},function(e,t,n){"use strict";const i=n(22),a=n(47),{STATES:o}=n(13),s={STATES:o,get support(){return a.adapter},get releaseURL(){return this.support.releaseURL},get downloadPath(){return this.support.downloadPath},get installPath(){return this.support.installPath},client:{request:(...e)=>i.request(...e).catch(e=>{if(e.resp)return e.resp;throw e})}};[["handleState","checkHealth"],["pathInWhitelist","isPathWhitelisted"]].forEach(([e,t])=>{s[e]=((...e)=>i[t](...e))}),["arch","isAdmin","isOSSupported","isOSVersionSupported","hasManyKiteInstallation","hasManyKiteEnterpriseInstallation","hasBothKiteInstalled"].forEach(e=>{s[e]=((...t)=>a.adapter[e](...t))}),["isKiteSupported","isKiteInstalled","isKiteEnterpriseInstalled","canInstallKite","downloadKiteRelease","downloadKite","installKite","isKiteRunning","canRunKite","runKite","runKiteAndWait","isKiteEnterpriseRunning","canRunKiteEnterprise","runKiteEnterprise","runKiteEnterpriseAndWait","isKiteReachable","waitForKite","isUserAuthenticated","canAuthenticateUser","authenticateUser","authenticateSessionID","isPathWhitelisted","canWhitelistPath","whitelistPath","blacklistPath","saveUserID"].forEach(e=>{s[e]=((...t)=>i[e](...t))}),e.exports=s},function(e,t,n){const i=n(103),a=n(105),o=n(106),s=n(107),r=n(108),c=n(59),l=n(109),u=n(110),p=n(61),d=n(130),m=n(131),h=n(132),f=n(133),g=n(134),v=n(22);e.exports={Authenticate:i,BranchStep:a,CheckEmail:o,CreateAccount:s,Download:r,Flow:c,GetEmail:l,InputEmail:u,Install:p,KiteVsJedi:d,Login:m,ParallelSteps:h,VoidStep:g,atom:()=>{const e=n(135),t=n(136),p=n(137),x=n(138),b=n(139),y=n(140),w=n(141),k=n(142),E=n(143);return{InstallElement:e,InputEmailElement:t,InstallWaitElement:p,InstallEndElement:x,InstallErrorElement:b,KiteVsJediElement:y,LoginElement:w,InstallPlugin:E,defaultFlow:()=>[new a([{match:e=>v.isAdmin(),step:new l({name:"get-email"})},{match:e=>!v.isAdmin(),step:new g({name:"not-admin",view:new k("kite_installer_not_admin_step")})}],{name:"admin-check"}),new u({name:"input-email",view:new t("kite_installer_input_email_step")}),new o({name:"check-email",failureStep:"input-email"}),new a([{match:e=>e.account.exists,step:new m({name:"login",view:new w("kite_installer_login_step"),failureStep:"account-switch",backStep:"input-email"})},{match:e=>!e.account.exists,step:new s({name:"create-account"})}],{name:"account-switch"}),new h([new c([new r({name:"download"}),new i({name:"authenticate"}),new E({name:"install-plugin"})],{name:"download-flow"}),new f({name:"wait-step",view:new p("kite_installer_wait_step")})],{name:"download-and-wait"}),new a([{match:e=>!e.error,step:new g({name:"end",view:new x("kite_installer_install_end_step")})},{match:e=>e.error,step:new g({name:"error",view:new b("kite_installer_install_error_step")})}],{name:"termination"})],autocompletePythonFlow:()=>[new d({name:"kite-vs-jedi",view:new y("kite_installer_choose_kite_step")}),new a([{match:e=>!0,step:new l({name:"get-email"})},{match:e=>!1,step:new g({name:"not-admin",view:new k("kite_installer_not_admin_step")})}],{name:"admin-check"}),new u({name:"input-email",view:new t("kite_installer_input_email_step")}),new o({name:"check-email",failureStep:"input-email"}),new a([{match:e=>e.skipped,step:new f({name:"skip-email"})},{match:e=>!e.skipped&&e.account.exists,step:new m({name:"login",view:new w("kite_installer_login_step"),failureStep:"account-switch",backStep:"input-email"})},{match:e=>!e.skipped&&!e.account.exists,step:new s({name:"create-account"})}],{name:"account-switch"}),new h([new c([new r({name:"download"}),new i({name:"authenticate"}),new E({name:"install-plugin"})],{name:"download-flow"}),new f({name:"wait-step",view:new p("kite_installer_wait_step")})],{name:"download-and-wait"}),new a([{match:e=>!e.error,step:new g({name:"end",view:new x("kite_installer_install_end_step")})},{match:e=>e.error,step:new g({name:"error",view:new b("kite_installer_install_error_step")})}],{name:"termination"})]}}}},function(e,t,n){"use strict";const i=n(6),a=n(22),{retryPromise:o}=n(5),s=n(17);e.exports=class extends i{constructor(e={}){super(e),this.cooldown=e.cooldown||1500,this.tries=e.tries||10}start(e,t){let n;return t.updateState({authenticate:{done:!1}}),(n=e.account&&e.account.sessionId?o(()=>a.authenticateSessionID(e.account.sessionId),this.tries,this.cooldown):Promise.resolve()).then(()=>{s.Tracker.trackEvent("kite_installer_user_authenticated"),t.updateState({authenticate:{done:!0}})})}}},function(e,t,n){"use strict";e.exports=class{constructor(e=[]){this.disposables=e}add(e){e&&!this.disposables.includes(e)&&this.disposables.push(e)}remove(e){e&&this.disposables.includes(e)&&(this.disposables=this.disposables.filter(t=>t!=e))}dispose(){this.disposables.forEach(e=>e.dispose())}}},function(e,t,n){"use strict";const i=n(6);e.exports=class extends i{constructor(e,t){super(t),this.branches=e}start(e){return new Promise((t,n)=>{const i=this.branches.reduce((t,n)=>t||(n.match(e)?{step:n.step,data:e}:null),null);i?t(i):n()})}}},function(e,t,n){"use strict";const i=n(6),a=n(27);e.exports=class extends i{start({account:e}){return e.skipped?Promise.resolve({skipped:!0}):a.checkEmail(e).catch(e=>{if(e.resp)return e.resp;throw e}).then(()=>({error:null,account:{email:e.email,invalid:!1,exists:!1,hasPassword:!1,reason:null}})).catch(t=>{if(!t.data||!t.data.response)throw t;{const n=JSON.parse(t.data.responseData);switch(t.data.responseStatus){case 403:case 404:case 409:if(n.email_invalid){const t=new Error(n.fail_reason);throw t.data={account:{email:e.email,invalid:n.email_invalid,exists:n.account_exists,hasPassword:n.has_password,reason:n.fail_reason}},t}return{error:null,account:{email:e.email,invalid:n.email_invalid,exists:n.account_exists,hasPassword:n.has_password,reason:n.fail_reason}}}}})}}},function(e,t,n){"use strict";const i=n(6),a=n(27),o=n(5);e.exports=class extends i{start({account:{email:e}},t){return a.createAccount({email:e}).then(e=>{const t=o.parseSetCookies(e.headers["set-cookie"]);return{account:{sessionId:o.findCookie(t,"kite-session").Value}}})}}},function(e,t,n){"use strict";const i=n(22),{retryPromise:a}=n(5),o=n(17),s=n(6);e.exports=class extends s{constructor(e){super(e),this.installInterval=1500,this.runInterval=2500}start(e,t){return i.downloadKiteRelease({reinstall:!0,onDownloadProgress:(e,n,i)=>{t.updateState({download:{length:e,total:n,ratio:i}})}}).then(()=>(o.Tracker.trackEvent("kite_installer_kite_app_downloaded"),t.updateState({download:{done:!0},install:{done:!1}}),a(()=>i.installKite(),5,this.installInterval))).then(()=>a(()=>i.isKiteInstalled(),10,this.installInterval)).then(()=>(o.Tracker.trackEvent("kite_installer_kite_app_installed"),t.updateState({install:{done:!0},running:{done:!1}}),i.runKiteAndWait(30,this.runInterval).then(()=>{o.Tracker.trackEvent("kite_installer_kite_app_started"),t.updateState({running:{done:!0}})})))}}},function(e,t,n){"use strict";const i=n(8),a=n(2),o=n(3),s=n(29),{Tracker:r}=n(17),c=n(6);e.exports=class extends c{start(){return new Promise((e,t)=>{const n=String(i.readFileSync(o.join(a.homedir(),".gitconfig"))).split("\n").filter(e=>/^\s*email\s=/.test(e))[0];e({account:{email:n?n.split("=")[1].trim():void 0}})}).catch(e=>(r.trackEvent("error parsing gitconfig",{error:e.message}),s.error("error parsing gitconfig:",e),{account:{email:void 0}}))}}},function(e,t,n){"use strict";const i=n(6);e.exports=class extends i{start(e,t){return new Promise((e,n)=>{this.subscriptions.add(t.on("did-submit-email",t=>{e({account:t})})),this.subscriptions.add(t.on("did-skip-email",t=>{e({account:t})}))})}}},function(e,t,n){var i=n(16),a=n(2),o=n(112),s=n(113),r=n(7),c=n(120),l=n(38),u=n(122),p=n(25),d=n(63),m=n(123),h=n(128),f=n(129);function g(e,t){if(r.isType(e,"string")){var n=e;(e={}).accessToken=n}void 0!==e.minimumLevel&&(e.reportLevel=e.minimumLevel,delete e.minimumLevel),this.options=r.handleOptions(g.defaultOptions,e),delete this.options.maxItems,this.options.environment=this.options.environment||"unspecified",l.setVerbose(this.options.verbose),this.lambdaContext=null,this.lambdaTimeoutHandle=null;var i=new u,a=new c(this.options,i,p,d);this.client=t||new s(this.options,a,l,"server"),this.client.notifier.addTransform(m.baseData).addTransform(m.handleItemWithError).addTransform(m.addBody).addTransform(h.addMessageWithError).addTransform(h.addTelemetryData).addTransform(m.addRequestData).addTransform(m.addLambdaData).addTransform(h.addConfigToPayload).addTransform(m.scrubPayload).addTransform(h.userTransform(l)).addTransform(h.itemToPayload),this.client.queue.addPredicate(f.checkLevel).addPredicate(f.userCheckIgnore(l)).addPredicate(f.urlIsNotBlacklisted(l)).addPredicate(f.urlIsWhitelisted(l)).addPredicate(f.messageIsIgnored(l)),this.setupUnhandledCapture()}var v=null;function x(e){var t="Rollbar is not initialized";l.error(t),e&&e(new Error(t))}function b(e){for(var t=0,n=e.length;t<n;++t)if(r.isFunction(e[t]))return e[t]}function y(e,t){var n=function(e,n){t(e,n)};n._rollbarHandler=!0;for(var i=process.listeners(e),a=i.length,o=0;o<a;++o)i[o]._rollbarHandler&&process.removeListener(e,i[o]);process.on(e,n)}function w(e,t){Error.call(this),Error.captureStackTrace(this,this.constructor),this.message=e,this.nested=t,this.name=this.constructor.name}g.init=function(e,t){return v?v.global(e).configure(e):v=new g(e,t)},g.prototype.global=function(e){return delete(e=r.handleOptions(e)).maxItems,this.client.global(e),this},g.global=function(e){if(v)return v.global(e);x()},g.prototype.configure=function(e,t){var n=this.options,i={};return t&&(i={payload:t}),this.options=r.handleOptions(n,e,i),delete this.options.maxItems,l.setVerbose(this.options.verbose),this.client.configure(e,t),this.setupUnhandledCapture(),this},g.configure=function(e,t){if(v)return v.configure(e,t);x()},g.prototype.lastError=function(){return this.client.lastError},g.lastError=function(){if(v)return v.lastError();x()},g.prototype.log=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.log(e),{uuid:t}},g.log=function(){if(v)return v.log.apply(v,arguments);x(b(arguments))},g.prototype.debug=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.debug(e),{uuid:t}},g.debug=function(){if(v)return v.debug.apply(v,arguments);x(b(arguments))},g.prototype.info=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.info(e),{uuid:t}},g.info=function(){if(v)return v.info.apply(v,arguments);x(b(arguments))},g.prototype.warn=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.warn(e),{uuid:t}},g.warn=function(){if(v)return v.warn.apply(v,arguments);x(b(arguments))},g.prototype.warning=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.warning(e),{uuid:t}},g.warning=function(){if(v)return v.warning.apply(v,arguments);x(b(arguments))},g.prototype.error=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.error(e),{uuid:t}},g.error=function(){if(v)return v.error.apply(v,arguments);x(b(arguments))},g.prototype._uncaughtError=function(){var e=this._createItem(arguments);e._isUncaught=!0;var t=e.uuid;return this.client.error(e),{uuid:t}},g.prototype.critical=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.critical(e),{uuid:t}},g.critical=function(){if(v)return v.critical.apply(v,arguments);x(b(arguments))},g.prototype.buildJsonPayload=function(e){return this.client.buildJsonPayload(e)},g.buildJsonPayload=function(){if(v)return v.buildJsonPayload.apply(v,arguments);x()},g.prototype.sendJsonPayload=function(e){return this.client.sendJsonPayload(e)},g.sendJsonPayload=function(){if(v)return v.sendJsonPayload.apply(v,arguments);x()},g.prototype.wait=function(e){this.client.wait(e)},g.wait=function(e){if(v)return v.wait(e);x(b(arguments))},g.prototype.errorHandler=function(){return function(e,t,n,i){var a=function(a){return a&&l.error("Error reporting to rollbar, ignoring: "+a),i(e,t,n)};return e?e instanceof Error?this.error(e,t,a):this.error("Error: "+e,t,a):i(e,t,n)}.bind(this)},g.errorHandler=function(){if(v)return v.errorHandler();x()},g.prototype.lambdaHandler=function(e,t){return e.length<=2?this.asyncLambdaHandler(e,t):this.syncLambdaHandler(e,t)},g.prototype.asyncLambdaHandler=function(e,t){var n=this,i=n.options.captureLambdaTimeouts;return function(a,o){return new Promise(function(s,r){if(n.lambdaContext=o,i){var c=(t||function(e,t){var i={originalEvent:e,originalRequestId:t.awsRequestId};n.error("Function timed out",i)}).bind(null,a,o);n.lambdaTimeoutHandle=setTimeout(c,o.getRemainingTimeInMillis()-1e3)}e(a,o).then(function(e){clearTimeout(n.lambdaTimeoutHandle),s(e)}).catch(function(e){n.error(e),n.wait(function(){clearTimeout(n.lambdaTimeoutHandle),r(e)})})})}},g.prototype.syncLambdaHandler=function(e,t){var n=this,i=n.options.captureLambdaTimeouts;return function(a,o,s){if(n.lambdaContext=o,i){var r=(t||function(e,t,i){var a={originalEvent:e,originalRequestId:t.awsRequestId};n.error("Function timed out",a)}).bind(null,a,o,s);n.lambdaTimeoutHandle=setTimeout(r,o.getRemainingTimeInMillis()-1e3)}try{e(a,o,function(e,t){e&&n.error(e),n.wait(function(){clearTimeout(n.lambdaTimeoutHandle),s(e,t)})})}catch(e){n.error(e),n.wait(function(){throw clearTimeout(n.lambdaTimeoutHandle),e})}}},g.lambdaHandler=function(e){if(v)return v.lambdaHandler(e);x()},g.prototype.wrapCallback=function(e){return function(e,t){return function(){var n=arguments[0];return n&&e.error(n),t.apply(this,arguments)}}(this,e)},g.wrapCallback=function(e){if(v)return v.wrapCallback(e);x()},g.prototype.captureEvent=function(){var e=r.createTelemetryEvent(arguments);return this.client.captureEvent(e.type,e.metadata,e.level)},g.captureEvent=function(){if(v)return v.captureEvent.apply(v,arguments);x()},g.prototype.reportMessage=function(e,t,n,i){return l.log("reportMessage is deprecated"),r.isFunction(this[t])?this[t](e,n,i):this.error(e,n,i)},g.reportMessage=function(e,t,n,i){if(v)return v.reportMessage(e,t,n,i);x(i)},g.prototype.reportMessageWithPayloadData=function(e,t,n,i){return l.log("reportMessageWithPayloadData is deprecated"),this.error(e,n,t,i)},g.reportMessageWithPayloadData=function(e,t,n,i){if(v)return v.reportMessageWithPayloadData(e,t,n,i);x(i)},g.prototype.handleError=function(e,t,n){return l.log("handleError is deprecated"),this.error(e,t,n)},g.handleError=function(e,t,n){if(v)return v.handleError(e,t,n);x(n)},g.prototype.handleErrorWithPayloadData=function(e,t,n,i){return l.log("handleErrorWithPayloadData is deprecated"),this.error(e,n,t,i)},g.handleErrorWithPayloadData=function(e,t,n,i){if(v)return v.handleErrorWithPayloadData(e,t,n,i);x(i)},g.handleUncaughtExceptions=function(e,t){if(v)return(t=t||{}).accessToken=e,v.configure(t);x()},g.handleUnhandledRejections=function(e,t){if(v)return(t=t||{}).accessToken=e,v.configure(t);x()},g.handleUncaughtExceptionsAndRejections=function(e,t){if(v)return(t=t||{}).accessToken=e,v.configure(t);x()},g.prototype._createItem=function(e){return r.createItem(e,l,this,["headers","protocol","url","method","body","route"],this.lambdaContext)},g.prototype.setupUnhandledCapture=function(){(this.options.captureUncaught||this.options.handleUncaughtExceptions)&&this.handleUncaughtExceptions(),(this.options.captureUnhandledRejections||this.options.handleUnhandledRejections)&&this.handleUnhandledRejections()},g.prototype.handleUncaughtExceptions=function(){var e=!!this.options.exitOnUncaughtException;delete this.options.exitOnUncaughtException,y("uncaughtException",function(t){(this.options.captureUncaught||this.options.handleUncaughtExceptions)&&(this._uncaughtError(t,function(e){e&&(l.error("Encountered error while handling an uncaught exception."),l.error(e))}),e&&setImmediate(function(){this.wait(function(){process.exit(1)})}.bind(this)))}.bind(this))},g.prototype.handleUnhandledRejections=function(){y("unhandledRejection",function(e){(this.options.captureUnhandledRejections||this.options.handleUnhandledRejections)&&this._uncaughtError(e,function(e){e&&(l.error("Encountered error while handling an uncaught exception."),l.error(e))})}.bind(this))},i.inherits(w,Error),g.Error=w,g.defaultOptions={host:a.hostname(),environment:"production",framework:"node-js",showReportedMessageTraces:!1,notifier:{name:"node_rollbar",version:o.version},scrubHeaders:o.defaults.server.scrubHeaders,scrubFields:o.defaults.server.scrubFields,addRequestData:null,reportLevel:o.defaults.reportLevel,verbose:!1,enabled:!0,sendConfig:!1,includeItemsInTelemetry:!1,captureEmail:!1,captureUsername:!1,captureIp:!0,captureLambdaTimeouts:!0},e.exports=g},function(e){e.exports={_args:[[{raw:"rollbar@^2.3.8",scope:null,escapedName:"rollbar",name:"rollbar",rawSpec:"^2.3.8",spec:">=2.3.8 <3.0.0",type:"range"},"/Users/kite/atom-plugin"]],_from:"rollbar@>=2.3.8 <3.0.0",_hasShrinkwrap:!1,_id:"rollbar@2.7.0",_inCache:!0,_location:"/rollbar",_nodeVersion:"8.14.1",_npmOperationalInternal:{host:"s3://npm-registry-packages",tmp:"tmp/rollbar_2.7.0_1557963757958_0.5354922977806886"},_npmUser:{name:"waltjones",email:"walt@joeneng.com"},_npmVersion:"6.4.1",_phantomChildren:{},_requested:{raw:"rollbar@^2.3.8",scope:null,escapedName:"rollbar",name:"rollbar",rawSpec:"^2.3.8",spec:">=2.3.8 <3.0.0",type:"range"},_requiredBy:["/","/kite-installer"],_resolved:"https://registry.npmjs.org/rollbar/-/rollbar-2.7.0.tgz",_shasum:"6c2ad649b4f294681c70b5ec23eded77b2a76554",_shrinkwrap:null,_spec:"rollbar@^2.3.8",_where:"/Users/kite/atom-plugin",browser:"dist/rollbar.umd.min.js",bugs:{url:"https://github.com/rollbar/rollbar.js/issues"},cdn:{host:"cdnjs.cloudflare.com"},defaults:{endpoint:"api.rollbar.com/api/1/item/",browser:{scrubFields:["pw","pass","passwd","password","secret","confirm_password","confirmPassword","password_confirmation","passwordConfirmation","access_token","accessToken","secret_key","secretKey","secretToken","cc-number","card number","cardnumber","cardnum","ccnum","ccnumber","cc num","creditcardnumber","credit card number","newcreditcardnumber","new credit card","creditcardno","credit card no","card#","card #","cc-csc","cvc2","cvv2","ccv2","security code","card verification","name on credit card","name on card","nameoncard","cardholder","card holder","name des karteninhabers","card type","cardtype","cc type","cctype","payment type","expiration date","expirationdate","expdate","cc-exp"]},server:{scrubHeaders:["authorization","www-authorization","http_authorization","omniauth.auth","cookie","oauth-access-token","x-access-token","x_csrf_token","http_x_csrf_token","x-csrf-token"],scrubFields:["pw","pass","passwd","password","password_confirmation","passwordConfirmation","confirm_password","confirmPassword","secret","secret_token","secretToken","secret_key","secretKey","api_key","access_token","accessToken","authenticity_token","oauth_token","token","user_session_secret","request.session.csrf","request.session._csrf","request.params._csrf","request.cookie","request.cookies"]},logLevel:"debug",reportLevel:"debug",uncaughtErrorLevel:"error",maxItems:0,itemsPerMin:60},dependencies:{async:"~1.2.1","console-polyfill":"0.3.0",debug:"2.6.9",decache:"^3.0.5","error-stack-parser":"1.3.3","json-stringify-safe":"~5.0.0","lru-cache":"~2.2.1","request-ip":"~2.0.1",uuid:"3.0.x"},description:"Error tracking and logging from JS to Rollbar",devDependencies:{"babel-core":"^6.26.3","babel-eslint":"^10.0.1","babel-loader":"^8.0.4",bluebird:"^3.3.5","browserstack-api":"0.0.5",chai:"^4.2.0",chalk:"^1.1.1",eslint:"^5.16.0","eslint-loader":"^2.1.2",express:"^4.16.4",glob:"^5.0.14",grunt:"^1.0.3","grunt-blanket-mocha":"^1.0.0","grunt-bumpup":"^0.6.3","grunt-cli":"^1.3.2","grunt-contrib-concat":"~0.3.0","grunt-contrib-connect":"^2.0.0","grunt-contrib-copy":"~0.5.0","grunt-contrib-jshint":"^2.0.0","grunt-contrib-uglify":"^4.0.0","grunt-contrib-watch":"^1.1.0","grunt-express":"^1.4.1","grunt-karma":"^3.0.1","grunt-karma-coveralls":"^2.5.4","grunt-mocha":"^1.1.0","grunt-mocha-cov":"^0.4.0","grunt-parallel":"^0.5.1","grunt-saucelabs":"^9.0.0","grunt-tagrelease":"~0.3.0","grunt-text-replace":"^0.4.0","grunt-vows":"^0.4.2","grunt-webpack":"^3.1.3","istanbul-instrumenter-loader":"^2.0.0",jade:"~0.27.7","jasmine-core":"^2.3.4","jquery-mockjax":"^2.0.1",karma:"^4.0.1","karma-browserstack-launcher":"^0.1.5","karma-chai":"^0.1.0","karma-chrome-launcher":"^2.2.0","karma-expect":"^1.1.0","karma-firefox-launcher":"^0.1.6","karma-html2js-preprocessor":"^1.1.0","karma-jquery":"^0.1.0","karma-mocha":"^0.2.0","karma-mocha-reporter":"^1.1.1","karma-phantomjs-launcher":"^1.0.4","karma-requirejs":"^0.2.2","karma-safari-launcher":"^0.1.1","karma-sinon":"^1.0.4","karma-sourcemap-loader":"^0.3.5","karma-webpack":"^3.0.5",mocha:"^5.2.0",mootools:"^1.5.1",nock:"^9.0.7","node-libs-browser":"^0.5.2",phantomjs:"^2.1.0",request:"^2.88.0",requirejs:"^2.1.20","script-loader":"0.6.1",sinon:"^7.3.0",stackframe:"^0.2.2","strict-loader":"^0.1.2","time-grunt":"^1.0.0","uglifyjs-webpack-plugin":"^2.1.2",vows:"~0.7.0",webpack:"^4.30.0","webpack-dev-server":"^3.1.10"},directories:{},dist:{integrity:"sha512-xMEZRcebflLiE6PqAm4h980FXH5J20R1tJ1s/cWDB9s0Uaw4rSSRX5oodtb3JkXblG7abTJRmku9Iz2WADOw3w==",shasum:"6c2ad649b4f294681c70b5ec23eded77b2a76554",tarball:"https://registry.npmjs.org/rollbar/-/rollbar-2.7.0.tgz",fileCount:106,unpackedSize:3325458,"npm-signature":"-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJc3KPuCRA9TVsSAnZWagAAolUP/A379FkX7IOe+TM9pjVV\nmMiZ/Au/7Y7ZEE3hhr0yx4fqjp12F6XFcsp9X4mBWsNinNTXECwWnKH1rbb4\nals9GAquyOejG9/WnOReYfSiihfgnpaHrUB/qpeny7GFiPwX6EYivbgv5G0N\nEEwIqB3zFA35bJJo32XP9dcz2JSjXync0h0p4hKK5zEz8vWMH7mNRqa8UTmQ\n/OmL37XOAJthbgABlEhZ31BIcd8Pp0KFQNy3Pzqjk2bOsPBLO138L5mOwuLE\nvqc5C3KEEzQPrbkPl8uE1Zi53+3LohTxjxgb5xpValCSjjEmHPuxGnmrVJ+i\n29aYoS9uVnLPjp23ESIluVAGYsxfRyT3EvH8BNaZ2LwYFkk/NGnNDrm4BIHG\nwMSLcyv0xU/XrQMNA+jRQroW9d6bcmxO/g55/i5KU/kj4hvYTaJsF3nw2z2C\nQm6VmSKI8fSLFo2gV/5bnnoOYOs/3BVSOL5IivkxkscX5ns12gNYEkhosmi9\neXYyW9mMK9skJQrH6Oj9/u7aaWrw70PWdfnBfmscQKQ443qyHxTFQKBWFBtK\npsbOhfHT1bENyNDg/Vo1deZ3wVrCccecugGO3O/FvtJiOjOTG1zS4cly/sGr\n1FfvEm1CVfE4ZeBPc8vE2m+B6HilqjZUr45wGbRoMlH8tm5la2csT3Ov9L6B\n/BAb\r\n=EpQg\r\n-----END PGP SIGNATURE-----\r\n"},gitHead:"fa0843d8f316e256a386b819a394118d52dbf36c",homepage:"https://github.com/rollbar/rollbar.js#readme",license:"MIT",main:"src/server/rollbar.js",maintainers:[{name:"brianr",email:"brianrue@gmail.com"},{name:"chrisbarmonde",email:"cbarmonde@rollbar.com"},{name:"coryvirok",email:"cory@ratchet.io"},{name:"dampier",email:"dampierface@gmail.com"},{name:"jfarrimo",email:"jay@rollbar.com"},{name:"jondeandres",email:"jon@rollbar.com"},{name:"rokob",email:"fabian.ledvina@gmail.com"}],name:"rollbar",optionalDependencies:{decache:"^3.0.5"},plugins:{jquery:{version:"0.0.8"}},readme:"ERROR: No README data found!",repository:{type:"git",url:"git+ssh://git@github.com/rollbar/rollbar.js.git"},scripts:{build:"grunt",lint:"eslint",test:"grunt test","test-browser":"grunt test-browser","test-server":"grunt test-server",test_ci:"grunt test"},types:"./index.d.ts",version:"2.7.0"}},function(e,t,n){var i=n(114),a=n(117),o=n(118),s=n(119),r=n(7);function c(e,t,n,i){this.options=r.merge(e),this.logger=n,c.rateLimiter.configureGlobal(this.options),c.rateLimiter.setPlatformOptions(i,this.options),this.api=t,this.queue=new a(c.rateLimiter,t,n,this.options),this.notifier=new o(this.queue,this.options),this.telemeter=new s(this.options),this.lastError=null,this.lastErrorHash="none"}c.rateLimiter=new i({maxItems:0,itemsPerMinute:60}),c.prototype.global=function(e){return c.rateLimiter.configureGlobal(e),this},c.prototype.configure=function(e,t){var n=this.options,i={};return t&&(i={payload:t}),this.options=r.merge(n,e,i),this.notifier&&this.notifier.configure(this.options),this.telemeter&&this.telemeter.configure(this.options),this.global(this.options),this},c.prototype.log=function(e){var t=this._defaultLogLevel();return this._log(t,e)},c.prototype.debug=function(e){this._log("debug",e)},c.prototype.info=function(e){this._log("info",e)},c.prototype.warn=function(e){this._log("warning",e)},c.prototype.warning=function(e){this._log("warning",e)},c.prototype.error=function(e){this._log("error",e)},c.prototype.critical=function(e){this._log("critical",e)},c.prototype.wait=function(e){this.queue.wait(e)},c.prototype.captureEvent=function(e,t,n){return this.telemeter.captureEvent(e,t,n)},c.prototype.captureDomContentLoaded=function(e){return this.telemeter.captureDomContentLoaded(e)},c.prototype.captureLoad=function(e){return this.telemeter.captureLoad(e)},c.prototype.buildJsonPayload=function(e){return this.api.buildJsonPayload(e)},c.prototype.sendJsonPayload=function(e){this.api.postJsonPayload(e)},c.prototype._log=function(e,t){var n;if(t.callback&&(n=t.callback,delete t.callback),this._sameAsLastError(t)){if(n){var i=new Error("ignored identical item");i.item=t,n(i)}}else try{t.level=t.level||e,this.telemeter._captureRollbarItem(t),t.telemetryEvents=this.telemeter.copyEvents(),this.notifier.log(t,n)}catch(e){this.logger.error(e)}},c.prototype._defaultLogLevel=function(){return this.options.logLevel||"debug"},c.prototype._sameAsLastError=function(e){if(!e._isUncaught)return!1;var t=function(e){var t=e.message||"",n=(e.err||{}).stack||String(e.err);return t+"::"+n}(e);return this.lastErrorHash===t||(this.lastError=e.err,this.lastErrorHash=t,!1)},e.exports=c},function(e,t,n){var i=n(7);function a(e){this.startTime=i.now(),this.counter=0,this.perMinCounter=0,this.platform=null,this.platformOptions={},this.configureGlobal(e)}function o(e,t,n){return!e.ignoreRateLimit&&t>=1&&n>t}function s(e,t,n,i,a,o,s){var r=null;return n&&(n=new Error(n)),n||i||(r=function(e,t,n,i,a){var o,s=t.environment||t.payload&&t.payload.environment;o=a?"item per minute limit reached, ignoring errors until timeout":"maxItems has been hit, ignoring errors until reset.";var r={body:{message:{body:o,extra:{maxItems:n,itemsPerMinute:i}}},language:"javascript",environment:s,notifier:{version:t.notifier&&t.notifier.version||t.version}};"browser"===e?(r.platform="browser",r.framework="browser-js",r.notifier.name="rollbar-browser-js"):"server"===e?(r.framework=t.framework||"node-js",r.notifier.name=t.notifier.name):"react-native"===e&&(r.framework=t.framework||"react-native",r.notifier.name=t.notifier.name);return r}(e,t,a,o,s)),{error:n,shouldSend:i,payload:r}}a.globalSettings={startTime:i.now(),maxItems:void 0,itemsPerMinute:void 0},a.prototype.configureGlobal=function(e){void 0!==e.startTime&&(a.globalSettings.startTime=e.startTime),void 0!==e.maxItems&&(a.globalSettings.maxItems=e.maxItems),void 0!==e.itemsPerMinute&&(a.globalSettings.itemsPerMinute=e.itemsPerMinute)},a.prototype.shouldSend=function(e,t){var n=(t=t||i.now())-this.startTime;(n<0||n>=6e4)&&(this.startTime=t,this.perMinCounter=0);var r=a.globalSettings.maxItems,c=a.globalSettings.itemsPerMinute;if(o(e,r,this.counter))return s(this.platform,this.platformOptions,r+" max items reached",!1);if(o(e,c,this.perMinCounter))return s(this.platform,this.platformOptions,c+" items per minute reached",!1);this.counter++,this.perMinCounter++;var l=!o(e,r,this.counter),u=l;return l=l&&!o(e,c,this.perMinCounter),s(this.platform,this.platformOptions,null,l,r,c,u)},a.prototype.setPlatformOptions=function(e,t){this.platform=e,this.platformOptions=t},e.exports=a},function(e,t,n){"use strict";var i=Object.prototype.hasOwnProperty,a=Object.prototype.toString,o=function(e){if(!e||"[object Object]"!==a.call(e))return!1;var t,n=i.call(e,"constructor"),o=e.constructor&&e.constructor.prototype&&i.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!n&&!o)return!1;for(t in e);return void 0===t||i.call(e,t)};e.exports=function e(){var t,n,i,a,s,r={},c=null,l=arguments.length;for(t=0;t<l;t++)if(null!=(c=arguments[t]))for(s in c)n=r[s],r!==(i=c[s])&&(i&&o(i)?(a=n&&o(n)?n:{},r[s]=e(a,i)):void 0!==i&&(r[s]=i));return r}},function(e,t){e.exports=function(e){var t,n,i,a,o=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;function s(e){return e<10?"0"+e:e}function r(){return this.valueOf()}function c(e){return o.lastIndex=0,o.test(e)?'"'+e.replace(o,function(e){var t=i[e];return"string"==typeof t?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+s(this.getUTCMonth()+1)+"-"+s(this.getUTCDate())+"T"+s(this.getUTCHours())+":"+s(this.getUTCMinutes())+":"+s(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=r,Number.prototype.toJSON=r,String.prototype.toJSON=r),"function"!=typeof e.stringify&&(i={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},e.stringify=function(e,i,o){var s;if(t="",n="","number"==typeof o)for(s=0;s<o;s+=1)n+=" ";else"string"==typeof o&&(n=o);if(a=i,i&&"function"!=typeof i&&("object"!=typeof i||"number"!=typeof i.length))throw new Error("JSON.stringify");return function e(i,o){var s,r,l,u,p,d=t,m=o[i];switch(m&&"object"==typeof m&&"function"==typeof m.toJSON&&(m=m.toJSON(i)),"function"==typeof a&&(m=a.call(o,i,m)),typeof m){case"string":return c(m);case"number":return isFinite(m)?String(m):"null";case"boolean":case"null":return String(m);case"object":if(!m)return"null";if(t+=n,p=[],"[object Array]"===Object.prototype.toString.apply(m)){for(u=m.length,s=0;s<u;s+=1)p[s]=e(s,m)||"null";return l=0===p.length?"[]":t?"[\n"+t+p.join(",\n"+t)+"\n"+d+"]":"["+p.join(",")+"]",t=d,l}if(a&&"object"==typeof a)for(u=a.length,s=0;s<u;s+=1)"string"==typeof a[s]&&(l=e(r=a[s],m))&&p.push(c(r)+(t?": ":":")+l);else for(r in m)Object.prototype.hasOwnProperty.call(m,r)&&(l=e(r,m))&&p.push(c(r)+(t?": ":":")+l);return l=0===p.length?"{}":t?"{\n"+t+p.join(",\n"+t)+"\n"+d+"}":"{"+p.join(",")+"}",t=d,l}}("",{"":e})}),"function"!=typeof e.parse&&(e.parse=(h={"\\":"\\",'"':'"',"/":"/",t:"\t",n:"\n",r:"\r",f:"\f",b:"\b"},f={go:function(){l="ok"},firstokey:function(){d=m,l="colon"},okey:function(){d=m,l="colon"},ovalue:function(){l="ocomma"},firstavalue:function(){l="acomma"},avalue:function(){l="acomma"}},g={go:function(){l="ok"},ovalue:function(){l="ocomma"},firstavalue:function(){l="acomma"},avalue:function(){l="acomma"}},v={"{":{go:function(){u.push({state:"ok"}),p={},l="firstokey"},ovalue:function(){u.push({container:p,state:"ocomma",key:d}),p={},l="firstokey"},firstavalue:function(){u.push({container:p,state:"acomma"}),p={},l="firstokey"},avalue:function(){u.push({container:p,state:"acomma"}),p={},l="firstokey"}},"}":{firstokey:function(){var e=u.pop();m=p,p=e.container,d=e.key,l=e.state},ocomma:function(){var e=u.pop();p[d]=m,m=p,p=e.container,d=e.key,l=e.state}},"[":{go:function(){u.push({state:"ok"}),p=[],l="firstavalue"},ovalue:function(){u.push({container:p,state:"ocomma",key:d}),p=[],l="firstavalue"},firstavalue:function(){u.push({container:p,state:"acomma"}),p=[],l="firstavalue"},avalue:function(){u.push({container:p,state:"acomma"}),p=[],l="firstavalue"}},"]":{firstavalue:function(){var e=u.pop();m=p,p=e.container,d=e.key,l=e.state},acomma:function(){var e=u.pop();p.push(m),m=p,p=e.container,d=e.key,l=e.state}},":":{colon:function(){if(Object.hasOwnProperty.call(p,d))throw new SyntaxError("Duplicate key '"+d+'"');l="ovalue"}},",":{ocomma:function(){p[d]=m,l="okey"},acomma:function(){p.push(m),l="avalue"}},true:{go:function(){m=!0,l="ok"},ovalue:function(){m=!0,l="ocomma"},firstavalue:function(){m=!0,l="acomma"},avalue:function(){m=!0,l="acomma"}},false:{go:function(){m=!1,l="ok"},ovalue:function(){m=!1,l="ocomma"},firstavalue:function(){m=!1,l="acomma"},avalue:function(){m=!1,l="acomma"}},null:{go:function(){m=null,l="ok"},ovalue:function(){m=null,l="ocomma"},firstavalue:function(){m=null,l="acomma"},avalue:function(){m=null,l="acomma"}}},function(e,t){var n,i,a=/^[\u0020\t\n\r]*(?:([,:\[\]{}]|true|false|null)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|"((?:[^\r\n\t\\\"]|\\(?:["\\\/trnfb]|u[0-9a-fA-F]{4}))*)")/;l="go",u=[];try{for(;n=a.exec(e);)n[1]?v[n[1]][l]():n[2]?(m=+n[2],g[l]()):(i=n[3],m=i.replace(/\\(?:u(.{4})|([^u]))/g,function(e,t,n){return t?String.fromCharCode(parseInt(t,16)):h[n]}),f[l]()),e=e.slice(n[0].length)}catch(e){l=e}if("ok"!==l||/[^\u0020\t\n\r]/.test(e))throw l instanceof SyntaxError?l:new SyntaxError("JSON");return"function"==typeof t?function e(n,i){var a,o,s=n[i];if(s&&"object"==typeof s)for(a in m)Object.prototype.hasOwnProperty.call(s,a)&&(void 0!==(o=e(s,a))?s[a]=o:delete s[a]);return t.call(n,i,s)}({"":m},""):m}));var l,u,p,d,m,h,f,g,v}},function(e,t,n){var i=n(7);function a(e,t,n,i){this.rateLimiter=e,this.api=t,this.logger=n,this.options=i,this.predicates=[],this.pendingItems=[],this.pendingRequests=[],this.retryQueue=[],this.retryHandle=null,this.waitCallback=null,this.waitIntervalID=null}a.prototype.configure=function(e){this.api&&this.api.configure(e);var t=this.options;return this.options=i.merge(t,e),this},a.prototype.addPredicate=function(e){return i.isFunction(e)&&this.predicates.push(e),this},a.prototype.addPendingItem=function(e){this.pendingItems.push(e)},a.prototype.removePendingItem=function(e){var t=this.pendingItems.indexOf(e);-1!==t&&this.pendingItems.splice(t,1)},a.prototype.addItem=function(e,t,n,a){t&&i.isFunction(t)||(t=function(){});var o=this._applyPredicates(e);if(o.stop)return this.removePendingItem(a),void t(o.err);this._maybeLog(e,n),this.removePendingItem(a),this.pendingRequests.push(e);try{this._makeApiRequest(e,function(n,i){this._dequeuePendingRequest(e),t(n,i)}.bind(this))}catch(n){this._dequeuePendingRequest(e),t(n)}},a.prototype.wait=function(e){i.isFunction(e)&&(this.waitCallback=e,this._maybeCallWait()||(this.waitIntervalID&&(this.waitIntervalID=clearInterval(this.waitIntervalID)),this.waitIntervalID=setInterval(function(){this._maybeCallWait()}.bind(this),500)))},a.prototype._applyPredicates=function(e){for(var t=null,n=0,i=this.predicates.length;n<i;n++)if(!(t=this.predicates[n](e,this.options))||void 0!==t.err)return{stop:!0,err:t.err};return{stop:!1,err:null}},a.prototype._makeApiRequest=function(e,t){var n=this.rateLimiter.shouldSend(e);n.shouldSend?this.api.postItem(e,function(n,i){n?this._maybeRetry(n,e,t):t(n,i)}.bind(this)):n.error?t(n.error):this.api.postItem(n.payload,t)};var o=["ECONNRESET","ENOTFOUND","ESOCKETTIMEDOUT","ETIMEDOUT","ECONNREFUSED","EHOSTUNREACH","EPIPE","EAI_AGAIN"];a.prototype._maybeRetry=function(e,t,n){var i=!1;if(this.options.retryInterval)for(var a=0,s=o.length;a<s;a++)if(e.code===o[a]){i=!0;break}i?this._retryApiRequest(t,n):n(e)},a.prototype._retryApiRequest=function(e,t){this.retryQueue.push({item:e,callback:t}),this.retryHandle||(this.retryHandle=setInterval(function(){for(;this.retryQueue.length;){var e=this.retryQueue.shift();this._makeApiRequest(e.item,e.callback)}}.bind(this),this.options.retryInterval))},a.prototype._dequeuePendingRequest=function(e){var t=this.pendingRequests.indexOf(e);-1!==t&&(this.pendingRequests.splice(t,1),this._maybeCallWait())},a.prototype._maybeLog=function(e,t){if(this.logger&&this.options.verbose){var n=t;if(n=(n=n||i.get(e,"body.trace.exception.message"))||i.get(e,"body.trace_chain.0.exception.message"))return void this.logger.error(n);(n=i.get(e,"body.message.body"))&&this.logger.log(n)}},a.prototype._maybeCallWait=function(){return!(!i.isFunction(this.waitCallback)||0!==this.pendingItems.length||0!==this.pendingRequests.length)&&(this.waitIntervalID&&(this.waitIntervalID=clearInterval(this.waitIntervalID)),this.waitCallback(),!0)},e.exports=a},function(e,t,n){var i=n(7);function a(e,t){this.queue=e,this.options=t,this.transforms=[]}a.prototype.configure=function(e){this.queue&&this.queue.configure(e);var t=this.options;return this.options=i.merge(t,e),this},a.prototype.addTransform=function(e){return i.isFunction(e)&&this.transforms.push(e),this},a.prototype.log=function(e,t){if(t&&i.isFunction(t)||(t=function(){}),!this.options.enabled)return t(new Error("Rollbar is not enabled"));this.queue.addPendingItem(e);var n=e.err;this._applyTransforms(e,function(i,a){if(i)return this.queue.removePendingItem(e),t(i,null);this.queue.addItem(a,t,n,e)}.bind(this))},a.prototype._applyTransforms=function(e,t){var n=-1,i=this.transforms.length,a=this.transforms,o=this.options,s=function(e,r){e?t(e,null):++n!==i?a[n](r,o,s):t(null,r)};s(null,e)},e.exports=a},function(e,t,n){var i=n(7),a=100;function o(e){this.queue=[],this.options=i.merge(e);var t=this.options.maxTelemetryEvents||a;this.maxQueueSize=Math.max(0,Math.min(t,a))}function s(e,t){if(t)return t;return{error:"error",manual:"info"}[e]||"info"}o.prototype.configure=function(e){var t=this.options;this.options=i.merge(t,e);var n=this.options.maxTelemetryEvents||a,o=Math.max(0,Math.min(n,a)),s=0;this.maxQueueSize>o&&(s=this.maxQueueSize-o),this.maxQueueSize=o,this.queue.splice(0,s)},o.prototype.copyEvents=function(){var e=Array.prototype.slice.call(this.queue,0);if(i.isFunction(this.options.filterTelemetry))try{for(var t=e.length;t--;)this.options.filterTelemetry(e[t])&&e.splice(t,1)}catch(e){this.options.filterTelemetry=null}return e},o.prototype.capture=function(e,t,n,a,o){var r={level:s(e,n),type:e,timestamp_ms:o||i.now(),body:t,source:"client"};a&&(r.uuid=a);try{if(i.isFunction(this.options.filterTelemetry)&&this.options.filterTelemetry(r))return!1}catch(e){this.options.filterTelemetry=null}return this.push(r),r},o.prototype.captureEvent=function(e,t,n,i){return this.capture(e,t,n,i)},o.prototype.captureError=function(e,t,n,i){var a={message:e.message||String(e)};return e.stack&&(a.stack=e.stack),this.capture("error",a,t,n,i)},o.prototype.captureLog=function(e,t,n,i){return this.capture("log",{message:e},t,n,i)},o.prototype.captureNetwork=function(e,t,n,i){t=t||"xhr",e.subtype=e.subtype||t,i&&(e.request=i);var a=this.levelFromStatus(e.status_code);return this.capture("network",e,a,n)},o.prototype.levelFromStatus=function(e){return e>=200&&e<400?"info":0===e||e>=400?"error":"info"},o.prototype.captureDom=function(e,t,n,i,a){var o={subtype:e,element:t};return void 0!==n&&(o.value=n),void 0!==i&&(o.checked=i),this.capture("dom",o,"info",a)},o.prototype.captureNavigation=function(e,t,n){return this.capture("navigation",{from:e,to:t},"info",n)},o.prototype.captureDomContentLoaded=function(e){return this.capture("navigation",{subtype:"DOMContentLoaded"},"info",void 0,e&&e.getTime())},o.prototype.captureLoad=function(e){return this.capture("navigation",{subtype:"load"},"info",void 0,e&&e.getTime())},o.prototype.captureConnectivityChange=function(e,t){return this.captureNetwork({change:e},"connectivity",t)},o.prototype._captureRollbarItem=function(e){if(this.options.includeItemsInTelemetry)return e.err?this.captureError(e.err,e.level,e.uuid,e.timestamp):e.message?this.captureLog(e.message,e.level,e.uuid,e.timestamp):e.custom?this.capture("log",e.custom,e.level,e.uuid,e.timestamp):void 0},o.prototype.push=function(e){this.queue.push(e),this.queue.length>this.maxQueueSize&&this.queue.shift()},e.exports=o},function(e,t,n){var i=n(7),a=n(121),o=n(62),s={hostname:"api.rollbar.com",path:"/api/1/item/",search:null,version:"1",protocol:"https:",port:443};function r(e,t,n,i){this.options=e,this.transport=t,this.url=n,this.jsonBackup=i,this.accessToken=e.accessToken,this.transportOptions=c(e,n)}function c(e,t){return a.getTransportFromOptions(e,s,t)}r.prototype.postItem=function(e,t){var n=a.transportOptions(this.transportOptions,"POST"),i=a.buildPayload(this.accessToken,e,this.jsonBackup);this.transport.post(this.accessToken,n,i,t)},r.prototype.buildJsonPayload=function(e,t){var n=a.buildPayload(this.accessToken,e,this.jsonBackup),i=o.truncate(n);return i.error?(t&&t(i.error),null):i.value},r.prototype.postJsonPayload=function(e,t){var n=a.transportOptions(this.transportOptions,"POST");this.transport.postJsonPayload(this.accessToken,n,e,t)},r.prototype.configure=function(e){var t=this.oldOptions;return this.options=i.merge(t,e),this.transportOptions=c(this.options,this.url),void 0!==this.options.accessToken&&(this.accessToken=this.options.accessToken),this},e.exports=r},function(e,t,n){var i=n(7);e.exports={buildPayload:function(e,t,n){if(!i.isType(t.context,"string")){var a=i.stringify(t.context,n);a.error?t.context="Error: could not serialize 'context'":t.context=a.value||"",t.context.length>255&&(t.context=t.context.substr(0,255))}return{access_token:e,data:t}},getTransportFromOptions:function(e,t,n){var i=t.hostname,a=t.protocol,o=t.port,s=t.path,r=t.search,c=e.proxy;if(e.endpoint){var l=n.parse(e.endpoint);i=l.hostname,a=l.protocol,o=l.port,s=l.pathname,r=l.search}return{hostname:i,protocol:a,port:o,path:s,search:r,proxy:c}},transportOptions:function(e,t){var n=e.protocol||"https:",i=e.port||("http:"===n?80:"https:"===n?443:void 0),a=e.hostname,o=e.path;return e.search&&(o+=e.search),e.proxy&&(o=n+"//"+a+o,a=e.proxy.host||e.proxy.hostname,i=e.proxy.port,n=e.proxy.protocol||n),{protocol:n,hostname:a,path:o,port:i,method:t}},appendPathToPath:function(e,t){var n=/\/$/.test(e),i=/^\//.test(t);return n&&i?t=t.substring(1):n||i||(t="/"+t),e+t}}},function(e,t,n){var i=n(7),a=n(62),o=n(38),s=n(9),r=n(4),c=n(63);function l(){this.rateLimitExpires=0}function u(e,t,n){var i=t&&t.headers||{};if(i["Content-Type"]="application/json",n)try{i["Content-Length"]=Buffer.byteLength(n,"utf8")}catch(e){o.error("Could not get the content length of the data")}return i["X-Rollbar-Access-Token"]=e,i}function p(e){return{"http:":s,"https:":r}[e.protocol]}function d(){return Math.floor(Date.now()/1e3)}l.prototype.get=function(e,t,n,a,s){var r;if(a&&i.isFunction(a)||(a=function(){}),t=t||{},i.addParamsAndAccessTokenToPath(e,t,n),t.headers=u(e,t),!(r=s?s(t):p(t)))return o.error("Unknown transport based on given protocol: "+t.protocol),a(new Error("Unknown transport"));var c=r.request(t,function(e){this.handleResponse(e,a)}.bind(this));c.on("error",function(e){a(e)}),c.end()},l.prototype.post=function(e,t,n,s,r){var l;if(s&&i.isFunction(s)||(s=function(){}),d()<this.rateLimitExpires)return s(new Error("Exceeded rate limit"));if(t=t||{},!n)return s(new Error("Cannot send empty request"));var m=a.truncate(n,c);if(m.error)return o.error("Problem stringifying payload. Giving up"),s(m.error);var h=m.value;if(t.headers=u(e,t,h),!(l=r?r(t):p(t)))return o.error("Unknown transport based on given protocol: "+t.protocol),s(new Error("Unknown transport"));var f=l.request(t,function(e){this.handleResponse(e,function(e){return function(t,n){if(t)return e(t);n.result&&n.result.uuid?o.log(["Successful api response."," Link: https://rollbar.com/occurrence/uuid/?uuid="+n.result.uuid].join("")):o.log("Successful api response"),e(null,n.result)}}(s))}.bind(this));f.on("error",function(e){s(e)}),h&&f.write(h),f.end()},l.prototype.updateRateLimit=function(e){var t=parseInt(e.headers["x-rate-limit-remaining"]||0),n=Math.min(60,e.headers["x-rate-limit-remaining-seconds"]||0),i=d();429===e.statusCode&&0===t?this.rateLimitExpires=i+n:this.rateLimitExpires=i},l.prototype.handleResponse=function(e,t){this.updateRateLimit(e);var n=[];e.setEncoding("utf8"),e.on("data",function(e){n.push(e)}),e.on("end",function(){!function(e,t){var n=i.jsonParse(e);if(n.error)return o.error("Could not parse api response, err: "+n.error),t(n.error);if((e=n.value).err)return o.error("Received error: "+e.message),t(new Error("Api error: "+(e.message||"Unknown error")));t(null,e)}(n=n.join(""),t)})},e.exports=l},function(e,t,n){var i=n(64),a=n(124),o=n(126),s=n(25),r=n(7);function c(e,t,n){e.data=e.data||{},e.data.body=e.data.body||{};var i=e.message||"";e.data.body.message={body:i},n(null,e)}function l(e,t,n){e.stackInfo&&(e.data=e.data||{},e.data.body=e.data.body||{},e.data.body.trace_chain=e.stackInfo),n(null,e)}function u(e){var t=e.ip;return t||(t=o.getClientIp(e)),t}e.exports={baseData:function(e,t,n){var i=t.payload&&t.payload.environment||t.environment,a={timestamp:Math.round(e.timestamp/1e3),environment:e.environment||i,level:e.level||"error",language:"javascript",framework:e.framework||t.framework,uuid:e.uuid,notifier:JSON.parse(JSON.stringify(t.notifier))};t.codeVersion?a.code_version=t.codeVersion:t.code_version&&(a.code_version=t.code_version),Object.getOwnPropertyNames(e.custom||{}).forEach(function(t){a.hasOwnProperty(t)||(a[t]=e.custom[t])}),a.server={host:t.host,argv:process.argv.concat(),pid:process.pid},t.branch&&(a.server.branch=t.branch),t.root&&(a.server.root=t.root),e.data=a,n(null,e)},handleItemWithError:function(e,t,n){if(!e.err)return n(null,e);var o=e.err,s=[],r=[];do{s.push(o),o=o.nested}while(void 0!==o);e.stackInfo=r,i.eachSeries(s,function(e){return function(t,n){a.parseException(t,function(t,i){return t?n(t):(e.push({frames:i.frames,exception:{class:i.class,message:i.message}}),n(null))})}}(r),function(t){t&&(e.message=e.err.message||e.err.description||e.message||String(e.err),delete e.err,delete e.stackInfo),n(null,e)})},addBody:function(e,t,n){e.stackInfo?l(e,0,n):c(e,0,n)},addMessageData:c,addErrorData:l,addRequestData:function(e,t,n){e.data=e.data||{};var i=e.request;if(i){if(t.addRequestData&&r.isFunction(t.addRequestData))return t.addRequestData(e.data,i),void n(null,e);var a=function(e){var t,n=e.headers||{},i=n.host||"<no host>",a=e.protocol||(e.socket&&e.socket.encrypted?"https":"http");(t=r.isType(e.url,"string")?s.parse(e.url,!0):e.url||{}).protocol=t.protocol||a,t.host=t.host||i;var o={url:s.format(t),user_ip:u(e),headers:n,method:e.method};t.search&&t.search.length>0&&(o.GET=t.query);var c=e.body||e.payload;if(c){var l={};if(r.isIterable(c)){for(var p in c)Object.prototype.hasOwnProperty.call(c,p)&&(l[p]=c[p]);o[e.method]=l}else o.body=c}return o}(i);if(r.filterIp(a,t.captureIp),e.data.request=a,i.route)e.data.context=i.route.path;else try{e.data.context=i.app._router.matchRequest(i).path}catch(e){}var o=t.captureEmail,c=t.captureUsername;if(i.rollbar_person){var l=i.rollbar_person;!o&&l.email&&(l.email=null),!c&&l.username&&(l.username=null),e.data.person=l}else if(i.user)e.data.person={id:i.user.id},i.user.username&&c&&(e.data.person.username=i.user.username),i.user.email&&o&&(e.data.person.email=i.user.email);else if(i.user_id||i.userId){var p=i.user_id||i.userId;r.isFunction(p)&&(p=p()),e.data.person={id:p}}n(null,e)}else n(null,e)},addLambdaData:function(e,t,n){var i=e.lambdaContext;if(i){var a={remainingTimeInMillis:i.getRemainingTimeInMillis(),callbackWaitsForEmptyEventLoop:i.callbackWaitsForEmptyEventLoop,functionName:i.functionName,functionVersion:i.functionVersion,arn:i.invokedFunctionArn,requestId:i.awsRequestId};e.data=e.data||{},e.data.custom=e.data.custom||{},e.data.custom.lambda=a,n(null,e)}else n(null,e)},scrubPayload:function(e,t,n){var i=t.scrubHeaders||[],a=t.scrubFields||[];a=i.concat(a),e.data=r.scrub(e.data,a),n(null,e)}}},function(e,t,n){"use strict";var i=n(38),a=n(64),o=n(8),s=n(125),r=n(16),c=3,l=/^\s*at (?:([^(]+(?: \[\w\s+\])?) )?\(?(.+?)(?::(\d+):(\d+)(?:, <js>:(\d+):(\d+))?)?\)?$/,u=/^\s*at .+ \(.+ (at[^)]+\))\)$/,p=/^\s*(>?) [0-9]+\|(\s*.+)$/m,d=s({max:100}),m={};function h(e,t){var n,i,a,o;if((n=(i=e).match(u))&&(i=n[1]),!(n=i.match(l)))return t(null,null);o={method:(a=n.slice(1))[0]||"<unknown>",filename:a[1],lineno:Math.floor(a[2]),colno:Math.floor(a[3])},a[4]&&(o.compiled_lineno=Math.floor(a[4])),a[5]&&(o.compiled_colno=Math.floor(a[5])),t(null,o)}function f(e,t){var n,i,a;n="/"===e[0]||"."===e[0],i=!!d.get(e),a=!!m[e],t(n&&!i&&!a)}function g(e,t){void 0!==o.exists?o.exists(e,t):o.stat(e,function(e){t(!e)})}function v(e,t){var n=[];e.forEach(function(e){-1===n.indexOf(e.filename)&&n.push(e.filename)}),a.filter(n,f,function(n){var s;function r(e,t){!function(e,t){try{o.readFile(e,function(e,n){var i;return e?t(e):(i=n.toString("utf8").split("\n"),t(null,i))})}catch(e){i.log(e)}}(e,function(n,i){return n?t(n):(s[e]=i,d.set(e,i),t(null))})}function l(e,t){var n=s[e.filename]||d.get(e.filename);n&&function(e,t){e.code=t[e.lineno-1],e.context={pre:t.slice(Math.max(0,e.lineno-(c+1)),e.lineno-1),post:t.slice(e.lineno,e.lineno+c)}}(e,n),t(null)}s={},a.filter(n,g,function(n){a.each(n,r,function(n){if(n)return t(n);a.eachSeries(e,l,function(n){if(n)return t(n);t(null,e)})})})})}t.cache=d,t.pendingReads=m,t.parseException=function(e,n){var a=function(e){var t,n;if(null==e)return null;if("object"!=typeof e)return null;if(r.isArray(e))return e;for(n in t=[],e)Object.prototype.hasOwnProperty.call(e,n)&&t.push(e[n]);return t}(e.errors);return t.parseStack(e.stack,function(t,o){var s,r,l,u,d;return t?(i.error("could not parse exception, err: "+t),n(t)):(s=String(e.message||"<no message>"),l={class:r=String(e.name||"<unknown>"),message:s,frames:o},a&&a.length&&(u=a[0],l={class:r,message:String(u.message||"<no message>"),frames:o}),s.match(p)&&(d=function(e){var t,n,i,a,o,s,r,l,u,d,m;for(n=(t=e.split("\n"))[0].indexOf(":"),i=t[0].slice(0,n),a=parseInt(t[0].slice(n+1),10),s=t[(o=t.length)-1],t=t.slice(1,o-1),u=[],d=[],r=0;r<o-2;++r)(m=t[r].match(p))&&(">"===m[1]?l=m[2]:l?m[2]&&d.push(m[2]):m[2]&&u.push(m[2]));return{frame:{method:"<jade>",filename:i,lineno:a,code:l,context:{pre:u=u.slice(0,Math.min(u.length,c)),post:d=d.slice(0,Math.min(d.length,c))}},message:s}}(s),l.message=d.message,l.frames.push(d.frame)),n(null,l))})},t.parseStack=function(e,t){for(var n,i=e;"object"==typeof i;)i=i&&i.stack;n=(i||"").split("\n").slice(1),a.map(n,h,function(e,n){if(e)return t(e);n.reverse(),a.filter(n,function(e,t){t(!!e)},function(e){v(e,t)})})}},function(e,t,n){!function(){function t(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function n(){return 1}function i(e){if(!(this instanceof i))return new i(e);var o;"number"==typeof e&&(e={max:o=e}),e||(e={}),o=e.max;var s=e.length||n;"function"!=typeof s&&(s=n),(!o||"number"!=typeof o||o<=0)&&(o=1/0);var r=e.stale||!1,c=e.maxAge||null,l=e.dispose,u=Object.create(null),p=Object.create(null),d=0,m=0,h=0,f=0;function g(){for(;m<d&&h>o;)x(p[m])}function v(e){for(delete p[e.lu];m<d&&!p[m];)m++}function x(e){e&&(l&&l(e.key,e.value),h-=e.length,f--,delete u[e.key],v(e))}Object.defineProperty(this,"max",{set:function(e){(!e||"number"!=typeof e||e<=0)&&(e=1/0),h>(o=e)&&g()},get:function(){return o},enumerable:!0}),Object.defineProperty(this,"lengthCalculator",{set:function(e){if("function"!=typeof e)for(var t in s=n,h=f,u)u[t].length=1;else for(var t in s=e,h=0,u)u[t].length=s(u[t].value),h+=u[t].length;h>o&&g()},get:function(){return s},enumerable:!0}),Object.defineProperty(this,"length",{get:function(){return h},enumerable:!0}),Object.defineProperty(this,"itemCount",{get:function(){return f},enumerable:!0}),this.forEach=function(e,t){t=t||this;for(var n=0,i=d-1;i>=0&&n<f;i--)if(p[i]){n++;var a=p[i];e.call(t,a.value,a.key,this)}},this.keys=function(){for(var e=new Array(f),t=0,n=d-1;n>=0&&t<f;n--)if(p[n]){var i=p[n];e[t++]=i.key}return e},this.values=function(){for(var e=new Array(f),t=0,n=d-1;n>=0&&t<f;n--)if(p[n]){var i=p[n];e[t++]=i.value}return e},this.reset=function(){if(l)for(var e in u)l(e,u[e].value);u={},p={},m=0,d=0,h=0,f=0},this.dump=function(){return u},this.dumpLru=function(){return p},this.set=function(e,n){if(t(u,e))return l&&l(e,u[e].value),c&&(u[e].now=Date.now()),u[e].value=n,this.get(e),!0;var i=s(n),r=c?Date.now():0,m=new a(e,n,d++,i,r);return m.length>o?(l&&l(e,n),!1):(h+=m.length,p[m.lu]=u[e]=m,f++,h>o&&g(),!0)},this.has=function(e){if(!t(u,e))return!1;var n=u[e];return!(c&&Date.now()-n.now>c)},this.get=function(e){if(t(u,e)){var n=u[e];return c&&Date.now()-n.now>c?(this.del(e),r?n.value:void 0):(v(n),n.lu=d++,p[n.lu]=n,n.value)}},this.del=function(e){x(u[e])}}function a(e,t,n,i,a){this.key=e,this.value=t,this.lu=n,this.length=i,this.now=a}e.exports?e.exports=i:this.LRUCache=i}()},function(e,t,n){const i=n(127);function a(e){if(!i.existy(e))return null;if(i.not.string(e))throw new TypeError(`Expected a string, got "${typeof e}"`);return e.split(",").map(e=>{const t=e.trim();if(t.includes(":")){const e=t.split(":");if(2===e.length)return e[0]}return t}).find(i.ip)}function o(e){if(e.headers){if(i.ip(e.headers["x-client-ip"]))return e.headers["x-client-ip"];const t=a(e.headers["x-forwarded-for"]);if(i.ip(t))return t;if(i.ip(e.headers["cf-connecting-ip"]))return e.headers["cf-connecting-ip"];if(i.ip(e.headers["true-client-ip"]))return e.headers["true-client-ip"];if(i.ip(e.headers["x-real-ip"]))return e.headers["x-real-ip"];if(i.ip(e.headers["x-cluster-client-ip"]))return e.headers["x-cluster-client-ip"];if(i.ip(e.headers["x-forwarded"]))return e.headers["x-forwarded"];if(i.ip(e.headers["forwarded-for"]))return e.headers["forwarded-for"];if(i.ip(e.headers.forwarded))return e.headers.forwarded}if(i.existy(e.connection)){if(i.ip(e.connection.remoteAddress))return e.connection.remoteAddress;if(i.existy(e.connection.socket)&&i.ip(e.connection.socket.remoteAddress))return e.connection.socket.remoteAddress}return i.existy(e.socket)&&i.ip(e.socket.remoteAddress)?e.socket.remoteAddress:i.existy(e.info)&&i.ip(e.info.remoteAddress)?e.info.remoteAddress:null}e.exports={getClientIpFromXForwardedFor:a,getClientIp:o,mw:function(e){const t=i.not.existy(e)?{}:e;if(i.not.object(t))throw new TypeError("Options must be an object!");const n=t.attributeName||"clientIp";return(e,t,i)=>{e[n]=o(e),i()}}}},function(e,t,n){var i,a;
/*!
 * is.js 0.8.0
 * Author: Aras Atasaygin
 */a=this,void 0===(i=function(){return a.is=function(){var e={VERSION:"0.8.0",not:{},all:{},any:{}},t=Object.prototype.toString,n=Array.prototype.slice,i=Object.prototype.hasOwnProperty;function a(e){return function(){return!e.apply(null,n.call(arguments))}}function o(e){return function(){for(var t=l(arguments),n=t.length,i=0;i<n;i++)if(!e.call(null,t[i]))return!1;return!0}}function s(e){return function(){for(var t=l(arguments),n=t.length,i=0;i<n;i++)if(e.call(null,t[i]))return!0;return!1}}var r={"<":function(e,t){return e<t},"<=":function(e,t){return e<=t},">":function(e,t){return e>t},">=":function(e,t){return e>=t}};function c(e,t){var n=t+"",i=+(n.match(/\d+/)||NaN),a=n.match(/^[<>]=?|/)[0];return r[a]?r[a](e,i):e==i||i!=i}function l(t){var i=n.call(t),a=i.length;return 1===a&&e.array(i[0])&&(i=i[0]),i}e.arguments=function(e){return"[object Arguments]"===t.call(e)||null!=e&&"object"==typeof e&&"callee"in e},e.array=Array.isArray||function(e){return"[object Array]"===t.call(e)},e.boolean=function(e){return!0===e||!1===e||"[object Boolean]"===t.call(e)},e.char=function(t){return e.string(t)&&1===t.length},e.date=function(e){return"[object Date]"===t.call(e)},e.domNode=function(t){return e.object(t)&&t.nodeType>0},e.error=function(e){return"[object Error]"===t.call(e)},e.function=function(e){return"[object Function]"===t.call(e)||"function"==typeof e},e.json=function(e){return"[object Object]"===t.call(e)},e.nan=function(e){return e!=e},e.null=function(e){return null===e},e.number=function(n){return e.not.nan(n)&&"[object Number]"===t.call(n)},e.object=function(e){return Object(e)===e},e.regexp=function(e){return"[object RegExp]"===t.call(e)},e.sameType=function(n,i){var a=t.call(n);return a===t.call(i)&&("[object Number]"!==a||!e.any.nan(n,i)||e.all.nan(n,i))},e.sameType.api=["not"],e.string=function(e){return"[object String]"===t.call(e)},e.undefined=function(e){return void 0===e},e.windowObject=function(e){return null!=e&&"object"==typeof e&&"setInterval"in e},e.empty=function(t){if(e.object(t)){var n=Object.getOwnPropertyNames(t).length;return!!(0===n||1===n&&e.array(t)||2===n&&e.arguments(t))}return""===t},e.existy=function(e){return null!=e},e.falsy=function(e){return!e},e.truthy=a(e.falsy),e.above=function(t,n){return e.all.number(t,n)&&t>n},e.above.api=["not"],e.decimal=function(t){return e.number(t)&&t%1!=0},e.equal=function(t,n){return e.all.number(t,n)?t===n&&1/t==1/n:e.all.string(t,n)||e.all.regexp(t,n)?""+t==""+n:!!e.all.boolean(t,n)&&t===n},e.equal.api=["not"],e.even=function(t){return e.number(t)&&t%2==0},e.finite=isFinite||function(t){return e.not.infinite(t)&&e.not.nan(t)},e.infinite=function(e){return e===1/0||e===-1/0},e.integer=function(t){return e.number(t)&&t%1==0},e.negative=function(t){return e.number(t)&&t<0},e.odd=function(t){return e.number(t)&&t%2==1},e.positive=function(t){return e.number(t)&&t>0},e.under=function(t,n){return e.all.number(t,n)&&t<n},e.under.api=["not"],e.within=function(t,n,i){return e.all.number(t,n,i)&&t>n&&t<i},e.within.api=["not"];var u={affirmative:/^(?:1|t(?:rue)?|y(?:es)?|ok(?:ay)?)$/,alphaNumeric:/^[A-Za-z0-9]+$/,caPostalCode:/^(?!.*[DFIOQU])[A-VXY][0-9][A-Z]\s?[0-9][A-Z][0-9]$/,creditCard:/^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/,dateString:/^(1[0-2]|0?[1-9])([\/-])(3[01]|[12][0-9]|0?[1-9])(?:\2)(?:[0-9]{2})?[0-9]{2}$/,email:/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,eppPhone:/^\+[0-9]{1,3}\.[0-9]{4,14}(?:x.+)?$/,hexadecimal:/^(?:0x)?[0-9a-fA-F]+$/,hexColor:/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,ipv4:/^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,ipv6:/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,nanpPhone:/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,socialSecurityNumber:/^(?!000|666)[0-8][0-9]{2}-?(?!00)[0-9]{2}-?(?!0000)[0-9]{4}$/,timeString:/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/,ukPostCode:/^[A-Z]{1,2}[0-9RCHNQ][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$|^[A-Z]{2}-?[0-9]{4}$/,url:/^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i,usZipCode:/^[0-9]{5}(?:-[0-9]{4})?$/};function p(t,n){e[t]=function(e){return n[t].test(e)}}for(var d in u)u.hasOwnProperty(d)&&p(d,u);e.ip=function(t){return e.ipv4(t)||e.ipv6(t)},e.capitalized=function(t){if(e.not.string(t))return!1;for(var n=t.split(" "),i=0;i<n.length;i++){var a=n[i];if(a.length){var o=a.charAt(0);if(o!==o.toUpperCase())return!1}}return!0},e.endWith=function(t,n){if(e.not.string(t))return!1;n+="";var i=t.length-n.length;return i>=0&&t.indexOf(n,i)===i},e.endWith.api=["not"],e.include=function(e,t){return e.indexOf(t)>-1},e.include.api=["not"],e.lowerCase=function(t){return e.string(t)&&t===t.toLowerCase()},e.palindrome=function(t){if(e.not.string(t))return!1;for(var n=(t=t.replace(/[^a-zA-Z0-9]+/g,"").toLowerCase()).length-1,i=0,a=Math.floor(n/2);i<=a;i++)if(t.charAt(i)!==t.charAt(n-i))return!1;return!0},e.space=function(t){if(e.not.char(t))return!1;var n=t.charCodeAt(0);return n>8&&n<14||32===n},e.startWith=function(t,n){return e.string(t)&&0===t.indexOf(n)},e.startWith.api=["not"],e.upperCase=function(t){return e.string(t)&&t===t.toUpperCase()};var m=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],h=["january","february","march","april","may","june","july","august","september","october","november","december"];e.day=function(t,n){return e.date(t)&&n.toLowerCase()===m[t.getDay()]},e.day.api=["not"],e.dayLightSavingTime=function(e){var t=new Date(e.getFullYear(),0,1),n=new Date(e.getFullYear(),6,1),i=Math.max(t.getTimezoneOffset(),n.getTimezoneOffset());return e.getTimezoneOffset()<i},e.future=function(t){var n=new Date;return e.date(t)&&t.getTime()>n.getTime()},e.inDateRange=function(t,n,i){if(e.not.date(t)||e.not.date(n)||e.not.date(i))return!1;var a=t.getTime();return a>n.getTime()&&a<i.getTime()},e.inDateRange.api=["not"],e.inLastMonth=function(t){return e.inDateRange(t,new Date((new Date).setMonth((new Date).getMonth()-1)),new Date)},e.inLastWeek=function(t){return e.inDateRange(t,new Date((new Date).setDate((new Date).getDate()-7)),new Date)},e.inLastYear=function(t){return e.inDateRange(t,new Date((new Date).setFullYear((new Date).getFullYear()-1)),new Date)},e.inNextMonth=function(t){return e.inDateRange(t,new Date,new Date((new Date).setMonth((new Date).getMonth()+1)))},e.inNextWeek=function(t){return e.inDateRange(t,new Date,new Date((new Date).setDate((new Date).getDate()+7)))},e.inNextYear=function(t){return e.inDateRange(t,new Date,new Date((new Date).setFullYear((new Date).getFullYear()+1)))},e.leapYear=function(t){return e.number(t)&&(t%4==0&&t%100!=0||t%400==0)},e.month=function(t,n){return e.date(t)&&n.toLowerCase()===h[t.getMonth()]},e.month.api=["not"],e.past=function(t){var n=new Date;return e.date(t)&&t.getTime()<n.getTime()},e.quarterOfYear=function(t,n){return e.date(t)&&e.number(n)&&n===Math.floor((t.getMonth()+3)/3)},e.quarterOfYear.api=["not"],e.today=function(t){var n=new Date,i=n.toDateString();return e.date(t)&&t.toDateString()===i},e.tomorrow=function(t){var n=new Date,i=new Date(n.setDate(n.getDate()+1)).toDateString();return e.date(t)&&t.toDateString()===i},e.weekend=function(t){return e.date(t)&&(6===t.getDay()||0===t.getDay())},e.weekday=a(e.weekend),e.year=function(t,n){return e.date(t)&&e.number(n)&&n===t.getFullYear()},e.year.api=["not"],e.yesterday=function(t){var n=new Date,i=new Date(n.setDate(n.getDate()-1)).toDateString();return e.date(t)&&t.toDateString()===i};var f=e.windowObject("object"==typeof global&&global)&&global,g=e.windowObject("object"==typeof self&&self)&&self,v=e.windowObject("object"==typeof this&&this)&&this,x=f||g||v||Function("return this")(),b=g&&g.document,y=x.is,w=g&&g.navigator,k=(w&&w.appVersion||"").toLowerCase(),E=(w&&w.userAgent||"").toLowerCase(),S=(w&&w.vendor||"").toLowerCase();return e.android=function(){return/android/.test(E)},e.android.api=["not"],e.androidPhone=function(){return/android/.test(E)&&/mobile/.test(E)},e.androidPhone.api=["not"],e.androidTablet=function(){return/android/.test(E)&&!/mobile/.test(E)},e.androidTablet.api=["not"],e.blackberry=function(){return/blackberry/.test(E)||/bb10/.test(E)},e.blackberry.api=["not"],e.chrome=function(e){var t=/google inc/.test(S)?E.match(/(?:chrome|crios)\/(\d+)/):null;return null!==t&&c(t[1],e)},e.chrome.api=["not"],e.desktop=function(){return e.not.mobile()&&e.not.tablet()},e.desktop.api=["not"],e.edge=function(e){var t=E.match(/edge\/(\d+)/);return null!==t&&c(t[1],e)},e.edge.api=["not"],e.firefox=function(e){var t=E.match(/(?:firefox|fxios)\/(\d+)/);return null!==t&&c(t[1],e)},e.firefox.api=["not"],e.ie=function(e){var t=E.match(/(?:msie |trident.+?; rv:)(\d+)/);return null!==t&&c(t[1],e)},e.ie.api=["not"],e.ios=function(){return e.iphone()||e.ipad()||e.ipod()},e.ios.api=["not"],e.ipad=function(e){var t=E.match(/ipad.+?os (\d+)/);return null!==t&&c(t[1],e)},e.ipad.api=["not"],e.iphone=function(e){var t=E.match(/iphone(?:.+?os (\d+))?/);return null!==t&&c(t[1]||1,e)},e.iphone.api=["not"],e.ipod=function(e){var t=E.match(/ipod.+?os (\d+)/);return null!==t&&c(t[1],e)},e.ipod.api=["not"],e.linux=function(){return/linux/.test(k)},e.linux.api=["not"],e.mac=function(){return/mac/.test(k)},e.mac.api=["not"],e.mobile=function(){return e.iphone()||e.ipod()||e.androidPhone()||e.blackberry()||e.windowsPhone()},e.mobile.api=["not"],e.offline=a(e.online),e.offline.api=["not"],e.online=function(){return!w||!0===w.onLine},e.online.api=["not"],e.opera=function(e){var t=E.match(/(?:^opera.+?version|opr)\/(\d+)/);return null!==t&&c(t[1],e)},e.opera.api=["not"],e.phantom=function(e){var t=E.match(/phantomjs\/(\d+)/);return null!==t&&c(t[1],e)},e.phantom.api=["not"],e.safari=function(e){var t=E.match(/version\/(\d+).+?safari/);return null!==t&&c(t[1],e)},e.safari.api=["not"],e.tablet=function(){return e.ipad()||e.androidTablet()||e.windowsTablet()},e.tablet.api=["not"],e.touchDevice=function(){return!!b&&("ontouchstart"in g||"DocumentTouch"in g&&b instanceof DocumentTouch)},e.touchDevice.api=["not"],e.windows=function(){return/win/.test(k)},e.windows.api=["not"],e.windowsPhone=function(){return e.windows()&&/phone/.test(E)},e.windowsPhone.api=["not"],e.windowsTablet=function(){return e.windows()&&e.not.windowsPhone()&&/touch/.test(E)},e.windowsTablet.api=["not"],e.propertyCount=function(t,n){if(e.not.object(t)||e.not.number(n))return!1;var a=0;for(var o in t)if(i.call(t,o)&&++a>n)return!1;return a===n},e.propertyCount.api=["not"],e.propertyDefined=function(t,n){return e.object(t)&&e.string(n)&&n in t},e.propertyDefined.api=["not"],e.inArray=function(t,n){if(e.not.array(n))return!1;for(var i=0;i<n.length;i++)if(n[i]===t)return!0;return!1},e.inArray.api=["not"],e.sorted=function(t,n){if(e.not.array(t))return!1;for(var i=r[n]||r[">="],a=1;a<t.length;a++)if(!i(t[a],t[a-1]))return!1;return!0},function(){var t=e;for(var n in t)if(i.call(t,n)&&e.function(t[n]))for(var r=t[n].api||["not","all","any"],c=0;c<r.length;c++)"not"===r[c]&&(e.not[n]=a(e[n])),"all"===r[c]&&(e.all[n]=o(e[n])),"any"===r[c]&&(e.any[n]=s(e[n]))}(),e.setNamespace=function(){return x.is=y,this},e.setRegexp=function(e,t){for(var n in u)i.call(u,n)&&t===n&&(u[n]=e)},e}()}.call(t,n,t,e))||(e.exports=i)},function(e,t,n){var i=n(7);e.exports={itemToPayload:function(e,t,n){var a=t.payload||{};a.body&&delete a.body;var o=i.merge(e.data,a);e._isUncaught&&(o._isUncaught=!0),e._originalArgs&&(o._originalArgs=e._originalArgs),n(null,o)},addTelemetryData:function(e,t,n){e.telemetryEvents&&i.set(e,"data.body.telemetry",e.telemetryEvents),n(null,e)},addMessageWithError:function(e,t,n){if(e.message){var a="data.body.trace_chain.0",o=i.get(e,a);if(o||(a="data.body.trace",o=i.get(e,a)),o){if(!o.exception||!o.exception.description)return i.set(e,a+".exception.description",e.message),void n(null,e);var s=i.get(e,a+".extra")||{},r=i.merge(s,{message:e.message});i.set(e,a+".extra",r)}n(null,e)}else n(null,e)},userTransform:function(e){return function(t,n,a){var o=i.merge(t);try{i.isFunction(n.transform)&&n.transform(o.data,t)}catch(i){return n.transform=null,e.error("Error while calling custom transform() function. Removing custom transform().",i),void a(null,t)}a(null,o)}},addConfigToPayload:function(e,t,n){if(!t.sendConfig)return n(null,e);var a=i.get(e,"data.custom")||{};a._rollbarConfig=t,e.data.custom=a,n(null,e)}}},function(e,t,n){var i=n(7);function a(e,t,n,a){var o,s,r,c,l,u,p,d,m=!1;"blacklist"===n&&(m=!0);try{if(u=(o=m?t.hostBlackList:t.hostWhiteList)&&o.length,s=i.get(e,"body.trace"),!o||0===u)return!m;if(!s||!s.frames||0===s.frames.length)return!m;for(c=s.frames.length,p=0;p<c;p++){if(r=s.frames[p].filename,!i.isType(r,"string"))return!m;for(d=0;d<u;d++)if(l=o[d],new RegExp(l).test(r))return!0}}catch(e){m?t.hostBlackList=null:t.hostWhiteList=null;var h=m?"hostBlackList":"hostWhiteList";return a.error("Error while reading your configuration's "+h+" option. Removing custom "+h+".",e),!m}return!1}e.exports={checkLevel:function(e,t){var n=e.level,a=i.LEVELS[n]||0,o=t.reportLevel;return!(a<(i.LEVELS[o]||0))},userCheckIgnore:function(e){return function(t,n){var a=!!t._isUncaught;delete t._isUncaught;var o=t._originalArgs;delete t._originalArgs;try{i.isFunction(n.onSendCallback)&&n.onSendCallback(a,o,t)}catch(t){n.onSendCallback=null,e.error("Error while calling onSendCallback, removing",t)}try{if(i.isFunction(n.checkIgnore)&&n.checkIgnore(a,o,t))return!1}catch(t){n.checkIgnore=null,e.error("Error while calling custom checkIgnore(), removing",t)}return!0}},urlIsNotBlacklisted:function(e){return function(t,n){return!a(t,n,"blacklist",e)}},urlIsWhitelisted:function(e){return function(t,n){return a(t,n,"whitelist",e)}},messageIsIgnored:function(e){return function(t,n){var a,o,s,r,c,l,u,p;try{if(c=!1,!(s=n.ignoredMessages)||0===s.length)return!0;if(l=t.body,u=i.get(l,"trace.exception.message"),p=i.get(l,"message.body"),!(a=u||p))return!0;for(r=s.length,o=0;o<r&&!(c=new RegExp(s[o],"gi").test(a));o++);}catch(t){n.ignoredMessages=null,e.error("Error while reading your configuration's ignoredMessages option. Removing custom ignoredMessages.")}return!c}}}},function(e,t,n){"use strict";const i=n(6);e.exports=class extends i{start(e,t){return new Promise((e,n)=>{t.on("did-pick-install",()=>e()),t.on("did-skip-install",()=>t.destroy())})}}},function(e,t,n){"use strict";const{parseSetCookies:i,findCookie:a}=n(5),o=n(27),s=n(6);e.exports=class extends s{start({account:{email:e}}={},t){return this.install=t,new Promise((n,i)=>{this.subscriptions.add(t.on("did-submit-credentials",({email:e,password:t})=>n(this.onSubmit({email:e,password:t})))),this.subscriptions.add(t.on("did-click-back",()=>{n({step:this.options.backStep,data:{error:null}})})),this.subscriptions.add(t.on("did-forgot-password",()=>{o.resetPassword({email:e}).then(n=>{200===n.statusCode&&t.emit("did-reset-password",e)})}))})}onSubmit(e){return this.install.updateState({error:null,account:e}),o.login(e).then(e=>({account:{sessionId:a(i(e.headers["set-cookie"]),"kite-session").Value}}))}}},function(e,t,n){"use strict";const i=n(6),{deepMerge:a}=n(5);e.exports=class extends i{constructor(e,t){super(t),this.steps=e}start(e,t){return Promise.all(this.steps.map(n=>n.start(e,t))).then(e=>e.reduce((e,t)=>t?a(e,t):e))}getView(){return this.view||this.steps.map(e=>e.view).filter(e=>e)[0]}}},function(e,t,n){"use strict";const i=n(6);e.exports=class extends i{start(e){return Promise.resolve(e)}}},function(e,t,n){"use strict";const i=n(6);e.exports=class extends i{constructor(e,t){super(e),this.action=t}start(){return this.action&&this.action(),new Promise(()=>{})}}},function(e,t,n){"use strict";const{CompositeDisposable:i}=n(0),a=n(3),o=n(61),{logo:s}=n(30),r=n(17);e.exports=class extends HTMLElement{static initClass(){const e=document.registerElement("kite-atom-install",{prototype:this.prototype});return atom.themes.requireStylesheet(a.resolve(__dirname,"..","..","..","styles","install.less")),atom.views.addViewProvider(o,t=>{const n=new e;return n.setModel(t),n}),e}createdCallback(){this.classList.add("native-key-bindings"),this.innerHTML=`\n    <div class="install-wrapper">\n      <div class="logo">${s}</div>\n\n      <div class="progress-indicators">\n        <div class="download-kite invisible">\n          <progress max='100' class="inline-block"></progress>\n          <span class="inline-block">Downloading Kite</span>\n        </div>\n        <div class="install-kite hidden">\n          <span class='loading loading-spinner-tiny inline-block'></span>\n          <span class="inline-block">Installing Kite</span>\n        </div>\n        <div class="run-kite hidden">\n          <span class='loading loading-spinner-tiny inline-block'></span>\n          <span class="inline-block">Starting Kite</span>\n        </div>\n        <div class="authenticate-user hidden">\n          <span class='loading loading-spinner-tiny inline-block'></span>\n          <span class="inline-block">Authenticating your account</span>\n        </div>\n        <div class="install-plugin hidden">\n          <span class='loading loading-spinner-tiny inline-block'></span>\n          <span class="inline-block">Installing the Kite plugin</span>\n        </div>\n      </div>\n\n      <div class="content"></div>\n    </div>`,this.logo=this.querySelector(".logo"),this.content=this.querySelector(".content"),this.progress=this.querySelector("progress"),this.downloadKite=this.querySelector(".download-kite"),this.installKite=this.querySelector(".install-kite"),this.runKite=this.querySelector(".run-kite"),this.authenticateUser=this.querySelector(".authenticate-user"),this.installPlugin=this.querySelector(".install-plugin"),this.indicators=this.querySelector(".progress-indicators")}detachedCallback(){this.subscriptions&&this.subscriptions.dispose(),delete this.install,delete this.subscriptions}setModel(e){this.subscriptions=new i,this.install=e,this.subscriptions.add(this.install.onDidChangeCurrentStep(()=>{this.updateView()})),this.subscriptions.add(this.install.observeState(e=>{void 0!==e.kiteLogoVisible&&this.logo.classList.toggle("hidden",!e.kiteLogoVisible),e.download&&(e.download.done?this.downloadKite.classList.add("hidden"):this.downloadKite.classList.remove("invisible"),e.download.ratio&&(this.progress.value=Math.round(100*e.download.ratio))),e.install&&this.installKite.classList.toggle("hidden",e.install.done),e.running&&this.runKite.classList.toggle("hidden",e.running.done),e.authenticate&&this.authenticateUser.classList.toggle("hidden",e.authenticate.done),e.plugin&&this.installPlugin.classList.toggle("hidden",e.plugin.done)})),this.subscriptions.add(this.install.on("encountered-fatal-error",()=>{this.indicators.classList.add("hidden")}))}getModel(){return this.install}updateView(){this.currentView&&this.currentView.release();const e=this.install.getCurrentStepView();e&&(this.content.children.length&&[].slice.call(this.content.children).forEach(e=>this.content.removeChild(e)),this.content.appendChild(e),e.init(this.install),this.currentView=e,this.currentView.name&&r.Tracker.trackEvent(`${this.currentView.name}_shown`,this.install.state.error?{error:this.install.state.error.message}:{}))}}.initClass()},function(e,t,n){"use strict";const{CompositeDisposable:i}=n(0),{addDisposableEventListener:a}=n(18);class o extends HTMLElement{constructor(e){super(),this.name=e,this.innerHTML='\n    <div>\n      <p>Great! Create an account with your email address.</p>\n    </div>\n    <form novalidate>\n      <input class="input-text" name="email" type="email"></input>\n      <button class="btn btn-primary btn-block">Continue</button>\n      <div class="status hidden"></div>\n    </form>\n    <center>\n      <div class="dismiss secondary-actions">\n        <a class="skip-email">Continue without email</a>\n      </div>\n    </center>\n\n    ',this.form=this.querySelector("form"),this.input=this.querySelector("input"),this.submit=this.querySelector("button"),this.status=this.querySelector(".status"),this.skipButton=this.querySelector("a.skip-email")}get data(){return{email:this.input.value}}release(){this.subscriptions&&this.subscriptions.dispose(),delete this.install,delete this.subscriptions}init(e){this.subscriptions=new i,this.install=e,this.classList.remove("disabled"),this.subscriptions.add(e.observeState(e=>this.onStateChange(e))),this.subscriptions.add(a(this.form,"submit",()=>{this.hideError(),this.classList.add("disabled"),this.install.emit("did-submit-email",this.data)})),this.subscriptions.add(a(this.skipButton,"click",()=>{this.install.emit("did-skip-email",{skipped:!0})}))}onStateChange(e){this.input.value=e.account.email||"",e.error?(console.log(e.error),this.status.textContent=e.error.message,this.status.classList.remove("hidden")):this.hideError()}hideError(){this.status.textContent="",this.status.classList.add("hidden")}}customElements.define("kite-atom-input-email",o),e.exports=o},function(e,t,n){"use strict";const{screenshot:i}=n(30);class a extends HTMLElement{constructor(e){super(),this.name=e,this.innerHTML=`\n    <div class="welcome-to-kite">\n      <div class="warning">\n        <span class="icon">⚠️</span>\n        <span class="message">Kite is still installing on your machine. Please do not close this tab until installation has finished.</span>\n      </div>\n      <div class="description">\n        <div class="content">\n          <p>Kite provides the best Python completions in the world</p>\n          <ul>\n            <li>1.5x more completions than the basic engine</li>\n            <li>Completions ranked by your current code context</li>\n            <li>Full line of code completions</li>\n            <li>Works locally without an internet connection</li>\n          </ul>\n        </div>\n        <div class="description-screenshot"><img src="${i}"></div>\n      </div>\n      <p>\n        Kite is under active development. You can expect our completions\n        to improve significantly and become more intelligent over the coming\n        months.</p>\n      <p class="feedback">Send us feedback at <a href="mailto:feedback@kite.com">feedback@kite.com</a></p>\n    </div>\n    `}init(e){this.install=e,this.install.emit("did-skip-whitelist")}release(){}}customElements.define("kite-atom-install-wait",a),e.exports=a},function(e,t,n){"use strict";const{logoSmall:i,screenshot:a}=n(30);class o extends HTMLElement{constructor(e){super(),this.name=e,this.innerHTML=`\n    <div class="welcome-to-kite">\n      <div class="welcome-title">\n        <h3>Welcome to Kite!</h3>\n        <div class="title-logo">${i}</div>\n      </div>\n      <div class="warning">\n        <span class="icon">🎉</span>\n        <span class="message">Kite is now integrated with Atom. You'll see your completions improve over the next few minutes as Kite analyzes your code.</span>\n      </div>\n      <div class="description">\n        <div class="content">\n          <p>Kite provides the best Python completions in the world</p>\n          <ul>\n            <li>1.5x more completions than the basic engine</li>\n            <li>Completions ranked by your current code context</li>\n            <li>Full line of code completions</li>\n            <li>Works locally without an internet connection</li>\n          </ul>\n        </div>\n        <div class="description-screenshot"><img src="${a}"></div>\n      </div>\n      <p>\n        Kite is under active development. You can expect our completions\n        to improve significantly and become more intelligent over the coming\n        months.</p>\n      <p class="feedback">Send us feedback at <a href="mailto:feedback@kite.com">feedback@kite.com</a></p>\n    </div>\n    `}init(e){this.install=e,this.install.updateState({kiteLogoVisible:!1})}release(){}}customElements.define("kite-atom-install-end",o),e.exports=o},function(e,t,n){"use strict";class i extends HTMLElement{constructor(e){super(),this.name=e}init(e){this.install=e,this.install.emit("encountered-fatal-error"),this.innerHTML=`\n    <div class="content">\n      <p>\n        We've encountered an error!\n        Please email <a href="mailto:feedback@kite.com">feedback@kite.com</a>\n        with the contents of the error message below to get help.\n      </p>\n    </div>\n    <br>\n    <div class="status">\n      <h4>${e.state.error.message}</h4>\n      <pre>${e.state.error.stack}</pre>\n    </div>\n    `}release(){}}customElements.define("kite-atom-install-error",i),e.exports=i},function(e,t,n){"use strict";const{CompositeDisposable:i}=n(0),{addDisposableEventListener:a}=n(18),{demoVideo:o}=n(30);class s extends HTMLElement{constructor(e){super(),this.name=e,this.innerHTML=`\n    <h2><span class="icon">📦</span> autocomplete-python installed successfully</h2>\n    <div id="kite" class="inset-panel kite-description">\n      <h3>Level up your completions with Kite</h3>\n      <div class="columns">\n        <div class="body">\n          <div class="summary">\n            Kite is a native app that runs locally on your computer and uses machine learning to provide advanced completions\n          </div>\n          <ul class="features">\n            <li class="feature icon icon-check">All the features of autocomplete-python and...</li>\n            <li class="feature icon icon-check">1.5x more completions</li>\n            <li class="feature icon icon-check">Completions ranked by code context</li>\n            <li class="feature icon icon-check">Full line of code completions</li>\n            <li class="feature icon icon-check">100% local - no internet connection required</li>\n            <li class="feature icon icon-check">100% free to use</li>\n          </ul>\n          <div class="more">\n            <a href="https://kite.com">Learn more</a>\n          </div>\n        </div>\n        <div class="actions">\n          <video autoplay loop playsinline>\n            <source src="${o}" type="video/mp4">\n          </video>\n          <div class="cta-container">\n            <center>\n              <button class="btn btn-primary">\n                <span class="icon icon-cloud-download"></span>Add Kite\n              </button>\n            </center>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="dismiss">\n      <a href="#">Dismiss</a>\n    </div>\n    `,this.skipButton=this.querySelector(".dismiss a"),this.nextButton=this.querySelector("#kite .actions .cta-container .btn")}init(e){this.install=e,this.subscriptions=new i,this.install.updateState({kiteLogoVisible:!1}),this.subscriptions.add(a(this.skipButton,"click",()=>{this.install.emit("did-skip-install")})),this.subscriptions.add(a(this.nextButton,"click",()=>{this.install.updateState({kiteLogoVisible:!0}),this.install.emit("did-pick-install")}))}release(){this.subscriptions&&this.subscriptions.dispose(),delete this.subscriptions}}customElements.define("kite-atom-kite-vs-jedi",s),e.exports=s},function(e,t,n){"use strict";const{CompositeDisposable:i}=n(0),{addDisposableEventListener:a}=n(18);class o extends HTMLElement{constructor(e){super(),this.name=e,this.innerHTML='\n    <p>It seems like you already have a Kite account. Sign in with your login info.</p>\n    <form novalidate>\n      <input class=\'input-text\' name="email" type="email"></input>\n      <input class=\'input-text\' name="password" type="password"></input>\n      <button class="btn btn-primary btn-block" type="submit">Sign in</button>\n      <div class="secondary-actions">\n        <a class="back">Back</a>\n        <a class="reset-password secondary-cta">Forgot password</a>\n      </div>\n      <div class="status hidden"></div>\n    </form>\n    ',this.form=this.querySelector("form"),this.input=this.querySelector('input[type="email"]'),this.password=this.querySelector('input[type="password"]'),this.submit=this.querySelector('button[type="submit"]'),this.backButton=this.querySelector("a.back"),this.forgotPassword=this.querySelector("a.reset-password"),this.status=this.querySelector(".status")}get data(){return{email:this.input.value,password:this.password.value}}release(){this.subscriptions&&this.subscriptions.dispose(),delete this.install,delete this.subscriptions}init(e){this.subscriptions=new i,this.install=e,this.classList.remove("disabled"),this.subscriptions.add(e.on("did-reset-password",e=>{atom.notifications.addSuccess(`Instructions on how to reset your password should\n         have been sent to ${e}`)})),this.subscriptions.add(a(this.form,"submit",()=>{this.classList.add("disabled"),this.install.emit("did-submit-credentials",this.data)})),this.subscriptions.add(a(this.forgotPassword,"click",()=>{this.install.emit("did-forgot-password")})),this.subscriptions.add(a(this.backButton,"click",()=>{this.install.emit("did-click-back")})),this.subscriptions.add(e.observeState(e=>this.onStateChange(e)))}onStateChange(e){e.account.email&&(this.input.value=e.account.email),e.account.password&&(this.input.password=e.account.password),e.error?(this.status.textContent=e.error.message,this.status.classList.remove("hidden")):this.hideError()}hideError(){this.status.textContent="",this.status.classList.add("hidden")}}customElements.define("kite-atom-login",o),e.exports=o},function(e,t,n){"use strict";const{CompositeDisposable:i}=n(0),{addDisposableEventListener:a}=n(18);class o extends HTMLElement{constructor(e){super(),this.name=e,this.innerHTML='\n    <div class="content">\n      <p>It seems like you don\'t have administrator privileges. Please restart Atom as an administrator and try installing Kite again.</p>\n      <p>You can also <a class="download-link" href="https://kite.com/download">manually install Kite</a>.</p>\n      <p class="dismiss"><a class="dismiss-link" href="#">Don\'t show this again</a></p>\n    </div>\n    ',this.dismissButton=this.querySelector(".dismiss-link")}init(e){this.install=e,this.subscriptions=new i,this.subscriptions.add(a(this.dismissButton,"click",()=>{this.install.destroy(),this.install.emit("not-admin-dismissed")})),this.install.emit("not-admin-shown")}release(){}}customElements.define("kite-atom-install-not-admin",o),e.exports=o},function(e,t,n){"use strict";const i=n(6),a=n(18),o=n(17);e.exports=class extends i{start(e,t){return t.updateState({plugin:{done:!1}}),a.installPackage().then(()=>new Promise(e=>{setTimeout(()=>{a.activatePackage(),e()},200)})).then(()=>{o.Tracker.trackEvent("kite_installer_kite_plugin_installed"),t.updateState({plugin:{done:!0}})})}}},function(e,t,n){"use strict";let i,a,o,s,r,c,l,u,p,d,m,h,f;const g=()=>{f||(({Errors:r,Metrics:c}=n(26)),f=n(11),s=n(152),h=n(31),p=r())},v=()=>{l||({promisifyReadResponse:l,flatten:d,compact:m}=n(1))},x=30,b=2500,y={python:["py"],javascript:["js"]};e.exports=class{static get STATES(){return g(),f.STATES}constructor(e){o||({Emitter:o}=n(0)),this.emitter=new o,this.kite=e}onDidGetState(e){return this.emitter.on("did-get-state",e)}onDidChangeState(e){return this.emitter.on("did-change-state",e)}onKiteReady(e){return this.emitter.on("kite-ready",e)}onWillDownload(e){return this.emitter.on("will-download",e)}onDidDownload(e){return this.emitter.on("did-download",e)}onDidFailDownload(e){return this.emitter.on("did-fail-download",e)}onDidSkipInstall(e){return this.emitter.on("did-skip-install",e)}onWillInstall(e){return this.emitter.on("will-install",e)}onDidInstall(e){return this.emitter.on("did-install",e)}onDidFailInstall(e){return this.emitter.on("did-fail-install",e)}onWillStart(e){return this.emitter.on("will-start",e)}onDidStart(e){return this.emitter.on("did-start",e)}onDidFailStart(e){return this.emitter.on("did-fail-start",e)}onDidShowLogin(e){return this.emitter.on("did-show-login",e)}onDidSubmitLogin(e){return this.emitter.on("did-submit-login",e)}onDidShowLoginError(e){return this.emitter.on("did-show-login-error",e)}onDidShowSignupError(e){return this.emitter.on("did-show-signup-error",e)}onDidCancelLogin(e){return this.emitter.on("did-cancel-login",e)}onDidResetPassword(e){return this.emitter.on("did-reset-password",e)}onWillAuthenticate(e){return this.emitter.on("will-authenticate",e)}onDidAuthenticate(e){return this.emitter.on("did-authenticate",e)}onDidFailAuthenticate(e){return this.emitter.on("did-fail-authenticate",e)}onDidGetUnauthorized(e){return this.emitter.on("did-get-unauthorized",e)}reset(){delete this.previousState,delete this.ready}dispose(){this.emitter.dispose()}connect(e){return g(),f.checkHealth().then(t=>{t>=f.STATES.INSTALLED&&localStorage.setItem("kite.wasInstalled",!0);let n=!1;return(t===f.STATES.RUNNING||t===f.STATES.REACHABLE)&&(!this.previousPolledState||this.previousPolledState!==t||"activation"!==e&&"pollingInterval"!==e)||(n=!0),this.emitter.emit("did-get-state",{state:t,canNotify:n}),t!==this.previousState&&(this.emitter.emit("did-change-state",t),this.previousState=t,t!==f.STATES.READY||this.ready||(this.emitter.emit("kite-ready"),this.ready=!0)),"activation"!==e&&"pollingInterval"!==e||(this.previousPolledState=t),t})}installFlow(){return g(),Promise.all([f.canInstallKite(),localStorage.getItem("kite.no-admin-privileges")?Promise.reject("User does not have admin privileges"):Promise.resolve()]).then(([e])=>{c.Tracker.name="atom",c.Tracker.props={},c.Tracker.props.lastEvent=event,this.showInstallFlow({})},e=>{s.error("rejected with data:",e)})}showInstallFlow(e){g(),p||(p=r());const{install:{Install:t,atom:a}}=n(26),{defaultFlow:o}=a(),s=new t(o(),{path:atom.project.getPaths()[0]||i.homedir()},{failureStep:"termination",title:"Kite Install"}),c=f.Account.client;return f.Account.client=new h("alpha.kite.com",-1,"",!0),p.trackUncaught(),atom.workspace.getActivePane().addItem(s),atom.workspace.getActivePane().activateItem(s),s.start().catch(e=>console.error(e)).then(()=>{f.Account.client=c}),s}install(){return g(),this.emitter.emit("will-download"),f.downloadKiteRelease({install:!0,onDownload:()=>this.emitter.emit("did-download"),onInstallStart:()=>this.emitter.emit("will-install")}).then(()=>this.emitter.emit("did-install")).catch(e=>{switch(e.type){case"bad_status":case"curl_error":this.emitter.emit("did-fail-download",e);break;default:this.emitter.emit("did-fail-install",e)}throw e})}wasInstalledOnce(){return"true"===localStorage.getItem("kite.wasInstalled")}start(){return g(),this.emitter.emit("will-start"),f.runKiteAndWait(x,b).then(()=>this.emitter.emit("did-start")).catch(e=>{throw this.emitter.emit("did-fail-start",e),e})}startEnterprise(){return g(),this.emitter.emit("will-start"),f.runKiteEnterpriseAndWait(x,b).then(()=>this.emitter.emit("did-start")).catch(e=>{throw this.emitter.emit("did-fail-start",e),e})}login(){atom.applicationDelegate.openExternal("kite://home")}copilotSettings(){atom.applicationDelegate.openExternal("kite://settings")}saveUserID(){return g(),v(),f.request({path:"/clientapi/user",method:"GET"}).then(e=>{if(s.logResponse(e),200!==e.statusCode)throw new Error("Unable to reach user endpoint");return l(e)}).then(e=>{void 0!==(e=JSON.parse(e)).id&&(u||(u=n(68)),u.set("distinctID",e.id))}).catch(e=>{})}getRootDirectory(e){i||(i=n(2)),a||(a=n(3));const[t]=atom.project.getPaths(),o=e&&e.getPath()||t;return o&&0===a.relative(i.homedir(),o).indexOf("..")?a.parse(o).root:i.homedir()}getSupportedLanguagesRegExp(e){return v(),`.(${m(d(e.map(e=>y[e]))).join("|")})$`}}},function(e,t,n){"use strict";const i=n(2),a=n(8),o=n(3),s=n(4),r=n(10),c=n(14),l=n(19),{STATES:u}=n(15),p={RELEASE_URL:"https://alpha.kite.com/release/dls/mac/current",APPS_PATH:"/Applications/",KITE_DMG_PATH:"/tmp/Kite.dmg",KITE_VOLUME_PATH:"/Volumes/Kite/",KITE_APP_PATH:{mounted:"/Volumes/Kite/Kite.app",defaultInstalled:"/Applications/Kite.app"},KITE_SIDEBAR_PATH:"/Applications/Kite.app/Contents/MacOS/KiteSidebar.app",KITE_BUNDLE_ID:"com.kite.Kite",SESSION_FILE_PATH:o.join(i.homedir(),".kite","session.json"),get releaseURL(){return this.RELEASE_URL},get downloadPath(){return this.KITE_DMG_PATH},get installPath(){return this.allInstallPaths[0]},get allInstallPaths(){let e=String(r.spawnSync("mdfind",['kMDItemCFBundleIdentifier = "com.kite.Kite"']).stdout).trim().split("\n");return-1===e.indexOf(this.KITE_APP_PATH.defaultInstalled)&&this.checkDefaultAppPath()&&e.push(this.KITE_APP_PATH.defaultInstalled),e.filter(e=>""!==e)},get enterpriseInstallPath(){return this.allEnterpriseInstallPaths[0]},get allEnterpriseInstallPaths(){return String(r.spawnSync("mdfind",['kMDItemCFBundleIdentifier = "enterprise.kite.Kite"']).stdout).trim().split("\n")},get sessionFilePath(){return this.SESSION_FILE_PATH},isAdmin(){try{const e=c.whoami();return String(r.execSync("dscacheutil -q group -a name admin")).split("\n").filter(e=>/^users:/.test(e))[0].trim().replace(/users:\s+/,"").split(/\s/g).includes(e)}catch(e){return!1}},arch:()=>i.arch(),isOSSupported:()=>!0,isOSVersionSupported:()=>parseFloat(i.release())>=14,isKiteSupported(){return this.isOSVersionSupported()},checkDefaultAppPath(){return a.existsSync(this.KITE_APP_PATH.defaultInstalled)},isKiteInstalled(){return c.spawnPromise("mdfind",['kMDItemCFBundleIdentifier = "com.kite.Kite"'],"mdfind_error","Unable to run mdfind and verify that Kite is installed").then(e=>{if(!(e&&""!==e.trim()||this.checkDefaultAppPath()))throw new l("Unable to find Kite application install using mdfind",{state:u.UNINSTALLED})})},hasManyKiteInstallation(){return this.allInstallPaths.length>1},hasManyKiteEnterpriseInstallation(){return this.allEnterpriseInstallPaths.length>1},hasBothKiteInstalled(){return Promise.all([this.isKiteInstalled(),this.isKiteEnterpriseInstalled()])},isKiteEnterpriseInstalled:()=>c.spawnPromise("mdfind",['kMDItemCFBundleIdentifier = "enterprise.kite.Kite"'],"mdfind_error","Unable to run mdfind and verify that kite enterprise is installed").then(e=>{if(!e||""===e.trim())throw new l("Unable to find Kite Enterprise application install using mdfind",{state:u.UNINSTALLED})}),downloadKiteRelease(e){return this.downloadKite(this.releaseURL,e||{})},downloadKite(e,t){return t=t||{},this.streamKiteDownload(e,t.onDownloadProgress).then(()=>c.guardCall(t.onDownload)).then(()=>t.install&&this.installKite(t))},streamKiteDownload(e,t){const n=s.request(e);return n.end(),c.followRedirections(n).then(e=>{if(t){const n=parseInt(e.headers["content-length"],10);let i=0;e.on("data",e=>{i+=e.length,t(i,n,i/n)})}return c.promisifyStream(e.pipe(a.createWriteStream(this.downloadPath))).then(()=>new Promise((e,t)=>{setTimeout(e,100)}))})},installKite(e){return e=e||{},c.guardCall(e.onInstallStart),c.spawnPromise("hdiutil",["attach","-nobrowse",this.KITE_DMG_PATH],"mount_error","Unable to mount Kite.dmg").then(()=>c.guardCall(e.onMount)).then(()=>c.spawnPromise("cp",["-r",this.KITE_APP_PATH.mounted,this.APPS_PATH],"cp_error","Unable to copy Kite.app in the applications directory")).then(()=>c.guardCall(e.onCopy)).then(()=>c.spawnPromise("hdiutil",["detach",this.KITE_VOLUME_PATH],"unmount_error","Unable to unmount Kite.dmg")).then(()=>c.guardCall(e.onUnmount)).then(()=>c.spawnPromise("rm",[this.KITE_DMG_PATH],"rm_error","Unable to remove Kite.dmg")).then(()=>c.guardCall(e.onRemove)).then(()=>c.retryPromise(()=>this.isKiteInstalled(),10,1500))},isKiteRunning:()=>c.spawnPromise("/bin/ps",["-axco","command"],{encoding:"utf8"},"ps_error","Unable to run the ps command and verify that Kite is running").then(e=>{if(!e.split("\n").some(e=>/^Kite$/.test(e)))throw new l("Kite process could not be found in the processes list",{state:u.NOT_RUNNING})}),runKite(){const e=Object.assign({},process.env);return delete e.ELECTRON_RUN_AS_NODE,this.isKiteRunning().catch(()=>c.spawnPromise("defaults",["write","com.kite.Kite","shouldReopenSidebar","0"],"defaults_error","Unable to run defaults command").then(()=>c.spawnPromise("open",["-a",this.installPath,"--args","--plugin-launch","--channel=autocomplete-python"],{env:e},"open_error","Unable to run the open command to start Kite")))},isKiteEnterpriseRunning:()=>c.spawnPromise("/bin/ps",["-axco","command"],{encoding:"utf8"},"ps_error","Unable to run the ps command and verify that Kite enterprise is running").then(e=>{if(!e.split("\n").some(e=>/^KiteEnterprise$/.test(e)))throw new l("Kite Enterprise process could not be found in the processes list",{state:u.NOT_RUNNING})}),runKiteEnterprise(){const e=Object.assign({},process.env);return delete e.ELECTRON_RUN_AS_NODE,c.spawnPromise("defaults",["write","enterprise.kite.Kite","shouldReopenSidebar","0"],"defaults_error","Unable to run defaults command").then(()=>c.spawnPromise("open",["-a",this.enterpriseInstallPath],{env:e},"open_error","Unable to run the open command and start Kite enterprise"))}};e.exports=p},function(e,t,n){"use strict";const i=n(2),a=n(8),o=n(3),s=n(4),r=n(10),c=n(14),l=n(19),u=n(41),{STATES:p}=n(15),d=`"${o.join(__dirname,"read-key.bat")}"`;o.join(__dirname,"read-arch.bat");let m;const h={RELEASE_URL:"https://alpha.kite.com/release/dls/windows/current",KITE_INSTALLER_PATH:o.join(i.tmpdir(),"KiteSetup.exe"),SESSION_FILE_PATH:o.join(process.env.LOCALAPPDATA,"Kite","session.json"),set KITE_EXE_PATH(e){m=e},get KITE_EXE_PATH(){if(!m){let e,t;t=process.env.ProgramW6432?o.join(process.env.ProgramW6432,"Kite"):"C:\\Program Files\\Kite";try{const n=String(r.execSync(d)).trim();e="not found"!==n?n:t}catch(n){e=t}m=o.join(e,"kited.exe")}return m},get releaseURL(){return this.RELEASE_URL},get downloadPath(){return this.KITE_INSTALLER_PATH},get installPath(){return this.KITE_EXE_PATH},get enterpriseInstallPath(){return null},get allInstallPaths(){return[this.installPath]},get allEnterpriseInstallPaths(){return[]},get sessionFilePath(){return this.SESSION_FILE_PATH},isAdmin(){try{return r.execSync("net session"),!0}catch(e){return!1}},arch(){return this.cachedArch||(this.cachedArch=i.arch()),"x32"===this.cachedArch?"32bit":"x64"===this.cachedArch?"64bit":this.cachedArch},isOSSupported:()=>!0,isOSVersionSupported(){return parseFloat(i.release())>=6.1&&"64bit"===this.arch()},isKiteSupported(){return this.isOSVersionSupported()},isKiteInstalled(){return new Promise((e,t)=>{a.exists(this.KITE_EXE_PATH,n=>{n?e():t(new l("",{state:p.UNINSTALLED}))})})},isKiteEnterpriseInstalled:()=>Promise.reject(new l("Kite Enterprise is currently not supported on windows",{state:p.UNSUPPORTED})),hasManyKiteInstallation(){return this.allInstallPaths.length>1},hasManyKiteEnterpriseInstallation(){return this.allEnterpriseInstallPaths.length>1},hasBothKiteInstalled(){return Promise.all([this.isKiteInstalled(),this.isKiteEnterpriseInstalled()])},downloadKiteRelease(e){return this.downloadKite(this.releaseURL,e||{})},downloadKite(e,t){return t=t||{},this.streamKiteDownload(e,t.onDownloadProgress).then(()=>c.guardCall(t.onDownload)).then(()=>t.install&&this.installKite(t))},streamKiteDownload(e,t){const n=s.request(e);return n.end(),c.followRedirections(n).then(e=>{if(t){const n=parseInt(e.headers["content-length"],10);let i=0;e.on("data",e=>{i+=e.length,t(i,n,i/n)})}return c.promisifyStream(e.pipe(a.createWriteStream(this.downloadPath))).then(()=>new Promise((e,t)=>{setTimeout(e,100)}))})},installKite(e){e=e||{};var t=Object.create(process.env);return t.KITE_SKIP_ONBOARDING="1",c.guardCall(e.onInstallStart),c.execPromise(`"${this.KITE_INSTALLER_PATH}"`+" --skip-onboarding --plugin-launch --channel=autocomplete-python",{env:t},"kite_install_error","Unable to run Kite installer").then(()=>c.guardCall(e.onCopy)).then(()=>a.unlinkSync(this.KITE_INSTALLER_PATH)).then(()=>c.guardCall(e.onRemove))},isKiteRunning:()=>c.spawnPromise("tasklist","tasklist_error","Unable to run the tasklist command and verify whether kite is running or not").then(e=>{if(e.split("\n").every(e=>-1===e.indexOf("kited.exe")))throw new l("Unable to find kited.exe process in the tasks list",{state:p.NOT_RUNNING})}),runKite(){return this.isKiteRunning().catch(()=>{var e=Object.create(process.env);e.KITE_SKIP_ONBOARDING="1",delete e.ELECTRON_RUN_AS_NODE;try{r.spawn(this.KITE_EXE_PATH,["--plugin-launch","--channel=autocomplete-python"],{detached:!0,env:e})}catch(t){throw new u("kite_exe_error",{message:"Unable to run kite executable",callStack:t.stack,cmd:this.KITE_EXE_PATH,options:{detached:!0,env:e}})}})},isKiteEnterpriseRunning:()=>Promise.reject(new l("Kite Enterprise is currently not supported on windows",{state:p.UNSUPPORTED})),runKiteEnterprise:()=>Promise.reject(new l("Kite Enterprise is currently not supported on windows",{state:p.UNSUPPORTED}))};e.exports=h},function(e,t,n){"use strict";const i=n(2),a=n(8),o=n(3),s=n(4),r=n(10),c=n(14),l=n(19),u=n(41),{STATES:p}=n(15),d={RELEASE_URL:"https://linux.kite.com/dls/linux/current",SESSION_FILE_PATH:o.join(i.homedir(),".kite","session.json"),KITE_DEB_PATH:"/tmp/kite-installer.deb",KITED_PATH:o.join(i.homedir(),".local","share","kite","kited"),FALLBACK_KITED_PATH:"/opt/kite/kited",KITED_PROCESS:/kited/,KITE_CURRENT_LINK:"/opt/kite/current",memKitedInstallPath:null,get releaseURL(){return this.RELEASE_URL},get downloadPath(){return this.KITE_DEB_PATH},get installPath(){return this.memKitedInstallPath||(a.existsSync(this.KITED_PATH)?this.memKitedInstallPath=this.KITED_PATH:this.memKitedInstallPath=this.FALLBACK_KITED_PATH),this.memKitedInstallPath},resetInstallPath(){this.memKitedInstallPath=null},get allInstallPaths(){return[this.installPath]},get enterpriseInstallPath(){return null},get allEnterpriseInstallPaths(){return null},get sessionFilePath(){return this.SESSION_FILE_PATH},hasManyKiteInstallation(){return this.allInstallPaths.length>1},hasManyKiteEnterpriseInstallation:()=>!1,isAdmin(){try{const e=c.whoami();return String(r.execSync("getent group root adm admin sudo")).split("\n").map(e=>e.substring(e.lastIndexOf(":")+1)).reduce((e,t)=>(t.split(",").forEach(t=>e.push(t.trim())),e),[]).includes(e)}catch(e){return!1}},arch:()=>i.arch(),isOSSupported:()=>!0,isOSVersionSupported:()=>!0,isKiteSupported(){return this.isOSSupported()&&this.isOSVersionSupported()},isKiteInstalled(){return new Promise((e,t)=>{a.exists(this.installPath,n=>{n?e():t(new l("",{state:p.UNINSTALLED}))})})},downloadKiteRelease(e){return this.downloadKite(this.releaseURL,e||{})},downloadKite(e,t){return t=t||{},this.streamKiteDownload(e,t.onDownloadProgress).then(()=>c.guardCall(t.onDownload)).then(()=>t.install&&this.installKite(t))},streamKiteDownload(e,t){const n=s.request(e);return n.end(),c.followRedirections(n).then(e=>{if(t){const n=parseInt(e.headers["content-length"],10);let i=0;e.on("data",e=>{i+=e.length,t(i,n,i/n)})}return c.promisifyStream(e.pipe(a.createWriteStream(this.downloadPath))).then(()=>new Promise((e,t)=>{setTimeout(e,100)}))})},installKite(e){return e=e||{},c.guardCall(e.onInstallStart),c.spawnPromise("apt",["install","-f",this.KITE_DEB_PATH],{gid:27},"apt install error","unable to install kite from kite-installer.deb").catch(e=>{throw"EPERM"===e.code||"EPERM"===e.errno?new u("kite-installer.deb EPERM",{message:`Installing ${this.KITE_DEB_PATH} failed due to lacking root permissions.\n          In your command line, try running \`sudo apt install -f ${this.KITE_DEB_PATH}\` to finish installing Kite`,cmd:`apt install -f ${this.KITE_DEB_PATH}`}):e}).then(()=>this.resetInstallPath()).then(()=>c.guardCall(e.onMount)).then(()=>a.unlinkSync(this.KITE_DEB_PATH)).then(()=>c.guardCall(e.onRemove))},isKiteRunning(){return c.spawnPromise("/bin/ps",["-axo","pid,command"],{encoding:"utf-8"},"ps_error","unable to run the ps command and verify that Kite is running").then(e=>{if(!e.split("\n").some(e=>this.KITED_PROCESS.test(e)))throw new l("Kite process could not be found in the processes list",{state:p.NOT_RUNNING})})},runKite(){return this.isKiteRunning().catch(()=>{const e=Object.assign({},process.env);e.SKIP_KITE_ONBOARDING="1",delete e.ELECTRON_RUN_AS_NODE;try{if(!a.existsSync(this.installPath))throw new Error("kited is not installed");r.spawn(this.installPath,["--plugin-launch","--channel=autocomplete-python"],{detached:!0,env:e})}catch(t){throw new u("kited_error",{message:t.message&&"kited is not installed"===t.message||"unable to run kited binary",callStack:t.stack,cmd:this.installPath,options:{detached:!0,env:e}})}})},hasBothKiteInstalled(){return Promise.all([this.isKiteInstalled(),this.isKiteEnterpriseInstalled()])},isKiteEnterpriseInstalled(){return this.notSupported()},isKiteEnterpriseRunning(){return this.notSupported()},runKiteEnterprise(){return this.notSupported()},notSupported:()=>Promise.reject(new l("Your platform is currently not supported",{state:p.UNSUPPORTED}))};e.exports=d},function(e,t,n){"use strict";const i=n(19),{STATES:a}=n(15);e.exports={get releaseURL(){return null},get downloadPath(){return null},get installPath(){return null},get allInstallPaths(){return null},get enterpriseInstallPath(){return null},get allEnterpriseInstallPaths(){return null},get sessionFilePath(){return null},hasManyKiteInstallation:()=>!1,hasManyKiteEnterpriseInstallation:()=>!1,isAdmin:()=>!1,arch:()=>null,isOSSupported:()=>!1,isOSVersionSupported:()=>!1,isKiteSupported:()=>!1,isKiteInstalled(){return this.notSupported()},downloadKite(e){return this.notSupported()},installKite(e){return this.notSupported()},isKiteRunning(){return this.notSupported()},runKite(){return this.notSupported()},hasBothKiteInstalled(){return Promise.all([this.isKiteInstalled(),this.isKiteEnterpriseInstalled()])},isKiteEnterpriseInstalled(){return this.notSupported()},isKiteEnterpriseRunning(){return this.notSupported()},runKiteEnterprise(){return this.notSupported()},notSupported:()=>Promise.reject(new i("Your platform is currently not supported",{state:a.UNSUPPORTED}))}},function(e,t,n){"use strict";e.exports=class{constructor(e){this.store=e}get(e){return(this.content?Promise.resolve(this.content):this.store.get().then(e=>(function(e){return e?JSON.parse(e):e})(e)).then(e=>(this.content=e,e))).then(t=>(function(e,t){if(!e)return t;return e.split(/\./g).reduce((e,t)=>null==e?e:e[t],t)})(e,t))}set(e,t){return this.get().then(n=>this.store.set(function(e){return JSON.stringify(e)}(function(e,t,n){n||(n={});return e.split(/\./g).reduce((e,i,a,o)=>a===o.length-1?(e[i]=t,n):null==e[i]?(e[i]={},e[i]):e[i],n)}(e,t,n))))}}},function(e,t,n){"use strict";e.exports=class{constructor(){}set(e){return this.content=e,Promise.resolve()}get(){return Promise.resolve(this.content)}}},function(e,t){const n=Math.pow(2,20),i=Math.pow(2,21);e.exports={MAX_FILE_SIZE:n,MAX_PAYLOAD_SIZE:i}},function(e,t,n){"use strict";const{LEVELS:i}=n(15),a=n(153),o=n(154);e.exports={LEVELS:i,LEVEL:i.INFO,output:"undefined"!=typeof console?o:a,silly(...e){this.log(i.SILLY,...e)},verbose(...e){this.log(i.VERBOSE,...e)},debug(...e){this.log(i.DEBUG,...e)},info(...e){this.log(i.INFO,...e)},warn(...e){this.log(i.WARNING,...e)},error(...e){this.log(i.ERROR,...e)},log(e,...t){e>=this.LEVEL&&!this.SILENT&&this.output.log(e,...t)},logRequest(){},logResponse(){}}},function(e,t,n){"use strict";e.exports={log(){}}},function(e,t,n){"use strict";const{LEVELS:i}=n(15);e.exports={TRACE_ALL:!1,METHODS:{[i.SILLY]:"debug"in console?"debug":"log",[i.VERBOSE]:"debug"in console?"debug":"log",[i.DEBUG]:"log",[i.INFO]:"info"in console?"info":"log",[i.WARNING]:"warn"in console?"warn":"error",[i.ERROR]:"error"},log(e,...t){console[this.METHODS[e]](...t)}}},function(e,t,n){"use strict";const i=n(2),{CompositeDisposable:a,Emitter:o}=n(0),s=n(11),{STATES:r}=s,{fromSetting:c,all:l}=n(156),u=(n(69),n(158));n(12);e.exports=class{get NOTIFIERS(){return{[r.UNSUPPORTED]:"warnNotSupported",[r.RUNNING]:"warnNotReachable",[r.REACHABLE]:"warnNotAuthenticated"}}get NOTIFICATION_METRICS(){return{[r.UNSUPPORTED]:"not-supported",[r.RUNNING]:"not-reachable",[r.REACHABLE]:"not-authenticated"}}pauseNotifications(){this.paused=!0}resumeNotifications(){this.paused=!1}constructor(e){this.app=e,this.emitter=new o,this.subscriptions=new a,this.lastShown={},this.queue=new u,this.subscriptions.add(e.onDidGetState(({state:e,canNotify:t})=>{t&&this.shouldNotify(e)&&this.notify(e)})),this.subscriptions.add(this.queue.onDidNotify(e=>{const{type:t,metric:n,key:i}=this.extractNotificationMetrics(e);this.lastShown[i]=new Date,this.emit("did-notify",{notification:n,type:t})})),this.subscriptions.add(this.queue.onDidClickNotificationButton(({notification:e,button:t})=>{const{type:n,metric:i}=this.extractNotificationMetrics(e);this.emit("did-click-notification-button",{button:t.metric,notification:i,type:n})})),this.subscriptions.add(this.queue.onDidDismissNotification(e=>{const{type:t,metric:n}=this.extractNotificationMetrics(e);this.emit("did-dismiss-notification",{notification:n,type:t})})),this.subscriptions.add(this.queue.onDidRejectNotification(e=>{const{type:t,metric:n}=this.extractNotificationMetrics(e);this.emit("did-reject-notification",{notification:n,type:t})}))}extractNotificationMetrics(e){const t=e.options;return{type:t.metricType||e.level,metric:"number"==typeof t.metric?this.NOTIFICATION_METRICS[t.metric]:t.metric,key:t.key||t.metric}}onDidNotify(e){return this.emitter.on("did-notify",e)}onDidRejectNotification(e){return this.emitter.on("did-reject-notification",e)}onDidDismissNotification(e){return this.emitter.on("did-dismiss-notification",e)}onDidClickNotificationButton(e){return this.emitter.on("did-click-notification-button",e)}activateForcedNotifications(){this.forceNotification=!0}deactivateForcedNotifications(){this.forceNotification=!1}dispose(){this.queue.abort(),this.subscriptions.dispose(),this.emitter.dispose(),delete this.app,delete this.subscriptions,delete this.emitter}notify(e){this[this.NOTIFIERS[e]]&&this[this.NOTIFIERS[e]](e)}onboardingNotifications(e){this.queue.addInfo("Kite is now integrated with Atom",{dismissable:!0,description:"Kite is an AI-powered programming assistant that shows you the right information at the right time to keep you in the flow.",buttons:[{text:"Learn how to use Kite",onDidClick(e){atom.applicationDelegate.openExternal("http://help.kite.com/category/43-atom-integration"),atom.config.set("kite.showWelcomeNotificationOnStartup",!1),e&&e()}},{text:"Don't show this again",onDidClick(e){atom.config.set("kite.showWelcomeNotificationOnStartup",!1),e&&e()}}]},{condition:l(c("kite.showWelcomeNotificationOnStartup"),()=>!atom.inSpecMode())})}warnNotSupported(e){let t="Sorry, the Kite engine only supports macOS and Windows at the moment.";switch(i.platform()){case"win32":const e=s.arch();t="64bit"!==e?`Sorry, the Kite engine only supports Windows7 and higher with a 64bit architecture.\n          Your version is actually recognised as: ${e}`:"Sorry, the Kite engine only supports Windows7 and higher.";break;case"darwin":t="Sorry, the Kite engine only supports OSX 10.10 (Yosemite) and higher.";break;case"linux":t="Sorry, the Kite engine only supports Ubuntu 18.04 and higher"}this.queue.addError("Kite doesn't support your OS",{description:t,icon:"circle-slash"},{metric:e})}warnNotInstalled(e){this.app.wasInstalledOnce()||this.queue.addWarning("The Kite engine is not installed",{description:"Install Kite to get Python completions, documentation, and examples.",icon:"circle-slash",buttons:[{text:"Install Kite",metric:"install",onDidClick:e=>{e&&e(),this.app&&this.app.install()}}]},{metric:e})}warnNotRunning(e){Promise.all([s.isKiteInstalled().then(()=>!0).catch(()=>!1),s.isKiteEnterpriseInstalled().then(()=>!0).catch(()=>!1)]).then(([t,n])=>{s.hasManyKiteInstallation()||s.hasManyKiteEnterpriseInstallation()?this.queue.addWarning("The Kite engine is not running",{description:"You have multiple versions of Kite installed. Please launch your desired one.",icon:"circle-slash"},{metric:e}):t&&n?this.queue.addWarning("The Kite engine is not running",{description:"Start the Kite background service to get Python completions, documentation, and examples.",icon:"circle-slash",buttons:[{text:"Start Kite",metric:"start",onDidClick:e=>{e&&e(),this.app&&this.app.start().catch(e=>this.warnFailedStart(e))}},{text:"Start Kite Enterprise",metric:"startEnterprise",onDidClick:e=>{e&&e(),this.app&&this.app.startEnterprise().catch(e=>this.warnFailedStartEnterprise(e))}}]},{metric:e}):t?this.queue.addWarning("The Kite engine is not running",{description:"Start the Kite background service to get Python completions, documentation, and examples.",icon:"circle-slash",buttons:[{text:"Start Kite",metric:"start",onDidClick:e=>{e&&e(),this.app&&this.app.start().catch(e=>this.warnFailedStart(e))}}]},{metric:e}):n&&this.queue.addWarning("The Kite engine is not running",{description:"Start the Kite background service to get Python completions, documentation, and examples.",icon:"circle-slash",buttons:[{text:"Start Kite Enterprise",metric:"startEnterprise",onDidClick:e=>{e&&e(),this.app&&this.app.startEnterprise().catch(e=>this.warnFailedStartEnterprise(e))}}]},{metric:e})})}warnFailedStart(e){this.queue.addError("Unable to start Kite engine",{description:JSON.stringify(e),buttons:[{text:"Retry",metric:"retry",onDidClick:e=>{e&&e(),this.app&&this.app.start().catch(e=>this.warnFailedStart(e))}}]},{metric:"launch"})}warnFailedStartEnterprise(e){this.queue.addError("Unable to start Kite engine",{description:JSON.stringify(e),buttons:[{text:"Retry",metric:"retryEnterprise",onDidClick:e=>{e&&e(),this.app&&this.app.startEnterprise().catch(e=>this.warnFailedStartEnterprise(e))}}]},{metric:"launchEnterprise"})}warnNotReachable(e){this.queue.addError("The Kite background service is running but not reachable",{description:"Try killing Kite from the Activity Monitor."},{metric:e})}warnNotAuthenticated(e){navigator.onLine&&!document.querySelector("kite-login")&&this.queue.addWarning("You need to login to the Kite engine",{description:["Kite needs to be authenticated to access","the index of your code stored on the cloud."].join(" "),icon:"circle-slash",buttons:[{text:"Login",metric:"login",onDidClick:e=>{e&&e(),this.app&&this.app.login()}}]},{metric:e})}warnUnauthorized(e){this.queue.addError("Unable to login",{description:JSON.stringify(e),buttons:[{text:"Retry",metric:"retry",onDidClick:e=>{e&&e(),this.app&&this.app.login()}}]},{metric:"unauthorized"})}warnOnboardingFileFailure(){this.queue.addWarning("We were unable to open the tutorial",{description:"We had an internal error setting up our interactive tutorial. Try again later, or email us at feedback@kite.com",buttons:[{text:"OK",onDidClick:e=>e&&e()}]})}notifyReady(e){this.queue.addSuccess("The Kite engine is ready",{description:"We checked that the autocomplete engine is installed, running, responsive, and authenticated."},{metric:e,metricType:"notification"})}shouldNotify(e){return this.forceNotification||this.app&&this.app.kite.getModule("editors").hasActiveSupportedFile()&&!this.lastShown[e]&&!this.paused}emit(...e){this.emitter&&this.emitter.emit(...e)}truncateLeft(e,t){return e.length<=t?e:`…${e.slice(e.length-t)}`}}},function(e,t,n){"use strict";const i=n(157),a=e=>t=>!a.store.getItem(`${e||""}${t.id}`),o=e=>t=>!o.store.getItem(`${e||""}${t.id}`);a.store=localStorage,o.store=new i,e.exports={all:(...e)=>t=>e.every(e=>e(t)),any:(...e)=>t=>e.some(e=>e(t)),fromSetting:(e,t)=>n=>t?atom.config.get(e)===t:atom.config.get(e),once:a,oncePerWindow:o}},function(e,t,n){"use strict";e.exports=class{constructor(){this.content={}}setItem(e,t){return this.content[e]=String(t),t}getItem(e){return this.content[e]}removeItem(e){delete this.content[e]}}},function(e,t,n){"use strict";const{Emitter:i,CompositeDisposable:a}=n(0),o=n(69),s=n(159);e.exports=class{constructor(){this.queue=[],this.promise=Promise.resolve(),this.emitter=new i}onDidNotify(e){return this.emitter.on("did-notify",e)}onDidRejectNotification(e){return this.emitter.on("did-reject-notification",e)}onDidDismissNotification(e){return this.emitter.on("did-dismiss-notification",e)}onDidClickNotificationButton(e){return this.emitter.on("did-click-notification-button",e)}abort(){this.aborted=!0,this.activeNotification&&this.activeNotification.dismiss()}add(e){return this.promise="function"==typeof e?this.promise.then(()=>this.aborted?null:e()).then(e=>(this.activeNotification=e,this.execute(e))).then(()=>{delete this.activeNotification}):this.promise.then(()=>this.aborted?null:(this.activeNotification=e,this.execute(e))).then(()=>{delete this.activeNotification})}execute(e){return e?(this.subscribeToNotification(e),e.execute()):null}subscribeToNotification(e){const t=new a,n=e=>t=>this.emitter.emit(e,t),i=e=>n=>{this.emitter.emit(e,n),t.dispose()};t.add(e.onDidNotify(n("did-notify"))),t.add(e.onDidClickNotificationButton(n("did-click-notification-button"))),t.add(e.onDidDismissNotification(i("did-dismiss-notification"))),t.add(e.onDidRejectNotification(i("did-reject-notification")))}addModal(e,t){return this.add(new s(e,t))}addInfo(e,t,n){return this.add(new o("info",e,t,n))}addSuccess(e,t,n){return this.add(new o("success",e,t,n))}addWarning(e,t,n){return this.add(new o("warning",e,t,n))}addError(e,t,n){return this.add(new o("error",e,t,n))}addFatalError(e,t,n){return this.add(new o("fatalError",e,t,n))}}},function(e,t,n){"use strict";const{Emitter:i}=n(0);e.exports=class{constructor({content:e,buttons:t}={},n={}){this.content=e,this.buttons=t,this.options=n,this.emitter=new i}onDidNotify(e){return this.emitter.on("did-notify",e)}onDidRejectNotification(e){return this.emitter.on("did-reject-notification",e)}onDidDismissNotification(e){return this.emitter.on("did-dismiss-notification",e)}onDidClickNotificationButton(e){return this.emitter.on("did-click-notification-button",e)}dismiss(){this.destroy()}destroy(){this.modal.destroy(),delete this.modal}execute(){return new Promise((e,t)=>{const{condition:n,onDidDestroy:i}=this.options;if(!n||n()){const t=document.createElement("div");if(t.innerHTML=this.content,this.buttons){const e=document.createElement("div");e.className="modal-metrics-row",this.buttons.forEach((t,n)=>{const i=document.createElement("div");i.className="modal-metrics-cell",i.innerHTML=`\n            <button tabindex="${n}"\n                    class="btn btn-${t.className||"default"} btn-block">\n              ${t.text}\n            </button>`,i.querySelector("button").addEventListener("click",()=>{t.onDidClick&&t.onDidClick(this)}),e.appendChild(i)}),t.appendChild(e)}this.modal=atom.workspace.addModalPanel({item:t,autoFocus:!0});const n=this.modal.onDidDestroy(()=>{i&&i(),n.dispose(),this.emitter.dispose(),e()})}else e()})}}},function(e,t,n){"use strict";const i=n(71),{distinctID:a,EDITOR_UUID:o,OS_VERSION:s}=n(12);if(atom.inSpecMode())e.exports=class{dispose(){}};else{window._rollbarConfig={accessToken:"d1aa81c4290d409e847153a29b2872b3",autoInstrument:!1,payload:{environment:"production",distinctID:a(),editor_uuid:o,editor:"atom",atom_version:atom.getVersion(),kite_plugin_version:i.version,os:s}},n(161);class t{constructor(){this.subscription=atom.onDidThrowError(({column:e,line:t,message:n,originalError:i,url:a})=>{/\/kite\/|\/kite-installer\//.test(i.stack)&&!/kite$/.test(atom.project.getPaths()[0]||"")&&window.Rollbar.error(i)})}dispose(){this.subscription&&this.subscription.dispose()}}e.exports=t}},function(e,t,n){!function(e){var t={};function n(i){if(t[i])return t[i].exports;var a=t[i]={i:i,l:!1,exports:{}};return e[i].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(i,a,function(t){return e[t]}.bind(null,a));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=5)}([function(e,t,n){var i=n(9),a={},o=!1;function s(e,t){return t===r(e)}function r(e){var t=typeof e;return"object"!==t?t:e?e instanceof Error?"error":{}.toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase():"null"}function c(e){return s(e,"function")}function l(e){var t,n,i=Function.prototype.toString.call(Object.prototype.hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?"),a=RegExp("^"+i+"$");return n=typeof(t=e),null!=t&&("object"==n||"function"==n)&&a.test(e)}function u(e,t,n){var i,a,o,r=s(e,"object"),c=s(e,"array"),l=[];if(r&&-1!==n.indexOf(e))return e;if(n.push(e),r)for(i in e)Object.prototype.hasOwnProperty.call(e,i)&&l.push(i);else if(c)for(o=0;o<e.length;++o)l.push(o);var u=r?{}:[],p=!0;for(o=0;o<l.length;++o)a=e[i=l[o]],u[i]=t(i,a,n),p=p&&u[i]===e[i];return 0==l.length||p?e:u}function p(){return"********"}function d(){var e=b();return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var n=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"===t?n:7&n|8).toString(16)})}o||(o=!0,s(JSON,"undefined")||(l(JSON.stringify)&&(a.stringify=JSON.stringify),l(JSON.parse)&&(a.parse=JSON.parse)),c(a.stringify)&&c(a.parse)||n(10)(a));var m={strictMode:!1,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};function h(e,t){var n,i;try{n=a.stringify(e)}catch(a){if(t&&c(t))try{n=t(e)}catch(e){i=e}else i=a}return{error:i,value:n}}function f(e,t){return function(n,i){try{t(n,i)}catch(t){e.error(t)}}}var g=["log","network","dom","navigation","error","manual"],v=["critical","error","warning","info","debug"];function x(e,t){for(var n=0;n<e.length;++n)if(e[n]===t)return!0;return!1}function b(){return Date.now?+Date.now():+new Date}e.exports={addParamsAndAccessTokenToPath:function(e,t,n){(n=n||{}).access_token=e;var i,a=[];for(i in n)Object.prototype.hasOwnProperty.call(n,i)&&a.push([i,n[i]].join("="));var o="?"+a.sort().join("&");(t=t||{}).path=t.path||"";var s,r=t.path.indexOf("?"),c=t.path.indexOf("#");-1!==r&&(-1===c||c>r)?(s=t.path,t.path=s.substring(0,r)+o+"&"+s.substring(r+1)):-1!==c?(s=t.path,t.path=s.substring(0,c)+o+s.substring(c)):t.path=t.path+o},createItem:function(e,t,n,a,o){for(var s,c,l,u,p,m,h=[],g=0,v=e.length;g<v;++g){var x=r(m=e[g]);switch(x){case"undefined":break;case"string":s?h.push(m):s=m;break;case"function":u=f(t,m);break;case"date":h.push(m);break;case"error":case"domexception":case"exception":c?h.push(m):c=m;break;case"object":case"array":if(m instanceof Error||"undefined"!=typeof DOMException&&m instanceof DOMException){c?h.push(m):c=m;break}if(a&&"object"===x&&!p){for(var y=0,w=a.length;y<w;++y)if(void 0!==m[a[y]]){p=m;break}if(p)break}l?h.push(m):l=m;break;default:if(m instanceof Error||"undefined"!=typeof DOMException&&m instanceof DOMException){c?h.push(m):c=m;break}h.push(m)}}h.length>0&&((l=i(l)).extraArgs=h);var k={message:s,err:c,custom:l,timestamp:b(),callback:u,uuid:d()};return l&&void 0!==l.level&&(k.level=l.level,delete l.level),a&&p&&(k.request=p),o&&(k.lambdaContext=o),k._originalArgs=e,k},createTelemetryEvent:function(e){for(var t,n,i,a,o=0,s=e.length;o<s;++o)switch(r(a=e[o])){case"string":x(g,a)?t=a:x(v,a)&&(i=a);break;case"object":n=a}return{type:t||"manual",metadata:n||{},level:i}},filterIp:function(e,t){if(e&&e.user_ip&&!0!==t){var n=e.user_ip;if(t)try{var i;if(-1!==n.indexOf("."))(i=n.split(".")).pop(),i.push("0"),n=i.join(".");else if(-1!==n.indexOf(":")){if((i=n.split(":")).length>2){var a=i.slice(0,3),o=a[2].indexOf("/");-1!==o&&(a[2]=a[2].substring(0,o)),n=a.concat("0000:0000:0000:0000:0000").join(":")}}else n=null}catch(e){n=null}else n=null;e.user_ip=n}},formatArgsAsString:function(e){var t,n,i,a=[];for(t=0,n=e.length;t<n;++t){switch(r(i=e[t])){case"object":(i=(i=h(i)).error||i.value).length>500&&(i=i.substr(0,497)+"...");break;case"null":i="null";break;case"undefined":i="undefined";break;case"symbol":i=i.toString()}a.push(i)}return a.join(" ")},formatUrl:function(e,t){if(!(t=t||e.protocol)&&e.port&&(80===e.port?t="http:":443===e.port&&(t="https:")),t=t||"https:",!e.hostname)return null;var n=t+"//"+e.hostname;return e.port&&(n=n+":"+e.port),e.path&&(n+=e.path),n},get:function(e,t){if(e){var n=t.split("."),i=e;try{for(var a=0,o=n.length;a<o;++a)i=i[n[a]]}catch(e){i=void 0}return i}},handleOptions:function(e,t,n){var a=i(e,t,n);return!t||t.overwriteScrubFields?a:(t.scrubFields&&(a.scrubFields=(e.scrubFields||[]).concat(t.scrubFields)),a)},isError:function(e){return s(e,"error")||s(e,"exception")},isFunction:c,isIterable:function(e){var t=r(e);return"object"===t||"array"===t},isNativeFunction:l,isType:s,jsonParse:function(e){var t,n;try{t=a.parse(e)}catch(e){n=e}return{error:n,value:t}},LEVELS:{debug:0,info:1,warning:2,error:3,critical:4},makeUnhandledStackInfo:function(e,t,n,i,a,o,s,r){var c={url:t||"",line:n,column:i};c.func=r.guessFunctionName(c.url,c.line),c.context=r.gatherContext(c.url,c.line);var l=document&&document.location&&document.location.href,u=window&&window.navigator&&window.navigator.userAgent;return{mode:o,message:a?String(a):e||s,url:l,stack:[c],useragent:u}},merge:i,now:b,redact:p,sanitizeUrl:function(e){var t=function(e){if(s(e,"string")){for(var t=m,n=t.parser[t.strictMode?"strict":"loose"].exec(e),i={},a=0,o=t.key.length;a<o;++a)i[t.key[a]]=n[a]||"";return i[t.q.name]={},i[t.key[12]].replace(t.q.parser,function(e,n,a){n&&(i[t.q.name][n]=a)}),i}}(e);return t?(""===t.anchor&&(t.source=t.source.replace("#","")),e=t.source.replace("?"+t.query,"")):"(unknown)"},scrub:function(e,t){var n=function(e){for(var t,n=[],i=0;i<e.length;++i)t="^\\[?(%5[bB])?"+e[i]+"\\[?(%5[bB])?\\]?(%5[dD])?$",n.push(new RegExp(t,"i"));return n}(t=t||[]),i=function(e){for(var t,n=[],i=0;i<e.length;++i)t="\\[?(%5[bB])?"+e[i]+"\\[?(%5[bB])?\\]?(%5[dD])?",n.push(new RegExp("("+t+"=)([^&\\n]+)","igm"));return n}(t);function a(e,t){return t+"********"}return u(e,function e(t,o,r){var c=function(e,t){var i;for(i=0;i<n.length;++i)if(n[i].test(e)){t="********";break}return t}(t,o);return c===o?s(o,"object")||s(o,"array")?u(o,e,r):function(e){var t;if(s(e,"string"))for(t=0;t<i.length;++t)e=e.replace(i[t],a);return e}(c):c},[])},set:function(e,t,n){if(e){var i=t.split("."),a=i.length;if(!(a<1))if(1!==a)try{for(var o=e[i[0]]||{},s=o,r=1;r<a-1;++r)o[i[r]]=o[i[r]]||{},o=o[i[r]];o[i[a-1]]=n,e[i[0]]=s}catch(e){return}else e[i[0]]=n}},stringify:h,traverse:u,typeName:r,uuid4:d}},function(e,t,n){n(16);var i=n(17),a=n(0);e.exports={error:function(){var e=Array.prototype.slice.call(arguments,0);e.unshift("Rollbar:"),i.ieVersion()<=8?console.error(a.formatArgsAsString(e)):console.error.apply(console,e)},info:function(){var e=Array.prototype.slice.call(arguments,0);e.unshift("Rollbar:"),i.ieVersion()<=8?console.info(a.formatArgsAsString(e)):console.info.apply(console,e)},log:function(){var e=Array.prototype.slice.call(arguments,0);e.unshift("Rollbar:"),i.ieVersion()<=8?console.log(a.formatArgsAsString(e)):console.log.apply(console,e)}}},function(e,t,n){var i=n(0);function a(e,t){return[e,i.stringify(e,t)]}function o(e,t){var n=e.length;return n>2*t?e.slice(0,t).concat(e.slice(n-t)):e}function s(e,t,n){n=void 0===n?30:n;var a,s=e.data.body;if(s.trace_chain)for(var r=s.trace_chain,c=0;c<r.length;c++)a=o(a=r[c].frames,n),r[c].frames=a;else s.trace&&(a=o(a=s.trace.frames,n),s.trace.frames=a);return[e,i.stringify(e,t)]}function r(e,t){return t&&t.length>e?t.slice(0,e-3).concat("..."):t}function c(e,t,n){return[t=i.traverse(t,function t(n,a,o){switch(i.typeName(a)){case"string":return r(e,a);case"object":case"array":return i.traverse(a,t,o);default:return a}},[]),i.stringify(t,n)]}function l(e){return e.exception&&(delete e.exception.description,e.exception.message=r(255,e.exception.message)),e.frames=o(e.frames,1),e}function u(e,t){var n=e.data.body;if(n.trace_chain)for(var a=n.trace_chain,o=0;o<a.length;o++)a[o]=l(a[o]);else n.trace&&(n.trace=l(n.trace));return[e,i.stringify(e,t)]}function p(e,t){return e.length>t}e.exports={truncate:function(e,t,n){n=void 0===n?524288:n;for(var i,o,r,l=[a,s,c.bind(null,1024),c.bind(null,512),c.bind(null,256),u];i=l.shift();)if(e=(o=i(e,t))[0],(r=o[1]).error||!p(r.value,n))return r;return r},raw:a,truncateFrames:s,truncateStrings:c,maybeTruncateValue:r}},function(e,t){e.exports={parse:function(e){var t,n,i={protocol:null,auth:null,host:null,path:null,hash:null,href:e,hostname:null,port:null,pathname:null,search:null,query:null};if(-1!==(t=e.indexOf("//"))?(i.protocol=e.substring(0,t),n=t+2):n=0,-1!==(t=e.indexOf("@",n))&&(i.auth=e.substring(n,t),n=t+1),-1===(t=e.indexOf("/",n))){if(-1===(t=e.indexOf("?",n)))return-1===(t=e.indexOf("#",n))?i.host=e.substring(n):(i.host=e.substring(n,t),i.hash=e.substring(t)),i.hostname=i.host.split(":")[0],i.port=i.host.split(":")[1],i.port&&(i.port=parseInt(i.port,10)),i;i.host=e.substring(n,t),i.hostname=i.host.split(":")[0],i.port=i.host.split(":")[1],i.port&&(i.port=parseInt(i.port,10)),n=t}else i.host=e.substring(n,t),i.hostname=i.host.split(":")[0],i.port=i.host.split(":")[1],i.port&&(i.port=parseInt(i.port,10)),n=t;if(-1===(t=e.indexOf("#",n))?i.path=e.substring(n):(i.path=e.substring(n,t),i.hash=e.substring(t)),i.path){var a=i.path.split("?");i.pathname=a[0],i.query=a[1],i.search=i.query?"?"+i.query:null}return i}}},function(e,t,n){var i=n(21),a="?",o=new RegExp("^(([a-zA-Z0-9-_$ ]*): *)?(Uncaught )?([a-zA-Z0-9-_$ ]*): ");function s(){return null}function r(e){var t={};return t._stackFrame=e,t.url=e.fileName,t.line=e.lineNumber,t.func=e.functionName,t.column=e.columnNumber,t.args=e.args,t.context=null,t}function c(e){var t=e.constructor&&e.constructor.name;return(!t||!t.length||t.length<3)&&(t=e.name),{stack:function(){var t,n=[];if(e.stack)t=e;else try{throw e}catch(e){t=e}try{n=i.parse(t)}catch(e){n=[]}for(var a=[],o=0;o<n.length;o++)a.push(new r(n[o]));return a}(),message:e.message,name:t,rawStack:e.stack,rawException:e}}e.exports={guessFunctionName:function(){return a},guessErrorClass:function(e){if(!e||!e.match)return["Unknown error. There was no error message to display.",""];var t=e.match(o),n="(unknown)";return t&&(n=t[t.length-1],e=(e=e.replace((t[t.length-2]||"")+n+":","")).replace(/(^[\s]+|[\s]+$)/g,"")),[n,e]},gatherContext:s,parse:function(e){return new c(e)},Stack:c,Frame:r}},function(e,t,n){var i=n(6),a="undefined"!=typeof window&&window._rollbarConfig,o=a&&a.globalAlias||"Rollbar",s="undefined"!=typeof window&&window[o]&&"function"==typeof window[o].shimId&&void 0!==window[o].shimId();if("undefined"==typeof window||window._rollbarStartTime||(window._rollbarStartTime=(new Date).getTime()),!s&&a){var r=new i(a);window[o]=r}else"undefined"!=typeof window?(window.rollbar=i,window._rollbarDidLoad=!0):"undefined"!=typeof self&&(self.rollbar=i,self._rollbarDidLoad=!0);e.exports=i},function(e,t,n){var i=n(7),a=n(0),o=n(14),s=n(1),r=n(18),c=n(19),l=n(3),u=n(20),p=n(23),d=n(24),m=n(25),h=n(4),f=n(26);function g(e,t){this.options=a.handleOptions(w,e);var n=new o(this.options,c,l);this.client=t||new i(this.options,n,s,"browser");var r=y(),h="undefined"!=typeof document&&document;!function(e,t){e.addTransform(u.handleItemWithError).addTransform(u.ensureItemHasSomethingToSay).addTransform(u.addBaseInfo).addTransform(u.addRequestInfo(t)).addTransform(u.addClientInfo(t)).addTransform(u.addPluginInfo(t)).addTransform(u.addBody).addTransform(p.addMessageWithError).addTransform(p.addTelemetryData).addTransform(p.addConfigToPayload).addTransform(u.scrubPayload).addTransform(p.userTransform(s)).addTransform(p.itemToPayload)}(this.client.notifier,r),this.client.queue.addPredicate(m.checkLevel).addPredicate(d.checkIgnore).addPredicate(m.userCheckIgnore(s)).addPredicate(m.urlIsNotBlacklisted(s)).addPredicate(m.urlIsWhitelisted(s)).addPredicate(m.messageIsIgnored(s)),this.setupUnhandledCapture(),this.instrumenter=new f(this.options,this.client.telemeter,this,r,h),this.instrumenter.instrument()}var v=null;function x(e){var t="Rollbar is not initialized";s.error(t),e&&e(new Error(t))}function b(e){for(var t=0,n=e.length;t<n;++t)if(a.isFunction(e[t]))return e[t]}function y(){return"undefined"!=typeof window&&window||"undefined"!=typeof self&&self}g.init=function(e,t){return v?v.global(e).configure(e):v=new g(e,t)},g.prototype.global=function(e){return this.client.global(e),this},g.global=function(e){if(v)return v.global(e);x()},g.prototype.configure=function(e,t){var n=this.options,i={};return t&&(i={payload:t}),this.options=a.handleOptions(n,e,i),this.client.configure(this.options,t),this.instrumenter.configure(this.options),this.setupUnhandledCapture(),this},g.configure=function(e,t){if(v)return v.configure(e,t);x()},g.prototype.lastError=function(){return this.client.lastError},g.lastError=function(){if(v)return v.lastError();x()},g.prototype.log=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.log(e),{uuid:t}},g.log=function(){if(v)return v.log.apply(v,arguments);x(b(arguments))},g.prototype.debug=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.debug(e),{uuid:t}},g.debug=function(){if(v)return v.debug.apply(v,arguments);x(b(arguments))},g.prototype.info=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.info(e),{uuid:t}},g.info=function(){if(v)return v.info.apply(v,arguments);x(b(arguments))},g.prototype.warn=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.warn(e),{uuid:t}},g.warn=function(){if(v)return v.warn.apply(v,arguments);x(b(arguments))},g.prototype.warning=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.warning(e),{uuid:t}},g.warning=function(){if(v)return v.warning.apply(v,arguments);x(b(arguments))},g.prototype.error=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.error(e),{uuid:t}},g.error=function(){if(v)return v.error.apply(v,arguments);x(b(arguments))},g.prototype.critical=function(){var e=this._createItem(arguments),t=e.uuid;return this.client.critical(e),{uuid:t}},g.critical=function(){if(v)return v.critical.apply(v,arguments);x(b(arguments))},g.prototype.buildJsonPayload=function(e){return this.client.buildJsonPayload(e)},g.buildJsonPayload=function(){if(v)return v.buildJsonPayload.apply(v,arguments);x()},g.prototype.sendJsonPayload=function(e){return this.client.sendJsonPayload(e)},g.sendJsonPayload=function(){if(v)return v.sendJsonPayload.apply(v,arguments);x()},g.prototype.setupUnhandledCapture=function(){var e=y();this.unhandledExceptionsInitialized||(this.options.captureUncaught||this.options.handleUncaughtExceptions)&&(r.captureUncaughtExceptions(e,this),r.wrapGlobals(e,this),this.unhandledExceptionsInitialized=!0),this.unhandledRejectionsInitialized||(this.options.captureUnhandledRejections||this.options.handleUnhandledRejections)&&(r.captureUnhandledRejections(e,this),this.unhandledRejectionsInitialized=!0)},g.prototype.handleUncaughtException=function(e,t,n,i,o,s){if(this.options.captureUncaught||this.options.handleUncaughtExceptions){var r,c=a.makeUnhandledStackInfo(e,t,n,i,o,"onerror","uncaught exception",h);a.isError(o)?(r=this._createItem([e,o,s]))._unhandledStackInfo=c:a.isError(t)?(r=this._createItem([e,t,s]))._unhandledStackInfo=c:(r=this._createItem([e,s])).stackInfo=c,r.level=this.options.uncaughtErrorLevel,r._isUncaught=!0,this.client.log(r)}},g.prototype.handleUnhandledRejection=function(e,t){if(this.options.captureUnhandledRejections||this.options.handleUnhandledRejections){var n="unhandled rejection was null or undefined!";if(e)if(e.message)n=e.message;else{var i=a.stringify(e);i.value&&(n=i.value)}var o,s=e&&e._rollbarContext||t&&t._rollbarContext;a.isError(e)?o=this._createItem([n,e,s]):(o=this._createItem([n,e,s])).stackInfo=a.makeUnhandledStackInfo(n,"",0,0,null,"unhandledrejection","",h),o.level=this.options.uncaughtErrorLevel,o._isUncaught=!0,o._originalArgs=o._originalArgs||[],o._originalArgs.push(t),this.client.log(o)}},g.prototype.wrap=function(e,t,n){try{var i;if(i=a.isFunction(t)?t:function(){return t||{}},!a.isFunction(e))return e;if(e._isWrap)return e;if(!e._rollbar_wrapped&&(e._rollbar_wrapped=function(){n&&a.isFunction(n)&&n.apply(this,arguments);try{return e.apply(this,arguments)}catch(n){var t=n;throw t&&window._rollbarWrappedError!==t&&(a.isType(t,"string")&&(t=new String(t)),t._rollbarContext=i()||{},t._rollbarContext._wrappedSource=e.toString(),window._rollbarWrappedError=t),t}},e._rollbar_wrapped._isWrap=!0,e.hasOwnProperty))for(var o in e)e.hasOwnProperty(o)&&"_rollbar_wrapped"!==o&&(e._rollbar_wrapped[o]=e[o]);return e._rollbar_wrapped}catch(t){return e}},g.wrap=function(e,t){if(v)return v.wrap(e,t);x()},g.prototype.captureEvent=function(){var e=a.createTelemetryEvent(arguments);return this.client.captureEvent(e.type,e.metadata,e.level)},g.captureEvent=function(){if(v)return v.captureEvent.apply(v,arguments);x()},g.prototype.captureDomContentLoaded=function(e,t){return t||(t=new Date),this.client.captureDomContentLoaded(t)},g.prototype.captureLoad=function(e,t){return t||(t=new Date),this.client.captureLoad(t)},g.prototype._createItem=function(e){return a.createItem(e,s,this)};var w={version:"2.7.0",scrubFields:["pw","pass","passwd","password","secret","confirm_password","confirmPassword","password_confirmation","passwordConfirmation","access_token","accessToken","secret_key","secretKey","secretToken","cc-number","card number","cardnumber","cardnum","ccnum","ccnumber","cc num","creditcardnumber","credit card number","newcreditcardnumber","new credit card","creditcardno","credit card no","card#","card #","cc-csc","cvc2","cvv2","ccv2","security code","card verification","name on credit card","name on card","nameoncard","cardholder","card holder","name des karteninhabers","card type","cardtype","cc type","cctype","payment type","expiration date","expirationdate","expdate","cc-exp"],logLevel:"debug",reportLevel:"debug",uncaughtErrorLevel:"error",endpoint:"api.rollbar.com/api/1/item/",verbose:!1,enabled:!0,sendConfig:!1,includeItemsInTelemetry:!0,captureIp:!0};e.exports=g},function(e,t,n){var i=n(8),a=n(11),o=n(12),s=n(13),r=n(0);function c(e,t,n,i){this.options=r.merge(e),this.logger=n,c.rateLimiter.configureGlobal(this.options),c.rateLimiter.setPlatformOptions(i,this.options),this.api=t,this.queue=new a(c.rateLimiter,t,n,this.options),this.notifier=new o(this.queue,this.options),this.telemeter=new s(this.options),this.lastError=null,this.lastErrorHash="none"}c.rateLimiter=new i({maxItems:0,itemsPerMinute:60}),c.prototype.global=function(e){return c.rateLimiter.configureGlobal(e),this},c.prototype.configure=function(e,t){var n=this.options,i={};return t&&(i={payload:t}),this.options=r.merge(n,e,i),this.notifier&&this.notifier.configure(this.options),this.telemeter&&this.telemeter.configure(this.options),this.global(this.options),this},c.prototype.log=function(e){var t=this._defaultLogLevel();return this._log(t,e)},c.prototype.debug=function(e){this._log("debug",e)},c.prototype.info=function(e){this._log("info",e)},c.prototype.warn=function(e){this._log("warning",e)},c.prototype.warning=function(e){this._log("warning",e)},c.prototype.error=function(e){this._log("error",e)},c.prototype.critical=function(e){this._log("critical",e)},c.prototype.wait=function(e){this.queue.wait(e)},c.prototype.captureEvent=function(e,t,n){return this.telemeter.captureEvent(e,t,n)},c.prototype.captureDomContentLoaded=function(e){return this.telemeter.captureDomContentLoaded(e)},c.prototype.captureLoad=function(e){return this.telemeter.captureLoad(e)},c.prototype.buildJsonPayload=function(e){return this.api.buildJsonPayload(e)},c.prototype.sendJsonPayload=function(e){this.api.postJsonPayload(e)},c.prototype._log=function(e,t){var n;if(t.callback&&(n=t.callback,delete t.callback),this._sameAsLastError(t)){if(n){var i=new Error("ignored identical item");i.item=t,n(i)}}else try{t.level=t.level||e,this.telemeter._captureRollbarItem(t),t.telemetryEvents=this.telemeter.copyEvents(),this.notifier.log(t,n)}catch(e){this.logger.error(e)}},c.prototype._defaultLogLevel=function(){return this.options.logLevel||"debug"},c.prototype._sameAsLastError=function(e){if(!e._isUncaught)return!1;var t=function(e){var t=e.message||"",n=(e.err||{}).stack||String(e.err);return t+"::"+n}(e);return this.lastErrorHash===t||(this.lastError=e.err,this.lastErrorHash=t,!1)},e.exports=c},function(e,t,n){var i=n(0);function a(e){this.startTime=i.now(),this.counter=0,this.perMinCounter=0,this.platform=null,this.platformOptions={},this.configureGlobal(e)}function o(e,t,n){return!e.ignoreRateLimit&&t>=1&&n>t}function s(e,t,n,i,a,o,s){var r=null;return n&&(n=new Error(n)),n||i||(r=function(e,t,n,i,a){var o,s=t.environment||t.payload&&t.payload.environment;o=a?"item per minute limit reached, ignoring errors until timeout":"maxItems has been hit, ignoring errors until reset.";var r={body:{message:{body:o,extra:{maxItems:n,itemsPerMinute:i}}},language:"javascript",environment:s,notifier:{version:t.notifier&&t.notifier.version||t.version}};"browser"===e?(r.platform="browser",r.framework="browser-js",r.notifier.name="rollbar-browser-js"):"server"===e?(r.framework=t.framework||"node-js",r.notifier.name=t.notifier.name):"react-native"===e&&(r.framework=t.framework||"react-native",r.notifier.name=t.notifier.name);return r}(e,t,a,o,s)),{error:n,shouldSend:i,payload:r}}a.globalSettings={startTime:i.now(),maxItems:void 0,itemsPerMinute:void 0},a.prototype.configureGlobal=function(e){void 0!==e.startTime&&(a.globalSettings.startTime=e.startTime),void 0!==e.maxItems&&(a.globalSettings.maxItems=e.maxItems),void 0!==e.itemsPerMinute&&(a.globalSettings.itemsPerMinute=e.itemsPerMinute)},a.prototype.shouldSend=function(e,t){var n=(t=t||i.now())-this.startTime;(n<0||n>=6e4)&&(this.startTime=t,this.perMinCounter=0);var r=a.globalSettings.maxItems,c=a.globalSettings.itemsPerMinute;if(o(e,r,this.counter))return s(this.platform,this.platformOptions,r+" max items reached",!1);if(o(e,c,this.perMinCounter))return s(this.platform,this.platformOptions,c+" items per minute reached",!1);this.counter++,this.perMinCounter++;var l=!o(e,r,this.counter),u=l;return l=l&&!o(e,c,this.perMinCounter),s(this.platform,this.platformOptions,null,l,r,c,u)},a.prototype.setPlatformOptions=function(e,t){this.platform=e,this.platformOptions=t},e.exports=a},function(e,t,n){"use strict";var i=Object.prototype.hasOwnProperty,a=Object.prototype.toString,o=function(e){if(!e||"[object Object]"!==a.call(e))return!1;var t,n=i.call(e,"constructor"),o=e.constructor&&e.constructor.prototype&&i.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!n&&!o)return!1;for(t in e);return void 0===t||i.call(e,t)};e.exports=function e(){var t,n,i,a,s,r={},c=null,l=arguments.length;for(t=0;t<l;t++)if(null!=(c=arguments[t]))for(s in c)n=r[s],r!==(i=c[s])&&(i&&o(i)?(a=n&&o(n)?n:{},r[s]=e(a,i)):void 0!==i&&(r[s]=i));return r}},function(e,t){e.exports=function(e){var t,n,i,a,o=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;function s(e){return e<10?"0"+e:e}function r(){return this.valueOf()}function c(e){return o.lastIndex=0,o.test(e)?'"'+e.replace(o,function(e){var t=i[e];return"string"==typeof t?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+s(this.getUTCMonth()+1)+"-"+s(this.getUTCDate())+"T"+s(this.getUTCHours())+":"+s(this.getUTCMinutes())+":"+s(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=r,Number.prototype.toJSON=r,String.prototype.toJSON=r),"function"!=typeof e.stringify&&(i={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},e.stringify=function(e,i,o){var s;if(t="",n="","number"==typeof o)for(s=0;s<o;s+=1)n+=" ";else"string"==typeof o&&(n=o);if(a=i,i&&"function"!=typeof i&&("object"!=typeof i||"number"!=typeof i.length))throw new Error("JSON.stringify");return function e(i,o){var s,r,l,u,p,d=t,m=o[i];switch(m&&"object"==typeof m&&"function"==typeof m.toJSON&&(m=m.toJSON(i)),"function"==typeof a&&(m=a.call(o,i,m)),typeof m){case"string":return c(m);case"number":return isFinite(m)?String(m):"null";case"boolean":case"null":return String(m);case"object":if(!m)return"null";if(t+=n,p=[],"[object Array]"===Object.prototype.toString.apply(m)){for(u=m.length,s=0;s<u;s+=1)p[s]=e(s,m)||"null";return l=0===p.length?"[]":t?"[\n"+t+p.join(",\n"+t)+"\n"+d+"]":"["+p.join(",")+"]",t=d,l}if(a&&"object"==typeof a)for(u=a.length,s=0;s<u;s+=1)"string"==typeof a[s]&&(l=e(r=a[s],m))&&p.push(c(r)+(t?": ":":")+l);else for(r in m)Object.prototype.hasOwnProperty.call(m,r)&&(l=e(r,m))&&p.push(c(r)+(t?": ":":")+l);return l=0===p.length?"{}":t?"{\n"+t+p.join(",\n"+t)+"\n"+d+"}":"{"+p.join(",")+"}",t=d,l}}("",{"":e})}),"function"!=typeof e.parse&&(e.parse=(h={"\\":"\\",'"':'"',"/":"/",t:"\t",n:"\n",r:"\r",f:"\f",b:"\b"},f={go:function(){l="ok"},firstokey:function(){d=m,l="colon"},okey:function(){d=m,l="colon"},ovalue:function(){l="ocomma"},firstavalue:function(){l="acomma"},avalue:function(){l="acomma"}},g={go:function(){l="ok"},ovalue:function(){l="ocomma"},firstavalue:function(){l="acomma"},avalue:function(){l="acomma"}},v={"{":{go:function(){u.push({state:"ok"}),p={},l="firstokey"},ovalue:function(){u.push({container:p,state:"ocomma",key:d}),p={},l="firstokey"},firstavalue:function(){u.push({container:p,state:"acomma"}),p={},l="firstokey"},avalue:function(){u.push({container:p,state:"acomma"}),p={},l="firstokey"}},"}":{firstokey:function(){var e=u.pop();m=p,p=e.container,d=e.key,l=e.state},ocomma:function(){var e=u.pop();p[d]=m,m=p,p=e.container,d=e.key,l=e.state}},"[":{go:function(){u.push({state:"ok"}),p=[],l="firstavalue"},ovalue:function(){u.push({container:p,state:"ocomma",key:d}),p=[],l="firstavalue"},firstavalue:function(){u.push({container:p,state:"acomma"}),p=[],l="firstavalue"},avalue:function(){u.push({container:p,state:"acomma"}),p=[],l="firstavalue"}},"]":{firstavalue:function(){var e=u.pop();m=p,p=e.container,d=e.key,l=e.state},acomma:function(){var e=u.pop();p.push(m),m=p,p=e.container,d=e.key,l=e.state}},":":{colon:function(){if(Object.hasOwnProperty.call(p,d))throw new SyntaxError("Duplicate key '"+d+'"');l="ovalue"}},",":{ocomma:function(){p[d]=m,l="okey"},acomma:function(){p.push(m),l="avalue"}},true:{go:function(){m=!0,l="ok"},ovalue:function(){m=!0,l="ocomma"},firstavalue:function(){m=!0,l="acomma"},avalue:function(){m=!0,l="acomma"}},false:{go:function(){m=!1,l="ok"},ovalue:function(){m=!1,l="ocomma"},firstavalue:function(){m=!1,l="acomma"},avalue:function(){m=!1,l="acomma"}},null:{go:function(){m=null,l="ok"},ovalue:function(){m=null,l="ocomma"},firstavalue:function(){m=null,l="acomma"},avalue:function(){m=null,l="acomma"}}},function(e,t){var n,i,a=/^[\u0020\t\n\r]*(?:([,:\[\]{}]|true|false|null)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|"((?:[^\r\n\t\\\"]|\\(?:["\\\/trnfb]|u[0-9a-fA-F]{4}))*)")/;l="go",u=[];try{for(;n=a.exec(e);)n[1]?v[n[1]][l]():n[2]?(m=+n[2],g[l]()):(i=n[3],m=i.replace(/\\(?:u(.{4})|([^u]))/g,function(e,t,n){return t?String.fromCharCode(parseInt(t,16)):h[n]}),f[l]()),e=e.slice(n[0].length)}catch(e){l=e}if("ok"!==l||/[^\u0020\t\n\r]/.test(e))throw l instanceof SyntaxError?l:new SyntaxError("JSON");return"function"==typeof t?function e(n,i){var a,o,s=n[i];if(s&&"object"==typeof s)for(a in m)Object.prototype.hasOwnProperty.call(s,a)&&(void 0!==(o=e(s,a))?s[a]=o:delete s[a]);return t.call(n,i,s)}({"":m},""):m}));var l,u,p,d,m,h,f,g,v}},function(e,t,n){var i=n(0);function a(e,t,n,i){this.rateLimiter=e,this.api=t,this.logger=n,this.options=i,this.predicates=[],this.pendingItems=[],this.pendingRequests=[],this.retryQueue=[],this.retryHandle=null,this.waitCallback=null,this.waitIntervalID=null}a.prototype.configure=function(e){this.api&&this.api.configure(e);var t=this.options;return this.options=i.merge(t,e),this},a.prototype.addPredicate=function(e){return i.isFunction(e)&&this.predicates.push(e),this},a.prototype.addPendingItem=function(e){this.pendingItems.push(e)},a.prototype.removePendingItem=function(e){var t=this.pendingItems.indexOf(e);-1!==t&&this.pendingItems.splice(t,1)},a.prototype.addItem=function(e,t,n,a){t&&i.isFunction(t)||(t=function(){});var o=this._applyPredicates(e);if(o.stop)return this.removePendingItem(a),void t(o.err);this._maybeLog(e,n),this.removePendingItem(a),this.pendingRequests.push(e);try{this._makeApiRequest(e,function(n,i){this._dequeuePendingRequest(e),t(n,i)}.bind(this))}catch(n){this._dequeuePendingRequest(e),t(n)}},a.prototype.wait=function(e){i.isFunction(e)&&(this.waitCallback=e,this._maybeCallWait()||(this.waitIntervalID&&(this.waitIntervalID=clearInterval(this.waitIntervalID)),this.waitIntervalID=setInterval(function(){this._maybeCallWait()}.bind(this),500)))},a.prototype._applyPredicates=function(e){for(var t=null,n=0,i=this.predicates.length;n<i;n++)if(!(t=this.predicates[n](e,this.options))||void 0!==t.err)return{stop:!0,err:t.err};return{stop:!1,err:null}},a.prototype._makeApiRequest=function(e,t){var n=this.rateLimiter.shouldSend(e);n.shouldSend?this.api.postItem(e,function(n,i){n?this._maybeRetry(n,e,t):t(n,i)}.bind(this)):n.error?t(n.error):this.api.postItem(n.payload,t)};var o=["ECONNRESET","ENOTFOUND","ESOCKETTIMEDOUT","ETIMEDOUT","ECONNREFUSED","EHOSTUNREACH","EPIPE","EAI_AGAIN"];a.prototype._maybeRetry=function(e,t,n){var i=!1;if(this.options.retryInterval)for(var a=0,s=o.length;a<s;a++)if(e.code===o[a]){i=!0;break}i?this._retryApiRequest(t,n):n(e)},a.prototype._retryApiRequest=function(e,t){this.retryQueue.push({item:e,callback:t}),this.retryHandle||(this.retryHandle=setInterval(function(){for(;this.retryQueue.length;){var e=this.retryQueue.shift();this._makeApiRequest(e.item,e.callback)}}.bind(this),this.options.retryInterval))},a.prototype._dequeuePendingRequest=function(e){var t=this.pendingRequests.indexOf(e);-1!==t&&(this.pendingRequests.splice(t,1),this._maybeCallWait())},a.prototype._maybeLog=function(e,t){if(this.logger&&this.options.verbose){var n=t;if(n=(n=n||i.get(e,"body.trace.exception.message"))||i.get(e,"body.trace_chain.0.exception.message"))return void this.logger.error(n);(n=i.get(e,"body.message.body"))&&this.logger.log(n)}},a.prototype._maybeCallWait=function(){return!(!i.isFunction(this.waitCallback)||0!==this.pendingItems.length||0!==this.pendingRequests.length)&&(this.waitIntervalID&&(this.waitIntervalID=clearInterval(this.waitIntervalID)),this.waitCallback(),!0)},e.exports=a},function(e,t,n){var i=n(0);function a(e,t){this.queue=e,this.options=t,this.transforms=[]}a.prototype.configure=function(e){this.queue&&this.queue.configure(e);var t=this.options;return this.options=i.merge(t,e),this},a.prototype.addTransform=function(e){return i.isFunction(e)&&this.transforms.push(e),this},a.prototype.log=function(e,t){if(t&&i.isFunction(t)||(t=function(){}),!this.options.enabled)return t(new Error("Rollbar is not enabled"));this.queue.addPendingItem(e);var n=e.err;this._applyTransforms(e,function(i,a){if(i)return this.queue.removePendingItem(e),t(i,null);this.queue.addItem(a,t,n,e)}.bind(this))},a.prototype._applyTransforms=function(e,t){var n=-1,i=this.transforms.length,a=this.transforms,o=this.options,s=function(e,r){e?t(e,null):++n!==i?a[n](r,o,s):t(null,r)};s(null,e)},e.exports=a},function(e,t,n){var i=n(0),a=100;function o(e){this.queue=[],this.options=i.merge(e);var t=this.options.maxTelemetryEvents||a;this.maxQueueSize=Math.max(0,Math.min(t,a))}function s(e,t){if(t)return t;return{error:"error",manual:"info"}[e]||"info"}o.prototype.configure=function(e){var t=this.options;this.options=i.merge(t,e);var n=this.options.maxTelemetryEvents||a,o=Math.max(0,Math.min(n,a)),s=0;this.maxQueueSize>o&&(s=this.maxQueueSize-o),this.maxQueueSize=o,this.queue.splice(0,s)},o.prototype.copyEvents=function(){var e=Array.prototype.slice.call(this.queue,0);if(i.isFunction(this.options.filterTelemetry))try{for(var t=e.length;t--;)this.options.filterTelemetry(e[t])&&e.splice(t,1)}catch(e){this.options.filterTelemetry=null}return e},o.prototype.capture=function(e,t,n,a,o){var r={level:s(e,n),type:e,timestamp_ms:o||i.now(),body:t,source:"client"};a&&(r.uuid=a);try{if(i.isFunction(this.options.filterTelemetry)&&this.options.filterTelemetry(r))return!1}catch(e){this.options.filterTelemetry=null}return this.push(r),r},o.prototype.captureEvent=function(e,t,n,i){return this.capture(e,t,n,i)},o.prototype.captureError=function(e,t,n,i){var a={message:e.message||String(e)};return e.stack&&(a.stack=e.stack),this.capture("error",a,t,n,i)},o.prototype.captureLog=function(e,t,n,i){return this.capture("log",{message:e},t,n,i)},o.prototype.captureNetwork=function(e,t,n,i){t=t||"xhr",e.subtype=e.subtype||t,i&&(e.request=i);var a=this.levelFromStatus(e.status_code);return this.capture("network",e,a,n)},o.prototype.levelFromStatus=function(e){return e>=200&&e<400?"info":0===e||e>=400?"error":"info"},o.prototype.captureDom=function(e,t,n,i,a){var o={subtype:e,element:t};return void 0!==n&&(o.value=n),void 0!==i&&(o.checked=i),this.capture("dom",o,"info",a)},o.prototype.captureNavigation=function(e,t,n){return this.capture("navigation",{from:e,to:t},"info",n)},o.prototype.captureDomContentLoaded=function(e){return this.capture("navigation",{subtype:"DOMContentLoaded"},"info",void 0,e&&e.getTime())},o.prototype.captureLoad=function(e){return this.capture("navigation",{subtype:"load"},"info",void 0,e&&e.getTime())},o.prototype.captureConnectivityChange=function(e,t){return this.captureNetwork({change:e},"connectivity",t)},o.prototype._captureRollbarItem=function(e){if(this.options.includeItemsInTelemetry)return e.err?this.captureError(e.err,e.level,e.uuid,e.timestamp):e.message?this.captureLog(e.message,e.level,e.uuid,e.timestamp):e.custom?this.capture("log",e.custom,e.level,e.uuid,e.timestamp):void 0},o.prototype.push=function(e){this.queue.push(e),this.queue.length>this.maxQueueSize&&this.queue.shift()},e.exports=o},function(e,t,n){var i=n(0),a=n(15),o=n(2),s={hostname:"api.rollbar.com",path:"/api/1/item/",search:null,version:"1",protocol:"https:",port:443};function r(e,t,n,i){this.options=e,this.transport=t,this.url=n,this.jsonBackup=i,this.accessToken=e.accessToken,this.transportOptions=c(e,n)}function c(e,t){return a.getTransportFromOptions(e,s,t)}r.prototype.postItem=function(e,t){var n=a.transportOptions(this.transportOptions,"POST"),i=a.buildPayload(this.accessToken,e,this.jsonBackup);this.transport.post(this.accessToken,n,i,t)},r.prototype.buildJsonPayload=function(e,t){var n=a.buildPayload(this.accessToken,e,this.jsonBackup),i=o.truncate(n);return i.error?(t&&t(i.error),null):i.value},r.prototype.postJsonPayload=function(e,t){var n=a.transportOptions(this.transportOptions,"POST");this.transport.postJsonPayload(this.accessToken,n,e,t)},r.prototype.configure=function(e){var t=this.oldOptions;return this.options=i.merge(t,e),this.transportOptions=c(this.options,this.url),void 0!==this.options.accessToken&&(this.accessToken=this.options.accessToken),this},e.exports=r},function(e,t,n){var i=n(0);e.exports={buildPayload:function(e,t,n){if(!i.isType(t.context,"string")){var a=i.stringify(t.context,n);a.error?t.context="Error: could not serialize 'context'":t.context=a.value||"",t.context.length>255&&(t.context=t.context.substr(0,255))}return{access_token:e,data:t}},getTransportFromOptions:function(e,t,n){var i=t.hostname,a=t.protocol,o=t.port,s=t.path,r=t.search,c=e.proxy;if(e.endpoint){var l=n.parse(e.endpoint);i=l.hostname,a=l.protocol,o=l.port,s=l.pathname,r=l.search}return{hostname:i,protocol:a,port:o,path:s,search:r,proxy:c}},transportOptions:function(e,t){var n=e.protocol||"https:",i=e.port||("http:"===n?80:"https:"===n?443:void 0),a=e.hostname,o=e.path;return e.search&&(o+=e.search),e.proxy&&(o=n+"//"+a+o,a=e.proxy.host||e.proxy.hostname,i=e.proxy.port,n=e.proxy.protocol||n),{protocol:n,hostname:a,path:o,port:i,method:t}},appendPathToPath:function(e,t){var n=/\/$/.test(e),i=/^\//.test(t);return n&&i?t=t.substring(1):n||i||(t="/"+t),e+t}}},function(e,t){!function(e){"use strict";e.console||(e.console={});for(var t,n,i=e.console,a=function(){},o=["memory"],s="assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(",");t=o.pop();)i[t]||(i[t]={});for(;n=s.pop();)i[n]||(i[n]=a)}("undefined"==typeof window?this:window)},function(e,t){var n={ieVersion:function(){if(document){for(var e=3,t=document.createElement("div"),n=t.getElementsByTagName("i");t.innerHTML="\x3c!--[if gt IE "+ ++e+"]><i></i><![endif]--\x3e",n[0];);return e>4?e:void 0}}};e.exports=n},function(e,t){function n(e,t,n){if(t.hasOwnProperty&&t.hasOwnProperty("addEventListener")){for(var i=t.addEventListener;i._rollbarOldAdd&&i.belongsToShim;)i=i._rollbarOldAdd;var a=function(t,n,a){i.call(this,t,e.wrap(n),a)};a._rollbarOldAdd=i,a.belongsToShim=n,t.addEventListener=a;for(var o=t.removeEventListener;o._rollbarOldRemove&&o.belongsToShim;)o=o._rollbarOldRemove;var s=function(e,t,n){o.call(this,e,t&&t._rollbar_wrapped||t,n)};s._rollbarOldRemove=o,s.belongsToShim=n,t.removeEventListener=s}}e.exports={captureUncaughtExceptions:function(e,t,n){if(e){var i;if("function"==typeof t._rollbarOldOnError)i=t._rollbarOldOnError;else if(e.onerror){for(i=e.onerror;i._rollbarOldOnError;)i=i._rollbarOldOnError;t._rollbarOldOnError=i}var a=function(){var n=Array.prototype.slice.call(arguments,0);!function(e,t,n,i){e._rollbarWrappedError&&(i[4]||(i[4]=e._rollbarWrappedError),i[5]||(i[5]=e._rollbarWrappedError._rollbarContext),e._rollbarWrappedError=null),t.handleUncaughtException.apply(t,i),n&&n.apply(e,i)}(e,t,i,n)};n&&(a._rollbarOldOnError=i),e.onerror=a}},captureUnhandledRejections:function(e,t,n){if(e){"function"==typeof e._rollbarURH&&e._rollbarURH.belongsToShim&&e.removeEventListener("unhandledrejection",e._rollbarURH);var i=function(e){var n,i,a;try{n=e.reason}catch(e){n=void 0}try{i=e.promise}catch(e){i="[unhandledrejection] error getting `promise` from event"}try{a=e.detail,!n&&a&&(n=a.reason,i=a.promise)}catch(e){}n||(n="[unhandledrejection] error getting `reason` from event"),t&&t.handleUnhandledRejection&&t.handleUnhandledRejection(n,i)};i.belongsToShim=n,e._rollbarURH=i,e.addEventListener("unhandledrejection",i)}},wrapGlobals:function(e,t,i){if(e){var a,o,s="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(a=0;a<s.length;++a)e[o=s[a]]&&e[o].prototype&&n(t,e[o].prototype,i)}}}},function(e,t,n){var i=n(0),a=n(2),o=n(1);function s(e,t,n,i,a,o){var s="undefined"!=typeof window&&window||"undefined"!=typeof self&&self,c=s&&s.Zone&&s.Zone.current;c&&"angular"===c._name?c._parent.run(function(){r(e,t,n,i,a,o)}):r(e,t,n,i,a,o)}function r(e,t,n,a,s,r){if("undefined"!=typeof RollbarProxy)return function(e,t){(new RollbarProxy).sendJsonPayload(e,function(e){},function(e){t(new Error(e))})}(a,s);var l;if(!(l=r?r():function(){var e,t,n=[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],i=n.length;for(t=0;t<i;t++)try{e=n[t]();break}catch(e){}return e}()))return s(new Error("No way to send a request"));try{try{var u=function(){try{if(u&&4===l.readyState){u=void 0;var e=i.jsonParse(l.responseText);if((a=l)&&a.status&&200===a.status)return void s(e.error,e.value);if(function(e){return e&&i.isType(e.status,"number")&&e.status>=400&&e.status<600}(l)){if(403===l.status){var t=e.value&&e.value.message;o.error(t)}s(new Error(String(l.status)))}else{s(c("XHR response had no status code (likely connection failure)"))}}}catch(e){var n;n=e&&e.stack?e:new Error(e),s(n)}var a};l.open(n,t,!0),l.setRequestHeader&&(l.setRequestHeader("Content-Type","application/json"),l.setRequestHeader("X-Rollbar-Access-Token",e)),l.onreadystatechange=u,l.send(a)}catch(e){if("undefined"!=typeof XDomainRequest){if(!window||!window.location)return s(new Error("No window available during request, unknown environment"));"http:"===window.location.href.substring(0,5)&&"https"===t.substring(0,5)&&(t="http"+t.substring(5));var p=new XDomainRequest;p.onprogress=function(){},p.ontimeout=function(){s(c("Request timed out","ETIMEDOUT"))},p.onerror=function(){s(new Error("Error during request"))},p.onload=function(){var e=i.jsonParse(p.responseText);s(e.error,e.value)},p.open(n,t,!0),p.send(a)}else s(new Error("Cannot find a method to transport a request"))}}catch(e){s(e)}}function c(e,t){var n=new Error(e);return n.code=t||"ENOTFOUND",n}e.exports={get:function(e,t,n,a,o){a&&i.isFunction(a)||(a=function(){}),i.addParamsAndAccessTokenToPath(e,t,n),s(e,i.formatUrl(t),"GET",null,a,o)},post:function(e,t,n,o,r){if(o&&i.isFunction(o)||(o=function(){}),!n)return o(new Error("Cannot send empty request"));var c=a.truncate(n);if(c.error)return o(c.error);var l=c.value;s(e,i.formatUrl(t),"POST",l,o,r)},postJsonPayload:function(e,t,n,a,o){a&&i.isFunction(a)||(a=function(){}),s(e,i.formatUrl(t),"POST",n,a,o)}}},function(e,t,n){var i=n(0),a=n(4),o=n(1);function s(e,t,n){var a=e.message,o=e.custom;if(!a)if(o){var s=t.scrubFields,r=i.stringify(i.scrub(o,s));a=r.error||r.value||""}else a="";var c={body:a};o&&(c.extra=i.merge(o)),i.set(e,"data.body",{message:c}),n(null,e)}e.exports={handleItemWithError:function(e,t,n){if(e.data=e.data||{},e.err)try{e.stackInfo=e.err._savedStackTrace||a.parse(e.err)}catch(t){o.error("Error while parsing the error object.",t);try{e.message=e.err.message||e.err.description||e.message||String(e.err)}catch(t){e.message=String(e.err)||String(t)}delete e.err}n(null,e)},ensureItemHasSomethingToSay:function(e,t,n){e.message||e.stackInfo||e.custom||n(new Error("No message, stack info, or custom data"),null),n(null,e)},addBaseInfo:function(e,t,n){var a=t.payload&&t.payload.environment||t.environment;e.data=i.merge(e.data,{environment:a,level:e.level,endpoint:t.endpoint,platform:"browser",framework:"browser-js",language:"javascript",server:{},uuid:e.uuid,notifier:{name:"rollbar-browser-js",version:t.version}}),n(null,e)},addRequestInfo:function(e){return function(t,n,a){if(!e||!e.location)return a(null,t);var o="$remote_ip";n.captureIp?!0!==n.captureIp&&(o+="_anonymize"):o=null,i.set(t,"data.request",{url:e.location.href,query_string:e.location.search,user_ip:o}),a(null,t)}},addClientInfo:function(e){return function(t,n,a){if(!e)return a(null,t);var o=e.navigator||{},s=e.screen||{};i.set(t,"data.client",{runtime_ms:t.timestamp-e._rollbarStartTime,timestamp:Math.round(t.timestamp/1e3),javascript:{browser:o.userAgent,language:o.language,cookie_enabled:o.cookieEnabled,screen:{width:s.width,height:s.height}}}),a(null,t)}},addPluginInfo:function(e){return function(t,n,a){if(!e||!e.navigator)return a(null,t);for(var o,s=[],r=e.navigator.plugins||[],c=0,l=r.length;c<l;++c)o=r[c],s.push({name:o.name,description:o.description});i.set(t,"data.client.javascript.plugins",s),a(null,t)}},addBody:function(e,t,n){e.stackInfo?function(e,t,n){var o=e.data.description,r=e.stackInfo,c=e.custom,l=a.guessErrorClass(r.message),u=r.name||l[0],p=l[1],d={exception:{class:u,message:p}};o&&(d.exception.description=o);var m=r.stack;if(m&&0===m.length&&e._unhandledStackInfo&&e._unhandledStackInfo.stack&&(m=e._unhandledStackInfo.stack),m){var h,f,g,v,x,b,y,w;for(0===m.length&&(d.exception.stack=r.rawStack,d.exception.raw=String(r.rawException)),d.frames=[],y=0;y<m.length;++y)h=m[y],f={filename:h.url?i.sanitizeUrl(h.url):"(unknown)",lineno:h.line||null,method:h.func&&"?"!==h.func?h.func:"[anonymous]",colno:h.column},t.sendFrameUrl&&(f.url=h.url),f.method&&f.method.endsWith&&f.method.endsWith("_rollbar_wrapped")||(g=v=x=null,(b=h.context?h.context.length:0)&&(w=Math.floor(b/2),v=h.context.slice(0,w),g=h.context[w],x=h.context.slice(w)),g&&(f.code=g),(v||x)&&(f.context={},v&&v.length&&(f.context.pre=v),x&&x.length&&(f.context.post=x)),h.args&&(f.args=h.args),d.frames.push(f));d.frames.reverse(),c&&(d.extra=i.merge(c)),i.set(e,"data.body",{trace:d}),n(null,e)}else e.message=u+": "+p,s(e,t,n)}(e,t,n):s(e,t,n)},scrubPayload:function(e,t,n){var a=t.scrubFields;e.data=i.scrub(e.data,a),n(null,e)}}},function(e,t,n){var i,a,o;!function(s,r){"use strict";a=[n(22)],void 0===(o="function"==typeof(i=function(e){var t=/(^|@)\S+\:\d+/,n=/^\s*at .*(\S+\:\d+|\(native\))/m,i=/^(eval@)?(\[native code\])?$/;function a(e,t,n){if("function"==typeof Array.prototype.map)return e.map(t,n);for(var i=new Array(e.length),a=0;a<e.length;a++)i[a]=t.call(n,e[a]);return i}function o(e,t,n){if("function"==typeof Array.prototype.filter)return e.filter(t,n);for(var i=[],a=0;a<e.length;a++)t.call(n,e[a])&&i.push(e[a]);return i}return{parse:function(e){if(void 0!==e.stacktrace||void 0!==e["opera#sourceloc"])return this.parseOpera(e);if(e.stack&&e.stack.match(n))return this.parseV8OrIE(e);if(e.stack)return this.parseFFOrSafari(e);throw new Error("Cannot parse given Error object")},extractLocation:function(e){if(-1===e.indexOf(":"))return[e];var t=e.replace(/[\(\)\s]/g,"").split(":"),n=t.pop(),i=t[t.length-1];if(!isNaN(parseFloat(i))&&isFinite(i)){var a=t.pop();return[t.join(":"),a,n]}return[t.join(":"),n,void 0]},parseV8OrIE:function(t){var i=o(t.stack.split("\n"),function(e){return!!e.match(n)},this);return a(i,function(t){t.indexOf("(eval ")>-1&&(t=t.replace(/eval code/g,"eval").replace(/(\(eval at [^\()]*)|(\)\,.*$)/g,""));var n=t.replace(/^\s+/,"").replace(/\(eval code/g,"(").split(/\s+/).slice(1),i=this.extractLocation(n.pop()),a=n.join(" ")||void 0,o="eval"===i[0]?void 0:i[0];return new e(a,void 0,o,i[1],i[2],t)},this)},parseFFOrSafari:function(t){var n=o(t.stack.split("\n"),function(e){return!e.match(i)},this);return a(n,function(t){if(t.indexOf(" > eval")>-1&&(t=t.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g,":$1")),-1===t.indexOf("@")&&-1===t.indexOf(":"))return new e(t);var n=t.split("@"),i=this.extractLocation(n.pop()),a=n.shift()||void 0;return new e(a,void 0,i[0],i[1],i[2],t)},this)},parseOpera:function(e){return!e.stacktrace||e.message.indexOf("\n")>-1&&e.message.split("\n").length>e.stacktrace.split("\n").length?this.parseOpera9(e):e.stack?this.parseOpera11(e):this.parseOpera10(e)},parseOpera9:function(t){for(var n=/Line (\d+).*script (?:in )?(\S+)/i,i=t.message.split("\n"),a=[],o=2,s=i.length;o<s;o+=2){var r=n.exec(i[o]);r&&a.push(new e(void 0,void 0,r[2],r[1],void 0,i[o]))}return a},parseOpera10:function(t){for(var n=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,i=t.stacktrace.split("\n"),a=[],o=0,s=i.length;o<s;o+=2){var r=n.exec(i[o]);r&&a.push(new e(r[3]||void 0,void 0,r[2],r[1],void 0,i[o]))}return a},parseOpera11:function(n){var i=o(n.stack.split("\n"),function(e){return!!e.match(t)&&!e.match(/^Error created at/)},this);return a(i,function(t){var n,i=t.split("@"),a=this.extractLocation(i.pop()),o=i.shift()||"",s=o.replace(/<anonymous function(: (\w+))?>/,"$2").replace(/\([^\)]*\)/g,"")||void 0;o.match(/\(([^\)]*)\)/)&&(n=o.replace(/^[^\(]+\(([^\)]*)\)$/,"$1"));var r=void 0===n||"[arguments not available]"===n?void 0:n.split(",");return new e(s,r,a[0],a[1],a[2],t)},this)}}})?i.apply(t,a):i)||(e.exports=o)}()},function(e,t,n){var i,a,o;!function(n,s){"use strict";a=[],void 0===(o="function"==typeof(i=function(){function e(e){return!isNaN(parseFloat(e))&&isFinite(e)}function t(e,t,n,i,a,o){void 0!==e&&this.setFunctionName(e),void 0!==t&&this.setArgs(t),void 0!==n&&this.setFileName(n),void 0!==i&&this.setLineNumber(i),void 0!==a&&this.setColumnNumber(a),void 0!==o&&this.setSource(o)}return t.prototype={getFunctionName:function(){return this.functionName},setFunctionName:function(e){this.functionName=String(e)},getArgs:function(){return this.args},setArgs:function(e){if("[object Array]"!==Object.prototype.toString.call(e))throw new TypeError("Args must be an Array");this.args=e},getFileName:function(){return this.fileName},setFileName:function(e){this.fileName=String(e)},getLineNumber:function(){return this.lineNumber},setLineNumber:function(t){if(!e(t))throw new TypeError("Line Number must be a Number");this.lineNumber=Number(t)},getColumnNumber:function(){return this.columnNumber},setColumnNumber:function(t){if(!e(t))throw new TypeError("Column Number must be a Number");this.columnNumber=Number(t)},getSource:function(){return this.source},setSource:function(e){this.source=String(e)},toString:function(){return(this.getFunctionName()||"{anonymous}")+"("+(this.getArgs()||[]).join(",")+")"+(this.getFileName()?"@"+this.getFileName():"")+(e(this.getLineNumber())?":"+this.getLineNumber():"")+(e(this.getColumnNumber())?":"+this.getColumnNumber():"")}},t})?i.apply(t,a):i)||(e.exports=o)}()},function(e,t,n){var i=n(0);e.exports={itemToPayload:function(e,t,n){var a=t.payload||{};a.body&&delete a.body;var o=i.merge(e.data,a);e._isUncaught&&(o._isUncaught=!0),e._originalArgs&&(o._originalArgs=e._originalArgs),n(null,o)},addTelemetryData:function(e,t,n){e.telemetryEvents&&i.set(e,"data.body.telemetry",e.telemetryEvents),n(null,e)},addMessageWithError:function(e,t,n){if(e.message){var a="data.body.trace_chain.0",o=i.get(e,a);if(o||(a="data.body.trace",o=i.get(e,a)),o){if(!o.exception||!o.exception.description)return i.set(e,a+".exception.description",e.message),void n(null,e);var s=i.get(e,a+".extra")||{},r=i.merge(s,{message:e.message});i.set(e,a+".extra",r)}n(null,e)}else n(null,e)},userTransform:function(e){return function(t,n,a){var o=i.merge(t);try{i.isFunction(n.transform)&&n.transform(o.data,t)}catch(i){return n.transform=null,e.error("Error while calling custom transform() function. Removing custom transform().",i),void a(null,t)}a(null,o)}},addConfigToPayload:function(e,t,n){if(!t.sendConfig)return n(null,e);var a=i.get(e,"data.custom")||{};a._rollbarConfig=t,e.data.custom=a,n(null,e)}}},function(e,t,n){var i=n(0);e.exports={checkIgnore:function(e,t){return!i.get(t,"plugins.jquery.ignoreAjaxErrors")||!i.get(e,"body.message.extra.isAjax")}}},function(e,t,n){var i=n(0);function a(e,t,n,a){var o,s,r,c,l,u,p,d,m=!1;"blacklist"===n&&(m=!0);try{if(u=(o=m?t.hostBlackList:t.hostWhiteList)&&o.length,s=i.get(e,"body.trace"),!o||0===u)return!m;if(!s||!s.frames||0===s.frames.length)return!m;for(c=s.frames.length,p=0;p<c;p++){if(r=s.frames[p].filename,!i.isType(r,"string"))return!m;for(d=0;d<u;d++)if(l=o[d],new RegExp(l).test(r))return!0}}catch(e){m?t.hostBlackList=null:t.hostWhiteList=null;var h=m?"hostBlackList":"hostWhiteList";return a.error("Error while reading your configuration's "+h+" option. Removing custom "+h+".",e),!m}return!1}e.exports={checkLevel:function(e,t){var n=e.level,a=i.LEVELS[n]||0,o=t.reportLevel;return!(a<(i.LEVELS[o]||0))},userCheckIgnore:function(e){return function(t,n){var a=!!t._isUncaught;delete t._isUncaught;var o=t._originalArgs;delete t._originalArgs;try{i.isFunction(n.onSendCallback)&&n.onSendCallback(a,o,t)}catch(t){n.onSendCallback=null,e.error("Error while calling onSendCallback, removing",t)}try{if(i.isFunction(n.checkIgnore)&&n.checkIgnore(a,o,t))return!1}catch(t){n.checkIgnore=null,e.error("Error while calling custom checkIgnore(), removing",t)}return!0}},urlIsNotBlacklisted:function(e){return function(t,n){return!a(t,n,"blacklist",e)}},urlIsWhitelisted:function(e){return function(t,n){return a(t,n,"whitelist",e)}},messageIsIgnored:function(e){return function(t,n){var a,o,s,r,c,l,u,p;try{if(c=!1,!(s=n.ignoredMessages)||0===s.length)return!0;if(l=t.body,u=i.get(l,"trace.exception.message"),p=i.get(l,"message.body"),!(a=u||p))return!0;for(r=s.length,o=0;o<r&&!(c=new RegExp(s[o],"gi").test(a));o++);}catch(t){n.ignoredMessages=null,e.error("Error while reading your configuration's ignoredMessages option. Removing custom ignoredMessages.")}return!c}}}},function(e,t,n){var i=n(0),a=n(3),o=n(27),s={network:!0,networkResponseHeaders:!1,networkResponseBody:!1,networkRequestBody:!1,log:!0,dom:!0,navigation:!0,connectivity:!0};function r(e,t,n,i,a){var o=e[t];e[t]=n(o),i&&i[a].push([e,t,o])}function c(e,t){for(var n;e[t].length;)(n=e[t].shift())[0][n[1]]=n[2]}function l(e,t,n,a,o){var r=e.autoInstrument;!1===e.enabled||!1===r?this.autoInstrument={}:(i.isType(r,"object")||(r=s),this.autoInstrument=i.merge(s,r)),this.scrubTelemetryInputs=!!e.scrubTelemetryInputs,this.telemetryScrubber=e.telemetryScrubber,this.defaultValueScrubber=function(e){for(var t=[],n=0;n<e.length;++n)t.push(new RegExp(e[n],"i"));return function(e){var n=function(e){if(!e||!e.attributes)return null;for(var t=e.attributes,n=0;n<t.length;++n)if("name"===t[n].key)return t[n].value;return null}(e);if(!n)return!1;for(var i=0;i<t.length;++i)if(t[i].test(n))return!0;return!1}}(e.scrubFields),this.telemeter=t,this.rollbar=n,this._window=a||{},this._document=o||{},this.replacements={network:[],log:[],navigation:[],connectivity:[]},this.eventRemovers={dom:[],connectivity:[]},this._location=this._window.location,this._lastHref=this._location&&this._location.href}l.prototype.configure=function(e){var t=e.autoInstrument,n=i.merge(this.autoInstrument);!1===e.enabled||!1===t?this.autoInstrument={}:(i.isType(t,"object")||(t=s),this.autoInstrument=i.merge(s,t)),this.instrument(n),void 0!==e.scrubTelemetryInputs&&(this.scrubTelemetryInputs=!!e.scrubTelemetryInputs),void 0!==e.telemetryScrubber&&(this.telemetryScrubber=e.telemetryScrubber)},l.prototype.instrument=function(e){!this.autoInstrument.network||e&&e.network?!this.autoInstrument.network&&e&&e.network&&this.deinstrumentNetwork():this.instrumentNetwork(),!this.autoInstrument.log||e&&e.log?!this.autoInstrument.log&&e&&e.log&&this.deinstrumentConsole():this.instrumentConsole(),!this.autoInstrument.dom||e&&e.dom?!this.autoInstrument.dom&&e&&e.dom&&this.deinstrumentDom():this.instrumentDom(),!this.autoInstrument.navigation||e&&e.navigation?!this.autoInstrument.navigation&&e&&e.navigation&&this.deinstrumentNavigation():this.instrumentNavigation(),!this.autoInstrument.connectivity||e&&e.connectivity?!this.autoInstrument.connectivity&&e&&e.connectivity&&this.deinstrumentConnectivity():this.instrumentConnectivity()},l.prototype.deinstrumentNetwork=function(){c(this.replacements,"network")},l.prototype.instrumentNetwork=function(){var e=this;function t(t,n){t in n&&i.isFunction(n[t])&&r(n,t,function(t){return e.rollbar.wrap(t)})}if("XMLHttpRequest"in this._window){var n=this._window.XMLHttpRequest.prototype;r(n,"open",function(e){return function(t,n){return i.isType(n,"string")&&(this.__rollbar_xhr={method:t,url:n,status_code:null,start_time_ms:i.now(),end_time_ms:null}),e.apply(this,arguments)}},this.replacements,"network"),r(n,"send",function(n){return function(a){var o=this;function s(){if(o.__rollbar_xhr){if(null===o.__rollbar_xhr.status_code){o.__rollbar_xhr.status_code=0;var t=null;e.autoInstrument.networkRequestBody&&(t=a),o.__rollbar_event=e.telemeter.captureNetwork(o.__rollbar_xhr,"xhr",void 0,t)}if(o.readyState<2&&(o.__rollbar_xhr.start_time_ms=i.now()),o.readyState>3){o.__rollbar_xhr.end_time_ms=i.now();var n=null;if(e.autoInstrument.networkResponseHeaders){var s=e.autoInstrument.networkResponseHeaders;n={};try{var r,c;if(!0===s){var l=o.getAllResponseHeaders();if(l){var u,p,d=l.trim().split(/[\r\n]+/);for(c=0;c<d.length;c++)r=(u=d[c].split(": ")).shift(),p=u.join(": "),n[r]=p}}else for(c=0;c<s.length;c++)n[r=s[c]]=o.getResponseHeader(r)}catch(e){}}var m=null;if(e.autoInstrument.networkResponseBody)try{m=o.responseText}catch(e){}var h=null;(m||n)&&(h={},m&&(h.body=m),n&&(h.headers=n)),h&&(o.__rollbar_xhr.response=h);try{var f=o.status;f=1223===f?204:f,o.__rollbar_xhr.status_code=f,o.__rollbar_event.level=e.telemeter.levelFromStatus(f)}catch(e){}}}}return t("onload",o),t("onerror",o),t("onprogress",o),"onreadystatechange"in o&&i.isFunction(o.onreadystatechange)?r(o,"onreadystatechange",function(t){return e.rollbar.wrap(t,void 0,s)}):o.onreadystatechange=s,n.apply(this,arguments)}},this.replacements,"network")}"fetch"in this._window&&r(this._window,"fetch",function(t){return function(n,a){for(var o=new Array(arguments.length),s=0,r=o.length;s<r;s++)o[s]=arguments[s];var c,l=o[0],u="GET";i.isType(l,"string")?c=l:l&&(c=l.url,l.method&&(u=l.method)),o[1]&&o[1].method&&(u=o[1].method);var p={method:u,url:c,status_code:null,start_time_ms:i.now(),end_time_ms:null},d=null;return e.autoInstrument.networkRequestBody&&(o[1]&&o[1].body?d=o[1].body:o[0]&&!i.isType(o[0],"string")&&o[0].body&&(d=o[0].body)),e.telemeter.captureNetwork(p,"fetch",void 0,d),t.apply(this,o).then(function(t){p.end_time_ms=i.now(),p.status_code=t.status;var n=null;if(e.autoInstrument.networkResponseHeaders){var a=e.autoInstrument.networkResponseHeaders;n={};try{if(!0===a);else for(var o=0;o<a.length;o++){var s=a[o];n[s]=t.headers.get(s)}}catch(e){}}var r=null;return n&&(r={headers:n}),r&&(p.response=r),t})}},this.replacements,"network")},l.prototype.deinstrumentConsole=function(){if("console"in this._window&&this._window.console.log)for(var e;this.replacements.log.length;)e=this.replacements.log.shift(),this._window.console[e[0]]=e[1]},l.prototype.instrumentConsole=function(){if("console"in this._window&&this._window.console.log)for(var e=this,t=this._window.console,n=["debug","info","warn","error","log"],a=0,o=n.length;a<o;a++)s(n[a]);function s(n){var a=t[n],o=t,s="warn"===n?"warning":n;t[n]=function(){var t=Array.prototype.slice.call(arguments),n=i.formatArgsAsString(t);e.telemeter.captureLog(n,s),a&&Function.prototype.apply.call(a,o,t)},e.replacements.log.push([n,a])}},l.prototype.deinstrumentDom=function(){("addEventListener"in this._window||"attachEvent"in this._window)&&this.removeListeners("dom")},l.prototype.instrumentDom=function(){if("addEventListener"in this._window||"attachEvent"in this._window){var e=this.handleClick.bind(this),t=this.handleBlur.bind(this);this.addListener("dom",this._window,"click","onclick",e,!0),this.addListener("dom",this._window,"blur","onfocusout",t,!0)}},l.prototype.handleClick=function(e){try{var t=o.getElementFromEvent(e,this._document),n=t&&t.tagName,i=o.isDescribedElement(t,"a")||o.isDescribedElement(t,"button");n&&(i||o.isDescribedElement(t,"input",["button","submit"]))?this.captureDomEvent("click",t):o.isDescribedElement(t,"input",["checkbox","radio"])&&this.captureDomEvent("input",t,t.value,t.checked)}catch(e){}},l.prototype.handleBlur=function(e){try{var t=o.getElementFromEvent(e,this._document);t&&t.tagName&&(o.isDescribedElement(t,"textarea")?this.captureDomEvent("input",t,t.value):o.isDescribedElement(t,"select")&&t.options&&t.options.length?this.handleSelectInputChanged(t):o.isDescribedElement(t,"input")&&!o.isDescribedElement(t,"input",["button","submit","hidden","checkbox","radio"])&&this.captureDomEvent("input",t,t.value))}catch(e){}},l.prototype.handleSelectInputChanged=function(e){if(e.multiple)for(var t=0;t<e.options.length;t++)e.options[t].selected&&this.captureDomEvent("input",e,e.options[t].value);else e.selectedIndex>=0&&e.options[e.selectedIndex]&&this.captureDomEvent("input",e,e.options[e.selectedIndex].value)},l.prototype.captureDomEvent=function(e,t,n,i){if(void 0!==n)if(this.scrubTelemetryInputs||"password"===o.getElementType(t))n="[scrubbed]";else{var a=o.describeElement(t);this.telemetryScrubber?this.telemetryScrubber(a)&&(n="[scrubbed]"):this.defaultValueScrubber(a)&&(n="[scrubbed]")}var s=o.elementArrayToString(o.treeToArray(t));this.telemeter.captureDom(e,s,n,i)},l.prototype.deinstrumentNavigation=function(){var e=this._window.chrome;!(e&&e.app&&e.app.runtime)&&this._window.history&&this._window.history.pushState&&c(this.replacements,"navigation")},l.prototype.instrumentNavigation=function(){var e=this._window.chrome;if(!(e&&e.app&&e.app.runtime)&&this._window.history&&this._window.history.pushState){var t=this;r(this._window,"onpopstate",function(e){return function(){var n=t._location.href;t.handleUrlChange(t._lastHref,n),e&&e.apply(this,arguments)}},this.replacements,"navigation"),r(this._window.history,"pushState",function(e){return function(){var n=arguments.length>2?arguments[2]:void 0;return n&&t.handleUrlChange(t._lastHref,n+""),e.apply(this,arguments)}},this.replacements,"navigation")}},l.prototype.handleUrlChange=function(e,t){var n=a.parse(this._location.href),i=a.parse(t),o=a.parse(e);this._lastHref=t,n.protocol===i.protocol&&n.host===i.host&&(t=i.path+(i.hash||"")),n.protocol===o.protocol&&n.host===o.host&&(e=o.path+(o.hash||"")),this.telemeter.captureNavigation(e,t)},l.prototype.deinstrumentConnectivity=function(){("addEventListener"in this._window||"body"in this._document)&&(this._window.addEventListener?this.removeListeners("connectivity"):c(this.replacements,"connectivity"))},l.prototype.instrumentConnectivity=function(){if("addEventListener"in this._window||"body"in this._document)if(this._window.addEventListener)this.addListener("connectivity",this._window,"online",void 0,function(){this.telemeter.captureConnectivityChange("online")}.bind(this),!0),this.addListener("connectivity",this._window,"offline",void 0,function(){this.telemeter.captureConnectivityChange("offline")}.bind(this),!0);else{var e=this;r(this._document.body,"ononline",function(t){return function(){e.telemeter.captureConnectivityChange("online"),t&&t.apply(this,arguments)}},this.replacements,"connectivity"),r(this._document.body,"onoffline",function(t){return function(){e.telemeter.captureConnectivityChange("offline"),t&&t.apply(this,arguments)}},this.replacements,"connectivity")}},l.prototype.addListener=function(e,t,n,i,a,o){t.addEventListener?(t.addEventListener(n,a,o),this.eventRemovers[e].push(function(){t.removeEventListener(n,a,o)})):i&&(t.attachEvent(i,a),this.eventRemovers[e].push(function(){t.detachEvent(i,a)}))},l.prototype.removeListeners=function(e){for(;this.eventRemovers[e].length;)this.eventRemovers[e].shift()()},e.exports=l},function(e,t){function n(e){return(e.getAttribute("type")||"").toLowerCase()}function i(e){if(!e||!e.tagName)return"";var t=[e.tagName];e.id&&t.push("#"+e.id),e.classes&&t.push("."+e.classes.join("."));for(var n=0;n<e.attributes.length;n++)t.push("["+e.attributes[n].key+'="'+e.attributes[n].value+'"]');return t.join("")}function a(e){if(!e||!e.tagName)return null;var t,n,i,a,o={};o.tagName=e.tagName.toLowerCase(),e.id&&(o.id=e.id),(t=e.className)&&"string"==typeof t&&(o.classes=t.split(/\s+/));var s=["type","name","title","alt"];for(o.attributes=[],a=0;a<s.length;a++)n=s[a],(i=e.getAttribute(n))&&o.attributes.push({key:n,value:i});return o}e.exports={describeElement:a,descriptionToString:i,elementArrayToString:function(e){for(var t,n,a=" > ".length,o=[],s=0,r=e.length-1;r>=0;r--){if(t=i(e[r]),n=s+o.length*a+t.length,r<e.length-1&&n>=83){o.unshift("...");break}o.unshift(t),s+=t.length}return o.join(" > ")},treeToArray:function(e){for(var t,n=[],i=0;e&&i<5&&"html"!==(t=a(e)).tagName;i++)n.unshift(t),e=e.parentNode;return n},getElementFromEvent:function(e,t){return e.target?e.target:t&&t.elementFromPoint?t.elementFromPoint(e.clientX,e.clientY):void 0},isDescribedElement:function(e,t,i){if(e.tagName.toLowerCase()!==t.toLowerCase())return!1;if(!i)return!0;e=n(e);for(var a=0;a<i.length;a++)if(i[a]===e)return!0;return!1},getElementType:n}}])},function(e,t,n){(function(){var t,i,a,o,s,r,c,l,u=[].slice;l=n(163),a={cmd:"⌘",ctrl:"⌃",alt:"⌥",option:"⌥",shift:"⇧",enter:"⏎",left:"←",right:"→",up:"↑",down:"↓"},o={cmd:"Cmd",ctrl:"Ctrl",alt:"Alt",option:"Alt",shift:"Shift",enter:"Enter",left:"Left",right:"Right",up:"Up",down:"Down"},r={"~":"`",_:"-","+":"=","|":"\\","{":"[","}":"]",":":";",'"':"'","<":",",">":".","?":"/"},c=function(e){var t,n,i,a,o;if(i=0,n=[],null==e)return n;for(t=a=0,o=e.length;a<o;t=++a)"."!==e[t]||0!==t&&"\\"===e[t-1]||(n.push(e.substring(i,t)),i=t+1);return n.push(e.substr(i,e.length)),n},i=function(e){return l.isObject(e)&&!l.isArray(e)},s={adviseBefore:function(e,t,n){var i;return i=e[t],e[t]=function(){var e;if(e=1<=arguments.length?u.call(arguments,0):[],!1!==n.apply(this,e))return i.apply(this,e)}},camelize:function(e){return e?e.replace(/[_-]+(\w)/g,function(e){return e[1].toUpperCase()}):""},capitalize:function(e){return e?"github"===e.toLowerCase()?"GitHub":e[0].toUpperCase()+e.slice(1):""},compactObject:function(e){var t,n,i;for(t in n={},e)null!=(i=e[t])&&(n[t]=i);return n},dasherize:function(e){return e?(e=e[0].toLowerCase()+e.slice(1)).replace(/([A-Z])|(_)/g,function(e,t){return t?"-"+t.toLowerCase():"-"}):""},deepClone:function(e){return l.isArray(e)?e.map(function(e){return s.deepClone(e)}):l.isObject(e)&&!l.isFunction(e)?s.mapObject(e,function(e,t){return[e,s.deepClone(t)]}):e},deepExtend:function(e){var t,n,a,o,r,c,l;for(o=e,t=0;++t<arguments.length;)if(a=arguments[t],i(o)&&i(a))for(r=0,c=(l=Object.keys(a)).length;r<c;r++)o[n=l[r]]=s.deepExtend(o[n],a[n]);else o=s.deepClone(a);return o},deepContains:function(e,t){var n,i,a;if(null==e)return!1;for(i=0,a=e.length;i<a;i++)if(n=e[i],l.isEqual(n,t))return!0;return!1},endsWith:function(e,t){return null==t&&(t=""),!!e&&-1!==e.indexOf(t,e.length-t.length)},escapeAttribute:function(e){return e?e.replace(/"/g,"&quot;").replace(/\n/g,"").replace(/\\/g,"-"):""},escapeRegExp:function(e){return e?e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"):""},humanizeEventName:function(e,t){var n,i,a,o;return i=(o=e.split(":"))[0],null==(n=o[1])?s.undasherize(i):(a=s.undasherize(i),null==t&&(t=s.undasherize(n)),a+": "+t)},humanizeKey:function(e,t){var n;return null==t&&(t=process.platform),e?(n="darwin"===t?a:o)[e]?n[e]:1===e.length&&null!=r[e]?[n.shift,r[e]]:1===e.length&&e===e.toUpperCase()&&e.toUpperCase()!==e.toLowerCase()?[n.shift,e.toUpperCase()]:1===e.length||/f[0-9]{1,2}/.test(e)?e.toUpperCase():"darwin"===t?e:s.capitalize(e):e},humanizeKeystroke:function(e,t){var n,i,a,o,r,c,u,p,d,m;if(null==t&&(t=process.platform),!e)return e;for(n=[],u=0,d=(r=e.split(" ")).length;u<d;u++){for(o=[],i=p=0,m=(c=(e=r[u]).split("-")).length;p<m;i=++p)""===(a=c[i])&&""===c[i-1]&&(a="-"),a&&o.push(s.humanizeKey(a,t));o=l.uniq(l.flatten(o)),o="darwin"===t?o.join(""):o.join("+"),n.push(o)}return n.join(" ")},isSubset:function(e,t){return l.every(e,function(e){return l.include(t,e)})},losslessInvert:function(e){var t,n,i;for(n in t={},e)null==t[i=e[n]]&&(t[i]=[]),t[i].push(n);return t},mapObject:function(e,t){var n,i,a,o,s,r,c;for(i={},o=0,s=(r=Object.keys(e)).length;o<s;o++)n=(c=t(n=r[o],e[n]))[0],a=c[1],i[n]=a;return i},multiplyString:function(e,t){var n,i;for(n="",i=0;i<t;)n+=e,i++;return n},pluralize:function(e,t,n){return null==e&&(e=0),null==n&&(n=t+"s"),1===e?e+" "+t:e+" "+n},remove:function(e,t){var n;return(n=e.indexOf(t))>=0&&e.splice(n,1),e},setValueForKeyPath:function(e,t,n){var i,a;for(a=c(t);a.length>1;)null==e[i=a.shift()]&&(e[i]={}),e=e[i];return null!=n?e[a.shift()]=n:delete e[a.shift()]},hasKeyPath:function(e,t){var n,i,a,o;for(a=0,o=(i=c(t)).length;a<o;a++){if(n=i[a],!e.hasOwnProperty(n))return!1;e=e[n]}return!0},spliceWithArray:function(e,t,n,i,a){var o,s,r,c;if(null==a&&(a=1e5),i.length<a)return e.splice.apply(e,[t,n].concat(u.call(i)));for(e.splice(t,n),c=[],o=s=0,r=i.length;a>0?s<=r:s>=r;o=s+=a)c.push(e.splice.apply(e,[t+o,0].concat(u.call(i.slice(o,o+a)))));return c},sum:function(e){var t,n,i;for(t=0,n=0,i=e.length;n<i;n++)t+=e[n];return t},uncamelcase:function(e){var t;return e?(t=e.replace(/([A-Z])|_+/g,function(e,t){return null==t&&(t="")," "+t}),s.capitalize(t.trim())):""},undasherize:function(e){return e?e.split("-").map(s.capitalize).join(" "):""},underscore:function(e){return e?(e=e[0].toLowerCase()+e.slice(1)).replace(/([A-Z])|-+/g,function(e,t){return null==t&&(t=""),"_"+t.toLowerCase()}):""},valueForKeyPath:function(e,t){var n,i,a;for(i=0,a=(n=c(t)).length;i<a;i++)if(null==(e=e[n[i]]))return;return e},isEqual:function(e,n,i,a){return l.isArray(i)&&l.isArray(a)?t(e,n,i,a):t(e,n)},isEqualForProperties:function(){var e,t,n,i,a,o;for(e=arguments[0],t=arguments[1],a=0,o=(n=3<=arguments.length?u.call(arguments,2):[]).length;a<o;a++)if(i=n[a],!l.isEqual(e[i],t[i]))return!1;return!0}},t=function(e,n,i,a){var o,s,r,c,u,p,d,m,h,f,g,v,x,b;if(null==i&&(i=[]),null==a&&(a=[]),e===n)return l.isEqual(e,n);if(l.isFunction(e)||l.isFunction(n))return l.isEqual(e,n);for(v=i.length;v--;)if(i[v]===e)return a[v]===n;if(i.push(e),a.push(n),h=!1,l.isFunction(null!=e?e.isEqual:void 0))h=e.isEqual(n,i,a);else if(l.isFunction(null!=n?n.isEqual:void 0))h=n.isEqual(e,a,i);else if(l.isArray(e)&&l.isArray(n)&&e.length===n.length){for(h=!0,f=x=0,b=e.length;x<b;f=++x)if(r=e[f],!t(r,n[f],i,a)){h=!1;break}}else if(l.isRegExp(e)&&l.isRegExp(n))h=l.isEqual(e,n);else if(l.isElement(e)&&l.isElement(n))h=e===n;else if(l.isObject(e)&&l.isObject(n))if(o=e.constructor,p=n.constructor,s=l.isFunction(o)&&o instanceof o,d=l.isFunction(p)&&p instanceof p,o===p||s&&d){for(g in c=0,h=!0,e)if(u=e[g],l.has(e,g)&&(c++,!l.has(n,g)||!t(u,n[g],i,a))){h=!1;break}if(h){for(g in m=0,n)n[g],l.has(n,g)&&m++;h=c===m}}else h=!1;else h=l.isEqual(e,n);return i.pop(),a.pop(),h},e.exports=l.extend({},l,s)}).call(this)},function(e,t,n){(function(e){var n;!function(){var i="object"==typeof self&&self.self===self&&self||"object"==typeof global&&global.global===global&&global||this||{},a=i._,o=Array.prototype,s=Object.prototype,r="undefined"!=typeof Symbol?Symbol.prototype:null,c=o.push,l=o.slice,u=s.toString,p=s.hasOwnProperty,d=Array.isArray,m=Object.keys,h=Object.create,f=function(){},g=function(e){return e instanceof g?e:this instanceof g?void(this._wrapped=e):new g(e)};t.nodeType?i._=g:(!e.nodeType&&e.exports&&(t=e.exports=g),t._=g),g.VERSION="1.9.1";var v,x=function(e,t,n){if(void 0===t)return e;switch(null==n?3:n){case 1:return function(n){return e.call(t,n)};case 3:return function(n,i,a){return e.call(t,n,i,a)};case 4:return function(n,i,a,o){return e.call(t,n,i,a,o)}}return function(){return e.apply(t,arguments)}},b=function(e,t,n){return g.iteratee!==v?g.iteratee(e,t):null==e?g.identity:g.isFunction(e)?x(e,t,n):g.isObject(e)&&!g.isArray(e)?g.matcher(e):g.property(e)};g.iteratee=v=function(e,t){return b(e,t,1/0)};var y=function(e,t){return t=null==t?e.length-1:+t,function(){for(var n=Math.max(arguments.length-t,0),i=Array(n),a=0;a<n;a++)i[a]=arguments[a+t];switch(t){case 0:return e.call(this,i);case 1:return e.call(this,arguments[0],i);case 2:return e.call(this,arguments[0],arguments[1],i)}var o=Array(t+1);for(a=0;a<t;a++)o[a]=arguments[a];return o[t]=i,e.apply(this,o)}},w=function(e){if(!g.isObject(e))return{};if(h)return h(e);f.prototype=e;var t=new f;return f.prototype=null,t},k=function(e){return function(t){return null==t?void 0:t[e]}},E=function(e,t){return null!=e&&p.call(e,t)},S=function(e,t){for(var n=t.length,i=0;i<n;i++){if(null==e)return;e=e[t[i]]}return n?e:void 0},P=Math.pow(2,53)-1,_=k("length"),I=function(e){var t=_(e);return"number"==typeof t&&t>=0&&t<=P};g.each=g.forEach=function(e,t,n){var i,a;if(t=x(t,n),I(e))for(i=0,a=e.length;i<a;i++)t(e[i],i,e);else{var o=g.keys(e);for(i=0,a=o.length;i<a;i++)t(e[o[i]],o[i],e)}return e},g.map=g.collect=function(e,t,n){t=b(t,n);for(var i=!I(e)&&g.keys(e),a=(i||e).length,o=Array(a),s=0;s<a;s++){var r=i?i[s]:s;o[s]=t(e[r],r,e)}return o};var T=function(e){return function(t,n,i,a){var o=arguments.length>=3;return function(t,n,i,a){var o=!I(t)&&g.keys(t),s=(o||t).length,r=e>0?0:s-1;for(a||(i=t[o?o[r]:r],r+=e);r>=0&&r<s;r+=e){var c=o?o[r]:r;i=n(i,t[c],c,t)}return i}(t,x(n,a,4),i,o)}};g.reduce=g.foldl=g.inject=T(1),g.reduceRight=g.foldr=T(-1),g.find=g.detect=function(e,t,n){var i=(I(e)?g.findIndex:g.findKey)(e,t,n);if(void 0!==i&&-1!==i)return e[i]},g.filter=g.select=function(e,t,n){var i=[];return t=b(t,n),g.each(e,function(e,n,a){t(e,n,a)&&i.push(e)}),i},g.reject=function(e,t,n){return g.filter(e,g.negate(b(t)),n)},g.every=g.all=function(e,t,n){t=b(t,n);for(var i=!I(e)&&g.keys(e),a=(i||e).length,o=0;o<a;o++){var s=i?i[o]:o;if(!t(e[s],s,e))return!1}return!0},g.some=g.any=function(e,t,n){t=b(t,n);for(var i=!I(e)&&g.keys(e),a=(i||e).length,o=0;o<a;o++){var s=i?i[o]:o;if(t(e[s],s,e))return!0}return!1},g.contains=g.includes=g.include=function(e,t,n,i){return I(e)||(e=g.values(e)),("number"!=typeof n||i)&&(n=0),g.indexOf(e,t,n)>=0},g.invoke=y(function(e,t,n){var i,a;return g.isFunction(t)?a=t:g.isArray(t)&&(i=t.slice(0,-1),t=t[t.length-1]),g.map(e,function(e){var o=a;if(!o){if(i&&i.length&&(e=S(e,i)),null==e)return;o=e[t]}return null==o?o:o.apply(e,n)})}),g.pluck=function(e,t){return g.map(e,g.property(t))},g.where=function(e,t){return g.filter(e,g.matcher(t))},g.findWhere=function(e,t){return g.find(e,g.matcher(t))},g.max=function(e,t,n){var i,a,o=-1/0,s=-1/0;if(null==t||"number"==typeof t&&"object"!=typeof e[0]&&null!=e)for(var r=0,c=(e=I(e)?e:g.values(e)).length;r<c;r++)null!=(i=e[r])&&i>o&&(o=i);else t=b(t,n),g.each(e,function(e,n,i){((a=t(e,n,i))>s||a===-1/0&&o===-1/0)&&(o=e,s=a)});return o},g.min=function(e,t,n){var i,a,o=1/0,s=1/0;if(null==t||"number"==typeof t&&"object"!=typeof e[0]&&null!=e)for(var r=0,c=(e=I(e)?e:g.values(e)).length;r<c;r++)null!=(i=e[r])&&i<o&&(o=i);else t=b(t,n),g.each(e,function(e,n,i){((a=t(e,n,i))<s||a===1/0&&o===1/0)&&(o=e,s=a)});return o},g.shuffle=function(e){return g.sample(e,1/0)},g.sample=function(e,t,n){if(null==t||n)return I(e)||(e=g.values(e)),e[g.random(e.length-1)];var i=I(e)?g.clone(e):g.values(e),a=_(i);t=Math.max(Math.min(t,a),0);for(var o=a-1,s=0;s<t;s++){var r=g.random(s,o),c=i[s];i[s]=i[r],i[r]=c}return i.slice(0,t)},g.sortBy=function(e,t,n){var i=0;return t=b(t,n),g.pluck(g.map(e,function(e,n,a){return{value:e,index:i++,criteria:t(e,n,a)}}).sort(function(e,t){var n=e.criteria,i=t.criteria;if(n!==i){if(n>i||void 0===n)return 1;if(n<i||void 0===i)return-1}return e.index-t.index}),"value")};var D=function(e,t){return function(n,i,a){var o=t?[[],[]]:{};return i=b(i,a),g.each(n,function(t,a){var s=i(t,a,n);e(o,t,s)}),o}};g.groupBy=D(function(e,t,n){E(e,n)?e[n].push(t):e[n]=[t]}),g.indexBy=D(function(e,t,n){e[n]=t}),g.countBy=D(function(e,t,n){E(e,n)?e[n]++:e[n]=1});var A=/[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;g.toArray=function(e){return e?g.isArray(e)?l.call(e):g.isString(e)?e.match(A):I(e)?g.map(e,g.identity):g.values(e):[]},g.size=function(e){return null==e?0:I(e)?e.length:g.keys(e).length},g.partition=D(function(e,t,n){e[n?0:1].push(t)},!0),g.first=g.head=g.take=function(e,t,n){return null==e||e.length<1?null==t?void 0:[]:null==t||n?e[0]:g.initial(e,e.length-t)},g.initial=function(e,t,n){return l.call(e,0,Math.max(0,e.length-(null==t||n?1:t)))},g.last=function(e,t,n){return null==e||e.length<1?null==t?void 0:[]:null==t||n?e[e.length-1]:g.rest(e,Math.max(0,e.length-t))},g.rest=g.tail=g.drop=function(e,t,n){return l.call(e,null==t||n?1:t)},g.compact=function(e){return g.filter(e,Boolean)};var j=function(e,t,n,i){for(var a=(i=i||[]).length,o=0,s=_(e);o<s;o++){var r=e[o];if(I(r)&&(g.isArray(r)||g.isArguments(r)))if(t)for(var c=0,l=r.length;c<l;)i[a++]=r[c++];else j(r,t,n,i),a=i.length;else n||(i[a++]=r)}return i};g.flatten=function(e,t){return j(e,t,!1)},g.without=y(function(e,t){return g.difference(e,t)}),g.uniq=g.unique=function(e,t,n,i){g.isBoolean(t)||(i=n,n=t,t=!1),null!=n&&(n=b(n,i));for(var a=[],o=[],s=0,r=_(e);s<r;s++){var c=e[s],l=n?n(c,s,e):c;t&&!n?(s&&o===l||a.push(c),o=l):n?g.contains(o,l)||(o.push(l),a.push(c)):g.contains(a,c)||a.push(c)}return a},g.union=y(function(e){return g.uniq(j(e,!0,!0))}),g.intersection=function(e){for(var t=[],n=arguments.length,i=0,a=_(e);i<a;i++){var o=e[i];if(!g.contains(t,o)){var s;for(s=1;s<n&&g.contains(arguments[s],o);s++);s===n&&t.push(o)}}return t},g.difference=y(function(e,t){return t=j(t,!0,!0),g.filter(e,function(e){return!g.contains(t,e)})}),g.unzip=function(e){for(var t=e&&g.max(e,_).length||0,n=Array(t),i=0;i<t;i++)n[i]=g.pluck(e,i);return n},g.zip=y(g.unzip),g.object=function(e,t){for(var n={},i=0,a=_(e);i<a;i++)t?n[e[i]]=t[i]:n[e[i][0]]=e[i][1];return n};var O=function(e){return function(t,n,i){n=b(n,i);for(var a=_(t),o=e>0?0:a-1;o>=0&&o<a;o+=e)if(n(t[o],o,t))return o;return-1}};g.findIndex=O(1),g.findLastIndex=O(-1),g.sortedIndex=function(e,t,n,i){for(var a=(n=b(n,i,1))(t),o=0,s=_(e);o<s;){var r=Math.floor((o+s)/2);n(e[r])<a?o=r+1:s=r}return o};var L=function(e,t,n){return function(i,a,o){var s=0,r=_(i);if("number"==typeof o)e>0?s=o>=0?o:Math.max(o+r,s):r=o>=0?Math.min(o+1,r):o+r+1;else if(n&&o&&r)return i[o=n(i,a)]===a?o:-1;if(a!=a)return(o=t(l.call(i,s,r),g.isNaN))>=0?o+s:-1;for(o=e>0?s:r-1;o>=0&&o<r;o+=e)if(i[o]===a)return o;return-1}};g.indexOf=L(1,g.findIndex,g.sortedIndex),g.lastIndexOf=L(-1,g.findLastIndex),g.range=function(e,t,n){null==t&&(t=e||0,e=0),n||(n=t<e?-1:1);for(var i=Math.max(Math.ceil((t-e)/n),0),a=Array(i),o=0;o<i;o++,e+=n)a[o]=e;return a},g.chunk=function(e,t){if(null==t||t<1)return[];for(var n=[],i=0,a=e.length;i<a;)n.push(l.call(e,i,i+=t));return n};var N=function(e,t,n,i,a){if(!(i instanceof t))return e.apply(n,a);var o=w(e.prototype),s=e.apply(o,a);return g.isObject(s)?s:o};g.bind=y(function(e,t,n){if(!g.isFunction(e))throw new TypeError("Bind must be called on a function");var i=y(function(a){return N(e,i,t,this,n.concat(a))});return i}),g.partial=y(function(e,t){var n=g.partial.placeholder,i=function(){for(var a=0,o=t.length,s=Array(o),r=0;r<o;r++)s[r]=t[r]===n?arguments[a++]:t[r];for(;a<arguments.length;)s.push(arguments[a++]);return N(e,i,this,this,s)};return i}),g.partial.placeholder=g,g.bindAll=y(function(e,t){var n=(t=j(t,!1,!1)).length;if(n<1)throw new Error("bindAll must be passed function names");for(;n--;){var i=t[n];e[i]=g.bind(e[i],e)}}),g.memoize=function(e,t){var n=function(i){var a=n.cache,o=""+(t?t.apply(this,arguments):i);return E(a,o)||(a[o]=e.apply(this,arguments)),a[o]};return n.cache={},n},g.delay=y(function(e,t,n){return setTimeout(function(){return e.apply(null,n)},t)}),g.defer=g.partial(g.delay,g,1),g.throttle=function(e,t,n){var i,a,o,s,r=0;n||(n={});var c=function(){r=!1===n.leading?0:g.now(),i=null,s=e.apply(a,o),i||(a=o=null)},l=function(){var l=g.now();r||!1!==n.leading||(r=l);var u=t-(l-r);return a=this,o=arguments,u<=0||u>t?(i&&(clearTimeout(i),i=null),r=l,s=e.apply(a,o),i||(a=o=null)):i||!1===n.trailing||(i=setTimeout(c,u)),s};return l.cancel=function(){clearTimeout(i),r=0,i=a=o=null},l},g.debounce=function(e,t,n){var i,a,o=function(t,n){i=null,n&&(a=e.apply(t,n))},s=y(function(s){if(i&&clearTimeout(i),n){var r=!i;i=setTimeout(o,t),r&&(a=e.apply(this,s))}else i=g.delay(o,t,this,s);return a});return s.cancel=function(){clearTimeout(i),i=null},s},g.wrap=function(e,t){return g.partial(t,e)},g.negate=function(e){return function(){return!e.apply(this,arguments)}},g.compose=function(){var e=arguments,t=e.length-1;return function(){for(var n=t,i=e[t].apply(this,arguments);n--;)i=e[n].call(this,i);return i}},g.after=function(e,t){return function(){if(--e<1)return t.apply(this,arguments)}},g.before=function(e,t){var n;return function(){return--e>0&&(n=t.apply(this,arguments)),e<=1&&(t=null),n}},g.once=g.partial(g.before,2),g.restArguments=y;var R=!{toString:null}.propertyIsEnumerable("toString"),C=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],K=function(e,t){var n=C.length,i=e.constructor,a=g.isFunction(i)&&i.prototype||s,o="constructor";for(E(e,o)&&!g.contains(t,o)&&t.push(o);n--;)(o=C[n])in e&&e[o]!==a[o]&&!g.contains(t,o)&&t.push(o)};g.keys=function(e){if(!g.isObject(e))return[];if(m)return m(e);var t=[];for(var n in e)E(e,n)&&t.push(n);return R&&K(e,t),t},g.allKeys=function(e){if(!g.isObject(e))return[];var t=[];for(var n in e)t.push(n);return R&&K(e,t),t},g.values=function(e){for(var t=g.keys(e),n=t.length,i=Array(n),a=0;a<n;a++)i[a]=e[t[a]];return i},g.mapObject=function(e,t,n){t=b(t,n);for(var i=g.keys(e),a=i.length,o={},s=0;s<a;s++){var r=i[s];o[r]=t(e[r],r,e)}return o},g.pairs=function(e){for(var t=g.keys(e),n=t.length,i=Array(n),a=0;a<n;a++)i[a]=[t[a],e[t[a]]];return i},g.invert=function(e){for(var t={},n=g.keys(e),i=0,a=n.length;i<a;i++)t[e[n[i]]]=n[i];return t},g.functions=g.methods=function(e){var t=[];for(var n in e)g.isFunction(e[n])&&t.push(n);return t.sort()};var F=function(e,t){return function(n){var i=arguments.length;if(t&&(n=Object(n)),i<2||null==n)return n;for(var a=1;a<i;a++)for(var o=arguments[a],s=e(o),r=s.length,c=0;c<r;c++){var l=s[c];t&&void 0!==n[l]||(n[l]=o[l])}return n}};g.extend=F(g.allKeys),g.extendOwn=g.assign=F(g.keys),g.findKey=function(e,t,n){t=b(t,n);for(var i,a=g.keys(e),o=0,s=a.length;o<s;o++)if(t(e[i=a[o]],i,e))return i};var q,M,U=function(e,t,n){return t in n};g.pick=y(function(e,t){var n={},i=t[0];if(null==e)return n;g.isFunction(i)?(t.length>1&&(i=x(i,t[1])),t=g.allKeys(e)):(i=U,t=j(t,!1,!1),e=Object(e));for(var a=0,o=t.length;a<o;a++){var s=t[a],r=e[s];i(r,s,e)&&(n[s]=r)}return n}),g.omit=y(function(e,t){var n,i=t[0];return g.isFunction(i)?(i=g.negate(i),t.length>1&&(n=t[1])):(t=g.map(j(t,!1,!1),String),i=function(e,n){return!g.contains(t,n)}),g.pick(e,i,n)}),g.defaults=F(g.allKeys,!0),g.create=function(e,t){var n=w(e);return t&&g.extendOwn(n,t),n},g.clone=function(e){return g.isObject(e)?g.isArray(e)?e.slice():g.extend({},e):e},g.tap=function(e,t){return t(e),e},g.isMatch=function(e,t){var n=g.keys(t),i=n.length;if(null==e)return!i;for(var a=Object(e),o=0;o<i;o++){var s=n[o];if(t[s]!==a[s]||!(s in a))return!1}return!0},q=function(e,t,n,i){if(e===t)return 0!==e||1/e==1/t;if(null==e||null==t)return!1;if(e!=e)return t!=t;var a=typeof e;return("function"===a||"object"===a||"object"==typeof t)&&M(e,t,n,i)},M=function(e,t,n,i){e instanceof g&&(e=e._wrapped),t instanceof g&&(t=t._wrapped);var a=u.call(e);if(a!==u.call(t))return!1;switch(a){case"[object RegExp]":case"[object String]":return""+e==""+t;case"[object Number]":return+e!=+e?+t!=+t:0==+e?1/+e==1/t:+e==+t;case"[object Date]":case"[object Boolean]":return+e==+t;case"[object Symbol]":return r.valueOf.call(e)===r.valueOf.call(t)}var o="[object Array]"===a;if(!o){if("object"!=typeof e||"object"!=typeof t)return!1;var s=e.constructor,c=t.constructor;if(s!==c&&!(g.isFunction(s)&&s instanceof s&&g.isFunction(c)&&c instanceof c)&&"constructor"in e&&"constructor"in t)return!1}i=i||[];for(var l=(n=n||[]).length;l--;)if(n[l]===e)return i[l]===t;if(n.push(e),i.push(t),o){if((l=e.length)!==t.length)return!1;for(;l--;)if(!q(e[l],t[l],n,i))return!1}else{var p,d=g.keys(e);if(l=d.length,g.keys(t).length!==l)return!1;for(;l--;)if(p=d[l],!E(t,p)||!q(e[p],t[p],n,i))return!1}return n.pop(),i.pop(),!0},g.isEqual=function(e,t){return q(e,t)},g.isEmpty=function(e){return null==e||(I(e)&&(g.isArray(e)||g.isString(e)||g.isArguments(e))?0===e.length:0===g.keys(e).length)},g.isElement=function(e){return!(!e||1!==e.nodeType)},g.isArray=d||function(e){return"[object Array]"===u.call(e)},g.isObject=function(e){var t=typeof e;return"function"===t||"object"===t&&!!e},g.each(["Arguments","Function","String","Number","Date","RegExp","Error","Symbol","Map","WeakMap","Set","WeakSet"],function(e){g["is"+e]=function(t){return u.call(t)==="[object "+e+"]"}}),g.isArguments(arguments)||(g.isArguments=function(e){return E(e,"callee")});var $=i.document&&i.document.childNodes;"object"!=typeof Int8Array&&"function"!=typeof $&&(g.isFunction=function(e){return"function"==typeof e||!1}),g.isFinite=function(e){return!g.isSymbol(e)&&isFinite(e)&&!isNaN(parseFloat(e))},g.isNaN=function(e){return g.isNumber(e)&&isNaN(e)},g.isBoolean=function(e){return!0===e||!1===e||"[object Boolean]"===u.call(e)},g.isNull=function(e){return null===e},g.isUndefined=function(e){return void 0===e},g.has=function(e,t){if(!g.isArray(t))return E(e,t);for(var n=t.length,i=0;i<n;i++){var a=t[i];if(null==e||!p.call(e,a))return!1;e=e[a]}return!!n},g.noConflict=function(){return i._=a,this},g.identity=function(e){return e},g.constant=function(e){return function(){return e}},g.noop=function(){},g.property=function(e){return g.isArray(e)?function(t){return S(t,e)}:k(e)},g.propertyOf=function(e){return null==e?function(){}:function(t){return g.isArray(t)?S(e,t):e[t]}},g.matcher=g.matches=function(e){return e=g.extendOwn({},e),function(t){return g.isMatch(t,e)}},g.times=function(e,t,n){var i=Array(Math.max(0,e));t=x(t,n,1);for(var a=0;a<e;a++)i[a]=t(a);return i},g.random=function(e,t){return null==t&&(t=e,e=0),e+Math.floor(Math.random()*(t-e+1))},g.now=Date.now||function(){return(new Date).getTime()};var H={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},B=g.invert(H),z=function(e){var t=function(t){return e[t]},n="(?:"+g.keys(e).join("|")+")",i=RegExp(n),a=RegExp(n,"g");return function(e){return e=null==e?"":""+e,i.test(e)?e.replace(a,t):e}};g.escape=z(H),g.unescape=z(B),g.result=function(e,t,n){g.isArray(t)||(t=[t]);var i=t.length;if(!i)return g.isFunction(n)?n.call(e):n;for(var a=0;a<i;a++){var o=null==e?void 0:e[t[a]];void 0===o&&(o=n,a=i),e=g.isFunction(o)?o.call(e):o}return e};var W=0;g.uniqueId=function(e){var t=++W+"";return e?e+t:t},g.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var V=/(.)^/,J={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},G=/\\|'|\r|\n|\u2028|\u2029/g,Y=function(e){return"\\"+J[e]};g.template=function(e,t,n){!t&&n&&(t=n),t=g.defaults({},t,g.templateSettings);var i,a=RegExp([(t.escape||V).source,(t.interpolate||V).source,(t.evaluate||V).source].join("|")+"|$","g"),o=0,s="__p+='";e.replace(a,function(t,n,i,a,r){return s+=e.slice(o,r).replace(G,Y),o=r+t.length,n?s+="'+\n((__t=("+n+"))==null?'':_.escape(__t))+\n'":i?s+="'+\n((__t=("+i+"))==null?'':__t)+\n'":a&&(s+="';\n"+a+"\n__p+='"),t}),s+="';\n",t.variable||(s="with(obj||{}){\n"+s+"}\n"),s="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+s+"return __p;\n";try{i=new Function(t.variable||"obj","_",s)}catch(e){throw e.source=s,e}var r=function(e){return i.call(this,e,g)},c=t.variable||"obj";return r.source="function("+c+"){\n"+s+"}",r},g.chain=function(e){var t=g(e);return t._chain=!0,t};var X=function(e,t){return e._chain?g(t).chain():t};g.mixin=function(e){return g.each(g.functions(e),function(t){var n=g[t]=e[t];g.prototype[t]=function(){var e=[this._wrapped];return c.apply(e,arguments),X(this,n.apply(g,e))}}),g},g.mixin(g),g.each(["pop","push","reverse","shift","sort","splice","unshift"],function(e){var t=o[e];g.prototype[e]=function(){var n=this._wrapped;return t.apply(n,arguments),"shift"!==e&&"splice"!==e||0!==n.length||delete n[0],X(this,n)}}),g.each(["concat","join","slice"],function(e){var t=o[e];g.prototype[e]=function(){return X(this,t.apply(this._wrapped,arguments))}}),g.prototype.value=function(){return this._wrapped},g.prototype.valueOf=g.prototype.toJSON=g.prototype.value,g.prototype.toString=function(){return String(this._wrapped)},void 0===(n=function(){return g}.apply(t,[]))||(e.exports=n)}()}).call(this,n(164)(e))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e}},function(e,t,n){"use strict";const{CompositeDisposable:i}=n(0),{flatten:a,compact:o}=n(1),s=n(20),r=n(166),c={python:["py"],javascript:["js"]};e.exports=class{init(e){return this.Kite=e,this.subscriptions=new i,this.kiteEditorByEditorID=[],this.pathSubscriptionsByEditorID={},this.subscriptions.add(atom.workspace.observeTextEditors(e=>{if(this.isGrammarSupported(e)&&this.subscribeToEditor(e),!this.pathSubscriptionsByEditorID[e.id]){const t=new i,n=()=>{t.dispose(),delete this.pathSubscriptionsByEditorID[e.id],this.subscriptions.remove(t)};this.subscriptions.add(t),t.add(e.onDidChangePath(()=>{this.isGrammarSupported(e)?this.subscribeToEditor(e):this.hasEditorSubscription(e)&&this.unsubscribeFromEditor(e)})),t.add(e.onDidDestroy(()=>n())),this.pathSubscriptionsByEditorID[e.id]=t}})),s.getSupportedLanguages().then(e=>{this.supportedLanguages=e})}dispose(){delete this.kiteEditorByEditorID,this.subscriptions&&this.subscriptions.dispose()}subscribeToEditor(e){if(!this.hasEditorSubscription(e)){const t=new r(e);this.kiteEditorByEditorID[e.id]=t,this.subscriptions.add(t);const n=e.onDidDestroy(()=>{this.unsubscribeFromEditor(e),this.subscriptions.remove(n)});this.subscriptions.add(n)}}unsubscribeFromEditor(e){if(!this.hasEditorSubscription(e))return;const t=this.kiteEditorByEditorID[e.id];t.dispose(),this.subscriptions.remove(t),delete this.kiteEditorByEditorID[e.id]}hasEditorSubscription(e){return null!=this.kiteEditorForEditor(e)}kiteEditorForEditor(e){return e&&this.kiteEditorByEditorID&&this.kiteEditorByEditorID[e.id]}getSupportedLanguages(){return this.supportedLanguages}hasSupportedFileOpen(){return atom.workspace.getTextEditors().some(e=>this.isGrammarSupported(e))}hasActiveSupportedFile(){const e=atom.workspace.getActiveTextEditor();return e&&this.isGrammarSupported(e)}isGrammarSupported(e){return e&&(this.supportedLanguages?new RegExp(this.getSupportedLanguagesRegExp(this.supportedLanguages)).test(e.getPath()||""):/\.py$/.test(e.getPath()||""))}getSupportedLanguagesRegExp(e){return`.(${o(a(e.map(e=>c[e]))).join("|")})$`}getEditorsForPath(e){return atom.workspace.getPaneItems().filter(t=>t&&t.getURI&&t.getURI()===e)}}},function(e,t,n){"use strict";let i,a,o,s,r,c,l,u,p;e.exports=class{constructor(e){this.editor=e,this.buffer=e.getBuffer(),this.editorElement=atom.views.getView(e),this.fixesHistory=[],this.subscribeToEditor(e)}dispose(){this.subscriptions&&this.subscriptions.dispose(),delete this.subscriptions,delete this.editorElement,delete this.editor,delete this.buffer}subscribeToEditor(e){u||(({CompositeDisposable:u}=n(0)),({screenPositionForMouseEvent:c,pixelPositionForMouseEvent:l}=n(1)),s=n(167),a=n(20),r=n(170));const t=new u;this.subscriptions=t,this.events=new r(e),t.add(this.events);const p=atom.workspace.getActiveTextEditor();p&&e!==p||this.events.focus(),this.hoverGesture=new s(e,{ignoredSelector:"atom-overlay, atom-overlay *"}),t.add(this.hoverGesture),t.add(this.hoverGesture.onDidActivate(({position:t})=>{atom.config.get("kite.enableHoverUI")&&(o||(o=n(24)),o.showHoverAtPositionWithDelay(e,t),o.setWordHoverActive(!0))})),t.add(this.hoverGesture.onDidDeactivate(()=>{atom.config.get("kite.enableHoverUI")&&(o||(o=n(24)),o.setWordHoverActive(!1))})),t.add(e.onDidChangeCursorPosition(()=>{i||(i=n(21)),atom.config.get("kite.enableHoverUI")&&(o||(o=n(24)),o.setWordHoverActive(!1))}))}expandPosition(e){p||(p=n(12)),a.getHoverDataAtPosition(this.editor,e).then(e=>{const[t]=e.symbol;t&&t.id&&this.expandId(t.id)})}expandId(e){atom.applicationDelegate.openExternal(`kite://docs/${encodeURI(e)}`)}openDefinitionForId(e){return a.getValueReportDataForId(e).then(e=>this.openDefinition(e.report.definition))}openDefinitionAtRange(e){const t=this.tokensList.tokenAtRange(e);return this.openTokenDefinition(t)}openDefinitionAtPosition(e){const t=this.tokensList.tokenAtPosition(e);return this.openTokenDefinition(t)}openDefinition(e){return p||(p=n(12)),""===e.filename.trim()?Promise.resolve(!1):new Promise((t,n)=>(p.featureRequested("definition"),!!e&&atom.workspace.open(e.filename).then(t=>(p.featureFulfilled("definition"),t.setCursorBufferPosition([e.line-1,e.column?e.column-1:0],{autoscroll:!0}),!0))))}screenPositionForMouseEvent(e){return c(this.editorElement,e)}pixelPositionForMouseEvent(e){return l(this.editorElement,e)}}},function(e,t,n){"use strict";const{CompositeDisposable:i}=n(0),a=n(168),{DisposableEvent:o,isWithinTextOfLine:s}=n(1);e.exports=class extends a{constructor(e,t){super(e,t),this.registerEvents()}dispose(){super.dispose(),this.subscriptions.dispose()}registerEvents(){this.subscriptions=new i,this.subscriptions.add(new o(document,"mouseout",e=>{const t=e.relatedTarget||e.toElement;t&&"HTML"!=t.nodeName||this.deactivate()})),this.subscriptions.add(new o(this.editorElement,"mousemove",e=>{if(!this.matchesModifiers(e))return void this.deactivate();if(e.target.matches(this.options.ignoredSelector))return;const t=this.wordRangeForMouseEvent(event);t&&this.lastRange&&!this.lastRange.isEqual(t)&&!t.isEmpty()?s(this.editorElement,event)&&this.activate({position:this.screenPositionForMouseEvent(event),range:t}):t&&!t.isEmpty()||this.deactivate(),this.lastRange=t}))}}},function(e,t,n){"use strict";const{Range:i}=n(0),a=n(169),o=n(43),{screenPositionForMouseEvent:s}=n(1);e.exports=class extends a{constructor(e,t){super(e,t)}matchesModifiers(e){return e.altKey==!!this.options.altKey&&e.ctrlKey==!!this.options.ctrlKey&&e.shiftKey==!!this.options.shiftKey&&e.metaKey==!!this.options.metaKey}screenPositionForMouseEvent(e){return s(this.editorElement,e)}wordRangeForMouseEvent(e){const t=s(this.editorElement,e);if(t){const e=new o(this.editor);return e.setScreenPosition(t),i.fromObject(e.getCurrentWordBufferRange({includeNonWordCharacters:!1}))}return null}}},function(e,t,n){"use strict";const{Emitter:i}=n(0);e.exports=class{constructor(e,t){this.editor=e,this.buffer=e.getBuffer(),this.editorElement=atom.views.getView(e),this.options=t||{},this.emitter=new i}dispose(){this.emitter.dispose()}pause(){this.paused=!0}resume(){this.paused=!1}isActive(){return this.active}activate(e){this.active&&this.deactivate(),this.active=!0,this.paused||this.emitter.emit("did-activate",e)}deactivate(e){this.active&&(this.active=!1,this.paused||this.emitter.emit("did-deactivate",e))}onDidActivate(e){return this.emitter.on("did-activate",e)}onDidDeactivate(e){return this.emitter.on("did-deactivate",e)}}},function(e,t,n){"use strict";const{CompositeDisposable:i}=n(0),a=n(11),{MAX_FILE_SIZE:o,MAX_PAYLOAD_SIZE:s}=n(44),{DisposableEvent:r}=n(1),{version:c}=n(12);let l;e.exports=class{constructor(e){l||(l=n(21)),this.editor=e,this.subscriptions=new i,this.pendingEvents=[],this.subscriptions.add(e.onDidChange(e=>{this.send("edit")})),this.subscriptions.add(e.onDidChangeSelectionRange(()=>{this.send("selection")}));const t=atom.views.getView(this.editor);let a;this.subscriptions.add(new r(t,"mousedown",()=>{a=t.hasFocus()})),this.subscriptions.add(new r(t,"focus",()=>{a||this.focus(),a=null}))}focus(){return this.send("focus")}dispose(){delete this.editor,this.subscriptions.dispose()}reset(){clearTimeout(this.timeout),this.pendingEvents=[]}send(e){return this.pendingPromise||(this.pendingPromise=new Promise((e,t)=>{this.pendingPromiseResolve=e,this.pendingPromiseReject=t})),this.pendingEvents.push(e),clearTimeout(this.timeout),this.timeout=setTimeout(()=>this.mergeEvents(),0),this.pendingPromise.catch(e=>{})}mergeEvents(){if(!this.editor)return;let e=this.pendingEvents.filter(e=>"focus"===e)[0],t=this.pendingEvents.some(e=>"edit"===e)?"edit":this.pendingEvents.pop();this.reset();const n=JSON.stringify(this.buildEvent(t));if(n.length>s)return this.reset();let i=Promise.resolve();return e&&t!==e&&(i=i.then(()=>a.request({path:"/clientapi/editor/event",method:"POST"},JSON.stringify(this.buildEvent(e))))),i.then(()=>a.request({path:"/clientapi/editor/event",method:"POST"},n)).then(e=>{this.pendingPromiseResolve(e)}).catch(e=>{this.pendingPromiseReject&&this.pendingPromiseReject(e)}).then(()=>{delete this.pendingPromise,delete this.pendingPromiseResolve,delete this.pendingPromiseReject})}buildEvent(e){let t=this.editor.getText();const n=this.editor.getCursorBufferPosition(),i=this.editor.getBuffer().characterIndexForPosition(n);return t&&t.length>o&&(e="skip",t=""),this.makeEvent(e,this.editor.getPath(),t,"skip"===e?0:i)}makeEvent(e,t,n,i){return{source:"atom",action:e,filename:t,text:n,selections:[{start:i,end:i}],editor_version:atom.getVersion(),plugin_version:c}}}},function(e,t,n){"use strict";n(45);const{Point:i,CompositeDisposable:a}=n(0),{symbolName:o,symbolType:s}=n(32),{internalGotoURL:r}=n(70),{debugData:c,wrapAfterParenthesisAndDots:l}=n(72),{DisposableEvent:u,idToDottedPath:p}=n(1);let d;e.exports=class extends HTMLElement{static initClass(){return customElements.define("kite-hover",this),this}disconnectedCallback(){this.subscriptions&&this.subscriptions.dispose()}connectedCallback(){this.classList.add("native-key-bindings"),this.setAttribute("tabindex","-1")}setData(e,t,m){if(m=i.fromObject(m),e&&e.symbol&&e.symbol.length){const[t]=e.symbol,i=[];e.report.definition&&e.report.definition.filename&&""!==e.report.definition.filename.trim()&&i.push(`<a\n        href="${r(e.report.definition)}">Def<span class="kite-link-icon">&#8619;</span></a>`),i.push(`<a href="kite-atom-internal://open-search-docs/${p(t.id)}">Docs<span class="kite-link-icon">&#8663;</span></a>`),this.innerHTML=`\n    <div class="definition">\n      <kite-logo small title="Powered by Kite" class="badge"></kite-logo>\n      <span class="name"><code>${l(o(t))}</code></span>\n      <span class="type">&#10098; ${s(t)} &#10099;</span>\n      <kite-links metric="Hover">\n        ${i.join(" ")}\n      </kite-links>\n    </div>\n    ${c(e)}`,this.subscriptions=new a;const m=this.querySelector("kite-links"),h=this.querySelector(".debug");h&&this.subscriptions.add(new u(h,"mousewheel",e=>{e.stopPropagation()})),m&&this.subscriptions.add(m.onDidClickMoreLink(()=>{d||(d=n(24)),d.dismiss()}))}else this.innerHTML=""}}.initClass()},function(e,t,n){"use strict";const{CompositeDisposable:i,Disposable:a,TextEditor:o}=n(0),s=n(11),r=n(67),{MAX_FILE_SIZE:c}=n(44);n(73);const{STATES:l}=s,u={[l.UNSUPPORTED]:"Kite only supports macOS, Windows, and Ubuntu at the moment.",[l.UNINSTALLED]:"Kite is not installed.",[l.INSTALLED]:"Kite is not running.",[l.RUNNING]:"Kite is running but not reachable.",[l.READY]:"Kite is ready.",sizeExceedsLimit:"The current file is too large for Kite to handle",indexing:"Kite engine is indexing your code",syncing:"Kite engine is syncing your code"},p={[l.UNSUPPORTED]:"unsupported",[l.UNINSTALLED]:"uninstalled",[l.INSTALLED]:"installed",[l.RUNNING]:"running",[l.READY]:"ready"},d={[l.UNSUPPORTED]:"",[l.UNINSTALLED]:"Kite: not installed",[l.INSTALLED]:"Kite: not running",[l.RUNNING]:"",[l.READY]:""};e.exports=class{constructor(){this.element=document.createElement("div"),this.element.className="kite-status",this.element.setAttribute("status","unknown"),this.element.innerHTML='<kite-logo small class="badge"></kite-logo>\n                      <kite-logo sync></kite-logo>\n                      <span class="text"></span>',this.element.classList.add("inline-block"),this.tooltipText="",this.statusText=this.element.querySelector(".text")}init(e){this.subscriptions=new i,this.editors=e.getModule("editors"),this.editors&&(this.subscriptions.add(atom.tooltips.add(this.element,{title:()=>this.tooltipText})),this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(e=>{e instanceof o&&this.editors.isGrammarSupported(e)?this.startPolling():this.stopPolling()})),this.editors.isGrammarSupported(atom.workspace.getActiveTextEditor())&&this.startPolling())}dispose(){this.subscriptions&&this.subscriptions.dispose(),delete this.subscriptions}getElement(){return this.element}startPolling(){const e=setInterval(()=>this.pollStatus(),atom.config.get("kite.pollingInterval"));return this.pollingDisposable=new a(()=>{clearInterval(e)}),this.subscriptions.add(this.pollingDisposable),this.pollStatus()}stopPolling(){return this.pollingDisposable&&(this.subscriptions.remove(this.pollingDisposable),this.pollingDisposable.dispose()),this.pollStatus()}pollStatus(){if(this.isPolling)return this.pollPromise;if(this.isPolling=!0,this.editors.hasActiveSupportedFile()){const e=atom.workspace.getActiveTextEditor();this.pollPromise=s.requestJSON({path:r.statusPath(e.getPath())}).then(t=>{this.element.removeAttribute("is-syncing"),this.element.removeAttribute("is-indexing"),this.statusText.innerHTML=d[l.READY],this.element.setAttribute("status",p[l.READY]),"indexing"===t.status?(this.element.setAttribute("is-indexing",""),this.tooltipText=u.indexing):"syncing"===t.status?(this.element.setAttribute("is-syncing",""),this.tooltipText=u.syncing):this.fileExceedsMaxSize(e)?this.tooltipText=u.sizeExceedsLimit:this.tooltipText=u[l.READY]}).catch(e=>{const{state:t}=e.data;this.element.removeAttribute("is-syncing"),this.element.removeAttribute("is-indexing"),null!=t?(this.tooltipText=u[t],this.statusText.innerHTML=d[t],this.element.setAttribute("status",p[t])):(this.element.setAttribute("status","unsupported"),this.statusText.innerHTML="",this.tooltipText="")})}else this.element.removeAttribute("is-syncing"),this.element.removeAttribute("is-indexing"),this.element.setAttribute("status","unsupported"),this.tooltipText="",this.statusText.innerHTML="",this.pollPromise=Promise.resolve();return this.pollPromise=this.pollPromise.then(()=>{this.isPolling=!1}),this.pollPromise}fileExceedsMaxSize(e){return e.getBuffer().getLength()>c}}},function(e,t,n){"use strict";n(73);const{CompositeDisposable:i,TextEditor:a}=n(0),{DisposableEvent:o,addDelegatedEventListener:s,parent:r,delayPromise:c}=n(1),l=n(11),{retryPromise:u}=n(66),p=n(46),d=n(20),{MAX_FILE_SIZE:m}=n(44),{STATES:h}=l,f='<span class="dot">•</span>';e.exports=class extends HTMLElement{static initClass(){return customElements.define("kite-status-panel",this),this}setApp(e){this.app=e}hide(){this.parentNode&&(this.parentNode.removeChild(this),this.subscriptions.dispose())}pendingStatus(e){const t=this.querySelector(".status");t&&(t.innerHTML=`\n      ${e}\n      <span class='loading loading-spinner-small inline-block'></span>\n      `)}show(e){return this.renderCurrent().then(()=>{document.body.appendChild(this),this.setPosition(e),this.scheme=new p("kite-atom-internal",this),this.subscriptions=new i;const t=this.querySelector("kite-links");if(t){const e=t.onDidClickActionLink(()=>{this.hide()});e&&this.subscriptions.disposed&&this.subscriptions.add(e)}this.subscriptions.add(this.scheme),this.subscriptions.add(this.scheme.onDidClickLink(e=>this.handleAction(e))),this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(t=>{t instanceof a&&this.renderCurrent().then(()=>this.setPosition(e))})),this.subscriptions.add(s(this,"click",'.kite-warning-box [data-method="post"]',e=>{const t=e.target,n=r(t,".kite-warning-box");t.innerHTML="<span class='loading loading-spinner-tiny inline-block'></span>",t.style.pointerEvents="none",l.request({path:"/api/account/resendVerification",method:t.getAttribute("data-method")}).then(e=>{n.classList.remove("kite-warning-box"),n.classList.add("kite-info-box"),n.textContent=t.getAttribute("data-confirmation")}).catch(e=>{n.innerHTML=t.getAttribute("data-failure")})})),this.subscriptions.add(new o(window,"resize",t=>{this.setPosition(e)})),this.subscriptions.add(new o(document.body,"click",e=>{const{top:t,left:n,right:i,bottom:a}=this.getBoundingClientRect(),{pageX:o,pageY:s}=e;this.starting||this.installing||!(o<n||o>i||s<t||s>a)||this.hide()}))})}pauseNotifications(){this.app.kite&&this.app.kite.notifications.pauseNotifications()}resumeNotifications(){this.app.kite&&this.app.kite.notifications.resumeNotifications()}handleAction({url:e}){let t;switch(this.pauseNotifications(),e.host){case"open-account-web":atom.applicationDelegate.openExternal("http://localhost:46624/clientapi/desktoplogin?d=/settings/account"),this.hide();break;case"open-copilot-settings":this.app.copilotSettings(),this.hide();break;case"open-copilot-permissions":atom.applicationDelegate.openExternal(`kite://settings/permissions${e.path||""}`);break;case"install":this.pendingStatus("Installing Kite"),this.installing=!0,t=this.app.install().then(()=>this.app.start()).then(()=>u(()=>l.isUserAuthenticated(),10,500)).catch(e=>{if(4!==e.data)throw e}).then(()=>{this.installing=!1}).catch(()=>{this.installing=!1}).then(()=>this.renderCurrent());break;case"start":this.pendingStatus("Launching Kite"),this.starting=!0,t=this.app.start().then(()=>u(()=>l.isUserAuthenticated(),10,500)).then(()=>{this.starting=!1}).catch(()=>{this.starting=!1}).then(()=>this.renderCurrent());break;case"start-enterprise":this.pendingStatus("Launching Kite"),this.starting=!0,t=this.app.startEnterprise().then(()=>c(()=>Promise.resolve(),3e3)).then(()=>{this.starting=!1}).catch(()=>{this.starting=!1}).then(()=>this.renderCurrent());break;case"login":this.app.login(),this.hide()}t?t.then(()=>this.renderCurrent()).then(()=>this.resumeNotifications()).catch(e=>console.error(e)):this.resumeNotifications()}setPosition(e){if(!e)return;const t=e.getBoundingClientRect();this.style.cssText=`\n    top: ${Math.round(t.top-20)}px;\n    left: ${Math.round(t.right)}px;\n    `}renderCurrent(){if(this.installing||this.starting)return Promise.resolve();const e=atom.workspace.getActiveTextEditor(),t=[l.checkHealth().then(e=>Promise.all([l.isKiteInstalled().then(()=>!0,()=>!1),l.isKiteEnterpriseInstalled().then(()=>!0,()=>!1)]).then(([t,n])=>({state:e,kiteInstalled:t,kiteEnterpriseInstalled:n}))),d.getUserAccountInfo().catch(()=>{}),d.getStatus(e),d.isUserAuthenticated().catch(()=>{})];return Promise.all(t).then(e=>{this.render(...e)})}render(e,t,n,i){this.innerHTML=`\n      ${this.renderSubscription(e)}\n      ${this.renderLinks(t)}\n      ${this.renderStatus(e,n,i)}\n    `}renderLinks(e){return`\n    <kite-links emit-action="true">\n    <ul class="links ${e?"has-account":"no-account"}">\n      <li><a class="icon icon-search" href="kite-atom-internal://open-search-docs">Search Python Docs</a></li>\n      <li><a class="icon icon-question" href="kite-atom-internal://open-kite-plugin-help">Help</a></li>\n    </ul>\n    <ul class="links ${e?"has-account":"no-account"}">\n      <li><a class="icon icon-settings" href="kite-atom-internal://open-settings">Atom Plugin Settings</a></li>\n      <li><a class="icon icon-settings"\n             href="kite-atom-internal://open-copilot-settings">Kite Engine Settings</a></li>\n    </ul>\n    </kite-links>\n    `}renderStatus(e,t,n){let i="";switch(e.state){case h.UNSUPPORTED:i=`<div class="text-danger">Kite engine is not available on your system ${f}</div>`;break;case h.UNINSTALLED:i=`\n          <div class="text-danger">Kite engine is not installed ${f}</div>\n          <a href="https://kite.com/download" class="btn btn-error">Install now</a>\n        `;break;case h.INSTALLED:i=l.hasManyKiteInstallation()||l.hasManyKiteEnterpriseInstallation()?`<div class="text-danger">Kite engine is not running ${f}<br/>\n          You have multiple versions of Kite installed. Please launch your desired one.</div>`:e.kiteInstalled&&e.kiteEnterpriseInstalled?`\n          <div class="text-danger">Kite engine is not running ${f}<br/>\n          Which version of kite do you want to launch?</div>\n          <a href="kite-atom-internal://start-enterprise"\n             class="btn btn-purple">Launch Kite Enterprise</a><br/>\n          <a href="kite-atom-internal://start" class="btn btn-info">Launch Kite cloud</a>`:e.kiteInstalled?`<div class="text-danger">Kite engine is not running ${f}</div>\n          <a href="kite-atom-internal://start" class="btn btn-error">Launch now</a>`:`<div class="text-danger">Kite engine is not running ${f}</div>\n          <a href="kite-atom-internal://start-enterprise" class="btn btn-error">Launch now</a>`;break;case h.RUNNING:i='\n          <div class="text-danger">Kite engine is not reachable</div>\n        ';break;case h.READY:const a=atom.workspace.getActiveTextEditor();if(a)if(this.app.kite.getModule("editors").isGrammarSupported(a))if(a&&a.getText().length>=m)i=`\n            <div class="text-warning">The current file is too large for Kite to handle ${f}</div>`;else switch(t.status){case"":case"ready":i=`<div class="ready">Kite engine is ready and working ${f}</div>`;break;case"indexing":i=`<div class="ready">Kite engine is indexing your code ${f}</div>`;break;case"syncing":i=`<div class="ready">Kite engine is syncing your code ${f}</div>`}else i=`<div>Open a supported file to see Kite's status ${f}</div>`;else i=`<div>Open a supported file to see Kite's status ${f}</div>`;n||(i=`\n          <div>\n            Kite engine is not logged in\n            <a href="kite-atom-internal://open-copilot-settings" class="btn">Login now</a>\n          </div>\n          ${i}`)}return`<div class="status">${i}</div>`}renderSubscription(e){return`<div class="split-line subscription">\n      <div class="left"><kite-logo small></kite-logo></div>\n      <div class="right">${e.state>=h.READY?'<a href="kite-atom-internal://open-account-web">Account</a>':""}</div>\n    </div>`}}.initClass()},function(e,t,n){"use strict";const i=n(20),a=n(175),{delayPromise:o}=n(1);let s;const r={selector:".source.python, .source.js",disableForSelector:[".source.python .comment",".source.js .comment"].join(", "),inclusionPriority:5,suggestionPriority:5,excludeLowerPriority:!1,getSuggestions(e){return s||(s=n(21)),s.getModule("editors").isGrammarSupported(e.editor)?o(()=>{let t=Promise.resolve();const n=e.editor.getCursorBufferPosition();return this.isInsideFunctionCall(e.editor,n)||this.isInsideFunctionCallBrackets(e.editor,n)?t=t.then(()=>this.loadSignature(e)):this.isSignaturePanelVisible()?t=t.then(()=>this.loadSignature(e)):this.clearSignature(),atom.config.get("kite.enableCompletions",!1)?atom.config.get("kite.enableSnippets")?t.then(()=>i.getSnippetCompletionsAtPosition(e.editor)):t.then(()=>i.getCompletionsAtPosition(e.editor,e.editor.getCursorBufferPosition())).then(t=>" "===e.prefix?t.map(e=>(e.replacementPrefix="",e)):t).then(t=>(t.forEach(t=>{t.replacementPrefix||e.prefix!==t.text||(t.replacementPrefix=t.text)}),t)):t.then(()=>[])},0):Promise.resolve()},isInsideFunctionCall(e,t){const n=e.scopeDescriptorForBufferPosition(t);return parseFloat(atom.getVersion())<=1.23?n.scopes.some(e=>/(function|method)-call|arguments/.test(e)):n.scopes.some(e=>/(function|method)-call\.arguments/.test(e))},isOnFunctionCallBrackets:(e,t)=>e.scopeDescriptorForBufferPosition(t).scopes.some(e=>/arguments(.*)\.bracket/.test(e)),isInsideFunctionCallBrackets(e,t){const n=e.getTextInBufferRange([[t.row,t.column-1],[t.row,t.column]]),i=e.getTextInBufferRange([[t.row,t.column],[t.row,t.column+1]]);return this.isOnFunctionCallBrackets(e,t)&&(/\(/.test(n)||/\)/.test(i))},loadSignature({editor:e,position:t}){return i.getSignaturesAtPosition(e,t||e.getCursorBufferPosition()).then(e=>{if(e){const t=this.getSuggestionsListElement();t.maxVisibleSuggestions=atom.config.get("kite.maxVisibleSuggestionsAlongSignature");const n=null==this.signaturePanel;this.signaturePanel=this.signaturePanel||new a,this.signaturePanel.setListElement(t),this.signaturePanel.setData(e,!1);const i=t.element?t.element:t;(n||this.sigPanelNeedsReinsertion(i))&&(i.style.width=null,i.appendChild(this.signaturePanel))}else this.clearSignature();return null!=e}).catch(e=>(this.clearSignature(),!1))},sigPanelNeedsReinsertion:e=>!e.querySelector("kite-signature"),clearSignature(){this.isSignaturePanelVisible()&&this.signaturePanel.parentNode.removeChild(this.signaturePanel)},isSignaturePanelVisible(){const e=this.getSuggestionsListElement(),t=e.element||e;return t&&t.querySelector("kite-signature")},getSuggestionsListElement(){if(!atom.packages.getAvailablePackageNames().includes("autocomplete-plus"))return null;if(this.suggestionListElement)return this.suggestionListElement;const e=atom.packages.getActivePackage("autocomplete-plus").mainModule;if(!e||!e.autocompleteManager||!e.autocompleteManager.suggestionList)return null;const t=e.autocompleteManager.suggestionList;return this.suggestionListElement=t.suggestionListElement?t.suggestionListElement:atom.views.getView(e.autocompleteManager.suggestionList),this.suggestionListElement.ol||this.suggestionListElement.renderList(),this.suggestionListElement}};e.exports=r},function(e,t,n){"use strict";const{CompositeDisposable:i}=n(0),{head:a,DisposableEvent:o,detailLang:s,detailGet:r,getFunctionDetails:c,idToDottedPath:l}=n(1),{valueLabel:u,valueName:p,callSignature:d,returnTypes:m}=n(32),{highlightCode:h,wrapAfterParenthesis:f,debugData:g,renderParameter:v}=n(72);e.exports=class extends HTMLElement{static initClass(){return customElements.define("kite-signature",this),this}setListElement(e){this.listElement=e}disconnectedCallback(){this.subscriptions&&this.subscriptions.dispose(),this.listElement.maxVisibleSuggestions=atom.config.get("autocomplete-plus.maxVisibleSuggestions"),this.resizeObserver.disconnect(),this.style.maxWidth="",this.parentNode&&this.parentNode.removeChild(this)}connectedCallback(){this.listElement.maxVisibleSuggestions=this.compact?atom.config.get("autocomplete-plus.maxVisibleSuggestions"):atom.config.get("kite.maxVisibleSuggestionsAlongSignature");const e=this.parentNode;let t;this.resizeObserver=new ResizeObserver(([{contentRect:n}])=>{t||(t=!0,requestAnimationFrame(()=>{const n=e.querySelector("ol:not(:empty)");if(n){const e=n.getBoundingClientRect();e.width>=this.offsetWidth?this.style.maxWidth=e.width+"px":this.style.maxWidth=""}t=!1}))}),e instanceof Element&&this.resizeObserver.observe(e),requestAnimationFrame(()=>this.checkWidth())}setData(e,t=!1){const n=a(e.calls),x=n.func_name||p(n.callee),b=c(n.callee);let y="";this.removeAttribute("compact");let w="";"python"===s(b)&&r(b,"kwarg_parameters")&&(w=`<section class="kwargs ${atom.config.get("kite.signatureKwargsVisible")?"visible":""}">\n      <h4><span class="title">**${r(b,"kwarg").name}<span class="kwargs-toggle">&#8613;</span></span></h4>\n      <kite-links metric="Signature">\n      <dl>\n      ${r(b,"kwarg_parameters").map((e,t)=>v(e,"",r(n,"in_kwargs")&&n.arg_index===t)).join("")}\n      </dl></kite-links>\n      </section>`);{let e="";const t=atom.config.get("kite.signaturePopularPatternsVisible");n.signatures&&n.signatures.length&&(e=`\n          <section class="patterns ${t?"visible":""}">\n          <h4><span class="title">How others used this<span class="popular-patterns-toggle">&#8613;</span></span></h4>\n          ${h(f(n.signatures.map(e=>d(e)).map(e=>`${x}(${e})`).join("\n")))}\n          </section>`);const i=[`<a class="kite-link docs" href="kite-atom-internal://open-search-docs/${l(n.callee.id)}">Docs<span class="kite-link-icon">&#8663;</span></a>`];t||i.unshift('<a class="kite-link patterns" href="#">Examples<span class="kite-link-icon">&#8615;</span></a>'),y=`\n      ${w}\n      ${e}\n      <kite-links class="one-line footer-links" metric="Signature">\n        ${i.join(" ")}\n        <div class="flex-separator"></div>\n        <kite-logo small title="Powered by Kite" class="badge"></kite-logo>\n      </kite-links>\n      `}const k=m(n.callee);this.innerHTML=`\n    <div class="kite-signature-wrapper">\n      <div class="name"><pre>${u(n.callee,r(n,"in_kwargs")?-1:n.arg_index)}${k?` &#8614; ${k}`:""}</pre></div>\n      ${y}\n    </div>\n    ${g(e)}\n    `,this.subscriptions&&this.subscriptions.dispose(),this.compact=!0,this.currentIndex=n.arg_index,this.subscriptions=new i;const E=this.querySelector("section.kwargs kite-links"),S=this.querySelector("kite-links.footer-links");let P=this.querySelector("kite-links.footer-links a.kite-link.patterns");P||((P=document.createElement("a")).className="kite-link patterns",P.setAttribute("href","#"),P.innerHTML='Examples<span class="kite-link-icon">&#8615;</span>');const _=this.querySelector("kite-links.footer-links a.kite-link.docs"),I=this.querySelector("a.kwargs"),T=this.querySelector("section.kwargs"),D=atom.workspace.getActiveTextEditor(),A=atom.views.getView(D),j=this.querySelector("section.kwargs h4 span.title"),O=this.querySelector("span.popular-patterns-toggle"),L=this.querySelector("section.patterns h4 span.title"),N=this.querySelector("section.patterns");this.subscriptions.add(new o(this,"click",e=>{A&&A.focus()})),N&&O&&L&&S&&this.subscriptions.add(new o(L,"click",e=>{S.insertBefore(P,_),N.classList.toggle("visible"),atom.config.set("kite.signaturePopularPatternsVisible",!atom.config.get("kite.signaturePopularPatternsVisible"))})),P&&N&&S&&this.subscriptions.add(new o(P,"click",e=>{S.removeChild(P),N.classList.toggle("visible"),atom.config.set("kite.signaturePopularPatternsVisible",!atom.config.get("kite.signaturePopularPatternsVisible"))})),T&&j&&this.subscriptions.add(new o(j,"click",e=>{T.classList.toggle("visible"),atom.config.set("kite.signatureKwargsVisible",!atom.config.get("kite.signatureKwargsVisible"))})),I&&T&&(this.subscriptions.add(new o(I,"click",e=>{T.classList.toggle("visible"),atom.config.set("kite.signatureKwargsVisible",!atom.config.get("kite.signatureKwargsVisible"))})),r(n,"in_kwargs")&&setTimeout(()=>{const e=T.querySelector("dl"),t=T.querySelector("dt.highlight");t&&(e.scrollTop=t.offsetTop-t.offsetHeight)},100)),E&&this.subscriptions.add(E.onDidClickMoreLink(()=>{this.listElement.model.hide()}))}checkWidth(){const e=this.querySelector(".name");if(e&&e.scrollWidth>e.offsetWidth){const i=e.scrollWidth-e.offsetWidth,a=e.querySelector(".signature"),o=[].slice.call(e.querySelectorAll(".parameter")),s=e.scrollWidth,r=o[this.currentIndex],c=r?r.offsetLeft-r.offsetWidth/2:s+1,l=[];let u=0;const p=this.currentIndex;if(!a)return;function t(){const e=document.createElement("span");e.className="parameter ellipsis",e.textContent="…0 more, ",a.insertBefore(e,a.firstElementChild);for(let t=0;t<p;t++){const n=o[t];if(l.push(n),(u+=n.offsetWidth)-e.offsetWidth>=i)return u-=e.offsetWidth,l.forEach(e=>e.remove()),e.textContent=`…${l.length} more, `,void(l.length=0)}l.length?(u-=e.offsetWidth,l.forEach(e=>e.remove()),e.textContent=`…${l.length} more, `,l.length=0):e.remove()}function n(){const e=document.createElement("span");e.className="parameter ellipsis",e.textContent="0 more…",a.appendChild(e);for(let t=o.length-1;t>p;t--){const n=o[t];if(l.push(n),(u+=n.offsetWidth)-e.offsetWidth>=i)return u-=e.offsetWidth,l.forEach(e=>e.remove()),e.textContent=`${l.length} more…`,void(l.length=0)}l.length?(u-=e.offsetWidth,l.forEach(e=>e.remove()),e.textContent=`${l.length} more…`,l.length=0):e.remove()}c>s?(t(),u<i&&n()):(n(),u<i&&t())}}}.initClass()}]);
