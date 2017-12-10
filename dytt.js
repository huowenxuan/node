var async = require('async');
var iconv = require('iconv-lite');
let {getHTML} = require('./request')

let Host = 'http://www.ygdy8.net' // net不反爬，com反爬
let SearchHost = 'http://www.ygdy8.com' // 只有com可跳转到搜索

let detailTimeoutList = []
let detailErrorList = []
let pageTimeoutList = []
let pageErrorList = []

function clearError() {
    detailErrorList = []
    detailTimeoutList = []
    pageTimeoutList = []
    pageErrorList = []
}

function handleError() {
    console.log('详情超时：', detailTimeoutList)
    console.log('详情错误：', detailErrorList)
    console.log('一页超时：', pageTimeoutList)
    console.log('一页错误：', pageErrorList)

    return {
        'timeoutDetail': detailTimeoutList,
        'timeoutPage': pageTimeoutList,
        'errorDetail': detailErrorList,
        'errorPage': pageErrorList
    }
}

// /html/gndy/dyzz/20171126/55612.html
function getDetail(url, next) {
    getHTML(url, null, (err, $) => {
        if (err) {
            next && next()
            if (err.timeout) {
                detailTimeoutList.push(url)
            } else {
                detailErrorList.push(url)
            }
        } else {
            let hrefs = []
            $("tbody tr td a").each(function (idx, element) {
                let href = $(element).attr('href')
                if (href.indexOf('ftp://') !== -1) {
                    console.log(href)
                    hrefs.push(href)
                }
            })
            next && next(null, hrefs)
        }
    })
}

// /html/gndy/dyzz/list_23_1.html
function getList(host = Host, url, next, start, end) {
    getHTML(url, null, (err, $) => {
        if (start !== undefined && start !== null && end !== undefined && end !== null) {
            console.log(`正在获取第${start}页，共${end}页`)
        }

        if (err) {
            next && next()
            if (err.timeout) {
                pageTimeoutList.push(url)
            } else {
                pageErrorList.push(url)
            }
        } else {
            let asyncList = []
            $('tbody tr td b a').each(function (index, element) {
                let detailUrl = host + $(element).attr('href')
                asyncList.push((next2) => getDetail(detailUrl, next2))
            });
            // 并行 parallel 串行 series parallelLimit
            async.parallel(asyncList, next)
        }
    })
}

// 获取最新
function getNews(start, end, cb) {
    let asyncList = []

    for (let i = start; i <= end; i++) {
        let url = Host + '/html/gndy/dyzz/list_23_' + i + '.html'
        asyncList.push((next) => getList(Host, url, next, i, end))
    }

    clearError()
    // 串行
    async.series(asyncList, (err, res) => {
        cb && cb(handleError(), res)
    })
}

// 搜索，不能小于四个字节
function search(text, cb) {
    // text为utf-8，需要转换为gb2312，再encode，失败
    let buffer = iconv.encode(text, 'gb2312');
    let char = ''
    for (let byte of buffer) {
        char = char + '%' + byte.toString(16)
    }

    clearError()
    getList(SearchHost, 'http://s.dydytt.net/plus/search.php?kwtype=0&keyword=' + char, (err, res) => {
        cb && cb(handleError(), res)
    })
}

search('尼罗河')

module.exports = {
    getDetail,
    getList,
    getNews,
    search,
}