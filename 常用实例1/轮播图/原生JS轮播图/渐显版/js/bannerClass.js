function Banner(bannerId, url, interval) {
    this.banner = document.getElementById(bannerId);
    this.innerBanner = utils.getElementsByClass('innerBanner', this.banner)[0];
    this.imgList = this.innerBanner.getElementsByTagName('img');
    this.focusList = utils.next(this.innerBanner);
    this.focusLis = this.focusList.getElementsByTagName('li');
    this.left = utils.getElementsByClass('left')[0];
    this.right = utils.getElementsByClass('right')[0];
    this.url = url;
    this.interval = interval;
    this.timer = null;
    this.interval = interval || 2000;
    this.step = 0;
    this.resData = null;
    return this.init();
}

Banner.prototype = {
    constructor: Banner,
    getData: function () {
        var that = this;
        var xhr = new XMLHttpRequest();
        xhr.open('get', this.url + '?_=' + Math.random(), false);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)) {

                that.resData = utils.jsonParse(xhr.responseText);
                console.log(that.resData)
            }
        }
        xhr.send();
    },
    dataBind: function () {
        if (this.resData) {
            var str = '', str2 = '';
            for (var i = 0; i < this.resData.length; i++) {
                var curData = this.resData[i];
                str += '<div><img src="" trueSrc="' + curData.src + '" alt=""/></div>';
                str2 += i === 0 ? '<li class="bg"></il>' : '<li></li>'
            }
            this.innerBanner.innerHTML = str;
            this.focusList.innerHTML = str2;
        }
    },
    imgDelayLoad: function () {
        var that = this;
        for (var i = 0; i < this.imgList.length; i++) {
            (function (i) {
                var curImg = that.imgList[i];
                if (curImg.isload) return;
                var tempImg = new Image();
                tempImg.src = curImg.getAttribute('trueSrc');
                tempImg.onload = function () {
                    curImg.src = this.src;
                    curImg.style.display = 'block';
                    if (i === 0) {
                        utils.css(curImg.parentNode, 'zIndex', 1);
                        zhufengAnimate(curImg.parentNode, {opacity: 1}, 300);
                    }
                    tempImg = null;
                }
                curImg.isload = true;
            })(i);
        }
    },
    autoMove: function () {

        if (this.step == this.resData.length - 1) {
            this.step = -1;
        }
        this.step++;
        this.setBanner();
    },
    setBanner: function () {
        for (var i = 0; i < this.imgList.length; i++) {
            var curImg = this.imgList[i];
            if (i === this.step) {
                utils.css(curImg, 'Index', 1);
                zhufengAnimate(curImg.parentNode, {opacity: 1}, 200, function () {
                    var siblings = utils.siblings(this);
                    for (var i = 0; i < siblings.length; i++) {
                        var cur = siblings[i];
                        utils.css(cur, 'opacity', 0);
                    }
                });
                continue;
            }
            utils.css(curImg, 'zIndex', 0);
        }

        this.focusAlign();
    },
    focusAlign: function () {
        for (var i = 0; i < this.focusLis.length; i++) {
            var curLi = this.focusLis[i];
            this.step == i ? utils.addClass(curLi, 'bg') : utils.removeClass(curLi, 'bg');
        }
    },
    bindEvenForFocus: function () {
        for (var i = 0; i < this.focusLis.length; i++) {
            var curLi = this.focusLis[i];
            curLi.index = i;
            var that = this;
            curLi.onclick = function () {
                that.step = this.index;
                that.setBanner();
            }
        }
    },
    mouseEvent : function (){
        var that = this;
        this.banner.onmouseover = function (){
            window.clearInterval(that.timer);
            utils.css(that.left,'display','block');
            utils.css(that.right,'display','block');
        }
        this.banner.onmouseout = function (){
            that.timer = window.setInterval(function (){
                that.autoMove();
            },that.interval);
            utils.css(that.left,'display','none');
            utils.css(that.right,'display','none');
        }

    },
    leftRight : function (){
        var that = this;
        this.left.onclick = function () {
            if (that.step == 0) {
                that.step = 4;
            }
            that.step--;
            that.setBanner();
        }

        this.right.onclick = function (){
            that.autoMove();
        }

    },
    init: function (){
        var that = this;
        this.getData();
        this.dataBind();
        this.imgDelayLoad();
        window.setTimeout(function (){
            that.autoMove();
        }, 500);
        this.timer = window.setInterval(function (){
            that.autoMove();
        }, this.interval);
        this.bindEvenForFocus();
        this.mouseEvent();
        this.leftRight();
        return this;
    }
}


//console.log(resData);










