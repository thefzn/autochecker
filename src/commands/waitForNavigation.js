const EventEmitter = require('events');
class waitForNavigation extends EventEmitter {
  constructor() {
    super(...arguments);
    this.url = null
    this.t = null
    this.attempts =  10
    this.current = -1
    this.interval = 1000
    this.fail = null
  }
  command(fail, interval, attempts) {
    this.interval = typeof interval === 'number' ? interval : this.interval
    this.attempts = typeof attempts === 'number' ? attempts : this.attempts
    this.fail = typeof fail === 'function' ? fail : () => {}

    this.url = this.api.url(({ value }) => {
      this.url = value
      console.log('Wait - Started on: ', this.url)

      this.waitForNavigation(this.api)
    })

    return this;
  }
  waitForNavigation(browser) {
    browser.url(({ value }) => {
      console.log('Wait - Tick - Current URL:', value)

      if (this.url !== value) {
        console.log('Wait - Completed')
        this.emit('complete')
      } else if (this.attempts <= this.current) {
        console.log('Wait - Failed')
        this.fail()
        this.emit('complete')
      } else {
        this.current++

        clearTimeout(this.t)
        this.t = setTimeout(() => this.waitForNavigation(browser), this.interval)
      }
    })
  }
}


module.exports = waitForNavigation;