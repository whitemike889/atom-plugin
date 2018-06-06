'use strict';

const KiteNotification = require('./kite-notification');
const KiteModal = require('./kite-modal');

module.exports = class NotificationQueue {
  constructor() {
    this.queue = [];
    this.promise = Promise.resolve();
  }

  add(queuedNotification) {
    if (typeof queuedNotification == 'function') {
      return this.promise = this.promise
      .then(queuedNotification)
      .then(notification => notification && notification.execute());
    } else {
      return this.promise = this.promise.then(() => queuedNotification.execute());
    }
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
