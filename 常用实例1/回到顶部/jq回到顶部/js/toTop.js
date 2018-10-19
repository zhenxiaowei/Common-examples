/**
 * Created by xiao lei on 2016/7/13.
 */
/*$(function(){//DOM结构加载完成

})*/
$(document).ready(function(){
    var $btn=$('div');
    $(window).on('scroll',computedDisplay);//jquery中事件绑定
    function computedDisplay(){
        //当滚动条卷去的高度>可视区的高度，让按钮显示，否则，隐藏
        if($(window).scrollTop()>$(window).height()){
            $btn.css('display','block');
        }else{
            $btn.css('display','none');
        }
    }
    $btn.click(function(){
        $(this).hide();
        $(window).off('scroll');//jquery中解除事件绑定
        var target=$(window).scrollTop();
        var duration=5000;
        var interval=30;
        var step=target/duration*interval;
        clearInterval(timer);
        var timer=setInterval(function(){
            target-=step;
            if(target<=0){
                target=0;
                clearInterval(timer);
                $(window).on('scroll',computedDisplay);
                return;
            }
            $(window).scrollTop(target);
        })
    })
});