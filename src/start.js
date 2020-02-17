const dotenv = require('dotenv');
const execute = require('./execute')
const log = require('./logger')

dotenv.config();

const ACTIONS = ['ARRIVE', 'LUNCHSTART', 'LUNCHEND', 'LEAVE']
const RETRIES = process.env.RETRIES || 3
const VARIATION = process.env.CHECK_VARIATION ? parseInt(process.env.CHECK_VARIATION.match(/\d*/)[0]) * 60000 : 5 * 60000
const today = getToday()
const todayStartStr = `${today.getFullYear()}-${norm(today.getMonth() + 1)}-${norm(today.getDate())}T00:00:00.000Z`
let dayProcessed = today.getDate() - 1
let queue = []
let working = false
let retry = null
let retries = 0

function resetDay () {
  queue = ACTIONS.map(action => {
    const time = scheduledDate(process.env[`CHECK_${action}`])
    return {
      completed: false,
      action,
      time
    }
  })
  log(`Schedule reset to`)
  queue.forEach(s => log(s.action, 'at', new Date(s.time)))
}
function getToday () {
  const today = new Date()
  const timeOffset = -(today.getTimezoneOffset() / 60)
  return new Date(today.setHours(today.getHours() + timeOffset))
}
function countMinutes (time) {
  const timeArr = time.match(/\d{1,2}/g)
  const intTimeArr = timeArr ? timeArr.map(d => parseInt(d)) : null
  const addPM = time.match(/(pm)/i) ? 12 : 0
  const HH = intTimeArr ? Math.min(intTimeArr[0] + addPM, 23) : null
  const mm = intTimeArr ? Math.min(intTimeArr[1], 59) : null
  return HH !== null && mm !== null ? (HH * 60) + mm : null
}
function scheduledDate (time) {
  const mins = countMinutes(time)
  const todayStart = new Date(todayStartStr).setMinutes(mins)
  return getRandom(todayStart)
}
function getRandom(startTime) {
  const start = startTime - VARIATION
  const random = Math.random() * VARIATION * 2
  return start + random
}
function norm (d) {
  return d < 10 ? `0${d}` : d.toString()
}
function tick () {
  const nowDate = getToday()
  const now = nowDate.getTime()
  const day = nowDate.getDate()
  if (working) {
    log('Already working, skipping this tick')
    return
  }
  if (retry) {
    log('Pending action, skipping this tick')
    doRetry()
    return
  }
  if (dayProcessed != day) {
    dayProcessed = day
    log('New day detected, reseting schedule')
    resetDay()
  }
  log('Tick', nowDate)
  queue.forEach(action => {
    if (action.completed) log('Ignoring', action.action, '- Already completed')
    else if (working) log('Ignoring', action.action, '- Working on another action')
    else {
      const remaining = action.time - now
      if (remaining < 0) {
        working = true
        trigger(action, remaining)
      } else {
        const mins = parseInt(remaining / 60000)
        const HH = parseInt(mins / 60)
        const mm = mins % 60
        log('Ignoring', action.action, `- Running in ${HH}hrs ${mm}mins`)
      }
    }
  })
}

async function trigger (action) {
  log('Executing action', action.action)
  working = true
  try {
    const success = await execute(action.action)
    working = false
    if (success) {
      log(action.action, 'Action completed!')
      action.completed = true
      retries = 0
    } else {
      log(action.action, 'Action failed!')
      retry = action
    }
  } catch (err) {
    log(action.action, 'Error executing action:', err)
    working = false
    retry = action
  }
}
async function doRetry () {
  if (working) {
    log('Skipping retry due to already working process')
    return
  } else if (!retry) {
    log('Nothing to retry')
    return
  } else if (retries >= RETRIES) {
    const stop = process.env.ON_ERROR_STOP && process.env.ON_ERROR_STOP === 'true'
    if (stop) {
      log('Too many retries, exiting process')
      process.exit(1)
    } else {
      log('Too many retries, skipping', retry.action)
      retry.completed = true
      retry = null
      retries = 0
      working = false
      return
    }
  }
  working = true
  retries++
  log('Retrying', retry.action, retries)
  try {
    const success = await execute(retry.action)
    working = false
    if (success) {
      log(retry.action, 'Action completed!')
      retry.completed = true
      retries = 0
    } else {
      log(retry.action, 'Action failed!')
    }
  } catch (err) {
    log(err)
  }
}

setInterval(tick, 56789)

tick()