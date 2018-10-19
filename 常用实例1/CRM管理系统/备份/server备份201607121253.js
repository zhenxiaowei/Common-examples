var http = require("http"),
    url = require("url"),
    fs = require("fs");
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
            res.writeHead(200, {'content-type': suffixMIME + ';charset=utf-8;'});
            res.end(conFile);
        } catch (e) {
            res.writeHead(404);
            res.end();
        }
        return;
    }

    //->数据处理
    var customInfoPath = "./json/customInfo.json";//->存储所有客户信息这个文件的地址(我们今天的数据存储使用JSON文件存储,真实项目中存储数据使用的是数据库)
    var resObj, allData;

    //1)获取所有的客户信息
    if (pathname === "/getAllData") {
        allData = fs.readFileSync(customInfoPath, "utf-8");
        allData === "" ? allData = "[]" : null;//->为了防止我们的JSON文件中什么东西都没有,这样使用JSON.parse("")会报错,我们把空字符串替换成存储空数组的字符串
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

        //->循环所有的数据,把ID和传递进来的cusId相同的这一项删除掉
        var isDel = false;
        for (var i = 0; i < allData.length; i++) {
            if (allData[i]["id"] == cusId) {
                allData.splice(i, 1);
                isDel = true;
                break;
            }
        }

        //->把删除后的最新数据重新的写入到JSON文件中
        if (isDel) {
            //->fs.writeFileSync([path],[con],[encode]):把指定的内容写入到具体的某一个文件中,注意写入的内容必须是一个字符串格式的
            fs.writeFileSync(customInfoPath, JSON.stringify(allData), "utf-8");
        }

        //->设定返回给客户端的内容
        resObj = {};
        resObj.code = isDel ? 0 : 1;
        resObj.message = isDel ? "删除成功!" : "删除失败,当前客户不存在!";
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(resObj));
        return;
    }

    //4)增加客户信息(POST)
    //->在新增加客户的时候,客户端传递进来的值是没有ID的,而且客户的ID必须保持唯一,我们的ID选择按照规律生成:所有客户信息中个最后一条信息的ID基础上加1就是新用户的客户ID
    if (pathname === "/addCustom") {
        //->把请求主体中传递进来的JSON字符串获取到
        var temp = '';
        req.on("data", function (chunk) {//->正在获取请求主体中的内容,获取的内容是一点点获取到的,chunk这个变量中存储的是每一次获取的那一丢丢,我们在外面定义一个空字符串,每一次获取的那一丢丢我们都进行字符串拼接,这样的话就可以把全部的数据都获取到了
            temp += chunk;
            //->此处操作是异步请求处理的
        });
        req.on("end", function () {//->此事件代表请求主体中的内容已经全部接受
            //->temp:存储的是全部请求主体中的内容
            //1)把传递进来的内容转换成JSON对象
            temp = JSON.parse(temp);

            //2)获取当前已经存储的所有的数据
            allData = fs.readFileSync(customInfoPath, "utf-8");
            allData === "" ? allData = "[]" : null;
            allData = JSON.parse(allData);

            //3)给我们的temp设定一个ID
            temp["id"] = parseInt(allData[allData.length - 1]["id"]) + 1;

            //4)把temp存入到allData中
            allData.push(temp);

            //5)把最新的数据重新的写入到文件中
            fs.writeFileSync(customInfoPath, JSON.stringify(allData), "utf-8");

            //6)向客户端响应内容
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
server.listen(80, function () {
    console.log("server is success,listening on 80 port!");
});