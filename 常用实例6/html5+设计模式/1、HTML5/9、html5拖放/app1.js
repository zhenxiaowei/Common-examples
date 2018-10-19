/**
 * Created by Administrator on 2018/5/22.
 */
var imgContainer,msgdiv;
window.onload= function () {
    imgContainer=document.getElementById("imgContainer");
    msgdiv=document.getElementById("msg");
    imgContainer.ondragover= function (e) {
        e.preventDefault();
    };
    imgContainer.ondrop= function (e) {
        e.preventDefault();
       // showObj(e);
       var f=e.dataTransfer.files[0];
        var fileReader=new FileReader();
        fileReader.onload= function (e) {
            showObj(e);
            imgContainer.innerHTML="<img src=\""+fileReader.result+"\">";
        }
        fileReader.readAsDataURL(f);
    }
};
function showObj(obj){
    var s='';
    for(var k in obj){
        s+=k+":"+obj[k]+"<br/>";
    }
    msgdiv.innerHTML=s;
}