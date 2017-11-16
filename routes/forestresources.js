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
                value.area=value.area+singleresultObj.area;
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
                area:0,
                name:fieldName.ld_qs[i],
                children:[]
            };
            for(var j=0;j<fieldName.sen_lin_lb.length;j++){
                area_tudi[i].children[j]={
                    area:0,
                    name:fieldName.sen_lin_lb[j],
                    children:[]
                };
                for(var k=0;k<fieldName.dilei.length;k++){
                    area_tudi[i].children[j].children[k]={
                        area:0,
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
                        area:value.area,
                        children:[
                            {
                                name:value.sen_lin_lb,
                                area:value.area,
                                children:[
                                    {
                                        name:value.dilei,
                                        area:value.area
                                    }
                                ]
                            }
                        ]
                    })
                });
                resultObj.forEach(function(singleresultObj){
                    merge(area_tudi,singleresultObj);
                });

                res.send(area_tudi);
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
                        area:value.area,
                        children:[
                            {
                                name:value.sen_lin_lb,
                                area:value.area,
                                children:[
                                    {
                                        name:value.dilei,
                                        area:value.area
                                    }
                                ]
                            }
                        ]
                    })
                });
                resultObj.forEach(function(singleresultObj){
                    merge(area_tudi,singleresultObj);
                });

                res.send(area_tudi);
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
                stockvolume:0,                name:fieldName.ld_qs[i],
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
    };
    var fieldName={
        "linzhong":['水土保持林','水源涵养林','自然保护林'],
        "dilei":['乔木林','疏林地','国家特别规定灌木林地'],
        "linzu":['国家特别规定灌木林地','幼龄林','中龄林','近熟林','成熟林']
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
                if(queryResult.length==0){
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
                    queryResult.forEach(function (value) {
                        if (value.linzu == '') {
                            value.linzu = "0";
                        }
                        resultObj.push({
                            name: value.linzhong,
                            area: value.area,
                            stockvolume: value.stockvolume,
                            children: [{
                                name: value.dilei,
                                area: value.area,
                                stockvolume: value.stockvolume,
                                children: [{
                                    name: linzu[value.linzu],
                                    area: value.area,
                                    stockvolume: value.stockvolume
                                }]
                            }]
                        })
                    });
                    resultObj.forEach(function (singleresultObj) {
                        merge(linzhong, singleresultObj);
                    });

                    res.send(linzhong);
                }
            });
    }
});

//乔木林面积蓄积按龄组t4
router.get('/statistics/t4/:xzc',function(req,res,next){

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
        "1":"幼龄林",
        "2":"中龄林",
        "3":"近熟林",
        "4":"成熟林"
    };
    var fieldName={
        "qiyuan":['纯天然','植苗'],
        "youshishuzhong":['青海云杉','柏树类','白桦','其它灌木树种','山杨','青杨'],
        "linzu":['幼龄林','中龄林','近熟林','成熟林']
    };

    var qiaomulin=function(fieldName){
        var qiaomulin=[];
        for(var i=0;i<fieldName.qiyuan.length;i++){
            qiaomulin[i]={
                area:0,
                stockvolume:0,
                name:fieldName.qiyuan[i],
                children:[]
            };
            for(var j=0;j<fieldName.youshishuzhong.length;j++){
                qiaomulin[i].children[j]={
                    area:0,
                    stockvolume:0,
                    name:fieldName.youshishuzhong[j],
                    children:[]
                };
                for(var k=0;k<fieldName.linzu.length;k++){
                    qiaomulin[i].children[j].children[k]={
                        area:0,
                        stockvolume:0,
                        name:fieldName.linzu[k]
                    }
                }
            }
        }
        return qiaomulin;
    }(fieldName);

    if(req.params.xzc==="玛沁县"){
        pool.query("select qiyuan,youshishuzhong,linzu,sum(mianji) as area,sum(huo_lmgqxj*mianji) as stockvolume " +
            "from maqinxiandataedit where dilei='乔木林'" +
            "group by qiyuan,youshishuzhong,linzu",
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
                        name:value.qiyuan,
                        area:value.area,
                        stockvolume:value.stockvolume,
                        children:[{
                            name:value.youshishuzhong,
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
                    merge(qiaomulin,singleresultObj);
                });
                res.send(qiaomulin);
            }
        });
    }else{
        pool.query("select qiyuan,youshishuzhong,linzu,sum(mianji) as area,sum(huo_lmgqxj*mianji) as stockvolume " +
            "from maqinxiandataedit " +
            "where dilei='乔木林' and xiang=$1::text " +
            "group by qiyuan, youshishuzhong, linzu",[req.params.xzc],
            function(err,result){
                if(err){
                    console.error("error running query ",err);
                }
                var resultObj =[];

                var queryResult=result.rows;
                if(queryResult.length===0){
                    res.send('[]');
                }else{
                    queryResult.forEach(function (value) {
                        resultObj.push({
                            name: value.qiyuan,
                            area: value.area,
                            stockvolume: value.stockvolume,
                            children: [{
                                name: value.youshishuzhong,
                                area: value.area,
                                stockvolume: value.stockvolume,
                                children: [{
                                    name: linzu[value.linzu],
                                    area: value.area,
                                    stockvolume: value.stockvolume
                                }]
                            }]
                        })
                    });
                    resultObj.forEach(function (singleresultObj) {
                        merge(qiaomulin, singleresultObj);
                    });

                    res.send(qiaomulin);
                }
            });
    }

});

