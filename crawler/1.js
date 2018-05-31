let {getHTML} = require('./request')

const OriginalHost = 'http://www.66kvkv.com'
let Host = OriginalHost

function getDetail(url) {
  return getHTML(url)
    .then($=>{
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
      return src
    })
    .catch((err)=>{
      if (err.timeout) {
        console.log('详情超时：' + url)
      } else {
        console.log('详情错误：' + url)
      }
      throw err
    })
}

function getList(url, start, end, onGetDetail, onDetailError) {
  if (start !== undefined && start !== null && end !== undefined && end !== null) {
    console.log(`正在获取第${start}页，共${end}页`)
  }
  return getHTML(url)
    .then($ => {
      let list = []
      $('.video_box a').each(function (index, element) {
        let $element = $(element);
        let detailUrl = Host + $element.attr('href')
        getDetail(detailUrl)
          .then((url)=>{
            list.push(url)
            onGetDetail && onGetDetail(url)
          })
          .catch(onDetailError)
      });
      return list
    })
    .catch((err)=>{
      if (err.timeout) {
        console.log('一页超时：' + url)
      } else {
        console.log('一页错误：' + url)
      }
      throw err
    })
}

async function getLists(start, end, onGetDetail, onDetailError, onGetList, onListError) {
  let error = null
  for (let i = start; i <= end; i++) {
    let url = Host + '/diao/se57.html'
    if (i !== 1) {
      url = Host + '/diao/se57_' + i + '.html'
    }
    try {
      let urls = await getList(url, i, end, onGetDetail, onDetailError)
      onGetList && onGetList(urls)
    } catch(e) {
      error = e
      onListError && onListError(e)
    }
  }
  
  if (error) {
    throw error
  } else {
    return
  }
}

function setHost(host) {
  Host = host
}

// 5.29
module.exports = {
  setHost,
  Host,
  getDetail,
  getList,
  getLists,
}
