$.ajax({
    "url":"tsconfig.json",
    "type": "POST",
    "data": "",
    async:false,
    success: function (data) {
        console.log(data)
        var typeArr = [];
        var numArr = [];
        var title_cont = "";
        for(var i = 0; i < data.length; i ++){

            typeArr.push(data[i].name);
            numArr.push(data[i].total);
            title_cont+=data[i].name+"   "+data[i].total+"个";
        }
        $("#total").html(title_cont)
        console.log(typeArr,numArr)
        demand(typeArr,numArr);
        categorySta(typeArr,numArr,"卫星类","zhuzhuangtu1");
        console.log(typeArr,numArr)
        urgency(typeArr,numArr,"yuanbingtu")
    }
});

//生成柱状图
function demand(typeArr,numArr){
    //二次重绘前清空图表
    var main = document.getElementById('zhuzhuangtu');
    var existInstance = echarts.getInstanceByDom(main);
    if(existInstance){
        if(true){
            echarts.dispose(existInstance);
        }
    }
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('zhuzhuangtu'));
    // 指定图表的配置项和数据
    var option = {
        title: {
            text: '目标数量',
            //subtext: '（点击目标数量可切换下面四个统计图！）'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid:{
            left:'3%',
            right:'4%',
            bottom: '3%',
            containLabel:true
        },
        xAxis: [
            {
                type: 'category',
                axisTick:{
                    alignWithLabel: true
                },
                data: typeArr
            }
        ],
        yAxis: [
            {
                type:'value'
            }
        ],
        series: [
            {
                name:'目标数量',
                type:'bar',
                barWidth:'60%',
                data:numArr,
                color:"#0f1427"
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);

}

//每一个大类下的柱状图方法
function categorySta(typeArr,numArr,textName,id){
    //二次重绘前清空图表
    var main = document.getElementById(id);
    var existInstance = echarts.getInstanceByDom(main);
    if(existInstance){
        if(true){
            echarts.dispose(existInstance);
        }
    }

    var myChart = echarts.init(document.getElementById(id));

    // 指定图表的配置项和数据
    var option = {
        title: {
            text: textName+'类别情况'

        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['数量'],
            x: 'right'
        },
        grid:{
            left:'3%',
            right:'4%',
            bottom: '3%',
            containLabel:true
        },
        color:['#74d4bd'],
        xAxis: [
            {
                type: 'value',
                boundaryGap: [0,0.0,1]
            }
        ],
        yAxis: {
            type: 'category',
            data: typeArr
        },
        series: [
/*            {
                name:'数量',
                type:'bar',

                itenStyle:{
                    normal:{
                        barVorderCloor:"red",
                        color:'red'
                    },
                    emphasis:{
                        barVorderCloor:"red",
                        color:'red'
                    }
                },
                data:numArr
            },*/
            {
                name:"数量",
                type:"bar",
                label:{
                    normal:{
                        show:true,
                       position:"inside"
                    }
                },
                data:numArr
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}

/**
 *绘制迫切程度图表 圆饼图
 **/
function urgency(typeArr,numArr,Id){
    //二次重绘前清空图表
    var main = document.getElementById(Id);
    var existInstance = echarts.getInstanceByDom(main);
    if(existInstance){
        if(true){
            echarts.dispose(existInstance);
        }
    }

    var myChart = echarts.init(document.getElementById(Id));

    // 指定图表的配置项和数据
    var option = {
        series: [
            {
                name:'迫切程度',
                type:'pie',
                radius: '70%',
                center: ['50%','50%'],
                label: {
                    normal: {
                        formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                        backgroundColor: '#eee',
                        borderColor: '#aaa',
                        borderWidth: 1,
                        borderRadius: 4,
                        rich: {
                            a: {
                                color: '#999',
                                lineHeight: 22,
                                align: 'center'
                            },
                            hr: {
                                borderColor: '#aaa',
                                width: '100%',
                                borderWidth: 0.5,
                                height: 0
                            },
                            b: {
                                fontSize: 16,
                                lineHeight: 33
                            },
                            per: {
                                color: '#eee',
                                backgroundColor: '#334455',
                                padding: [2, 4],
                                borderRadius: 2
                            }
                        }
                    }
                },
                data: [
                    {value:numArr[0],name:typeArr[0]},
                    {value:numArr[1],name:typeArr[1]},
                    {value:numArr[2],name:typeArr[2]},
                    {value:numArr[3],name:typeArr[3]},
                    {value:numArr[4],name:typeArr[4]},
                    {value:numArr[5],name:typeArr[5]},
                    {value:numArr[6],name:typeArr[6]},
                    {value:numArr[7],name:typeArr[7]}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0,0,0,0.5)'
                    }
                }

            }
        ],
        color: ['#73a0ae','#c3876f','#9dc5b3']
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);

}