//1、引入events模块
var events=require("events");

//2、创建eventsEmitter对象
var eventEmitter=new events.EventEmitter();
/*
* events模块只提供了一个对象：events.EventEmitter()
* EventEmitter的核心就是事件触发与事件监听器功能的封装
* */
var EventEmitter=require("events").EventEmitter;
var event=new EventEmitter();
//注册了两个事件监听器
event.on("some_event", function (a1,b1) {
    console.log("some_event1事件触发a1,b1");
});
event.on("some_event", function (a2,b2) {
    console.log("some_event2事件触发a2,b2");
});
setTimeout(function () {
    event.emit("some_event");
},1000);

//3、EventEmitter的方法
//1)、addListener(event,listener) 为指定事件添加一个监听器到监听器数组的尾部
//2)、on(event,listener) 为指定事件注册一个监听器，接收一个字符串event和一个回调函数
eventEmitter.on("connection", function () {
   console.log("connection")
});
eventEmitter.emit("connection");
//3)、once(event,listener) 为指定事件注册一个单次监听器，即监听器最多只会触发一次，触发后立刻解除该监听器
eventEmitter.once("c", function () {
    console.log("c");
});
eventEmitter.emit("c");
//4)、removeListener(event,listener) 移除指定事件的某个监听器，监听器必须是该事件已经注册过的监听器
//它接收两个参数  一个是事件名称，一个是回调函数名称
var callback= function () {
  console.log("移除指定事件的监听器")
};
eventEmitter.on("a",callback);
eventEmitter.emit("a");
//eventEmitter.removeListener('a',callback);

//5)、removeAllListeners([event]) 移除所有事件的监听器，如果指定事件，则移除指定事件的所有监听器
//eventEmitter.removeAllListeners();

//6)、setMaxListeners(n) 默认情况下，EventEmitter如果你添加了超过10个监听器，就会输出警告信息，setMaxListeners函数用于提高监听器的默认限制的数量
//eventEmitter.setMaxListeners();

//7)、listeners(event) 返回指定事件的监听器数组
console.log(event.listeners("c"));

//8)、emit(event,[arg1],[arg2],[...]) 按参数的顺序执行每个监听器，如果事件有注册监听器返回true，否则返回false
console.log(eventEmitter.emit("a"));//注册监听器返回true
console.log(eventEmitter.emit("b"));//返回false


//4、类方法   返回监听器的数量
console.log(eventEmitter.listenerCount('some_event'));



//5、事件
//监听器1
var listener1= function () {
  console.log("监听器listener1执行")
};
//监听器2
var listener2= function () {
    console.log("监听器listener2执行")
};
//绑定abc事件，处理函数为listener1
eventEmitter.addListener('abc',listener1);
//绑定abc事件，处理函数为listener2
eventEmitter.addListener('abc',listener2);
//监听器数量
var eventListeners=eventEmitter.listenerCount("abc");
console.log(eventListeners);
//触发abc事件
eventEmitter.emit('abc');
//移除监听器listener1
eventEmitter.removeListener('abc',listener1);
//再次触发abc事件
eventEmitter.emit('abc');
//再次监听器数量
eventListeners=eventEmitter.listenerCount("abc");
console.log(eventListeners);


//6、error事件   我们一般要为error事件设置监听器，避免整个程序崩溃
eventEmitter.on("error", function () {
    console.log("错误了");
});
eventEmitter.emit("error");




