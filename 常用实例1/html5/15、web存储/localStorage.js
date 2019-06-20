
/**
 * Created by Administrator on 2018/5/22.
 */
var ta;
var btn;
window.onload= function () {
    ta=document.getElementById("ta");
    if(localStorage.text){
        ta.value=localStorage.text;
    }
    btn=document.getElementById("btn");
    btn.onclick= function () {
        localStorage.text=ta.value;
    }
};