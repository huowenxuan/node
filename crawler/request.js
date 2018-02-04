var cheerio = require('cheerio');
var superagent = require('superagent')
require('superagent-charset')(superagent)
var _ = require('lodash')

function getHTML(url, options, cb) {
  options = options || {}
  let charset = options.charset || 'gb2312'

  superagent.get(url)
    .set({
      Referer: url,
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36"
    })
    .timeout(10000)
    .charset(charset)
    .end((err, res) => {
      if (err) {
        cb && cb(err, null)
      } else {
        let $ = cheerio.load(res.text, {decodeEntities: false});
        // let title = $('title').html().replace('', '')
        cb && cb(null, $)
      }
    })
}

module.exports = {
  getHTML,
}