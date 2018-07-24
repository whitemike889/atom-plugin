'use strict';

const {waitsFor, substituteFromContext, buildContext, itForExpectation, NotificationsMock} = require('../utils');

module.exports = (expectation, not) => {
  beforeEach(() => {
    const promise = waitsFor(`${expectation.properties.level} notification`, () => {
      return NotificationsMock.newNotification();
    }, 100);

    if (not) {
      waitsForPromise({shouldReject: true}, () => promise);
    } else {
      waitsForPromise(() => promise);
    }
  });

  const block = () => {
    if (!not) {
      expect(NotificationsMock.lastNotification.level).toEqual(expectation.properties.level);

      // if (expectation.properties.message) {
      //   const message = substituteFromContext(expectation.properties.message, buildContext());
      //
      //   expect(NotificationsMock.lastNotification.message).toEqual(message);
      // }
    }
  };

  itForExpectation(expectation, block);
};
