var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var _ = require('lodash')
var readline = require('readline')
var request = require('./request')
var ProxyIP = require('./proxy_ip')
var common = require('./common')

function formatOfficialList($) {
  let list = []

  // 获取公众号列表
  const listAssign = (idx, k, v) => {
    if (!list[idx]) list[idx] = {}
    list[idx][k] = v
  }

  // 名字
  $('.gzh-box2 .txt-box .tit a').each((idx, el) => {
    listAssign(idx, 'title', $(el).text())
  })

  // 微信号
  $('.gzh-box2 .txt-box .info label').each((idx, el) => {
    listAssign(idx, 'id', $(el).text())
  })

  // 二维码
  $('.gzh-box2 .ew-pop .pop img').each((idx, el) => {
    if ($(el).attr('class') !== 'shot-img') {
      listAssign(idx, 'qrcode', $(el).attr('src'))
    }
  })

  // 文章链接
  $('.gzh-box2 .img-box a').each((idx, el) => {
    listAssign(idx, 'detail', $(el).attr('href'))
  })

  // 头像
  $('.gzh-box2 .img-box a img').each((idx, el) => {
    listAssign(idx, 'photo', $(el).attr('src'))
  })

  // 功能介绍、微信认证、最近文章(包含时间)
  $('.news-list2 li dl').each((idx, el) => {
    let dl = $(el).html()
    let $dl = cheerio.load($(el).html(), {decodeEntities: false})
    $dl('dd').each((idx, el) => {
      let dd = $dl(el).html()

      if (dl.indexOf('功能介绍') >= 0) {
        listAssign(idx, 'description', dd)
      } else if (dl.indexOf('认证') >= 0) {
        listAssign(idx, 'auth', dd)
      } else if (dl.indexOf('最近文章') >= 0) {
        let $dd = cheerio.load(dd, {decodeEntities: false})
        $dd('a').each((idx, el) => {
          listAssign(idx, 'last', {
            url: $dd(el).attr('href'),
            title: $dd(el).text()
          })
        })

        $dd('span').each((idx, el) => {
          // 获取不到时间，输出的html没有
          // console.log($dd.html())
        })
      }
    })
  })

  // 总数
  let number = $(".mun").text()
  if (number) {
    number = number.replace('找到约', '').replace('条结果', '')
  } else {
    // 没有number就说明只有一页
    number = list.length
  }

  // 当前页数
  let page = 1
  $('.p-fy').each((idx, el) => {
    page = $(el).find('span').html()
  })

  return {page, number, data: list}
}

function captcha($) {
  return

  // console.log($.html())
  let seccodeImg = $('img[id="seccodeImage"]').attr('src')
  seccodeImg = 'http://weixin.sogou.com/antispider/' + seccodeImg

  // let captchaUrl = 'http://weixin.sogou.com/antispider/thank.php'
  // let r = $('input[name="r"]').attr('value')
  // let v = 5
  // let rl = readline.createInterface(process.stdin,process.stdout);
  // console.log(r)
  // rl.question('输入验证码：\n',function(answer) {
  //   let c = 'answer' // 输出
  //   superagent.post(captchaUrl)
  //     .set(Headers)
  //     .send({c, v, r})
  //     .end((err, res)=>{
  //       console.log(res.text)
  //     })
  //
  //   rl.close();
  // });
}

/**
 * @param title
 * @param page 每页十个
 */
let ipCount = 1
function searchOfficial(title, page) {
  let buffer = iconv.encode(title, 'utf-8')
  let char = ''
  for (let byte of buffer) {
    char = char + '%' + byte.toString(16)
  }
  let searchUrl = 'http://weixin.sogou.com/weixin?type=1&s_from=input&query=' + char + '&page=' + page

  let onError = (e, ip) => {
    console.log(e.message)
    ProxyIP.destroyIP(ip)

    return common.delay()
      .then(() => {
        ipCount++
        return searchOfficial(title, page)
      })
  }
  return ProxyIP.IP().then((ip) => {
    return request.get(
      searchUrl, {
        proxy: {
          // host: '140.143.96.216',
          // port: '80',
          host: ip.IP,
          port: ip.PORT
        }
      })
      .then((html) => {
        console.log(ip)
        let $ = cheerio.load(html, {decodeEntities: false});
        if ($.html().indexOf('验证码') >= 0) {
          captcha($)
          console.log('需要验证码')
          // throw new Error('需要验证码')
          return onError(new Error('需要验证码'), ip)
        } else {
          return formatOfficialList($)
        }
      })
      .catch((e) => {
        // throw e
        return onError(e, ip)
      })
    })
}

let arr = []
for (let i = 0; i < 10000; i++) {
  arr.push(() => common.delay()
    .then(() => searchOfficial('糖水社区', 1))
    .then((res) => {
      const {data, number, page} = res
      console.log('共:', number, '个')
      console.log('本页有:', data.length, '个')
      console.log('当前是第:', page, '页')
      console.log(res.data.length + '个结果')
      console.log()
    })
    .catch((e) => {
      console.log('Error:', e.message)
    }))
}

ProxyIP.start()
common.syncPromise(arr)

