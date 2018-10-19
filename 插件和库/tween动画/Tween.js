/**
 * Created by lucky on 2016/6/18.
 */

;(function () {
    /**
     * @param ele  我要运动元素
     * @param target 元素要运动到的终点
     * @param duration 在多长的时间内完成
     */
    function move(ele, target, duration,effect,callback) { //负责让元素动画
        //callback回调函数：当第一个动作结束的时候然后才执行第二个动作。
        var zhufengEffect = {
            //匀速
            Linear: function (t, b, c, d) {
                return c * t / d + b;
            },
            //指数衰减的反弹缓动
            Bounce: {
                easeIn: function (t, b, c, d) {
                    return c - zhufengEffect.Bounce.easeOut(d - t, 0, c, d) + b;
                },
                easeOut: function (t, b, c, d) {
                    if ((t /= d) < (1 / 2.75)) {
                        return c * (7.5625 * t * t) + b;
                    } else if (t < (2 / 2.75)) {
                        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                    } else if (t < (2.5 / 2.75)) {
                        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                    } else {
                        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                    }
                },
                easeInOut: function (t, b, c, d) {
                    if (t < d / 2) {
                        return zhufengEffect.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
                    }
                    return zhufengEffect.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
                }
            },
            //二次方的缓动
            Quad: {
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return -c * (t /= d) * (t - 2) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t + b;
                    }
                    return -c / 2 * ((--t) * (t - 2) - 1) + b;
                }
            },
            //三次方的缓动
            Cubic: {
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t + 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t * t + b;
                    }
                    return c / 2 * ((t -= 2) * t * t + 2) + b;
                }
            },
            //四次方的缓动
            Quart: {
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t * t * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t * t * t + b;
                    }
                    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
                }
            },
            //五次方的缓动
            Quint: {
                easeIn: function (t, b, c, d) {
                    return c * (t /= d) * t * t * t * t + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t * t * t * t + b;
                    }
                    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
                }
            },
            //正弦曲线的缓动
            Sine: {
                easeIn: function (t, b, c, d) {
                    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * Math.sin(t / d * (Math.PI / 2)) + b;
                },
                easeInOut: function (t, b, c, d) {
                    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
                }
            },
            //指数曲线的缓动
            Expo: {
                easeIn: function (t, b, c, d) {
                    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
                },
                easeOut: function (t, b, c, d) {
                    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if (t == 0) return b;
                    if (t == d) return b + c;
                    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
                }
            },
            //圆形曲线的缓动
            Circ: {
                easeIn: function (t, b, c, d) {
                    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
                },
                easeOut: function (t, b, c, d) {
                    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
                },
                easeInOut: function (t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                    }
                    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
                }
            },
            //超过范围的三次方缓动
            Back: {
                easeIn: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c * (t /= d) * t * ((s + 1) * t - s) + b;
                },
                easeOut: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
                },
                easeInOut: function (t, b, c, d, s) {
                    if (s == undefined) s = 1.70158;
                    if ((t /= d / 2) < 1) {
                        return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                    }
                    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
                }
            },
            //指数衰减的正弦曲线缓动
            Elastic: {
                easeIn: function (t, b, c, d, a, p) {
                    if (t == 0) return b;
                    if ((t /= d) == 1) return b + c;
                    if (!p) p = d * .3;
                    var s;
                    !a || a < Math.abs(c) ? (a = c, s = p / 4) : s = p / (2 * Math.PI) * Math.asin(c / a);
                    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                },
                easeOut: function (t, b, c, d, a, p) {
                    if (t == 0) return b;
                    if ((t /= d) == 1) return b + c;
                    if (!p) p = d * .3;
                    var s;
                    !a || a < Math.abs(c) ? (a = c, s = p / 4) : s = p / (2 * Math.PI) * Math.asin(c / a);
                    return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
                },
                easeInOut: function (t, b, c, d, a, p) {
                    if (t == 0) return b;
                    if ((t /= d / 2) == 2) return b + c;
                    if (!p) p = d * (.3 * 1.5);
                    var s;
                    !a || a < Math.abs(c) ? (a = c, s = p / 4) : s = p / (2 * Math.PI) * Math.asin(c / a);
                    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
                }
            }
        };
        //需要准备运动所需要t,b,c,d
        var curEffect = zhufengEffect.Linear;
        //curEffecct = zhufengEffect[][]

        if(typeof effect == 'number'){
            switch (effect) {
                case 1:
                    curEffect = zhufengEffect.Elastic.easeInOut;
                    break;
                case 2:
                    curEffect = zhufengEffect.Back.easeInOut;
                    break;
                case 3:
                    curEffect = zhufengEffect.Bounce.easeIn;
            }
        }
        if(effect instanceof Array){ //说明是一个数组
            curEffect = zhufengEffect[effect[0]][effect[1]];
            //curEffect = zhufengEffect['Back']['easeInOut'];
        }
        if(typeof effect == 'function'){ //如果传的第四个参数是一个函数，那么我理解为师传给回调函数的
            callback = effect;
        }

        var time = 0;
        //begin这个对象的属性的多少和target的属性多少相同
        var begin = {};
        var change = {};
        var interval = 10;
        for(var key in target){ //根据target的维度，想begin中添加相同的维度
            if(target.hasOwnProperty(key)){ //不要原型上的
                //begin添加在这里只能用[]的方式
                begin[key] = utils.css(ele,key); //把当前元素已经生效的原始样式赋值给begin
                change[key] = target[key] - begin[key];
            }
        }
        //启动一个定时器
        window.clearInterval(ele.timer); //每次执行move的时候需要把上一次的定时器清除掉，如果你的两次点击动作小于duration时间间隔，就会有两个定时器同时存在了。所以会有动画累计问题。
        ele.timer =  window.setInterval(function (){
            time += interval; //只要定时器执行一次时间就会增长,只要时间time变化了，就能根据匀速公式导致当前位置的改变
            if(time >= duration){ //运动到终点清定时器
                window.clearInterval(ele.timer);
                utils.css(ele,target);
                //回调函数在运动结束之后执行，要判断callback这个参数是否是一个函数，如果是一个函数就执行这个函数
                if(typeof callback === 'function'){
                    callback.call(ele); //把callback中的this换成ele
                }
                return;
            }
            for(var attr in change){
                var curWeiDu = change[attr];
                if(curWeiDu){
                    var curPosi = curEffect(time,begin[attr],change[attr],duration); //由于每次时间的增加导致curPosi也会随之变化
                    utils.css(ele,attr,curPosi); //把变化的值重新赋值给元素的维度属性
                }
            }
        },interval);
    }
    window.zhufengAnimate = move;
    //把move函数的引用地址赋值给window的一个属性
})();

//zhufengAnimate(oDiv,{width:500,height:600,opacity:1},1000); //本意：我让oDiv在1000ms内width运动到500，高度运动到600
//begin={width:当前元素运动之前的宽度，height: 当前元素运动之前的高度, opacity:0.8, paddLeft: 500;  }


//第227行需要注意的问题：如果不清掉会有一个这样的问题，如果连续点击快了，比如在200ms内点击了2次。如果不到200ms定时器还不会清掉。那么点击两次就会有这样的效果上一次定时器还在驱动，因为没到200ms还没有到达终点，而点击第二次的时候又启动了一个新的定时器。这样两个定时器就同时存在。就会有问题。所以在每次点击执行move方法的时候，先把上一次的清掉。定时器不会因为ele.timer重新赋值就会停止。定时器清除必须用clearInterval


