let second = 0
let timer
//     request(mp4)
//         .on('response', function (response) {
//             console.log('开始下载')
//             timer  = setInterval(()=>{
//     			second ++
//     			console.log('下载中', second)
//     		}, 1000)
//         })
//         .on('data', function () {
//             // console.log('下载中')
//         })
//         .on('close', () => {
//             console.log('下载完成')
//             clearTimeout(timer)
//         })
//         .on('error', () => {
//             console.log('下载失败')
//             clearTimeout(timer)
//         })
//         .pipe(fs.createWriteStream(title + '.mp4'))