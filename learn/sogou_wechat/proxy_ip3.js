var request = require('./request')
var cheerio = require('cheerio');
var common = require('./common')

let _Pool = []
let _CurrentIP = null

// 单例
let __instance = (function () {
  let instance;
  return (newInstance) => {
    if (newInstance) instance = newInstance;
    return instance;
  }
}());

class ProxyIP {
  constructor() {
    if (__instance()) {
      return __instance();
    }
    __instance(this)
  }

  static _getAPage(page = 1) {
    return request.get(`https://www.kuaidaili.com/free/inha/${page}/`)
      .then((res) => {
        console.log(`正在获取第${page}页IP`)
        let $ = cheerio.load(res, {decodeEntities: false})
        let list = []
        $('#list .table tr').each((idx, el) => {
          let $tr = cheerio.load(el, {decodeEntities: false})
          let item = null
          $tr('td').each((idx, el) => {
            if (!item) item = {}
            item[$tr(el).attr('data-title')] = $tr(el).text()
          })

          item && list.push(item)
        })

        console.log(`获取到${list.length}个IP`)
        return common.delay().then(() => list)
      })
  }

  /**
   * 每页15个
   */
  static _getPages(pages) {
    let syncList = []
    for (let i = 0; i < pages; i++) {
      syncList.push(() => ProxyIP._getAPage(i + 1))
    }

    return common.syncPromise(syncList).then((res) => {
      let all = []
      for (let page of res) {
        all.push(...page)
      }
      return all
    })
  }

  /**
   * 产生几个ip，不一定是number，因为是以页数为单位
   */
  // static _refreshPool(number) {
  //   console.log('刷新IP池')
  //   let pages = Math.ceil(number / 15.0)
  //   return ProxyIP._getPages(pages).then((res) => {
  //     _Pool = res
  //     return res
  //   })
  // }

  static _refreshPool() {
    // let url = 'http://dev.kuaidaili.com/api/getproxy/?orderid=922049976810388&num=100&b_pcchrome=1&b_pcie=1&b_pcff=1&b_android=1&b_iphone=1&protocol=1&method=2&an_tr=1&an_an=1&an_ha=1&sp1=1&dedup=1&sep=4'
    let url = 'http://tvp.daxiangdaili.com/ip/?tid=558772717532626&num=10&delay=1'
    return request.get(url)
      .then((res)=>{
        return _Pool = res.split('\r\n').map((el)=>{
          let ip = el.split(':')
          return {IP: ip[0], PORT: ip[1]}
        })
      })
  }

  /**
   * 获取IP池，没有就自动刷新
   */
  static _Pool() {
    return _Pool.length > 0
      ? Promise.resolve(_Pool)
      : ProxyIP._refreshPool(1)
  }

  static IP() {
    return _CurrentIP
      ? Promise.resolve(_CurrentIP)
      : ProxyIP.nextIP().then((ip)=> {
        console.log(ip)
        return ip
      })
  }

  /**
   * 根据IP池和当前IP的位置来切换下个IP
   */
  static nextIP() {
    return ProxyIP._Pool().then(() => {
      if (!_CurrentIP) {
        console.log('没有IP，使用第0个IP')
        _CurrentIP = _Pool[0]
        return _CurrentIP
      }

      let index = _Pool.indexOf(_CurrentIP)
      if (index < _Pool.length - 1) {
        console.log('有IP，取IP池的下一个IP')
        _CurrentIP = _Pool[index + 1]
        return _CurrentIP
      } else {
        console.log('IP池使用完，获取新的IP池')
        _Pool = []
        return ProxyIP.nextIP()
      }
    })
  }
}

module.exports = {
  IP: ProxyIP.IP,
  nextIP: ProxyIP.nextIP
}
