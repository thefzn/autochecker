const execute = require('./utils/execute')
const logger = require('./utils/logger')
const { ACTIONS, RETRIES, SCHEDULE, ESCAPE_ON_ERROR, TICK, VARIATION, DAYS_OFF } = require('./config/config')
const { resetTime, getScheduledTime, getCurrentTime, getCurrentDate } = require('./utils/time')

let queue = []
let working = false
let retry = null
let retries = 0

function reset () {
  resetTime()
  const dayOfWeek = getCurrentDate().getDay()
  const isDayOff = DAYS_OFF.includes(dayOfWeek)
  queue = ACTIONS.map(action => {
    const schedule = SCHEDULE[action]
    const isReset = action === 'RESET'
    const time = getScheduledTime(schedule, isReset)
    return {
      completed: isDayOff && !isReset,
      action,
      time
    }
  })

  logger.info('New day detected, reseting schedule', getCurrentDate())
  if (isDayOff) logger.warn('Today\'s a day off, all actions will be marked as completed')
  else {
    logger.info(`Schedule reset to`)
    queue.forEach(s => logger.info(s.action, 'at', new Date(s.time)))
  }
}

function tick () {
  const now = getCurrentTime()
  if (working) {
    logger.log('Already working, skipping this tick')
    return
  }
  if (retry) {
    logger.log('Pending action, skipping this tick')
    doRetry()
    return
  }
  logger.log('Tick', getCurrentDate())
  queue.forEach(action => {
    if (action.completed) logger.log('Ignoring', action.action, '- Already completed')
    else if (working) logger.log('Ignoring', action.action, '- Working on another action')
    else {
      const remaining = action.time - now
      const thereshold = -(VARIATION * 2)
      if (remaining < 0) {
        if (action.action === 'RESET') reset()
        else if (remaining < thereshold) {
          logger.warn('Action is way in the past, skipping action', action.action)
          action.completed = true
        }
        else trigger(action)
      } else {
        const mins = parseInt(remaining / 60000)
        const HH = parseInt(mins / 60)
        const mm = mins % 60
        logger.log('Ignoring', action.action, `- Running in ${HH}hrs ${mm}mins`)
      }
    }
  })
}

async function trigger (action) {
  logger.info('Executing action', action.action)
  working = true
  try {
    const success = await execute(action.action)
    // const success = await new Promise(resolve => setTimeout(() => resolve(true), 500))
    working = false
    if (success) {
      logger.success(action.action, 'Action completed!')
      action.completed = true
      retries = 0
    } else {
      logger.error(action.action, 'Action failed!')
      retry = action
    }
  } catch (err) {
    logger.error(action.action, 'Error executing action:', err)
    working = false
    retry = action
  }
}
async function doRetry () {
  if (working) {
    logger.log('Skipping retry due to already working process')
    return
  } else if (!retry) {
    logger.log('Nothing to retry')
    return
  } else if (retries >= RETRIES) {
    if (ESCAPE_ON_ERROR) {
      logger.warn('Too many retries, exiting process')
      process.exit(1)
    } else {
      logger.warn('Too many retries, skipping', retry.action)
      retry.completed = true
      retry = null
      retries = 0
      working = false
      return
    }
  }
  retries++
  logger.info('Retrying', retry.action, retries)
  await trigger(retry)
}

setInterval(tick, TICK)

reset()
