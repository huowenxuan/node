var axios = require('axios')

const Headers = {
  charset: 'utf-8',
  'Content-Type': 'text/html; charset=UTF-8',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cache-Control': 'max-age=0',
  'Proxy-Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': 1,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',

}

function get(url, configs) {
  if (!configs) configs = {}
  if (!configs.headers) configs.headers = {}
  Object.assign(configs.headers, Headers)

  let params = {method: 'get', url, timeout: 3000}
  Object.assign(params, configs)
  return axios(params).then((res)=>res.data)
}

function post(url, data, cb) {
}

module.exports = {
  get,
  post
}