/**
 * Created by Administrator on 2018/5/10.
 */
var stopEvent= function (e) {
    e.stopPropagation()
    e.preventDefault()
};
$("#a").click(function (e) {
    stopEvent(e)
});