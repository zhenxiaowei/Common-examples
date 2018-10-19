var LExtends = function (d, b, a) {
    var p = null, o = d.constructor.prototype, h = {};
    if (typeof d.__ll__parent__ == 'undefined') d.__ll__parent__ = [];
    d.__ll__parent__.push(b.prototype);
    for (p in o) h[p] = 1;
    for (p in b.prototype) if (!h[p]) o[p] = b.prototype[p];
    b.apply(d, a);
}

var LPublic = function () {
    var s = this;
};
var p = {
    // 异步
    _ajax: function (url, method, dataType, arguments, success, error) {
        $.ajax({
            url: url, type: method, dataType: dataType, data: arguments, success: function (json) {
                if (success) success(json)
            }, error: function (json) {
                if (error) error(json);
            }
        });
    },
    // 取地址参数
    _getQueryString: function (name) {
        var r = window.location.search.substr(1).match(new RegExp('(^|&)' + name + '=([^&]*)(&|$)'));
        if (r != null) return unescape(r[2]);
        return null;
    },
    // 取数组最小值
    _getMin: function (array) {
        return Math.min.apply(null, array);
    },
    // 取数组最大值
    _getMax: function (array) {
        return Math.max.apply(null, array);
    },
    // 数组中对象合并
    _combine: function (array) {
        console.log(array);
        return $.extend.apply(null, array);
    },
    // 获取时间
    _getTime: function () {
        return (new Date()).getTime();
    },
    // 时间戳转换日期 unixTime 时间戳(秒) isFull 返回完整时间(Y-m-d 或者 Y-m-d H:i:s) timeZone 时区
    _unixToDate: function (unixTime, isFull, timeZone) {
        if (typeof(timeZone) == 'number') unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
        var time = new Date(unixTime * 1000);
        var ymdhis = '';
        ymdhis += time.getUTCFullYear() + '-';
        ymdhis += (time.getUTCMonth() + 1) + '-';
        ymdhis += time.getUTCDate();
        if (isFull) {
            ymdhis += ' ' + time.getUTCHours() + ':';
            ymdhis += time.getUTCMinutes() + ':';
            ymdhis += time.getUTCSeconds();
        }
        return ymdhis;
    },
    // 转换为时间戳 2014-01-01 20:20:20 日期格式 返回时间戳(秒)
    _DateToUnix: function (string) {
        var f = string.split(' ', 2);
        var d = (f[0] ? f[0] : '').split('-', 3);
        var t = (f[1] ? f[1] : '').split(':', 3);
        return (new Date(parseInt(d[0], 10) || null, (parseInt(d[1], 10) || 1) - 1, parseInt(d[2], 10) || null, parseInt(t[0], 10) || null, parseInt(t[1], 10) || null, parseInt(t[2], 10) || null)).getTime() / 1000;
    }
};
for (var k in p) LPublic.prototype[k] = p[k];

var LMethod = function () {
    var s = this;
    LExtends(s, LPublic, []);
    s._copyPrepare();
};
var p = {
    _copyPrepare: function () {
        var s = this;
        if (typeof(ZeroClipboard) == 'undefined') return;
        s.clip = new ZeroClipboard.Client();
        s.clip.setHandCursor(true);
        s.clip.glue('clipButton');
        s.clip.addEventListener('complete', function () {
            $('#clipButton').addClass('cur').html('复制成功');
        });
    },
    // 剪贴板内容
    _copy: function (text) {
        var s = this;
        s.clip.setText(text);
        s.clip.reposition();
    }
};
for (var k in p) LMethod.prototype[k] = p[k];

