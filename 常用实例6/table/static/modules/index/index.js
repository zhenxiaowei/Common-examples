var data = JSON.stringify({
    "equipmentTypeId": 100,
    "featureId": 100,
    "equipmentId": 1,
    "attributeId": 115,
    "pageNo": 1
});
post("http://localhost:8089/casic207/datainfo/ListData", data, function (msg) {
    console.log(msg);
}, function (msg) {
    showError(msg.msg);
})
f(1);
function f(page) {

}

new myPagination({
    id: 'pagination',
    curPage:1, //初始页码
    pageTotal: 50, //总页数
    pageAmount: 10,  //每页多少条
    dataTotal: 500, //总共多少条数据
    pageSize: 5, //可选,分页个数
    showPageTotalFlag:true, //是否显示数据统计
    showSkipInputFlag:true, //是否支持跳转
    getPage: function (page) {
        //获取当前页数
       f(page);
    }
});