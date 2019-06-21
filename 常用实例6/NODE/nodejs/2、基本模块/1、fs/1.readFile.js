//文件系统    异步读取
var fs = require('fs');
fs.readFile('aa', 'UTF-8', function (err, data) {//文件系统   读取文件
    if (err) {
        console.log('错误');
    } else {
        console.log(data);
    }
});
fs.readFile('1.bmp', function (err, data) {//读取图片
    if (err) {
        console.log('错误');
    } else {
        console.log(data);
        console.log(data.length + 'bytes');
        var text = data.toString('utf-8');//取到的是一个Buffer对象，Buffer对象可以转换为String
        console.log(text);
        var buf = Buffer.from(text, 'utf-8');//String也可以转换为Buffer对象
        console.log(buf);
    }
});