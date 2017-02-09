'use strict';

const {StateController, Logger} = require('kite-installer');
const {
  hoverPath, openInWebURL, promisifyRequest, promisifyReadResponse, head,
  valueReportPath, membersPath, usagesPath, usagePath,
} = require('./utils');
const {symbolId} = require('./kite-data-utils');
const VirtualCursor = require('./virtual-cursor');

const DataLoader = {
  getHoverDataAtRange(editor, range) {
    const path = hoverPath(editor, range);
    return promisifyRequest(StateController.client.request({path}))
    .then(resp => {
      Logger.logResponse(resp);
      if (resp.statusCode !== 200) {
        throw new Error(`${resp.statusCode} status at ${path}`);
      }
      return promisifyReadResponse(resp);
    })
    .then(data => JSON.parse(data));
  },

  getReportDataAtRange(editor, range) {
    return this.getHoverDataAtRange(editor, range)
    .then(data => this.getReportDataFromHover(data));
  },

  getReportDataFromHover(data) {
    const id = head(head(data.symbol).value).id;
    return id && id !== ''
      ? this.getValueReportDataForId(id)
        .then(report => [data, report])
        .catch(err => [data])
      : [data];
  },

  getValueReportDataForId(id) {
    const path = valueReportPath(id);

    return promisifyRequest(StateController.client.request({path}))
      .then(resp => {
        Logger.logResponse(resp);
        if (resp.statusCode !== 200) {
          throw new Error(`${resp.statusCode} at ${path}`);
        }
        return promisifyReadResponse(resp);
      })
      .then(report => JSON.parse(report))
      .then(report => {
        if (report.value && report.value.id === '') { report.value.id = id; }
        return report;
      });
  },

  getMembersDataForId(id) {
    const path = membersPath(id);

    return promisifyRequest(StateController.client.request({path}))
      .then(resp => {
        Logger.logResponse(resp);
        if (resp.statusCode !== 200) {
          throw new Error(`${resp.statusCode} at ${path}`);
        }
        return promisifyReadResponse(resp);
      })
      .then(report => JSON.parse(report));
  },

  getUsagesDataForValueId(id) {
    const path = usagesPath(id);

    return promisifyRequest(StateController.client.request({path}))
      .then(resp => {
        Logger.logResponse(resp);
        if (resp.statusCode !== 200) {
          throw new Error(`${resp.statusCode} at ${path}`);
        }
        return promisifyReadResponse(resp);
      })
      .then(report => JSON.parse(report));
  },

  getUsageDataForId(id) {
    const path = usagePath(id);

    return promisifyRequest(StateController.client.request({path}))
      .then(resp => {
        Logger.logResponse(resp);
        if (resp.statusCode !== 200) {
          throw new Error(`${resp.statusCode} at ${path}`);
        }
        return promisifyReadResponse(resp);
      })
      .then(report => JSON.parse(report));
  },

  openInWebAtPosition(editor, position) {
    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });

    return StateController.isPathWhitelisted(editor.getPath())
    .then(() => this.getHoverDataAtRange(editor, range))
    .then(data => {
      const id = symbolId(head(data.symbol));
      atom.applicationDelegate.openExternal(openInWebURL(id));
    });
  },
};

module.exports = DataLoader;
