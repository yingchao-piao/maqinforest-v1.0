/**
 * Created by hwt on 2017/8/23.
 */
var geoserverUrl = 'http://localhost:8080/geoserver/';

///geoserver发布的工作空间、测试工作空间、图层的名称
var layersAttr = {
    workspace:'maqin-geo',
    workspace_test : 'maqin_test',
    layerNames:{
        lt8:'maqin_LT8_linear2_alpha',
        xzj:'maqinxian_xzj',
        lbj:'maqinxian_lbj',
        xbm:'maqinxian_xbm',
        hulinyuan:'maqinxian_hulinyuan'
    }
};
////openlayers上图层的style:默认为defaultstyle,Select Interaction的选中元素应用selectedStyle
var layerStyle ={
    defaultstyle:new ol.style.Style({
        fill:new ol.style.Fill({
            color:'rgba(255,255,255,0)'
        }),
        stroke:new ol.style.Stroke({
            color:'#ff0',
            width:2
        }),
        text:new ol.style.Text({
            fill:new ol.style.Fill({
                color:'#f00'
            }),
            stroke:new ol.style.Stroke({
                color:'#fff',
                width:3
            })
        })
    }),
    selectedStyle:new ol.style.Style({
        fill:new ol.style.Fill({
            color:'rgba(255,255,255,0)'
        }),
        stroke:new ol.style.Stroke({
            color:[0,153,255,1],
            width:3
        }),
        text:new ol.style.Text({
            fill:new ol.style.Fill({
                color:'#f00'
            }),
            stroke:new ol.style.Stroke({
                color:'#fff',
                width:3
            })
        })
    })
};
///openlayers各图层source
var mapLayerSource={
    baseLayerSource:{
        lt8_source:new ol.source.TileWMS({
            url:geoserverUrl+'wms',
            params:{
                'LAYERS':layersAttr.workspace+':'+layersAttr.layerNames.lt8
            }
        }),
        xbm_wms_source:new ol.source.TileWMS({
            url:geoserverUrl+'wms',
            params:{
                'LAYERS':layersAttr.workspace_test+':'+layersAttr.layerNames.xbm,
                'TILED':true
            }
        })
    },
    vecLayerSource:{
        xzj_source:new ol.source.Vector({
            format:new ol.format.GeoJSON(),
            url:function(extent){
                return geoserverUrl+'wfs?service=WFS&' +
                    'version=1.10&request=GetFeature&' +
                    'typename='+layersAttr.workspace_test+':'+layersAttr.layerNames.xzj+
                    '&outputFormat=application/json' +
                    '&srsname=EPSG:3857&' +
                    'bbox='+extent.join(',')+',EPSG:3857'
            },
            strategy:ol.loadingstrategy.bbox
        }),
        lbj_source:new ol.source.Vector({}),
        xbm_source:new ol.source.Vector({}),
        hulinyuan_source:new ol.source.Vector({})
    }

};
/////构建mapModule对象用来初始化map相关属性
var mapModule ={
    baseLayer: new ol.layer.Tile({
        source:mapLayerSource.baseLayerSource.lt8_source
    }),
    vecLayer:new ol.layer.Vector({
        source:mapLayerSource.vecLayerSource.xzj_source,
        style:function(feature){
            var text = mapModule.layerFuncs.setStyleText(feature);
            layerStyle.defaultstyle.getText().setFont('Normal 15px Microsoft Yahei');
            layerStyle.defaultstyle.getText().setText(text);
            return layerStyle.defaultstyle;
        }
    }),
    defaultView:new ol.View({
        center:ol.proj.transform([99.895,34.51],'EPSG:4326','EPSG:3857'),
        zoom:9
    })
};

