// window.onload=function  () {
// 		  var box=document.getElementById("box");
// 		  box.ondragenter=function  (e) {
// 		  e.preventDefault()
// 		  }
// 		  box.ondragover=function  (e) {
// 		  box.innerHTML="请松开"
// 		   e.preventDefault()
// 		  }
// 		  box.ondragleave=function  (e) {
// 		   box.innerHTML="请拖入上传的文件"
// 		  e.preventDefault()
// 		  }
// 		  box.ondrop=function  (e) {
// 		  var file=e.dataTransfer.files[0];
// 		  var formData=new FormData(); 
//            formData.append("aa",file);
// 		  var xml=new XMLHttpRequest();
// 		  xml.open("post","up.php");
// 		  xml.send(formData);
//            e.preventDefault()
// 		  }
// 		 }


		 function change() {
    var pic = document.getElementById("preview"),
        file = document.getElementById("f");
    var ext=file.value.substring(file.value.lastIndexOf(".")+1).toLowerCase();
     // gif在IE浏览器暂时无法显示
     if(ext!='png'&&ext!='jpg'&&ext!='jpeg' &&ext!='gif'){
         alert("图片的格式必须为png或者jpg或者jpeg格式！");
         return;
     }
     var isIE = navigator.userAgent.match(/MSIE/)!= null,
         isIE6 = navigator.userAgent.match(/MSIE 6.0/)!= null;
 
     if(isIE) {
        file.select();
        var reallocalpath = document.selection.createRange().text;
 
        // IE6浏览器设置img的src为本地路径可以直接显示图片
         if (isIE6) {
            pic.src = reallocalpath;
         }else {
            // 非IE6版本的IE由于安全问题直接设置img的src无法显示本地图片，但是可以通过滤镜来实现
             pic.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src=\"" + reallocalpath + "\")";
             // 设置img的src为base64编码的透明图片 取消显示浏览器默认图片
             pic.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
         }
     }else {
        html5Reader(file);
     }
}
 function html5Reader(file){
     var file = file.files[0];
     var reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = function(e){
         var pic = document.getElementById("preview");
         pic.src=this.result;
     }
 }