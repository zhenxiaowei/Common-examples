/**
 * Created by Administrator on 2018/5/22.
 */
var countNum=0;
function count(){
    postMessage(countNum);
    countNum++;
    setTimeout(count,1000);
}
count();