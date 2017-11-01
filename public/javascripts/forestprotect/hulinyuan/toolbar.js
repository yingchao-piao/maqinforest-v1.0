/**
 * Created by hwt on 2017/8/14.
 */
//查询定位小班工具
$('.message .close')
    .on('click', function() {
        $(this)
            .closest('.message')
            .transition('fade')
        ;
    });
$('.modal').modal({
    allowMultiple:true
}).modal('setting','closable',false);
$('#searchxiaoban').click(function(){
    $('#searchModal').modal('show');
});
$('.ui.dropdown.xzc').dropdown({
    maxSelection:1,
    onChange:function(text,value,$selectedItem){
        console.log(initConst.xzcid[value]);
        $('.ui.dropdown.linbanid').dropdown('clear');
        $('.ui.dropdown.xiaobanid').dropdown('clear');
        $('.ui.dropdown.linbanid .menu').empty();
        $('.ui.dropdown.xiaobanid .menu').empty();
        $.ajax({
            url:'/forestprotect/hulinyuan/search/'+value,
            type:'GET',
            dataType:'text',
            error:function(XMLHttpRequest,textStatus,errorThrown){
                alert('error message: '+errorThrown.toString());
            },
            success:function(res){
                var response = JSON.parse(res);
                var menuitem='';
                for(var i=0;i<response.length;i++){
                    menuitem=menuitem
                        +'<div class="item" data-value="'+
                        response[i].lin_ban+'">'+response[i].lin_ban+'</div>';
                }
                $('.ui.dropdown.linbanid .menu').append(menuitem);


            }
        });
    },
    message:{
        noResults:'未搜索到结果'
    }
});
$('.ui.dropdown.linbanid').dropdown({
    maxSelection:1,
    onChange:function(text,value,$selectedItem){
        var id = $('.ui.dropdown.xzc .text').html()+'L'+value;
        $('.ui.dropdown.xiaobanid').dropdown('clear');
        $('.ui.dropdown.xiaobanid .menu').empty();
        if(value != undefined){
            $.ajax({
                url:'/forestprotect/hulinyuan/search/'+id,
                type:'GET',
                dataType:'text',
                error:function(XMLHttpRequest,textStatus,errorThrown){
                    alert('error message: '+errorThrown.toString());
                },
                success:function(res){
                    var response = JSON.parse(res);
                    var menuitem='';
                    for (var i=0;i<response.length;i++){
                        menuitem=menuitem+
                            '<div class="item" data-value="'+
                            response[i].xiao_ban+'">'+response[i].xiao_ban+'</div>';
                    }
                    $('.ui.dropdown.xiaobanid .menu').empty().append(menuitem);
                }
            })
        }

    },
    message:{
        noResults:'未搜索到结果'
    }
});
$('.ui.dropdown.xiaobanid').dropdown({
    maxSelection:1,
    message:{
        noResults:'未搜索到结果'
    }
});
$('#searchBtn').click(function(){
    var xzc = $('.ui.dropdown.xzc .text').html();
    var linbanid = $('.ui.dropdown.linbanid .text').html();
    var xiaobanid = $('.ui.dropdown.xiaobanid .text').html();
    if(xzc==="" || linbanid===""){
        $('#alertMessage').modal('attach events','#searchModal .field .button').modal(
            'setting','closable',false
        ).modal({
                allowMultiple:true
            });
    }else if(xzc!=="" && linbanid !== "" && xiaobanid !== ""){

        var wfsUrl = geoserverUrl+'wfs/';
        var featureRequest = mapModule.layerFuncs.getFeatureRequest({
            featureTypes:[layersAttr.layerNames.xbm],
            filter:ol.format.filter.and(
                ol.format.filter.equalTo('xiang',xzc),
                ol.format.filter.equalTo('lin_ban',linbanid),
                ol.format.filter.equalTo('xiao_ban',xiaobanid)
            )
        });
        mapModule.layerFuncs.fetchaddFeatures(wfsUrl,featureRequest,
            mapLayerSource.vecLayerSource.xbm_source);
        mapModule.vecLayer.setSource(mapLayerSource.vecLayerSource.xbm_source);
        $('#layerUp').attr('disabled','disabled');
        $('#searchModal').modal('hide');
    }else if(xzc!=="" && linbanid !== "" && xiaobanid ===""){
        var wfsUrl = geoserverUrl + 'wfs/';
        var featureRequest = mapModule.layerFuncs.getFeatureRequest({
            featureTypes:[layersAttr.layerNames.xbm],
            filter:ol.format.filter.and(
                ol.format.filter.equalTo('xiang',xzc),
                ol.format.filter.equalTo('lin_ban',linbanid)
            )
        });
        fetch(wfsUrl,{
            method:'POST',
            body:new XMLSerializer().serializeToString(featureRequest)
        }).then(function(response){
            return response.json();
        }).then(function(json){
            var features = new ol.format.GeoJSON().readFeatures(json);
            //mapLayerSource.vecLayerSource.xbm_source.clear();
            mapLayerSource.vecLayerSource.xbm_source.addFeatures(features);
            mapModule.vecLayer.setSource(mapLayerSource.vecLayerSource.xbm_source);
            features.forEach(function(value){
                for(var i = 0; i<modifyhly.featuresextent.length;i++){
                    if(ol.extent.equals(value.getGeometry().getExtent(),modifyhly.featuresextent[i])){
                        mapLayerSource.vecLayerSource.xbm_source.removeFeature(value);
                        break;
                    }
                }
            });
            map.getView().fit(mapLayerSource.vecLayerSource.xbm_source.getExtent(),{duration:200});
        });
        $('#layerUp').attr('disabled','disabled');
        $('#searchModal').modal('hide');
    }

});
///homePage工具
$('#homePage').click(function(){
    mapModule.vecLayer.setSource(mapLayerSource.vecLayerSource.xzj_source);
    /*mapModule.vecLayer.setStyle(stylefunc);
    function stylefunc(feature,resolution){
        mapModule.defaultstyle.getText().setFont('Normal 15px Microsoft Yahei');
        mapModule.defaultstyle.getText().setText(feature.get('xiang_name'));
        return mapModule.defaultstyle;
    }*/

    map.removeInteraction(mapModule.selectinteraction);
    mapModule.selectinteraction = mapModule.selectinteractions('add');
    mapModule.selectedfeatures = mapModule.selectinteraction.getFeatures();
    map.addInteraction(mapModule.selectinteraction);

    map.getView().fit(mapModule.vecLayer.getSource().getExtent(),{during:200});
    $('#layerUp').removeAttr('disabled');
    $('.ui.sidebar').sidebar('hide');
    $('.ui.left.wide.sidebar.hly').sidebar('show');
    $('.ui.right.wide.sidebar.hlyInfo').sidebar('show');
    map.removeLayer(lineorpolygon.vector);

    map.removeLayer(outputpolygon.vector);
    map.removeLayer(unionobj.UnionVec);
    $('#clearAll').click();
    $('#unionclearAll').click();
});
///layerUp工具
$('#layerUp').click(function(){
    mapModule.layerFuncs.layerUp();
});
///切分工具
////////切分界面初始化
$('#editAttrForm').hide();
$('#splitSidebar').sidebar('setting',{
    transition:'overlay',
    dimPage:false,
    closable:false
}).sidebar('hide');
$('#splitSidebarEditAttr').sidebar('setting',{
    transition:'overlay',
    dimPage:false,
    closable:false
}).sidebar('hide');
$('.menu .item').tab({
    onVisible:function(value){
        console.log(value);
        mapModule.selectedfeatures.clear();
        if(value==='first'){
            mapModule.selectedfeatures.push(outputpolygon.features[0]);
        }
        if(value==='second'){
            mapModule.selectedfeatures.push(outputpolygon.features[1]);
        }
    }
});
var besplitpolygon;
var lineorpolygon = new LineOrPolygon();
var outputpolygon = new OutputPolygon();

