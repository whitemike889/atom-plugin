'use strict';

const capitalize = s => s.replace(/^\w/, m => m.toUpperCase());

module.exports = class KiteNotification {
  constructor(level, title, notificationOptions = {}, options = {}) {
    this.level = level;
    this.title = title;
    this.notificationOptions = notificationOptions;
    this.options = options;

    this.notificationOptions.dismissable = this.notificationOptions.dismissable || true;
  }

  execute() {
    return new Promise((resolve, reject) => {
      const {condition, onDidDismiss} = this.options;
      if (!condition || condition()) {
        this.notification = atom.notifications[`add${capitalize(this.level)}`](this.title, this.notificationOptions);
        this.instrumentNotification(this.notification, (res) => {
          onDidDismiss && onDidDismiss(res);
          resolve(res);
        });
      } else {
        resolve();
      }
    });
  }

  dismiss() {
    this.notification && this.notification.dismiss();
  }

  instrumentNotification(notification, dismissCallback) {
    // const type = options.metricType || notification.getType();
    // const metric = typeof options.metric === 'number'
    //   ? this.NOTIFICATION_METRICS[options.metric]
    //   : options.metric;

    // this.emit('did-notify', {
    //   notification: metric, type,
    // });

    let actionTriggered;

    if (this.notificationOptions.buttons) {
      this.notificationOptions.buttons.forEach(button => {
        const {onDidClick} = button;
        button.onDidClick = () => {
          actionTriggered = button.text;
          // this.emit('did-click-notification-button', {
          //   button: button.metric,
          //   notification: metric,
          //   type,
          // });
          onDidClick && onDidClick(() => notification.dismiss());
        };
      });
    }
    // this.lastShown[options.key || options.metric] = new Date();

    const sub = notification.onDidDismiss(() => {
      dismissCallback && dismissCallback(actionTriggered);
      if (actionTriggered) {
        // this.emit('did-dismiss-notification', {
        //   notification: metric, type,
        // });
      } else {
        // this.emit('did-reject-notification', {
        //   notification: metric, type,
        // });
      }
      sub.dispose();
    });

    return notification;
  }
};
