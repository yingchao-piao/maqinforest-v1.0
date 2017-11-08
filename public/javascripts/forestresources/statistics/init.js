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
    //各类土地面积t1
    $.ajax({
        url:'/forestresources/statistics/t1/'+xzcname,
        type:'GET',
        dataType:'text',
        error:function(XMLHttpRequest,textStatus,errorThrown){
            alert('error message: '+errorThrown.toString());
        },
        success:function(res) {

                // Dimensions of sunburst.
                var width = 500;
                var height = 500;
                var radius = Math.min(width, height) / 2;

                // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                var b = {
                    w: 75, h: 30, s: 3, t: 10
                };

                // Mapping of names to colors.
                var colors = {
                    "国有林地": "#5687d1",
                    "非国有林地": "#7b615c",
                    "非林地": "#ded3c2",
                    "重点公益林地": "#b95b36",
                    "一般公益林地": "#a173d1",
                    "其他": "#bbb42f",
                    "乔木林": "#18bb41",
                    "疏林地": "#bb904c",
                    "苗圃地": "#8dbb7f",
                    "国家特别规定灌木林地": "#6cbba8",
                    "宜林荒山荒地": "#bb992e",
                    "水域": "#0b2bbb",
                    "牧草地": "#42bb69",
                    "未利用地": "#bb7037",
                    "耕地": "#bb59ae",
                    "建设用地": "#4b4b4b",

                };

                // Total size of all segments; we set this later, after loading the data.
                var totalSize = 0;

                var svg = d3.select("#tudimianji_chart").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

                var partition = d3.layout.partition()
                    .size([2 * Math.PI, radius * radius])
                    .value(function(d) { return d.size; });

                var arc = d3.svg.arc()
                    .startAngle(function(d) { return d.x; })
                    .endAngle(function(d) { return d.x + d.dx; })
                    .innerRadius(function(d) { return Math.sqrt(d.y); })
                    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

                d3.json('/forestresources/statistics/t1/'+xzcname, function (error, root) {
                    console.log(JSON.stringify(root));
                    // Basic setup of page elements.
                    initializeBreadcrumbTrail();
                    drawLegend();
                    d3.select("#tudimianji_togglelegend").on("click", toggleLegend);

                    //Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    svg.append("svg:circle")
                        .attr("r", radius)
                        .style("opacity", 0);


                    var nodes = partition.nodes(root)
                        .filter(function (d) {
                            return (d.dx > 0);
                        });

                    var path = svg.data([root]).selectAll("path")
                        .data(nodes)
                        .enter().append("svg:path")
                        .attr("display", function (d) {
                            return d.depth ? null : "none";
                        })
                        .attr("d", arc)
                        .attr("fill-rule", "evenodd")
                        .style("fill", function (d) {
                            return colors[d.name];
                        })
                        .style("opacity", 1)
                        .on("mouseover", mouseover);

                    // Add the mouseleave handler to the bounding circle.
                    d3.select("#tudimianji_container").on("mouseleave", mouseleave);
                    // Get total size of the tree = value of root node from partition.
                    totalSize = path.node().__data__.value;
                    // Fade all but the current sequence, and show it in the breadcrumb trail.
                    function mouseover(d) {

                        var percentage = (100 * d.value / totalSize).toPrecision(3);
                        var percentageString = percentage + "%";
                        if (percentage < 0.1) {
                            percentageString = "< 0.1%";
                        }

                        d3.select("#tudimianji_percentage")
                            .text(percentageString);

                        d3.select("#tudimianji_explanation")
                            .style("visibility", "");

                        var sequenceArray = getAncestors(d);
                        updateBreadcrumbs(sequenceArray, percentageString);

                        // Fade all the segments.
                        d3.selectAll("path")
                            .style("opacity", 0.3);

                        // Then highlight only those that are an ancestor of the current segment.
                        svg.selectAll("path")
                            .filter(function(node) {
                                return (sequenceArray.indexOf(node) >= 0);
                            })
                            .style("opacity", 1);
                    }

                    // Restore everything to full opacity when moving off the visualization.
                    function mouseleave(d) {

                        // Hide the breadcrumb trail
                        d3.select("#tudimianji_trail")
                            .style("visibility", "hidden");

                        // Deactivate all segments during transition.
                        d3.selectAll("path").on("mouseover", null);

                        // Transition each segment to full opacity and then reactivate it.
                        d3.selectAll("path")
                            .transition()
                            .duration(1000)
                            .style("opacity", 1)
                            .each("end", function() {
                                d3.select(this).on("mouseover", mouseover);
                            });

                        d3.select("#tudimianji_explanation")
                            .style("visibility", "hidden");
                    }

                    // Given a node in a partition layout, return an array of all of its ancestor
                    // nodes, highest first, but excluding the root.
                    function getAncestors(node) {
                        var path = [];
                        var current = node;
                        while (current.parent) {
                            path.unshift(current);
                            current = current.parent;
                        }
                        return path;
                    }
                    function initializeBreadcrumbTrail() {
                        // Add the svg area.
                        var trail = d3.select("#tudimianji_sequence").append("svg:svg")
                            .attr("width", width)
                            .attr("height", 50)
                            .attr("id", "trail");
                        // Add the label at the end, for the percentage.
                        trail.append("svg:text")
                            .attr("id", "endlabel")
                            .style("fill", "#000");
                    }

                    // Generate a string that describes the points of a breadcrumb polygon.
                    function breadcrumbPoints(d, i) {
                        var points = [];
                        points.push("0,0");
                        points.push(b.w + ",0");
                        points.push(b.w + b.t + "," + (b.h / 2));
                        points.push(b.w + "," + b.h);
                        points.push("0," + b.h);
                        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                            points.push(b.t + "," + (b.h / 2));
                        }
                        return points.join(" ");
                    }

                    // Update the breadcrumb trail to show the current sequence and percentage.
                    function updateBreadcrumbs(nodeArray, percentageString) {

                        // Data join; key function combines name and depth (= position in sequence).
                        var g = d3.select("#trail")
                            .selectAll("g")
                            .data(nodeArray, function(d) { return d.name + d.depth; });

                        // Add breadcrumb and label for entering nodes.
                        var entering = g.enter().append("svg:g");

                        entering.append("svg:polygon")
                            .attr("points", breadcrumbPoints)
                            .style("fill", function(d) { return colors[d.name]; });

                        entering.append("svg:text")
                            .attr("x", (b.w + b.t) / 2)
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function(d) { return d.name; });

                        // Set position for entering and updating nodes.
                        g.attr("transform", function(d, i) {
                            return "translate(" + i * (b.w + b.s) + ", 0)";
                        });

                        // Remove exiting nodes.
                        g.exit().remove();

                        // Now move and update the percentage at the end.
                        d3.select("#trail").select("#endlabel")
                            .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(percentageString);

                        // Make the breadcrumb trail visible, if it's hidden.
                        d3.select("#trail")
                            .style("visibility", "");

                    }

                    function drawLegend() {

                        // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                        var li = {
                            w: 160, h: 30, s: 3, r: 3
                        };

                        var legend = d3.select("#tudimianji_legend").append("svg:svg")
                            .attr("width", li.w)
                            .attr("height", d3.keys(colors).length * (li.h + li.s));

                        var g = legend.selectAll("g")
                            .data(d3.entries(colors))
                            .enter().append("svg:g")
                            .attr("transform", function(d, i) {
                                return "translate(0," + i * (li.h + li.s) + ")";
                            });

                        g.append("svg:rect")
                            .attr("rx", li.r)
                            .attr("ry", li.r)
                            .attr("width", li.w)
                            .attr("height", li.h)
                            .style("fill", function(d) { return d.value; });

                        g.append("svg:text")
                            .attr("x", li.w / 2)
                            .attr("y", li.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function(d) { return d.key; });
                    }

                    function toggleLegend() {
                        var legend = d3.select("#tudimianji_legend");
                        if (legend.style("visibility") == "hidden") {
                            legend.style("visibility", "");
                        } else {
                            legend.style("visibility", "hidden");
                        }
                    }



                });
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