$('#split').click(function(){
    $('.ui.sidebar').sidebar('hide');
    $('#splitSidebar').sidebar('show');

    map.removeInteraction(mapModule.selectinteraction);
    mapModule.selectinteraction = mapModule.selectinteractions('split');
    mapModule.selectedfeatures = mapModule.selectinteraction.getFeatures();
    map.addInteraction(mapModule.selectinteraction);

    /*$('.ui.left.wide.sidebar.hly').sidebar('hide');
    $('.ui.right.wide.sidebar.hlyInfo').sidebar('hide');*/
    if($.inArray(lineorpolygon.vector,map.getLayers().getArray())===-1){
        map.addLayer(lineorpolygon.vector);
    }
    if($.inArray(outputpolygon.vector,map.getLayers().getArray())===-1){
        map.addLayer(outputpolygon.vector);
    }
});
$('#drawline').click(function(){
    map.removeInteraction(lineorpolygon.drawinteraction);
    //map.removeInteraction(lineorpolygon.modifyinteraction);
    //map.removeInteraction(lineorpolygon.snapinteraction);
    drawinteraction(lineorpolygon,'LineString');
    map.addInteraction(lineorpolygon.drawinteraction);
    //map.addInteraction(lineorpolygon.modifyinteraction);
    //map.addInteraction(lineorpolygon.snapinteraction);
    map.removeInteraction(mapModule.selectinteraction);

});
$('#drawpolygon').click(function(){
    map.removeInteraction(lineorpolygon.drawinteraction);
    //map.removeInteraction(lineorpolygon.modifyinteraction);
    //map.removeInteraction(lineorpolygon.snapinteraction);
    drawinteraction(lineorpolygon,'Polygon');
    map.addInteraction(lineorpolygon.drawinteraction);
    //map.addInteraction(lineorpolygon.modifyinteraction);
    //map.addInteraction(lineorpolygon.snapinteraction);
    map.removeInteraction(mapModule.selectinteraction);

});
$('#modifyLine').click(function(){
    var features = lineorpolygon.source.getFeatures();
    if(features[0].getGeometry().getType()==='LineString'){
        lineorpolygon.drawinteraction.extend(features[0]);
    }
});
$('#deletefeature').click(function(){
    lineorpolygon.source.clear();
    /*$('#line textarea').val('');*/
});
$('#releasemouse').click(function(){
    map.removeInteraction(lineorpolygon.drawinteraction);
    /*map.removeInteraction(lineorpolygon.modifyinteraction);
    map.removeInteraction(lineorpolygon.snapinteraction);*/
    map.addInteraction(mapModule.selectinteraction);

});

