/**
 * Created by hwt on 2017/5/31.
 */
$('#layerUp').click(function(){
    layerCtrlFuncs.layerUp();
    $('.xbminfoclose').click();
});
$('#homePage').click(function(){
    map.removeLayer(map.getLayers().item(1));
    map.addLayer(geoLayers.vecLayersCollection.item(0));
    map.setView(new ol.View({
        center:ol.proj.transform([99.895,34.51],'EPSG:4326','EPSG:3857'),
        zoom:9
    }));
    $('.xbminfoclose').click();
    $('#layerUp').removeAttr('disabled');
});
$('#zoomIn').click(function(){
    map.getView().setZoom(map.getView().getZoom()+1);
});
$('#zoomOut').click(function(){
    map.getView().setZoom(map.getView().getZoom()-1);
});
$('#choosebaseLayer').click(function(){
    $('#baseLayers').transition('fade left');
});

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

$('#search').click(function(){
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
            url:'/forestresources/map/search/'+value,
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
                        response[i].linban+'">'+response[i].linban+'</div>';
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
                url:'/forestresources/map/search/'+id,
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
                            response[i].xiaoban+'">'+response[i].xiaoban+'</div>';
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
    if(xzc==="" || linbanid==="" || xiaobanid ===""){
        $('#alertMessage').modal('attach events','#searchModal .field .button').modal(
            'setting','closable',false
        ).modal({
                allowMultiple:true
            });
    }else{

        var wfsUrl = geoserverUrl+'wfs/';
        featureRequest = layerCtrlFuncs.getFeatureRequest({
            featureTypes:['maqinxian_xbmgh_id'],
            filter:ol.format.filter.and(
                ol.format.filter.equalTo('xiang',initConst.xzcid[xzc]),
                ol.format.filter.equalTo('lin_ban',linbanid),
                ol.format.filter.equalTo('xiao_ban',xiaobanid)
            )
        });
        map.removeLayer(map.getLayers().item(1));
        layerCtrlFuncs.fetchaddFeatures(wfsUrl,featureRequest,
            geoLayers.vecLayersCollection.item(2).getSource(),
            geoLayers.vecLayersCollection.item(2));
        $('#layerUp').attr('disabled','disabled');
        $('#searchModal').modal('hide');
    }

});