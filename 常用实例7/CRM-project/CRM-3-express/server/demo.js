const mysql = require('mysql');

let db = mysql.createConnection({
    host: "192.168.1.102",
    user: "root",
    password: "root",
    port: "3306",
    database: "node2"
});

db.connect(function (err) {
    if (err) {
        console.log("err" + err.stack);
        return;
    }
    console.log("connection id " + db.threadId);

});
var pageNo = 1;//当前页码
var pageSise = 2;//条数
var start=(pageNo-1)*pageSise;
var sql = "SELECT * FROM websites limit "+start+","+pageSise+"";

db.query(sql, function (err,count) {
    if(err){
        return;
    }
    console.log(count);
});

module.exports = db;