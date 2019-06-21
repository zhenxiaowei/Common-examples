'use strict';
var fs = require('fs');
var url = require('url');
var path = require('path');
var http = require('http');

var root = path.resolve(process.argv[2] || '.');//默认是当前目录
var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;//获取url的path
    var filepath = path.join(root, pathname);//获取对应的本地文件路径
    console.log(filepath);
    //filepath = filepath + 'aa.txt';
    //获取文件状态
    fs.stat(filepath, function (err, stats) {
        if (!err && stats.isFile()) {//没有出错，文件存在
            response.writeHead(200);
            //将文件流导入response
            fs.createReadStream(filepath).pipe(response);
        } else {
            //出错了，或文件不存在
            //发生404响应
            response.writeHead(404);
            response.end('404 not Found');
        }
    })
});
server.listen(8082);
//访问路径 http://localhost:8082/index.html   可以把对应文件的内容发生到浏览器




