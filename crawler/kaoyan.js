var async = require('async');
let {getHTML} = require('./request')

function getDetail(url, next) {
  getHTML(url + new Date().getTime(), {charset: 'utf-8'}, (err, res) => {
    if (err) {
      console.log(err)
    } else {
      let time = new Date()
      let showTime = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
      if (res.text().indexOf('服装') >= 0) {
        console.log(showTime, '--', 'YES')
      } else {
        console.log(showTime, '--', 'NO')
      }
    }
  })
}

setInterval(()=>{
  getDetail('https://yz.chsi.com.cn/apply/cjcx/getSch.jsp?ssdm=11&ts=')
}, 10000)
