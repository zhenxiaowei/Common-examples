/*
* nodejs的组成：
 1、引入required模块:我们可以使用require指令来载入nodejs模块
 2、创建服务器：服务器可以监听客户端的请求，类似于Apache Nginx等HTTP服务器。
 3、接收请求与响应请求：服务器很容易创建，客户端可以使用浏览器或终端发送HTTP请求，服务器接收请求后返回响应数据。
 * */




//创建nodejs应用
//步骤一：引入required模块    我们可以使用require指令来载入HTTP模块，并将实例化的HTTP赋值给变量http，实例如下：
var http = require("http");
//步骤二：创建服务器
//接下来我们使用http.createServer()方法创建服务器，并使用listen方法绑定8888端口。函数通过request，response参数来接收和响应数据
http.createServer(function (request, response) {
    //发送http头部
    //http状态值：200：ok
    //内容类型：text/plain
    response.writeHead(200, {'Content-Type': 'text/plain'});

    //发送响应数据 "Hello World"
    response.end("Hello World");
}).listen(8888);

//终端打印
console.log('127.0.0.1:8888');

/*
* 分析nodejs的http服务器
* 1、第一行请求(require)nodejs自带的http模块，并且把它赋值给变量http
* 2、调用http模块提供的函数：createServer   这个函数会返回一个对象，这个对象有一个listen方法，这个方法有一个数值参数，指定这个http服务器监听的端口号
* */