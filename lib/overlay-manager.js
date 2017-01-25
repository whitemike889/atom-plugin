'use strict';

const {Emitter, CompositeDisposable} = require('atom');
const {StateController} = require('kite-installer');
const {hoverPath, reportPath, promisifyRequest, promisifyReadResponse, DisposableEvent} = require('./utils');
const VirtualCursor = require('./virtual-cursor');
const KiteHover = require('./elements/kite-hover');
const KiteExpand = require('./elements/kite-expand');

module.exports = {
  emitter: new Emitter(),
  queue: Promise.resolve(),

  enqueue(promiseGenerator) {
    this.queue = this.queue.then(promiseGenerator).catch(err => {});

    return this.queue;
  },

  onDidShowExpand(listener) {
    return this.emitter.on('did-show-expand', listener);
  },

  onDidShowHover(listener) {
    return this.emitter.on('did-show-hover', listener);
  },

  onDidDismiss(listener) {
    return this.emitter.on('did-dismiss', listener);
  },

  dismiss() {
    this.marker && this.marker.destroy();
    this.decoration && this.decoration.destroy();
    delete this.marker;
    delete this.decoration;
    delete this.lastHoverRange;
    delete this.lastExpandRange;

    this.emitter.emit('did-dismiss');
  },

  showHoverAtPosition(editor, position) {
    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });

    return this.showHoverAtRange(editor, range);
  },

  showHoverAtRange(editor, range) {
    if ((this.lastHoverRange && this.lastHoverRange.isEqual(range)) ||
        (this.lastExpandRange && this.lastExpandRange.isEqual(range))) {
      return Promise.resolve();
    }

    this.dismiss();

    if (range.isEmpty()) { return Promise.resolve(); }

    this.lastHoverRange = range;

    return this.enqueue(() => this.getHoverDataAtRange(editor, range).then(data => {
      if (data.symbol && data.symbol.length) {
        const hover = new KiteHover();
        hover.setData(data);

        this.marker = editor.markBufferRange(range, {
          invalidate: 'touch',
        });
        this.decoration = editor.decorateMarker(this.marker, {
          type: 'overlay',
          position: 'tail',
          item: hover,
        });
        this.emitter.emit('did-show-hover');
      }
    }));
  },

  showExpandAtPosition(editor, position) {
    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });

    return this.showExpandAtRange(editor, range);
  },

  showExpandAtRange(editor, range) {
    if (this.lastExpandRange && this.lastExpandRange.isEqual(range)) {
      return Promise.resolve();
    }

    this.dismiss();

    if (range.isEmpty()) { return Promise.resolve(); }

    this.lastExpandRange = range;

    return this.enqueue(() =>
    this.getReportDataAtRange(editor, range)
    .then(([hover, report]) => {
      // console.log(JSON.stringify(hover, null, 2));
      // console.log(JSON.stringify(report, null, 2));
      if (hover.symbol && hover.symbol.length) {
        const expand = new KiteExpand();
        expand.setData([hover, report]);

        const displayMode = atom.config.get('kite.displayExpandViewAs');

        this.marker = editor.markBufferRange(range, {
          invalidate: 'touch',
        });

        switch (displayMode) {
          case 'overlay':
            this.decoration = editor.decorateMarker(this.marker, {
              type: 'overlay',
              position: 'tail',
              item: expand,
            });
            break;
          case 'block':
            this.decoration = editor.decorateMarker(this.marker, {
              type: 'block',
              position: 'after',
              item: expand,
            });

            const subs = new CompositeDisposable();
            subs.add(new DisposableEvent(expand, 'mousedown mouseup', (e) => {
              e.stopImmediatePropagation();
              e.stopPropagation();
            }));
            subs.add(this.decoration.onDidDestroy(() => subs.dispose()));
            break;
          case 'sidebar':
            const position = atom.config.get('kite.sidebarPosition');
            const item = {item: expand};

            this.decoration = position === 'left'
              ? atom.workspace.addLeftPanel(item)
              : atom.workspace.addRightPanel(item);
            break;
        }
        this.emitter.emit('did-show-expand');
      }
    })
    .catch(err => console.error(err)));
  },

  getHoverDataAtRange(editor, range) {
    const path = hoverPath(editor, range);
    return promisifyRequest(StateController.client.request({path}))
    .then(resp => {
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
    const path = reportPath(data);
    return promisifyRequest(StateController.client.request({path}))
    .then(resp => {
      if (resp.statusCode !== 200) {
        throw new Error(`${resp.statusCode} at ${path}`);
      }
      return promisifyReadResponse(resp);
    })
    .then(report => [data, JSON.parse(report)])
    .catch(err => {
      console.error(err);
      return [data];
    });
  },
};
