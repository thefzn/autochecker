const dotenv = require('dotenv')
const EventEmitter = require('events');

dotenv.config()

class officeLogin extends EventEmitter {
  command() {
    const user = process.env.USER || null
    const pass = process.env.PASS || null

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
            .waitForElementVisible('input[type=password]')
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
