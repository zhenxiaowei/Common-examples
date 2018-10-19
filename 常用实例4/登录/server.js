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


    var allData =  fs.readFileSync('./data.json', "utf-8");

    if (pathname === "/addCustom") {
        var temp = '', resObj = {}, i = 0;
        req.on("data", function (chunk) {
            temp += chunk;
        });
        req.on("end", function () {
            temp = JSON.parse(temp);
            temp["id"] = i++;
            allData === "" ? allData = "[]" : null;
            allData = JSON.parse(allData);
            allData.push(temp);
            fs.writeFileSync('./data.json', JSON.stringify(allData), "utf-8");
            resObj.code = 0;

            resObj.message = "增加成功!";
            res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
            res.end(JSON.stringify(resObj));
        });
        return;
    }

    if (pathname === "/searchCustom") {
        var temp = '', resObj = {};
        req.on("data", function (chunk) {
            temp += chunk;
        });
        req.on("end", function () {

            temp = JSON.parse(temp);
            allData=JSON.parse(allData);
            for (var j = 0; j <allData.length; j++) {
                var curData = allData[j];
                if (temp.name == curData['name'] && temp.word == curData['word']) {
                    resObj.code = 0;
                    resObj.message = "登录!";
                    res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
                    res.end(JSON.stringify(resObj));
                } else {
                    resObj.code = 1;
                    resObj.message = "不登录";
                    res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
                    res.end(JSON.stringify(resObj));
                }
            }

        });
        return;
    }


});
server.listen(88, function () {
    console.log("server is success,listening on 80 port!");
});