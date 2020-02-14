const EventEmitter = require('events');
class officeLogin extends EventEmitter {
  command() {
    const user = this.api.globals.USER || null
    const pass = this.api.globals.PASS || null

    console.log('[LOG]','Logging as', user)

    this.api
      // Navigate to starting URL 
      .url('https://onesofttek.sharepoint.com/sites/home/SitePages/Menu.aspx')
      .waitForElementVisible('body')
      .url(url => {
        if (url.value.match('https://login.microsoftonline.com/')) {
          this.api
            .setValue('input[type=email]', user)
            .click('input[type=submit]')
            .pause(2000)
            .setValue('input[type=password]', pass)
            .click('input[type=submit]')
            .waitForElementVisible('body')
            .click('input[type=submit]')
            .waitForElementVisible('body')
        }
        this.api.waitForElementVisible('#buttonId')
      })

    this.emit('complete')
    return this;
  }
}

module.exports = officeLogin
