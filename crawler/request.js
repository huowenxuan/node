var cheerio = require('cheerio');
var superagent = require('superagent')
require('superagent-charset')(superagent)
var _ = require('lodash')
var axios = require('axios')

function getHTML(url, options) {
  options = options || {}
  let charset = options.charset || 'gb2312'

  return new Promise((resolve, reject) => {
    superagent.get(url)
      .set({
        'Accept': 'text/html',
        'Content-Type': 'text/html',
      })
      .timeout(10000)
      .charset(charset)
      .end((err, res) => {
        if (err) {
          return reject(err)
        } else {
          let $ = cheerio.load(res.text, {decodeEntities: false})
          // let title = $('title').html().replace('', '')
          return resolve($)
        }
      })
  })
}

// 不支持charset，但是支持ionic
function getHTML9(url, options) {
  return axios({
    data: null,
    method: 'get',
    url,
    timeout: 10000,
    headers: {
      'Accept': 'text/html',
      'Content-Type': 'text/html',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
      Cookie: '__cfduid=d09699ed4759eab82379833ee2bd3c5841534496967; __utma=50351329.1296256659.1534496968.1534496968.1534496968.1; __utmb=50351329.0.10.1534496968; __utmc=50351329; __utmz=50351329.1534496968.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); CLIPSHARE=88krugfvudbtulvmacl6o6s7f7; __51cke__=; __dtsu=D9E9B66BCE90765BD107181D02F9B7C7; watch_times=1; __tins__3878067=%7B%22sid%22%3A%201534496972740%2C%20%22vd%22%3A%202%2C%20%22expires%22%3A%201534498819895%7D; __51laig__=2'
    }
  }).then((res) => cheerio.load(res.data, {decodeEntities: false}))
}

module.exports = {
  getHTML,
  getHTML9
}
