const dotenv = require('dotenv')
dotenv.config()

function log () {
  if (process.env.VERBOSE) {
    // Array.prototype.forEach.call(arguments, arg => console.log(arg))
    console.log('[LOG] ', ...arguments)
  }
}
module.exports = log