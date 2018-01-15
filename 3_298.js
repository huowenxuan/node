var async = require('async');
let {getHTML} = require('./request')

// 68kvkv 91kmkm 25kmkm 21kmkm 92kmkm 79kmkm 67popo 85kvkv 85kvkv 60 76 78kvkv 00pcpc 05pcpc 02pcpc
let Host = 'https://www.653cc.com'

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

// https://www.298aa.com/htm/vod1/718.htm
function getDetail(url, next) {
  getHTML(url, null, (err, $) => {
    if (err) {
      next && next(null, null)
      if (err.timeout) {
        detailTimeoutList.push(url)
      } else {
        detailErrorList.push(url)
      }
      console.log(err)
    } else {
      // 获取到的数据只有script中有mp4
      let mp4s = []
      $("div[class=mox] script").each(function (idx, element) {
        let script = $(element).html()
        if (script.indexOf('.mp4') >= 0) {
          let startIndex = script.indexOf('http:')
          let endIndex = script.indexOf('";')
          if(startIndex >= 0) {
            let mp4 = script.substring(startIndex, endIndex)
            console.log(mp4)
            mp4s.push(mp4)
          }
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
      let getMp4 = (element) => {
        let $element = $(element);
        let detailUrl = Host + $element.attr('href')
        asyncList.push((next2) => getDetail(detailUrl, next2))
      }

      $('div[class="box dy_list"] ul li a').each(function (index, element) {
        getMp4(element)
      });
      // 网页有两种格式
      $('div[class="thumbs"] a').each(function (index, element) {
        getMp4(element)
      });
      // 并行
      console.log(asyncList.length)
      async.parallel(asyncList, next)
    }
  })
}

// getDetail('https://www.298aa.com/htm/vod1/718.htm')
getList('https://www.653cc.com/htm/mp4list7/')

// getList(Host + '/diao/se57.html')

function getLists(start, end, cb) {
  let asyncList = []

  for (let i = start; i <= end; i++) {
    let url = Host + '/diao/se57.html'
    if (i !== 1) url = Host + '/diao/se57_' + i + '.html'
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

// getLists(6, 25, (err, cb) => {
//
// })
module.exports = {
  getLists,
}
