var request = require('./request')
var cheerio = require('cheerio');
var common = require('./common')

let _Pool = new Set()
let _idx = 0

class ProxyIP {
  static _getIP() {
    // let url = 'http://dev.kuaidaili.com/api/getproxy/?orderid=922049976810388&num=100&b_pcchrome=1&b_pcie=1&b_pcff=1&b_android=1&b_iphone=1&protocol=1&method=2&an_tr=1&an_an=1&an_ha=1&sp1=1&dedup=1&sep=4'
    let url = 'http://tvp.daxiangdaili.com/ip/?tid=558772717532626&num=10&delay=1'
    return request.get(url)
      .then((res) => {
        let ips = []
        res.split('\r\n').forEach((el) => {
          let ip = el.split(':')
          if (ip && ip[0] && ip[1]) {
            ips.push({IP: ip[0], PORT: ip[1]})
          }
        })
        _idx = 0
        console.log(`获取到${ips.length}个IP`)
        console.log(`开始检查新获取的${ips.length}个IP`)
        return ips
      })
      .then((ips) => this._check(ips))
  }

  static start() {
    this._getIP()

    setInterval(() => {
      console.log(`例行检查IP池的${_Pool.size}个IP`)
      this._check(_Pool)
    }, 100000)
  }

  static _check(ips) {
    ips = common.toSet(ips)
    let requestList = []
    for (let ip of ips) {
      // let test = 'https://www.jianshu.com/'
      let test = 'http://weixin.sogou.com/weixin?type=1&s_from=input&query=%e7%b3%96%e6%b0%b4%e7%a4%be%e5%8c%ba&page=1\n'
      requestList.push(() => common.delay(200)
        .then(() => request.get(test,
          {proxy: {host: ip.IP, port: ip.PORT}})))
    }

    let success = new Set()
    let fail = new Set()
    return common.syncPromise(requestList, false)
      .then((e) => {
        e.forEach((item, idx) => {
          // 不能通过set[idx]来获取set中对应的值，只能转换为Array
          let arr = Array.from(ips)
          if (item instanceof Error) {
            _Pool.delete(arr[idx])
            fail.add(arr[idx])
          } else {
            success.add(arr[idx])
            _Pool.add(arr[idx])
          }
        })
        console.log(`共${success.size}个合格`)
        console.log(`共${fail.size}个不合格`)
        return _Pool
      })
      .then(() => {
        console.log(`IP池共有${_Pool.size}个IP`)
        if (_Pool.size < 5) {
          console.log('IP不足，开始获取')
          return this._getIP()
        } else {
          console.log('IP足够，不需要再获取')
          return _Pool
        }
      })
  }

  /**
   * 轮询IP池，一旦有IP就直接返回
   */
  static _Pool() {
    return new Promise((resolve) => {
      if (_Pool.size > 0) {
        resolve(_Pool)
      } else {
        this._getIP()
        let timer = setInterval(() => {
          if (_Pool.size > 0) {
            resolve(_Pool)
            clearInterval(timer)
            timer = null
          }
        }, 1000)
      }
    })
  }

  /**
   * 从IP池循环获取IP
   */
  static IP() {
    return this._Pool().then((pool) => {
      if (_idx >= (pool.size - 1)) {
        _idx = 0
      } else {
        _idx++
      }
      console.log(`IP池共有${pool.size}个IP，使用第${_idx + 1}个`)
      return Array.from(pool)[_idx]
    })
  }

  static destroyIP(ip) {
    console.log('废除IP:', ip)
    if (_Pool.has(ip)) {
      _Pool.delete(ip)
    }
  }
}

module.exports = ProxyIP