//生态公益林t5
router.get('/statistics/t5/:xzc',function(req,res,next){
    var merge = function(obj,singleresultObj){
        obj.forEach(function(value){
            if(value.name===singleresultObj.name){
                value.area=value.area+singleresultObj.area;
                if(value.hasOwnProperty('children')&&singleresultObj.hasOwnProperty('children')) {
                    merge(value['children'], singleresultObj['children'][0]);
                }
                return true;
            }
        });
    };

    var fieldName={
        "shiquandengji":['国家公益林','地方公益林'],
        "g_cheng_lb":['退耕还林工程','其他林业工程','其他'],
        "baohudengji":['一级保护','二级保护','三级保护'],
        "dilei":['乔木林','疏林地','国家特别规定灌木林地','宜林荒山荒地','苗圃地']
    };

    var shengtaigongyilin=function(fieldName){
        var shengtaigongyilin=[];
        for(var i=0;i<fieldName.shiquandengji.length;i++){
            shengtaigongyilin[i]={
                area:0,
                name:fieldName.shiquandengji[i],
                children:[]
            };
            for(var j=0;j<fieldName.g_cheng_lb.length;j++){
                shengtaigongyilin[i].children[j]={
                    area:0,
                    name:fieldName.g_cheng_lb[j],
                    children:[]
                };
                for(var k=0;k<fieldName.baohudengji.length;k++){
                    shengtaigongyilin[i].children[j].children[k]={
                        area:0,
                        name:fieldName.baohudengji[k],
                        children:[]
                    };
                    for(var m=0;m<fieldName.dilei.length;m++){
                        shengtaigongyilin[i].children[j].children[k].children[m]={
                            area:0,
                            name:fieldName.dilei[m]
                        }
                    }
                }
            }
        }
        return shengtaigongyilin;
    }(fieldName);

    if(req.params.xzc=="玛沁县"){
        pool.query("select shiquandengji,g_cheng_lb,baohudengji,dilei,sum(mianji) as area" +
            " from maqinxiandataedit " +
            " where shiquandengji!='' " +
            " group by shiquandengji,g_cheng_lb,baohudengji,dilei",
        function(err,result){
            if(err){
                console.error("error running query ",err);
            }

            var resultObj =[];
            var queryResult=result.rows;

            if(queryResult.length==0){
                res.send('[]');
            }else{
                queryResult.forEach(function(value){
                    if(value.g_cheng_lb==''){
                        value.g_cheng_lb="其他";
                    }
                    resultObj.push({
                        name:value.shiquandengji,
                        area:value.area,
                        children:[{
                            name:value.g_cheng_lb,
                            area:value.area,
                            children:[{
                                name:value.baohudengji,
                                area:value.area,
                                children:[{
                                    name:value.dilei,
                                    area:value.area,
                                }]
                            }]
                        }]
                    })
                });
                resultObj.forEach(function(singleresultObj){
                    merge(shengtaigongyilin,singleresultObj);
                });
                res.send(shengtaigongyilin);
            }
        });
    }else{
        pool.query("select shiquandengji,g_cheng_lb,baohudengji,dilei,sum(mianji) as area " +
            " from maqinxiandataedit " +
            " where shiquandengji!='' and xiang=$1::text " +
            " group by shiquandengji,g_cheng_lb,baohudengji,dilei",[req.params.xzc],
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
                        if(value.g_cheng_lb==''){
                            value.g_cheng_lb="其他";
                        }
                        resultObj.push({
                            name:value.shiquandengji,
                            area:value.area,
                            children:[{
                                name:value.g_cheng_lb,
                                area:value.area,
                                children:[{
                                    name:value.baohudengji,
                                    area:value.area,
                                    children:[{
                                        name:value.dilei,
                                        area:value.area,
                                    }]
                                }]
                            }]
                        })
                    });
                    resultObj.forEach(function(singleresultObj){
                        merge(shengtaigongyilin,singleresultObj);
                    });
                    res.send(shengtaigongyilin);
                }
            });
    }
});

