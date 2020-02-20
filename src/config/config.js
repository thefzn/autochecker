require('dotenv').config()

const ISDEV = process.env.ENV === 'development'
const ACTIONS = ['ARRIVE', 'LUNCHSTART', 'LUNCHEND', 'LEAVE', 'RESET']
const RETRIES = process.env.RETRIES ? parseInt(process.env.RETRIES) || 15 : 15
const VARIATION = process.env.CHECK_VARIATION ? parseInt(process.env.CHECK_VARIATION.match(/\d*/)[0]) * 60000 : 5 * 60000
const DEFAULTS = {
  ARRIVE: '7:50', 
  LUNCHSTART: '01:30pm', 
  LUNCHEND: '14:30', 
  LEAVE: '5:10pm', 
  RESET: '00:01'
}
const SCHEDULE = {
  ARRIVE: process.env.CHECK_ARRIVE || DEFAULTS.ARRIVE, 
  LUNCHSTART: process.env.CHECK_LUNCHSTART || DEFAULTS.LUNCHSTART, 
  LUNCHEND: process.env.CHECK_LUNCHEND || DEFAULTS.LUNCHEND, 
  LEAVE: process.env.CHECK_LEAVE || DEFAULTS.LEAVE, 
  RESET: process.env.CHECK_RESET || DEFAULTS.RESET
}
const ESCAPE_ON_ERROR = !ISDEV && process.env.ON_ERROR_STOP && (process.env.ON_ERROR_STOP === 'true' || process.env.ON_ERROR_STOP === 'TRUE')
const LOG = ISDEV || (process.env.VERBOSE && (process.env.VERBOSE === 'true' || process.env.VERBOSE === 'TRUE'))
const TICK = ISDEV ? 1000 : process.env.TICK ? parseInt(process.env.TICK) || 56789 : 56789

module.exports = {
  ACTIONS,
  RETRIES,
  VARIATION,
  SCHEDULE,
  ESCAPE_ON_ERROR,
  LOG,
  TICK,
  ISDEV
}
