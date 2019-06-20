/*
例如
1、安装nodejs web框架模块exoress
npm install express 本地安装
npm install express -g 全局安装

直接使用 var express=require('express');

2、查看安装信息
npm list -g 所有全局安装的模块
npm list   所有本地安装的模块
npm list express 某个模块的信息

3、使用package.json定义包的属性信息
{
    "name": "myapp",
    "version": "0.0.0",
    "private": true,
    "scripts": {
    "start": "node ./bin/www"
},
    "dependencies": {
    "body-parser": "~1.18.2",
        "compression": "^1.7.3",
        "cookie-parser": "~1.4.3",
        "debug": "~2.6.9",
        "ejs": "^2.5.8",
        "express": "~4.15.5",
        "morgan": "~1.9.0",
        "request": "^2.87.0",
        "serve-favicon": "~2.4.5"
}
}
属性说明：
name 包名
version 包的版本号
description 包的描述
homepage 包的官网url
author 包的作者姓名
contributors 包的其他贡献者姓名
dependencies 依赖包列表。如果依赖包没有安装，npm会自动将依赖包安装在node_modules目录下
repository 包代码存放的地方的类型，可以是git svn
main main字段指定了程序的主入口文件，require('modulesName')就会加载这个文件，这个字段的默认值是模块根目录下的index.js

4、卸载模块
npm uninstall express
npm uninstall express -g

5、更新模块
npm update express
npm update express -g

6、搜索模块
npm search express
npm search express -g


*/
