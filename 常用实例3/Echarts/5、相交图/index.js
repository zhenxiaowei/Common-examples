urgency()
function urgency(){

    var myChart = echarts.init(document.getElementById('yuanbingtu'));

    // 指定图表的配置项和数据
    var option = {
        title : {
            text: '杨光 vs 王磊',
            subtext: '各个数据的集合'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{b}: {c}"
        },
/*        toolbox: {
            show : true,
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },*/
        calculable : false,
        series : [
            {
                name:'韦恩图',
                type:'venn',
                itemStyle: {
                    normal: {
                        label: {
                            show: true,
                            textStyle: {
                                fontFamily: 'Arial, Verdana, sans-serif',
                                fontSize: 16,
                                fontStyle: 'italic',
                                fontWeight: 'bolder'
                            }
                        },
                        labelLine: {
                            show: false,
                            length: 10,
                            lineStyle: {
                                // color: 各异,
                                width: 1,
                                type: 'solid'
                            }
                        }
                    },
                    emphasis: {
                        color: '#cc99cc',
                        borderWidth: 3,
                        borderColor: '#996699'
                    }
                },
                data:[
                    {value:138, name:'杨光'},
                    {value:5, name:'王磊'},
                    {value:3, name:'公共'}
                ]
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);

}


