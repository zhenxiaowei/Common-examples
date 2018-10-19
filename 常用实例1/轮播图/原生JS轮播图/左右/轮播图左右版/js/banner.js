//获取元素
var banner = utils.getElementsByClass('banner')[0]; //最大的范围
var bannerImgWrap = utils.getElementsByClass('bannerImgWrap',banner)[0]; //包含所有图片的大盒子
var divsList = bannerImgWrap.getElementsByTagName('div'); //包含单个图片的小div
var imgList = bannerImgWrap.getElementsByTagName('img'); //所有的图片
var focusList = utils.getElementsByClass('focusList',banner)[0]; //焦点的盒子
var focusListLis = focusList.getElementsByTagName('li'); //所有的焦点
var leftBtn = banner.getElementsByTagName('a')[0]; //左面按钮
var rightBtn = banner.getElementsByTagName('a')[1]; //右面按钮

//获取数据 ajax
var data = null;
function getData(){
    var xhr = new XMLHttpRequest();
    xhr.open('get','data.txt?_='+Math.random(),false);
    xhr.onreadystatechange = function (){
        if(xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)){
            data = utils.jsonParse(xhr.responseText);
        }
    }
    xhr.send(null);
}
getData();
console.log(data);

//绑定数据

function bindData(){
//<div><img src="images/banner1.jpg" alt=""/></div>
    var str = "";
    var strFocus = '';
    if(data){ //数据存在我才做拼接
        for(var i= 0, l = data.length; i<l; i++){
            var curData = data[i]; //每次循环的当前那一条数据
            str += '<div><img src="" trueSrc="'+ curData.src +'" /></div>'; //每次拼接的是里面img
            if(i ===0){ //第一个焦点带默认的样式。所以需要分别开来。
                strFocus += '<li class="bg"></li>';
            }else{
                strFocus += '<li></li>'; //每次拼接的焦点
            }
        }
        //我在这个地方在str的末尾处再累加一个第一张图片 ==> 为了制造无缝连接
        str += '<div><img src="" trueSrc="'+ data[0].src +'" /></div>';
        bannerImgWrap.innerHTML = str;
        focusList.innerHTML = strFocus;
        utils.setCss(bannerImgWrap,'width',(data.length+1)*1000); //由于为了无缝连接，所以需要把最后一次累加上的第一张图片的宽度加上
//由于我们bannerImgWrap里的图片的是动态绑定生成的，所以我们根据图片的多少动态设置包含所有图片的那个盒子的宽度，宽度的值就是有多少条数据我就设置data.length*1000(图片的宽度)
    }
    //页面中右下角的焦点和数据的长度是有关系的，有多少条数据我就该有多少个焦点
}
bindData();


//给图片做延迟加载
console.log(imgList); //我们要给这些图片做延迟加载

function delayLoadImg(){
    for(var i=0; i<imgList.length; i++){
        (function (i){ //用闭包的方式去解决图片延迟加载由于延迟所带来的i变量已经变成最大值的问题
            var curImg = imgList[i];
            if(curImg.isLoad) { return }
            var tempImg = new Image();
            tempImg.src = curImg.getAttribute('trueSrc');
            tempImg.onload = function (){ //这是一个事件,事件是异步的。不会阻塞代码的运行。但是却发生在所有的循环代码执行之后. ==> 如何解决? 和选项卡的思路是基本相同的，用自定义属性的方式和闭包的方式
                curImg.src = this.src;
                utils.setCss(curImg,'display','block'); //让图片显示
                //透明度也要从0-1是一个动画的过程
                window.zhufengAnimate(curImg,{opacity:1},300,2);
                tempImg = null;
            }
            curImg.isLoad = true;
        })(i);
    }
}
window.setTimeout(delayLoadImg,500);

//实现自动轮播
var timer = null;
var step = 0; //用来记录当前是第几张图片索引,默认是第一张。第一张的索引值是0
//第一次运动是从 第一张图(inde:0) ==> 到 第二张图(index:1)
var interval = 2000;
function autoMove(){
    //运动到最后一张之后就没有了

    if(step == data.length ){ //4
        step = 0;
        utils.setCss(bannerImgWrap,'left',-step*1000); //瞬间就会回到第一张原始位置,造成视觉上没有变化的假象
    }
    step++; //累加1之后的值是我即将要运动到的终点
    window.zhufengAnimate(bannerImgWrap,{left: -step*1000},200);
    focusAlign();
}
timer =  window.setInterval(autoMove,interval); //每次执行autoMove都是轮播动作，用定时器间隔interval执行一次就自动轮播了

function focusAlign(){ //焦点对齐
    var tempStep = step == focusListLis.length ? 0 : step; //当step大于最后一个小圆圈的索引的时候 ==> 判断step是即将运动到哪个位置。如果即将要运动到第五张(其实就是和第一张相同的那一张),那么对应的焦点应该是第一张，第一张的索引是0
    for(var i =0; i<focusListLis.length; i++){
        if(i === tempStep){
            focusListLis[i].className = 'bg';
        }else{
            focusListLis[i].className = '';
        }
    }
}

//鼠标悬停在轮播图上的时候停止自动轮播，鼠标离开的时候轮播继续
banner.onmouseover = function (){
    window.clearInterval(timer);
    leftBtn.style.display = rightBtn.style.display = 'block'; //鼠标滑过的时候让左右切换按钮显示
}
banner.onmouseout = function (){
    timer =  window.setInterval(autoMove,interval);
    leftBtn.style.display = rightBtn.style.display = 'none';
}

//点击左右按钮的时候要对应切换

leftBtn.onclick = function (){
    if(step == 0){
        step = data.length;
        utils.setCss(bannerImgWrap,'left',-step*1000);
    }
    step--;
    window.zhufengAnimate(bannerImgWrap,{left: -step*1000},200);
    focusAlign();
}
rightBtn.onclick = autoMove; //向右点击的效果其实和自动轮播是相同的，自动轮播是用定时器驱动的。点击轮播是用点击事件驱动的

//点击焦点的时候切换到对应焦点的图片
function bindEventForFocus(){
    for(var i=0; i<focusListLis.length; i++){
        var curFocus = focusListLis[i];
        curFocus.index = i;
        curFocus.onclick = function (){
            //点击的时候要切换到对应的图片==>从当前的位置运动到对应焦点索引的位置,那么就是对应焦点的索引就是我要运动的终点
            step = this.index; //step一定要拿出来重新赋值，因为step是全局的。自动轮播和点击左右按钮，焦点切换等都依赖这个step
            zhufengAnimate(bannerImgWrap,{left:-step*1000},200);
            focusAlign();
        }
    }
}
bindEventForFocus();

