'use strict'; //严格模式
var fs = require('fs');
var data='Hello NodeJs';
fs.writeFile('output.txt',data,function(err){
   if(err){
       console.log(err);
   } else{
       console.log('ok');
   }
});
/*
* writeFile()的参数依次为文件名、数据和回调函数。如果传入的是String，默认按utf-8编码写入文件，如果传入的是Buffer，则写入时二进制文件，回调函数只关心成功与否，只需一个err参数
* 和readFile类似，writeFile()也有一个同步方法，叫writeFileSync();
* */
fs.writeFileSync('output1.txt',data);