var async = require('async');
let {getHTML} = require('./request')

let Host = 'http://www.66kvkv.com'

let detailTimeoutList = []
let detailErrorList = []
let pageTimeoutList = []
let pageErrorList = []

function clearError() {
  detailErrorList = []
  detailTimeoutList = []
  pageTimeoutList = []
  pageErrorList = []
}

function handleError() {
  console.log('详情超时：', detailTimeoutList)
  console.log('详情错误：', detailErrorList)
  console.log('一页超时：', pageTimeoutList)
  console.log('一页错误：', pageErrorList)

  return {
    'timeoutDetail': detailTimeoutList,
    'timeoutPage': pageTimeoutList,
    'errorDetail': detailErrorList,
    'errorPage': pageErrorList
  }
}

function getDetail(url, next) {
  getHTML(url, null, (err, $) => {
    if (err) {
      next && next(null, null)
      if (err.timeout) {
        detailTimeoutList.push(url)
      } else {
        detailErrorList.push(url)
      }
    } else {
      let src = ''
      $('script').each(function (idx, el){
        let script = $(el).html()
        if (script.indexOf('flashvars') > -1) {
          let start = script.indexOf("f:'") + "f:'".length
          let end = script.indexOf("',")
          src = script.substring(start, end)
          console.log(src)
        }
      })
      next && next(null, src)
    }
  })
}

function getList(url, next, start, end) {
  getHTML(url, null, (err, $) => {
    if (start !== undefined && start !== null && end !== undefined && end !== null) {
      console.log(`正在获取第${start}页，共${end}页`)
    }

    if (err) {
      if (err.timeout) {
        pageTimeoutList.push(url)
      } else {
        pageErrorList.push(url)
      }
      next && next(null, null)
    } else {
      let asyncList = []
      $('.video_box a').each(function (index, element) {
        let $element = $(element);
        let detailUrl = Host + $element.attr('href')
        asyncList.push((next2) => getDetail(detailUrl, next2))
      });
      // 并行
      async.parallel(asyncList, next)
    }
  })
}

function getLists(start, end, cb) {
  let asyncList = []

  for (let i = start; i <= end; i++) {
    let url = Host + '/diao/se57.html'
    if (i !== 1) {
      url = Host + '/diao/se57_' + i + '.html'
    }
    asyncList.push((next2) => getList(url, next2, i, end))
  }

  clearError()
  // 串行
  async.series(asyncList, (err, res) => {
    if (err) {

    } else {
      cb && cb(handleError(), res)
    }
  })
}

// getDetail('http://www.24gmgm.com/video/2018-3/32543.html')
// getList(Host + '/diao/se57.html')
// 5.13
getLists(1, 25, (err, cb) => {
  //
})
module.exports = {
  getLists,
}
