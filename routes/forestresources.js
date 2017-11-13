/**
 * Created by hwt on 2017/5/24.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

//psql package import
var pg = require("pg");

var pool=require('./db');


var conString = "tcp://maqin:maqin_geo@localhost:5432/maqin";
//var conString = "tcp://visitor:geo_123@192.168.224.216:5432/maqin";

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
router.get('/map',function(req,res,next){
    //res.send('respond with forestresouces-map');
    res.sendFile(path.join(__dirname,'../public/pages','forestresources-map.html'));
});
router.get('/statistics',function(req,res,next){
    res.sendFile(path.join(__dirname,'../public/pages','forestresources-statistics.html'));
});
router.get('/test',function(req,res,next){

});
router.get('/map/xbm/:gid',function(req,res){
    pool.query(
        'select * from maqinxiandataedit where gid=$1::int',
        [req.params.gid],
        function(err,result){
            if(err){
                return console.error('error running query',err);
            }
            res.send(result.rows);
    });
});

router.get('/map/search/:id',function(req,res,next){

    if(req.params.id.length>5){
        var xzcname = req.params.id.split('L')[0];
        var linbanid = req.params.id.split('L')[1];
        console.log(xzcname,linbanid);
        pool.query(
            "select distinct(xiaoban) from maqinxiandataedit " +
            "where xiang = $1::text and linban = $2::text order by xiaoban asc",
            [xzcname,linbanid],
            function(err,result){
                if(err){
                    return console.error('error running query',err);
                }
                res.send(result.rows);
            }
        );
    }else{
       pool.query(
           "select distinct(linban) from maqinxiandataedit" +
           " where xiang = $1::text order by linban asc",
           [req.params.id],
           function(err,result){
               if(err){
                   return console.error('error running query',err);
               }
               res.send(result.rows);
           }
       );
    }
});

//各类土地面积统计
router.get('/statistics/t1/:xzc',function(req,res,next){

    var merge = function(obj,singleresultObj){
        obj.forEach(function(value){
            if(value.name===singleresultObj.name){
                value.size=value.size+singleresultObj.size;
                if(value.hasOwnProperty('children')&&singleresultObj.hasOwnProperty('children')) {
                    merge(value['children'], singleresultObj['children'][0]);
                }
                return true;
            }
        });
    };
    var fieldName={
        "ld_qs":['非国有林地','国有林地','非林地'],
        "sen_lin_lb":['重点公益林地','一般公益林地','其他'],
        "dilei":['苗圃地','乔木林','国家特别规定灌木林地','宜林荒山荒地','疏林地','水域','未利用地','牧草地','耕地','建设用地']
    };
    var area_tudi=function(fieldName){
        var area_tudi=[];
        for(var i=0;i<fieldName.ld_qs.length;i++){
            area_tudi[i]={
                name:fieldName.ld_qs[i],
                children:[]
            };
            for(var j=0;j<fieldName.sen_lin_lb.length;j++){
                area_tudi[i].children[j]={
                    name:fieldName.sen_lin_lb[j],
                    children:[]
                };
                for(var k=0;k<fieldName.dilei.length;k++){
                    area_tudi[i].children[j].children[k]={
                        size:0,
                        name:fieldName.dilei[k]
                    }
                }
            }
        }
        return area_tudi;
    }(fieldName);
    if(req.params.xzc==="玛沁县"){
        pool.query(
            'select dilei,ld_qs,sen_lin_lb,sum(mianji) as area ' +
            'from maqinxiandataedit ' +
            'group by dilei,ld_qs,sen_lin_lb',
            function(err,result){
                if(err){
                    return console.error('error running query',err);
                }
                var resultObj =[];

                var queryResult=result.rows;
                queryResult.forEach(function(value){
                    if(value.ld_qs=='没有进行集体林权制度改革的林地，或无法确定经营权的林地'){
                        value.ld_qs='非国有林地';
                    }
                    if(value.ld_qs==''){
                        value.ld_qs='非林地';
                    }
                    if(value.sen_lin_lb==''){
                        value.sen_lin_lb='其他';
                    }
                    resultObj.push({
                        name:value.ld_qs,
                        children:[
                            {
                                name:value.sen_lin_lb,
                                children:[
                                    {
                                        name:value.dilei,
                                        size:value.area
                                    }
                                ]
                            }
                        ]
                    })
                });
                resultObj.forEach(function(singleresultObj){
                    merge(area_tudi,singleresultObj);
                });

                function toFixed_1(area_tudi){
                    area_tudi.forEach(function(value){
                        if(value.hasOwnProperty('children')){
                            toFixed_1(value['children']);
                        }
                    });
                }
                toFixed_1(area_tudi);
                var results={
                    "name": "林地面积统计",
                    "children": area_tudi
                }
                res.send(results);
            }
        );
    }else{
        pool.query(
            'select dilei,ld_qs,sen_lin_lb,sum(mianji) as area '+
            'from maqinxiandataedit where xiang=$1::text ' +
            'group by dilei,ld_qs,sen_lin_lb',[req.params.xzc],
            function(err,result){
                if(err){
                    return console.error('error running query',err);
                }
                var resultObj =[];

                var queryResult=result.rows;
                queryResult.forEach(function(value,index,arr){
                    if(value.ld_qs=='没有进行集体林权制度改革的林地，或无法确定经营权的林地'){
                        value.ld_qs='非国有林地';
                    }
                    if(value.ld_qs==''){
                        value.ld_qs='非林地';
                    }
                    if(value.sen_lin_lb==''){
                        value.sen_lin_lb='其他';
                    }
                    resultObj.push({
                        name:value.ld_qs,
                        children:[
                            {
                                name:value.sen_lin_lb,
                                children:[
                                    {
                                        name:value.dilei,
                                        size:value.area
                                    }
                                ]
                            }
                        ]
                    })
                });
                resultObj.forEach(function(singleresultObj){
                    merge(area_tudi,singleresultObj);
                });

                function toFixed_1(area_tudi){
                    area_tudi.forEach(function(value){
                        if(value.hasOwnProperty('children')){
                            toFixed_1(value['children']);
                        }
                    });
                }
                toFixed_1(area_tudi);
                var results={
                    "name": "林地面积统计",
                    "children": area_tudi
                }
                res.send(results);
            }
        );
    }

});

//森林林木面积蓄积t2
router.get('/statistics/t2/:xzc',function(req,res,next){

    var merge = function(obj,singleresultObj){
        obj.forEach(function(value){
            if(value.name===singleresultObj.name){
                value.area=value.area+singleresultObj.area;
                value.stockvolume=value.stockvolume+singleresultObj.stockvolume;
                if(value.hasOwnProperty('children')&&singleresultObj.hasOwnProperty('children')) {
                    merge(value['children'], singleresultObj['children'][0]);
                }
                return true;
            }
        });
    };
    var fieldName={
        "ld_qs":['国有林地'],
        "dilei":['乔木林','疏林地']
    };
    var senlinlinmu=function(fieldName){
        var senlinlinmu=[];
        for(var i=0;i<fieldName.ld_qs.length;i++){
            senlinlinmu[i]={
                area:0,
                stockvolume:0,
                name:fieldName.ld_qs[i],
                children:[]
            };
            for(var j=0;j<fieldName.dilei.length;j++){
                senlinlinmu[i].children[j]={
                    area:0,
                    stockvolume:0,
                    name:fieldName.dilei[j]
                };
            }
        }
        return senlinlinmu;
    }(fieldName);
    if(req.params.xzc==="玛沁县"){
        pool.query("select ld_qs,dilei,sum(mianji) as area,sum(huo_lmgqxj*mianji) as stockvolume" +
            " from maqinxiandataedit where dilei='乔木林' or dilei='疏林地'" +
            " group by ld_qs,dilei",function(err,result){
            if(err){
                console.error("error running query ",err);
            }
            var resultObj =[];

            var queryResult=result.rows;
            console.log(queryResult);
            queryResult.forEach(function(value){
                resultObj.push({
                    name:value.ld_qs,
                    area:value.area,
                    stockvolume:value.stockvolume,
                    children:[
                        {
                            name:value.dilei,
                            area:value.area,
                            stockvolume:value.stockvolume
                        }
                    ]
                })
            });
            resultObj.forEach(function(singleresultObj){
                merge(senlinlinmu,singleresultObj);
            });
            res.send(senlinlinmu);
        });
    }else{
        pool.query("select ld_qs,dilei,sum(mianji) as area,sum(huo_lmgqxj*mianji) as stockvolume" +
            " from maqinxiandataedit where (dilei='乔木林' or dilei='疏林地') and xiang=$1::text" +
            " group by ld_qs,dilei",[req.params.xzc],function(err,result){
            if(err){
                console.error("error running query ",err);
            }
            var resultObj =[];

            var queryResult=result.rows;
            if(queryResult.length===0){
                res.send('[]');
            }else{
                queryResult.forEach(function(value){
                    resultObj.push({
                        name:value.ld_qs,
                        area:value.area,
                        stockvolume:value.stockvolume,
                        children:[
                            {
                                name:value.dilei,
                                area:value.area,
                                stockvolume:value.stockvolume
                            }
                        ]
                    })
                });
                resultObj.forEach(function(singleresultObj){
                    merge(senlinlinmu,singleresultObj);
                });
                res.send(senlinlinmu);
            }

        });
    }
});


//林种统计t3
router.get('/statistics/t3/:xzc',function(req,res,next){

    var merge = function(obj,singleresultObj){
        obj.forEach(function(value){
            if(value.name===singleresultObj.name){
                value.area=value.area+singleresultObj.area;
                value.stockvolume=value.stockvolume+singleresultObj.stockvolume;
                if(value.hasOwnProperty('children')&&singleresultObj.hasOwnProperty('children')) {
                    merge(value['children'], singleresultObj['children'][0]);
                }
                return true;
            }
        });
    };
    var linzu={
        "0":"国家特别规定灌木林地",
        "1":"幼龄林",
        "2":"中龄林",
        "3":"近熟林",
        "4":"成熟林",
        "5":"过熟林"
    };
    var fieldName={
        "linzhong":['水土保持林','水源涵养林','自然保护林'],
        "dilei":['乔木林','疏林地','国家特别规定灌木林地'],
        "linzu":['国家特别规定灌木林地','幼龄林','中龄林','近熟林','成熟林','过熟林']
    };
    var linzhong=function(fieldName){
        var linzhong=[];
        for(var i=0;i<fieldName.linzhong.length;i++){
            linzhong[i]={
                area:0,
                stockvolume:0,
                name:fieldName.linzhong[i],
                children:[]
            };
            for(var j=0;j<fieldName.dilei.length;j++){
                linzhong[i].children[j]={
                    area:0,
                    stockvolume:0,
                    name:fieldName.dilei[j],
                    children:[]
                };
                for(var k=0;k<fieldName.linzu.length;k++){
                    linzhong[i].children[j].children[k]={
                        area:0,
                        stockvolume:0,
                        name:fieldName.linzu[k],
                    }
                }
            }
        }
        return linzhong;
    }(fieldName);
    if(req.params.xzc==="玛沁县"){
        pool.query("select linzhong,dilei,linzu,sum(mianji) as area,sum(huo_lmgqxj*mianji) as stockvolume " +
            "from maqinxiandataedit " +
            "where dilei='乔木林' or dilei='疏林地' or dilei='国家特别规定灌木林地'" +
            "group by linzhong,dilei,linzu",
            function(err,result){
                if(err){
                    console.error("error running query ",err);
                }
                var resultObj =[];

                var queryResult=result.rows;
                if(queryResult.length===0){
                    res.send('[]');
                }else{
                    queryResult.forEach(function(value){
                        if(value.linzu==''){
                            value.linzu="0";
                        }
                        resultObj.push({
                            name:value.linzhong,
                            area:value.area,
                            stockvolume:value.stockvolume,
                            children:[{
                                name:value.dilei,
                                area:value.area,
                                stockvolume:value.stockvolume,
                                children:[{
                                    name:linzu[value.linzu],
                                    area:value.area,
                                    stockvolume:value.stockvolume
                                }]
                            }]
                        })
                    });
                    resultObj.forEach(function(singleresultObj){
                        merge(linzhong,singleresultObj);
                    });
                    res.send(linzhong);
                }
        });
    }else{
        pool.query("select linzhong,dilei,linzu,sum(mianji) as area,sum(huo_lmgqxj*mianji) as stockvolume " +
            "from maqinxiandataedit " +
            "where (dilei='乔木林' or dilei='疏林地' or dilei='国家特别规定灌木林地') and xiang=$1::text " +
            "group by linzhong, dilei, linzu",[req.params.xzc],
            function(err,result){
                if(err){
                    console.error("error running query ",err);
                }
                var resultObj =[];

                var queryResult=result.rows;
                if(queryResult.length===0){
                    res.send('[]');
                }else{
                    queryResult.forEach(function(value){
                        resultObj.push({
                            name:value.linzhong,
                            area:value.area,
                            stockvolume:value.stockvolume,
                            children:[{
                                name:value.dilei,
                                area:value.area,
                                stockvolume:value.stockvolume,
                                children:[{
                                    name:linzu[value.linzu],
                                    area:value.area,
                                    stockvolume:value.stockvolume
                                }]
                            }]
                        })
                    });
                    resultObj.forEach(function(singleresultObj){
                        merge(linzhong,singleresultObj);
                    });
                    res.send(linzhong);
                }
            });
    }
});
router.get('/statistics/t4/:xzc',function(req,res,next){
    var client = new pg.Client(conString);
    client.connect(function(err,result){
        if(err){
            console.log(err.message);
        }
    });
    if(req.params.xzc==="玛沁县"){
        var query =  client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select qiyuan,youshishuzhong,dilei,linzu,sum(mianji) as aera,sum(huo_lmgqxj*mianji) as hlmxj " +
            "from maqinxiandataedit where dilei='乔木林'" +
            "group by qiyuan,youshishuzhong,dilei,linzu) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }else{
        var query = client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select qiyuan,youshishuzhong,dilei,linzu,sum(mianji) as aera,sum(huo_lmgqxj*mianji) as hlmxj " +
            "from maqinxiandataedit where dilei='乔木林' and xiang='" +req.params.xzc+
            "' group by qiyuan,youshishuzhong,dilei,linzu) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }
});
router.get('/statistics/t5/:xzc',function(req,res,next){
    var client = new pg.Client(conString);
    client.connect(function(err,result){
        if(err){
            console.log(err.message);
        }
    });
    if(req.params.xzc==="玛沁县"){
        var query =  client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select dilei,g_cheng_lb,shiquandengji,gjgongyilinbaohudengji,sum(mianji) as aera " +
            "from maqinxiandataedit where shiquandengji!=''" +
            "group by dilei,g_cheng_lb,shiquandengji,gjgongyilinbaohudengji) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }else{
        var query = client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select dilei,g_cheng_lb,shiquandengji,gjgongyilinbaohudengji,sum(mianji) as aera " +
            "from maqinxiandataedit where shiquandengji!='' and xiang='" +req.params.xzc+
            "' group by dilei,g_cheng_lb,shiquandengji,gjgongyilinbaohudengji) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }
});
router.get('/statistics/t6/:xzc',function(req,res,next){
    var client = new pg.Client(conString);
    client.connect(function(err,result){
        if(err){
            console.log(err.message);
        }
    });
    if(req.params.xzc==="玛沁县"){
        var query =  client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select dilei,ld_qs,qiyuan,youshishuzhong,sum(mianji) as aera " +
            "from maqinxiandataedit where dilei='国家特别规定灌木林地'" +
            "group by dilei,ld_qs,qiyuan,youshishuzhong) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }else{
        var query = client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select dilei,ld_qs,qiyuan,youshishuzhong,sum(mianji) as aera " +
            "from maqinxiandataedit where dilei='国家特别规定灌木林地' and xiang='" +req.params.xzc+
            "' group by dilei,ld_qs,qiyuan,youshishuzhong) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }
});
router.get('/statistics/t9/:xzc',function(req,res,next){
    var client = new pg.Client(conString);
    client.connect(function(err,result){
        if(err){
            console.log(err.message);
        }
    });
    if(req.params.xzc==="玛沁县"){
        var query =  client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select dilei,qiyuan,sen_lin_lb,linzhong,sum(mianji) as aera " +
            "from maqinxiandataedit where sen_lin_lb=''" +
            "group by dilei,qiyuan,sen_lin_lb,linzhong) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }else{
        var query = client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select dilei,qiyuan,sen_lin_lb,linzhong,sum(mianji) as aera " +
            "from maqinxiandataedit where sen_lin_lb='' and xiang='" +req.params.xzc+
            "' group by dilei,qiyuan,sen_lin_lb,linzhong) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }
});
router.get('/statistics/t10/:xzc',function(req,res,next){
    var client = new pg.Client(conString);
    client.connect(function(err,result){
        if(err){
            console.log(err.message);
        }
    });
    if(req.params.xzc==="玛沁县"){
        var query =  client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select qiyuan,baohudengji,dilei,shiquandengji,linzhong,sum(mianji) as aera " +
            "from maqinxiandataedit where baohudengji!=''" +
            "group by qiyuan,baohudengji,dilei,shiquandengji,linzhong) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }else{
        var query = client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select qiyuan,baohudengji,dilei,shiquandengji,linzhong,sum(mianji) as aera " +
            "from maqinxiandataedit where baohudengji!='' and xiang='" +req.params.xzc+
            "' group by qiyuan,baohudengji,dilei,shiquandengji,linzhong) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }
});
router.get('/statistics/t11/:xzc',function(req,res,next){
    var client = new pg.Client(conString);
    client.connect(function(err,result){
        if(err){
            console.log(err.message);
        }
    });
    if(req.params.xzc==="玛沁县"){
        var query =  client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select zl_dj,sum(mianji) as aera " +
            "from maqinxiandataedit where zl_dj!=''" +
            "group by zl_dj) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }else{
        var query = client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select zl_dj,sum(mianji) as aera " +
            "from maqinxiandataedit where zl_dj!='' and xiang='" +req.params.xzc+
            "' group by zl_dj) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }
});
router.get('/statistics/t12/:xzc',function(req,res,next){
    var client = new pg.Client(conString);
    client.connect(function(err,result){
        if(err){
            console.log(err.message);
        }
    });
    if(req.params.xzc==="玛沁县"){
        var query =  client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select baohudengji,sum(mianji) as aera " +
            "from maqinxiandataedit where baohudengji!=''" +
            "group by baohudengji) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }else{
        var query = client.query("select array_to_json(array_agg(row_to_json(t)))" +
            "from (select baohudengji,sum(mianji) as aera " +
            "from maqinxiandataedit where baohudengji!='' and xiang='" +req.params.xzc+
            "' group by baohudengji) t;");
        query.on('row',function(row,result){
            result.addRow(row);
        });
        query.on('end',function(result){
            res.send(result.rows[0]);
            res.end();
        });
    }
});
module.exports = router;