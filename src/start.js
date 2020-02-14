const dotenv = require('dotenv');
const nw = require('./nw')
const log = require('./logger')

dotenv.config();

const RETRIES = process.env.RETRIES || 3
const today = getToday()
const todayStartStr = `${today.getFullYear()}-${norm(today.getMonth() + 1)}-${norm(today.getDate())}T00:00:00.000Z`
const ACTIONS = ['ARRIVE', 'LUNCHSTART', 'LUNCHEND', 'LEAVE']
const VARIATION = process.env.CHECK_VARIATION ? parseInt(process.env.CHECK_VARIATION.match(/\d*/)[0]) * 60000 : 5 * 60000
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
  return todayStart
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
    if (action.completed) {
      log('Ignoring', action.action, '- Already completed')
    } else if (working) {
      log('Ignoring', action.action, '- Working on another action')
    } else {
      const remaining = action.time - now
      const inLimits = Math.abs(remaining) < VARIATION

      if (remaining < 0 || inLimits) {
        log('Action applies for execution:', action.action)
        working = true
        attempt(action, remaining)
      } else {
        const mins = parseInt(remaining / 60000)
        const HH = parseInt(mins / 60)
        const mm = mins % 60
        log('Ignoring', action.action, `- Running in ${HH}hrs ${mm}mins`)
      }
    }
  })
}

async function attempt (action, remaining, force) {
  const delta = VARIATION * 2
  const roulette = Math.random() * delta
  const result = remaining < 0 || roulette > remaining

  log('Attempting to execute', action.action)

  if (result) {
    log('Winner! Executing action')
    try {
      const success = await nw(`./automation/${action.action}.js`)
      working = false
      if (success) {
        log('Action completed!')
        action.completed = true
        retries = 0
      } else {
        log('Action resulted in an error!')
        retry = action
      }
    } catch (err) {
      log('Action resulted in an error!', err)
      working = false
      retry = action
    }
  } else {
    working = false
    log('Not selected for execution yet, maybe next time!')
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
    const success = await nw(`./automation/${retry.action}.js`)
    working = false
    if (success) {
      log('Action completed!')
      retry.completed = true
      retries = 0
    }
  } catch (err) {
    log(err)
  }
}

setInterval(tick, 60000)

tick()