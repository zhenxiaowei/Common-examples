//->�����жϵ�ǰ��ҳ�������ӻ����޸�:���ҳ��URL��ַ������id������������޸�,��֮�������ӣ�������޸ĵĻ�,���뵱ǰҳ��ĵ�һ������Ѷ�Ӧ�ͻ�����Ϣ��ȡ�������Ҵ�����ĸ��ı�����
var nowURL = window.location.href;//->��ȡ��ǰҳ���URL��ַ
var obj = queryURLParmeter(nowURL);
var isFlag = false;//->��֤�Ƿ�Ϊ�޸�


if (obj["id"]) {
    isFlag = true;
    get("/getData?id=" + obj["id"], function (data) {
        if (data && data.code == 0) {
            data = data["data"];
            distributeValueToInput(data, $("#addForm"));
        }
    }, function (msg) {
        showError(msg.msg);
    })
}

//->������ύ��ʱ��,������Ҫ�ж������ӻ����޸�
$("#submit").off("click").on("click", function (e) {
    //->��ֹSUBMIT��ť��Ĭ����Ϊ
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    var resObj = $("#addForm").serializeObject();
    if (isFlag) {//->��ǰ�����޸�
        resObj["id"] = obj["id"];
        post("/updateCustom", JSON.stringify(resObj), function (data) {
            if (data && data.code == 0) {
                showSuccess(data.message);
                setTimeout(function () {
                    window.location.href = "index.html";
                }, 1000);
            }
        }, function (msg) {
            showError(msg.msg);
        })
        return;
    }

    //->��ǰ��������
    post("/addCustom", JSON.stringify(resObj), function (data) {
        if (data && data.code == 0) {
            showSuccess(data.message);
            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);
        }
    }, function (msg) {
        showError(msg.msg);
    })
});
