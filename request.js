var cheerio = require('cheerio');
var superagent = require('superagent')
require('superagent-charset')(superagent)
var _ = require('lodash')

function getHTML(url, options, cb) {
    options = options || {}
    let charset = options.charset || 'gb2312'

    superagent.get(url)
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
    getHTML
}