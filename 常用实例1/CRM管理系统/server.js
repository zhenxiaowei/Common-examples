var http = require("http"),
    url = require("url"),
    fs = require("fs");
var server = http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true),
        pathname = urlObj.pathname,
        query = urlObj.query;

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
            res.writeHead(200, {'content-type': suffixMIME + ';charset=utf-8;'});
            res.end(conFile);
        } catch (e) {
            res.writeHead(404);
            res.end();
        }
        return;
    }

    //->数据处理
    var customInfoPath = "./json/customInfo.json",
        resObj,
        allData;

    //1)获取所有的客户信息
    if (pathname === "/getAllData") {
        allData = fs.readFileSync(customInfoPath, "utf-8");
        allData === "" ? allData = "[]" : null;
        allData = JSON.parse(allData);

        resObj = {};
        resObj.code = allData.length > 0 ? 0 : 1;
        resObj.message = allData.length > 0 ? "获取成功!" : "没有任何的客户信息";
        resObj.data = allData;
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(resObj));
        return;
    }

    //2)获取指定客户的信息
    if (pathname === "/getData") {
        var cusId = query["id"] || 0,
            ary = fs.readFileSync(customInfoPath, "utf-8"),
            curInfo = null;
        ary === "" ? ary = "[]" : null;
        ary = JSON.parse(ary);
        ary.forEach(function (curData, index) {
            if (curData["id"] == cusId) {
                curInfo = curData;
            }
        });

        resObj = {};
        resObj.code = curInfo ? 0 : 1;
        resObj.message = curInfo ? "用户存在!" : "用户不存在!";
        resObj.data = curInfo;
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(resObj));
        return;
    }

    //3)删除指定的客户信息
    if (pathname === "/removeCustom") {
        cusId = query["id"] || 0;
        allData = fs.readFileSync(customInfoPath, "utf-8");
        allData === "" ? allData = "[]" : null;
        allData = JSON.parse(allData);

        var isDel = false;
        for (var i = 0; i < allData.length; i++) {
            if (allData[i]["id"] == cusId) {
                allData.splice(i, 1);
                isDel = true;
                break;
            }
        }

        if (isDel) {
            fs.writeFileSync(customInfoPath, JSON.stringify(allData), "utf-8");
        }

        resObj = {};
        resObj.code = isDel ? 0 : 1;
        resObj.message = isDel ? "删除成功!" : "删除失败,当前客户不存在!";
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(resObj));
        return;
    }

    //4)增加客户信息(POST)
    if (pathname === "/addCustom") {
        var temp = '';
        req.on("data", function (chunk) {
            temp += chunk;
        });
        req.on("end", function () {
            allData = fs.readFileSync(customInfoPath, "utf-8");
            allData === "" ? allData = "[]" : null;
            allData = JSON.parse(allData);

            temp = JSON.parse(temp);
            temp["id"] = parseInt(allData[allData.length - 1]["id"]) + 1;
            allData.push(temp);

            fs.writeFileSync(customInfoPath, JSON.stringify(allData), "utf-8");

            resObj = {};
            resObj.code = 0;
            resObj.message = "增加成功!";
            res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
            res.end(JSON.stringify(resObj));
        });
        return;
    }

    //6)修改客户信息
    if (pathname === "/updateCustom") {
        temp = '';
        req.on("data", function (chunk) {
            temp += chunk;
        });
        req.on("end", function () {
            temp = JSON.parse(temp);
            allData = fs.readFileSync(customInfoPath, "utf-8");
            allData === "" ? allData = "[]" : null;
            allData = JSON.parse(allData);
            var isUpdate = false;
            for (var i = 0; i < allData.length; i++) {
                var curData = allData[i];
                if (curData["id"] == temp["id"]) {
                    allData[i] = temp;
                    isUpdate = true;
                    break;
                }
            }
            if (isUpdate) {
                fs.writeFileSync(customInfoPath, JSON.stringify(allData), "utf-8");
            }

            resObj = {};
            resObj.code = isUpdate ? 0 : 1;
            resObj.message = isUpdate ? "修改成功!" : "修改失败!";
            res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
            res.end(JSON.stringify(resObj));
        });
    }
});
server.listen(8080, function () {
    console.log("server is success,listening on 8080 port!");
});