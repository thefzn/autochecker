const { log } = require('./logger')
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
  const file = `./actions/${action}.js`
  try {
    await setup()
    await require(file)(client)
    await shutdown()
    log('[LOG]','Automation success!')
    return true
  } catch (err) {
    log('[LOG]','Automation failed!')
    await shutdown();
    return false
  }
}

module.exports = execute
