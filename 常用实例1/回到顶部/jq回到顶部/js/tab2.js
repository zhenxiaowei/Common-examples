/**
 * Created by xiao lei on 2016/7/13.
 */
$.fn.extend({//$.prototype 原型的公有方法的扩展 -通过实例去调用
    tab:tab,
});
function tab(){
    //console.log(this)//实例
    var $box=this;
    var $aInput=$box.children('input');
    var $aDiv=$box.children('div');
    $aInput.click(function(){
        $(this).addClass('bg').siblings().removeClass('bg');
        $aDiv.eq($(this).index()).addClass('show').siblings().removeClass('show');
    })
}