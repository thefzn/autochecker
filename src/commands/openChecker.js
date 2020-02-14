const EventEmitter = require('events');
class openChecker extends EventEmitter {
  command() {
    this.api
      .click('#buttonId') // checkTypeButtons
      .waitForElementNotPresent('.ms-Overlay')
      .waitForElementVisible('.checkTypeButtons')

    this.emit('complete')
    return this;
  }
}

module.exports = openChecker
