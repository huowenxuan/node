var cheerio = require('cheerio');
var async = require('async');
var superagent = require('superagent')
require('superagent-charset')(superagent)
var iconv = require('iconv-lite');

/*
 * TODO: 封装timeout方法
 * TODO: 通过多页的url数组批量获取视频地址
 * TODO: 通过多个视频详情的url数组批量获取视频地址
 */

let Host = 'http://www.ygdy8.com'
let timeoutSecond = 3
const charset = 'gb2312'

let detailTimeoutList = []
let detailErrorList = []
let pageTimeoutList = []
let pageErrorList = []

function logError(text, url, error) {
    console.log(text + url)
    console.log('错误原因：' + error + '\n')
}

// /html/gndy/dyzz/20171126/55612.html
function getDetail(url, next) {
    let timer = setTimeout(()=>{
        // console.log('获取详情超时：'+ url)
        detailTimeoutList.push(url)
        next && next()
        next = null
        clearTimeout(timer)
    }, timeoutSecond * 1000)

    superagent.get(url).charset(charset).end(function (err, res) {
        clearTimeout(timer)

        if (err) {
            // logError('获取详情错误：', url, err)
            detailErrorList.push(url)
            next && next()
        } else {
            let $ = cheerio.load(res.text, {decodeEntities: false});
            let title = $('title').html().replace('', '')
            $("tbody tr td a").each(function (idx, element) {
                let href = $(element).attr('href')
                if (href.indexOf('ftp://') !== -1) {
                	console.log(href)
                }
            })
            next && next()
        }
    })
}

// /html/gndy/dyzz/list_23_1.html
function getList(url, next, limit, count) {
    let timer = setTimeout(()=>{
        pageTimeoutList.push(url)
        // console.log('获取一页超时'+ url)
        next && next()
        next = null
        clearTimeout(timer)
    }, timeoutSecond * 1000)

    superagent.get(url).charset(charset).end(function (err, res) {
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
            $('tbody tr td b a').each(function (index, element) {
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

// 获取最新
function getNews(start, end) {
    let asyncList = []
    for (let i = start; i < end; i++) {
        let url = Host + '/html/gndy/dyzz/list_23_' + (i + 1) + '.html'
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

// 搜索，不能小于四个字节
function search(text) {
	// text为utf-8，需要转换为gb2312，再encode，失败
    let buffer = iconv.encode(text,'gb2312');
    let char = ''
    for (let byte of buffer) {
        char = char + '%' + byte.toString(16)
    }
    getList('http://s.dydytt.net/plus/search.php?kwtype=0&keyword=' + char)
}

search('白鹿原')
// getNews(0, 2)
