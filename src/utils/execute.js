const { success, error, log } = require('./logger')
const {
    createSession,
    closeSession,
    startWebDriver,
    stopWebDriver,
    client
  } = require('nightwatch-api')
  
async function setup(env = 'default') {
  await startWebDriver({ env })
  await createSession({ env })
}

async function shutdown() {
  await closeSession()
  await stopWebDriver()
}

async function execute(action) {
  const file = `../actions/${action}.js`
  try {
    await setup()
    await require(file)(client)
    await shutdown()
    success('Automation success!')
    return true
  } catch (err) {
    error('Automation failed!', err)
    await shutdown();
    log('Automation shutdown completed')
    return false
  }
}

module.exports = execute
