var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var bodyParser=require('body-parser');
var indexRouter = require('./routes/index');
var addRouter = require('./routes/add');
var fs = require("fs");
var app = express();//生成一个express实例app

// view engine setup
app.set('views', path.join(__dirname, 'views'));//设置views文件夹为存放视图文件的目录，即存放模板文件的地方，__dirname为全局变量，存储当前正在执行的脚本所在的目录
app.engine('html',ejs.__express);
app.set('view engine', 'html');//设置视图模板引擎为pug

app.use(logger('dev'));//加载日志中间件
app.use(express.json());//加载解析json的中间件
app.use(express.urlencoded({extended: true}));//加载解析urlencoded请求体的中间件
app.use(cookieParser());//加载解析cookie的中间件
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));//设置public文件夹为存放静态文件的目录
app.use('/', indexRouter);//路由控制器
app.use('/add', addRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});//捕获404错误，并转发到错误处理器

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});//生产环境下的错误处理器，将错误信息渲染error模板并显示到浏览器中

module.exports = app;//导出app实例供其他模块带调用
