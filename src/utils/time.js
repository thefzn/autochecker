const { VARIATION } = require('../config/config')
let currentTime = null
let startOfDay = null

function resetTime () {
  const now = new Date()
  const timeOffset = -(now.getTimezoneOffset() / 60)

  now.setHours(now.getHours() + timeOffset)

  startOfDay = new Date(
    now.getFullYear() +
    '-' +
    norm(now.getMonth() + 1) +
    '-' +
    norm(now.getDate()) +
    'T00:00:00.000Z'
  ).getTime()
  currentTime = now.getTime()
}

function getScheduledTime (time, forNextDay) {
  const mins = countMinutes(time)
  const additional = forNextDay ? 1000 * 60 * 60 * 24 : 0
  const todayStart = new Date(startOfDay).setMinutes(mins) + additional
  return forNextDay ? todayStart : getRandom(todayStart)
}

function getCurrentTime () {
  return currentTime
}

function getCurrentDate () {
  return new Date(currentTime)
}

function getStartOfDay () {
  return startOfDay
}

function countMinutes (time) {
  const timeArr = time.match(/\d{1,2}/g)
  const intTimeArr = timeArr ? timeArr.map(d => parseInt(d)) : null
  const addPM = time.match(/(pm)/i) ? 12 : 0
  const HH = intTimeArr ? Math.min(intTimeArr[0] + addPM, 23) : null
  const mm = intTimeArr ? Math.min(intTimeArr[1], 59) : null
  return HH !== null && mm !== null ? (HH * 60) + mm : null
}

function getRandom(startTime) {
  const start = startTime - VARIATION
  const random = Math.random() * VARIATION * 2
  return start + random
}

function norm (d) {
  return d < 10 ? `0${d}` : d.toString()
}

module.exports = {
  resetTime,
  getScheduledTime,
  getCurrentTime,
  getCurrentDate,
  getStartOfDay
}