var map = new ol.Map({
    target:'map',
    layers:[
        mapModule.baseLayer,
        mapModule.vecLayer
    ],
    controls:ol.control.defaults({
        attribution:false,
        zoom:false
    }),
    view:mapModule.defaultView
});
/////map的select interaction及其配置
var selectedFeaturesAdd = function(event,option,selectedFeatures){
    var feature = event.target.item(0);
    var wfsUrl = geoserverUrl+'wfs/';
    if(feature.getId()!==undefined){
        var fid = feature.getId();
        var layerName = fid.split('.')[0];
        if(layerName == layersAttr.layerNames.xzj){
            var featureRequest = mapModule.layerFuncs.getFeatureRequest({
                featureTypes: [layersAttr.layerNames.lbj],
                filter: ol.format.filter.equalTo('xiang_name', feature.get('xiang_name'))
            });
            mapModule.layerFuncs.fetchaddFeatures(wfsUrl, featureRequest,
                mapLayerSource.vecLayerSource.lbj_source);
        }
        if (layerName === layersAttr.layerNames.lbj) {
            var featureRequest = mapModule.layerFuncs.getFeatureRequest({
                featureTypes: [layersAttr.layerNames.xbm],
                filter: ol.format.filter.and(
                    ol.format.filter.equalTo('xiang', feature.get('xiang_name')),
                    ol.format.filter.equalTo('lin_ban', feature.get('lin_ban'))
                )
            });
            mapModule.layerFuncs.fetchaddFeatures(wfsUrl, featureRequest,
                mapLayerSource.vecLayerSource.xbm_source);

        }
        if(option=='default'){
            if (layerName === layersAttr.layerNames.xbm) {
                mapModule.layerFuncs.getxbminfo(feature);
            }
            if (layerName === layersAttr.layerNames.hulinyuan) {
                mapModule.layerFuncs.getxbminfo(feature);
            }
        }
        if(option == 'split'){
            if(layerName === layersAttr.layerNames.xbm){
                ////切分工具---选取小班
                besplitpolygon = new BeSplitPolygon(feature);
                getCounts(besplitpolygon);
                //$('#xiaoban label').html('请选取需要切分的小班:');
                /*var xzc = Object.keys(initConst.xzcid).filter(function(x){
                 return initConst.xzcid[x]==featureProperties.xiang;
                 });*/
                $('#xiaoban textarea').val(featureProperties.xiang
                    + "L" + featureProperties.lin_ban
                    + "X" + featureProperties.xiao_ban
                    + "xxb" + featureProperties.xxb);
            }
        }
        if(option == 'union'){
            if(layerName == layersAttr.layerNames.xbm){
                if($.inArray(feature,unionobj.xxbFeatures)===-1){
                    unionobj.xxbFeatures.push(feature);
                    if(unionobj.xxbFeatures.length==1){
                        $('#unionxxb1 textarea').val(featureProperties.xiang
                            + "L" + featureProperties.lin_ban
                            + "X" + featureProperties.xiao_ban
                            + "xxb" + featureProperties.xxb);
                    }
                    if(unionobj.xxbFeatures.length==2){
                        $('#unionxxb2 textarea').val(featureProperties.xiang
                            + "L" + featureProperties.lin_ban
                            + "X" + featureProperties.xiao_ban
                            + "xxb" + featureProperties.xxb);
                    }
                }
            }
        }
        if(option == 'add'){
            if(layerName === layersAttr.layerNames.xbm){
                hulinyuan.featuresarray = selectedFeatures.getArray();
                var html ='';

                hulinyuan.featuresarray.forEach(function(value,index){
                    var featureProperties = value.getProperties();
                    html=html
                        +'<div class="ui label transition visible" value="'+index+'" ' +
                        'style="display:inline-block !important;margin:0.1em;">' +
                        featureProperties.xiang
                        + "L" + featureProperties.lin_ban
                        + "X" + featureProperties.xiao_ban
                        + "xxb" + featureProperties.xxb
                        +'<i class="delete icon"></i>'
                        +'</div>';
                });
                $('#addxiaoban .ui.label').detach();
                $('#addxiaoban').append(html);

                $('.ui.label > .delete.icon').click(function(){
                    console.log($(this).parent().attr("value"));
                    selectedFeatures.removeAt(parseInt($(this).parent().attr("value")));
                    $(this).parent().remove();
                    hulinyuan.featuresarray = selectedFeatures.getArray();
                    $('#addxiaoban').children().each(function(index){
                        $(this).attr('value',index);
                    })
                });
            }
        }
        if(option == 'modify'){
            if(layerName === layersAttr.layerNames.hulinyuan){
                modifiedhly.featuresarray = selectedFeatures.getArray();
                var html ='';

                modifiedhly.featuresarray.forEach(function(value,index){
                    var featureProperties = value.getProperties();
                    html=html
                        +'<div class="ui label transition visible" value="'+index+'" ' +
                        'style="display:inline-block !important;margin:0.1em;">' +
                        featureProperties.xiang
                        + "L" + featureProperties.lin_ban
                        + "X" + featureProperties.xiao_ban
                        + "xxb" + featureProperties.xxb
                        +'<i class="delete icon"></i>'
                        +'</div>';
                });
                $('#modify_hlyxiaoban .ui.label').detach();
                $('#modify_hlyxiaoban').append(html);

                $('.ui.label > .delete.icon').click(function(){
                    console.log($(this).parent().attr("value"));
                    selectedFeatures.removeAt(parseInt($(this).parent().attr("value")));
                    $(this).parent().remove();
                    modifiedhly.featuresarray = selectedFeatures.getArray();
                    $('#modify_hlyxiaoban').children().each(function(index){
                        $(this).attr('value',index);
                    })
                });
            }
            if(layerName === layersAttr.layerNames.xbm){
                modifiedhly.featuresarray = selectedFeatures.getArray();
                var html = '';
                modifiedhly.featuresarray.forEach(function(value,index){
                    var featureProperties = value.getProperties();
                    html=html
                        +'<div class="ui label transition visible" value="'+index+'" ' +
                        'style="display:inline-block !important;margin:0.1em;">' +
                        featureProperties.xiang
                        + "L" + featureProperties.lin_ban
                        + "X" + featureProperties.xiao_ban
                        + "xxb" + featureProperties.xxb
                        +'<i class="delete icon"></i>'
                        +'</div>';
                });
                $('#modify_hlyxiaoban .ui.label').detach();
                $('#modify_hlyxiaoban').append(html);

                $('.ui.label > .delete.icon').click(function(){
                    console.log($(this).parent().attr("value"));
                    selectedFeatures.removeAt(parseInt($(this).parent().attr("value")));
                    $(this).parent().remove();
                    modifiedhly.featuresarray = selectedFeatures.getArray();
                    $('#modify_hlyxiaoban').children().each(function(index){
                        $(this).attr('value',index);
                    })
                });

            }
        }
    }
};
var selectedFeaturesRemove = function(event,option,selectedFeatures){
    var wfsUrl = geoserverUrl+'wfs/';
    if(option == 'add'){
        hulinyuan.featuresarray = selectedFeatures.getArray();
        var html = '';
        hulinyuan.featuresarray.forEach(function(value,index){
            var featureProperties = value.getProperties();
            html=html
                +'<div class="ui label transition visible" value="'+index+'" ' +
                'style="display:inline-block !important;margin:0.1em;">' +
                featureProperties.xiang
                + "L" + featureProperties.lin_ban
                + "X" + featureProperties.xiao_ban
                + "xxb" + featureProperties.xxb
                +'<i class="delete icon"></i>'
                +'</div>';
        });
        $('#addxiaoban .ui.label').detach();
        $('#addxiaoban').append(html);

        $('.ui.label > .delete.icon').click(function(){
            console.log($(this).parent().attr("value"));
            selectedFeatures.removeAt(parseInt($(this).parent().attr("value")));
            $(this).parent().remove();
            modifyhly.featuresarray = selectedFeatures.getArray();
            $('#addxiaoban').children().each(function(index){
                $(this).attr('value',index);
            })
        });
    }
    if(option == 'modify'){
        modifiedhly.featuresarray = selectedFeatures.getArray();
        var html = '';
        modifiedhly.featuresarray.forEach(function(value,index){
            var featureProperties = value.getProperties();
            html=html
                +'<div class="ui label transition visible" value="'+index+'" ' +
                'style="display:inline-block !important;margin:0.1em;">' +
                featureProperties.xiang
                + "L" + featureProperties.lin_ban
                + "X" + featureProperties.xiao_ban
                + "xxb" + featureProperties.xxb
                +'<i class="delete icon"></i>'
                +'</div>';
        });
        $('#modify_hlyxiaoban .ui.label').detach();
        $('#modify_hlyxiaoban').append(html);

        $('.ui.label > .delete.icon').click(function(){
            console.log($(this).parent().attr("value"));
            selectedFeatures.removeAt(parseInt($(this).parent().attr("value")));
            $(this).parent().remove();
            modifiedhly.featuresarray = selectedFeatures.getArray();
            $('#modify_hlyxiaoban').children().each(function(index){
                $(this).attr('value',index);
            })
        });
    }
};
mapModule.selectinteractions = function(option){
    var select = new ol.interaction.Select({
        condition:ol.events.condition.singleClick,
        layers:[mapModule.vecLayer],
        style:function(feature){
            var selectedStyle = layerStyle.selectedStyle;
            var text=mapModule.layerFuncs.setStyleText(feature);
            selectedStyle.getText().setFont('Normal 15px Microsoft Yahei');
            selectedStyle.getText().setText(text);
            return selectedStyle;
        }
    });
    var selectedFeatures = select.getFeatures();

    if(option=='default'){
        selectedFeatures.on('add',function(e){
            selectedFeaturesAdd(e,option,selectedFeatures)
        });
    }
    if(option =='split'){
        selectedFeatures.on('add',function(e){
            selectedFeaturesAdd(e,option,selectedFeatures)
        });
    }
    if(option =='union'){
        ////合并工具--选取细小班
        selectedFeatures.on('add',function(e){
            selectedFeaturesAdd(e,option,selectedFeatures)
        });
    }
    if(option == 'add'){
        ////新增护林员--选取小班
        select = new ol.interaction.Select({
            //在选中元素外点击，不会改变已选中元素的状态
            condition:function(event){
                if(event.type === 'singleclick'){
                    return map.forEachFeatureAtPixel(event.pixel,function(){
                        return true;
                    });
                }
                return false;
            },
            layers:[mapModule.vecLayer],
            style:function(feature){
                var selectedStyle = layerStyle.selectedStyle;
                var text=mapModule.layerFuncs.setStyleText(feature);
                selectedStyle.getText().setFont('Normal 15px Microsoft Yahei');
                selectedStyle.getText().setText(text);
                return selectedStyle;
            }
        });
        selectedFeatures = select.getFeatures();
        selectedFeatures.on('add',function(e){
            selectedFeaturesAdd(e,option,selectedFeatures);
        });
        selectedFeatures.on('remove',function(e){
            selectedFeaturesRemove(e,option,selectedFeatures);
        });
    }
    if(option=='modify'){
        select = new ol.interaction.Select({
            //在选中元素外点击，不会改变已选中元素的状态
            condition:function(event){
                if(event.type === 'singleclick'){
                    return map.forEachFeatureAtPixel(event.pixel,function(){
                        return true;
                    });
                }
                return false;
            },
            layers:[mapModule.vecLayer],
            style:function(feature){
                var selectedStyle = layerStyle.selectedStyle;
                var text=mapModule.layerFuncs.setStyleText(feature);
                selectedStyle.getText().setFont('Normal 15px Microsoft Yahei');
                selectedStyle.getText().setText(text);
                return selectedStyle;
            }
        });
        selectedFeatures = select.getFeatures();

        selectedFeatures.on('add',function(e){
            selectedFeaturesAdd(e,option,selectedFeatures);
        });
        selectedFeatures.on('remove',function(e){
            selectedFeaturesRemove(e,option,selectedFeatures);
        });
    }
    return select;
};
mapModule.selectinteraction = mapModule.selectinteractions('default');
map.addInteraction(mapModule.selectinteraction);
mapModule.selectedfeatures=mapModule.selectinteraction.getFeatures();