//灌木林t6
router.get('/statistics/t6/:xzc',function(req,res,next){
    var merge = function(obj,singleresultObj){
        obj.forEach(function(value){
            if(value.name===singleresultObj.name){
                value.area=value.area+singleresultObj.area;
                if(value.hasOwnProperty('children')&&singleresultObj.hasOwnProperty('children')) {
                    merge(value['children'], singleresultObj['children'][0]);
                }
                return true;
            }
        });
    };

    var fieldName={
        "qiyuan":['纯天然'],
        "dilei":['国家特别规定灌木林地'],
        "youshishuzhong":['沙棘','山生柳','金露梅','杜鹃','梭梭','其它灌木树种','其它柳类灌木'],
        "yubidu":['疏','中','密']
    };

    var guanmulin=function(fieldName){
        var guanmulin=[];
        for(var i=0;i<fieldName.qiyuan.length;i++){
            guanmulin[i]={
                area:0,
                name:fieldName.qiyuan[i],
                children:[]
            };
            for(var j=0;j<fieldName.dilei.length;j++){
                guanmulin[i].children[j]={
                    area:0,
                    name:fieldName.dilei[j],
                    children:[]
                };
                for(var k=0;k<fieldName.youshishuzhong.length;k++){
                    guanmulin[i].children[j].children[k]={
                        area:0,
                        name:fieldName.youshishuzhong[k],
                        children:[]
                    };
                    for(var m=0;m<fieldName.yubidu.length;m++) {
                        guanmulin[i].children[j].children[k].children[m] = {
                            area: 0,
                            name: fieldName.yubidu[m],
                        }
                    }
                }
            }
        }
        return guanmulin;
    }(fieldName);
    if(req.params.xzc==="玛沁县") {
        pool.query("select qiyuan,dilei,youshishuzhong,yubidu,sum(mianji) as area " +
            " from maqinxiandataedit " +
            " where dilei='国家特别规定灌木林地' " +
            " group by qiyuan,dilei,youshishuzhong,yubidu",
            function (err, result) {
                if (err) {
                    console.error("error running query ", err);
                }
                var resultObj = [];

                var queryResult = result.rows;
                if (queryResult.length == 0) {
                    res.send('[]');
                } else {
                    queryResult.forEach(function (value) {
                        if (value.yubidu <0.5) {
                            value.yubidu = "疏";
                        }
                        if (0.5 <= value.yubidu < 0.7) {
                            value.yubidu = "中";
                        }
                        if (0.7 <= value.yubidu) {
                            value.yubidu = "密";
                        }
                        resultObj.push({
                            name: value.qiyuan,
                            area: value.area,
                            children: [{
                                name: value.dilei,
                                area: value.area,
                                children: [{
                                    name: value.youshishuzhong,
                                    area: value.area,
                                    children: [{
                                        name: value.yubidu,
                                        area: value.area
                                    }]
                                }]
                            }]
                        })
                    });
                    resultObj.forEach(function (singleresultObj) {
                        merge(guanmulin, singleresultObj);
                    });
                    res.send(guanmulin);
                }
            });
    }else{
        pool.query("select qiyuan,dilei,youshishuzhong,yubidu,sum(mianji) as area " +
            " from maqinxiandataedit " +
            " where dilei='国家特别规定灌木林地' and xiang=$1::text "+
            " group by qiyuan,dilei,youshishuzhong,yubidu", [req.params.xzc],
            function(err,result){
                if (err) {
                    console.error("error running query ", err);
                }
                var resultObj = [];

                var queryResult = result.rows;
                if (queryResult.length == 0) {
                    res.send('[]');
                } else {
                    queryResult.forEach(function (value) {
                        if (value.yubidu <0.5) {
                            value.yubidu = "疏";
                        }
                        if (0.5 <= value.yubidu < 0.7) {
                            value.yubidu = "中";
                        }
                        if (0.7 <= value.yubidu) {
                            value.yubidu = "密";
                        }
                        resultObj.push({
                            name: value.qiyuan,
                            area: value.area,
                            children: [{
                                name: value.dilei,
                                area: value.area,
                                children: [{
                                    name: value.youshishuzhong,
                                    area: value.area,
                                    children: [{
                                        name: value.yubidu,
                                        area: value.area
                                    }]
                                }]
                            }]
                        })
                    });
                    resultObj.forEach(function (singleresultObj) {
                        merge(guanmulin, singleresultObj);
                    });
                    res.send(guanmulin);
                }
            });
    }

});

//林地结构现状t9
router.get('/statistics/t9/:xzc',function(req,res,next){

});

//国家级公益林地分保护等级t10
router.get('/statistics/t10/:xzc',function(req,res,next){

});

//林地质量等级t11
router.get('/statistics/t11/:xzc',function(req,res,next){

});

//林地保护等级面积t12
router.get('/statistics/t12/:xzc',function(req,res,next){

});
module.exports = router;