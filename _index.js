var cheerio = require('cheerio');
var async = require('async');
var superagent = require('superagent')
require('superagent-charset')(superagent)

/*
 * TODO: 封装timeout方法
 * TODO: 通过多页的url数组批量获取视频地址
 * TODO: 通过多个视频详情的url数组批量获取视频地址
 */

// http://www.68kvkv.com/ http://www.91kmkm.com/ http://www.25kmkm.com/ http://www.21kmkm.com/ http://www.92kmkm.com/
// http://www.79kmkm.com/ 67popo.com 85kvkv.com
let Host = 'http://www.85kvkv.com'
let timeoutSecond = 2

let detailTimeoutList = []
let detailErrorList = []
let pageTimeoutList = []
let pageErrorList = []

function logError(text, url, error) {
    console.log(text + url)
    console.log('错误原因：' + error + '\n')
}

// eg: /video/2017-11/29494.html
function getDetail(url, next) {
    let timer = setTimeout(()=>{
        // console.log('获取详情超时：'+ url)
        detailTimeoutList.push(url)
        next && next()
        next = null
        clearTimeout(timer)
    }, timeoutSecond * 1000)

    superagent.get(url).charset('gb2312').end(function (err, res) {
        clearTimeout(timer)

        if (err) {
            // logError('获取详情错误：', url, err)
            detailErrorList.push(url)
            next && next()
        } else {
            let $ = cheerio.load(res.text, {decodeEntities: false});
            // 获取到的数据只有script中有mp4
            let title = $('title').html().replace('在线观看-国产-27pao视频免费在线视频', '')
            $("script").each(function (idx, element) {
                let script = $(element).html()
                if (script.indexOf('flashvars') !== -1) {
                    let start = script.indexOf("f:'") + 3
                    let end = script.indexOf(".mp4") + 4
                    let mp4 = script.substring(start, end)
                    next && console.log(mp4);
                }
            })
            next && next()
        }
    })
}

// getDetail('http://www.85kvkv.com/video/2017-11/29547.html')

// getDetail(Host + '/video/2017-11/29494.html')

// eg: /diao/se57.html  /diao/se57_2.html
function getList(url, next, limit, count) {
    let timer = setTimeout(()=>{
        pageTimeoutList.push(url)
        // console.log('获取一页超时'+ url)
        next && next()
        next = null
        clearTimeout(timer)
    }, timeoutSecond * 1000)

    superagent.get(url).charset('gb2312').end(function (err, res) {
        clearTimeout(timer)

        if (err) {
            // logError('获取一页错误：', url, err)
            pageTimeoutList.push(url)
            next && next()
        } else {
            if (limit !== undefined && limit !== null && count !== undefined && count !== null) {
                console.log(`正在获取第${limit}页，共${count}页`)
            }

            let $ = cheerio.load(res.text, {decodeEntities: false});
            let asyncList = []
            $('.video_box a').each(function (index, element) {
                let $element = $(element);
                let detailUrl = Host + $element.attr('href')
                asyncList.push((next2) => getDetail(detailUrl, next2))
            });
            // 并行
            async.parallel(asyncList, (err, res) => {
                next && next()
            })
        }
    })
}

// getList(Host + '/diao/se57.html')

function getLists(start, end) {
    let asyncList = []
    for (let i = start; i < end; i++) {
        let url = Host + '/diao/se57.html'
        if (i !== 0) url = Host + '/diao/se57_' + (i + 1) + '.html'

        asyncList.push((next) => {
            // 不知为何，直接传next不可以，必须在这里执行
            getList(url, ()=>{next()}, i, end - start)
        })
    }

    // 串行
    async.series(asyncList, (err, res) => {
        console.log('详情超时：')
        console.log(detailTimeoutList)
        console.log('详情错误：')
        console.log(detailErrorList)
        console.log('一页超时：')
        console.log(pageTimeoutList)
        console.log('一页错误：')
        console.log(pageErrorList)
    })
}

getLists(0, 15)