$('#executesplit').click(function(){
    if(lineorpolygon.LineString===null&&lineorpolygon.Polygon===null||besplitpolygon.feature===null){
        return;
    }
    if(lineorpolygon.LineString===null){
        if(intersects(besplitpolygon.feature,lineorpolygon.feature)){
            addHole(besplitpolygon,lineorpolygon.Polygon,outputpolygon);
            //////
            //mapModule.vecLayer.setOpacity(0);
            mapModule.selectedfeatures.clear();
        }else{
            $('#errorMessage .description').html('绘制的多边形未包含在小班内,请重新绘制');
            $('#errorMessage').modal('show');
        }
    }
    if(lineorpolygon.Polygon===null){
        $('#tongbuloading').modal('show');
        lineSplitPolygon(besplitpolygon,lineorpolygon.LineString,geoserverUrl+'wfs/',outputpolygon);
    }
    if(outputpolygon.source.getFeatures().length!=2){
        $('#tongbuloading').modal('hide');
        $('#errorMessage .description').html('切分过程存在错误，请核实！');
        $('#errorMessage').modal('show');
    }else{
        mapModule.selectedfeatures.push(outputpolygon.features[0]);
        var first_field = editAttrHtml(outputpolygon.features[0]);
        $('#first_form .field').detach();
        $('#first #save').detach();
        $('#first_form').append(first_field);
        $('#first').append('<div class="field" style="text-align:center">'+
            '<button class="ui green button" id="save">'+
            '保存'+
            '</button>'+
            '</div>');

        var second_field = editAttrHtml(outputpolygon.features[1]);
        $('#second_form .field').detach();
        $('#second #save').detach();
        $('#second_form').append(second_field);
        $('#second').append('<div class="field" style="text-align:center">'+
            '<button class="ui green button" id="save">'+
            '保存'+
            '</button>'+
            '</div>');

        $('#first_form .dropdown').dropdown({
            maxSelection:1,
            onChange:function(value,name,$choice){
                var key = value.split('_')[0];
                var val = name;
                outputpolygon.features[0].set(key,val);
            }
        });
        $('#second_form .dropdown').dropdown({
            maxSelection:1,
            onChange:function(value,name,$choice){
                var key = value.split('_')[0];
                var val = name;
                outputpolygon.features[1].set(key,val);
            }
        });


        $('#first_form,#second_form').form({
            keyboardShortcuts:false,
            inline:true,
            prompt:{
                integer:'需为整数',
                number:'需为数字'
            },
            on:'blur',
            fields:{
                tu_ceng_hd:['empty','number'],
                yu_bi_du:['empty','number'],
                pingjun_xj:['empty','number'],
                huo_lmgqxj:['empty','number'],
                mei_gq_zs:['empty','integer'],
                ld_cd:['empty','number'],
                ld_kd:['empty','number'],
                xxb:['empty','integer']
            }
        });


        $('#first #save').click(function(){
            if($('#first_form').form('is valid')){
                outputpolygon.features[0].set('tu_ceng_hd',parseFloat($('#first_form #tu_ceng_hd').val()));
                outputpolygon.features[0].set('yu_bi_du',parseFloat($('#first_form #yu_bi_du').val()));
                outputpolygon.features[0].set('pingjun_xj',parseFloat($('#first_form #pingjun_xj').val()));
                outputpolygon.features[0].set('huo_lmgqxj',parseFloat($('#first_form #huo_lmgqxj').val()));
                outputpolygon.features[0].set('mei_gq_zs',parseInt($('#first_form #mei_gq_zs').val()));
                outputpolygon.features[0].set('ld_cd',parseFloat($('#first_form #ld_cd').val()));
                outputpolygon.features[0].set('ld_kd',parseFloat($('#first_form #ld_kd').val()));
                outputpolygon.features[0].set('xxb',parseInt($('#first_form #xxb').val()));
            }else{
                $('#errorMessage .description').html('1号小班编辑属性存在错误，请核实！');
                $('#errorMessage').modal('show');
            }

        });

        $('#second #save').click(function(){
            if($('#second_form').form('is valid')){
                outputpolygon.features[1].set('tu_ceng_hd',parseFloat($('#second_form #tu_ceng_hd').val()));
                outputpolygon.features[1].set('yu_bi_du',parseFloat($('#second_form #yu_bi_du').val()));
                outputpolygon.features[1].set('pingjun_xj',parseFloat($('#second_form #pingjun_xj').val()));
                outputpolygon.features[1].set('huo_lmgqxj',parseFloat($('#second_form #huo_lmgqxj').val()));
                outputpolygon.features[1].set('mei_gq_zs',parseInt($('#second_form #mei_gq_zs').val()));
                outputpolygon.features[1].set('ld_cd',parseFloat($('#second_form #ld_cd').val()));
                outputpolygon.features[1].set('ld_kd',parseFloat($('#second_form #ld_kd').val()));
                outputpolygon.features[1].set('xxb',parseInt($('#second_form #xxb').val()));
            }else{
                $('#errorMessage .description').html('2号小班编辑属性存在错误，请核实！');
                $('#errorMessage').modal('show');
            }

        });


        $('#editAttrForm').show();
        $('#releasemouse').click();
        mapModule.selectedfeatures.clear();
    }


});
$('#clearall').click(function(){
    outputpolygon.source.clear();
    lineorpolygon.source.clear();
    $('#xiaoban textarea').val('');
    $('#editAttrForm').hide();
    besplitpolygon.feature=null;
    /*$('#line textarea').val('');*/
});
$('#tongbu').click(function(){
    if($('#second_form').form('is valid') && $('#first_form').form('is valid') && outputpolygon.source.getFeatures().length===2){
        $('#tongbuloading').modal('show');
        outputpolygon.wfst();
        besplitpolygon.wfst();

    }else{
        $('#errorMessage .description').html('切分过程存在错误，请核实！');
        $('#errorMessage').modal('show');
    }
});
/////union工具
$('#unioneditAttrForm').hide();
var unionobj = new UnionObj();
$('#unionSidebar').sidebar('setting',{
    transition:'overlay',
    dimPage:false,
    closable:false
}).sidebar('hide');
$('#union').click(function(){
    $('.ui.sidebar').sidebar('hide');
    $('#unionSidebar').sidebar('show');

    map.removeInteraction(mapModule.selectinteraction);
    mapModule.selectinteraction = mapModule.selectinteractions('union');
    mapModule.selectedfeatures = mapModule.selectinteraction.getFeatures();
    map.addInteraction(mapModule.selectinteraction);

    if($.inArray(lineorpolygon.vector,map.getLayers().getArray())!==-1){
        map.removeLayer(lineorpolygon.vector);
    }
    if($.inArray(outputpolygon.vector,map.getLayers().getArray())!==-1){
        map.removeLayer(outputpolygon.vector);
    }
    $('#clearAll').click();

    if($.inArray(unionobj.UnionVec,map.getLayers().getArray())===-1){
        map.addLayer(unionobj.UnionVec);
    }

});
$('#unionclearall').click(function(){
    unionobj.UnionSource.clear();
    $('#unionxxb1 textarea').val('');
    $('#unionxxb2 textarea').val('');
    unionobj.xxbFeatures=[];
    $('#unioneditAttrForm').hide();
});
$('#executeunion').click(function(){
    if(unionobj.xxbFeatures.length==2){
        unionobj.union(unionobj.xxbFeatures[0],unionobj.xxbFeatures[1]);
        mapModule.selectedfeatures.clear();
        var unionFeature=unionobj.UnionSource.getFeatures()[0];
        var attrfield = editAttrHtml(unionFeature);
        $('#union_form .field').detach();
        $('#unionsave').detach();
        $('#union_form').append(attrfield);
        $('#unioneditAttrForm').append('<div class="field" style="text-align:center">'+
            '<button class="ui green button" id="unionsave">'+
            '保存'+
            '</button>'+
            '</div>');

        $('#union_form .dropdown').dropdown({
            maxSelection:1,
            onChange:function(value,name,$choice){
                var key = value.split('_')[0];
                var val = name;
                unionFeature.set(key,val);
            }
        });

        $('#union_form').form({
            keyboardShortcuts:false,
            inline:true,
            prompt:{
                integer:'需为整数',
                number:'需为数字'
            },
            on:'blur',
            fields:{
                tu_ceng_hd:['empty','number'],
                yu_bi_du:['empty','number'],
                pingjun_xj:['empty','number'],
                huo_lmgqxj:['empty','number'],
                mei_gq_zs:['empty','integer'],
                ld_cd:['empty','number'],
                ld_kd:['empty','number'],
                xxb:['empty','integer']
            }
        });

        $('#unionsave').click(function(){
            if($('#union_form').form('is valid')){
                unionFeature.set('tu_ceng_hd',parseFloat($('#union_form #tu_ceng_hd').val()));
                unionFeature.set('yu_bi_du',parseFloat($('#union_form #yu_bi_du').val()));
                unionFeature.set('pingjun_xj',parseFloat($('#union_form #pingjun_xj').val()));
                unionFeature.set('huo_lmgqxj',parseFloat($('#union_form #huo_lmgqxj').val()));
                unionFeature.set('mei_gq_zs',parseInt($('#union_form #mei_gq_zs').val()));
                unionFeature.set('ld_cd',parseFloat($('#union_form #ld_cd').val()));
                unionFeature.set('ld_kd',parseFloat($('#union_form #ld_kd').val()));
                unionFeature.set('xxb',parseInt($('#union_form #xxb').val()));
            }else{
                $('#errorMessage .description').html('属性编辑存在错误，请核实！');
                $('#errorMessage').modal('show');
            }

        });

        $('#unioneditAttrForm').show();
    }else{
        $('#errorMessage .description').html('细小班选取有误，请核实');
        $('#errorMessage').modal('show');
    }
});
$('#uniontongbu').click(function(){
    if($('#union_form').form('is valid')&& unionobj.UnionSource.getFeatures().length===0){
        $('#tongbuloading').modal('show');
        //此处应判断插入是否成功，成功后则删除，否则alert
        unionobj.wfstinsert;
        /*$('#tongbuloading').modal('show');*/
        unionobj.wfstdelete;
    }else{
        $('#errorMessage .description').html('切分过程存在错误，请核实！');
        $('#errorMessage').modal('show');
    }
});
////下载功能
$('#gethlyexcel').click(function(){
    window.location.href='http://localhost:3000/forestprotect/hulinyuan/download/hlyexcel';
});
////新建功能
var hulinyuan = new Hulinyuan();
$('#newSidebar').sidebar('setting',{
    transition:'overlay',
    dimPage:false,
    closable:false
}).sidebar('hide');
$('#addhlyinfoform').form({
    keyboardShortcuts:false,
    inline:true,
    prompt:{
        integer:'需为整数',
        number:'需为数字',
        empty:'不可为空'
    },
    on:'blur',
    fields:{
        gh_id:['empty','number'],
        xingming:['empty'],
        shenfen_id:['empty'],
        hetong_id:['empty'],
        cun_hly:['empty'],
        daogang_sj:['empty'],
        ligang_sj:['empty'],
        beizhu:['empty']
    }
});
$('#add').click(function(){
    $('.ui.sidebar').sidebar('hide');
    $('#newSidebar').sidebar('show');
    map.removeInteraction(mapModule.selectinteraction);
    mapModule.selectinteraction = mapModule.selectinteractions('add');
    mapModule.selectedfeatures = mapModule.selectinteraction.getFeatures();
    map.addInteraction(mapModule.selectinteraction);
});
$('#addtongbu').click(function(){
    if($('#addhlyinfoform').form('is valid') && hulinyuan.featuresarray.length>=1){
        $('#tongbuloading').modal('show');
        hulinyuan.gh_id=$('#gh_id').val();
        hulinyuan.xingming=$('#xingming').val();
        hulinyuan.shenfen_id=$('#shenfen_id').val();
        hulinyuan.hetong_id = $('#hetong_id').val();
        hulinyuan.cun_hly=$('#cun_hly').val();
        hulinyuan.daogang_sj=$('#daogang_sj').val();
        hulinyuan.ligang_sj = $('#ligang_sj').val();
        hulinyuan.beizhu = $('#beizhu').val();
        var options = {
            srsName:'EPSG:2342',
            featureNS:layersAttr.workspace_test,
            featurePrefix:layersAttr.workspace_test,
            featureType:[layersAttr.layerNames.hulinyuan]
        };
        for(var i = 0; i<hulinyuan.featuresarray.length;i++){
            var value = hulinyuan.featuresarray[i];
            value.set('gh_id',hulinyuan.gh_id);
            value.set('shenfen_id',hulinyuan.shenfen_id);
            value.set('hetong_id',hulinyuan.hetong_id);
            value.set('daogang_sj',hulinyuan.daogang_sj);
            value.set('ligang_sj',hulinyuan.ligang_sj);
            value.set('xingming',hulinyuan.xingming);
            value.set('cun_hly',hulinyuan.cun_hly);
            value.set('beizhu',hulinyuan.beizhu);
            var properties = value.getProperties();
            delete properties.xlbxb;
            delete properties.mianji_he;

            wfst.insert(hulinyuan.featuresarray[i],options);
        }
    }else{
        $('#errorMessage .description').html('信息存在错误，请核实！');
        $('#errorMessage').modal('show');
    }

});
////修改功能
var modifyhly = new Hulinyuan();
var modifiedhly = new Hulinyuan();
/*var modify_xbmSource = new ol.source.Vector({});
var modify_xbmVecLayer = new ol.layer.Vector({
    source:modify_xbmSource,
    style:function(feature){
        var text = mapModule.layerFuncs.setStyleText(feature);
        layerStyle.defaultstyle.getText().setFont('Normal 15px Microsoft Yahei');
        layerStyle.defaultstyle.getText().setText(text);
        return layerStyle.defaultstyle;
    }
});*/
$('#modifyLeftSidebar,#modifyRightSidebar').sidebar('setting',{
    transition:'overlay',
    dimPage:false,
    closable:false
}).sidebar('hide');
$('#modifyhlyinfoform').form({
    keyboardShortcuts:false,
    inline:true,
    prompt:{
        integer:'需为整数',
        number:'需为数字',
        empty:'不可为空'
    },
    on:'blur',
    fields:{
        modify_gh_id:['empty','number'],
        modify_xingming:['empty'],
        modify_shenfen_id:['empty'],
        modify_hetong_id:['empty'],
        modify_cun_hly:['empty'],
        modify_daogang_sj:['empty'],
        modify_ligang_sj:['empty'],
        modify_beizhu:['empty']
    }
});
$('#modify').click(function(){
    $('.ui.sidebar').sidebar('hide');
    $('#modifyLeftSidebar').sidebar('show');
    $('#modifyRightSidebar').sidebar('show');
    map.removeInteraction(mapModule.selectinteraction);
    mapModule.selectinteraction = mapModule.selectinteractions('modify');
    mapModule.selectedfeatures = mapModule.selectinteraction.getFeatures();
    map.addInteraction(mapModule.selectinteraction);

    $.ajax({
        url:'hulinyuan/all',
        type:'GET',
        dataType:'text',
        error:function(XMLHttpRequest,testStatus,errorThrown){
            alert('error message: '+ errorThrown.toString());
        },
        success:function(res){
            var response = JSON.parse(res);

            response.forEach(function(e){
                if(e.beizhu=='NA'|| e.beizhu==null){
                    e.beizhu=null;
                }
            });

            var hlyTable = $('#modify_hly').DataTable({
                data:response,
                columns:[
                    {'data':'gh_id','name':'管护区','title':'管护区'},
                    {'data':'cun','name':'村','title':'村'},
                    {'data':'name','name':'姓名','title':'姓名'},
                    {'data':'guanhuaera','name':'管护面积','title':'管护面积'},
                    {'data':'beizhu','name':'备注','title':'备注'}
                ],
                columnfDefs:[
                    {width:45,targets:0}
                ],
                'pagingType':'simple_numbers',
                "language":{
                    "sLengthMenu":"每页显示 _MENU_ 条记录",
                    "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sFirst":    "第一页",
                        "sPrevious": " 上一页 ",
                        "sNext":     " 下一页 ",
                        "sLast":     " 最后一页 "
                    },
                    "zeroRecords":'没有查询到数据'
                },
                'bInfo':false,
                dom:'<ftp>',
                "lengthChange":false,
                "bAutoWidth":false,
                "paging":true,
                responsive:true,
                destroy:true
            });

            $('#modify_hly tbody').on('click','tr',function(){
                var singlehlyData = [];
                singlehlyData.push(hlyTable.row(this).data());

                if(typeof (singlehlyData[0])!= "undefined"){
                    $.ajax({
                        url:'/forestprotect/hulinyuan/'+singlehlyData[0].gh_id,
                        type:'GET',
                        dataType:'text',
                        error:function(XMLHttpRequest,textStatus,errorThrown){
                            alert('error message: '+errorThrown.toString());
                        },
                        success:function(res){
                            var response = JSON.parse(res);

                            if(response.all.length ==0){
                                alert('此护林员信息有误，请核实');
                                return;
                            }
                            response.personal[0].guanhuaera=singlehlyData[0].guanhuaera;
                            response.personal[0].name=singlehlyData[0].name;
                            response.personal[0].cun=singlehlyData[0].cun;
                            response.personal[0].gh_id=singlehlyData[0].gh_id;
                            response.personal[0].beizhu=singlehlyData[0].beizhu;

                            $('#modify_gh_id').val(response.personal[0].gh_id);
                            $('#modify_xingming').val(response.personal[0].name);
                            $('#modify_shenfen_id').val(response.personal[0].id);
                            $('#modify_hetong_id').val(response.personal[0].hetongNo);
                            $('#modify_cun_hly').val(response.personal[0].cun);
                            $('#modify_daogang_sj').val(response.personal[0].daogang);
                            $('#modify_ligang_sj').val(response.personal[0].ligang);
                            $('#modify_beizhu').val(response.personal[0].beizhu);

                            modifyhly.gh_id = response.personal[0].gh_id;
                            modifyhly.xingming = response.personal[0].name;
                            modifyhly.shenfen_id = response.personal[0].hetongNo;
                            modifyhly.cun_hly = response.personal[0].cun;
                            modifyhly.daogang_sj = response.personal[0].daogang;
                            modifyhly.ligang_sj = response.personal[0].ligang;
                            modifyhly.beizhu = response.personal[0].beizhu;
                            //console.log(response.protect);

                            var wfsUrl = geoserverUrl+'/wfs';
                            var featureRequest = mapModule.layerFuncs.getFeatureRequest({
                                featureTypes:[layersAttr.layerNames.hulinyuan],
                                filter:ol.format.filter.equalTo('gh_id',singlehlyData[0].gh_id)
                            });
                            fetch(wfsUrl,{
                                method:'POST',
                                body:new XMLSerializer().serializeToString(featureRequest)
                            }).then(function(response){
                                return response.json();
                            }).then(function(json){
                                var features = new ol.format.GeoJSON().readFeatures(json);
                                mapLayerSource.vecLayerSource.xbm_source.clear();
                                mapLayerSource.vecLayerSource.xbm_source.addFeatures(features);
                                modifyhly.featuresarray = features;
                                features.forEach(function(value){
                                   modifyhly.featuresextent.push(value.getGeometry().getExtent());
                                });
                                mapModule.vecLayer.setSource(mapLayerSource.vecLayerSource.xbm_source);
                                map.getView().fit(mapLayerSource.vecLayerSource.xbm_source.getExtent(),{duration:200});

                                mapModule.selectedfeatures.clear();
                                mapLayerSource.vecLayerSource.xbm_source.getFeatures().forEach(function(value){
                                    mapModule.selectedfeatures.push(value);
                                });
                                //modifyhly.featuresarray = mapModule.selectedfeatures.getArray();

                                $('.ui.label > .delete.icon').click(function(){
                                    console.log($(this).parent().attr("value"));
                                    mapModule.selectedfeatures.removeAt(parseInt($(this).parent().attr("value")));
                                    $(this).parent().remove();
                                    modifiedhly.featuresarray = mapModule.selectedfeatures.getArray();
                                    $('#modify_hlyxiaoban').children().each(function(index){
                                        $(this).attr('value',index);
                                    })
                                });
                                //mapModule.selectedfeatures.clear();

                            });
                            $('#layerUp').attr('disabled','disabled');
                        }
                    });
                }
            })
        }
    });
});
$('#modifytongbu').click(function(){
    if($('#modifyhlyinfoform').form('is valid') && modifiedhly.featuresarray.length>=1){
        $('#tongbuloading').modal('show');
        modifiedhly.gh_id=$('#modify_gh_id').val();
        modifiedhly.xingming=$('#modify_xingming').val();
        modifiedhly.shenfen_id=$('#modify_shenfen_id').val();
        modifiedhly.hetong_id = $('#modify_hetong_id').val();
        modifiedhly.cun_hly=$('#modify_cun_hly').val();
        modifiedhly.daogang_sj=$('#modify_daogang_sj').val();
        modifiedhly.ligang_sj = $('#modify_ligang_sj').val();
        modifiedhly.beizhu = $('#modify_beizhu').val();
        var options = {
            srsName:'EPSG:2342',
            featureNS:layersAttr.workspace_test,
            featurePrefix:layersAttr.workspace_test,
            featureType:[layersAttr.layerNames.hulinyuan]
        };
        if((modifiedhly.hetong_id==modifyhly.hetong_id)&&
            (modifiedhly.daogang_sj==modifyhly.daogang_sj)&&
            (modifiedhly.ligang_sj==modifyhly.ligang_sj)&&
            (modifiedhly.beizhu==modifiedhly.beizhu)){
            modifiedhly.featuresarray.forEach(function(value){
                if(value.getId().split('.')[0]=='maqinxian_xbm'){
                    wfst.insert()
                }
            });

        }else{
            modifiedhly.featuresarray.forEach(function(value){
                if(value.getId().split('.')[0]=='maqinxian_hulinyuan'){
                    wfst.update();
                }
                if(value.getId().split('.')[0]=='maqinxian_xbm'){
                    wfst.insert();
                }
            });
        }


        /*for(var i = 0; i<hulinyuan.featuresarray.length;i++){
         var value = hulinyuan.featuresarray[i];
         value.set('gh_id',hulinyuan.gh_id);
         value.set('shenfen_id',hulinyuan.shenfen_id);
         value.set('hetong_id',hulinyuan.hetong_id);
         value.set('daogang_sj',hulinyuan.daogang_sj);
         value.set('ligang_sj',hulinyuan.ligang_sj);
         value.set('xingming',hulinyuan.xingming);
         value.set('cun_hly',hulinyuan.cun_hly);
         value.set('beizhu',hulinyuan.beizhu);
         var properties = value.getProperties();
         delete properties.xlbxb;
         delete properties.mianji_he;

         wfst.insert(hulinyuan.featuresarray[i],options);
         }*/
    }else{
        $('#errorMessage .description').html('信息存在错误，请核实！');
        $('#errorMessage').modal('show');
    }
});
////删除功能
var deletehly = new Hulinyuan();
$('#deleteLeftSidebar,#deleteRightSidebar').sidebar('setting',{
    transition:'overlay',
    dimPage:false,
    closable:false
}).sidebar('hide');
$('#delete').click(function(){
    $('.ui.sidebar').sidebar('hide');
    $('#deleteLeftSidebar').sidebar('show');
    $('#deleteRightSidebar').sidebar('show');
    $.ajax({
        url:'hulinyuan/all',
        type:'GET',
        dataType:'text',
        error:function(XMLHttpRequest,testStatus,errorThrown){
            alert('error message: '+ errorThrown.toString());
        },
        success:function(res){
            var response = JSON.parse(res);

            response.forEach(function(e){
                if(e.beizhu=='NA'|| e.beizhu==null){
                    e.beizhu=null;
                }
            });

            var hlyTable = $('#delete_hly').DataTable({
                data:response,
                columns:[
                    {'data':'gh_id','name':'管护区','title':'管护区'},
                    {'data':'cun','name':'村','title':'村'},
                    {'data':'name','name':'姓名','title':'姓名'},
                    {'data':'guanhuaera','name':'管护面积','title':'管护面积'},
                    {'data':'beizhu','name':'备注','title':'备注'}
                ],
                columnfDefs:[
                    {width:45,targets:0}
                ],
                'pagingType':'simple_numbers',
                "language":{
                    "sLengthMenu":"每页显示 _MENU_ 条记录",
                    "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sFirst":    "第一页",
                        "sPrevious": " 上一页 ",
                        "sNext":     " 下一页 ",
                        "sLast":     " 最后一页 "
                    },
                    "zeroRecords":'没有查询到数据'
                },
                'bInfo':false,
                dom:'<ftp>',
                "lengthChange":false,
                "bAutoWidth":false,
                "paging":true,
                responsive:true,
                destroy:true
            });

            $('#delete_hly tbody').on('click','tr',function(){
                var singlehlyData = [];
                singlehlyData.push(hlyTable.row(this).data());

                if(typeof (singlehlyData[0])!= "undefined"){
                    $.ajax({
                        url:'/forestprotect/hulinyuan/'+singlehlyData[0].gh_id,
                        type:'GET',
                        dataType:'text',
                        error:function(XMLHttpRequest,textStatus,errorThrown){
                            alert('error message: '+errorThrown.toString());
                        },
                        success:function(res){
                            var response = JSON.parse(res);

                            if(response.all.length ==0){
                                alert('此护林员信息有误，请核实');
                                return;
                            }
                            response.personal[0].guanhuaera=singlehlyData[0].guanhuaera;
                            response.personal[0].name=singlehlyData[0].name;
                            response.personal[0].cun=singlehlyData[0].cun;
                            response.personal[0].gh_id=singlehlyData[0].gh_id;
                            response.personal[0].beizhu=singlehlyData[0].beizhu;
                            var personal_info =[];
                            for (var key in response.personal[0]){
                                personal_info.push({
                                    colName:initConst.colNames['personal'][key],
                                    colValue:response.personal[0][key]
                                })
                            }

                            deletehly.gh_id = response.personal[0].gh_id;
                            deletehly.xingming = response.personal[0].name;
                            deletehly.shenfen_id=response.personal[0].id;
                            deletehly.hetong_id = response.personal[0].hetongNo;
                            deletehly.cun_hly = response.personal[0].cun;
                            deletehly.daogang_sj = response.personal[0].daogang;
                            deletehly.ligang_sj = response.personal[0].ligang;
                            deletehly.beizhu = response.personal[0].beizhu;

                            var hly_personalTable = $('#delete_hlydetail').DataTable({
                                data:personal_info,
                                columns:[
                                    {'data':'colName','name':'人员属性','title':'人员属性'},
                                    {'data':'colValue','name':'人员属性值','title':'人员属性值'}
                                ],
                                pagingType:'simple_numbers',
                                "ordering":false,
                                'bInfo':false,
                                'bLengthChange':false,
                                'bFilter':false,
                                'bAutoWidth':true,
                                'paging':false,
                                dom:'<<t>ip>',
                                destroy:true
                            });
                            //console.log(response.protect);
                            var html = '';
                            response.protect.forEach(function(value,index){
                                html=html
                                    +'<div class="ui label transition visible" value="'+index+'" ' +
                                    'style="display:inline-block !important;margin:0.1em;">' +
                                    value.xzc
                                    + "L" + value.linban
                                    + "X" + value.xiaoban
                                    + "xxb" + value.xxb
                                    +'</div>';
                            });
                            $('#delete_hlyxiaoban .ui.label').detach();
                            $('#delete_hlyxiaoban').append(html);

                            var wfsUrl = geoserverUrl+'/wfs';
                            var featureRequest = mapModule.layerFuncs.getFeatureRequest({
                                featureTypes:[layersAttr.layerNames.hulinyuan],
                                filter:ol.format.filter.equalTo('gh_id',singlehlyData[0].gh_id)
                            });
                            mapModule.layerFuncs.fetchaddFeatures(wfsUrl,featureRequest,
                                mapLayerSource.vecLayerSource.xbm_source);
                            deletehly.featuresarray = mapLayerSource.vecLayerSource.xbm_source.getFeatures();
                            $('#layerUp').attr('disabled','disabled');
                        }
                    });
                }
            })
        }
    });
});
$('#deletetongbu').click(function(){

    if(deletehly.featuresarray.length==0||deletehly.gh_id==null){
        $('#errorMessage .description').html('信息存在错误，请核实！');
        $('#errorMessage').modal('show');
    }else{
        var options = {
            srsName:'EPSG:2342',
            featureNS:layersAttr.workspace_test,
            featurePrefix:layersAttr.workspace_test,
            featureType:[layersAttr.layerNames.hulinyuan]
        };
        deletehly.featuresarray.forEach(function(value){
            wfst.delete(value,options);
        })
    }
});