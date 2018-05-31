var cheerio = require('cheerio');
var superagent = require('superagent')
require('superagent-charset')(superagent)
var _ = require('lodash')
var axios = require('axios')


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

// 不支持charset，但是可以上9
function getHTML9(url, options, cb) {
  axios({
    data: null,
    method: 'get',
    url: 'http://91porn.com/index.php',
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  })
    .then((res) => {
      console.log(res.data)
      // let $ = cheerio.load(res.data);
      // cb && cb(null, $)
    })
    .catch((e) => {
      console.log(e)
      cb && cb(e, null)
    })
}

module.exports = {
  getHTML,
  getHTML9
}