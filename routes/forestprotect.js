/**
 * Created by hwt on 2017/5/24.
 */
var xlsx = require('xlsx');
var express = require('express');
var router = express.Router();
var path= require('path');
// psql package import
var pg = require("pg");

var pool = require('./db');

var conString = 'tcp://maqin:maqin_geo@localhost:5432/maqin';

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
router.get('/hulinyuan',function(req,res,next){
    res.sendFile(path.join(__dirname,'../public/pages','forestprotect-hulinyuan.html'));
});
router.get('/hulinyuan/all',function(req,res,next){
    pool.query(
        'select distinct(cast(gh_id as integer)),cun_hly,xingming,sum(mian_ji) as aera,hetong_id,beizhu,' +
        'daogang_sj,ligang_sj,shenfen_id ' +
        'from maqin_test.maqinxian_hulinyuan ' +
        'group by ' +
        'gh_id,cun_hly,xingming,hetong_id,daogang_sj,ligang_sj,shenfen_id,beizhu ' +
        'order by gh_id asc',
        function(err,result){
            if(err){
                return console.error('error running query',err);
            }
            var allInfo=[];
            var queryResult = result.rows;
            queryResult.forEach(function(value,index,arr){
                allInfo.push({
                    id:value.shenfen_id,
                    name:value.xingming,
                    cun:value.cun_hly,
                    gh_id:value.gh_id,
                    guanhuaera:value.aera,
                    hetongNo:value.hetong_id,
                    daogang:value.daogang_sj,
                    ligang:value.ligang_sj,
                    beizhu:value.beizhu
                });
            });
            res.send(allInfo);
    });
});
router.get('/hulinyuan/:gh_id',function(req,res,next){
    pool.query(
        'select * from maqin_test.maqinxian_hulinyuan where gh_id=$1::text',[req.params.gh_id],
        function(err,result){
            if(err){
                return console.error('error running query',err);
            }
            var queryResult = result.rows;
            //console.log(queryResult);
            var guanhuaera=0;
            var info = {
                personal:[{
                    id:queryResult[0].shenfen_id,
                    name:'',
                    cun:'',
                    gh_id:'',
                    guanhuaera:'',
                    hetongNo:queryResult[0].hetong_id,
                    daogang:queryResult[0].daogang_sj,
                    ligang:queryResult[0].ligang_sj,
                    beizhu:queryResult[0].beizhu
                }],
                protect:[],
                all:[]
            };
            queryResult.forEach(function(value,index,err){
                info.protect.push({
                    //gid:value.gid,
                    xzc:value.xiang,
                    linban:value.lin_ban,
                    xiaoban:value.xiao_ban,
                    dilei:value.di_lei,
                    xiaobanmianji:value.mian_ji,
                    xxb:value.xxb
                });
                info.all.push(value);
                guanhuaera=guanhuaera+value.mian_ji;
            });
            res.send(info);
        }
    )
});
router.get('/hulinyuan/xiaoban/:gid',function(req,res){
    pool.query(
        'select * from maqin_test.maqinxianhulinyuandataedit where gid=$1::int',
        [req.params.gid],
        function(err,result){
            if(err){
                return console.error('error running query',err);
            }
            res.send(result.rows);
        });
});
router.get('/hulinyuan/search/:id',function(req,res,next){
    if(req.params.id.length>5){
        var xzcname = req.params.id.split('L')[0];
        var linbanid = req.params.id.split('L')[1];
        console.log(xzcname,linbanid);
        pool.query(
            "select distinct(xiao_ban) from maqin_test.maqinxian_xbm " +
            "where xiang = $1::text and lin_ban = $2::text order by xiao_ban asc",
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
            "select distinct(lin_ban) from maqin_test.maqinxian_xbm" +
            " where xiang = $1::text order by lin_ban asc",
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
router.get('/hulinyuan/download/hlyexcel',function(req,res,next){
    pool.query('select * from maqin_test.maqinxian_hulinyuan',function(err,result){
        if(err){
            return console.error('error running query',err);
        }
        var queryResult = result.rows;
        var _data=[];
        var data={};
        queryResult.forEach(function(value,index,err){
            _data.push({
                gh_id:value.gh_id,
                xingming:value.xingming,
                shenfen_id:value.shenfen_id,
                hetong_id:value.hetong_id,
                cun_hly:value.cun_hly,
                daogang_sj:value.daogang_sj,
                ligang_sj:value.ligang_sj,
                sheng:value.sheng,
                xian:value.xian,
                xiang:value.xiang,
                lin_ban:value.lin_ban,
                xiao_ban:value.xiao_ban,
                di_lei:value.di_lei,
                mian_ji:value.mian_ji,
                beizhu:value.beizhu,
                di_mao:value.di_mao,
                po_xiang:value.po_xiang,
                po_wei:value.po_wei,
                po_du:value.po_du,
                ke_ji_du:value.ke_ji_du,
                tu_rang_lx:value.tu_rang_lx,
                tu_ceng_hd:value.tu_ceng_hd,
                ld_qs:value.ld_qs,
                lin_zhong:value.lin_zhong,
                qi_yuan:value.qi_yuan,
                sen_lin_lb:value.sen_lin_lb,
                shi_quan_d:value.shi_quan_d,
                gjgyl_bhdj:value.gjgyl_bhdj,
                g_cheng_lb:value.g_cheng_lb,
                ling_zu:value.ling_zu,
                yu_bi_du:value.yu_bi_du,
                you_shi_sz:value.you_shi_sz,
                pingjun_xj:value.pingjun_xj,
                huo_lmgqxj:value.huo_lmgqxj,
                mei_gq_zs:value.mei_gq_zs,
                td_th_lx:value.td_th_lx,
                dispe:value.dispe,
                disaster_c:value.disaster_c,
                zl_dj:value.zl_dj,
                ld_kd:value.ld_kd,
                ld_cd:value.ld_cd,
                bcld:value.bcld,
                bh_dj:value.bh_dj,
                lyfq:value.lyfq,
                qykz:value.qykz,
                xxb:value.xxb
            });
        });
        var _headers = ['gh_id','xingming','shenfen_id','hetong_id','cun_hly',
        'daogang_sj','ligang_sj','sheng','xian','xiang','lin_ban','xiao_ban',
        'di_lei','mian_ji','beizhu','di_mao','po_xiang','po_wei','po_du','ke_ji_du',
        'tu_rang_lx','tu_ceng_hd','ld_qs','lin_zhong','qi_yuan','sen_lin_lb',
        'shi_quan_d','gjgyl_bhdj','g_cheng_lb','ling_zu','yu_bi_du','you_shi_sz',
        'pingjun_xj','huo_lmgqxj','mei_gq_zs','td_th_lx','dispe','disaster_c',
        'zl_dj','ld_kd','ld_cd','bcld','bh_dj','lyfq','qykz','xxb'];
        _headers.map(function(value,index){
            if(index<=25){
                var pos = String.fromCharCode(65+index)+1;
            }else{
                var pos = String.fromCharCode(65)+String.fromCharCode(65+index-26)+1;
            }

            data[pos]={v:value};
        });
        _data.map(function(value,index){
            var row=index+2;
            for(var j =0;j<_headers.length;j++){
                if(j<=25){
                    var col=String.fromCharCode(65+j);
                }else{
                    var col = String.fromCharCode(65)+String.fromCharCode(65+j-26);
                }
                var pos = col+row;
                data[pos]={
                    v:value[_headers[j]]
                };
            }

        });
        var outputpos=Object.keys(data);
        var ref = outputpos[0]+':'+outputpos[outputpos.length-1];
        data['!ref']=ref;
        var wb = {
            SheetNames:['Sheet1'],
            Sheets:{
                'Sheet1':data
            }
        };
        xlsx.writeFile(wb,'./public/export/hulinyuan.xlsx');
        var realpath = path.join(__dirname,'../public/export','hulinyuan.xlsx');
        console.log(realpath);
        res.download(realpath);
    });
});
module.exports = router;