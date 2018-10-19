/**
 * Created by Administrator on 2018/4/9.
 */
var User = function () {
    $(".signOutIndex").off("click").on("click", function () {
            window.location.href='index.html';
    });
    $(".signOut").off("click").on("click", function () {
        if(del()){
            window.location.href='login.html';
        }
    });
    $(".yonghuguanli").off("click").on("click", function () {
        $(".yonghuguanliContent").show();
        $(".zuzhijigouContent").hide();
    });
    $(".zuzhijigou").off("click").on("click", function () {
        $(".zuzhijigouContent").show();
        $(".yonghuguanliContent").hide();
        var data=[{"featureDataCode":"011001","equipmentTypeCode":"01","pidCode":"0","order":0,"name":"物理特性","demSel":1,"flag":0},
            {"featureDataCode":"012002","equipmentTypeCode":"01","pidCode":"011001","order":0,"name":"类型及状态","demSel":1,"flag":0},
            {"featureDataCode":"012008","equipmentTypeCode":"01","pidCode":"011001","order":1,"name":"结构与力学特性","demSel":1,"flag":0},
            {"featureDataCode":"012019","equipmentTypeCode":"01","pidCode":"011001","order":2,"name":"材料特性","demSel":1,"flag":0},
            {"featureDataCode":"011022","equipmentTypeCode":"01","pidCode":"0","order":1,"name":"运动特性","demSel":1,"flag":0},
            {"featureDataCode":"012023","equipmentTypeCode":"01","pidCode":"011022","order":0,"name":"轨道及姿态","demSel":1,"flag":0},
            {"featureDataCode":"013024","equipmentTypeCode":"01","pidCode":"012023","order":0,"name":"双行根数","demSel":0,"flag":0},
            {"featureDataCode":"013026","equipmentTypeCode":"01","pidCode":"013024","order":1,"name":"轨道六根数","demSel":0,"flag":0},
            {"featureDataCode":"013033","equipmentTypeCode":"01","pidCode":"013026","order":2,"name":"姿态","demSel":0,"flag":0},
            {"featureDataCode":"013039","equipmentTypeCode":"01","pidCode":"013033","order":3,"name":"轨道","demSel":0,"flag":0}];
        $('.TreeContent').html(showTree('0',data,1));
        $(".TreeContent li").off("click").on("click",function(e) {
            e.preventDefault();
            e.stopPropagation();
            if ($(this).children("ul").length > 0) {
                $(this).children("ul").toggle();
                if ($(this).children("ul").is(":hidden")) {
                    $(this).children("i").removeClass("icon inho inhoicon-icon-up1").addClass("icon inho inhoicon-icon-up");
                } else {
                    $(this).children("i").removeClass("icon inho inhoicon-icon-up").addClass("icon inho inhoicon-icon-up1");
                }

            }
        });
    });

    var del=function(){
        var msg="你真的确认要退出吗？\n\n请确认！";
        if(confirm(msg)==true){
            return true;
        }else{
            return false;
        }
    };
    var showTree=function(psd,list,level){
        if(list.length <= 0) return '';
        var str='';
        var ulobj=$('<ul>');
        for (var i=0;i<list.length;i++){

            if(list[i].pidCode == psd){
                var rstr = showTree(list[i].featureDataCode, list,level+1);
                if(rstr !=''){//非叶子节点
                    $('<li><i class="icon inho inhoicon-icon-up"></i><span>' + list[i].name+'</span>' + rstr +'</li>').appendTo(ulobj);
                }
                else{//叶子节点
                    var item=$('<li><i class="icon inho inhoicon-yuan"></i>');
                    item.append('<span>'+list[i].name+'</span>');
                    item.appendTo(ulobj);

                }

            }
        }
        return ulobj.children().size()>0?ulobj[0].outerHTML:'';
    }
    return {
        init: function () {

        }
    }

}();
$(document).ready(function () {
    User.init();
});