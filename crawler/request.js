var cheerio = require('cheerio');
var superagent = require('superagent')
require('superagent-charset')(superagent)
var _ = require('lodash')
var axios = require('axios')

function getHTML(url, options) {
  options = options || {}
  let charset = options.charset || 'gb2312'

  return new Promise((resolve, reject)=>{
    superagent.get(url)
      .set({
        Referer: url,
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36"
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

// 不支持charset，但是可以上去9
function getHTML9(url, options) {
  return axios({
    data: null,
    method: 'get',
    url,
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((res) => res.data)
}

module.exports = {
  getHTML,
  getHTML9
}