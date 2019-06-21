var express = require('express');
var router = express.Router();
var dbConfig = require('../server/dbConfig');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('add');
});
router.get('/getData', function (req, res, next) {
    var cusId = req.query.id;
    console.log(cusId);
    try {
        var cusId = cusId || 0;
        var SELECT = "SELECT * FROM websites where id=" + cusId + "";
        dbConfig.query(SELECT,'', function (err,result) {
            if(err){
                return;
            }
            res.end(JSON.stringify(result));
        });
    } catch (e) {
        res.end(e);
    }
});
router.post('/updateCustom', function (req, res, next) {
    try {
        var temp = req.body;
        var UPDATE="UPDATE websites set name=?,age=?,phone=?,address=?,remark=? WHERE id=?";
        var ary = [temp.name, temp.age, temp.phone, temp.address, temp.remark, temp.id];
        dbConfig.query(UPDATE,ary,function (err,result) {
            if(err){
                return;
            }
            var obj = {};
            obj.message = "修改成功";
            res.end(JSON.stringify(obj));
        });
    } catch (e) {
        res.end(e);
    }
});
router.post('/addCustom', function (req, res, next) {
    try {
        var temp = req.body;
        var INSERT="INSERT INTO websites(name,age,phone,address,remark) VALUES(?,?,?,?,?)";
        var ary=[temp.name,temp.age,temp.phone,temp.address,temp.remark];
        dbConfig.query(INSERT,ary,function (err,result) {
            if(err){
                return;
            }
            var obj = {};
            obj.message = "增加成功";
            res.end(JSON.stringify(obj));
        });
    } catch (e) {
        res.end(e);
    }
});
module.exports = router;

