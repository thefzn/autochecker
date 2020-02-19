const { LOG } = require('../config/config')

function log () {
  if (LOG) {
    // Array.prototype.forEach.call(arguments, arg => console.log(arg))
    console.log('[LOG] ', ...arguments)
  }
}

function info () {
  console.log('[INFO] ', ...arguments)
}

function warn () {
  console.log('[WARN] ', ...arguments)
}

function error () {
  console.log('[ERROR] ', ...arguments)
}

function success () {
  console.log('[SUCCESS] ', ...arguments)
}

module.exports = { log, info, warn, error, success}