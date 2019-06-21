/**
 * Created by Administrator on 2018/5/29.
 */
//箭头函数   arrow fn  不具备this arguments
//自己家没有this就找上一级的this

//如何更改this指向
//1 call apply bind
//2 var that=this;
//3 =>

//如何确定this是谁  看谁调用的  .前面是谁this就是谁
function a1(b) {
    return b + 1;
}

let a2 = b=> b + 1;//去掉function关键字   参数有一个可以省略小括号   小括号和大括号之间有一个箭头  如果没有大括号则直接是返回值   有大括号必须写return
console.log(a2(2))

function aa(b) {
    return function (c) {
        return b + c;
    }
}
aa(1)(2);
let aa1 = b=>c=>  b + c;//高级函数  大于两个箭头的函数
console.log(aa1(2)(3));
