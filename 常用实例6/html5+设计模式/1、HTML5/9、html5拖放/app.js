/**
 * Created by Administrator on 2018/5/21.
 */
var box1div,msgdiv,img1,box2div;
window.onload= function () {
    box1div=document.getElementById("box1");
    box2div=document.getElementById("box2");
    msgdiv=document.getElementById("msg");
    img1=document.getElementById("img1");

    box1div.ondragover= function (e) {
        e.preventDefault();
    };
    box2div.ondragover= function (e) {
        e.preventDefault();
    };
    img1.ondragstart= function (e) {
        e.dataTransfer.setData("imgId","img1");
    };
    box1div.ondrop= drop;
    box2div.ondrop= drop;
};
function drop(e) {
    // showObj(e);
    console.log(1)
    e.preventDefault();
    var img=document.getElementById(e.dataTransfer.getData("imgId"))
    e.target.appendChild(img)

}
function showObj(obj){
    var s='';
    for(var k in obj){
        s+=k+":"+obj[k]+"<br/>";
    }
    msgdiv.innerHTML=s;
}