'use strict';

const BaseMode = require('./base');
let Kite;

module.exports = class SidebarMode extends BaseMode {
  constructor(kiteEditor) {
    super(kiteEditor);
  }

  expandRange(range) {
    if (!Kite) { Kite = require('../kite'); }

    if (!Kite.isSidebarVisible()) { Kite.toggleSidebar(true); }

    Kite.activateAndShowItem(Kite.sidebar);
    return Kite.sidebar.showDataAtRange(this.kiteEditor.editor, range);
  }

  expandId(id) {
    if (!Kite) { Kite = require('../kite'); }

    if (!Kite.isSidebarVisible()) { Kite.toggleSidebar(true); }
    Kite.activateAndShowItem(Kite.sidebar);
    return Kite.sidebar.showDataForSymbolId(this.kiteEditor.editor, id);
  }
};
