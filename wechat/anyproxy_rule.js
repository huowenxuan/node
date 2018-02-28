let URI = require('urijs')

// cmd: anyproxy -i -r file.js
module.exports = {
  summary: 'a rule to hack response',
  * beforeSendResponse(requestDetail, responseDetail) {
    if (requestDetail.url.indexOf('action=home') >= 0) {
      if (responseDetail.response.toString() !== '') {
        let newResponse = responseDetail.response
        let hack_string = "<script>setTimeout(function() {window.location.href='MjM5Njc0MjIwMA=='}, 2000)</script>"
        newResponse.body += hack_string
        newResponse.statusCode = 200
        return newResponse
      }
    }


    // return null
    // let header = requestDetail.requestOptions.headers
    // let uri = new URI(requestDetail.url)
    // let params = URI.parseQuery(uri.query())
    //
    // if (requestDetail.url.indexOf('mp.weixin.qq.com') >= 0) {
    // }
    //
    // console.log(header, params)

    // if (params && params.appmsg_token && header['Cookie']) {
    //   let token = params.appmsg_token
    //   console.log('获取到token：', token)
    //   console.log('获取到Cookie：', header['Cookie'])
    // }

    return null
  },
};