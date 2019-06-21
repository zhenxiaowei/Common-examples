//->首先判断当前的页面是增加还是修改:如果页面URL地址传递了id这个参数就是修改,反之就是增加；如果是修改的话,进入当前页面的第一件事情把对应客户的信息读取出来并且存放在四个文本框中
var nowURL = window.location.href;//->获取当前页面的URL地址
var obj = queryURLParmeter(nowURL);
var isFlag = false;//->验证是否为修改


if (obj["id"]) {
    isFlag = true;
    get("/getData?id=" + obj["id"], function (data) {
        console.log(data[0]);
        distributeValueToInput(data[0], $("#addForm"));
    }, function (msg) {
        showError(msg.msg);
    })
}

//->当点击提交的时候,我们需要判断是增加还是修改
$("#submit").off("click").on("click", function (e) {
    //->阻止SUBMIT按钮的默认行为
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    var resObj = $("#addForm").serializeObject();
    if (isFlag) {//->当前属于修改
        resObj["id"] = obj["id"];
        post("/updateCustom", JSON.stringify(resObj), function (data) {
                showSuccess(data.message);
                setTimeout(function () {
                    window.location.href = "index.html";
                }, 1000);
        }, function (msg) {
            showError(msg.msg);
        });
        return;
    }

    //->当前属于增加
    post("/addCustom", JSON.stringify(resObj), function (data) {
        showSuccess(data.message);
            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);
    }, function (msg) {
        showError(msg.msg);
    })
});
