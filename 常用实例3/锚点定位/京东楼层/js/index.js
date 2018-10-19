var winH = document.documentElement.clientHeight || document.body.clientHeight;
var $content = $(".content"),
    $floorDivs = $content.children("div:gt(0)"),
    $floor = $(".floor"),
    $floorLis = $floor.children("li");

//->计算FLOOR区域的LEFT值：紧挨着CONTENT
var curL = parseFloat($content.offset().left) - parseFloat($floor.outerWidth());
curL < 0 ? curL = 40 : null;
$floor.css({
    left: curL
});

//->控制FLOOR的显示和隐藏 && 还有楼层的定位
$(window).on("scroll", computedShow);
function computedShow() {
    var curTop = document.documentElement.scrollTop || document.body.scrollTop;

    //->浏览器的SCROLL TOP值+半屏幕的高度>=一楼距离BODY的上偏移,我们控制楼层导航出现,反之让其消失即可;
    if ((curTop + winH / 2) >= $floorDivs.eq(0).offset().top) {
        $floor.stop().fadeIn(100);
    } else {
        $floor.stop().fadeOut(100);
    }

    //->根据当前的SCROLL TOP值+半屏幕的高度在计算出具体定位到哪一楼层
    $floorDivs.each(function (index, item) {
        var curOffTop = $(this).offset().top;
        if ((curTop + winH / 2) >= curOffTop) {
            $floorLis.eq(index).addClass("bg").siblings().removeClass("bg");
        }
    });
}

//->左侧的楼层导航中的每一个LI绑定点击事件
var autoTimer = null;
$floorLis.on("click", function () {
    $(this).addClass("bg").siblings().removeClass("bg");
    var index = $(this).index(),
        tarTop = $floorDivs.eq(index).offset().top;

    //->禁止WINDOW的SCROLL事件
    $(window).off("scroll", computedShow);

    //->开始运动
    move(tarTop);
});
function move(target) {
    //->结束正在运行的动画,开始下一个动画
    window.clearInterval(autoTimer);

    //->进入MOVE首先获取的这个值是为了计算运动的方向
    var curTop = document.documentElement.scrollTop || document.body.scrollTop;
    var speed = 50;
    if (curTop > target) {
        speed *= -1;
    }
    if (curTop === target) {
        return;
    }

    //->开始运动
    autoTimer = window.setInterval(function () {
        //->每一次定时器中的这个值是为了在现有基础上+/-速度
        var cur = document.documentElement.scrollTop || document.body.scrollTop;
        cur += speed;

        if (speed > 0) {
            //->下
            if (cur >= target) {
                document.documentElement.scrollTop = target;
                document.body.scrollTop = target;
                window.clearInterval(autoTimer);
                $(window).on("scroll", computedShow);
                return;
            }
        } else {
            //->上
            if (cur <= target) {
                document.documentElement.scrollTop = target;
                document.body.scrollTop = target;
                window.clearInterval(autoTimer);
                $(window).on("scroll", computedShow);
                return;
            }
        }

        document.documentElement.scrollTop = cur;
        document.body.scrollTop = cur;
    }, 10);
}



