/**
 * Created by Administrator on 2018/5/22.
 */
var num=0;
var txt;
var btn;
window.onload= function () {
    txt=document.getElementById("txt");
    btn=document.getElementById("addBtn");
    if(sessionStorage.num){
        num=sessionStorage.num;
    }else{
        num=0;
    }
    btn.onclick= function () {
        num++;
        sessionStorage.num=num;
        showNum()

    }
};
function showNum(){
    txt.innerHTML=num;
}