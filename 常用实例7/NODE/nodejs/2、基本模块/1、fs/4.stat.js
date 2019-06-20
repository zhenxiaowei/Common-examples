'use strict'; //严格模式
var fs = require('fs');
//如果我们要获取文件大小，创建时间等信息，可以使用fs.stat(),它返回一个stat大小，能告诉我们文件或目录的详细信息
fs.stat('aa', function (err,stat) {
   if(err){
       console.log(err);
   } else{
       console.log('isFile：' + stat.isFile());//是否是文件
       console.log('isDirectory:' + stat.isDirectory());//是否是目录
       if(stat.isFile()){
           console.log('size:' + stat.size);//文件大小
           console.log('birth time:' + stat.birthtime);//创建时间，date对象
           console.log('modified time:' + stat.mtime);//文件的修改时间
       }
   }
});
//也有一个同步方法   statSync()