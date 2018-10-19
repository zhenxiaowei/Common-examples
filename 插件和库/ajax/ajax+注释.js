//->ajax:实现AJAX数据请求
function ajax(options) {
    //->init parameter
    var _default = {
        url: null,//URL地址
        type: "get",//请求类型   post
        async: true,//  Ajax请求默认的都是异步的  如果想同步 async设置为false就可以（默认是true）
        data: null,//
        success: null// 成功返回的回调函数
    };
    for (var key in options) {
        if (options.hasOwnProperty(key)) {//hasOwnProperty：是用来判断一个对象是否有你给出名称的属性或对象。注意:此方法无法检查该对象的原型链中是否具有该属性，该属性必须是对象本身的一个成员。
            _default[key] = options[key];
        }
    }

    //->get method clear cache
    if (_default.type === "get") {
        _default.url += _default.url.indexOf("?") > -1 ? "&_=" : "?_=";//indexOf(字符)：获取指定字符在字符串中第一次出现的索引位置，//如果没有这个字符返回的是-1，基于这个理念我们经常用这两个方法判断字符串中是否包含某个字符
        _default.url += Math.random();//Math.random()获取随机数
    }

    //->send ajax
    var xhr = createXHR();
    xhr.open(_default.type, _default.url, _default.async);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && /^2\d{2}$/.test(xhr.status)) {
            //readyState === 4  响应完成
            //xhr.readyState==4 && xhr.status==200的解释：请求完成并且成功返回
            var data = xhr.responseText;//后台返回的数据
            data = "JSON" in window ? JSON.parse(data) : eval("(" + data + ")");//由JSON字符串转换为JSON对象  //eval:JS中把字符串变成JS表达式执行的一个方法
            _default.success && _default.success.call(xhr, data);
        }
    };
    xhr.send(_default.data);
}

//->createXHR:创建一个AJAX对象,兼容所有的浏览器
function createXHR() {
    var xhr = null;
    var ary = [
        function () {
            return new XMLHttpRequest;
        },
        function () {
            return new ActiveXObject("Microsoft.XMLHTTP");
        },
        function () {
            return new ActiveXObject("Msxml2.XMLHTTP");
        },
        function () {
            return new ActiveXObject("Msxml3.XMLHTTP");
        }
    ];
    for (var i = 0; i < ary.length; i++) {
        var tempFn = ary[i];
        try {
            xhr = tempFn();
            createXHR = tempFn;
            break;
        } catch (e) {

        }
    }
    return xhr;
}