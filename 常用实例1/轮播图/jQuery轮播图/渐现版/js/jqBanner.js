/**
 * Created by xiao lei on 2016/7/8.
 */
$(document).ready((function(){
    var $box=$('#box1');
    var $boxInner=$box.children('div');
    var $aDiv=null;
    var $aImg=null;
    var $ul=$box.find('ul');
    var $aLi=null;
    var $btnLeft=$('.btnLeft');
    var $btnRight=$('.btnRight');
    var data=null;
    var step=0;
    var autoTimer=null;
    var interval=1000;
    //1.获取数据
    getData();
    function getData(){
        $.ajax({
            url:'json/data.txt?_='+Math.random(),
            type:'get',
            dataType:'json',
            async:false,
            success:function(val){
                data=val;
            }

        })
    }
    //2.绑定数据
    bind();
    function bind(){
        var str1='';
        var str2='';
        $.each(data,function(index,item){
            str1+='<div><img realImg="'+item.imgSrc+'" alt=""/></div>';
            str2+=index===0?'<li class="bg"></li>':'<li></li>';
        })
        $boxInner.html(str1);
        $ul.html(str2);
    }
    $aDiv=$boxInner.children();
    $aImg=$boxInner.find('img');
    $aLi=$ul.children();
    //3.延迟加载
    lazyImg();
    function lazyImg(){
        $.each($aImg,function(index,item){
            var tmpImg=new Image;
            tmpImg.src=$(item).attr('realImg');
            tmpImg.onload=function(){
                $(item).attr('src',this.src);
                var $div0=$aDiv.eq(0);
                $div0.css('zIndex',1);
                $div0.stop().animate({opacity:1},500)
            }
        })
    }
    //4.图片自动轮播
    autoTimer=setInterval(autoMove,interval)
    function autoMove(){
        if(step>=$aDiv.length-1){
            step=-1;
        }
        step++;
        setBanner();
    }
    function setBanner(){
        $.each($aDiv,function(index,item){
            if(index===step){
                $(item).css('zIndex',1);
                $(item).stop().animate({opacity:1},500,function(){
                    $(this).siblings().css('opacity',0);
                })
            }else{
                $(item).css('zIndex',0);
            }
        });
        bannerTip();
    }
    //5.焦点自动轮播
    function bannerTip(){
        $.each($aLi,function(index,item){
            index===step?$(item).addClass('bg'):$(item).removeClass('bg');
        })
    }
    //6.鼠标移入移出
    $box.mouseover(function(){
        clearInterval(autoTimer);
        $btnLeft.css('display','block');
        $btnRight.css('display','block');
    });
    $box.mouseout(function(){
        autoTimer=setInterval(autoMove,interval);
        $btnLeft.css('display','none');
        $btnRight.css('display','none');
    });
    //7.点击焦点手动切换
    handleChange();
    function handleChange(){
        $.each($aLi,function(index,item){
            $(item).click(function(){
                step=index;
                setBanner();
            })
        })
    }
    //8.点击左右按钮进行切换
    $btnLeft.click(function(){
        if(step<=0){
            step=$aDiv.length;
        }
        step--;
        setBanner();
    });
    $btnRight.click(function(){
        autoMove();
    });








}));