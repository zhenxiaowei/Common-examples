(function () {
    /**
     * jsonp请求
     * @param url jsonp接口
     * @param data jsonp接口需要的参数
     * @param jsonpcallback jsonpcallback
     * @param callback 回调函数
     */
    this.jsonp = function (url, data, jsonpcallback, callback) {
        // 计数器 防止缓存
        var cbName = 'cb' + counter++;
        // 声明全局函数名 跟在jsonpcallback后面
        var callbackName = 'window.jsonp.' + cbName;

        // 拼接参数
        url = tools.padStringToURL(url, data);
        // 拼接jsonpcallback到url中
        url = tools.padStringToURL(url, jsonpcallback + '=' + callbackName);

        // 动态创建script标签
        var script = document.createElement('script');

        function complete() {
            // 完成之后把script删掉，防止污染dom
            script.parentNode.removeChild(script);
            // 删掉jsonp函数上的静态方法
            delete window.jsonp[cbName];
        }

        // 声明全局函数体
        window.jsonp[cbName] = function (data) {
            try {
                // 调用回调函数
                callback(data)
            } finally {
                complete();
            }
        };

        // 赋值src为url
        script.src = url;
        // 注册失败事件
        script.onerror = function () {
            complete();
        };
        // 判断当前页面有没有加载完成
        if (document.readyState === 'complete') {
            // 把script拼接到body， 拼接完成之后会自动请求src
            document.body.appendChild(script);
            // 终止后续逻辑
            return;
        }
        // 如果页面没有加载成功，则注册onload事件，在onload中把script拼接到body上。
        if (window.addEventListener) {
            window.addEventListener('load', function () {
                document.body.appendChild(script);
            }, false)
        } else {
            window.attachEvent('onload', function () {
                document.body.appendChild(script);
            })
        }
    };

    var tools = {
        // 把data格式化为querystring格式
        param: function (data) {
            if (typeof data === 'string') {
                return data;
            }
            if (Object.prototype.toString.call(data) === '[object Object]') {
                var arr = [];
                for (var n in data) {
                    if (!data.hasOwnProperty(n)) continue;
                    arr.push(encodeURIComponent(n) + '=' + encodeURIComponent(data[n]));
                }
                return arr.join('&');
            }

            return '';
        },
        padStringToURL: function (url, data) {
            data = tools.param(data);
            if (data) {
                return url + (/\?/.test(url) ? '&' : '?') + data;
            }
            return url;
        }
    };

    var counter = 1;
}());