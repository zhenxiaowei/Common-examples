/**
 * Created by xiao lei on 2016/7/7.
 */
(function () {
    var oBox = document.getElementById('box');
    var oBoxInner = oBox.getElementsByTagName('div')[0];
    var aDiv = oBoxInner.getElementsByTagName('div');
    var aImg = oBoxInner.getElementsByTagName('img');
    var oUl = oBox.getElementsByTagName('ul')[0];
    var aLi = oBox.getElementsByTagName('li');
    var oBtnLeft = oBox.getElementsByTagName('a')[0];
    var oBtnRight = oBox.getElementsByTagName('a')[1];
    //通过JS先让第一张图片显示；
    zhufengAnimate(aDiv[0], {opacity: 1}, 1000);
    var step = 0;//用step=0来控制让哪张图片显示；
    var autoTimer = null;
    var interval = 2000;
    //1.图片渐隐渐现
    //开启一个定时
    clearInterval(autoTimer);
    autoTimer = setInterval(autoMove, interval)
    function autoMove() {
        if (step >= aDiv.length - 1) {
            step = -1;
        }
        step++;//1 2 3 0 不断累加step;
        setBanner();//1 2 3 0

    }

    function setBanner() {
        //通过遍历每个div，看哪个div的索引等于step;
        // 1.如果等于，就让这个div的层级提高为1；同时，让其他div层级为0；
        // 2.让层级为1的这张图片的透明度通过运动到达1；当运动结束后，让显示的这张图片的所有兄弟元素的透明度都为0；
        for (var i = 0; i < aDiv.length; i++) {
            var curEle = aDiv[i];
            if (i === step) {
                utils.css(curEle, 'zIndex', 1);
                zhufengAnimate(curEle, {opacity: 1}, 1000, function () {
                    // alert(i)--回调函数属于异步，异步中的i值一定会发生改变，是最大值；
                    //一般情况下，回调函数中的this是window，但是我们封装是通过call改变了回调函数中的this指向--curEle;
                    //让显示的这张图片的兄弟元素，透明度都为0
                    var siblings = utils.siblings(this);
                    for (var k = 0; k < siblings.length; k++) {
                        utils.css(siblings[k], 'opacity', 0)
                    }
                    ;

                })
                continue;
            }
            utils.css(curEle, 'zIndex', 0);
        }
        bannerTip();

    };
    //2.焦点自动轮播
    //思路：遍历每个焦点，判断哪个焦点的索引跟step相同，相同点亮，否则，不点亮
    function bannerTip() {
        for (var i = 0; i < aLi.length; i++) {
            var curEle = aLi[i];
            /*if(i===step){
             aLi[i].className='bg';
             }else{
             aLi[i].className='';
             }*/
            curEle.className = i === step ? 'bg' : '';
        }
    }

    //3.移入停止移出继续
    oBox.onmouseover = function () {
        clearInterval(autoTimer);
        oBtnLeft.style.display = oBtnRight.style.display = 'block';
    };
    oBox.onmouseout = function () {
        autoTimer = setInterval(autoMove, interval);
        oBtnLeft.style.display = oBtnRight.style.display = 'none';
    };
    //4.点击焦点手动切换
    handleChange();
    function handleChange() {
        for (var i = 0; i < aLi.length; i++) {
            (function (index) {//闭包思想
                aLi[index].onclick = function () {
                    step = index;
                    setBanner();
                }
            })(i);
        }
    };
    //5.点击左右按钮进行切换
    oBtnLeft.onclick = function () {
        if (step <= 0) {
            step = aDiv.length;
        }
        step--;
        setBanner();
    };
    oBtnRight.onclick = autoMove;
})();











