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
        success:function(res) {
                // function toFixed_1(area_tudi){
                //     area_tudi.forEach(function(value){
                //         if(value.hasOwnProperty('children')){
                //             toFixed_1(value['children']);
                //         }
                //     });
                // }
                // var area_tudi =JSON.parse(res);
                // toFixed_1(area_tudi);
                // console.log(area_tudi);

                var width = 720,
                    height = 650,
                    radius = 310;

                var x = d3.scale.linear()
                    .range([0, 2 * Math.PI]);

                var y = d3.scale.linear()
                    .range([0, radius]);

                var color = d3.scale.category20c();

                var svg = d3.select("#tudimianjiecharts").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

                var partition = d3.layout.partition()
                    .value(function (d) {
                        return d.size;
                    });

                var arc = d3.svg.arc()
                    .startAngle(function (d) {
                        return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                    })
                    .endAngle(function (d) {
                        return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
                    })
                    .innerRadius(function (d) {
                        return Math.max(0, y(d.y));
                    })
                    .outerRadius(function (d) {
                        return Math.max(0, y(d.y + d.dy));
                    });

                d3.json('/forestresources/statistics/t1/'+xzcname, function (error, root) {
                    //if (root.code === 200) {
                    console.log(JSON.stringify(root));
                        var g = svg.selectAll("g")
                            .data(partition.nodes(root))
                            .enter().append("g");

                        var path = g.append("path")
                            .attr("d", arc)
                            .style("fill", function (d) {
                                return color((d.children ? d : d.parent).name);
                            })
                            .on("click", click);

                        var text = g.append("text")
                            .attr("transform", function (d) {
                                return "rotate(" + computeTextRotation(d) + ")";
                            })
                            .attr("x", function (d) {
                                return y(d.y);
                            })
                            .attr("dx", "6") // margin
                            .attr("dy", ".35em") // vertical-align
                            .text(function (d) {
                                return d.name;
                            });

                        function click(d) {
                            // fade out all text elements
                            text.transition().attr("opacity", 0);

                            path.transition()
                                .duration(750)
                                .attrTween("d", arcTween(d))
                                .each("end", function(e, i) {
                                    // check if the animated element's data e lies within the visible angle span given in d
                                    if (e.x >= d.x && e.x < (d.x + d.dx)) {
                                        // get a selection of the associated text element
                                        var arcText = d3.select(this.parentNode).select("text");
                                        // fade in the text element and recalculate positions
                                        arcText.transition().duration(750)
                                            .attr("opacity", 1)
                                            .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
                                            .attr("x", function(d) { return y(d.y); });
                                    }
                                });
                        }
                });

                d3.select(self.frameElement).style("height", height + "px");


                // Interpolate the scales!
                function arcTween(d) {
                    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                        yd = d3.interpolate(y.domain(), [d.y, 1]),
                        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
                    return function (d, i) {
                        return i
                            ? function (t) {
                                return arc(d);
                            }
                            : function (t) {
                                x.domain(xd(t));
                                y.domain(yd(t)).range(yr(t));
                                return arc(d);
                            };
                    };
                }

                function computeTextRotation(d) {
                    return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
                }
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