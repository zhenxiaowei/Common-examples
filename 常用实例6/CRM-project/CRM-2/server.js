var http = require("http"),
    url = require("url"),
    fs = require("fs");
var mysql = require("mysql");
var server = http.createServer(function (req, res) {
    //->req:request res:response
    var urlObj = url.parse(req.url, true),
        pathname = urlObj.pathname,
        query = urlObj.query;//->query存储的是所有客户端通过问号传递过来的参数值,在此处我们把传递过来的参数都解析成对象的属性名和属性值的方式了,例如:/getData?id=100&name=zhufeng ==> {"id":100,"name":"zhufeng"}

    //->静态资源文件(HTML/CSS/JS/图片...)的处理
    var reg = /\.(HTML|JS|CSS|TXT|JSON|PNG|JPG|BMP|GIF|ICO)/i;
    if (reg.test(pathname)) {
        var suffix = reg.exec(pathname)[1].toUpperCase();
        var suffixMIME = "text/plain";
        switch (suffix) {
            case "HTML":
                suffixMIME = "text/html";
                break;
            case "CSS":
                suffixMIME = "text/css";
                break;
            case "JS":
                suffixMIME = "text/javascript";
                break;
            case "JSON":
                suffixMIME = "application/json";
                break;
        }
        try {
            var conFile = fs.readFileSync("." + pathname, "utf-8");
            res.writeHead(200, {"content-type": suffixMIME + ";charset=utf-8;"});
            res.end(conFile);
        } catch (e) {
            res.writeHead(404);
            res.end();
        }
        return;
    }

    //->数据处理
    var customInfoPath = "./json/customInfo.json";//->存储所有客户信息这个文件的地址(我们今天的数据存储使用JSON文件存储,真实项目中存储数据使用的是数据库)
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        port: "3306",
        database: "node2"
    });


    //1)获取所有的客户信息
    if (pathname === "/getAllData") {
        var temp="";
        req.on("data", function (c) {
            temp+=c;
        });
        req.on("end", function () {
            temp=JSON.parse(temp);
            var pageNo = temp.pageNo;//当前页码
            var pageSise = temp.pageSize;//条数
            var start=(pageNo-1)*pageSise;
            var sql = "SELECT * FROM websites limit "+start+","+pageSise+"";
            var count="SELECT COUNT(*) AS COUNT FROM websites";
            connection.connect();
            connection.query(count, function (err,count) {
                if(err){
                    return;
                }
                count=count[0].COUNT;
                connection.query(sql,count, function (err,results) {
                    if(err){
                        return;
                    }
                    try{
                        var resObj = {};
                        resObj.pageNo = pageNo;
                        resObj.pageSise = pageSise;
                        resObj.totalPage = Math.ceil(count/pageSise);
                        resObj.totalCount = count;
                        resObj.message ="获取成功!";
                        resObj.data = results;
                        res.writeHead(200, {"content-type": "application/json;charset=utf-8;"});
                        res.end(JSON.stringify(resObj));
                        return;
                    }catch(e){
                        res.writeHead(500, {"content-type": "application/json;charset=utf-8;"});
                        res.end(e);
                        return;
                    }
                });
                connection.end();
            });
        });


    }

    //2)获取指定客户的信息
    if (pathname === "/getData") {
        try {
            var cusId = query["id"] || 0;
            var SELECT = "SELECT * FROM websites where id="+cusId+"";
            connection.connect();
            connection.query(SELECT, function (err, results) {
                if (err) {
                    return;
                }
                res.writeHead(200, {"content-type": "application/json;charset=utf-8;"});
                res.end(JSON.stringify(results));
                return;
            });
        } catch (e) {
            res.writeHead(500, {"content-type": "application/json;charset=utf-8;"});
            res.end(e);
            return;
        }
    }

    //3)删除指定的客户信息
    if (pathname === "/removeCustom") {
        try {
            var  cusId = query["id"] || 0;
            var DELSQL="DELETE FROM websites where id="+cusId+"";
            connection.query(DELSQL, function (err,result) {
                if (err) {
                    return;
                }
                res.writeHead(200, {"content-type": "application/json;charset=utf-8;"});
                var obj={};
                obj.message="删除成功";
                res.end(JSON.stringify(obj));
            });
            connection.end();
        } catch (e) {
            res.writeHead(500, {"content-type": "application/json;charset=utf-8;"});
            res.end(e);
            return;
        }
    }

    //4)增加客户信息(POST)
    //->在新增加客户的时候,客户端传递进来的值是没有ID的,而且客户的ID必须保持唯一,我们的ID选择按照规律生成:所有客户信息中个最后一条信息的ID基础上加1就是新用户的客户ID
    if (pathname === "/addCustom") {
        try {
            //->把请求主体中传递进来的JSON字符串获取到
            var temp = "";
            req.on("data", function (chunk) {
                temp += chunk;
            });
            req.on("end", function () {
                temp = JSON.parse(temp);
                var INSERT="INSERT INTO websites(name,age,phone,address,remark) VALUES(?,?,?,?,?)";
                var ary=[temp.name,temp.age,temp.phone,temp.address,temp.remark];
                connection.query(INSERT,ary, function (err,result) {
                    if (err) {
                        return;
                    }
                    res.writeHead(200, {"content-type": "application/json;charset=utf-8;"});
                    var obj={};
                    obj.message="增加成功";
                    res.end(JSON.stringify(obj));
                });
                connection.end();
            });
            return;
        } catch (e) {
            res.writeHead(500, {"content-type": "application/json;charset=utf-8;"});
            res.end(e);
            return;
        }
    }

    //6)修改客户信息
    if (pathname === "/updateCustom") {
        try {
            temp = "";
            req.on("data", function (chunk) {
                temp += chunk;
            });
            req.on("end", function () {
                temp = JSON.parse(temp);
                var UPDATE="UPDATE websites set name=?,age=?,phone=?,address=?,remark=? WHERE id=?";
                var ary=[temp.name,temp.age,temp.phone,temp.address,temp.remark,temp.id];
                connection.query(UPDATE,ary, function (err,result) {
                    if (err) {
                        return;
                    }
                    res.writeHead(200, {"content-type": "application/json;charset=utf-8;"});
                    var obj={};
                    obj.message="修改成功";
                    res.end(JSON.stringify(obj));
                });
                connection.end();
            });
        } catch (e) {
            res.writeHead(500, {"content-type": "application/json;charset=utf-8;"});
            res.end(e);
            return;
        }
    }
});
server.listen(8989, function () {
    console.log("server is success,listening on 8081 port!");
});
