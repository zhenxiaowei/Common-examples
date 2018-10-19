function EventEmitter() {//����EventTarget���ԭ��

};
EventEmitter.prototype.on = function (type, fn) {
    if (!this["aEmitter" + type]) {
        this["aEmitter" + type] = [];
    }
    var a = this["aEmitter" + type];
    for (var i = 0; i < a.length; i++) {
        if (a[i] == fn)return this;
    }
    a.push(fn);
    return this;

}
EventEmitter.prototype.run = function (type, e) {//�ڶ���������ָ�п����õ���ϵͳ���¼�����
    var a = this["aEmitter" + type];
    if (a) {
        for (var i = 0; i < a.length; i++) {
            if (typeof a[i] == "function") {
                a[i].call(this, e);	//��ϵͳ���¼���������ȥ������������ʹ�����Լ����ʵ�����ھ��屸�����Զ����¼���ͬʱ��Ҳ����ʹ��ϵͳ���¼�����
            } else {
                a.splice(i, 1);
                i--;
            }
        }
    }
}

EventEmitter.prototype.off = function (type, fn) {
    var a = this["aEmitter" + type];
    if (a) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] == fn) {
                a[i] = null;
                return this;
            }
        }

    }
}
/* �������¼�������������-------*/

//��������ק����
//������ק�Ѿ���һ�����͵Ĳ�Ʒ�����Ѿ�����ʵ��������������ק�����ˣ����ǻ���Ҫ��������ʵ�ֺ������Ĺ���Эͬ����������������˵�������ڲ��ƻ����ڵ�Drag��Ĵ����ǰ���£����Ը�����չ�µĹ���

//�����ھ��Ǹ�Drag��ӽӿڣ�ʹ��������¼��Ĺ���
//��ק�������׶Σ���ק��ʼ����ק���У���ק�����������׶Σ������ĳЩ����������ק��ĳ���׶Σ�����קͬʱִ�У�����Ҫ���������׶ηֱ𷢲������¼�
//��Ҫȷ���������¼�����
//1��dragstart,
//2��drag
//3��dragend

function Drag(ele) {//����ele�Ǳ���ק��Ԫ��
    this.x = null;
    this.y = null;
    this.mx = null;
    this.my = null;
    this.obj = ele;//�ѹ��캯������ʱ�õ����������ק��Ԫ�ر���this��obj�У�������ȷ������Drag���ϵķ����ж����Է��ʱ���ק��Ԫ����
    this.DOWN = processThis(this.down, this);
    this.MOVE = processThis(this.move, this);
    this.UP = processThis(this.up, this);
    on(this.obj, "mousedown", this.DOWN);


}
Drag.prototype = new EventEmitter;
Drag.prototype.down = function (e) {

    this.x = this.obj.offsetLeft;
    this.y = this.obj.offsetTop;
    this.mx = e.pageX;
    this.my = e.pageY
    if (this.obj.setCapture) {
        this.obj.setCapture();
        on(this.obj, "mousemove", this.MOVE);
        on(this.obj, "mouseup", this.UP);
    } else {
        on(document, "mousemove", this.MOVE);
        on(document, "mouseup", this.UP);
    }
    e.preventDefault();
    this.run("dragstart", e);
}


Drag.prototype.move = function (e) {
    this.obj.style.left = this.x + e.pageX - this.mx + "px";
    this.obj.style.top = this.y + e.pageY - this.my + "px";
    this.run("drag", e);
}

Drag.prototype.up = function (e) {
    if (this.obj.releaseCapture) {
        this.obj.releaseCapture();
        off(this.obj, "mousemove", this.MOVE);
        off(this.obj, "mouseup", this.UP);
    } else {
        off(document, "mousemove", this.MOVE)
        off(document, "mouseup", this.UP);
    }
    this.run("dragend", e);
}

Drag.prototype.range = function (obj) {
    this.oRange = obj;
    this.on("drag", this.addRange);//����ʵ���޷�Χ����ק����addRange��ʵ��

}

Drag.prototype.addRange = function (e) {
    this.oRange//{l:0,r:500,t:0,b:300}
    //�൱��move��д
    var currentX = this.x + e.pageX - this.mx;
    var currentY = this.y + e.pageY - this.my;
    if (currentX >= this.oRange.r) {//����������ұ߽磬��ͣ���ұ߽���
        this.obj.style.left = this.oRange.r + "px";
    } else if (currentY <= this.oRange.l) {
        this.obj.style.left = this.oRange.l + "px";
    } else {
        this.obj.style.left = currentX + "px";
    }

    if (currentY >= this.oRange.b) {
        this.obj.style.top = this.oRange.b + "px";
    } else if (currentY <= this.oRange.t) {
        this.obj.style.top = this.oRange.t + "px";
    } else {
        this.obj.style.top = this.y + e.pageY - this.my + "px";
    }
}

Drag.prototype.border = function () {
    this.on("dragstart", this.addBorder);
    this.on("dragend", this.removeBorder);
}
Drag.prototype.addBorder = function () {
    this.obj.style.border = "2px purple dashed";
}

Drag.prototype.removeBorder = function () {
    this.obj.style.border = "none";
}
/*
 �����¼��󶨹��ܵģ���������չ���ܵ���ק��Ʒ
 ʹ��˵����
 1.ʵ��ĳԪ��ele����ק����ʽ��new Drag(ele);
 2.Dragʵ�������¼��󶨵Ĺ��ܣ������
 2.1 dragstart �÷�����
 var obj=new Drag(ele);
 obj.on("dragstart",fn);
 ��������ʵ������ק��ʼ�Ľ׶�����fn����
 2.2 drag
 2.3 dragend
 3.��Ʒ����ϸ�ڡ��������ʹ�ñ���ק��Ԫ�أ�����ʵ������obj����
 ����ǰ󶨵ķ�����ʹ�ñ���ק��Ԫ�أ���ʹ��this.obj
 ����1.1
 4 ��ק��ʱ���һ��ָ����ק��Χ���޶���Χ����ק�������ק�ķ�Χ���ɲ���ָ���ģ�


 */
/*
 var obj1=new Drag(div1);
 obj1.on("dragend",drop);
 obj1.range({l:0,r:500,t:0,b:300});//��ʾ�ڲ�������ָ���ķ�Χ��ʵ����ק��ˮƽ����0-500����ֱ����0-300��
 ele.addEventListener("click",fn);

 */
