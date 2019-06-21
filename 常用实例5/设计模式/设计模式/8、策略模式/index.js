/**
 * Created by Administrator on 2018/5/15.
 */
 var $input=$("#input").val();
 var val={
    isEmpty: function () {
        return false;
    },
    isTel: function () {
        return true;
    }
}
var ise=val.isEmpty($input.val());
var ises=val.isTel($input.val());
if(ise&& ises){
    alert("通过审核");
}
$input.val({
    isEmpty:false,
    isTel:true
});
//$input.animate({  width: 100px },1000,''策略;
