'use strict';

const {Emitter, CompositeDisposable} = require('atom');
const {DisposableEvent} = require('./utils');
const VirtualCursor = require('./virtual-cursor');
const KiteHover = require('./elements/kite-hover');
const KiteExpand = require('./elements/kite-expand');
const DataLoader = require('./data-loader');

module.exports = {
  emitter: new Emitter(),
  queue: Promise.resolve(),

  enqueue(promiseGenerator) {
    this.queue = this.queue
    .then(promiseGenerator)
    .catch(err => {});

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

  dismiss(from) {
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
    return this.enqueue(() => {
      if ((this.lastHoverRange && this.lastHoverRange.isEqual(range)) ||
          (this.lastExpandRange && this.lastExpandRange.isEqual(range))) {
        return null;
      }

      this.dismiss('hover');

      if (range.isEmpty()) { return null; }

      this.lastHoverRange = range;

      return DataLoader.getHoverDataAtRange(editor, range).then(data => {
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
      });
    });
  },

  showExpandAtPosition(editor, position) {
    const cursor = new VirtualCursor(editor, position);
    const range = cursor.getCurrentWordBufferRange({
      includeNonWordCharacters: false,
    });

    return this.showExpandAtRange(editor, range);
  },

  showExpandAtRange(editor, range) {
    return this.enqueue(() => {
      if (this.lastExpandRange && this.lastExpandRange.isEqual(range)) {
        return null;
      }

      this.dismiss('expand');

      if (range.isEmpty()) { return null; }

      this.lastExpandRange = range;

      return DataLoader.getReportDataAtRange(editor, range)
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
      .catch(err => console.error(err));
    });
  },
};
