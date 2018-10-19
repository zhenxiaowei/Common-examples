~function () {
    var reg1 = /AppleWebKit.*Mobile/i,
        reg2 = /MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/;

    //->条件成立说明当前页面是运行在移动端设备中的
    if (reg1.test(navigator.userAgent) || reg2.test(navigator.userAgent)) {

        //->如果当前页面的URL是PC端项目的地址:我们需要跳转到移动端项目
        if (window.location.href.indexOf("www.zhufengpeixun.cn") >= 0) {
            window.location.href = "http://phone.zhufengpeixun.cn/";
        }
        return;
    }

    //->反之则说明当前的页面是运行在PC端设备中的,如果访问的URL地址是移动端的,我们需要跳转到PC端地址上
    if (window.location.href.indexOf("phone.zhufengpeixun.cn") >= 0) {
        window.location.href = "http://www.zhufengpeixun.cn/";
    }
}();

~function () {
    var reg1 = /AppleWebKit.*Mobile/i,
        reg2 = /MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/;
    if (reg1.test(navigator.userAgent) || reg2.test(navigator.userAgent)) {
        if (/iPad/i.test(navigator.userAgent)) {
            //->说明是PAD
        } else {
            //->说明是手机
        }
    }
}();

/*
*一般情况下PC端和移动端是分别写的两套代码；两套代码的地址是不同的；
*
* 所以就需要判断一下是PC端还是移动端，并且让他跳转到相对应的地址去。
*
* 使用的时候要改变一下里面的地址
* */