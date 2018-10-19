//��ȡԪ��
var banner = utils.getElementsByClass('banner')[0]; //���ķ�Χ
var bannerImgWrap = utils.getElementsByClass('bannerImgWrap',banner)[0]; //��������ͼƬ�Ĵ����
var divsList = bannerImgWrap.getElementsByTagName('div'); //��������ͼƬ��Сdiv
var imgList = bannerImgWrap.getElementsByTagName('img'); //���е�ͼƬ
var focusList = utils.getElementsByClass('focusList',banner)[0]; //����ĺ���
var focusListLis = focusList.getElementsByTagName('li'); //���еĽ���
var leftBtn = banner.getElementsByTagName('a')[0]; //���水ť
var rightBtn = banner.getElementsByTagName('a')[1]; //���水ť

//��ȡ���� ajax
var data = null;
function getData(){
    var xhr = new XMLHttpRequest();
    xhr.open('get','data.txt?_='+Math.random(),false);
    xhr.onreadystatechange = function (){
        if(xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)){
            data = utils.jsonParse(xhr.responseText);
        }
    }
    xhr.send(null);
}
getData();
console.log(data);

//������

function bindData(){
//<div><img src="images/banner1.jpg" alt=""/></div>
    var str = "";
    var strFocus = '';
    if(data){ //���ݴ����Ҳ���ƴ��
        for(var i= 0, l = data.length; i<l; i++){
            var curData = data[i]; //ÿ��ѭ���ĵ�ǰ��һ������
            str += '<div><img src="" trueSrc="'+ curData.src +'" /></div>'; //ÿ��ƴ�ӵ�������img
            if(i ===0){ //��һ�������Ĭ�ϵ���ʽ��������Ҫ�ֱ�����
                strFocus += '<li class="bg"></li>';
            }else{
                strFocus += '<li></li>'; //ÿ��ƴ�ӵĽ���
            }
        }
        //��������ط���str��ĩβ�����ۼ�һ����һ��ͼƬ ==> Ϊ�������޷�����
        str += '<div><img src="" trueSrc="'+ data[0].src +'" /></div>';
        bannerImgWrap.innerHTML = str;
        focusList.innerHTML = strFocus;
        utils.setCss(bannerImgWrap,'width',(data.length+1)*1000); //����Ϊ���޷����ӣ�������Ҫ�����һ���ۼ��ϵĵ�һ��ͼƬ�Ŀ�ȼ���
//��������bannerImgWrap���ͼƬ���Ƕ�̬�����ɵģ��������Ǹ���ͼƬ�Ķ��ٶ�̬���ð�������ͼƬ���Ǹ����ӵĿ�ȣ���ȵ�ֵ�����ж����������Ҿ�����data.length*1000(ͼƬ�Ŀ��)
    }
    //ҳ�������½ǵĽ�������ݵĳ������й�ϵ�ģ��ж����������Ҿ͸��ж��ٸ�����
}
bindData();


//��ͼƬ���ӳټ���
console.log(imgList); //����Ҫ����ЩͼƬ���ӳټ���

function delayLoadImg(){
    for(var i=0; i<imgList.length; i++){
        (function (i){ //�ñհ��ķ�ʽȥ���ͼƬ�ӳټ��������ӳ���������i�����Ѿ�������ֵ������
            var curImg = imgList[i];
            if(curImg.isLoad) { return }
            var tempImg = new Image();
            tempImg.src = curImg.getAttribute('trueSrc');
            tempImg.onload = function (){ //����һ���¼�,�¼����첽�ġ�����������������С�����ȴ���������е�ѭ������ִ��֮��. ==> ��ν��? ��ѡ���˼·�ǻ�����ͬ�ģ����Զ������Եķ�ʽ�ͱհ��ķ�ʽ
                curImg.src = this.src;
                utils.setCss(curImg,'display','block'); //��ͼƬ��ʾ
                //͸����ҲҪ��0-1��һ�������Ĺ���
                window.zhufengAnimate(curImg,{opacity:1},300,2);
                tempImg = null;
            }
            curImg.isLoad = true;
        })(i);
    }
}
window.setTimeout(delayLoadImg,500);

//ʵ���Զ��ֲ�
var timer = null;
var step = 0; //������¼��ǰ�ǵڼ���ͼƬ����,Ĭ���ǵ�һ�š���һ�ŵ�����ֵ��0
//��һ���˶��Ǵ� ��һ��ͼ(inde:0) ==> �� �ڶ���ͼ(index:1)
var interval = 2000;
function autoMove(){
    //�˶������һ��֮���û����

    if(step == data.length ){ //4
        step = 0;
        utils.setCss(bannerImgWrap,'left',-step*1000); //˲��ͻ�ص���һ��ԭʼλ��,����Ӿ���û�б仯�ļ���
    }
    step++; //�ۼ�1֮���ֵ���Ҽ���Ҫ�˶������յ�
    window.zhufengAnimate(bannerImgWrap,{left: -step*1000},200);
    focusAlign();
}
timer =  window.setInterval(autoMove,interval); //ÿ��ִ��autoMove�����ֲ��������ö�ʱ�����intervalִ��һ�ξ��Զ��ֲ���

function focusAlign(){ //�������
    var tempStep = step == focusListLis.length ? 0 : step; //��step�������һ��СԲȦ��������ʱ�� ==> �ж�step�Ǽ����˶����ĸ�λ�á��������Ҫ�˶���������(��ʵ���Ǻ͵�һ����ͬ����һ��),��ô��Ӧ�Ľ���Ӧ���ǵ�һ�ţ���һ�ŵ�������0
    for(var i =0; i<focusListLis.length; i++){
        if(i === tempStep){
            focusListLis[i].className = 'bg';
        }else{
            focusListLis[i].className = '';
        }
    }
}

//�����ͣ���ֲ�ͼ�ϵ�ʱ��ֹͣ�Զ��ֲ�������뿪��ʱ���ֲ�����
banner.onmouseover = function (){
    window.clearInterval(timer);
    leftBtn.style.display = rightBtn.style.display = 'block'; //��껬����ʱ���������л���ť��ʾ
}
banner.onmouseout = function (){
    timer =  window.setInterval(autoMove,interval);
    leftBtn.style.display = rightBtn.style.display = 'none';
}

//������Ұ�ť��ʱ��Ҫ��Ӧ�л�

leftBtn.onclick = function (){
    if(step == 0){
        step = data.length;
        utils.setCss(bannerImgWrap,'left',-step*1000);
    }
    step--;
    window.zhufengAnimate(bannerImgWrap,{left: -step*1000},200);
    focusAlign();
}
rightBtn.onclick = autoMove; //���ҵ����Ч����ʵ���Զ��ֲ�����ͬ�ģ��Զ��ֲ����ö�ʱ�������ġ�����ֲ����õ���¼�������

//��������ʱ���л�����Ӧ�����ͼƬ
function bindEventForFocus(){
    for(var i=0; i<focusListLis.length; i++){
        var curFocus = focusListLis[i];
        curFocus.index = i;
        curFocus.onclick = function (){
            //�����ʱ��Ҫ�л�����Ӧ��ͼƬ==>�ӵ�ǰ��λ���˶�����Ӧ����������λ��,��ô���Ƕ�Ӧ���������������Ҫ�˶����յ�
            step = this.index; //stepһ��Ҫ�ó������¸�ֵ����Ϊstep��ȫ�ֵġ��Զ��ֲ��͵�����Ұ�ť�������л��ȶ��������step
            zhufengAnimate(bannerImgWrap,{left:-step*1000},200);
            focusAlign();
        }
    }
}
bindEventForFocus();