// box参数需要修改
var LPagination = function (mainBox, copy, url, method, dataType, option) {
    var s = this;
    LExtends(s, LPublic, []);
    s.mainBox = mainBox;
    s.url = url;
    s.method = method;
    s.dataType = dataType;
    s.option = {};
    for (var k in option) s.option[k] = option[k];
    s.copy = copy;
    s.page = {page: 1};
};
var p = {
    _clearBox: function () {
        this.mainBox.empty();
    },
    _getSum: function () {
        var s = this;
        if (!s.onLoadData) return;
        s.pageSum = parseInt(s.onLoadData.page_sum);
        s.listSum = parseInt(s.onLoadData.count);
    },
    _getData: function () {
        var s = this;
        if (s.onLoadData) {
            s._setElement(s.onLoadData);
            delete s.onLoadData;
            return;
        }
        s.argument = s._combine([s.option, s.page]);
        //!s.pageSum ? s._listOnload(s.data) : s._setElement(s.data);
        s._ajax(s.url, s.method, s.dataType, s.argument, function (json) {
            !s.pageSum ? s._listOnload(json) : s._setElement(json)
        });
    },
    _reload: function (option) {
        var s = this;
        s.option = option;
        s.page = {page: 1};
        delete s.pageSum;
        delete s.listSum;
        s._clearBox();
        s._getData();
    }
};
for (var k in p) LPagination.prototype[k] = p[k];

// 普通分页列表  差总数，页数，每页条数, 数据为null
// mainBox: 列表标签  url: 接口地址  option: 参数  movementMethod: 动态添加数据方法
var LPaginationList = function (mainBox, copy, url, method, dataType, option, paginationBox, movementMethod, dataList) {
    var s = this;
    LExtends(s, LPagination, arguments);
    s.paginationBox = paginationBox;
    s.movementMethod = movementMethod;
    s.dataList = dataList ? dataList : false;
    s._getData(option);
};
var p = {
    // 改变参数重新刷新
    _change: function (option) {
        this._reload(option);
    },
    _setPagination: function () {
        var s = this;
        if (typeof(s.paginationBox.pagination()) == 'undefined') return;
        s.paginationBox.pagination(s.pageSum, {
            num_edge_entries: 1,
            items_sum: s.listSum,
            num_display_entries: 5,
            items_per_page: 1,
            prev_text: "<",
            next_text: ">",
            callback: function (page_index) {
                $('.loading, .loadingbg').removeClass('dsn');
                s.page = {page: page_index + 1};
                s._getData();
            }
        });
    },
    _setElement: function (json) {
        var s = this;
        // 清空方法可优化，考虑loading
        $('.loading, .loadingbg').addClass('dsn');
        s._clearBox();
        if (!s.dataList) {
            if (!json.list) return;
            for (var i = 0; i < json.list.length; i++) {
                if ($('#examList').attr('typeId') == 3443) {
                    var m = s.copy.clone().removeClass('LCopy');
                    m.find('.mustlook').removeClass('dsn');
                } else {
                    var m = s.copy.clone().removeClass('LCopy');
                }
                s.mainBox.append(s.movementMethod(json.list[i], s.copy != null ? m : null, i));
            }
        } else if (s.dataList == '1') {
            //
            // 
            //
            //
            //
            //
            //
            // JSON格式不一样 加判断 可优化 资料列表
            for (var k in json.lists) {
                if (!json.lists[k].list) {
                    s.mainBox.append(s.movementMethod(json.lists[k], s.copy != null ? s.copy.clone().removeClass('LCopy') : null));
                } else {
                    for (var i = 0; i < json.lists[k].list.length; i++) {
                        s.mainBox.append(s.movementMethod(json.lists[k].list[i], s.copy != null ? s.copy.clone().removeClass('LCopy') : null));
                    }
                }
            }
        }
    },
    _listOnload: function (json) {
        var s = this;
        s.onLoadData = json;
        s._clearBox();
        s._getSum();
        s._setPagination();
    }
};
for (var k in p) LPaginationList.prototype[k] = p[k];

// 点击加载更多
var LGetMoreList = function (mainBox, copy, url, method, dataType, option) {
    var s = this;
    LExtends(s, LPagination, arguments);
};
var p = {
    // 加载更多
    _getMore: function (oncomplete) {
        var s = this;
        s.oncomplete = oncomplete;
        s.page = {page: ++s.page.page};
        s._getData();
    },
    _listOnload: function (json) {
        var s = this;
        s.onLoadData = json;
        s._clearBox();
        s._getSum();
        s._getData();
    }
};
for (var k in p) LGetMoreList.prototype[k] = p[k];

