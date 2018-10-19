;
(function () {
    function Banner(bannerId, ajaxUrl, interval) { //我声明一个轮播图类
        //把所有的用得到都变成自己的私有属性 ==> 只要用new的方式去创建一个轮播图的时候this都是代表当前你创建那个轮播图实例
        this.banner = document.getElementById(bannerId);
        this.bannerInner = utils.fistEleChild(this.banner);
        this.focusList = utils.children(this.banner, 'ul')[0];
        this.left = utils.getElementsByClass('left', this.banner)[0];
        this.right = utils.getElementsByClass('right', this.banner)[0];
        this.imgBoxList = this.bannerInner.getElementsByTagName('div');
        this.imgList = this.bannerInner.getElementsByTagName('img');
        this.lis = this.focusList.getElementsByTagName('li');
        this.data = null;
        this.ajaxUrl = ajaxUrl;
        this.interval = interval || 2000;
        this.step = 0;
        this.timer = null;
        return this.init();
    }

    Banner.prototype = {
        constructor: Banner,
        getData: function () {
            var that = this; //这个that用来保存当前实例
            //定义在原型上的函数中的this就是当前实例: 自己new出来的那个轮播图实例
            var xhr = new XMLHttpRequest();
            xhr.open('get', this.ajaxUrl + '?_=' + Math.random(), false);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)) {
                    that.data = utils.jsonParse(xhr.responseText); //这里面的that不用this代替了，this只要被函数包裹就不再是原来的this了
                }
            }
            xhr.send(null);
        },
        bindData: function () {
            if (this.data) {
                var str1 = '';
                var str2 = '';
                for (var i = 0; i < this.data.length; i++) {
                    var curDataObj = this.data[i];
                    str1 += '<div><images src="" trueSrc="' + curDataObj.src + '" alt=""/></div>';
                    str2 += i == 0 ? '<li class="bg"></li>' : '<li></li>';
                }
                this.bannerInner.innerHTML = str1;
                this.focusList.innerHTML = str2;
            }
        },
        imgDelayLoad: function () {
            for (var i = 0; i < this.imgList.length; i++) {
                var that = this;
                ;
                (function (i) {
                    var curImg = that.imgList[i];
                    if (curImg.isLoad) return;
                    var tempImg = new Image();
                    tempImg.src = curImg.getAttribute('trueSrc');
                    tempImg.onload = function () {
                        curImg.src = this.src;
                        utils.css(curImg, 'display', 'block');
                        tempImg = null;
                        if (i === 0) { //这会是第一张图片,我处理透明度需要处理第一张图片父级div
                            utils.css(curImg.parentNode, 'zIndex', 1);
                            zhufengAnimate(curImg.parentNode, {opacity: 1}, 100);
                        } else {
                            utils.css(curImg, 'zIndex', 0);
                        }
                    }
                    curImg.isLoad = true;
                })(i);
            }
        },
        autoMove: function () {
            if (this.step == this.data.length - 1) {
                this.step = -1;
            }
            this.step++;
            this.setBanner();
        },
        setBanner: function () {
            for (var i = 0; i < this.imgBoxList.length; i++) {
                var curDiv = this.imgBoxList[i];
                if (i == this.step) {
                    utils.css(curDiv, 'zIndex', 1);
                    zhufengAnimate(curDiv, {opacity: 1}, 200, function () {
                        var siblings = utils.siblings(this);
                        for (var j = 0; j < siblings.length; j++) {
                            var curSibling = siblings[j];
                            utils.css(curSibling, 'opacity', 0);
                        }
                    });
                } else {
                    utils.css(curDiv, 'zIndex', 0);
                }
            }

            for (var k = 0; k < this.lis.length; k++) {
                var curLi = this.lis[k];
                k === this.step ? utils.addClass(curLi, 'bg') : utils.removeClass(curLi, 'bg');
            }
        },
        setMouseEvent: function () {
            var that = this;
            this.banner.onmouseover = function () {
                window.clearInterval(that.timer);
                utils.css(that.left, 'display', 'block');
                utils.css(that.right, 'display', 'block');
            }
            this.banner.onmouseout = function () {
                that.timer = window.setInterval(function () {
                    //这里的this由于是定时器的关系this是window
                    that.autoMove(); //autoMove中的this，已经不会受到定时器的干扰了，那么就是点前面的that，就是当前实例
                }, that.interval);
                utils.css(that.left, 'display', 'none');
                utils.css(that.right, 'display', 'none');
            }
        },
        bindEvetnForFocus: function () {
            var that = this;
            for (var i = 0; i < this.lis.length; i++) {
                var curLi = this.lis[i];
                curLi.index = i; //保存这个自定义属性是用来点击时候运动到这一张
                curLi.onclick = function () {
                    that.step = this.index;
                    that.setBanner();
                }
            }
        },
        leftRightChangeEvent: function () {
            var that = this;
            this.left.onclick = function () {
                if (that.step == 0) {
                    that.step = that.data.length;
                }
                that.step--;
                that.setBanner();
            }
            this.right.onclick = function () {
                that.autoMove();
            };
        },
        init: function () { //初始化函数
            var that = this;
            this.getData();
            this.bindData();
            window.setTimeout(function () {
                that.imgDelayLoad(); // 不能直接放在定时器的一个参数，因为那样会直接执行。这里面的this是window所以需要用代表当前实例that替换下
            }, 500);
            this.timer = window.setInterval(function () {
                that.autoMove();
            }, this.interval);
            this.setMouseEvent();
            this.bindEvetnForFocus();
            this.leftRightChangeEvent();
            return this; //只要执行init这个函数就会返回当前执行我的实例
        }
    };
    window.Banner = Banner;
}());




