'use strict';
var http = require('http');//导入模块
var server = http.createServer(function (request, response) {
    console.log(request.method + ':' + request.url);
    response.writeHead(200, {'Content-type': 'text/html'});
    response.end('<h1>Hello World</h1>');
});
server.listen(8080);