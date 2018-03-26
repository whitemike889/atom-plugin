'use strict';

const BaseMode = require('./base');
let Kite;

module.exports = class SidebarMode extends BaseMode {
  constructor(kiteEditor) {
    super(kiteEditor);
  }

  expandPosition(position) {
    if (!Kite) { Kite = require('../kite'); }

    if (!Kite.isSidebarVisible()) { Kite.toggleSidebar(true); }

    return Kite.sidebar.showDataAtPosition(this.kiteEditor.editor, position);
  }

  expandRange(range) {
    if (!Kite) { Kite = require('../kite'); }

    if (!Kite.isSidebarVisible()) { Kite.toggleSidebar(true); }

    return Kite.sidebar.showDataAtRange(this.kiteEditor.editor, range);
  }

  expandId(id) {
    if (!Kite) { Kite = require('../kite'); }

    if (!Kite.isSidebarVisible()) { Kite.toggleSidebar(true); }

    return Kite.sidebar.showDataForSymbolId(this.kiteEditor.editor, id);
  }
};
