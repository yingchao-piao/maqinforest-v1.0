/**
 * Created by hwt on 2017/6/6.
 */
/*$(document).on('scroll',function(){
    if($(document).scrollTop()>0){
        $('.ui.segments').css({'position':'fixed','background':'rgba(255,255,255,1)'});
        $('#logo').css({'position':'fixed'});
    }else{
        $('.ui.segments').css({'position':'relative'});
        $('#logo').css({'position':'absolute'});
    }
    if($(document).scrollTop()<$('#tongji').height()-$('.ui.segments').height()){
        $('#statisticnavbar').css({'position':'relative','top':''});
    }else{
        $('#statisticnavbar').css({'position':'fixed','top':$('.ui.segments').css('height')});
    }

});*/
$('#statisticresult .ui.secondary.pointing.menu')
    .on('click', '.item', function() {
        if(!$(this).hasClass('dropdown')) {
            $(this)
                .addClass('active')
                .siblings('.item')
                .removeClass('active');
        }
    });
$('.ui.link.six.cards .blue.card').click(function(){
    $('.ui.link.cards').hide();
    var xzcname = $(this).children().children('.header')[0].innerText;
    var imgsrc = $(this).children().children('img')[0].src;
    $('#statisticresult').show();
    $('#tongji .column:first h2.header').text(xzcname);
    $('#tongji .column:first img').attr('src',imgsrc);
    $('#fugaimianji').css({'width':$('#barEchart').width(),
        'height':$('#tongji .column:nth-child(2) .item').outerHeight()*2});

    var fugaimianjiEchart = echarts.init(document.getElementById('fugaimianji'));

    // 使用刚指定的配置项和数据显示图表。
    fugaimianjiEchart.setOption({
        title:{
            subtext: '森林覆盖面积:MHa',
            subtextStyle: {
                "fontSize": 13,
                "fontWeight": 'bolder',
                "color": "#ffffff"
            },
            x: 'right',
            y: 'top'
        },
        tooltip: {},
        xAxis: {
            data: [2001,2002,2003,2003,2004,2005,2008,2008,2008,2008,2009]
        },
        yAxis: {
            splitLine:{
                show:false
            }
        },
        series: [{
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20,20,20,20,46,56],
            barWidth:14,
            barMaxWidth:15,
            itemStyle:{
                normal:{
                    color:'#00cd66'
                }
            }
        }],
        textStyle:{
            color:'#fff'
        },
        grid:{
            x:5,
            y:0,
            x2:5,
            y2:20
        }
    });
    $.ajax({
        url:'/forestresources/statistics/t1/'+xzcname,
        type:'GET',
        dataType:'text',
        error:function(XMLHttpRequest,textStatus,errorThrown){
            alert('error message: '+errorThrown.toString());
        },
        success:function(res){
            function toFixed_1(aera_tudi){
                aera_tudi.forEach(function(value){
                    value.value=value.value.toFixed(1);
                    if(value.hasOwnProperty('children')){
                        toFixed_1(value['children']);
                    }
                });
            }
            var aera_tudi =JSON.parse(res);
            toFixed_1(aera_tudi);
            console.log(aera_tudi);
            var tudimianjiEchart=echarts.init(document.getElementById('tudimianjiecharts'));

            function colorMappingChange(value) {
                var levelOption = getLevelOption(value);
                chart.setOption({
                    series: [{
                        levels: levelOption
                    }]
                });
            }

            var formatUtil = echarts.format;

            function getLevelOption() {
                return [
                    {
                        itemStyle: {
                            normal: {
                                borderColor: '#777',
                                borderWidth: 0,
                                gapWidth: 1
                            }
                        },
                        upperLabel: {
                            normal: {
                                show: false
                            }
                        }
                    },
                    {
                        itemStyle: {
                            normal: {
                                borderColor: '#555',
                                borderWidth: 5,
                                gapWidth: 1
                            },
                            emphasis: {
                                borderColor: '#ddd'
                            }
                        }
                    },
                    {
                        colorSaturation: [0.35, 0.5],
                        itemStyle: {
                            normal: {
                                borderWidth: 5,
                                gapWidth: 1,
                                borderColorSaturation: 0.6
                            }
                        }
                    }
                ];
            }
            tudimianjiEchart.setOption({

                tooltip: {
                    formatter: function (info) {
                        var value = info.value;
                        var treePathInfo = info.treePathInfo;
                        var treePath = [];

                        for (var i = 1; i < treePathInfo.length; i++) {
                            treePath.push(treePathInfo[i].name);
                        }

                        return [
                            '<div class="tooltip-title">' + formatUtil.encodeHTML(treePath.join('/')) + '</div>',
                            '土地面积: ' + formatUtil.addCommas(value) + ' 公顷',
                        ].join('');
                    }
                },

                series: [
                    {
                        name:'各类土地面积',
                        type:'treemap',
                        visibleMin: 300,
                        label: {
                            show: true,
                            formatter: '{b}'
                        },
                        upperLabel: {
                            normal: {
                                show: true,
                                height: 30
                            }
                        },
                        itemStyle: {
                            normal: {
                                borderColor: '#fff'
                            }
                        },
                        levels: getLevelOption(),
                        data: aera_tudi
                    }
                ]
            });

            /*var dataObj=function(arr){
                var dataObj =[];
                arr.forEach(function(value){
                    dataObj.push(
                        {
                            value:value.value.toFixed(1),
                            name:value.name,
                            path:value.path,
                            itemStyle:{
                                normal:{
                                    label:{show:function(){
                                        if(value.value==0){
                                            return false;
                                        }
                                    }()},
                                    labelLine:{show:function(){
                                        if(value.value==0){
                                            return false;
                                        }
                                    }()}
                                }
                            }
                        }
                    )
                });
                return dataObj;
            };
            tudimianjiEchart.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                }/!*,
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data:['苗圃地','乔木林','国家特别规定灌木林地','宜林荒山荒地','疏林地','水域','未利用地','牧草地','耕地','建设用地']
                }*!/,
                series: [
                    {
                        name:'土地面积:公顷',
                        type:'pie',
                        selectedMode: 'single',
                        radius: [0, '30%'],

                        label: {
                            normal: {
                                position: 'inner'
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data:dataObj(aera_tudi)
                    },
                    {
                        name:'土地面积:公顷',
                        type:'pie',
                        radius: ['40%', '55%'],
                        data:dataObj(aera_tudi[0].children)
                            .concat(dataObj(aera_tudi[1].children))
                    },
                    {
                        name:'土地面积:公顷',
                        type:'pie',
                        radius:['65%','80%'],
                        data:dataObj(aera_tudi[0].children[0].children)
                            .concat(dataObj(aera_tudi[0].children[1].children))
                            .concat(dataObj(aera_tudi[0].children[2].children))
                            .concat(dataObj(aera_tudi[1].children[0].children))
                            .concat(dataObj(aera_tudi[1].children[1].children))
                            .concat(dataObj(aera_tudi[1].children[2].children))
                    }
                ]
            });*/
        }
    });

    $.ajax({
        url:'/forestresources/statistics/t2/'+xzcname,
        type:'GET',
        dataType:'text',
        error:function(XMLHttpRequest,textStatus,errorThrown){
            alert('error message: '+errorThrown.toString());
        },
        success:function(res){
            var senlinlinmu = JSON.parse(res);
            console.log(senlinlinmu);
            if(senlinlinmu.length===0){
                alert('senlinlinmu response is null');
            }else{
                function toFixed_1(arr){
                    arr.forEach(function(value){
                        value.aera=value.aera.toFixed(1);
                        value.stockvolume=value.stockvolume.toFixed(1);
                        if(value.hasOwnProperty('children')){
                            toFixed_1(value['children']);
                        }
                    });
                }
                toFixed_1(senlinlinmu);
                var senlinlinmumianjiEchart = echarts.init(document.getElementById('senlinlinmumianji'));
                var senlinlinmuxujiEchart = echarts.init(document.getElementById('senlinlinmuxuji'));
                senlinlinmumianjiEchart.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    series:[
                        {
                            name:'土地面积:公顷',
                            type:'pie',
                            radius:[0,'30%'],
                            label: {
                                normal: {
                                    position: 'inner'
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            data:[
                                {value:senlinlinmu[0].aera,name:'国有'}
                            ]
                        },
                        {
                            name:'土地面积:公顷',
                            type:'pie',
                            radius: ['40%', '55%'],
                            data:[
                                {value:senlinlinmu[0].children[1].aera,name:'疏林地',itemStyle:{
                                    normal:{
                                        label:{show:function(){
                                            if(senlinlinmu[0].children[1].aera==0){
                                                return false;
                                            }
                                        }()},
                                        labelLine:{show:function(){
                                            if(senlinlinmu[0].children[1].aera==0){
                                                return false;
                                            }
                                        }()}
                                    }
                                }},
                                {value:senlinlinmu[0].children[0].aera,name:'乔木林',itemStyle:{
                                    normal:{
                                        label:{show:function(){
                                            if(senlinlinmu[0].children[0].aera==0){
                                                return false;
                                            }
                                        }()},
                                        labelLine:{show:function(){
                                            if(senlinlinmu[0].children[0].aera==0){
                                                return false;
                                            }
                                        }()}
                                    }
                                }}
                            ]
                        }
                    ]
                });
                senlinlinmuxujiEchart.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    series:[
                        {
                            name:'活立木蓄积量:立方米',
                            type:'pie',
                            radius:[0,'30%'],
                            label: {
                                normal: {
                                    position: 'inner'
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            data:[
                                {value:senlinlinmu[0].stockvolume,name:'国有'}
                            ]
                        },
                        {
                            name:'活立木蓄积量:立方米',
                            type:'pie',
                            radius: ['40%', '55%'],
                            data:[
                                {value:senlinlinmu[0].children[1].stockvolume,name:'疏林地',itemStyle:{
                                    normal:{
                                        label:{show:function(){
                                            if(senlinlinmu[0].children[1].stockvolume==0){
                                                return false;
                                            }
                                        }()},
                                        labelLine:{show:function(){
                                            if(senlinlinmu[0].children[1].stockvolume==0){
                                                return false;
                                            }
                                        }()}
                                    }
                                }},
                                {value:senlinlinmu[0].children[0].stockvolume,name:'乔木林',itemStyle:{
                                    normal:{
                                        label:{show:function(){
                                            if(senlinlinmu[0].children[0].stockvolume==0){
                                                return false;
                                            }
                                        }()},
                                        labelLine:{show:function(){
                                            if(senlinlinmu[0].children[0].stockvolume==0){
                                                return false;
                                            }
                                        }()}
                                    }
                                }}
                            ]
                        }
                    ]
                });
            }

        }
    });
    $.ajax({
        url:'/forestresources/statistics/t3/'+xzcname,
        type:'GET',
        dataType:'text',
        error:function(XMLHttpRequest,textStatus,errorThrown){
            alert('error message: '+errorThrown.toString());
        },
        success:function(res){
            var response = JSON.parse(res);

            if(response.length===0){
                alert("linzhong response is null");
            }else{
                var linzhongmianjiEcharts = echarts.init(document.getElementById('linzhongmianji'));
                var linzhongxujiEcharts = echarts.init(document.getElementById('linzhongxuji'));
                function toFixed_1(arr){
                    arr.forEach(function(value){
                        value.aera=value.aera.toFixed(1);
                        value.stockvolume=value.stockvolume.toFixed(1);
                        if(value.hasOwnProperty('children')){
                            toFixed_1(value['children']);
                        }
                    });
                }
                toFixed_1(response);
                function to_value(arr,option){
                    var temp = arr;
                    temp.forEach(function(value){
                        value.value=value[option];
                        if(value.hasOwnProperty('children')){
                            to_value(value['children'],option);
                        }
                    });
                    return temp;
                }
                function colorMappingChange(value) {
                    var levelOption = getLevelOption(value);
                    chart.setOption({
                        series: [{
                            levels: levelOption
                        }]
                    });
                }

                var formatUtil = echarts.format;

                function getLevelOption() {
                    return [
                        {
                            itemStyle: {
                                normal: {
                                    borderColor: '#777',
                                    borderWidth: 0,
                                    gapWidth: 1
                                }
                            },
                            upperLabel: {
                                normal: {
                                    show: false
                                }
                            }
                        },
                        {
                            itemStyle: {
                                normal: {
                                    borderColor: '#555',
                                    borderWidth: 5,
                                    gapWidth: 1
                                },
                                emphasis: {
                                    borderColor: '#ddd'
                                }
                            }
                        },
                        {
                            colorSaturation: [0.35, 0.5],
                            itemStyle: {
                                normal: {
                                    borderWidth: 5,
                                    gapWidth: 1,
                                    borderColorSaturation: 0.6
                                }
                            }
                        }
                    ];
                }
                linzhongmianjiEcharts.setOption({

                    tooltip: {
                        formatter: function (info) {
                            var value = info.value;
                            var treePathInfo = info.treePathInfo;
                            var treePath = [];

                            for (var i = 1; i < treePathInfo.length; i++) {
                                treePath.push(treePathInfo[i].name);
                            }

                            return [
                                '<div class="tooltip-title">' + formatUtil.encodeHTML(treePath.join('/')) + '</div>',
                                '面积: ' + formatUtil.addCommas(value) + ' 公顷',
                            ].join('');
                        }
                    },

                    series: [
                        {
                            name:'林种面积',
                            type:'treemap',
                            visibleMin: 300,
                            label: {
                                show: true,
                                formatter: '{b}'
                            },
                            upperLabel: {
                                normal: {
                                    show: true,
                                    height: 30
                                }
                            },
                            itemStyle: {
                                normal: {
                                    borderColor: '#fff'
                                }
                            },
                            levels: getLevelOption(),
                            data: to_value(response,'aera')
                        }
                    ]
                });
                linzhongxujiEcharts.setOption({

                    tooltip: {
                        formatter: function (info) {
                            var value = info.value;
                            var treePathInfo = info.treePathInfo;
                            var treePath = [];

                            for (var i = 1; i < treePathInfo.length; i++) {
                                treePath.push(treePathInfo[i].name);
                            }

                            return [
                                '<div class="tooltip-title">' + formatUtil.encodeHTML(treePath.join('/')) + '</div>',
                                '活力木蓄积量: ' + formatUtil.addCommas(value) + ' 立方米',
                            ].join('');
                        }
                    },

                    series: [
                        {
                            name:'活力木蓄积量',
                            type:'treemap',
                            visibleMin: 300,
                            label: {
                                show: true,
                                formatter: '{b}'
                            },
                            upperLabel: {
                                normal: {
                                    show: true,
                                    height: 30
                                }
                            },
                            itemStyle: {
                                normal: {
                                    borderColor: '#fff'
                                }
                            },
                            levels: getLevelOption(),
                            data: to_value(response,'stockvolume')
                        }
                    ]
                });
            }
        }
    })
});