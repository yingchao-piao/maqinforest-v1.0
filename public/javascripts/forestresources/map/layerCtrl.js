/**
 * Created by hwt on 2017/5/25.
 */
var geoserverUrl = 'http://localhost:8080/geoserver/';
//var geoserverUrl = 'http://192.168.224.236:8181/geoserver/';

var initGeoLayers = function(geoserverUrl){

    var style = new ol.style.Style({
        fill:new ol.style.Fill({
            color:'rgba(255,255,255,0.1)'
        }),
        stroke:new ol.style.Stroke({
            color:'black',
            width: 1
        }),
        text: new ol.style.Text({
            font:'15px Times New Roman,Song',
            fill:new ol.style.Fill({
                color:'#000'
            }),
            stroke:new ol.style.Stroke({
                color:'#fff',
                width:3
            })
        })
    });
    var wmsLayersCollection = new ol.Collection();
    var maqin_lbj_wms = new ol.layer.Tile({
        opacity:1,
        source:new ol.source.TileWMS({
            url:geoserverUrl+'wms',
            params:{
                'LAYERS':'maqin-geo:maqinxian_lbj',
                'TILED':true
            },
            servetType:'geoserver'
        })
    });
    var maqin_xbm_wms = new ol.layer.Tile({
        source:new ol.source.TileWMS({
            url:geoserverUrl+'wms',
            params:{
                'LAYERS':'maqin-geo:maqinxian_xbm',
                'TILED':true
            },
            serverType:'geoserver'
        })
    });
    wmsLayersCollection.push(maqin_lbj_wms);
    wmsLayersCollection.push(maqin_xbm_wms);

    var vecLayersCollection = new ol.Collection();
    var maqin_xzj = new ol.layer.Vector({
        source:new ol.source.Vector({
            format:new ol.format.GeoJSON(),
            url:function(extent){
                return geoserverUrl+'wfs?service=WFS&' +
                    'version=1.1.0&request=GetFeature&' +
                    'typename=maqin-geo:maqinxian_xzj&' +
                    'outputFormat=application/json&srsname=EPSG:3857&' +
                    'bbox='+extent.join(',')+',EPSG:3857'
            },
            strategy:ol.loadingstrategy.bbox
        }),
        style:function(feature){
            style.getText().setText(feature.get('xiang_name'));
            return style;
        }
    });
    var maqin_lbj = new ol.layer.Vector({
        source:new ol.source.Vector({}),
        style:function(feature){
            style.getText().setFont('Normal 5px sans-serif');
            style.getText().setText(feature.get('lin_ban'));
            return style;
        }
    });
    var maqin_xbm = new ol.layer.Vector({
        source:new ol.source.Vector({}),
        style:function(feature){
            style.getText().setText(feature.get('xiao_ban'));
            return style;
        }
    });
    vecLayersCollection.push(maqin_xzj);
    vecLayersCollection.push(maqin_lbj);
    vecLayersCollection.push(maqin_xbm);

    return {
        wmsLayersCollection:wmsLayersCollection,
        vecLayersCollection:vecLayersCollection
    }
};

var geoLayers = initGeoLayers(geoserverUrl);
var selectPointerMove = new ol.interaction.Select({
    condition:ol.events.condition.singleClick
});
var selectedFeatures = selectPointerMove.getFeatures();
var initView = new ol.View({
    center:ol.proj.transform([99.895,34.51],'EPSG:4326','EPSG:3857'),
    zoom:9
});
var map = new ol.Map({
    target:'map',
    layers:[
        geoLayers.wmsLayersCollection.item(1),
        geoLayers.vecLayersCollection.item(0)
    ],
    controls:ol.control.defaults({
        attribution:false,
        zoom:false
    }),
    view:initView
});
map.addInteraction(selectPointerMove);

