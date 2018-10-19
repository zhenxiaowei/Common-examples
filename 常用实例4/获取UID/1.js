/**
 * Created by zhenxiaowei on 2017/5/20.
 */
function queryURLParmeter(url) {
    var reg = /([^?&=]+)=([^?&=]+)/g, obj = {}, res = reg.exec(url);
    while (res) {
        var fir = res[1], tww = res[2];
        obj[fir] = tww;
        res = reg.exec(url);
    }
    return obj;
};
var obj = queryURLParmeter(window.location.search);