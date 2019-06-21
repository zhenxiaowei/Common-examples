//1、nodejs事件循环
/*
 nodejs是单进程单线程应用程序，但是因为V8引擎提供的异步执行回调接口，通过这些接口可以处理大量的并发，所以性能非常高
 nodejs几乎每一个API都是支持回调函数的
 nodejs基本上所有的事件机制都是用设计模式中观察者模式实现
 nodejs单线程类似于进入一个while(true)的事件循环，直到没有事件观察者退出，每个异步事件都生成一个事件观察者，如果有事件发生就调用该回调函数
* */

//2、事件驱动程序
//nodejs有很多内置事件，我们可以通过events模块，并通过实例化EventEmitter类来绑定和监听事件，如：

//引入events模块
var events=require("events");

//创建eventsEmitter对象
var eventEmitter=new events.EventEmitter();

//创建事件处理程序
var eventHander= function () {
    console.log("连接成功");
    //触发事件
    eventEmitter.emit("data_received");
};
//以下程序绑定事件处理程序
eventEmitter.on("connection",eventHander);

//使用匿名函数绑定data_received事件
eventEmitter.on("data_received", function () {
    console.log("数据接收成功");
});

//触发connection事件
eventEmitter.emit("connection");

console.log("程序执行结束");




//程序是如何工作的
var fs=require("fs");
fs.readFile('input.txt', function (err,data) {
    if(err){
        console.error(err.stack);
        return;
    }
    console.log(data.toString());
});
console.log("程序执行结束1");
/*
*以上程序中fs.readFile()是异步函数用于读取文件。如果在读取文件时发生错误，错误err对象就会输出错误信息。
 * 如果没有发生错误，readFile跳过err对象的输出，文件内容就通过回调函数输出
* */








