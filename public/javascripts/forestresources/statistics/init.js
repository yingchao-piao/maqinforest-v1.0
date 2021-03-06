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

$('.ui.link.six.cards .blue.card').click(function() {
    $('.ui.link.cards').hide();
    var xzcname = $(this).children().children('.header')[0].innerText;
    var imgsrc = $(this).children().children('img')[0].src;
    $('#statisticresult').show();
    $('#tongji .column:first h2.header').text(xzcname);
    $('#tongji .column:first img').attr('src', imgsrc);
/*
    $('#fugaimianji').css({
        'width': $('#barEchart').width(),
        'height': $('#tongji .column:nth-child(2) .item').outerHeight() * 2
    });

    var fugaimianjiEchart = echarts.init(document.getElementById('fugaimianji'));
*/

    // 使用刚指定的配置项和数据显示图表。
/*    fugaimianjiEchart.setOption({
        title: {
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
            data: [2001, 2002, 2003, 2003, 2004, 2005, 2008, 2008, 2008, 2008, 2009]
        },
        yAxis: {
            splitLine: {
                show: false
            }
        },
        series: [{
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20, 20, 20, 20, 46, 56],
            barWidth: 14,
            barMaxWidth: 15,
            itemStyle: {
                normal: {
                    color: '#00cd66'
                }
            }
        }],
        textStyle: {
            color: '#fff'
        },
        grid: {
            x: 5,
            y: 0,
            x2: 5,
            y2: 20
        }
    });*/



    //各类土地面积t1
    $.ajax({
        url: '/forestresources/statistics/t1/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {

            // Dimensions of sunburst.
            var width = 500;
            var height = 500;
            var radius = Math.min(width, height) / 2;

            // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
            var b = {
                w: 75, h: 30, s: 3, t: 10
            };

            // Total size of all segments; we set this later, after loading the data.
            var totalSize = 0;

            var svg = d3.select("#tudimianji_chart").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("id", "tudimianji_container")
                .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");



            var arc = d3.svg.arc()
                .startAngle(function (d) {
                    return d.x;
                })
                .endAngle(function (d) {
                    return d.x + d.dx;
                })
                .innerRadius(function (d) {
                    return Math.sqrt(d.y);
                })
                .outerRadius(function (d) {
                    return Math.sqrt(d.y + d.dy);
                });

            d3.json('/forestresources/statistics/t1/' + xzcname, function (error, root) {
                //console.log(JSON.stringify(root));
                // Basic setup of page elements.
                var area_sum = 0;
                for (var i = 0; i < root.length; i++) {
                    area_sum = area_sum + root[i].area;
                }

                var tudimianji = {
                    "name": "林地面积统计",
                    "children": root
                }

                //下载t1数据到excel表
                $(document).ready(function(){
                    $('#tudimianji_download').click(function(){
                        var option={};

                        option.fileName = xzcname + "_" + tudimianji.name;

                        var ld_qs=[];
                        var sen_lin_lb=[];
                        var dilei=[];

                        var i=0;

                        while(i<tudimianji.children.length){
                            if(tudimianji.children[i].area==0){
                                i++;
                                continue;
                            }else{
                                ld_qs.push({
                                    name:tudimianji.children[i].name,
                                    value:tudimianji.children[i].area.toFixed(2)

                                });
                            }
                            if(tudimianji.children[i].hasOwnProperty('children')) {
                                for (var j = 0; j < tudimianji.children[i].children.length; j++) {
                                    if(tudimianji.children[i].children[j].area==0){
                                        continue;
                                    }else{
                                        sen_lin_lb.push({
                                            name: tudimianji.children[i].name+"/"+tudimianji.children[i].children[j].name,
                                            value: tudimianji.children[i].children[j].area.toFixed(2)
                                        });
                                    }
                                    if (tudimianji.children[i].children[j].hasOwnProperty('children')) {
                                        for (var k = 0; k < tudimianji.children[i].children[j].children.length; k++) {
                                            if(tudimianji.children[i].children[j].children[k].area==0){
                                                continue;
                                            }else{
                                                dilei.push({
                                                    name: tudimianji.children[i].name+"/"+tudimianji.children[i].children[j].name + "/" + tudimianji.children[i].children[j].children[k].name,
                                                    value: tudimianji.children[i].children[j].children[k].area.toFixed(2)

                                                });
                                            }
                                        }
                                    }
                                }
                            };
                            i++;
                        }

                        option.datas=[
                            {
                                sheetData:ld_qs,
                                sheetName:'林地权属',
                                sheetFilter:['name','value'],
                                sheetHeader:['林地权属','面积/公顷']
                            },
                            {
                                sheetData:sen_lin_lb,
                                sheetName:'森林类别',
                                sheetFilter:['name','value'],
                                sheetHeader:['森林类别','面积/公顷']
                            },
                            {
                                sheetData:dilei,
                                sheetName:'地类',
                                sheetFilter:['name','value'],
                                sheetHeader:['地类','面积/公顷']
                            }


                        ];
                        var toExcel=new ExportJsonExcel(option);
                        toExcel.saveExcel();
                    });
                });



                //Bounding circle underneath the sunburst, to make it easier to detect
                // when the mouse leaves the parent g.
                svg.append("svg:circle")
                    .attr("r", radius)
                    .style("opacity", 0);

                var partition = d3.layout.partition()
                    .size([2 * Math.PI, radius * radius])
                    .value(function (d) {
                        return d.area;
                    });
                var nodes = partition.nodes(tudimianji)
                    .filter(function (d) {
                        return (d.dx > 0);
                    })
                    .sort(function(a, b) { return a.depth- b.depth;});


                // Mapping of names to colors.

                var colors = d3.scale.category20c();

                var path = svg.data([tudimianji]).selectAll("path")
                    .data(nodes)
                    .enter().append("svg:path")
                    .attr("display", function (d) {
                        return d.depth ? null : "none";
                    })
                    .attr("d", arc)
                    .attr("fill-rule", "evenodd")
                    .style("fill", function (d) {
                        return colors(d.name);
                    })
                    .style("opacity", 1)
                    .on("mouseover", mouseover);


                initializeBreadcrumbTrail();
                drawLegend();
                d3.select("#tudimianji_togglelegend").on("click", toggleLegend);

                d3.select("#tudimianji_percentage")
                    .text("总面积" + area_sum.toFixed(2) + "公顷");
                d3.select("#tudimainji_explanation")
                    .style("visibility", "");

                // Add the mouseleave handler to the bounding circle.
                d3.select("#tudimianji_container").on("mouseleave", mouseleave);
                // Get total size of the tree = value of root node from partition.
                totalSize = path.node().__data__.value;

                // Fade all but the current sequence, and show it in the breadcrumb trail.
                function mouseover(d) {
                    var percentage = (100 * d.value / totalSize).toPrecision(4);
                    var percentageString = percentage + "%";


                    d3.select("#tudimianji_percentage")
                        .text(d.value.toFixed(2) + "公顷\n" + percentageString);

                    d3.select("#tudimianji_explanation")
                        .style("visibility", "");

                    var sequenceArray = getAncestors(d);
                    updateBreadcrumbs(sequenceArray, percentageString);

                    // Fade all the segments.
                    d3.select("#tudimianji_container").selectAll("path")
                        .style("opacity", 0.3);

                    // Then highlight only those that are an ancestor of the current segment.
                    svg.selectAll("path")
                        .filter(function (node) {
                            return (sequenceArray.indexOf(node) >= 0);
                        })
                        .style("opacity", 1);
                }

                // Restore everything to full opacity when moving off the visualization.
                function mouseleave(d) {


                    // Hide the breadcrumb trail
                    d3.select("#tudimianji_BreadcrumbTrail")
                        .style("visibility", "hidden");

                    // Deactivate all segments during transition.
                    d3.select("#tudimianji_container").selectAll("path").on("mouseover", null);

                    // Transition each segment to full opacity and then reactivate it.
                    d3.select("#tudimianji_container").selectAll("path")
                        .transition()
                        .duration(1000)
                        .style("opacity", 1)
                        .each("end", function () {
                            d3.select(this).on("mouseover", mouseover);
                        });

                    d3.select("#tudimianji_percentage")
                        .text("总面积\n" + area_sum.toFixed(2) + "公顷");
                    d3.select("#tudimainji_explanation")
                        .style("visibility", "");
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
                    var tudimianji_BreadcrumbTrail = d3.select("#tudimianji_sequence").append("svg:svg")
                        .attr("width", width * 2)
                        .attr("height", 50)
                        .attr("id", "tudimianji_BreadcrumbTrail");
                    // Add the label at the end, for the percentage.
                    tudimianji_BreadcrumbTrail.append("svg:text")
                        .attr("id", "endlabel")
                        .style("fill", "#000");
                }

                // Generate a string that describes the points of a breadcrumb polygon.
                function breadcrumbPoints(d, i) {
                    var points = [];
                    points.push("0,0");
                    points.push(b.w * 2 + ",0");
                    points.push(b.w * 2 + b.t + "," + (b.h / 2));
                    points.push(b.w * 2 + "," + b.h);
                    points.push("0," + b.h);
                    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                        points.push(b.t + "," + (b.h / 2));
                    }
                    return points.join(" ");
                }

                // Update the breadcrumb trail to show the current sequence and percentage.
                function updateBreadcrumbs(nodeArray, percentageString) {

                    // Data join; key function combines name and depth (= position in sequence).
                    var g = d3.select("#tudimianji_BreadcrumbTrail")
                        .selectAll("g")
                        .data(nodeArray, function (d) {
                            return d.name + d.depth;
                        });

                    // Add breadcrumb and label for entering nodes.
                    var entering = g.enter().append("svg:g");

                    entering.append("svg:polygon")
                        .attr("points", breadcrumbPoints)
                        .style("fill", function (d) {
                            return colors(d.name);
                        });

                    entering.append("svg:text")
                        .attr("x", (b.w * 2 + b.t) / 2)
                        .attr("y", b.h / 2)
                        .attr("dy", "0.35em")
                        .attr("text-anchor", "middle")
                        .text(function (d) {
                            return d.name;
                        });

                    // Set position for entering and updating nodes.
                    g.attr("transform", function (d, i) {
                        return "translate(" + i * (b.w * 2 + b.s) + ", 0)";
                    });

                    // Remove exiting nodes.
                    g.exit().remove();

                    // Now move and update the percentage at the end.
                    d3.select("#tudimianji_BreadcrumbTrail").select("#endlabel")
                        .attr("x", (nodeArray.length + 0.5) * (b.w + b.s) * 2)
                        .attr("y", b.h / 2)
                        .attr("dy", "0.35em")
                        .attr("text-anchor", "middle")
                        .text(percentageString);

                    // Make the breadcrumb trail visible, if it's hidden.
                    d3.select("#tudimianji_BreadcrumbTrail")
                        .style("visibility", "");

                }

                function drawLegend() {

                    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                    var li = {
                        w: 160, h: 30, s: 3, r: 3
                    };
                    var data_name=[];

                    for(var i=1;i<nodes.length;i++){
                        var j=0;
                        while(j<data_name.length){
                            if(nodes[i].name==data_name[j].name){
                                break;
                            }
                            j++;
                        }
                        if(j==data_name.length){
                            data_name.push({
                                name:nodes[i].name,
                                area:nodes[i].area
                            })
                        }
                    };
                    var legend = d3.select("#tudimianji_legend").append("svg:svg")
                        .attr("width", li.w)
                        .attr("height", data_name.length * (li.h + li.s));



                    var g = legend.selectAll("g")
                        .data(data_name)
                        .enter().append("svg:g")
                        .attr("class","legend")
                        .attr("transform", function (d, i) {
                            return "translate(0," + i * (li.h + li.s) + ")";
                        })


                    g.append("svg:rect")
                        .attr("rx", li.r)
                        .attr("ry", li.r)
                        .attr("width", li.w)
                        .attr("height", li.h)
                        .style("fill", function (d) {
                            return d.area==0?'black': colors(d.name)
                        })
                        .on("mouseover", function () {
                            d3.select(this)
                                .style("opacity", 0.5);

                        })
                        .on("mouseout", function () {
                            d3.select(this)
                                .transition()
                                .duration(100)
                                .style("opacity", 1);
                        })
                    ;

                    g.append("svg:text")
                        .attr("x", li.w / 2)
                        .attr("y", li.h / 2)
                        .attr("dy", "0.35em")
                        .attr("text-anchor", "middle")
                        .text(function (d) {
                            return d.name;
                        });

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

    //林木面积蓄积t2
    $.ajax({
        url: '/forestresources/statistics/t2/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {

            var senlinlinmu = JSON.parse(res);

            if (senlinlinmu.length == 0) {//某些县没有林地面积统计数据
                document.getElementById("senlinlinmu_nodata").style.visibility = "visible";
                document.getElementById("senlinlinmu_data").style.display = "none";
                document.getElementById("senlinlinmu_download").style.display = "none";
            } else {
                function toFixed_2(arr) {
                    arr.forEach(function (value) {
                        value.area = value.area.toFixed(2);
                        value.stockvolume = value.stockvolume.toFixed(2);
                        if (value.hasOwnProperty('children')) {
                            toFixed_2(value['children']);
                        }
                    });
                };

                toFixed_2(senlinlinmu);

                //下载t2数据到excel表
                $(document).ready(function(){
                    $('#senlinlinmu_download').click(function(){
                        var option={};

                        option.fileName = xzcname + "_" + "森林林木面积蓄积统计";

                        var data=[];
                        data.push({
                            name:senlinlinmu[0].name,
                            area:senlinlinmu[0].area,
                            stockvolume:senlinlinmu[0].stockvolume
                        });

                        var i=0;

                        while(i<senlinlinmu[0].children.length){
                            if(senlinlinmu[0].children[i].area==0){
                                i++;
                                continue;
                            }else{
                                data.push({
                                    name:senlinlinmu[0].name+'/'+senlinlinmu[0].children[i].name,
                                    area:senlinlinmu[0].children[i].area,
                                    stockvolume:senlinlinmu[0].children[i].stockvolume

                                });
                            }
                            i++;
                        }

                        option.datas=[
                            {
                                sheetData:data,
                                sheetName:'森林林木面积蓄积量',
                                sheetFilter:['name','area','stockvolume'],
                                sheetHeader:['林木类别','面积/公顷','活立木蓄积量/立方米']
                            }
                        ];
                        var toExcel=new ExportJsonExcel(option);
                        toExcel.saveExcel();
                    });
                });
                var senlinlinmumianjiEchart = echarts.init(document.getElementById('senlinlinmumianji'));
                var senlinlinmuxujiEchart = echarts.init(document.getElementById('senlinlinmuxuji'));
                senlinlinmumianjiEchart.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    color: ['#9E1E18', '#44615E', '#948B53'],
                    series: [
                        {
                            name: '林地面积:公顷',
                            type: 'pie',
                            radius: [0, '30%'],

                            label: {
                                normal: {
                                    position: "center",
                                    formatter: "{b}:\n{c}公顷",
                                    textStyle: {
                                        color: "#FFF",
                                        fontWeight: 'bold',
                                        fontSize: 15
                                    }
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            data: [
                                {value: senlinlinmu[0].area, name: '总面积'},

                            ]
                        },
                        {
                            name: '林地面积:公顷',
                            type: 'pie',
                            radius: ['40%', '55%'],
                            data: [
                                {
                                    value: senlinlinmu[0].children[1].area, name: '疏林地', itemStyle: {
                                    normal: {
                                        label: {
                                            show: function () {
                                                if (senlinlinmu[0].children[1].area == 0) {
                                                    return false;
                                                }
                                            }(),
                                            textStyle: {
                                                fontWeight: 'normal',
                                                fontSize: 14
                                            }
                                        },
                                        labelLine: {
                                            show: function () {
                                                if (senlinlinmu[0].children[1].area == 0) {
                                                    return false;
                                                }
                                            }()
                                        }
                                    }
                                }
                                },
                                {
                                    value: senlinlinmu[0].children[0].area, name: '乔木林', itemStyle: {
                                    normal: {
                                        label: {
                                            show: function () {
                                                if (senlinlinmu[0].children[0].area == 0) {
                                                    return false;
                                                }
                                            }(),
                                            textStyle: {
                                                fontWeight: 'normal',
                                                fontSize: 14
                                            }
                                        },
                                        labelLine: {
                                            show: function () {
                                                if (senlinlinmu[0].children[0].area == 0) {
                                                    return false;
                                                }
                                            }()
                                        }
                                    }
                                }
                                }
                            ]
                        }
                    ]
                });
                senlinlinmuxujiEchart.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    color: ['#9E1E18', '#44615E', '#948B53'],
                    series: [
                        {
                            name: '活立木蓄积量:立方米',
                            type: 'pie',
                            radius: [0, '30%'],
                            label: {
                                normal: {
                                    position: "center",
                                    formatter: "{b}:\n{c}立方米",
                                    textStyle: {
                                        color: "#FFF",
                                        fontWeight: 'bold',
                                        fontSize: 15
                                    }
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            data: [
                                {value: senlinlinmu[0].stockvolume, name: '总活立木蓄积量'}
                            ]
                        },
                        {
                            name: '活立木蓄积量:立方米',
                            type: 'pie',
                            radius: ['40%', '55%'],
                            data: [
                                {
                                    value: senlinlinmu[0].children[1].stockvolume, name: '疏林地', itemStyle: {
                                    normal: {
                                        label: {
                                            show: function () {
                                                if (senlinlinmu[0].children[1].stockvolume == 0) {
                                                    return false;
                                                }
                                            }(),
                                            textStyle: {
                                                fontWeight: 'normal',
                                                fontSize: 14
                                            }
                                        },
                                        labelLine: {
                                            show: function () {
                                                if (senlinlinmu[0].children[1].stockvolume == 0) {
                                                    return false;
                                                }
                                            }()
                                        }
                                    }
                                }
                                },
                                {
                                    value: senlinlinmu[0].children[0].stockvolume, name: '乔木林', itemStyle: {
                                    normal: {
                                        label: {
                                            show: function () {
                                                if (senlinlinmu[0].children[0].stockvolume == 0) {
                                                    return false;
                                                }
                                            }(),
                                            textStyle: {
                                                fontWeight: 'normal',
                                                fontSize: 14
                                            }
                                        },
                                        labelLine: {
                                            show: function () {
                                                if (senlinlinmu[0].children[0].stockvolume == 0) {
                                                    return false;
                                                }
                                            }()
                                        }
                                    }
                                }
                                }
                            ]
                        }
                    ]
                });
            }

        }
    });

    //林种统计t3
    $.ajax({
        url: '/forestresources/statistics/t3/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {

            var linzhongdata = JSON.parse(res);

            var area_sum = 0;
            for (var i = 0; i < linzhongdata.length; i++) {
                area_sum = area_sum + linzhongdata[i].area;
            }
            ;

            var stock_sum = 0;
            for (var i = 0; i < linzhongdata.length; i++) {
                stock_sum = stock_sum + linzhongdata[i].stockvolume;
            }
            ;

            if (area_sum == 0) {//没有林种面积统计数据
                document.getElementById("linzhongmianji_nodata").style.visibility = "visible";
                document.getElementById("linzhongmianji_data").style.display = "none";
                document.getElementById("linzhongmianji_download").style.visibility = "hidden";
                document.getElementById("linzhongxuji_nodata").style.visibility = "visible";
                document.getElementById("linzhongxuji_data").style.display = "none";
                document.getElementById("linzhongxuji_download").style.visibility = "hidden";

            } else {
                //林种面积统计
                d3.json('/forestresources/statistics/t3/' + xzcname, function (error, root) {

                    var linzhongmianji = {
                        "name": "林种面积统计",
                        "children": root
                    }
                    //console.log(linzhongmianji)


                    //下载t3_1数据到excel表
                    $(document).ready(function(){
                        $('#linzhongmianji_download').click(function(){
                            var option={};

                            option.fileName = xzcname + "_" + linzhongmianji.name;

                            var linzhong=[];
                            var dilei=[];
                            var linzu=[];

                            var i=0;

                            while(i<linzhongmianji.children.length){
                                if(linzhongmianji.children[i].area==0){
                                    i++;
                                    continue;
                                }else{
                                    linzhong.push({
                                        name:linzhongmianji.children[i].name,
                                        value:linzhongmianji.children[i].area.toFixed(2)

                                    });
                                }
                                if(linzhongmianji.children[i].hasOwnProperty('children')) {
                                    for (var j = 0; j < linzhongmianji.children[i].children.length; j++) {
                                        if(linzhongmianji.children[i].children[j].area==0){
                                            continue;
                                        }else{
                                            dilei.push({
                                                name: linzhongmianji.children[i].name+"/"+linzhongmianji.children[i].children[j].name,
                                                value: linzhongmianji.children[i].children[j].area.toFixed(2)
                                            });
                                        }
                                        if (linzhongmianji.children[i].children[j].hasOwnProperty('children')) {
                                            for (var k = 0; k < linzhongmianji.children[i].children[j].children.length; k++) {
                                                if(linzhongmianji.children[i].children[j].children[k].area==0){
                                                    continue;
                                                }else{
                                                    linzu.push({
                                                        name: linzhongmianji.children[i].name+"/"+linzhongmianji.children[i].children[j].name + "/" + linzhongmianji.children[i].children[j].children[k].name,
                                                        value: linzhongmianji.children[i].children[j].children[k].area.toFixed(2)

                                                    });
                                                }
                                            }
                                        }
                                    }
                                };
                                i++;
                            }

                            option.datas=[
                                {
                                    sheetData:linzhong,
                                    sheetName:'林种',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['林种','面积/公顷']
                                },
                                {
                                    sheetData:dilei,
                                    sheetName:'地类',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['地类','面积/公顷']
                                },
                                {
                                    sheetData:linzu,
                                    sheetName:'龄组',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['龄组','面积/公顷']
                                }


                            ];
                            var toExcel=new ExportJsonExcel(option);
                            toExcel.saveExcel();
                        });
                    });

                    // Dimensions of sunburst.
                    var width = 300;
                    var height = 300;
                    var radius = Math.min(width, height) / 2;

                    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                    var b = {
                        w: 75, h: 30, s: 3, t: 10
                    };


                    // Total size of all segments; we set this later, after loading the data.
                    var totalSize = 0;

                    var svg = d3.select("#linzhongmianji_chart").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("id", "linzhongmianji_container")
                        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

                    var partition = d3.layout.partition()
                        .size([2 * Math.PI, radius * radius])
                        .value(function (d) {
                            return d.area;
                        });

                    var arc = d3.svg.arc()
                        .startAngle(function (d) {
                            return d.x;
                        })
                        .endAngle(function (d) {
                            return d.x + d.dx;
                        })
                        .innerRadius(function (d) {
                            return Math.sqrt(d.y);
                        })
                        .outerRadius(function (d) {
                            return Math.sqrt(d.y + d.dy);
                        });



                    //Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    svg.append("svg:circle")
                        .attr("r", radius)
                        .style("opacity", 0);


                    var nodes = partition.nodes(linzhongmianji)
                        .filter(function (d) {
                            return (d.dx > 0);
                        })
                        .sort(function(a, b) { return a.depth- b.depth; });

                    // Mapping of names to colors.
                    var colors = d3.scale.category20();

                    // Basic setup of page elements.
                    initializeBreadcrumbTrail();
                    drawLegend();
                    d3.select("#linzhongmianji_togglelegend").on("click", toggleLegend);

                    var path = svg.data([linzhongmianji]).selectAll("path")
                        .data(nodes)
                        .enter().append("svg:path")
                        .attr("display", function (d) {
                            return d.depth ? null : "none";
                        })
                        .attr("d", arc)
                        .attr("fill-rule", "evenodd")
                        .style("fill", function (d) {
                            return colors(d.name);
                        })
                        .style("opacity", 1)
                        .on("mouseover", mouseover);

                    d3.select("#linzhongmianji_percentage")
                        .text("总面积\n" + area_sum.toFixed(2) + "公顷");
                    d3.select("#linzhongmainji_explanation")
                        .style("visibility", "");

                    // Add the mouseleave handler to the bounding circle.
                    d3.select("#linzhongmianji_container").on("mouseleave", mouseleave);
                    // Get total size of the tree = value of root node from partition.
                    totalSize = path.node().__data__.value;

                    // Fade all but the current sequence, and show it in the breadcrumb trail.
                    function mouseover(d) {
                        var percentage = (100 * d.value / totalSize).toPrecision(6);
                        var percentageString = percentage + "%";


                        d3.select("#linzhongmianji_percentage")
                            .text(d.value.toFixed(2) + "公顷\n" + percentageString);

                        d3.select("#linzhongmianji_explanation")
                            .style("visibility", "");

                        var sequenceArray = getAncestors(d);
                        updateBreadcrumbs(sequenceArray, percentageString);

                        // Fade all the segments.
                        d3.select("#linzhongmianji_container").selectAll("path")
                            .style("opacity", 0.3);

                        // Then highlight only those that are an ancestor of the current segment.
                        svg.selectAll("path")
                            .filter(function (node) {
                                return (sequenceArray.indexOf(node) >= 0);
                            })
                            .style("opacity", 1);
                    }

                    // Restore everything to full opacity when moving off the visualization.
                    function mouseleave(d) {

                        // Hide the breadcrumb trail
                        d3.select("#linzhongmianji_BreadcrumbTrail")
                            .style("visibility", "hidden");

                        // Deactivate all segments during transition.
                        d3.select("#linzhongmianji_container").selectAll("path").on("mouseover", null);

                        // Transition each segment to full opacity and then reactivate it.
                        d3.select("#linzhongmianji_container").selectAll("path")
                            .transition()
                            .duration(1000)
                            .style("opacity", 1)
                            .each("end", function () {
                                d3.select(this).on("mouseover", mouseover);
                            });

                        d3.select("#linzhongmianji_percentage")
                            .text("总面积\n" + area_sum.toFixed(2) + "公顷");
                        d3.select("#linzhongmainji_explanation")
                            .style("visibility", "");
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
                        var linzhongmianji_BreadcrumbTrail = d3.select("#linzhongmianji_sequence").append("svg:svg")
                            .attr("width", width * 2)
                            .attr("height", 50)
                            .attr("id", "linzhongmianji_BreadcrumbTrail");
                        // Add the label at the end, for the percentage.
                        linzhongmianji_BreadcrumbTrail.append("svg:text")
                            .attr("id", "endlabel")
                            .style("fill", "#000");
                    }

                    // Generate a string that describes the points of a breadcrumb polygon.
                    function breadcrumbPoints(d, i) {
                        var points = [];
                        points.push("0,0");
                        points.push(b.w * 2 + ",0");
                        points.push(b.w * 2 + b.t + "," + (b.h / 2));
                        points.push(b.w * 2 + "," + b.h);
                        points.push("0," + b.h);
                        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                            points.push(b.t + "," + (b.h / 2));
                        }
                        return points.join(" ");
                    }

                    // Update the breadcrumb trail to show the current sequence and percentage.
                    function updateBreadcrumbs(nodeArray, percentageString) {

                        // Data join; key function combines name and depth (= position in sequence).
                        var g = d3.select("#linzhongmianji_BreadcrumbTrail")
                            .selectAll("g")
                            .data(nodeArray, function (d) {
                                return d.name + d.depth;
                            });

                        // Add breadcrumb and label for entering nodes.
                        var entering = g.enter().append("svg:g");

                        entering.append("svg:polygon")
                            .attr("points", breadcrumbPoints)
                            .style("fill", function (d) {
                                return colors(d.name);
                            });

                        entering.append("svg:text")
                            .attr("x", (b.w * 2 + b.t) / 2)
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function (d) {
                                return d.name;
                            });

                        // Set position for entering and updating nodes.
                        g.attr("transform", function (d, i) {
                            return "translate(" + i * (b.w * 2 + b.s) + ", 0)";
                        });

                        // Remove exiting nodes.
                        g.exit().remove();

                        // Now move and update the percentage at the end.
                        d3.select("#linzhongmianji_BreadcrumbTrail").select("#endlabel")
                            .attr("x", (nodeArray.length + 0.5) * (b.w * 2 + b.s))
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(percentageString);

                        // Make the breadcrumb trail visible, if it's hidden.
                        d3.select("#linzhongmianji_BreadcrumbTrail")
                            .style("visibility", "");

                    }

                    function drawLegend() {

                        // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                        var li = {
                            w: 125, h: 30, s: 3, r: 3
                        };

                        var data_name=[];

                        for(var i=1;i<nodes.length;i++){
                            var j=0;
                            while(j<data_name.length){
                                if(nodes[i].name==data_name[j].name){
                                    break;
                                }
                                j++;
                            }
                            if(j==data_name.length){
                                data_name.push({
                                    name:nodes[i].name,
                                    area:nodes[i].area
                                })
                            }
                        };

                        var legend = d3.select("#linzhongmianji_legend").append("svg:svg")
                            .attr("width", li.w)
                            .attr("height", data_name.length * (li.h + li.s));

                        var g = legend.selectAll("g")
                            .data(data_name)
                            .enter().append("svg:g")
                            .attr("transform", function (d, i) {
                                return "translate(0," + i * (li.h + li.s) + ")";
                            });

                        g.append("svg:rect")
                            .attr("rx", li.r)
                            .attr("ry", li.r)
                            .attr("width", li.w)
                            .attr("height", li.h)
                            .style("fill", function (d) {
                                return d.area==0?'black': colors(d.name)
                            })
                            .on("mouseover", function () {
                                d3.select(this)
                                    .style("opacity", 0.5);

                            })
                            .on("mouseout", function () {
                                d3.select(this)
                                    .transition()
                                    .duration(100)
                                    .style("opacity", 1);
                            })
                        ;

                        g.append("svg:text")
                            .attr("x", li.w / 2)
                            .attr("y", li.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function (d) {
                                return d.name;
                            });
                    }

                    function toggleLegend() {
                        var legend = d3.select("#linzhongmianji_legend");
                        if (legend.style("visibility") == "hidden") {
                            legend.style("visibility", "");
                        } else {
                            legend.style("visibility", "hidden");
                        }
                    }

                });
                if (stock_sum == 0) {
                    document.getElementById("linzhongxuji_nodata").style.visibility = "visible";
                    document.getElementById("linzhongxuji_data").style.display = "none";
                    document.getElementById("linzhongxuji_download").style.visibility = "hidden";
                }
                else {
                    //林种蓄积量统计
                    d3.json('/forestresources/statistics/t3/' + xzcname, function (error, root) {

                        var linzhongxuji = {
                            "name": "林种活立木蓄积量统计",
                            "children": root
                        }

                        //下载t3_2数据到excel表
                        $(document).ready(function(){
                            $('#linzhongxuji_download').click(function(){
                                var option={};

                                option.fileName = xzcname + "_" + linzhongxuji.name;

                                var linzhong=[];
                                var dilei=[];
                                var linzu=[];

                                var i=0;

                                while(i<linzhongxuji.children.length){
                                    if(linzhongxuji.children[i].stockvolume==0){
                                        i++;
                                        continue;
                                    }else{
                                        linzhong.push({
                                            name:linzhongxuji.children[i].name,
                                            value:linzhongxuji.children[i].stockvolume.toFixed(2)

                                        });
                                    }
                                    if(linzhongxuji.children[i].hasOwnProperty('children')) {
                                        for (var j = 0; j < linzhongxuji.children[i].children.length; j++) {
                                            if(linzhongxuji.children[i].children[j].stockvolume==0){
                                                continue;
                                            }else{
                                                dilei.push({
                                                    name: linzhongxuji.children[i].name+"/"+linzhongxuji.children[i].children[j].name,
                                                    value: linzhongxuji.children[i].children[j].stockvolume.toFixed(2)
                                                });
                                            }
                                            if (linzhongxuji.children[i].children[j].hasOwnProperty('children')) {
                                                for (var k = 0; k < linzhongxuji.children[i].children[j].children.length; k++) {
                                                    if(linzhongxuji.children[i].children[j].children[k].stockvolume==0){
                                                        continue;
                                                    }else{
                                                        linzu.push({
                                                            name: linzhongxuji.children[i].name+"/"+linzhongxuji.children[i].children[j].name + "/" + linzhongxuji.children[i].children[j].children[k].name,
                                                            value: linzhongxuji.children[i].children[j].children[k].stockvolume.toFixed(2)

                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    };
                                    i++;
                                }

                                option.datas=[
                                    {
                                        sheetData:linzhong,
                                        sheetName:'林种',
                                        sheetFilter:['name','value'],
                                        sheetHeader:['林种','活立木蓄积量/立方米']
                                    },
                                    {
                                        sheetData:dilei,
                                        sheetName:'地类',
                                        sheetFilter:['name','value'],
                                        sheetHeader:['地类','活立木蓄积量/立方米']
                                    },
                                    {
                                        sheetData:linzu,
                                        sheetName:'龄组',
                                        sheetFilter:['name','value'],
                                        sheetHeader:['龄组','活立木蓄积量/立方米']
                                    }


                                ];
                                var toExcel=new ExportJsonExcel(option);
                                toExcel.saveExcel();
                            });
                        });

                        // Dimensions of sunburst.
                        var width = 300;
                        var height = 300;
                        var radius = Math.min(width, height) / 2;

                        // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                        var b = {
                            w: 75, h: 30, s: 3, t: 10
                        };


                        // Total size of all segments; we set this later, after loading the data.
                        var totalSize = 0;

                        var svg = d3.select("#linzhongxuji_chart").append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("id", "linzhongxuji_container")
                            .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

                        var partition = d3.layout.partition()
                            .size([2 * Math.PI, radius * radius])
                            .value(function (d) {
                                return d.stockvolume;
                            });

                        var arc = d3.svg.arc()
                            .startAngle(function (d) {
                                return d.x;
                            })
                            .endAngle(function (d) {
                                return d.x + d.dx;
                            })
                            .innerRadius(function (d) {
                                return Math.sqrt(d.y);
                            })
                            .outerRadius(function (d) {
                                return Math.sqrt(d.y + d.dy);
                            });


                        //Bounding circle underneath the sunburst, to make it easier to detect
                        // when the mouse leaves the parent g.
                        svg.append("svg:circle")
                            .attr("r", radius)
                            .style("opacity", 0);


                        var nodes = partition.nodes(linzhongxuji)
                            .filter(function (d) {
                                return (d.dx > 0);
                            })
                            .sort(function(a, b) { return a.depth- b.depth; });

                        // Mapping of names to colors.
                        var colors = d3.scale.category20();


                        // Basic setup of page elements.
                        initializeBreadcrumbTrail();
                        drawLegend();
                        d3.select("#linzhongxuji_togglelegend").on("click", toggleLegend);

                        var path = svg.data([linzhongxuji]).selectAll("path")
                            .data(nodes)
                            .enter().append("svg:path")
                            .attr("display", function (d) {
                                return d.depth ? null : "none";
                            })
                            .attr("d", arc)
                            .attr("fill-rule", "evenodd")
                            .style("fill", function (d) {
                                return colors(d.name);
                            })
                            .style("opacity", 1)
                            .on("mouseover", mouseover);

                        d3.select("#linzhongxuji_percentage")
                            .text("总蓄积量\n" + stock_sum.toFixed(2) + "立方米");
                        d3.select("#linzhongxuji_explanation")
                            .style("visibility", "");

                        // Add the mouseleave handler to the bounding circle.
                        d3.select("#linzhongxuji_container").on("mouseleave", mouseleave);
                        // Get total size of the tree = value of root node from partition.
                        totalSize = path.node().__data__.value;

                        // Fade all but the current sequence, and show it in the breadcrumb trail.
                        function mouseover(d) {
                            var percentage = (100 * d.value / totalSize).toPrecision(6);
                            var percentageString = percentage + "%";


                            d3.select("#linzhongxuji_percentage")
                                .text(d.value.toFixed(2) + "\n立方米\n" + percentageString);

                            d3.select("#linzhongxuji_explanation")
                                .style("visibility", "");

                            var sequenceArray = getAncestors(d);
                            updateBreadcrumbs(sequenceArray, percentageString);

                            // Fade all the segments.
                            d3.select("#linzhongxuji_container").selectAll("path")
                                .style("opacity", 0.3);

                            // Then highlight only those that are an ancestor of the current segment.
                            svg.selectAll("path")
                                .filter(function (node) {
                                    return (sequenceArray.indexOf(node) >= 0);
                                })
                                .style("opacity", 1);
                        }

                        // Restore everything to full opacity when moving off the visualization.
                        function mouseleave(d) {

                            // Hide the breadcrumb trail
                            d3.select("#linzhongxuji_BreadcrumbTrail")
                                .style("visibility", "hidden");

                            // Deactivate all segments during transition.
                            d3.select("#linzhongxuji_container").selectAll("path").on("mouseover", null);

                            // Transition each segment to full opacity and then reactivate it.
                            d3.select("#linzhongxuji_container").selectAll("path")
                                .transition()
                                .duration(1000)
                                .style("opacity", 1)
                                .each("end", function () {
                                    d3.select(this).on("mouseover", mouseover);
                                });

                            d3.select("#linzhongxuji_percentage")
                                .text("总蓄积量\n" + stock_sum.toFixed(2) + "立方米");
                            d3.select("#linzhongxuji_explanation")
                                .style("visibility", "");
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
                            var linzhongxuji_BreadcrumbTrail = d3.select("#linzhongxuji_sequence").append("svg:svg")
                                .attr("width", width * 2)
                                .attr("height", 50)
                                .attr("id", "linzhongxuji_BreadcrumbTrail");
                            // Add the label at the end, for the percentage.
                            linzhongxuji_BreadcrumbTrail.append("svg:text")
                                .attr("id", "endlabel")
                                .style("fill", "#000");
                        }

                        // Generate a string that describes the points of a breadcrumb polygon.
                        function breadcrumbPoints(d, i) {
                            var points = [];
                            points.push("0,0");
                            points.push(b.w * 2 + ",0");
                            points.push(b.w * 2 + b.t + "," + (b.h / 2));
                            points.push(b.w * 2 + "," + b.h);
                            points.push("0," + b.h);
                            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                                points.push(b.t + "," + (b.h / 2));
                            }
                            return points.join(" ");
                        }

                        // Update the breadcrumb trail to show the current sequence and percentage.
                        function updateBreadcrumbs(nodeArray, percentageString) {

                            // Data join; key function combines name and depth (= position in sequence).
                            var g = d3.select("#linzhongxuji_BreadcrumbTrail")
                                .selectAll("g")
                                .data(nodeArray, function (d) {
                                    return d.name + d.depth;
                                });

                            // Add breadcrumb and label for entering nodes.
                            var entering = g.enter().append("svg:g");

                            entering.append("svg:polygon")
                                .attr("points", breadcrumbPoints)
                                .style("fill", function (d) {
                                    return colors(d.name);
                                });

                            entering.append("svg:text")
                                .attr("x", (b.w * 2 + b.t) / 2)
                                .attr("y", b.h / 2)
                                .attr("dy", "0.35em")
                                .attr("text-anchor", "middle")
                                .text(function (d) {
                                    return d.name;
                                });

                            // Set position for entering and updating nodes.
                            g.attr("transform", function (d, i) {
                                return "translate(" + i * (b.w * 2 + b.s) + ", 0)";
                            });

                            // Remove exiting nodes.
                            g.exit().remove();

                            // Now move and update the percentage at the end.
                            d3.select("#linzhongxuji_BreadcrumbTrail").select("#endlabel")
                                .attr("x", (nodeArray.length + 0.5) * (b.w * 2 + b.s))
                                .attr("y", b.h / 2)
                                .attr("dy", "0.35em")
                                .attr("text-anchor", "middle")
                                .text(percentageString);

                            // Make the breadcrumb trail visible, if it's hidden.
                            d3.select("#linzhongxuji_BreadcrumbTrail")
                                .style("visibility", "");

                        }

                        function drawLegend() {

                            // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                            var li = {
                                w: 125, h: 30, s: 3, r: 3
                            };
                            var data_name=[];

                            for(var i=1;i<nodes.length;i++){
                                var j=0;
                                while(j<data_name.length){
                                    if(nodes[i].name==data_name[j].name){
                                        break;
                                    }
                                    j++;
                                }
                                if(j==data_name.length){
                                    data_name.push({
                                        name:nodes[i].name,
                                        area:nodes[i].area
                                    })
                                }
                            };

                            var legend = d3.select("#linzhongxuji_legend").append("svg:svg")
                                .attr("width", li.w)
                                .attr("height", data_name.length * (li.h + li.s));

                            var g = legend.selectAll("g")
                                .data(data_name)
                                .enter().append("svg:g")
                                .attr("transform", function (d, i) {
                                    return "translate(0," + i * (li.h + li.s) + ")";
                                });

                            g.append("svg:rect")
                                .attr("rx", li.r)
                                .attr("ry", li.r)
                                .attr("width", li.w)
                                .attr("height", li.h)
                                .style("fill", function (d) {
                                    return d.area==0?'black': colors(d.name)
                                })
                                .on("mouseover", function () {
                                    d3.select(this)
                                        .style("opacity", 0.5);

                                })
                                .on("mouseout", function () {
                                    d3.select(this)
                                        .transition()
                                        .duration(100)
                                        .style("opacity", 1);
                                })
                            ;

                            g.append("svg:text")
                                .attr("x", li.w / 2)
                                .attr("y", li.h / 2)
                                .attr("dy", "0.35em")
                                .attr("text-anchor", "middle")
                                .text(function (d) {
                                    return d.name;
                                });
                        }

                        function toggleLegend() {
                            var legend = d3.select("#linzhongxuji_legend");
                            if (legend.style("visibility") == "hidden") {
                                legend.style("visibility", "");
                            } else {
                                legend.style("visibility", "hidden");
                            }
                        }

                    });
                }
            }
        }
    });

    //乔木林面积蓄积t4
    $.ajax({
        url: '/forestresources/statistics/t4/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {
            var qiaomulindata = JSON.parse(res);
            //console.log(qiaomulindata);

            var area_sum = 0;
            for (var i = 0; i < qiaomulindata.length; i++) {
                area_sum = area_sum + qiaomulindata[i].area;
            }
            ;

            var stock_sum = 0;
            for (var i = 0; i < qiaomulindata.length; i++) {
                stock_sum = stock_sum + qiaomulindata[i].stockvolume;
            }
            ;

            if (area_sum == 0) {//没有面积统计数据
                document.getElementById("qiaomulinmianji_nodata").style.visibility = "visible";
                document.getElementById("qiaomulinmianji_data").style.display = "none";
                document.getElementById("qiaomulinmianji_download").style.visibility = "hidden";
                document.getElementById("qiaomulinxuji_nodata").style.visibility = "visible";
                document.getElementById("qiaomulinxuji_data").style.display = "none";
                document.getElementById("qiaomulinxuji_download").style.visibility = "hidden";

            } else {
                //面积统计
                d3.json('/forestresources/statistics/t4/' + xzcname, function (error, root) {

                    var qiaomulinmianji = {
                        "name": "乔木林面积统计",
                        "children": root
                    }

                    //下载t4_1数据到excel表
                    $(document).ready(function(){
                        $('#qiaomulinmianji_download').click(function(){
                            var option={};

                            option.fileName = xzcname + "_" + qiaomulinmianji.name;

                            var qiyuan=[];
                            var youshishuzhong=[];
                            var linzu=[];

                            var i=0;

                            while(i<qiaomulinmianji.children.length){
                                if(qiaomulinmianji.children[i].area==0){
                                    i++;
                                    continue;
                                }else{
                                    qiyuan.push({
                                        name:qiaomulinmianji.children[i].name,
                                        value:qiaomulinmianji.children[i].area.toFixed(2)

                                    });
                                }
                                if(qiaomulinmianji.children[i].hasOwnProperty('children')) {
                                    for (var j = 0; j < qiaomulinmianji.children[i].children.length; j++) {
                                        if(qiaomulinmianji.children[i].children[j].area==0){
                                            continue;
                                        }else{
                                            youshishuzhong.push({
                                                name: qiaomulinmianji.children[i].name+"/"+qiaomulinmianji.children[i].children[j].name,
                                                value: qiaomulinmianji.children[i].children[j].area.toFixed(2)
                                            });
                                        }
                                        if (qiaomulinmianji.children[i].children[j].hasOwnProperty('children')) {
                                            for (var k = 0; k < qiaomulinmianji.children[i].children[j].children.length; k++) {
                                                if(qiaomulinmianji.children[i].children[j].children[k].area==0){
                                                    continue;
                                                }else{
                                                    linzu.push({
                                                        name: qiaomulinmianji.children[i].name+"/"+qiaomulinmianji.children[i].children[j].name + "/" + qiaomulinmianji.children[i].children[j].children[k].name,
                                                        value: qiaomulinmianji.children[i].children[j].children[k].area.toFixed(2)

                                                    });
                                                }
                                            }
                                        }
                                    }
                                };
                                i++;
                            }

                            option.datas=[
                                {
                                    sheetData:qiyuan,
                                    sheetName:'起源',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['起源','面积/公顷']
                                },
                                {
                                    sheetData:youshishuzhong,
                                    sheetName:'优势树种',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['优势树种','面积/公顷']
                                },
                                {
                                    sheetData:linzu,
                                    sheetName:'龄组',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['龄组','面积/公顷']
                                }


                            ];
                            var toExcel=new ExportJsonExcel(option);
                            toExcel.saveExcel();
                        });
                    });

                    // Dimensions of sunburst.
                    var width = 300;
                    var height = 300;
                    var radius = Math.min(width, height) / 2;

                    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                    var b = {
                        w: 75, h: 30, s: 3, t: 10
                    };


                    // Total size of all segments; we set this later, after loading the data.
                    var totalSize = 0;

                    var svg = d3.select("#qiaomulinmianji_chart").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("id", "qiaomulinmianji_container")
                        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

                    var partition = d3.layout.partition()
                        .size([2 * Math.PI, radius * radius])
                        .value(function (d) {
                            return d.area;
                        });

                    var arc = d3.svg.arc()
                        .startAngle(function (d) {
                            return d.x;
                        })
                        .endAngle(function (d) {
                            return d.x + d.dx;
                        })
                        .innerRadius(function (d) {
                            return Math.sqrt(d.y);
                        })
                        .outerRadius(function (d) {
                            return Math.sqrt(d.y + d.dy);
                        });

                    //Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    svg.append("svg:circle")
                        .attr("r", radius)
                        .style("opacity", 0);


                    var nodes = partition.nodes(qiaomulinmianji)
                        .filter(function (d) {
                            return (d.dx > 0);
                        })
                        .sort(function(a, b) { return a.depth- b.depth; });


                    // Mapping of names to colors.
                    var colors = d3.scale.category20c();


                    // Basic setup of page elements.
                    initializeBreadcrumbTrail();
                    drawLegend();
                    d3.select("#qiaomulinmianji_togglelegend").on("click", toggleLegend);

                    var path = svg.data([qiaomulinmianji]).selectAll("path")
                        .data(nodes)
                        .enter().append("svg:path")
                        .attr("display", function (d) {
                            return d.depth ? null : "none";
                        })
                        .attr("d", arc)
                        .attr("fill-rule", "evenodd")
                        .style("fill", function (d) {
                            return colors(d.name);
                        })
                        .style("opacity", 1)
                        .on("mouseover", mouseover);

                    d3.select("#qiaomulinmianji_percentage")
                        .text("总面积\n" + area_sum.toFixed(2) + "公顷");
                    d3.select("#qiaomulinmianji_explanation")
                        .style("visibility", "");

                    // Add the mouseleave handler to the bounding circle.
                    d3.select("#qiaomulinmianji_container").on("mouseleave", mouseleave);
                    // Get total size of the tree = value of root node from partition.
                    totalSize = path.node().__data__.value;

                    // Fade all but the current sequence, and show it in the breadcrumb trail.
                    function mouseover(d) {
                        var percentage = (100 * d.value / totalSize).toPrecision(6);
                        var percentageString = percentage + "%";


                        d3.select("#qiaomulinmianji_percentage")
                            .text(d.value.toFixed(2) + "公顷\n" + percentageString);

                        d3.select("#qiaomulinmianji_explanation")
                            .style("visibility", "");

                        var sequenceArray = getAncestors(d);
                        updateBreadcrumbs(sequenceArray, percentageString);

                        // Fade all the segments.
                        d3.select("#qiaomulinmianji_container").selectAll("path")
                            .style("opacity", 0.3);

                        // Then highlight only those that are an ancestor of the current segment.
                        svg.selectAll("path")
                            .filter(function (node) {
                                return (sequenceArray.indexOf(node) >= 0);
                            })
                            .style("opacity", 1);
                    }

                    // Restore everything to full opacity when moving off the visualization.
                    function mouseleave(d) {

                        // Hide the breadcrumb trail
                        d3.select("#qiaomulinmianji_BreadcrumbTrail")
                            .style("visibility", "hidden");

                        // Deactivate all segments during transition.
                        d3.select("#qiaomulinmianji_container").selectAll("path").on("mouseover", null);

                        // Transition each segment to full opacity and then reactivate it.
                        d3.select("#qiaomulinmianji_container").selectAll("path")
                            .transition()
                            .duration(1000)
                            .style("opacity", 1)
                            .each("end", function () {
                                d3.select(this).on("mouseover", mouseover);
                            });

                        d3.select("#qiaomulinmianji_percentage")
                            .text("总面积\n" + area_sum.toFixed(2) + "公顷");
                        d3.select("#qiaomulinmianji_explanation")
                            .style("visibility", "");
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
                        var qiaomulinmianji_BreadcrumbTrail = d3.select("#qiaomulinmianji_sequence").append("svg:svg")
                            .attr("width", width * 2)
                            .attr("height", 50)
                            .attr("id", "qiaomulinmianji_BreadcrumbTrail");
                        // Add the label at the end, for the percentage.
                        qiaomulinmianji_BreadcrumbTrail.append("svg:text")
                            .attr("id", "endlabel")
                            .style("fill", "#000");
                    }

                    // Generate a string that describes the points of a breadcrumb polygon.
                    function breadcrumbPoints(d, i) {
                        var points = [];
                        points.push("0,0");
                        points.push(b.w * 2 + ",0");
                        points.push(b.w * 2 + b.t + "," + (b.h / 2));
                        points.push(b.w * 2 + "," + b.h);
                        points.push("0," + b.h);
                        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                            points.push(b.t + "," + (b.h / 2));
                        }
                        return points.join(" ");
                    }

                    // Update the breadcrumb trail to show the current sequence and percentage.
                    function updateBreadcrumbs(nodeArray, percentageString) {

                        // Data join; key function combines name and depth (= position in sequence).
                        var g = d3.select("#qiaomulinmianji_BreadcrumbTrail")
                            .selectAll("g")
                            .data(nodeArray, function (d) {
                                return d.name + d.depth;
                            });

                        // Add breadcrumb and label for entering nodes.
                        var entering = g.enter().append("svg:g");

                        entering.append("svg:polygon")
                            .attr("points", breadcrumbPoints)
                            .style("fill", function (d) {
                                return colors(d.name);
                            });

                        entering.append("svg:text")
                            .attr("x", (b.w * 2 + b.t) / 2)
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function (d) {
                                return d.name;
                            });

                        // Set position for entering and updating nodes.
                        g.attr("transform", function (d, i) {
                            return "translate(" + i * (b.w * 2 + b.s) + ", 0)";
                        });

                        // Remove exiting nodes.
                        g.exit().remove();

                        // Now move and update the percentage at the end.
                        d3.select("#qiaomulinmianji_BreadcrumbTrail").select("#endlabel")
                            .attr("x", (nodeArray.length + 0.5) * (b.w * 2 + b.s))
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(percentageString);

                        // Make the breadcrumb trail visible, if it's hidden.
                        d3.select("#qiaomulinmianji_BreadcrumbTrail")
                            .style("visibility", "");

                    }

                    function drawLegend() {

                        // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                        var li = {
                            w: 125, h: 30, s: 3, r: 3
                        };
                        var data_name=[];

                        for(var i=1;i<nodes.length;i++){
                            var j=0;
                            while(j<data_name.length){
                                if(nodes[i].name==data_name[j].name){
                                    break;
                                }
                                j++;
                            }
                            if(j==data_name.length){
                                data_name.push({
                                    name:nodes[i].name,
                                    area:nodes[i].area
                                })
                            }
                        };
                        var legend = d3.select("#qiaomulinmianji_legend").append("svg:svg")
                            .attr("width", li.w)
                            .attr("height", data_name.length * (li.h + li.s));

                        var g = legend.selectAll("g")
                            .data(data_name)
                            .enter().append("svg:g")
                            .attr("transform", function (d, i) {
                                return "translate(0," + i * (li.h + li.s) + ")";
                            });

                        g.append("svg:rect")
                            .attr("rx", li.r)
                            .attr("ry", li.r)
                            .attr("width", li.w)
                            .attr("height", li.h)
                            .style("fill", function (d) {
                                return d.area==0?'black': colors(d.name)
                            })
                            .on("mouseover", function () {
                                d3.select(this)
                                    .style("opacity", 0.5);

                            })
                            .on("mouseout", function () {
                                d3.select(this)
                                    .transition()
                                    .duration(100)
                                    .style("opacity", 1);
                            })
                        ;

                        g.append("svg:text")
                            .attr("x", li.w / 2)
                            .attr("y", li.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function (d) {
                                return d.name;
                            });
                    }

                    function toggleLegend() {
                        var legend = d3.select("#qiaomulinmianji_legend");
                        if (legend.style("visibility") == "hidden") {
                            legend.style("visibility", "");
                        } else {
                            legend.style("visibility", "hidden");
                        }
                    }

                });
                if (stock_sum == 0) {
                    document.getElementById("qiaomulinxuji_nodata").style.visibility = "visible";
                    document.getElementById("qiaomulinxuji_data").style.display = "none";
                    document.getElementById("qiaomulinxuji_download").style.visibility = "hidden";
                }
                else {
                    //蓄积量统计
                    d3.json('/forestresources/statistics/t4/' + xzcname, function (error, root) {

                        var qiaomulinxuji = {
                            "name": "乔木林活立木蓄积量统计",
                            "children": root
                        }

                        //下载t4_2数据到excel表
                        $(document).ready(function(){
                            $('#qiaomulinxuji_download').click(function(){
                                var option={};

                                option.fileName = xzcname + "_" + qiaomulinxuji.name;

                                var qiyuan=[];
                                var youshishuzhong=[];
                                var linzu=[];

                                var i=0;

                                while(i<qiaomulinxuji.children.length){
                                    if(qiaomulinxuji.children[i].stockvolume==0){
                                        i++;
                                        continue;
                                    }else{
                                        qiyuan.push({
                                            name:qiaomulinxuji.children[i].name,
                                            value:qiaomulinxuji.children[i].stockvolume.toFixed(2)

                                        });
                                    }
                                    if(qiaomulinxuji.children[i].hasOwnProperty('children')) {
                                        for (var j = 0; j < qiaomulinxuji.children[i].children.length; j++) {
                                            if(qiaomulinxuji.children[i].children[j].stockvolume==0){
                                                continue;
                                            }else{
                                                youshishuzhong.push({
                                                    name: qiaomulinxuji.children[i].name+"/"+qiaomulinxuji.children[i].children[j].name,
                                                    value: qiaomulinxuji.children[i].children[j].stockvolume.toFixed(2)
                                                });
                                            }
                                            if (qiaomulinxuji.children[i].children[j].hasOwnProperty('children')) {
                                                for (var k = 0; k < qiaomulinxuji.children[i].children[j].children.length; k++) {
                                                    if(qiaomulinxuji.children[i].children[j].children[k].stockvolume==0){
                                                        continue;
                                                    }else{
                                                        linzu.push({
                                                            name: qiaomulinxuji.children[i].name+"/"+qiaomulinxuji.children[i].children[j].name + "/" + qiaomulinxuji.children[i].children[j].children[k].name,
                                                            value: qiaomulinxuji.children[i].children[j].children[k].stockvolume.toFixed(2)

                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    };
                                    i++;
                                }

                                option.datas=[
                                    {
                                        sheetData:qiyuan,
                                        sheetName:'起源',
                                        sheetFilter:['name','value'],
                                        sheetHeader:['起源','活立木蓄积量/立方米']
                                    },
                                    {
                                        sheetData:youshishuzhong,
                                        sheetName:'优势树种',
                                        sheetFilter:['name','value'],
                                        sheetHeader:['优势树种','活立木蓄积量/立方米']
                                    },
                                    {
                                        sheetData:linzu,
                                        sheetName:'龄组',
                                        sheetFilter:['name','value'],
                                        sheetHeader:['龄组','活立木蓄积量/立方米']
                                    }


                                ];
                                var toExcel=new ExportJsonExcel(option);
                                toExcel.saveExcel();
                            });
                        });
                        // Dimensions of sunburst.
                        var width = 300;
                        var height = 300;
                        var radius = Math.min(width, height) / 2;

                        // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                        var b = {
                            w: 75, h: 30, s: 3, t: 10
                        };



                        // Total size of all segments; we set this later, after loading the data.
                        var totalSize = 0;

                        var svg = d3.select("#qiaomulinxuji_chart").append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("id", "qiaomulinxuji_container")
                            .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

                        var partition = d3.layout.partition()
                            .size([2 * Math.PI, radius * radius])
                            .value(function (d) {
                                return d.stockvolume;
                            });

                        var arc = d3.svg.arc()
                            .startAngle(function (d) {
                                return d.x;
                            })
                            .endAngle(function (d) {
                                return d.x + d.dx;
                            })
                            .innerRadius(function (d) {
                                return Math.sqrt(d.y);
                            })
                            .outerRadius(function (d) {
                                return Math.sqrt(d.y + d.dy);
                            });


                        //Bounding circle underneath the sunburst, to make it easier to detect
                        // when the mouse leaves the parent g.
                        svg.append("svg:circle")
                            .attr("r", radius)
                            .style("opacity", 0);


                        var nodes = partition.nodes(qiaomulinxuji)
                            .filter(function (d) {
                                return (d.dx > 0);
                            })
                            .sort(function(a, b) { return a.depth- b.depth; });


                        // Mapping of names to colors.
                        var colors = d3.scale.category20c();


                        // Basic setup of page elements.
                        initializeBreadcrumbTrail();
                        drawLegend();
                        d3.select("#qiaomulinxuji_togglelegend").on("click", toggleLegend);

                        var path = svg.data([qiaomulinxuji]).selectAll("path")
                            .data(nodes)
                            .enter().append("svg:path")
                            .attr("display", function (d) {
                                return d.depth ? null : "none";
                            })
                            .attr("d", arc)
                            .attr("fill-rule", "evenodd")
                            .style("fill", function (d) {
                                return colors(d.name);
                            })
                            .style("opacity", 1)
                            .on("mouseover", mouseover);

                        d3.select("#qiaomulinxuji_percentage")
                            .text("总蓄积量\n" + stock_sum.toFixed(2) + "立方米");
                        d3.select("#qiaomulinxuji_explanation")
                            .style("visibility", "");

                        // Add the mouseleave handler to the bounding circle.
                        d3.select("#qiaomulinxuji_container").on("mouseleave", mouseleave);
                        // Get total size of the tree = value of root node from partition.
                        totalSize = path.node().__data__.value;

                        // Fade all but the current sequence, and show it in the breadcrumb trail.
                        function mouseover(d) {
                            var percentage = (100 * d.value / totalSize).toPrecision(6);
                            var percentageString = percentage + "%";


                            d3.select("#qiaomulinxuji_percentage")
                                .text(d.value.toFixed(2) + "\n立方米\n" + percentageString);

                            d3.select("#qiaomulinxuji_explanation")
                                .style("visibility", "");

                            var sequenceArray = getAncestors(d);
                            updateBreadcrumbs(sequenceArray, percentageString);

                            // Fade all the segments.
                            d3.select("#qiaomulinxuji_container").selectAll("path")
                                .style("opacity", 0.3);

                            // Then highlight only those that are an ancestor of the current segment.
                            svg.selectAll("path")
                                .filter(function (node) {
                                    return (sequenceArray.indexOf(node) >= 0);
                                })
                                .style("opacity", 1);
                        }

                        // Restore everything to full opacity when moving off the visualization.
                        function mouseleave(d) {

                            // Hide the breadcrumb trail
                            d3.select("#qiaomulinxuji_BreadcrumbTrail")
                                .style("visibility", "hidden");

                            // Deactivate all segments during transition.
                            d3.select("#qiaomulinxuji_container").selectAll("path").on("mouseover", null);

                            // Transition each segment to full opacity and then reactivate it.
                            d3.select("#qiaomulinxuji_container").selectAll("path")
                                .transition()
                                .duration(1000)
                                .style("opacity", 1)
                                .each("end", function () {
                                    d3.select(this).on("mouseover", mouseover);
                                });

                            d3.select("#qiaomulinxuji_percentage")
                                .text("总蓄积量\n" + stock_sum.toFixed(2) + "立方米");
                            d3.select("#qiaomulinxuji_explanation")
                                .style("visibility", "");
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
                            var qiaomulinxuji_BreadcrumbTrail = d3.select("#qiaomulinxuji_sequence").append("svg:svg")
                                .attr("width", width * 2)
                                .attr("height", 50)
                                .attr("id", "qiaomulinxuji_BreadcrumbTrail");
                            // Add the label at the end, for the percentage.
                            qiaomulinxuji_BreadcrumbTrail.append("svg:text")
                                .attr("id", "endlabel")
                                .style("fill", "#000");
                        }

                        // Generate a string that describes the points of a breadcrumb polygon.
                        function breadcrumbPoints(d, i) {
                            var points = [];
                            points.push("0,0");
                            points.push(b.w * 2 + ",0");
                            points.push(b.w * 2 + b.t + "," + (b.h / 2));
                            points.push(b.w * 2 + "," + b.h);
                            points.push("0," + b.h);
                            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                                points.push(b.t + "," + (b.h / 2));
                            }
                            return points.join(" ");
                        }

                        // Update the breadcrumb trail to show the current sequence and percentage.
                        function updateBreadcrumbs(nodeArray, percentageString) {

                            // Data join; key function combines name and depth (= position in sequence).
                            var g = d3.select("#qiaomulinxuji_BreadcrumbTrail")
                                .selectAll("g")
                                .data(nodeArray, function (d) {
                                    return d.name + d.depth;
                                });

                            // Add breadcrumb and label for entering nodes.
                            var entering = g.enter().append("svg:g");

                            entering.append("svg:polygon")
                                .attr("points", breadcrumbPoints)
                                .style("fill", function (d) {
                                    return colors(d.name);
                                });

                            entering.append("svg:text")
                                .attr("x", (b.w * 2 + b.t) / 2)
                                .attr("y", b.h / 2)
                                .attr("dy", "0.35em")
                                .attr("text-anchor", "middle")
                                .text(function (d) {
                                    return d.name;
                                });

                            // Set position for entering and updating nodes.
                            g.attr("transform", function (d, i) {
                                return "translate(" + i * (b.w * 2 + b.s) + ", 0)";
                            });

                            // Remove exiting nodes.
                            g.exit().remove();

                            // Now move and update the percentage at the end.
                            d3.select("#qiaomulinxuji_BreadcrumbTrail").select("#endlabel")
                                .attr("x", (nodeArray.length + 0.5) * (b.w * 2 + b.s))
                                .attr("y", b.h / 2)
                                .attr("dy", "0.35em")
                                .attr("text-anchor", "middle")
                                .text(percentageString);

                            // Make the breadcrumb trail visible, if it's hidden.
                            d3.select("#qiaomulinxuji_BreadcrumbTrail")
                                .style("visibility", "");

                        }

                        function drawLegend() {

                            // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                            var li = {
                                w: 125, h: 30, s: 3, r: 3
                            };

                            var data_name=[];

                            for(var i=1;i<nodes.length;i++){
                                var j=0;
                                while(j<data_name.length){
                                    if(nodes[i].name==data_name[j].name){
                                        break;
                                    }
                                    j++;
                                }
                                if(j==data_name.length){
                                    data_name.push({
                                        name:nodes[i].name,
                                        area:nodes[i].area
                                    })
                                }
                            };

                            var legend = d3.select("#qiaomulinxuji_legend").append("svg:svg")
                                .attr("width", li.w)
                                .attr("height", data_name.length * (li.h + li.s));

                            var g = legend.selectAll("g")
                                .data(data_name)
                                .enter().append("svg:g")
                                .attr("transform", function (d, i) {
                                    return "translate(0," + i * (li.h + li.s) + ")";
                                });

                            g.append("svg:rect")
                                .attr("rx", li.r)
                                .attr("ry", li.r)
                                .attr("width", li.w)
                                .attr("height", li.h)
                                .style("fill", function (d) {
                                    return d.area==0?'black': colors(d.name)
                                })
                                .on("mouseover", function () {
                                    d3.select(this)
                                        .style("opacity", 0.5);

                                })
                                .on("mouseout", function () {
                                    d3.select(this)
                                        .transition()
                                        .duration(100)
                                        .style("opacity", 1);
                                })
                            ;

                            g.append("svg:text")
                                .attr("x", li.w / 2)
                                .attr("y", li.h / 2)
                                .attr("dy", "0.35em")
                                .attr("text-anchor", "middle")
                                .text(function (d) {
                                    return d.name;
                                });
                        }

                        function toggleLegend() {
                            var legend = d3.select("#qiaomulinxuji_legend");
                            if (legend.style("visibility") == "hidden") {
                                legend.style("visibility", "");
                            } else {
                                legend.style("visibility", "hidden");
                            }
                        }

                    });
                }
            }


        }
    });

    //生态公益林t5
    $.ajax({
        url: '/forestresources/statistics/t5/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {


            d3.json('/forestresources/statistics/t5/' + xzcname, function (error, root) {
                //console.log(JSON.stringify(root));
                // Basic setup of page elements.
                // Dimensions of sunburst.
                if (root.length == 0) {//某些县没有林地面积统计数据
                    document.getElementById("shengtaigongyilin_nodata").style.visibility = "visible";
                    document.getElementById("shengtaigongyilin_data").style.display = "none";
                    document.getElementById("shengtaigongyilin_download").style.visibility = "hidden";
                } else {
                    var width = 500;
                    var height = 500;
                    var radius = Math.min(width, height) / 2;

                    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                    var b = {
                        w: 75, h: 30, s: 3, t: 10
                    };



                    // Total size of all segments; we set this later, after loading the data.
                    var totalSize = 0;

                    var svg = d3.select("#shengtaigongyilin_chart").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("id", "shengtaigongyilin_container")
                        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

                    var partition = d3.layout.partition()
                        .size([2 * Math.PI, radius * radius])
                        .value(function (d) {
                            return d.area;
                        });

                    var arc = d3.svg.arc()
                        .startAngle(function (d) {
                            return d.x;
                        })
                        .endAngle(function (d) {
                            return d.x + d.dx;
                        })
                        .innerRadius(function (d) {
                            return Math.sqrt(d.y);
                        })
                        .outerRadius(function (d) {
                            return Math.sqrt(d.y + d.dy);
                        });

                    var area_sum = 0;
                    for (var i = 0; i < root.length; i++) {
                        area_sum = area_sum + root[i].area;
                    };

                    var shengtaigongyilin = {
                        "name": "生态公益林面积统计",
                        "children": root
                    };

                    //下载t5数据到excel表
                    $(document).ready(function(){
                        $('#shengtaigongyilin_download').click(function(){
                            var option={};

                            option.fileName = xzcname + "_" + shengtaigongyilin.name;

                            var shiquandengji=[];
                            var g_cheng_lb=[];
                            var baohudengji=[];
                            var dilei=[];

                            var i=0;

                            while(i<shengtaigongyilin.children.length){
                                if(shengtaigongyilin.children[i].area==0){
                                    i++;
                                    continue;
                                }else{
                                    shiquandengji.push({
                                        name:shengtaigongyilin.children[i].name,
                                        value:shengtaigongyilin.children[i].area.toFixed(2)

                                    });
                                }
                                if(shengtaigongyilin.children[i].hasOwnProperty('children')) {
                                    for (var j = 0; j < shengtaigongyilin.children[i].children.length; j++) {
                                        if(shengtaigongyilin.children[i].children[j].area==0){
                                            continue;
                                        }else{
                                            g_cheng_lb.push({
                                                name: shengtaigongyilin.children[i].name+"/"+shengtaigongyilin.children[i].children[j].name,
                                                value: shengtaigongyilin.children[i].children[j].area.toFixed(2)
                                            });
                                        }
                                        if (shengtaigongyilin.children[i].children[j].hasOwnProperty('children')) {
                                            for (var k = 0; k < shengtaigongyilin.children[i].children[j].children.length; k++) {
                                                if(shengtaigongyilin.children[i].children[j].children[k].area==0){
                                                    continue;
                                                }else{
                                                    baohudengji.push({
                                                        name: shengtaigongyilin.children[i].name+"/"+shengtaigongyilin.children[i].children[j].name + "/" + shengtaigongyilin.children[i].children[j].children[k].name,
                                                        value: shengtaigongyilin.children[i].children[j].children[k].area.toFixed(2)

                                                    });
                                                }
                                                if (shengtaigongyilin.children[i].children[j].children[k].hasOwnProperty('children')) {
                                                    for (var m = 0; m < shengtaigongyilin.children[i].children[j].children[k].children.length; m++) {
                                                        if(shengtaigongyilin.children[i].children[j].children[k].children[m].area==0){
                                                            continue;
                                                        }else{
                                                            dilei.push({
                                                                name: shengtaigongyilin.children[i].name+"/"+shengtaigongyilin.children[i].children[j].name + "/" + shengtaigongyilin.children[i].children[j].children[k].name+"/"+shengtaigongyilin.children[i].children[j].children[k].children[m].name,
                                                                value: shengtaigongyilin.children[i].children[j].children[k].children[m].area.toFixed(2)
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                };
                                i++;
                            }

                            option.datas=[
                                {
                                    sheetData:shiquandengji,
                                    sheetName:'事权等级',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['事权等级','面积/公顷']
                                },
                                {
                                    sheetData:g_cheng_lb,
                                    sheetName:'工程类别',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['工程类别','面积/公顷']
                                },
                                {
                                    sheetData:baohudengji,
                                    sheetName:'保护等级',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['保护等级','面积/公顷']
                                },
                                {
                                    sheetData:dilei,
                                    sheetName:'地类',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['地类','面积/公顷']
                                }

                            ];
                            var toExcel=new ExportJsonExcel(option);
                            toExcel.saveExcel();
                        });
                    });

                    //Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    svg.append("svg:circle")
                        .attr("r", radius)
                        .style("opacity", 0);


                    var nodes = partition.nodes(shengtaigongyilin)
                        .filter(function (d) {
                            return (d.dx > 0);
                        })
                        .sort(function(a, b) { return a.depth- b.depth; });


                    // Mapping of names to colors.
                    var colors = d3.scale.category20c();


                    initializeBreadcrumbTrail();
                    drawLegend();
                    d3.select("#shengtaigongyilin_togglelegend").on("click", toggleLegend);

                    var path = svg.data([shengtaigongyilin]).selectAll("path")
                        .data(nodes)
                        .enter().append("svg:path")
                        .attr("display", function (d) {
                            return d.depth ? null : "none";
                        })
                        .attr("d", arc)
                        .attr("fill-rule", "evenodd")
                        .style("fill", function (d) {
                            return colors(d.name);
                        })
                        .style("opacity", 1)
                        .on("mouseover", mouseover);

                    d3.select("#shengtaigongyilin_percentage")
                        .text("总面积\n" + area_sum.toFixed(2) + "公顷");
                    d3.select("#tudimainji_explanation")
                        .style("visibility", "");

                    // Add the mouseleave handler to the bounding circle.
                    d3.select("#shengtaigongyilin_container").on("mouseleave", mouseleave);
                    // Get total size of the tree = value of root node from partition.
                    totalSize = path.node().__data__.value;

                    // Fade all but the current sequence, and show it in the breadcrumb trail.
                    function mouseover(d) {
                        var percentage = (100 * d.value / totalSize).toPrecision(6);
                        var percentageString = percentage + "%";


                        d3.select("#shengtaigongyilin_percentage")
                            .text(d.value.toFixed(2) + "公顷\n" + percentageString);

                        d3.select("#shengtaigongyilin_explanation")
                            .style("visibility", "");

                        var sequenceArray = getAncestors(d);
                        updateBreadcrumbs(sequenceArray, percentageString);

                        // Fade all the segments.
                        d3.select("#shengtaigongyilin_container").selectAll("path")
                            .style("opacity", 0.3);

                        // Then highlight only those that are an ancestor of the current segment.
                        svg.selectAll("path")
                            .filter(function (node) {
                                return (sequenceArray.indexOf(node) >= 0);
                            })
                            .style("opacity", 1);
                    }

                    // Restore everything to full opacity when moving off the visualization.
                    function mouseleave(d) {


                        // Hide the breadcrumb trail
                        d3.select("#shengtaigongyilin_BreadcrumbTrail")
                            .style("visibility", "hidden");

                        // Deactivate all segments during transition.
                        d3.select("#shengtaigongyilin_container").selectAll("path").on("mouseover", null);

                        // Transition each segment to full opacity and then reactivate it.
                        d3.select("#shengtaigongyilin_container").selectAll("path")
                            .transition()
                            .duration(1000)
                            .style("opacity", 1)
                            .each("end", function () {
                                d3.select(this).on("mouseover", mouseover);
                            });

                        d3.select("#shengtaigongyilin_percentage")
                            .text("总面积\n" + area_sum.toFixed(2) + "公顷");
                        d3.select("#tudimainji_explanation")
                            .style("visibility", "");
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
                        var shengtaigongyilin_BreadcrumbTrail = d3.select("#shengtaigongyilin_sequence").append("svg:svg")
                            .attr("width", width * 2)
                            .attr("height", 50)
                            .attr("id", "shengtaigongyilin_BreadcrumbTrail");
                        // Add the label at the end, for the percentage.
                        shengtaigongyilin_BreadcrumbTrail.append("svg:text")
                            .attr("id", "endlabel")
                            .style("fill", "#000");
                    }

                    // Generate a string that describes the points of a breadcrumb polygon.
                    function breadcrumbPoints(d, i) {
                        var points = [];
                        points.push("0,0");
                        points.push(b.w * 2 + ",0");
                        points.push(b.w * 2 + b.t + "," + (b.h / 2));
                        points.push(b.w * 2 + "," + b.h);
                        points.push("0," + b.h);
                        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                            points.push(b.t + "," + (b.h / 2));
                        }
                        return points.join(" ");
                    }

                    // Update the breadcrumb trail to show the current sequence and percentage.
                    function updateBreadcrumbs(nodeArray, percentageString) {

                        // Data join; key function combines name and depth (= position in sequence).
                        var g = d3.select("#shengtaigongyilin_BreadcrumbTrail")
                            .selectAll("g")
                            .data(nodeArray, function (d) {
                                return d.name + d.depth;
                            });

                        // Add breadcrumb and label for entering nodes.
                        var entering = g.enter().append("svg:g");

                        entering.append("svg:polygon")
                            .attr("points", breadcrumbPoints)
                            .style("fill", function (d) {
                                return colors(d.name);
                            });

                        entering.append("svg:text")
                            .attr("x", (b.w * 2 + b.t) / 2)
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function (d) {
                                return d.name;
                            });

                        // Set position for entering and updating nodes.
                        g.attr("transform", function (d, i) {
                            return "translate(" + i * (b.w * 2 + b.s) + ", 0)";
                        });

                        // Remove exiting nodes.
                        g.exit().remove();

                        // Now move and update the percentage at the end.
                        d3.select("#shengtaigongyilin_BreadcrumbTrail").select("#endlabel")
                            .attr("x", (nodeArray.length + 0.5) * (b.w * 2 + b.s))
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(percentageString);

                        // Make the breadcrumb trail visible, if it's hidden.
                        d3.select("#shengtaigongyilin_BreadcrumbTrail")
                            .style("visibility", "");

                    }

                    function drawLegend() {

                        // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                        var li = {
                            w: 160, h: 30, s: 3, r: 3
                        };
                        var data_name=[];

                        for(var i=1;i<nodes.length;i++){
                            var j=0;
                            while(j<data_name.length){
                                if(nodes[i].name==data_name[j].name){
                                    break;
                                }
                                j++;
                            }
                            if(j==data_name.length){
                                data_name.push({
                                    name:nodes[i].name,
                                    area:nodes[i].area
                                })
                            }
                        };
                        var legend = d3.select("#shengtaigongyilin_legend").append("svg:svg")
                            .attr("width", li.w)
                            .attr("height", data_name.length * (li.h + li.s));

                        var g = legend.selectAll("g")
                            .data(data_name)
                            .enter().append("svg:g")
                            .attr("transform", function (d, i) {
                                return "translate(0," + i * (li.h + li.s) + ")";
                            });

                        g.append("svg:rect")
                            .attr("rx", li.r)
                            .attr("ry", li.r)
                            .attr("width", li.w)
                            .attr("height", li.h)
                            .style("fill", function (d) {
                                return d.area==0?'black': colors(d.name)
                            })
                            .on("mouseover", function () {
                                d3.select(this)
                                    .style("opacity", 0.5);

                            })
                            .on("mouseout", function () {
                                d3.select(this)
                                    .transition()
                                    .duration(100)
                                    .style("opacity", 1);
                            })
                        ;

                        g.append("svg:text")
                            .attr("x", li.w / 2)
                            .attr("y", li.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function (d) {
                                return d.name;
                            });
                    }

                    function toggleLegend() {
                        var legend = d3.select("#shengtaigongyilin_legend");
                        if (legend.style("visibility") == "hidden") {
                            legend.style("visibility", "");
                        } else {
                            legend.style("visibility", "hidden");
                        }
                    }
                }
            });
        }
    });

    //灌木林面积蓄积t6
    $.ajax({
        url: '/forestresources/statistics/t6/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {

            d3.json('/forestresources/statistics/t6/' + xzcname, function (error, root) {
                //console.log(JSON.stringify(root));
                // Basic setup of page elements.
                // Dimensions of sunburst.
                if (root.length == 0) {//某些县没有林地面积统计数据
                    document.getElementById("guanmulin_nodata").style.visibility = "visible";
                    document.getElementById("guanmulin_data").style.display = "none";
                    document.getElementById("guanmulin_download").style.visibility = "hidden";

                } else {
                    var width = 500;
                    var height = 500;
                    var radius = Math.min(width, height) / 2;

                    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                    var b = {
                        w: 75, h: 30, s: 3, t: 10
                    };




                    // Total size of all segments; we set this later, after loading the data.
                    var totalSize = 0;

                    var svg = d3.select("#guanmulin_chart").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("id", "guanmulin_container")
                        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

                    var partition = d3.layout.partition()
                        .size([2 * Math.PI, radius * radius])
                        .value(function (d) {
                            return d.area;
                        });

                    var arc = d3.svg.arc()
                        .startAngle(function (d) {
                            return d.x;
                        })
                        .endAngle(function (d) {
                            return d.x + d.dx;
                        })
                        .innerRadius(function (d) {
                            return Math.sqrt(d.y);
                        })
                        .outerRadius(function (d) {
                            return Math.sqrt(d.y + d.dy);
                        });

                    var area_sum = 0;
                    for (var i = 0; i < root.length; i++) {
                        area_sum = area_sum + root[i].area;
                    };

                    var guanmulin = {
                        "name": "灌木林面积统计",
                        "children": root
                    };

                    //下载t6数据到excel表
                    $(document).ready(function(){
                        $('#guanmulin_download').click(function(){
                            var option={};

                            option.fileName = xzcname + "_" + guanmulin.name;

                            var qiyuan=[];
                            var dilei=[];
                            var youshishuzhong=[];
                            var yubidu=[];

                            var i=0;

                            while(i<guanmulin.children.length){
                                if(guanmulin.children[i].area==0){
                                    i++;
                                    continue;
                                }else{
                                    qiyuan.push({
                                        name:guanmulin.children[i].name,
                                        value:guanmulin.children[i].area.toFixed(2)

                                    });
                                }
                                if(guanmulin.children[i].hasOwnProperty('children')) {
                                    for (var j = 0; j < guanmulin.children[i].children.length; j++) {
                                        if(guanmulin.children[i].children[j].area==0){
                                            continue;
                                        }else{
                                            dilei.push({
                                                name: guanmulin.children[i].name+"/"+guanmulin.children[i].children[j].name,
                                                value: guanmulin.children[i].children[j].area.toFixed(2)
                                            });
                                        }
                                        if (guanmulin.children[i].children[j].hasOwnProperty('children')) {
                                            for (var k = 0; k < guanmulin.children[i].children[j].children.length; k++) {
                                                if(guanmulin.children[i].children[j].children[k].area==0){
                                                    continue;
                                                }else{
                                                    youshishuzhong.push({
                                                        name: guanmulin.children[i].name+"/"+guanmulin.children[i].children[j].name + "/" + guanmulin.children[i].children[j].children[k].name,
                                                        value: guanmulin.children[i].children[j].children[k].area.toFixed(2)

                                                    });
                                                }
                                                if (guanmulin.children[i].children[j].children[k].hasOwnProperty('children')) {
                                                    for (var m = 0; m < guanmulin.children[i].children[j].children[k].children.length; m++) {
                                                        if(guanmulin.children[i].children[j].children[k].children[m].area==0){
                                                            continue;
                                                        }else{
                                                            yubidu.push({
                                                                name: guanmulin.children[i].name+"/"+guanmulin.children[i].children[j].name + "/" + guanmulin.children[i].children[j].children[k].name+"/"+guanmulin.children[i].children[j].children[k].children[m].name,
                                                                value: guanmulin.children[i].children[j].children[k].children[m].area.toFixed(2)
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                };
                                i++;
                            }

                            option.datas=[
                                {
                                    sheetData:qiyuan,
                                    sheetName:'起源',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['起源','面积/公顷']
                                },
                                {
                                    sheetData:dilei,
                                    sheetName:'地类',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['地类','面积/公顷']
                                },
                                {
                                    sheetData:youshishuzhong,
                                    sheetName:'优势树种',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['优势树种','面积/公顷']
                                },
                                {
                                    sheetData:yubidu,
                                    sheetName:'郁闭度',
                                    sheetFilter:['name','value'],
                                    sheetHeader:['郁闭度','面积/公顷']
                                }


                            ];
                            var toExcel=new ExportJsonExcel(option);
                            toExcel.saveExcel();
                        });
                    });

                    //Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    svg.append("svg:circle")
                        .attr("r", radius)
                        .style("opacity", 0);


                    var nodes = partition.nodes(guanmulin)
                        .filter(function (d) {
                            return (d.dx > 0);
                        })
                        .sort(function(a, b) { return a.depth- b.depth; });

                    // Mapping of names to colors.
                    var colors = d3.scale.category20c();

                    initializeBreadcrumbTrail();
                    drawLegend();
                    d3.select("#guanmulin_togglelegend").on("click", toggleLegend);

                    var path = svg.data([guanmulin]).selectAll("path")
                        .data(nodes)
                        .enter().append("svg:path")
                        .attr("display", function (d) {
                            return d.depth ? null : "none";
                        })
                        .attr("d", arc)
                        .attr("fill-rule", "evenodd")
                        .style("fill", function (d) {
                            return colors(d.name);
                        })
                        .style("opacity", 1)
                        .on("mouseover", mouseover);

                    d3.select("#guanmulin_percentage")
                        .text("总面积\n" + area_sum.toFixed(2) + "公顷");
                    d3.select("#tudimainji_explanation")
                        .style("visibility", "");

                    // Add the mouseleave handler to the bounding circle.
                    d3.select("#guanmulin_container").on("mouseleave", mouseleave);
                    // Get total size of the tree = value of root node from partition.
                    totalSize = path.node().__data__.value;


                    // Fade all but the current sequence, and show it in the breadcrumb trail.
                    function mouseover(d) {
                        var percentage = (100 * d.value / totalSize).toPrecision(6);
                        var percentageString = percentage + "%";


                        d3.select("#guanmulin_percentage")
                            .text(d.value.toFixed(2) + "公顷\n" + percentageString);

                        d3.select("#guanmulin_explanation")
                            .style("visibility", "");

                        var sequenceArray = getAncestors(d);
                        updateBreadcrumbs(sequenceArray, percentageString);

                        // Fade all the segments.
                        d3.select("#guanmulin_container").selectAll("path")
                            .style("opacity", 0.3);

                        // Then highlight only those that are an ancestor of the current segment.
                        svg.selectAll("path")
                            .filter(function (node) {
                                return (sequenceArray.indexOf(node) >= 0);
                            })
                            .style("opacity", 1);
                    }

                    // Restore everything to full opacity when moving off the visualization.
                    function mouseleave(d) {


                        // Hide the breadcrumb trail
                        d3.select("#guanmulin_BreadcrumbTrail")
                            .style("visibility", "hidden");

                        // Deactivate all segments during transition.
                        d3.select("#guanmulin_container").selectAll("path").on("mouseover", null);

                        // Transition each segment to full opacity and then reactivate it.
                        d3.select("#guanmulin_container").selectAll("path")
                            .transition()
                            .duration(1000)
                            .style("opacity", 1)
                            .each("end", function () {
                                d3.select(this).on("mouseover", mouseover);
                            });

                        d3.select("#guanmulin_percentage")
                            .text("总面积\n" + area_sum.toFixed(2) + "公顷");
                        d3.select("#tudimainji_explanation")
                            .style("visibility", "");
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
                        var guanmulin_BreadcrumbTrail = d3.select("#guanmulin_sequence").append("svg:svg")
                            .attr("width", width * 2)
                            .attr("height", 50)
                            .attr("id", "guanmulin_BreadcrumbTrail");
                        // Add the label at the end, for the percentage.
                        guanmulin_BreadcrumbTrail.append("svg:text")
                            .attr("id", "endlabel")
                            .style("fill", "#000");
                    }

                    // Generate a string that describes the points of a breadcrumb polygon.
                    function breadcrumbPoints(d, i) {
                        var points = [];
                        points.push("0,0");
                        points.push(b.w * 2 + ",0");
                        points.push(b.w * 2 + b.t + "," + (b.h / 2));
                        points.push(b.w * 2 + "," + b.h);
                        points.push("0," + b.h);
                        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                            points.push(b.t + "," + (b.h / 2));
                        }
                        return points.join(" ");
                    }

                    // Update the breadcrumb trail to show the current sequence and percentage.
                    function updateBreadcrumbs(nodeArray, percentageString) {

                        // Data join; key function combines name and depth (= position in sequence).
                        var g = d3.select("#guanmulin_BreadcrumbTrail")
                            .selectAll("g")
                            .data(nodeArray, function (d) {
                                return d.name + d.depth;
                            });

                        // Add breadcrumb and label for entering nodes.
                        var entering = g.enter().append("svg:g");

                        entering.append("svg:polygon")
                            .attr("points", breadcrumbPoints)
                            .style("fill", function (d) {
                                return colors(d.name);
                            });

                        entering.append("svg:text")
                            .attr("x", (b.w * 2 + b.t) / 2)
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function (d) {
                                return d.name;
                            });

                        // Set position for entering and updating nodes.
                        g.attr("transform", function (d, i) {
                            return "translate(" + i * (b.w * 2 + b.s) + ", 0)";
                        });

                        // Remove exiting nodes.
                        g.exit().remove();

                        // Now move and update the percentage at the end.
                        d3.select("#guanmulin_BreadcrumbTrail").select("#endlabel")
                            .attr("x", (nodeArray.length + 0.5) * (b.w * 2 + b.s))
                            .attr("y", b.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(percentageString);

                        // Make the breadcrumb trail visible, if it's hidden.
                        d3.select("#guanmulin_BreadcrumbTrail")
                            .style("visibility", "");

                    }

                    function drawLegend() {

                        // Dimensions of legend item: width, height, spacing, radius of rounded rect.
                        var li = {
                            w: 160, h: 30, s: 3, r: 3
                        };
                        var data_name=[];

                        for(var i=1;i<nodes.length;i++){
                            var j=0;
                            while(j<data_name.length){
                                if(nodes[i].name==data_name[j].name){
                                    break;
                                }
                                j++;
                            }
                            if(j==data_name.length){
                                data_name.push({
                                    name:nodes[i].name,
                                    area:nodes[i].area
                                })
                            }
                        };
                        var legend = d3.select("#guanmulin_legend").append("svg:svg")
                            .attr("width", li.w)
                            .attr("height", data_name.length * (li.h + li.s));

                        var g = legend.selectAll("g")
                            .data(data_name)
                            .enter().append("svg:g")
                            .attr("transform", function (d, i) {
                                return "translate(0," + i * (li.h + li.s) + ")";
                            });

                        g.append("svg:rect")
                            .attr("rx", li.r)
                            .attr("ry", li.r)
                            .attr("width", li.w)
                            .attr("height", li.h)
                            .style("fill", function (d) {
                                return d.area==0?'black': colors(d.name)
                            })
                            .on("mouseover", function () {
                                d3.select(this)
                                    .style("opacity", 0.5);

                            })
                            .on("mouseout", function () {
                                d3.select(this)
                                    .transition()
                                    .duration(100)
                                    .style("opacity", 1);
                            })
                        ;

                        g.append("svg:text")
                            .attr("x", li.w / 2)
                            .attr("y", li.h / 2)
                            .attr("dy", "0.35em")
                            .attr("text-anchor", "middle")
                            .text(function (d) {
                                return d.name;
                            });
                    }

                    function toggleLegend() {
                        var legend = d3.select("#guanmulin_legend");
                        if (legend.style("visibility") == "hidden") {
                            legend.style("visibility", "");
                        } else {
                            legend.style("visibility", "hidden");
                        }
                    }

                }
            })

        }
    });

    //林地结构现状t9
    $.ajax({
        url: '/forestresources/statistics/t9/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {

            var results = JSON.parse(res);

            if (results.length == 0) {//某些县没有林地面积统计数据
                document.getElementById("lindijiegouxianzhuang_nodata").style.visibility = "visible";
                document.getElementById("lindijiegouxianzhuang_data").style.display = "none";
                document.getElementById("lindijiegouxianzhuang_download").style.visibility = "hidden";
            } else {

                var sen_lin_lb=[];
                var qiyuan=[];
                var lindijiegouxianzhuang={
                    name:"林地现状统计",
                    children:results
                };

                //下载t9数据到excel表
                $(document).ready(function(){
                    $('#lindijiegouxianzhuang_download').click(function(){
                        var option={};

                        option.fileName = xzcname + "_" + lindijiegouxianzhuang.name;

                        var sen_lin_lb=[];
                        var qiyuan=[];


                        var i=0;

                        while(i<lindijiegouxianzhuang.children.length){
                            if(lindijiegouxianzhuang.children[i].area==0){
                                i++;
                                continue;
                            }else{
                                sen_lin_lb.push({
                                    name:lindijiegouxianzhuang.children[i].name,
                                    value:lindijiegouxianzhuang.children[i].area.toFixed(2)

                                });
                            }
                            if(lindijiegouxianzhuang.children[i].hasOwnProperty('children')) {
                                for (var j = 0; j < lindijiegouxianzhuang.children[i].children.length; j++) {
                                    if(lindijiegouxianzhuang.children[i].children[j].area==0){
                                        continue;
                                    }else{
                                        qiyuan.push({
                                            name: lindijiegouxianzhuang.children[i].name+"/"+lindijiegouxianzhuang.children[i].children[j].name,
                                            value: lindijiegouxianzhuang.children[i].children[j].area.toFixed(2)
                                        });
                                    }
                                }
                            };
                            i++;
                        }

                        option.datas=[
                            {
                                sheetData:sen_lin_lb,
                                sheetName:'森林类别',
                                sheetFilter:['name','value'],
                                sheetHeader:['森林类别','面积/公顷']
                            },
                            {
                                sheetData:qiyuan,
                                sheetName:'起源',
                                sheetFilter:['name','value'],
                                sheetHeader:['起源','面积/公顷']
                            }

                        ];
                        var toExcel=new ExportJsonExcel(option);
                        toExcel.saveExcel();
                    });
                });

                var i=0;

                while(i<lindijiegouxianzhuang.children.length){
                    sen_lin_lb.push({
                        name:lindijiegouxianzhuang.children[i].name,
                        value:lindijiegouxianzhuang.children[i].area.toFixed(2),
                        itemStyle:{
                            normal: {
                                label: {
                                    show: function () {
                                        if (lindijiegouxianzhuang.children[i].area == 0) {
                                            return false;
                                        }
                                    }(),
                                    position: "inner",
                                    formatter: "{b}",
                                    textStyle: {
                                        color: "#FFF",
                                        fontWeight: 'bold',
                                        fontSize: 15
                                    }
                                },
                                labelLine: {
                                    show: function () {
                                        if (lindijiegouxianzhuang.children[i].area == 0) {
                                            return false;
                                        }
                                    }()
                                }
                            }
                        }
                    });
                    if(lindijiegouxianzhuang.children[i].hasOwnProperty('children')){
                        for(var j=0;j<lindijiegouxianzhuang.children[i].children.length;j++){
                            qiyuan.push({
                                name:lindijiegouxianzhuang.children[i].name +"/" + lindijiegouxianzhuang.children[i].children[j].name,
                                value:lindijiegouxianzhuang.children[i].children[j].area.toFixed(2),
                                itemStyle:{
                                    normal: {
                                        label: {
                                            show: function () {
                                                if (lindijiegouxianzhuang.children[i].children[j].area == 0) {
                                                    return false;
                                                }
                                            }(),
                                            formatter: "{b}",
                                            textStyle: {
                                                fontWeight: 'normal',
                                                fontSize: 14
                                            }
                                        },
                                        labelLine: {
                                            show: function () {
                                                if (lindijiegouxianzhuang.children[i].children[j].area == 0) {
                                                    return false;
                                                }
                                            }()
                                        }
                                    }
                                }
                            });
                        }
                    }
                    i++;
                }


                var lindijiegouxianzhuangEchart = echarts.init(document.getElementById('lindijiegouxianzhuang_data'));
                lindijiegouxianzhuangEchart.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        textStyle:{
                            fontSize:14
                        },
                        data:['重点公益林地','一般公益林地','其他森林类别']

                    },
                    series: [
                        {
                            name: '林地类别:公顷',
                            type: 'pie',
                            radius: [0, '30%'],
                            center: ['50%', '50%'],
                            data: sen_lin_lb
                        },
                        {
                            name: '不同起源:公顷',
                            type: 'pie',
                            radius: ['40%', '55%'],
                            center: ['50%', '50%'],
                            data: qiyuan
                        }
                    ]
                });

            }

        }
    });

    //国家级公益林地分保护等级t10
    $.ajax({
        url: '/forestresources/statistics/t10/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {

            var results = JSON.parse(res);

            if (results.length == 0) {//某些县没有统计数据
                document.getElementById("guojiajigongyilin_nodata").style.visibility = "visible";
                document.getElementById("guojiajigongyilin_data").style.display = "none";
                document.getElementById("guojiajigongyilin_download").style.visibility = "hidden";
            } else {


                var guojiajigongyilin={
                    name:"国家级公益林地分保护等级",
                    children:results
                };

                //下载t3_1数据到excel表
                $(document).ready(function(){
                    $('#guojiajigongyilin_download').click(function(){
                        var option={};

                        option.fileName = xzcname + "_" + guojiajigongyilin.name;

                        var shiquandengji=[];
                        var baohudengji=[];
                        var qiyuan=[];

                        var i=0;

                        while(i<guojiajigongyilin.children.length){
                            if(guojiajigongyilin.children[i].area==0){
                                i++;
                                continue;
                            }else{
                                shiquandengji.push({
                                    name:guojiajigongyilin.children[i].name,
                                    value:guojiajigongyilin.children[i].area.toFixed(2)

                                });
                            }
                            if(guojiajigongyilin.children[i].hasOwnProperty('children')) {
                                for (var j = 0; j < guojiajigongyilin.children[i].children.length; j++) {
                                    if(guojiajigongyilin.children[i].children[j].area==0){
                                        continue;
                                    }else{
                                        baohudengji.push({
                                            name: guojiajigongyilin.children[i].name+"/"+guojiajigongyilin.children[i].children[j].name,
                                            value: guojiajigongyilin.children[i].children[j].area.toFixed(2)
                                        });
                                    }
                                    if (guojiajigongyilin.children[i].children[j].hasOwnProperty('children')) {
                                        for (var k = 0; k < guojiajigongyilin.children[i].children[j].children.length; k++) {
                                            if(guojiajigongyilin.children[i].children[j].children[k].area==0){
                                                continue;
                                            }else{
                                                qiyuan.push({
                                                    name: guojiajigongyilin.children[i].name+"/"+guojiajigongyilin.children[i].children[j].name + "/" + guojiajigongyilin.children[i].children[j].children[k].name,
                                                    value: guojiajigongyilin.children[i].children[j].children[k].area.toFixed(2)

                                                });
                                            }
                                        }
                                    }
                                }
                            };
                            i++;
                        }

                        option.datas=[
                            {
                                sheetData:shiquandengji,
                                sheetName:'事权等级',
                                sheetFilter:['name','value'],
                                sheetHeader:['事权等级','面积/公顷']
                            },
                            {
                                sheetData:baohudengji,
                                sheetName:'保护等级',
                                sheetFilter:['name','value'],
                                sheetHeader:['保护等级','面积/公顷']
                            },
                            {
                                sheetData:qiyuan,
                                sheetName:'起源',
                                sheetFilter:['name','value'],
                                sheetHeader:['起源','面积/公顷']
                            }


                        ];
                        var toExcel=new ExportJsonExcel(option);
                        toExcel.saveExcel();
                    });
                });

                var shiquandengji=[];
                var baohudengji=[];
                var qiyuan=[];
                var i=0;

                while(i<guojiajigongyilin.children.length){
                    shiquandengji.push({
                        name:guojiajigongyilin.children[i].name,
                        value:guojiajigongyilin.children[i].area.toFixed(2),
                        itemStyle:{
                            normal: {
                                label: {
                                    show: function () {
                                        if (guojiajigongyilin.children[i].area == 0) {
                                            return false;
                                        }
                                    }(),
                                    position: "center",
                                    formatter: "{b}",
                                    textStyle: {
                                        color: "#FFF",
                                        fontWeight: 'bold',
                                        fontSize: 15
                                    }
                                },
                                labelLine: {
                                    show: function () {
                                        if (guojiajigongyilin.children[i].area == 0) {
                                            return false;
                                        }
                                    }()
                                }
                            }
                        }
                    });
                    if(guojiajigongyilin.children[i].hasOwnProperty('children')) {
                        for (var j = 0; j < guojiajigongyilin.children[i].children.length; j++) {
                            baohudengji.push({
                                name: guojiajigongyilin.children[i].children[j].name,
                                value: guojiajigongyilin.children[i].children[j].area.toFixed(2),
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: function () {
                                                if (guojiajigongyilin.children[i].children[j].area == 0) {
                                                    return false;
                                                }
                                            }(),
                                            position: "inner",
                                            formatter: "{b}",
                                            textStyle: {
                                                fontWeight: 'normal',
                                                fontSize: 14
                                            }
                                        },
                                        labelLine: {
                                            show: function () {
                                                if (guojiajigongyilin.children[i].children[j].area == 0) {
                                                    return false;
                                                }
                                            }()
                                        }
                                    }
                                }
                            });
                            if (guojiajigongyilin.children[i].children[j].hasOwnProperty('children')) {
                                for (var k = 0; k < guojiajigongyilin.children[i].children[j].children.length; k++) {
                                    qiyuan.push({
                                        name: guojiajigongyilin.children[i].children[j].name + "/" + guojiajigongyilin.children[i].children[j].children[k].name,
                                        value: guojiajigongyilin.children[i].children[j].children[k].area.toFixed(2),
                                        itemStyle: {
                                            normal: {
                                                label: {
                                                    show: function () {
                                                        if (guojiajigongyilin.children[i].children[j].children[k].area == 0) {
                                                            return false;
                                                        }
                                                    }(),
                                                    formatter: "{b}",
                                                    textStyle: {
                                                        fontWeight: 'normal',
                                                        fontSize: 14
                                                    }
                                                },
                                                labelLine: {
                                                    show: function () {
                                                        if (guojiajigongyilin.children[i].children[j].children[k].area == 0) {
                                                            return false;
                                                        }
                                                    }()
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    };
                    i++;
                }



                var guojiajigongyilinEchart = echarts.init(document.getElementById('guojiajigongyilin_data'));
                guojiajigongyilinEchart.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        textStyle:{
                            fontSize:14
                        },
                        data:['国家公益林','一级保护','二级保护','三级保护']

                    },
                    series: [
                        {
                            name: '国家公益林:公顷',
                            type: 'pie',
                            radius: [0, '15%'],
                            center: ['50%', '45%'],
                            data: shiquandengji
                        },
                        {
                            name: '保护等级:公顷',
                            type: 'pie',
                            radius: ['20%', '35%'],
                            center: ['50%', '45%'],
                            data: baohudengji
                        },
                        {
                            name: '不同起源:公顷',
                            type: 'pie',
                            radius: ['45%', '60%'],
                            center: ['50%', '45%'],
                            data: qiyuan
                        }
                    ]
                });

            }

        }
    });

    //林地质量等级t11
    $.ajax({
        url: '/forestresources/statistics/t11/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {

            var results = JSON.parse(res);

            if (results.length == 0) {//某些县没有统计数据
                document.getElementById("lindizhiliang_nodata").style.visibility = "visible";
                document.getElementById("lindizhiliang_data").style.display = "none";
                document.getElementById("lindizhiliang_download").style.visibility = "hidden";
            } else{

                //下载t11数据到excel表
                $(document).ready(function(){
                    $('#lindizhiliang_download').click(function(){
                        var option={};

                        option.fileName = xzcname + "_" + "林地质量等级统计";
                        var zhiliangdengji=[];
                        for(var i=0;i<results.length;i++) {
                            zhiliangdengji.push({
                                name: results[i].name,
                                value: results[i].area.toFixed(2),
                            });
                        }

                        option.datas=[
                            {
                                sheetData:zhiliangdengji,
                                sheetName:'质量等级',
                                sheetFilter:['name','value'],
                                sheetHeader:['质量等级','面积/公顷']
                            }
                        ];
                        var toExcel=new ExportJsonExcel(option);
                        toExcel.saveExcel();
                    });
                });

                var lindizhiliang=[];

                for(var i=0;i<results.length;i++){
                    lindizhiliang.push({
                        name:results[i].name,
                        value:results[i].area.toFixed(2),
                        itemStyle: {
                            normal:{
                                label: {
                                    show: function () {
                                        if (lindizhiliang.area == 0) {
                                            return false;
                                        }
                                    }(),
                                    textStyle: {
                                        formatter: "{b}",
                                        fontWeight: 'normal',
                                        fontSize: 14
                                    }
                                },
                            },
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    })
                }



                var lindizhiliangEchart = echarts.init(document.getElementById('lindizhiliang_data'));
                lindizhiliangEchart.setOption({
                    tooltip : {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} 公顷 ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        textStyle:{
                            fontSize:14
                        },
                        data: ['I级','II级','III级','IV级','V级','无']
                    },
                    series:[
                        {
                            name: '林地质量等级',
                            type: 'pie',
                            radius : '50%',
                            center: ['50%', '40%'],
                            data: lindizhiliang

                        }
                    ]

                });

            }

        }
    });

    //林地保护等级t12
    $.ajax({
        url: '/forestresources/statistics/t12/' + xzcname,
        type: 'GET',
        dataType: 'text',
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('error message: ' + errorThrown.toString());
        },
        success: function (res) {

            var results = JSON.parse(res);

            if (results.length == 0) {//某些县没有统计数据
                document.getElementById("lindibaohudengji_nodata").style.visibility = "visible";
                document.getElementById("lindibaohudengji_data").style.display = "none";
                document.getElementById("lindibaohudengji_download").style.visibility = "hidden";
            } else{
                //下载t12数据到excel表
                $(document).ready(function(){
                    $('#lindibaohudengji_download').click(function(){
                        var option={};

                        option.fileName = xzcname + "_" + "林地保护等级统计";
                        var baohudengji=[];
                        for(var i=0;i<results.length;i++) {
                            baohudengji.push({
                                name: results[i].name,
                                value: results[i].area.toFixed(2),
                            });
                        }

                        option.datas=[
                            {
                                sheetData:baohudengji,
                                sheetName:'保护等级',
                                sheetFilter:['name','value'],
                                sheetHeader:['保护等级','面积/公顷']
                            }
                        ];
                        var toExcel=new ExportJsonExcel(option);
                        toExcel.saveExcel();
                    });
                });

                var lindibaohudengji=[];

                for(var i=0;i<results.length;i++){
                    lindibaohudengji.push({
                        name:results[i].name,
                        value:results[i].area.toFixed(2),
                        itemStyle: {
                            normal:{
                                label: {
                                    show: function () {
                                        if (lindibaohudengji.area == 0) {
                                            return false;
                                        }
                                    }(),
                                    textStyle: {
                                        formatter: "{b}",
                                        fontWeight: 'normal',
                                        fontSize: 14
                                    }
                                },
                            },
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    })
                }



                var lindibaohudengjiEchart = echarts.init(document.getElementById('lindibaohudengji_data'));
                lindibaohudengjiEchart.setOption({
                    tooltip : {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} 公顷 ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        textStyle:{
                            fontSize:14
                        },
                        data: ['一级保护','二级保护','三级保护','无']
                    },
                    series:[
                        {
                            name: '林地保护等级',
                            type: 'pie',
                            radius : '50%',
                            center: ['50%', '40%'],
                            data: lindibaohudengji

                        }
                    ]

                });

            }

        }
    });

})

