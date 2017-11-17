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
    $('#fugaimianji').css({
        'width': $('#barEchart').width(),
        'height': $('#tongji .column:nth-child(2) .item').outerHeight() * 2
    });

    var fugaimianjiEchart = echarts.init(document.getElementById('fugaimianji'));

    // 使用刚指定的配置项和数据显示图表。
    fugaimianjiEchart.setOption({
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
    });
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

            // Mapping of names to colors.
            var colors = {
                "国有林地": "#5687d1",
                "非国有林地": "#7b615c",
                "非林地": "#ded3c2",
                "重点公益林地": "#b95b36",
                "一般公益林地": "#a173d1",
                "其他": "#bbb42f",
                "乔木林": "#18bb08",
                "疏林地": "#bb904c",
                "苗圃地": "#bbb695",
                "国家特别规定灌木林地": "#6cbba8",
                "宜林荒山荒地": "#bb992e",
                "水域": "#0b2bbb",
                "牧草地": "#95bb5a",
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
                .attr("id", "tudimianji_container")
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

                initializeBreadcrumbTrail();
                drawLegend();
                d3.select("#tudimianji_togglelegend").on("click", toggleLegend);

                //Bounding circle underneath the sunburst, to make it easier to detect
                // when the mouse leaves the parent g.
                svg.append("svg:circle")
                    .attr("r", radius)
                    .style("opacity", 0);


                var nodes = partition.nodes(tudimianji)
                    .filter(function (d) {
                        return (d.dx > 0);
                    });

                var path = svg.data([tudimianji]).selectAll("path")
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

                d3.select("#tudimianji_percentage")
                    .text("总面积\n" + area_sum.toFixed(2) + "公顷");
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
                        .text(d.value.toFixed(2) + "\n" + percentageString);

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
                            return colors[d.name];
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

                    var legend = d3.select("#tudimianji_legend").append("svg:svg")
                        .attr("width", li.w)
                        .attr("height", d3.keys(colors).length * (li.h + li.s));

                    var g = legend.selectAll("g")
                        .data(d3.entries(colors))
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
                            return d.value;
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
                            return d.key;
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
            } else {
                function toFixed_1(arr) {
                    arr.forEach(function (value) {
                        value.area = value.area.toFixed(1);
                        value.stockvolume = value.stockvolume.toFixed(1);
                        if (value.hasOwnProperty('children')) {
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
                document.getElementById("linzhongxuji_nodata").style.visibility = "visible";
                document.getElementById("linzhongxuji_data").style.display = "none";
            } else {
                //林种面积统计
                d3.json('/forestresources/statistics/t3/' + xzcname, function (error, root) {

                    var linzhongmianji = {
                        "name": "林种面积统计",
                        "children": root
                    }
                    //console.log(linzhongmianji)
                    // Dimensions of sunburst.
                    var width = 300;
                    var height = 300;
                    var radius = Math.min(width, height) / 2;

                    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                    var b = {
                        w: 75, h: 30, s: 3, t: 10
                    };

                    // Mapping of names to colors.
                    var colors = {
                        "自然保护林": "#7399d1",
                        "水源涵养林": "#507b3a",
                        "水土保持林": "#ded3c2",
                        "乔木林": "#64b952",
                        "疏林地": "#d1c645",
                        "国家特别规定灌木林地": "#bb732c",
                        "幼龄林": "#86bb97",
                        "中龄林": "#30c889",
                        "近熟林": "#12bb8a",
                        "成熟林": "#03b7bb"
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

                    // Basic setup of page elements.
                    initializeBreadcrumbTrail();
                    drawLegend();
                    d3.select("#linzhongmianji_togglelegend").on("click", toggleLegend);

                    //Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    svg.append("svg:circle")
                        .attr("r", radius)
                        .style("opacity", 0);


                    var nodes = partition.nodes(linzhongmianji)
                        .filter(function (d) {
                            return (d.dx > 0);
                        });

                    var path = svg.data([linzhongmianji]).selectAll("path")
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
                            .text(d.value.toFixed(2) + "\n" + percentageString);

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
                                return colors[d.name];
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

                        var legend = d3.select("#linzhongmianji_legend").append("svg:svg")
                            .attr("width", li.w)
                            .attr("height", d3.keys(colors).length * (li.h + li.s));

                        var g = legend.selectAll("g")
                            .data(d3.entries(colors))
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
                                return d.value;
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
                                return d.key;
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
                }
                else {
                    //林种蓄积量统计
                    d3.json('/forestresources/statistics/t3/' + xzcname, function (error, root) {

                        var linzhongxuji = {
                            "name": "林种活立木蓄积量统计",
                            "children": root
                        }
                        // Dimensions of sunburst.
                        var width = 300;
                        var height = 300;
                        var radius = Math.min(width, height) / 2;

                        // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                        var b = {
                            w: 75, h: 30, s: 3, t: 10
                        };

                        // Mapping of names to colors.
                        var colors = {
                            "自然保护林": "#7399d1",
                            //"水源涵养林": "#507b3a",
                            "水土保持林": "#ded3c2",
                            "乔木林": "#64b952",
                            "疏林地": "#d1c645",
                            //"国家特别规定灌木林地": "#bb732c",
                            "幼龄林": "#86bb97",
                            "中龄林": "#30c889",
                            "近熟林": "#12bb8a",
                            "成熟林": "#03b7bb"
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

                        // Basic setup of page elements.
                        initializeBreadcrumbTrail();
                        drawLegend();
                        d3.select("#linzhongxuji_togglelegend").on("click", toggleLegend);

                        //Bounding circle underneath the sunburst, to make it easier to detect
                        // when the mouse leaves the parent g.
                        svg.append("svg:circle")
                            .attr("r", radius)
                            .style("opacity", 0);


                        var nodes = partition.nodes(linzhongxuji)
                            .filter(function (d) {
                                return (d.dx > 0);
                            });

                        var path = svg.data([linzhongxuji]).selectAll("path")
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
                                .text(d.value.toFixed(2) + "\n" + percentageString);

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
                                    return colors[d.name];
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

                            var legend = d3.select("#linzhongxuji_legend").append("svg:svg")
                                .attr("width", li.w)
                                .attr("height", d3.keys(colors).length * (li.h + li.s));

                            var g = legend.selectAll("g")
                                .data(d3.entries(colors))
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
                                    return d.value;
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
                                    return d.key;
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
                document.getElementById("qiaomulinxuji_nodata").style.visibility = "visible";
                document.getElementById("qiaomulinxuji_data").style.display = "none";
            } else {
                //面积统计
                d3.json('/forestresources/statistics/t4/' + xzcname, function (error, root) {

                    var qiaomulinmianji = {
                        "name": "乔木林面积统计",
                        "children": root
                    }

                    // Dimensions of sunburst.
                    var width = 300;
                    var height = 300;
                    var radius = Math.min(width, height) / 2;

                    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                    var b = {
                        w: 75, h: 30, s: 3, t: 10
                    };

                    // Mapping of names to colors.
                    var colors = {
                        "纯天然": "#7399d1",
                        "植苗": "#507b3a",
                        "青海云杉": "#ded3c2",
                        "柏树类": "#64b952",
                        "白桦": "#d1c645",
                        "其它灌木树种": "#bb732c",
                        "山杨": "#bb6fa9",
                        "青杨": "#8142bb",
                        "幼龄林": "#86bb97",
                        "中龄林": "#30c889",
                        "近熟林": "#12bb8a",
                        "成熟林": "#03b7bb"
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

                    // Basic setup of page elements.
                    initializeBreadcrumbTrail();
                    drawLegend();
                    d3.select("#qiaomulinmianji_togglelegend").on("click", toggleLegend);

                    //Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    svg.append("svg:circle")
                        .attr("r", radius)
                        .style("opacity", 0);


                    var nodes = partition.nodes(qiaomulinmianji)
                        .filter(function (d) {
                            return (d.dx > 0);
                        });

                    var path = svg.data([qiaomulinmianji]).selectAll("path")
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
                            .text(d.value.toFixed(2) + "\n" + percentageString);

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
                                return colors[d.name];
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

                        var legend = d3.select("#qiaomulinmianji_legend").append("svg:svg")
                            .attr("width", li.w)
                            .attr("height", d3.keys(colors).length * (li.h + li.s));

                        var g = legend.selectAll("g")
                            .data(d3.entries(colors))
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
                                return d.value;
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
                                return d.key;
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
                }
                else {
                    //蓄积量统计
                    d3.json('/forestresources/statistics/t4/' + xzcname, function (error, root) {

                        var qiaomulinxuji = {
                            "name": "林种活立木蓄积量统计",
                            "children": root
                        }
                        // Dimensions of sunburst.
                        var width = 300;
                        var height = 300;
                        var radius = Math.min(width, height) / 2;

                        // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                        var b = {
                            w: 75, h: 30, s: 3, t: 10
                        };

                        // Mapping of names to colors.
                        var colors = {
                            "纯天然": "#7399d1",
                            "植苗": "#507b3a",
                            "青海云杉": "#ded3c2",
                            "柏树类": "#64b952",
                            "白桦": "#d1c645",
                            "其它灌木树种": "#bb732c",
                            "山杨": "#bb6fa9",
                            "青杨": "#8142bb",
                            "幼龄林": "#86bb97",
                            "中龄林": "#30c889",
                            "近熟林": "#12bb8a",
                            "成熟林": "#03b7bb"
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

                        // Basic setup of page elements.
                        initializeBreadcrumbTrail();
                        drawLegend();
                        d3.select("#qiaomulinxuji_togglelegend").on("click", toggleLegend);

                        //Bounding circle underneath the sunburst, to make it easier to detect
                        // when the mouse leaves the parent g.
                        svg.append("svg:circle")
                            .attr("r", radius)
                            .style("opacity", 0);


                        var nodes = partition.nodes(qiaomulinxuji)
                            .filter(function (d) {
                                return (d.dx > 0);
                            });

                        var path = svg.data([qiaomulinxuji]).selectAll("path")
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
                                .text(d.value.toFixed(2) + "\n" + percentageString);

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
                                    return colors[d.name];
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

                            var legend = d3.select("#qiaomulinxuji_legend").append("svg:svg")
                                .attr("width", li.w)
                                .attr("height", d3.keys(colors).length * (li.h + li.s));

                            var g = legend.selectAll("g")
                                .data(d3.entries(colors))
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
                                    return d.value;
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
                                    return d.key;
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
                } else {
                    var width = 500;
                    var height = 500;
                    var radius = Math.min(width, height) / 2;

                    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                    var b = {
                        w: 75, h: 30, s: 3, t: 10
                    };

                    // Mapping of names to colors.
                    var colors = {
                        "国家公益林": "#5687d1",
                        "地方公益林": "#7b615c",
                        "退耕还林工程": "#ded3c2",
                        "其他林业工程": "#b95b36",
                        "其他": "#a173d1",
                        "一级保护": "#bbb42f",
                        "二级保护": "#18bb08",
                        "三级保护": "#8abbba",
                        "乔木林": "#bbb695",
                        "疏林地": "#6cbba8",
                        "国家特别规定灌木林地": "#bb992e",
                        "宜林荒山荒地": "#95bb5a",
                        "苗圃地": "#bb7037"
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
                    }

                    var shengtaigongyilin = {
                        "name": "生态公益林面积统计",
                        "children": root
                    }

                    initializeBreadcrumbTrail();
                    drawLegend();
                    d3.select("#shengtaigongyilin_togglelegend").on("click", toggleLegend);

                    //Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    svg.append("svg:circle")
                        .attr("r", radius)
                        .style("opacity", 0);


                    var nodes = partition.nodes(shengtaigongyilin)
                        .filter(function (d) {
                            return (d.dx > 0);
                        });

                    var path = svg.data([shengtaigongyilin]).selectAll("path")
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
                            .text(d.value.toFixed(2) + "\n" + percentageString);

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
                                return colors[d.name];
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

                        var legend = d3.select("#shengtaigongyilin_legend").append("svg:svg")
                            .attr("width", li.w)
                            .attr("height", d3.keys(colors).length * (li.h + li.s));

                        var g = legend.selectAll("g")
                            .data(d3.entries(colors))
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
                                return d.value;
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
                                return d.key;
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
                } else {
                    var width = 500;
                    var height = 500;
                    var radius = Math.min(width, height) / 2;

                    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
                    var b = {
                        w: 75, h: 30, s: 3, t: 10
                    };

                    // Mapping of names to colors.
                    var scale=d3.scale.category20c();
                    console.log(scale);
                    var colors = {
                        "纯天然":scale(0),
                        "国家特别规定灌木林地":scale(1),
                        "沙棘":scale(2),
                        "山生柳":scale(3),
                        "金露梅":scale(4),
                        "杜鹃":scale(5),
                        "梭梭":scale(6),
                        "其它灌木树种":scale(7),
                        "其它柳类灌木":scale(8),
                        "疏":scale(9),
                        "中":scale(10),
                        "密":scale(11)
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
                    }

                    var guanmulin = {
                        "name": "灌木林面积统计",
                        "children": root
                    }

                    initializeBreadcrumbTrail();
                    drawLegend();
                    d3.select("#guanmulin_togglelegend").on("click", toggleLegend);

                    //Bounding circle underneath the sunburst, to make it easier to detect
                    // when the mouse leaves the parent g.
                    svg.append("svg:circle")
                        .attr("r", radius)
                        .style("opacity", 0);


                    var nodes = partition.nodes(guanmulin)
                        .filter(function (d) {
                            return (d.dx > 0);
                        });

                    var path = svg.data([guanmulin]).selectAll("path")
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
                            .text(d.value.toFixed(2) + "\n" + percentageString);

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
                                return colors[d.name];
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

                        var legend = d3.select("#guanmulin_legend").append("svg:svg")
                            .attr("width", li.w)
                            .attr("height", d3.keys(colors).length * (li.h + li.s));

                        var g = legend.selectAll("g")
                            .data(d3.entries(colors))
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
                                return d.value;
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
                                return d.key;
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
            } else {

                var sen_lin_lb=[];
                var qiyuan=[];
                var lindijiegouxianzhuang={
                    name:"林地现状统计",
                    children:results
                };

                var i=0;

                while(i<lindijiegouxianzhuang.children.length){
                    sen_lin_lb.push({
                        name:lindijiegouxianzhuang.children[i].name,
                        value:lindijiegouxianzhuang.children[i].area,
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
                                value:lindijiegouxianzhuang.children[i].children[j].area,
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

                console.log(sen_lin_lb);
                console.log(qiyuan);



                var lindijiegouxianzhuangEchart = echarts.init(document.getElementById('lindijiegouxianzhuang_data'));
                lindijiegouxianzhuangEchart.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data:['重点公益林地','一般公益林地','其他类别']/*'重点公益林地/纯天然','重点公益林地/植苗','重点公益林地/其他起源',
                            '一般公益林地/纯天然','一般公益林地/植苗','一般公益林地/其他起源','其他类别/纯天然','其他类别/植苗','其他类别/其他起源'*/
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

})

