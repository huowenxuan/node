var cheerio = require('cheerio');
var http = require('http');
var iconv = require('iconv-lite');
var request = require('request');
var fs = require('fs');

function getDianying() {
    var url = 'http://www.ygdy8.net/html/gndy/dyzz/index.html';
    http.get(url, function (sres) {
        var chunks = [];
        sres.on('data', function (chunk) {
            chunks.push(chunk);
        });
        // chunks里面存储着网页的 html 内容，将它zhuan ma传给 cheerio.load 之后
        // 就可以得到一个实现了 jQuery 接口的变量，将它命名为 `$`
        // 剩下就都是 jQuery 的内容了
        sres.on('end', function () {
            var titles = [];
            //由于咱们发现此网页的编码格式为gb2312，所以需要对其进行转码，否则乱码
            //依据：“<meta http-equiv="Content-Type" content="text/html; charset=gb2312">”
            var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
            var $ = cheerio.load(html, {decodeEntities: false});
            $('.co_content8 .ulink').each(function (idx, element) {
                var $element = $(element);
                titles.push({
                    title: $element.text()
                })
            })
            console.log(titles);
        });
    });
}

function downloadFile(uri, filename) {

}

function getDetail() {
    let url = 'http://www.63kmkm.com:8888/video/2017-11/29145.html'
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
            console.log(title)
            $("script").each(function (idx, element) {
                let script = $(element).html()
                if (script.indexOf('flashvars') !== -1) {
                    let start = script.indexOf("f:'") + 3
                    let end = script.indexOf(".mp4") + 4
                    let mp4 = script.substring(start, end)
                    console.log(mp4);
                    let dataIndex = 0
                    request(mp4)
                        .on('response', function (response) {
                            console.log('开始下载')
                        })
                        .on('data', function () {
                            console.log('下载中', dataIndex++)
                        })
                        .on('close', () => {
                            console.log('下载完成')
                        })
                        .on('error', () => {
                            console.log('下载失败')
                        })
                        .pipe(fs.createWriteStream(title + '.mp4'))
                }
            })
        });
    });
}

getDetail()

function getList() {
    let url = 'http://www.63kmkm.com:8888/diao/se57.html'
    let url2 = 'http://www.63kmkm.com:8888/diao/se57_2.html'
}