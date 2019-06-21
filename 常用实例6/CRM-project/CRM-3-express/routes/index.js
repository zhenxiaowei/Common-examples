var express = require('express');
var router = express.Router();
var dbConfig = require('../server/dbConfig');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
    //当访问主页时，调用pug模板引擎，来渲染index.pug模板文件(将title变量全部替换为字符串Express)，生成静态页面并显示在浏览器中
});
router.post('/getAllData', function (req, res, next) {
    var pageNo = req.body.pageNo;//当前页码
    var pageSise = req.body.pageSize;//条数
    var start = (pageNo - 1) * pageSise;
    var sql = "SELECT * FROM websites limit " + start + "," + pageSise + "";
    var count = "SELECT COUNT(*) AS COUNT FROM websites";
    var totalCount;
    try {
        dbConfig.query(sql, function (err,val) {
            if(err){
                return;
            }
            dbConfig.query(count,'', function (err,data) {
                totalCount = data[0].COUNT;
                var resObj = {};
                resObj.pageNo = pageNo;
                resObj.pageSise = pageSise;
                resObj.totalPage = Math.ceil(totalCount / pageSise);
                resObj.totalCount = totalCount;
                resObj.message = "获取成功!";
                resObj.data = val;
                res.end(JSON.stringify(resObj));
            });
        })
    } catch (e) {
        res.send(e)
    }
});
router.get('/removeCustom', function (req, res, next) {
    var cusId = req.query.id;
    console.log(cusId);
    try {
        var cusId = cusId || 0;
        var DELSQL = "DELETE FROM websites where id=" + cusId + "";
        dbConfig.query(DELSQL,'', function (err,result) {
            if(err){
                return;
            }
            var obj = {};
            obj.message = "删除成功";
            res.end(JSON.stringify(obj));
        });
    } catch (e) {
        res.end(e);
    }
});

module.exports = router;
/*
 * 生成一个路由实例用来捕获访问主页的GET请求，导出这个路由并在appjs中通过app.use('/',routes)加载。
 * 当访问主页时，就会调用res.render('index',{title:'Express'}),渲染views/index.ejs文件
 * */