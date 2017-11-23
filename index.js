
var cheerio = require('cheerio');
var http = require('http');
var iconv = require('iconv-lite');
var request = require('request');
var fs = require('fs');

let Host = 'http://www.79kmkm.com'

function getDetail(url) {
  if (!url) {
    url = Host + ':8888/video/2017-11/29145.html'
  }
  return new Promise((resolve)=>{
    http.get(url, function (sres) {
      var chunks = [];
      sres.on('data', function (chunk) {
        chunks.push(chunk);
      });
      sres.on('end', function () {
        var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
        var $ = cheerio.load(html, {decodeEntities: false});
        // 获取到的数据只有script中有mp4
        let title = $('title').html().replace('在线观看-国产-27pao视频免费在线视频', '')
        // console.log(title)
        $("script").each(function (idx, element) {
          let script = $(element).html()
          if (script.indexOf('flashvars') !== -1) {
            let start = script.indexOf("f:'") + 3
            let end = script.indexOf(".mp4") + 4
            let mp4 = script.substring(start, end)
            console.log(mp4);
            resolve(mp4)
          }
        })
      });
    });
  })

}

async function getList(url) {
  if (!url) {
    url = Host + ':8888/diao/se57.html'
  }
  let url2 = Host + ':8888/diao/se57_2.html'

  return new Promise((resolve)=>{
    http.get(url, function (sres) {
      var chunks = [];
      sres.on('data', function (chunk) {
        chunks.push(chunk);
      });
      sres.on('end', function () {
        var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
        var $ = cheerio.load(html, {decodeEntities: false});
        $('.video_box a').each(async function (index, element) {
          var $element = $(element);
          let detailUrl = "http://www.63kmkm.com:8888" + $element.attr('href')
          await getDetail(detailUrl)
        });
        resolve()
      });
    });
  })


}

async function getLists(start, end) {
  for(let i = start; i < end; i++) {
    if (i === 0) {
      await getList(Host + ':8888/diao/se57.html')
    } else {
      await getList(Host + ':8888/diao/se57_' + (i+1) + '.html')
    }
    console.log('=========', i, '/', end - start)
    
  }
}

getLists(0, 15)
// getList('http://www.79kmkm.com' + ':8888/diao/se57.html').then(()=>{}).catch(()=>{})
// getList('http://www.21kmkm.com' + ':8888/diao/se57.html').then(()=>{}).catch(()=>{})
// getList('http://www.92kmkm.com' + ':8888/diao/se57.html').then(()=>{}).catch(()=>{})
// getList('http://www.25kmkm.com' + ':8888/diao/se57.html').then(()=>{}).catch(()=>{})

// getList('http://www.91kmkm.com' + ':8888/diao/se57.html').then(()=>{}).catch(()=>{})
// getList('http://www.68kmkm.com' + ':8888/diao/se57.html').then(()=>{}).catch(()=>{})
