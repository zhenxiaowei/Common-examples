/**
 * Created by lucky on 2016/6/8.
 */
var utils = {
    //把类数组转化成数组
    listToArray : function (likeArray){
        try{
            return Array.prototype.slice.call(likeArray,0);
        }catch(e){
            var a = [];
            for(var i=0; i<likeArray.length; i++){
                a[a.length] = likeArray[i];
            }
            return a;
        }
    },
    //解析json字符串
    jsonParse : function (jsonStr){
        if('JSON' in window){
            return JSON.parse(jsonStr);
        }else{
            return eval('('+jsonStr+')');
        }
    },
    //offset获取ele到body的偏移量
    offset : function (ele){
        var offsetParent = ele.offsetParent;
        var l = null;
        var t = null;
        l += ele.offsetLeft;
        t +=  ele.offsetTop;
        while(offsetParent){
            l += offsetParent.clientLeft + offsetParent.offsetLeft;
            t +=  offsetParent.clientTop + offsetParent.offsetTop;
            offsetParent = offsetParent.offsetParent;
        }
        return {left:l,top:t};
    },
    //获取可视窗口相关的
    win : function (attr,val){
        if(typeof val != 'undefined'){ //说明第二参数传了,那么就是设置这个值。只有一种情况有作用  scrollTop  scrollLeft
            document.documentElement[attr] = val;
            document.body[attr] = val;
        }
        return document.documentElement[attr] || document.body[attr];
    },
    //获取元素经过浏览器渲染之后的样式
    getCss : function (ele,attr){
        var val = null;
        if('getComputedStyle' in window){ //标准浏览器
            val = window.getComputedStyle(ele,null)[attr];
        }else{ //ie678
            //处理opacity问题，只有低版本的ie才会出现透明度用filter来写
            if(attr === 'opacity'){
                val = ele.currentStyle['filter'];
                // alpha(opacity=70.55)
                var reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/; //分组前面的?:结合一起使用就是匹配但是我不捕获。这是性能优化
               /* val = reg.test(val) ?  reg.exec(val)[1]/100 : 1;*/
                if(reg.test(val)){
                    val = reg.exec(val)[1]/100;
                }else{ //说明你根本没设置过透明度，如果没有设置透明度默认是1
                    val = 1;
                }

            }else{
                val = ele.currentStyle[attr];
            }

        }
        //需要处理单位问题 -33px  33.33px
        var regDanwei = /^-?\d+(\.\d+)?(px|pt|em|rem|deg)?$/;
        val = regDanwei.test(val) ? parseFloat(val) : val;
        return val;
    },
    setCss : function (ele,attr,val){ //给ele设置attr这个样式值是val
        //各种各样的判断 opacity需要处理,在标准和ie中不一样
        if(attr == 'opacity'){
            var userAgent = window.navigator.userAgent; //
            var reg = /MSIE (7|8)/; //用正则来判断当前浏览器是ie7/8
            if(reg.test(userAgent)){ //如果不符合条件就是ie7/8
                ele['style']['filter'] = 'alpha(opacity=' + val*100 + ')';
            }else{
                ele['style'][attr] = val;
            }
            return;
        }
        if(attr == 'float'){ //float在ie和标准中也不相同
            ele['style']['cssFloat'] = val; //标准浏览器中设置浮动
            ele['style']['styleFloat']=val; //ie低版本设置浮动
            return;
        }
        //windth height left top bottom right  margin padding marginBottom paddingRight...我们都需要加上单位
        //5  5px  setCss(outer,width,5px)  处理单位问题，如果带单位就不用处理了
        var reg = /^width|height|left|top|bottom|right|(margin|padding)(Left|Bottom|Right|Top)?$/; //后面的Left Bottom Right Top可以出现可以不出现
        if(reg.test(attr)){ //如果这个正则验证通过说明你设置就是如上那些情况
            if(!isNaN(val)){ //这个判断是val是否带了单位,如果带了单位我就不加px了 5px 6px
                val += 'px';
            }
        }
        ele['style'][attr] = val; //设置这是赋值过程
    },
    setGroupCss: function (ele,options){   //setGroupCss(oDiv,{width:100,height:100})
       //首先判断options是不是一个对象 undefined
        options = options ||  [];  //如果options没有传参数那么options就是undefined
        if(options.toString() == '[object Object]'){
            for(var attr in options){ //for in循环可以遍历原型上自己添加的公有属性
                if(options.hasOwnProperty(attr)){
                    this.setCss(ele,attr,options[attr]);
                }
            }
        }
    },
    getElementsByClass : function (strClass,context){ //'c1  c2' ==[c1,c2]
    context = context || document;
    if('getComputedStyle' in window){
        return context.getElementsByClassName(strClass);
    }

    var ary = [];
    var nodeList = context.getElementsByTagName('*');
    var classArray = strClass.replace(/^ +| +$/g,'').split(/ +/g);
    for(var i=0; i<nodeList.length; i++){
        var culTag = nodeList[i];
        var flag = true;
        for(var j=0; j<classArray.length; j++){
            var curClass = classArray[j];
            var reg = new RegExp('\\b'+curClass+'\\b'); //<div class='c1 c2 '>
            if(!reg.test(culTag.className)){
                flag = false;
                break;
            }
        }
        if(flag){
            ary.push(culTag);
        }
    }
    return ary;
}
};
//utils.setGropuCss()
