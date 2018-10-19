/**
 * Created by xiao lei on 2016/7/13.
 */
$.extend({//类的方法的扩展 -- 工具方法，通过$调用
    tab:tab,
})
function tab(idName){
    var $box=$(idName);
    var $aInput=$box.children('input');
    var $aDiv=$box.children('div');
    $aInput.click(function(){
        $(this).addClass('bg').siblings().removeClass('bg');
        $aDiv.eq($(this).index()).addClass('show').siblings().removeClass('show');
    })
}