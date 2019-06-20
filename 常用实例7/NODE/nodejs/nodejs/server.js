/**
 * Created by Administrator on 2019/1/15.
 */
var http=require("http");
http.createServer(function (request, response) {
    response.writeHead(200,{'Content-Type':'text/plan'});
    response.end("Hello World");
}).listen(8888);
