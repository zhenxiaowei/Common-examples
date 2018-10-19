/**
 * Created by Administrator on 2018/4/9.
 */
var Index = function () {
    $(".signOut").off("click").on("click", function () {
        if(del()){
            window.location.href='login.html';
        }
    });
    $(".zuzhijigou").off("click").on("click", function () {
            window.location.href='user.html';

    });
    $(".left_Content dt").off("click").on("click", function () {
        $(this).parent().find("dd").toggle();
        if($(this).parent().find("dd").is(":hidden")){
            $(this).find("i").addClass("inhoicon-icon-up");
            $(this).find("i").removeClass("inhoicon-icon-up1");
        }else{
            $(this).find("i").addClass("inhoicon-icon-up1");
            $(this).find("i").removeClass("inhoicon-icon-up");
        }
    });

    $(".contentTable").off("click").on("click", function () {
        $(".right_Content").eq(0).show();
        $(".right_Content").eq(1).hide();
    });
    $(".contentEcharts").off("click").on("click", function () {
        $(".right_Content").eq(1).show();
        $(".right_Content").eq(0).hide();
        var ary1=[120, 132, 101, 134, 90, 230, 210];
        var ary2=[220, 182, 191, 234, 290, 330, 310];
        var ary3=[150, 232, 201, 154, 190, 330, 410];
        var ary4=[320, 332, 301, 334, 390, 330, 320];
        var ary5=[820, 932, 901, 934, 1290, 1330, 1320];
        demand(ary1,ary2,ary3,ary4,ary5);
        var ary=[];
        for(var i=0;i<ary1.length;i++){
            if(i==0){
                ary.push(ary1[i],ary2[i],ary3[i],ary4[i],ary5[i]);
            }
        }
        categorySta(ary);

    });
    //生成柱状图
    var demand = function (ary1,ary2,ary3,ary4,ary5) {
        //二次重绘前清空图表
        var main = document.getElementById('zhuzhuangtu');
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('zhuzhuangtu'));
        // 指定图表的配置项和数据
        var option = {
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:['邮件营销','联盟广告','视频广告','直接访问','搜索引擎']
            },
/*            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },*/
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data : ['周一','周二','周三','周四','周五','周六','周日']
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    name:'邮件营销',
                    type:'line',
                    stack: '总量',
                    data:ary1
                },
                {
                    name:'联盟广告',
                    type:'line',
                    stack: '总量',
                    data:ary2
                },
                {
                    name:'视频广告',
                    type:'line',
                    stack: '总量',
                    data:ary3
                },
                {
                    name:'直接访问',
                    type:'line',
                    stack: '总量',
                    data:ary4
                },
                {
                    name:'搜索引擎',
                    type:'line',
                    stack: '总量',
                    data:ary5
                }
            ]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        myChart.on("click", function (params) {
          var index=params.dataIndex;
            var ary=[];
            for(var i=0;i<ary1.length;i++){
                if(i==index){
                    ary.push(ary1[i],ary2[i],ary3[i],ary4[i],ary5[i]);
                }
            }
            categorySta(ary);
        })
    };
    var categorySta = function (ary) {
        //二次重绘前清空图表
        var main = document.getElementById('yuanbingtu');
        var myChart = echarts.init(document.getElementById('yuanbingtu'));

        // 指定图表的配置项和数据
        var option = {
/*            title : {
                text: '某站点用户访问来源',
                subtext: '纯属虚构',
                x:'center'
            },*/
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient : 'vertical',
                x : 'left',
                data:['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
            },
/*            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {
                        show: true,
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '25%',
                                width: '50%',
                                funnelAlign: 'left',
                                max: 1548
                            }
                        }
                    },
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },*/
            calculable : false,
            series : [
                {
                    name:'访问来源',
                    type:'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data:[
                        {value:ary[0], name:'直接访问'},
                        {value:ary[1], name:'邮件营销'},
                        {value:ary[2], name:'联盟广告'},
                        {value:ary[3], name:'视频广告'},
                        {value:ary[4], name:'搜索引擎'}
                    ]
                }
            ]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    };
    var del=function(){
        var msg="你真的确认要退出吗？\n\n请确认！";
        if(confirm(msg)==true){
            return true;
        }else{
            return false;
        }
    };
    return {
        init: function () {

        }
    }

}();
$(document).ready(function () {
    Index.init();
});