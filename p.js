var async = require('async');
let {getHTML} = require('./request')

// http://www.68kvkv.com/ http://www.91kmkm.com/ http://www.25kmkm.com/ http://www.21kmkm.com/ http://www.92kmkm.com/
// http://www.79kmkm.com/ 67popo.com 85kvkv.com 85kvkv 60 76 78kvkv
let Host = 'http://www.10soso.com'
let timeoutSecond = 2

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

function logError() {
  console.log('详情超时：', detailTimeoutList)
  console.log('详情错误：', detailErrorList)
  console.log('一页超时：', pageTimeoutList)
  console.log('一页错误：', pageErrorList)
}

function requestTimeout(url, errList, next) {
  let timer = setTimeout(() => {
    errList.push(url)
    next && next(null, null)
    next = null
    clearTimeout(timer)
  }, timeoutSecond * 1000)
  return timer
}

function requestError(url, errList, err, next) {
  errList.push(url)
  next && next(null, null)
  next = null
}

// eg: /video/2017-11/29494.html
function getDetail(url, next) {
  let timer = requestTimeout(url, detailTimeoutList, next)
  getHTML(url, null, (err, $)=>{
    clearTimeout(timer)
    if (err) {
      requestError(url, detailErrorList, err, next)
    } else {
      // 获取到的数据只有script中有mp4
      let mp4s = []
      $("script").each(function (idx, element) {
        let script = $(element).html()
        if (script.indexOf('flashvars') !== -1) {
          let start = script.indexOf("f:'") + 3
          let end = script.indexOf(".mp4") + 4
          let mp4 = script.substring(start, end)
          mp4s.push(mp4)
        }
      })
      next && next(null, mp4s)
    }
  })
}

// getDetail('http://www.85kvkv.com/video/2017-11/29547.html')
// getDetail(Host + '/video/2017-11/29494.html')

// eg: /diao/se57.html  /diao/se57_2.html
function getList(url, next, start, end) {
  let timer = requestTimeout(url, pageTimeoutList, next)
  getHTML(url, null, (err, $)=>{
    if (start !== undefined && start !== null && end !== undefined && end !== null) {
      console.log(`正在获取第${start}页，共${end}页`)
    }
    clearTimeout(timer)
    
    if (err) {
      requestError(url, pageErrorList, err, next)
    } else {
      let asyncList = []
      $('.video_box a').each(function (index, element) {
        let $element = $(element);
        let detailUrl = Host + $element.attr('href')
        asyncList.push((next2) => getDetail(detailUrl, next2))
      });
      // 并行
      async.parallel(asyncList, (err, res) => {
        next && next(null, res)
      })
    }
  })
}

// getList(Host + '/diao/se57.html')

function getLists(start, end, cb) {
  let asyncList = []

  for (let i = start; i <= end; i++) {
    let url = Host + '/diao/se57.html'
    if (i !== 1) url = Host + '/diao/se57_' + i + '.html'
    asyncList.push((next) => getList(url, next, i, end))
  }

  clearError()
  // 串行
  async.series(asyncList, (err, res) => {
    cb && cb(err, res)
    logError()
    // console.log(err)
  })
}

// getLists(1, 3, (err, cb)=>{
//  
// })
module.exports = {
  getLists,
}
