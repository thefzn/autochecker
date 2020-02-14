const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  asyncHookTimeout: 90000,
  /**
   * After all the tests are run, evaluate if there were errors and exit appropriately.
   *
   * If there were failures or errors, exit 1, else exit 0.
   *
   * @param res
   */
  reporter (res) {
    const results = res || {}
    const failed = results.failed || results.error || null

    if (!failed) process.exit(0)
    else process.exit(1)
  }
}
