let one = require('./crawler/1')
let two = require('./crawler/2.js')
let three = require('./crawler/3.js')
let nine = require('./crawler/9.js')
let dytt = require('./crawler/dytt.js')

module.exports = {
  dytt,
  one,
  two,
  three,
  nine,
}

process.on('unhandledRejection', new Function());

