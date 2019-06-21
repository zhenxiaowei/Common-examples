const mysql = require('mysql');

var pool=mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    port: "3306",
    database: "node2"
});
function query(sql,data,callback) {
    if(data==''){
        pool.getConnection(function (err,connetion) {
            connetion.query(sql, function (err,rows) {
                callback(err,rows);
                connetion.release();
            })
        })
    }else{
        pool.getConnection(function (err,connetion) {
            connetion.query(sql,data, function (err,rows) {
                callback(err,rows);
                connetion.release();
            })
        })
    }

}
exports.query=query;