mapModule.layerFuncs ={
    setStyleText:function(feature){
        var xiang=feature.get('xiang_name');
        var linban=feature.get('lin_ban');
        var xiaoban=feature.get('xiao_ban');
        var xxb=feature.get('xxb');
        var text;
        if(xiang!==undefined&&linban===undefined&&xiaoban===undefined){
            text=xiang;
            return text;
        }
        if(linban!==undefined&&xiaoban===undefined){
            text=linban;
            return linban;
        }
        if(xiaoban!==undefined){
            text = xiaoban+'xxb'+xxb;
            return text;
        }
    },
    getFeatureRequest:function(options){
        var request = $.extend(true,{},{
            srsName:'EPSG:3857',
            featureNS:layersAttr.workspace_test,
            featurePrefix:layersAttr.workspace_test,
            featureTypes:null,
            outputFormat:'application/json',
            filter:null
        },options);
        return new ol.format.WFS().writeGetFeature(request);
    },
    fetchaddFeatures:function(url,featureRequest,targetLayerSource){
        fetch(url,{
            method:'POST',
            body:new XMLSerializer().serializeToString(featureRequest)
        }).then(function(response){
            return response.json();
        }).then(function(json){
            var features = new ol.format.GeoJSON().readFeatures(json);
            targetLayerSource.clear();
            targetLayerSource.addFeatures(features);
            mapModule.vecLayer.setSource(targetLayerSource);
            mapModule.selectedfeatures.clear();
            map.getView().fit(targetLayerSource.getExtent(),{duration:200});
        });
    },
    getxbminfo:function(feature){
        var properties = feature.getProperties();
        delete properties.geometry;
        var featureValues = [];
        for (var key in properties){
            featureValues.push({
                columnName:initConst.colNames["protect"][key],
                columnValue:properties[key]
            })
        }
        $('#hly_xiaoban').dataTable({
            data:featureValues.slice(0,42),
            columns:[
                {'data':'columnName','name':'小班属性','title':'小班属性'},
                {'data':'columnValue','name':'属性值','title':'属性值'}
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
    },
    layerUp:function(){
        var layerSource = mapModule.vecLayer.getSource();
        if(layerSource ==mapLayerSource.vecLayerSource.xzj_source){
            map.setView(mapModule.defaultView);
        }
        if(layerSource == mapLayerSource.vecLayerSource.lbj_source){
            mapModule.vecLayer.setSource(mapLayerSource.vecLayerSource.xzj_source);
            map.getView().fit(mapModule.vecLayer.getSource().getExtent(),{during:200});
        }
        if (layerSource == mapLayerSource.vecLayerSource.xbm_source){
            mapModule.vecLayer.setSource(mapLayerSource.vecLayerSource.lbj_source);
            map.getView().fit(mapModule.vecLayer.getSource().getExtent(),{during:200});
            mapModule.selectedfeatures.clear();
        }
    }
};