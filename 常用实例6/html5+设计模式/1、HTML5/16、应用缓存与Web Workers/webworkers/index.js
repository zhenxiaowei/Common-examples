/**
 * Created by Administrator on 2018/5/22.
 */
var numDiv;
var work=null;
window.onload= function () {
    numDiv=document.getElementById("numDiv");
   document.getElementById("start").onclick=startWork;
   document.getElementById("stop").onclick= function () {
          if(work){
              work.terminate()
              work=null;
          }
   };
};
function startWork(){
    if(work){
        return;
    }
    work=new Worker("count.js");
    work.onmessage= function (e) {
        numDiv.innerHTML=e.data;
    }
}