/**
 * Created by 83363 on 2016/6/29.
 */
var utils = (function () {
    var flag = 'getComputedStyle' in window;

    //rnd:兼容版的求一定范围的随机数
    function rnd(n, m) {
        n = Number(n);
        m = Number(m);
        if (isNaN(n) || isNaN(m)) {
            return Math.round();
        }
        if (n > m) {
            var tmp = n;
            n = m;
            m = tmp;
        }
        return Math.round(Math.random() * (m - n) + n);
    }

    //listToArray类数组集合转为数组
    function listToArray(arg) {
        if (flag) {
            return Array.prototype.slice.call(arg);
        }
        var ary = [];
        for (var i = 0; i < arg.length; i++) {
            ary.push(arg[i]);
        }
        return ary;
    }

    //JSON格式字符串转为JSON格式对象
    function jsonParse(str) {
        return 'JSON' in window ? JSON.parse(str) : eval('(' + str + ')');
    }

    //win:操作浏览器盒子模型信息
    function win(attr, value) {
        if (typeof value === 'undefined') {
            return document.documentElement[attr] || document.body[attr];
        }
        document.documentElement[attr] = value;
        document.body[attr] = value;
    }

    //setoff获取页面中任意元素距离Body的偏移量
    function offset(curEle) {
        var l = curEle.offsetLeft;
        var t = curEle.offsetTop;
        var par = curEle.offsetParent;
        while (par) {
            if (navigator.userAgent.indexOf('MSIE 8.0') === -1) {
                l += par.clientLeft;
                t += par.clientTop;
            }
            l += par.offsetLeft;
            t += par.offsetTop;
            par = par.offsetParent;
        }
        return {left: l, top: t};
    }

    //getCss:获取经过浏览器计算过的样式（面试：如何获取非行间样式）
    function getCss(curEle, attr) {
        var val = null, reg = null;
        if (flag) {
            val = getComputedStyle(curEle, false)[attr];
        } else {
            if (attr === 'opacity') {
                val = curEle.currentStyle.filter;
                reg = /^alpha\(opacity[=:](\d+)\)$/;
                return reg.test(val) ? reg.exec(val)[1] / 100 : 1;
            } else {
                val = curEle.currentStyle[attr];
            }
        }
        reg = /^([+-])?\d+(\.\d+)?(pt|px|rem|em)$/;
        return reg.test(val) ? parseFloat(val) : val;
    }

    //getElementsByClass:通过元素的样式类名获取一组元素集合
    function getElementsByClass(curEle, strClass) {
        curEle = curEle || document;
        if (flag) {
            return this.listToArray(getElementsByClassName(strClass));
        }
        var aryClass = strClass.replace(/(^ +)|( +$)/g, '').split(/\s+/g);
        var nodeList = curEle.getElementsByTagName('*');
        var ary = [];
        for (var i = 0; i < nodeList.length; i++) {
            var curNode = nodeList[i];
            var bOK = true;
            for (var k = 0; k < aryClass.length; k++) {
                var curClass = aryClass[k];
                var reg = new RegExp('(^| +)' + curClass + '( +|$)');
                if (!reg.test(curNode.className)) {
                    bOK = false;
                    break;
                }
            }
            if (bOK) {
                ary.push(curNode);
            }
        }
        return ary;
    }

    //hasClass:验证当前元素中是否包含className这个样式类名
    function hasClass(curEle, className) {
        var reg = new RegExp('(^| +)' + className + '( +|$)');
        return reg.test(curEle.className);
    }

    //addClass:给元素增加样式类名
    function addClass(curEle, strClass) {
        var aryClass = strClass.replace(/(^ +)|( +$)/g, '').split(/\s+/g);
        for (var i = 0; i < aryClass.length; i++) {
            var curClass = aryClass[i];
            if (!this.hasClass(curEle, curClass)) {
                curEle.className += ' ' + curClass;
            }
        }
    }

    //removeClass:元素身上如果有这个className就删除
    function removeClass(curEle, strClass) {
        var aryClass = strClass.replace(/(^ +)|( +$)/g, '').split(/\s+/);
        for (var i = 0; i < aryClass.length; i++) {
            var reg = new RegExp('\\b' + aryClass[i] + '\\b');
            if (this.hasClass(curEle, aryClass[i])) {
                curEle.className = curEle.className.replace(reg, ' ').replace(/\s+/g, ' ').replace(/(^ +)|( +$)/g, '');
            }
        }
    }

    //setCss:设置样式,透明度 单位 float
    function setCss(curEle, attr, value) {
        if (attr === 'float') {
            curEle.style.styleFloat = value;
            curEle.style.cssFloat = value;
            return;
        }
        if (attr === 'opacity') {
            curEle.style.opacity = value;
            curEle.style.filter = 'alpha(opacity=' + value * 100 + ')';
            return;
        }
        var reg = /(width|height|top|bottom|right|left|(maigin|padding(top|right|bottom|left)?))/;
        if (reg.test(attr)) {
            value = parseFloat(value) + 'px';
        }
        curEle.style[attr] = value;
    }

    //setGroupCss:给当前元素批量的设置样式属性值
    function setGroupCss(curEle, options) {
        for (var attr in options) {
            this.setCss(curEle, attr, options[attr])
        }
    }

    //css:此方法实现了获取、单独设置、批量设置元素的样式值
    function css(curEle) {
        var arg2 = arguments[1];
        if (typeof arg2 === 'string') {
            var arg3 = arguments[2];
            if (typeof arg3 === 'undefined') {
                return this.getCss(curEle, arg2);
            } else {
                this.setCss(curEle, arg2, arg3);
            }
        }
        if (arg2.toString() === '[object Object]') {
            this.setGroupCss(curEle, arg2);
        }
    }

    //getChildren:获取当前元素下的子元素节点
    function getChildren(curEle) {
        if (flag) {
            return this.listToArray(curEle.children);
        }
        var ary = [];
        var nodeList = curEle.childNodes;
        for (var i = 0; i < nodeList.length; i++) {
            if (nodeList[i].nodeType === 1) {
                ary[ary.length] = nodeList[i];
            }
        }
        return ary;
    }

    //prev 获取上一个哥哥元素节点
    function prev(curEle) {
        if (flag) {
            return curEle.previousElementSibling;
        }
        var pre = curEle.previousSibling;
        while (pre && pre.nodeType !== 1) {
            pre = pre.previousSibling;
        }
        return pre;
    }

    //prevAll:获取所有的哥哥元素节点
    function prevAll(curEle) {
        var pre = this.prev(curEle);
        var ary = [];
        while (pre) {
            ary.unshift(pre);
            pre = this.prev(pre);
        }
        return ary;
    }

    //next:获取当前元素下一个弟弟元素节点
    function next(curEle) {
        if (flag) {
            return curEle.nextElementSibling;
        }
        var nex = curEle.nextSibling;
        while (nex && nex.nodeType !== 1) {
            nex = nex.nextSibling;
        }
        return nex;
    }

    //nextAll:获取所有的弟弟元素节点
    function nextAll(curEle) {
        var nex = this.next(curEle);
        var ary = [];
        while (nex) {
            ary.push(nex);
            nex = this.next(nex);
        }
        return ary;
    }

    //sibling:获取当前元素的相邻元素
    function sibling(curEle) {
        var pre = this.prev(curEle);
        var nex = this.next(curEle);
        var ary = [];
        if (pre) ary.push(pre);
        if (nex) ary.push(nex);
        return ary;
    }

    //siblings:获取当前元素的所有兄弟节点
    function siblings(curEle) {
        return this.prevAll(curEle).concat(this.nextAll(curEle));
    }

    //firstChild:获取当前元素下第一个子元素节点
    function firstChild(curEle) {
        return this.getChildren(curEle)[0];
    }

    //lastChild:获取当前元素下最后一个子元素节点
    function lastChild(curEle) {
        var aChs = this.getChildren(curEle);
        return aChs[aChs.length - 1];
    }

    //index:获取当前元素的索引
    function index(curEle) {
        return this.prevAll(curEle).length;
    }

    //appendChild:向指定容器的末尾追加元素
    function appendChild(parent, newEle) {
        parent.appendChild(newEle);
    }

    //prependChild:向指定容器的开头追加元素
    //->把新的元素添加到容器中第一个子元素节点的前面,如果一个元素子节点都没有,就放在末尾即可
    function prependChild(parent, newEle) {
        var first = this.firstChild(parent);
        if (first) {
            parent.insertBefore(newEle, first);
        } else {
            parent.appendChild(newEle);
        }
    }

    //->insertBefore:把新元素(newEle)追加到指定元素(oldEle)的前面
    function insertBefore(newEle, oldEle) {
        oldEle.parentNode.insertBefore(newEle, oldEle);
    }

    //->insertAfter:把新元素(newEle)追加到指定元素(oldEle)的后面
    //->相当于追加到oldEle弟弟元素的前面,如果弟弟不存在,也就是当前元素已经是最后一个了,我们把新的元素放在最末尾即可
    function insertAfter(newEle, oldEle) {
        var nex = this.next(oldEle);
        if (nex) {
            oldEle.parentNode.insertBefore(newEle, nex);
        } else {
            oldEle.parentNode.appendChild(newEle);
        }
    }


    return {
        rnd: rnd,
        listToArray: listToArray,
        jsonParse: jsonParse,
        win: win,
        offset: offset,
        getCss: getCss,
        getElementsByClass: getElementsByClass,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        setCss: setCss,
        setGroupCss: setGroupCss,
        css: css,
        getChildren: getChildren,
        prev: prev,
        prevAll: prevAll,
        next: next,
        nextAll: nextAll,
        sibling: sibling,
        siblings: siblings,
        firstChild: firstChild,
        lastChild: lastChild,
        index: index,
        appendChild: appendChild,
        prependChild: prependChild,
        insertBefore: insertBefore,
        insertAfter: insertAfter
    }
})();