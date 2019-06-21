'use strict';
var fs = require('fs');
/*
 * 在nodejs中，流也是一个对象，我们只需要响应流的事件就可以了，data事件表示流的数据已经可以开始读取了，end事件表示这个流已经到末尾了，没有数据可以读取了，err事件表示出错了
 * */

//打开一个流
var rs = fs.createReadStream('aa', 'utf-8');

rs.on('data', function (chunk) {
    console.log(chunk);
});
rs.on('end', function () {
    console.log('END');
});
rs.on('error', function (err) {
    console.log('error:'+err);
});
//要注意，data事件可能有多次，每次传递的chunk是流的一部分数据


//要以流的形式写入文件，只需要不断的调用write()方法，最后以end()结束：
var ws1=fs.createWriteStream('output.txt','utf-8');
ws1.write('使用Strean流写入的数据');
ws1.write('end');
ws1.end();


var ws2=fs.createWriteStream('output2.txt');
ws2.write(new Buffer('使用Strean流写入的二进制数据','utf-8'));
ws2.write(new Buffer('end','utf-8'));
ws2.end();
//所有可以读取的流都继承自stream.Readable,所有可以写入的流都继承自stream.Writable
