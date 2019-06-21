function ajax({url='',type='get',dataType='json'}) {//不传递参数的时候的默认值
    return new Promise((resolve, reject)=> {
        let xhr = new XMLHttpRequest();
        xhr.open(type, url, true);
        xhr.responseType = dataType;
        xhr.onload = function () {//xhr.readState==4  xhr.status==200   html5方法可以省略这两步
            if(xhr.status==200){
                resolve(xhr.response);//成功调用成功的方法
            }else{
                reject('not found');
            }

        };
        xhr.onerror= function (err) {//失败调用失败的方法
            reject(err);
        };
        xhr.send();
    });

}





//$.ajax({
//   url:'',
//    data:{},
//    type:"get",
//    dataType:"json",
//    success: function (data) {
//
//    },
//    error: function (err) {
//
//    }
//});