const {DisposableEvent} = require('../utils');

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
      return sticky;
    });

    this.subscription = new DisposableEvent(scrollContainer, 'scroll', e => {
      this.scroll(e);
    });
  }

  dispose() {
    this.subscription.dispose();
    this.stickies = null;
    this.scrollContainer = null;
  }

  scroll(e) {
    // let delta = this.lastScrollTop
    //   ? this.lastScrollTop - this.scrollContainer.scrollTop
    //   : 0;
    const containerTop = this.scrollContainer.getBoundingClientRect().top;
    const scrollTop = this.scrollContainer.scrollTop + containerTop;

    this.stickies.forEach((sticky, i) => {
      let parentTop = sticky.parentNode.getBoundingClientRect().top;

      if (parentTop > scrollTop) {
        sticky.classList.add('fixed');
        sticky.style.top = (scrollTop + (i * 14)) + 'px';
      }

    //   let nextSticky = this.stickies[i + 1];
    //   let prevSticky = this.stickies[i - 1];
    //   let {top} = sticky.getBoundingClientRect();
    //
    //   if (parentTop < scrollTop) {
    //     if (!sticky.classList.contains('absolute')) {
    //       sticky.classList.add('fixed');
    //       sticky.style.top = scrollTop + 'px';
    //
    //       if (nextSticky != null) {
    //         let nextTop = nextSticky.parentNode.getBoundingClientRect().top;
    //         if ((top + sticky.offsetHeight) >= nextTop) {
    //           sticky.classList.add('absolute');
    //           sticky.style.top = this.scrollContainer.scrollTop + 'px';
    //         }
    //       }
    //     }
    //
    //   } else {
    //     sticky.classList.remove('fixed');
    //
    //     if ((prevSticky != null) && prevSticky.classList.contains('absolute')) {
    //       let prevTop = prevSticky.getBoundingClientRect().top;
    //       if (delta < 0) { prevTop -= prevSticky.offsetHeight; }
    //
    //       if (scrollTop <= prevTop) {
    //         prevSticky.classList.remove('absolute');
    //         prevSticky.style.top = scrollTop + 'px';
    //       }
    //     }
    //   }
    });

    this.lastScrollTop = this.scrollContainer.scrollTop;
  }
};
