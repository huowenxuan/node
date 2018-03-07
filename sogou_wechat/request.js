var superagent = require('superagent')
require('superagent-charset')(superagent)
var common = require('./common')

function get(url, params = {headers: {}, charset: 'gb2312'}, cb) {
  let headers = {}
  Object.assign(headers, common.Headers)
  Object.assign(headers, params.headers)
  let charset = params.charset || 'gb2312'

    superagent.get(url)
    .set(headers)
    .timeout(10000)
    .charset(charset)
    .end((err, res) => cb && cb(err, res && res.text))
}

function post(url, data, cb) {
  superagent.post(url)
    .set(Headers)
    .send(data)
    .end((err, res) => cb && cb(err, res && res.text))
}

module.exports = {
  get,
  post
}