const {CompositeDisposable} = require('atom');
const {DisposableEvent, addDelegatedEventListener} = require('../utils');

module.exports = class StickyTitle {
  constructor(stickies, scrollContainer) {
    this.scrollContainer = scrollContainer;

    this.stickies = [].slice.call(stickies).map(title => {
      const sticky = document.createElement('div');
      sticky.className = 'sticky';
      sticky.innerHTML = title.innerHTML;
      title.innerHTML = '';
      title.appendChild(sticky);
      sticky.parentNode.style.height = sticky.offsetHeight + 'px';
      sticky.style.width = scrollContainer.offsetWidth + 'px';
      this.titleHeight = sticky.offsetHeight;
      return sticky;
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(new DisposableEvent(scrollContainer, 'scroll', e => {
      this.scroll();
    }));

    this.subscriptions.add(addDelegatedEventListener(this.scrollContainer, 'click', 'section h4 .sticky.fixed', (e) => {
      this.scrollTo(e.target.parentNode);
    }));

    this.scroll();
    requestAnimationFrame(() => this.scroll());
  }

  dispose() {
    this.subscription.dispose();
    this.stickies = null;
    this.scrollContainer = null;
  }

  scrollTo(target) {
    const containerBounds = this.scrollContainer.getBoundingClientRect();
    const scrollTop = this.scrollContainer.scrollTop;
    const top = target.getBoundingClientRect().top + scrollTop - containerBounds.top;

    const offset = this.stickies.reduce((memo, sticky) => {
      const parentBounds = sticky.parentNode.getBoundingClientRect();
      const parentTop = parentBounds.top + scrollTop - containerBounds.top;

      return parentTop < top ? memo + sticky.offsetHeight : memo;
    }, 0);

    this.scrollContainer.scrollTop = top - offset;
  }

  scroll() {
    const containerBounds = this.scrollContainer.getBoundingClientRect();
    const containerTop = this.scrollContainer.offsetTop;
    const scrollTop = this.scrollContainer.scrollTop + containerBounds.top;
    const scrollBottom = scrollTop + containerBounds.height;

    let refTop = scrollTop;
    let refBottom = scrollBottom;

    let stickies = this.stickies.slice();

    stickies = stickies.filter((sticky, i) => {
      const parentBounds = sticky.parentNode.getBoundingClientRect();
      const parentTop = parentBounds.top + scrollTop - containerBounds.top;

      if (parentTop < refTop) {
        sticky.classList.add('fixed');
        sticky.style.top = (containerTop + (i * this.titleHeight)) + 'px';
        refTop += this.titleHeight;
        return false;
      }
      return true;
    });

    stickies = stickies.reverse().filter((sticky, i) => {
      const parentBounds = sticky.parentNode.getBoundingClientRect();
      const parentBottom = parentBounds.bottom + scrollTop - containerBounds.top;

      if (parentBottom > refBottom) {
        sticky.classList.add('fixed');
        sticky.style.top = (containerBounds.height - (i * this.titleHeight)) + 'px';

        refBottom -= this.titleHeight;
        return false;
      }

      return true;
    });

    stickies.forEach(sticky => sticky.classList.remove('fixed'));
  }
};
