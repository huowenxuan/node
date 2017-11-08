var cheerio = require('cheerio');
var http = require('http');
var iconv = require('iconv-lite');
var request = require('request');
var fs = require('fs');

function getDetail(url) {
    if (!url) {
        url = 'http://www.63kmkm.com:8888/video/2017-11/29145.html'
    }
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
                let start = script.indexOf("f:'") + 3
                let end = script.indexOf(".mp4") + 4
                let mp4 = script.substring(start, end)
                console.log(mp4);
            })
        });
    });
}

function getList() {
    let url = 'http://www.63kmkm.com:8888/diao/se57.html'
    let url2 = 'http://www.63kmkm.com:8888/diao/se57_2.html'

    http.get(url, function (sres) {
        var chunks = [];
        sres.on('data', function (chunk) {
            chunks.push(chunk);
        });
        sres.on('end', function () {
            var html = iconv.decode(Buffer.concat(chunks), 'gb2312');
            var $ = cheerio.load(html, {decodeEntities: false});
            $('.video_box a').each(function (index, element) {
                var $element = $(element);
                let detailUrl = "http://www.63kmkm.com:8888" + $element.attr('href')
                getDetail(detailUrl)
            });
        });
    });
}

getList()