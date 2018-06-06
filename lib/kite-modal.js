'use strict';

module.exports = class KiteModal {
  constructor({content, buttons} = {}, options = {}) {
    this.content = content;
    this.buttons = buttons;
    this.options = options;
  }

  destroy() {
    this.modal.destroy();
    delete this.modal;
  }

  execute() {
    return new Promise((resolve, reject) => {
      const {condition, onDidDestroy} = this.options;
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

        this.modal = atom.workspace.addModalPanel({item, autoFocus: true});
        const sub = this.modal.onDidDestroy(() => {
          onDidDestroy && onDidDestroy();
          sub.dispose();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
};
