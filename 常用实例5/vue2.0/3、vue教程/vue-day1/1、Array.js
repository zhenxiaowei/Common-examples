/**
 * Created by Administrator on 2018/5/29.
 */
let arr = [1, 2, 3, 4, 5];
arr.b = "zxw";//数组的私有属性

//for,forEach,for in,for of的区别

for (let i = 0; i < arr.length; i++) {//编程式
    // console.log(arr[i])
}
//1、forEach不支持return
arr.forEach(function (item) {//声明式
    //console.log(item);
});
for (let key in arr) {//key会变成字符串类型   包括数组的私有属性
//console.log(key)
}
let obj = {name: "xzxw", age: 8};
for (let val of arr) {//支持return   只能of数组 不能遍历对象
    // console.log(val)
}
//强制遍历对象
for (let val of Object.keys(obj)) {//Object.keys将对象的key作为新的数组
    // console.log(obj[val])
}


//2、filter(过滤)    是否操作原数组：不    返回结果：过滤后的新数组     回调函数的返回结果：如果返回true   表示将这一项放到新数组中
let newAry = [1, 2, 3, 4, 5].filter(function (item, index) {
    return item > 2 && item < 5
});
//console.log(newAry)


//3、map(映射)  将原有的数组映射成一个新数组  [1,2,3]  <li>1</li>  <li>2</li> <li>3</li>
//不操作原数组   返回新数组    回调函数中返回什么这一项就是什么
let arr1 = [1, 2, 3].map(function (item) {
    return `<li>${item}</li>`;//  `` 是es6中的模板字符串   遇到变量用${}取值
});
//console.log(arr1.join(''));

//4、includes  //返回的是boolean
let arr2 = [1, 2, 3, 4, 5];
//console.log(arr2.includes(5));

//5、返回找到的哪一项    不会改变原数组    回调函数中返回true代表找到了，找到后停止循环
let result = arr2.find(function (item, index) {//找到具体的某一项用find    找不到的时候返回的是undefined
    return item.toString().indexOf(5) > -1;
});
//console.log(result);

//6、some  找true   找到true后停止  返回true    找不到返回false
//7、every  找true   找到false后停止  返回false

//8、reduce    收敛    4个参数    返回的是叠加后的结果    原数组不变     回调函数返回的结果：现在是求和的结果
//prev   代表的是数组的第一项，next是数组的第二项
//第二次prev是undefined，next是数组的第三项     有返回值的时候prev为返回值
let sum = [1, 2, 3, 4, 5].reduce(function (prev, next, index, item) {
    //console.log(arguments);
    //console.log(prev,next);
    return prev + next;//本次的返回值    会作为写一次的prev
});
//console.log(sum);
/*
 * { '0': 1, '1': 2, '2': 1, '3': [ 1, 2, 3, 4, 5 ] }
 { '0': undefined, '1': 3, '2': 2, '3': [ 1, 2, 3, 4, 5 ] }
 { '0': undefined, '1': 4, '2': 3, '3': [ 1, 2, 3, 4, 5 ] }
 { '0': undefined, '1': 5, '2': 4, '3': [ 1, 2, 3, 4, 5 ] }
 * */

//对象的形式求和
let sum2 = [{price: 30, count: 2}, {price: 30, count: 3}, {price: 30, count: 4}].reduce(function (prev, next) {
    //0+60
    //60+90
    //150+120
    return prev + next.price * next.count;
}, 0);//默认指定第一次的prev
//console.log(sum2);

//[[1,2,3],[4,5,6],[7,8,9]]  是二维数组
let sum3 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]].reduce(function (prev, next) {
    return prev.concat(next);//二维数组合并为一个数组
});
console.log(sum3);





