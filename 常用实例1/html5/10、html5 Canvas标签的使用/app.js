/**
 * Created by Administrator on 2018/5/22.
 */
var wid=500,hei=500;
var mycanvas,context;

window.onload= function () {
    createCanvas();
    //drawRect();
    drawImage()
};
function createCanvas(){
    document.body.innerHTML="<canvas id=\"mycanvas\" width=\""+wid+"\" height=\""+hei+"\"></canvas>";
    mycanvas=document.getElementById("mycanvas");
    context=mycanvas.getContext("2d");
}
//绘制图形
function drawRect(){
    context.fillStyle='red';
   // context.rotate(45);//旋转
    //context.translate(200,200);//移动
    //context.scale(2,0.5);//缩放
    context.fillRect(0,0,200,200);
}

//绘制图片
function drawImage(){
    var img=new Image();
    img.onload= function () {
        context.drawImage(img,0,0);
    };
    img.src='cdbj.jpg';
}