// 瀑布流列表  差总数，页数，每页条数, 数据为null, 单位边框
// mainBox: 列表标签  url: 接口地址  option: 参数  width: 单位宽度  rowSpace: 行间距  columnSpace: 列间距  rowArray: 第一行高度数组  movementMethod: 动态添加数据方法
function LWaterfullList(mainBox, copy, url, method, dataType, option, width, rowSpace, columnSpace, rowArray, movementMethod) {
    var s = this;
    LExtends(s, LGetMoreList, arguments);
    s.width = width;
    s.rowSpace = rowSpace;
    s.columnSpace = columnSpace;
    s.rowArray = rowArray;
    s.movementMethod = movementMethod;
    s.position = {x: [], y: []};
    s.data = {
        list: [{
            "text1": 412344,
            "text2": 255522,
            "images": "images/mp1.png",
            "width": 280,
            "height": 237
        }, {
            "text1": "阿斯兰打开附件阿拉山口地方经理",
            "text2": "山口地方经理",
            "images": "images/2.jpg",
            "width": 355,
            "height": 355
        }, {
            "text1": 412312312344,
            "text2": 251231235522,
            "images": "images/3.jpg",
            "width": 200,
            "height": 200
        }, {
            "text1": 412344,
            "text2": "asdfasdfasdfasdf",
            "images": "images/fxl_case_01.jpg",
            "width": 280,
            "height": 200
        }, {"text1": 412344, "text2": "asdfasdfasdfasdf", "images": "images/mp1.png", "width": 280, "height": 237}],
        page_sum: 1,
        count: 7
    };
    s._count();
    s._getData();
};
var p = {
    _count: function () {
        var s = this;
        s.position.y = s.rowArray.slice(0);
        for (var i = 0; i < s.rowArray.length; i++) s.position.x.push((s.width + s.rowSpace) * i);
    },
    _change: function (option) {
        var s = this;
        s.position.y = s.rowArray.slice(0);
        s._reload(option);
    },
    _setElement: function (json) {
        var s = this;
        if (json.list.length == 0 || !json.list) {
            if (s.oncomplete) s.oncomplete();
            return;
        }
        for (var i = 0; i < json.list.length; i++) {
            var j = s.position.y.indexOf(s._getMin(s.position.y));
            var copy = s.movementMethod(json.list[i], s.copy != null ? s.copy.clone().removeClass('LCopy') : null);
            copy.css({left: s.position.x[j] + 'px', top: s.position.y[j] + 'px'});
            s.mainBox.append(copy);
            s.position.y[j] = s.position.y[j] + copy.height() + s.columnSpace;
            s.mainBox.height(s._getMax(s.position.y));
        }
    }
};
for (var k in p) LWaterfullList.prototype[k] = p[k];

// 左右时间轴列表
function LTimeLine(mainBox, copy, url, method, dataType, option, movementMethod) {
    var s = this;
    LExtends(s, LGetMoreList, arguments);
    s.movementMethod = movementMethod;
    s.position = true; // true:左边  false:右边
    s.data = {
        list: [{"type": 0}, {"type": 1}, {"type": 1}, {"type": 2}, {"type": 1}, {"type": 2}, {"type": 0}],
        page_sum: 1,
        count: 7
    };
    s._getData();
};
var p = {
    // 改变参数重新刷新
    _change: function (option) {
        var s = this;
        s.position = true;
        s._reload(option);
    },
    _setElement: function (json) {
        var s = this;
        if (json.list.length == 0 || !json.list) {
            if (s.page.page == 1) {
                $('#activeNoData').removeClass('dsn');
                $('.activeTimeLine,#getMore').addClass('dsn');
                return;
            }
            if (s.oncomplete) {
                s.oncomplete();
                return;
            }
        }
        $('#activeNoData').addClass('dsn');
        $('.activeTimeLine,#getMore').removeClass('dsn');
        for (var i = 0; i < json.list.length; i++) {
            var copy = s.movementMethod(json.list[i], s.copy != null ? s.copy.clone().removeClass('LCopy') : null);
            s.position ? copy.addClass('leftArea') : copy.addClass('rightArea');
            s.mainBox.append(copy);
            s.position = !s.position;
        }
    }
};
for (var k in p) LTimeLine.prototype[k] = p[k];