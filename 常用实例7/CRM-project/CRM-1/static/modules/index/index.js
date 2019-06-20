getTableDataFn(1);

function getTableDataFn(page) {
    var data = JSON.stringify({
        "pageSize": 5,
        "pageNo": page
    });
    post("/getAllData", data, function (msg) {
        if(msg && msg["code"] == 0){
            var obj = {
                curPage: msg.pageNo, //初始页码
                data: msg.data, //总共多少条数据
                columns: ['name', 'age', 'phone', 'address','remark','icon']
            };
            generateTableFn(obj, function () {
                new myPagination({
                    id: 'pagination',
                    curPage: msg.pageNo, //初始页码
                    pageTotal: msg.totalPage, //总页数
                    pageAmount: msg.pageSise,  //每页多少条
                    dataTotal: msg.totalCount, //总共多少条数据
                    pageSize: 5, //可选,分页个数
                    showPageTotalFlag: true, //是否显示数据统计
                    showSkipInputFlag: true, //是否支持跳转
                    getPage: function (pages) {
                        //获取当前页数
                        getTableDataFn(pages);
                    }
                })
            });
        }


    }, function (msg) {
        showError(msg.msg);
    })
}

function generateTableFn(obj, callback) {
    var curPage = obj.curPage;
    var pageView = obj.data;
    var columns = obj.columns;
    $("table.content tbody").html('');
    var th0;
    if (curPage == 1) {
        th0 = 0;
    } else {
        var currentPage = (curPage - 1) * 5;
        th0 = currentPage;
    }
    for (var i = 0; i < pageView.length; i++) {
        var tr = $("<tr>");
        th0++;
        var td = $("<td>" + th0 + "</td>");
        tr.append(td);
        for (var key in columns) {
            var val = columns[key];
            var o = pageView[i];
            var td;
            if(val=="icon"){
                td = $("<td>" +
                    "<a href='add.html?id=" + o["id"] + "'>修改</a>" +
                    "<a href='javascript:;' cusId='" + o["id"] + "'>删除</a>" +
                    "</td>").data('id',o.id);
            }else{
                td = $("<td>" + o[val] + "</td>").data('id',o.id);
            }
            tr.append(td);
        }
        $(".table.content tbody").append(tr);
    }
    if (callback) {
        callback();
    }
}


//2、实现删除
$(".content").off("click").on("click", function (e) {
    e = e || window.event;
    var tar = e.target || e.srcElement,
        tarTag = tar.tagName.toUpperCase();
    if (tarTag === "A" && tar.innerHTML === "删除") {
        var cusId = tar.getAttribute("cusId");
        confirmBox("确定要删除编号为 [ " + cusId + " ] 的客户吗?", function () {
            get("/removeCustom?id=" + cusId,function(data){
                if (data.code == 0) {
                    $(tar.parentNode.parentNode).remove();
                }
                showSuccess(data.message);
                getTableDataFn(1);
            },function(msg){showError(msg.msg);})
        });
    }
});