var layerCtrlFuncs = {
    getFeatureRequest:function(options){
        var request = $.extend(true,{},{
            srsName:'EPSG:3857',
            featureNS:'maqin-geo',
            featurePrefix:'maqin-geo',
            featureTypes:null,
            outputFormat:'application/json',
            filter:null
        },options);
        return new ol.format.WFS().writeGetFeature(request);
    },
    fetchaddFeatures:function(url,featureRequest,targetLayerSource,targetLayer){
        fetch(url,{
            method:'POST',
            body:new XMLSerializer().serializeToString(featureRequest)
        }).then(function(response){
            return response.json();
        }).then(function(json){
            var features = new ol.format.GeoJSON().readFeatures(json);
            targetLayerSource.clear();
            targetLayerSource.addFeatures(features);
            map.addLayer(targetLayer);
            map.getView().fit(targetLayerSource.getExtent(),{duration:200});
        });
    },
    selectFeatures:function selectFeatures(layer,properties){
        var features = new Array();
        var tag;

        if($.isPlainObject(properties)){
            layer.getSource().getFeatures().forEach(function(e){
                for(var name in properties){
                    if(e.getProperties().hasOwnProperty(name)){
                        tag = e.getProperties()[name]==properties[name];
                    }
                }
                if(tag){
                    features.push(e);
                }
            });
        }else{
            console.log('properties is not plainobject');
        }
        return features;
    },
    layerUp:function(){
        var layerIndex = geoLayers.vecLayersCollection.getArray().indexOf(map.getLayers().item(1));
        selectedFeatures.clear();
        switch (layerIndex){
            case 0:
                map.setView(new ol.View({
                    center:ol.proj.transform([99.895,34.51],'EPSG:4326','EPSG:3857'),
                    zoom:9
                }));
                break;
            case 1:
                map.removeLayer(geoLayers.vecLayersCollection.item(1));
                map.addLayer(geoLayers.vecLayersCollection.item(0));
                map.setView(new ol.View({
                    center:ol.proj.transform([99.895,34.51],'EPSG:4326','EPSG:3857'),
                    zoom:9
                }));
                break;
            case 2:
                map.removeLayer(geoLayers.vecLayersCollection.item(2));
                map.addLayer(geoLayers.vecLayersCollection.item(1));
                map.getView().fit(map.getLayers().item(1).getSource().getExtent(),{duration:200});
                break;
        }
    },
    xbminfo:function(feature){
        var gid = feature.getId().split(".")[1];
        $.ajax({
            url:'/forestresources/map/xbm/'+gid,
            type:'GET',
            dataType:'text',
            error:function(XMLHttpRequest,textStatus,errorThrown){
                alert('error message: '+errorThrown.toString());
            },
            success:function(res){
                var response = JSON.parse(res)[0];
                $('#xbmHeader')[0].innerHTML = response.xiang+"L"+
                    response.linban+"X"+response.xiaoban;
                var featureValues = [];
                for (var f in response){
                    featureValues.push({
                        columnName:initConst.colNames[f],
                        columnValue:response[f]
                    })
                }

                $('#xbminfo').dataTable({
                    data:featureValues.slice(10,44),
                    'bPaginate':false,
                    'bLengthChange':false,
                    'bFilter':false,
                    'bSort':false,
                    'bInfo':false,
                    'bAutoWidth':true,
                    dom:'<<t>>',
                    destroy:true,
                    columns:[
                        {'data':'columnName','name':'小班属性','title':'小班属性'},
                        {'data':'columnValue','name':'属性值','title':'属性值'}
                    ]
                });
                $('.ui.left.sidebar.xbmInfo').sidebar('show')
            }
        });
    }
};

map.on('click',function(evt){
    var pixel = evt.pixel;
    var wfsUrl = geoserverUrl+'wfs/';
    map.forEachFeatureAtPixel(pixel,function(feature,layer){
        console.log(feature.getId());
        var layerIndex = geoLayers.vecLayersCollection.getArray().indexOf(layer);
        var featureRequest;
        switch(layerIndex){
            case 0:
                featureRequest =layerCtrlFuncs.getFeatureRequest({
                    featureTypes:['maqinxian_lbj'],
                    filter:ol.format.filter.equalTo('xiang',feature.get('xiang'))
                });
                map.removeLayer(geoLayers.vecLayersCollection.item(0));
                layerCtrlFuncs.fetchaddFeatures(wfsUrl,featureRequest,
                    geoLayers.vecLayersCollection.item(1).getSource(),
                    geoLayers.vecLayersCollection.item(1));
                break;
            case 1:
                featureRequest = layerCtrlFuncs.getFeatureRequest({
                    featureTypes:['maqinxian_xbmgh_id'],
                    filter:ol.format.filter.and(
                        ol.format.filter.equalTo('xiang',feature.get('xiang')),
                        ol.format.filter.equalTo('lin_ban',feature.get('lin_ban'))
                    )
                });
                map.removeLayer(geoLayers.vecLayersCollection.item(1));
                layerCtrlFuncs.fetchaddFeatures(wfsUrl,featureRequest,
                    geoLayers.vecLayersCollection.item(2).getSource(),
                    geoLayers.vecLayersCollection.item(2));
                break;
            case 2:
                /*console.log(feature.values_);*/
                layerCtrlFuncs.xbminfo(feature);
                break;
        }
    });
});