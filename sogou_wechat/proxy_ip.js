var request = require('./request')
var cheerio = require('cheerio');

function getAPage(page = 1, cb) {
  request.get(`https://www.kuaidaili.com/free/inha/${page}/`, {charset: 'utf8'}, (err, res) => {
    if (err) {
      cb && cb(err, null)
      return
    }

    let $ = cheerio.load(res, {decodeEntities: false})
    let list = []
    $('#list .table tr').each((idx, el) => {
      let $tr = cheerio.load(res, {decodeEntities: false})
      let item = null
      $tr('td').each((idx, el) => {
        if (!item) item = {}
        item[$tr(el).attr('data-title')] = $tr(el).text()
      })

      item && list.push(item)
    })

    cb && cb(null, list)
  })
}

function getPages(pages, cb) {
  let current = 1

  let all = []
  let run = () => {
    getAPage(current, (err, data) => {
      if (err) {
        cb && cb(err, null)
        return
      }

      console.log(`第${current}页`)
      console.log(`获取到${data.length}个`)
      all.push(...data)

      if (current < pages) {
        current++
        setTimeout(() => run(), 1000)
      } else {
        cb && cb(null, all)
      }
    })
  }

  run()
}

getPages(3, (err, data)=>{
  console.log(data.length)
})