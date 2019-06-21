'use strict';
var fs = require('fs');
//就像可以把两个水管串成一个更长的水管一样，两个流也可以串起来。一个Readable流和一个writable流串起来后，所有的数据自动从Readable流进如Writable流，这种操作叫做pipe

//在node中，Readable流有一个pipe()方法，就是用来干这个事的

//让我们用pipe()把一个文件流和另一个文件流串起来，这样源文件的所有数据就自动写入到目标文件里了，所以，这实际上是一个复制文件的程序：

var rs = fs.createReadStream('output.txt');
var ws = fs.createWriteStream('output2.txt');
rs.pipe(ws);
//默认情况下，当Readable流的数据读取完毕，end事件触发后，将自动关闭Writable流，如果不需要关闭Writable流，需要传入参数：
//rs.pipe(ws, {end: false})