const {CompositeDisposable, Disposable} = require('atom');
const {DisposableEvent, addDelegatedEventListener} = require('../utils');
const elementResizeDetector = require('element-resize-detector')({strategy: 'scroll'});

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
      sticky.style.width = '100%'; //scrollContainer.offsetWidth + 'px';
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

    this.subscriptions.add(atom.config.observe('kite.collapseLongSummaries', collapse => {
      this.collapsed = collapse;
    }));

    if (atom.views.pollDocument) {
      this.subscriptions.add(atom.views.pollDocument(() => { this.measureWidthAndHeight(); }));
    } else {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        const {intersectionRect} = entries[entries.length - 1];
        if (intersectionRect.width > 0 || intersectionRect.height > 0) {
          this.measureWidthAndHeight();
        }
      });

      this.intersectionObserver.observe(this);

      const measureDimensions = () => {
        this.measureWidthAndHeight();
      };
      elementResizeDetector.listenTo(this, measureDimensions);
      this.subscriptions.add(new Disposable(() => { elementResizeDetector.removeListener(this, measureDimensions); }));

      window.addEventListener('resize', measureDimensions);
      this.subscriptions.add(new Disposable(() => { window.removeEventListener('resize', measureDimensions); }));
    }

    this.scroll();
    this.measureWidthAndHeight();
  }

  measureWidthAndHeight() {
    if (this.width == null || this.height == null ||
        this.width !== this.scrollContainer.offsetWidth ||
        this.height !== this.scrollContainer.offsetHeight) {
      requestAnimationFrame(() => this.scroll());
      this.width = this.scrollContainer.offsetWidth;
      this.height = this.scrollContainer.offsetHeight;
    }
  }

  dispose() {
    this.subscriptions.dispose();
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
    // console.log(this.collapsed);
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
        sticky.style.top = (i * this.titleHeight) + 'px';
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
        sticky.style.top = (containerBounds.height - ((i + 1) * this.titleHeight)) + 'px';

        refBottom -= this.titleHeight;
        return false;
      }

      return true;
    });

    stickies.forEach(sticky => sticky.classList.remove('fixed'));
  }
};
