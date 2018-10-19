//post(url,data,function(msg){},function(msg){showError(msg.msg);})
function post(url, data, succCallback, failcallback) {
    $.ajax({
        type : "post",
        url : url,
        data : data,
        dataType : "json",
        headers : {
            "Accept" : "application/json",
            "Content-Type" : "application/json"
        },
        success : function(msg) {
            succCallback(msg);
        },
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            try {
                if (XMLHttpRequest.responseJSON) {
                    var data = XMLHttpRequest.responseJSON || "";
                    if (data.msg == "no login") {
                        window.location.href = webroot + "/";
                    } else {
                        failcallback(data);
                    }
                } else {
                    failcallback({'msg':"通讯异常"});
                }
            } catch (e) {
                logError(e);
                failcallback(e.message);
            }
        }
    });
};

//get(url,function(msg){},function(msg){showError(msg.msg);})
function get(url, succcallback, failcallback, data) {
    $.ajax({
        type : "get",
        url : url,
        data : data || "",
        dataType : "json",
        headers : {
            "Accept" : "application/json",
            "Content-Type" : "application/json"
        },
        success : function(msg) {
            succcallback(msg);
        },
        error : function(XMLHttpRequest, textStatus, errorThrown) {
            try {
                if (XMLHttpRequest.responseJSON) {
                    var data = XMLHttpRequest.responseJSON || "";
                    if (data.msg == "no login") {
                        window.location.href = webroot + "/";
                    } else {
                        failcallback(data);
                    }
                } else {
                    failcallback({'msg':"通讯异常"});
                }

            } catch (e) {
                logError(e);
                failcallback(e.message);
            }
        }
    });
}
//失败
function showError(value) {
    if(window.toastr){
        window.toastr['error'](value);
    }else{
        console.error(value);
    }
}
//成功
function showSuccess(value) {
    if(window.toastr){
        window.toastr['success'](value);
    }else{
        console.success(value);
    }
}