'use strict'; //严格模式
var fs = require('fs');
//同步读取文件
var data = fs.readFileSync('aa', 'utf-8');
console.log(data);
//如果同步读取文件发生错误，则需要用try...catch捕获该错误
try {
    var data1 = fs.readFileSync('aa', 'utf-8');
    console.log(data1);
} catch (e) {
    console.log(e);
}