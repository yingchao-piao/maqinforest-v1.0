/**
 * Created by hwt on 2017/8/28.
 */
/////BeSplitPolygon用来定义待裁剪的多边形
var wfst = {
    insert:function(feature,options){
        //实现insert操作
        //////待insert的feature首选转换坐标，然后设置geom，删除geometry，最后insert
        var multi = new ol.geom.MultiPolygon();
        var polygonClone = feature.getGeometry().clone();
        var tpolygonClone = polygonClone.transform('EPSG:3857','EPSG:2342');
        if(feature.getGeometry().getType()==='Polygon'){
            multi.appendPolygon(tpolygonClone);
        }
        if(feature.getGeometry().getType()==='MultiPolygon'){
            var polygons = tpolygonClone.getPolygons();
            polygons.forEach(function(value){
                multi.appendPolygon(value);
            });
        }
        /*multi.appendPolygon(tpolygonClone);*/
        var F = new ol.Feature({
            geom:multi
        });
        F.setGeometryName('geom');
        var FProperties = feature.getProperties();
        delete FProperties.geometry;
        F.setProperties(FProperties);

        ////insert操作
        var wfstransaction = new ol.format.WFS();
        var node = wfstransaction.writeTransaction([F],null,null,options);
        var nodestring = new XMLSerializer().serializeToString(node);
        $.ajax({
            type:'POST',
            url:geoserverUrl+'wfs/',
            data:nodestring,
            contentType:'text/xml',
            success:function(response){
                var insertIds = wfstransaction.readTransactionResponse(response).insertIds;
                F.setId(insertIds[0]);
                $('#tongbuloading').modal('hide');
            }
        });
    },
    delete:function(feature,options){
        //实现delete操作
        var wfstransaction = new ol.format.WFS();
        var node = wfstransaction.writeTransaction(null,null,[feature],options);
        var nodestring = new XMLSerializer().serializeToString(node);
        $.ajax({
            type:'POST',
            url:geoserverUrl+'wfs/',
            data:nodestring,
            contentType:'text/xml',
            success:function(response){
                console.log(wfstransaction.readTransactionResponse(response));
                $('#tongbuloading').modal('hide');
            }
        })
    },
    update:function(feature,options){
        //update
    }
};

function BeSplitPolygon(feature){
    this.feature=feature;
    this.gid=feature.getId();
    this.properties = feature.getProperties();
    delete this.properties.geometry;
    this.wkt = (function(){
        var format = new ol.format.WKT();
        return format.writeFeature(feature);
    })();
    this.xxbcounts = 0;
    this.wfst = function(){
        var options = {
            srsName:'EPSG:2342',
            featureNS:layersAttr.workspace_test,
            featurePrefix:layersAttr.workspace_test,
            featureType:[layersAttr.layerNames.xbm]
        };
        wfst.delete(this.feature,options);
        /*var wfstransaction = new ol.format.WFS();
        var node = wfstransaction.writeTransaction(null,null,[this.feature],options);
        var nodestring = new XMLSerializer().serializeToString(node);
        $.ajax({
            type:'POST',
            url:geoserverUrl+'wfs/',
            data:nodestring,
            contentType:'text/xml',
            success:function(response){
                console.log(wfstransaction.readTransactionResponse(response));
                $('#tongbuloading').modal('hide');
            }
        });*/
    }
}
//////LineOrPolygon用来定义绘制的裁剪线段或多边形
function LineOrPolygon(){
    this.source = new ol.source.Vector({wrapX:false});
    this.vector = new ol.layer.Vector({
        source:this.source
    });
    this.modifyinteraction = new ol.interaction.Modify({
        source:this.source
    });
    this.snapinteraction = new ol.interaction.Snap({
        source:this.source
    });
    this.drawinteraction=null;
    this.feature=null;
    this.LineString=null;
    this.Polygon=null;
}
//////OutputPolygon用来定义裁剪的多边形结果
function OutputPolygon(){
    var resultstyle = new ol.style.Style({
        fill:new ol.style.Fill({
            color:'rgba(255,255,255,0.2)'
        }),
        stroke:new ol.style.Stroke({
            color:'#f00',
            width: 4
        }),
        text: new ol.style.Text({
            fill:new ol.style.Fill({
                color:'#0f0'
            }),
            stroke:new ol.style.Stroke({
                color:'#fff',
                width:3
            })
        })
    });
    this.source = new ol.source.Vector({warpX:false});
    this.vector = new ol.layer.Vector({
        source:this.source,
        style:function(feature){
            /*style.getText().setFill(new ol.style.Fill({
                color:'#0f0'
            }));*/
            resultstyle.getText().setFont('Normal 10px sans-serif');
            resultstyle.getText().setFont(feature.get('xiao_ban')+'xxb'+feature.get('xxb'));
            return resultstyle;
        }
    });
    this.features=[];

    this.wfst = function(){
        if(this.features.length===0){
            return ;
        }
        var options = {
            srsName:'EPSG:2342',
            featureNS:layersAttr.workspace_test,
            featurePrefix:layersAttr.workspace_test,
            featureType:[layersAttr.layerNames.xbm]
        };
        wfst.insert(this.features[0],options);
        wfst.insert(this.features[1],options);
        /*var multi0 = new ol.geom.MultiPolygon();
        var multi1 = new ol.geom.MultiPolygon();
        var polygonClone0 = this.features[0].getGeometry().clone();
        var polygonClone1 = this.features[1].getGeometry().clone();
        var tpolygonClone0 = polygonClone0.transform('EPSG:3857','EPSG:2342');
        var tpolygonClone1 = polygonClone1.transform('EPSG:3857','EPSG:2342');
        multi0.appendPolygon(tpolygonClone0);
        multi1.appendPolygon(tpolygonClone1);
        var F0 = new ol.Feature({
            geom:multi0
        });
        var F1 = new ol.Feature({
            geom:multi1
        });
        F0.setGeometryName('geom');
        F1.setGeometryName('geom');
        var F0Properties = this.features[0].getProperties();
        var F1Properties = this.features[1].getProperties();
        delete F0Properties.geometry;
        delete F1Properties.geometry;
        F0.setProperties(F0Properties);
        F1.setProperties(F1Properties);

        var wfstransaction = new ol.format.WFS();

        var node = wfstransaction.writeTransaction([F0,F1],null,null,options);
        var nodeString = new XMLSerializer().serializeToString(node);
        $.ajax({
            type:'POST',
            url:geoserverUrl+'wfs/',
            data:nodeString,
            contentType:'text/xml',
            success:function(response){
                var insertIds = wfstransaction.readTransactionResponse(response).insertIds;
                F0.setId(insertIds[0]);
                F1.setId(insertIds[1]);
            }
        })*/
    }
}
//////getCounts函数用于获取选择的小班所包含的细小班数目
var getCounts = function(besplitpolygon){
    var featureRequest = mapModule.layerFuncs.getFeatureRequest({
        featureTypes:[layersAttr.layerNames.xbm],
        filter:ol.format.filter.and(
            ol.format.filter.equalTo('xiang',besplitpolygon.properties.xiang),
            ol.format.filter.equalTo('lin_ban',besplitpolygon.properties.lin_ban),
            ol.format.filter.equalTo('xiao_ban',besplitpolygon.properties.xiao_ban)
        )
    });
    fetch(geoserverUrl+'wfs/',{
        method:'POST',
        body:new XMLSerializer().serializeToString(featureRequest)
    }).then(function(response){
        return response.json();
    }).then(function(json){
        var features = new ol.format.GeoJSON().readFeatures(json);
        /*console.log(features);*/
        besplitpolygon.xxbcounts = features.length;
    });
};
//////drawinteraction用于生成绘制线段或多边形的ol.interaction.Draw
var drawinteraction = function(lineorpolygon,type){
    var draw = new ol.interaction.Draw({
        source:lineorpolygon.source,
        type:type
    });
    draw.on('drawstart',function(event){
        lineorpolygon.source.clear();
    });
    draw.on('drawend',function(event){
        var feature = event.feature;
        lineorpolygon.feature=feature;
        lineorpolygon.LineString=null;
        lineorpolygon.Polygon=null;
        var format= new ol.format.WKT();
        lineorpolygon[type] = format.writeFeature(feature);
        //$('#line textarea').val(lineorpolygon[type]);
        /////
    });
    lineorpolygon.drawinteraction= draw;
};
/////lineSplitPolygon用于线段裁剪多边形，切记线段裁剪多边形，只能保存裁剪的两个多边形，
/////在绘制线段时要注意，不要裁剪最后的结果多于两个，线段一定要和待裁剪边界相交
var lineSplitPolygon = function(besplitpolygon,linewkt,geoserver,outputpolygon){
    var polygonwkt = besplitpolygon.wkt;
    var linewkt = linewkt;
    var server = geoserver;
    var executexml='<?xml version="1.0" encoding="UTF-8"?>' +
        '<wps:Execute version="1.0.0" service="WPS" ' +
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'xmlns="http://www.opengis.net/wps/1.0.0" ' +
        'xmlns:wfs="http://www.opengis.net/wfs" ' +
        'xmlns:wps="http://www.opengis.net/wps/1.0.0" ' +
        'xmlns:ows="http://www.opengis.net/ows/1.1" ' +
        'xmlns:gml="http://www.opengis.net/gml" ' +
        'xmlns:ogc="http://www.opengis.net/ogc" ' +
        'xmlns:wcs="http://www.opengis.net/wcs/1.1.1" ' +
        'xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">' +
        '<ows:Identifier>JTS:splitPolygon</ows:Identifier>' +
        '<wps:DataInputs>'+
        '<wps:Input>'+
        '<ows:Identifier>polygon</ows:Identifier>'+
        '<wps:Data>'+
        '<wps:ComplexData mimeType="application/wkt"><![CDATA['+polygonwkt+']]></wps:ComplexData>'+
        '</wps:Data>'+
        '</wps:Input>'+
        '<wps:Input>'+
        '<ows:Identifier>line</ows:Identifier>'+
        '<wps:Data>'+
        '<wps:ComplexData mimeType="application/wkt"><![CDATA['+linewkt+']]></wps:ComplexData>'+
        '</wps:Data>'+
        '</wps:Input>'+
        '</wps:DataInputs>'+
        '<wps:ResponseForm>'+
        '<wps:RawDataOutput mimeType="application/wkt">'+
        '<ows:Identifier>result</ows:Identifier>'+
        '</wps:RawDataOutput>'+
        '</wps:ResponseForm>'+
        '</wps:Execute>';
    $.ajax({
        type:'POST',
        url:server,
        data:executexml,
        contentType:'text/xml',
        success:function(response){
            var format = new ol.format.WKT();
            var SplitResult = format.readFeature(response,{
                dataProjection:'EPSG:3857',
                featureProjection:'EPSG:3857'
            });
            var geometries = SplitResult.getGeometry().getGeometries();
            if(geometries.length>2){
                geometries.forEach(function(value){
                    outputpolygon.source.addFeature(
                        new ol.Feature({
                            geometry:value
                        })
                    )
                });
                $('#tongbuloading').modal('hide');
            }else if(geometries.length ==2){
                var aF = new ol.Feature({
                    geometry:geometries[0]
                });
                var bF = new ol.Feature({
                    geometry:geometries[1]
                });
                aF.setProperties(besplitpolygon.properties);
                aF.set('mian_ji',polygonArea(geometries[0]));
                //aF.set('geometry',geometries[0]);
                bF.setProperties(besplitpolygon.properties);
                bF.set('mian_ji',polygonArea(geometries[1]));
                //bF.set('geometry',geometries[1]);
                bF.set('xxb',(besplitpolygon.xxbcounts + 1).toString());
                outputpolygon.source.addFeature(aF);
                outputpolygon.source.addFeature(bF);
                outputpolygon.features[0] = aF;
                outputpolygon.features[1] = bF;
                $('#tongbuloading').modal('hide');
            }

        },
        error:function(err){
            alert(err);
        }
    });

};
//////addHole用于多边形裁剪多边形，主要是由于在边界进行裁剪可以用线裁剪代替
//////因此多边形裁剪就相当于是为待裁剪多边形添加孔洞
var addHole = function(besplitpolygon,holewkt,outputpolygon){
    var format = new ol.format.WKT();
    var bF = format.readFeature(besplitpolygon.wkt,{
        dataProjection:'EPSG:3857',
        featureProjection:'EPSG:3857'
    });
    var bP = bF.getGeometry().getPolygons()[0];

    var lF = format.readFeature(holewkt,{
        dataProjection:'EPSG:3857',
        featureProjection:'EPSG:3857'
    });
    var lP = lF.getGeometry();
    var lPexteriorLine = lP.getLinearRing(0);

    bP.appendLinearRing(lPexteriorLine);

    var newF = new ol.Feature({
        geometry:bP
    });
    newF.setProperties(besplitpolygon.properties);
    //newF.set('geometry',bP);
    newF.set('mian_ji',polygonArea(bP));
    lF.setProperties(besplitpolygon.properties);
    //lF.set('geometry',lP);
    lF.set('mian_ji',polygonArea(lP));
    lF.set('xxb',(besplitpolygon.xxbcounts+1).toString());

    outputpolygon.source.addFeature(newF);
    outputpolygon.source.addFeature(lF);
    outputpolygon.features[0] = newF;
    outputpolygon.features[1] = lF;
};
//////
proj4.defs("EPSG:2342","+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs");
var polygonArea = function(polygon) {
    var polygonClone = polygon.clone();
    var polygonClone2342 = polygonClone.transform('EPSG:3857','EPSG:2342');
    var area = polygonClone2342.getArea();
    var output=area/10000;
    return output.toFixed(2);
};
//////////返回编辑属性html
var editAttrHtml = function(feature){
    var featureProperties = feature.getProperties();
    delete featureProperties.geometry;
    var code_content = initConst.code_content;
    var options='',field='';
    for (var key in featureProperties){
        if(key=='sheng'||key=='xian'||key=='xiang'||key=='cun'||key=='lin_ye_ju'||
            key=='lin_chang'||key=='lin_ban'||key=='xiao_ban'||key=='xzld'
            ||key=='xlbxb'||key=='mid'||key=='mianji_he'||key=='lyfq'){
            continue;
        }else if(key=='tu_ceng_hd'||key=='yu_bi_du'||key=='pingjun_xj'||key=='huo_lmgqxj'
            ||key=='mei_gq_zs'||key=='ld_cd'||key=='ld_kd'||key=='xxb'||key=='mian_ji'){
            field=field+
                '<div class="field">' +
                '<label>' + initConst.colNames.protect[key]+'</label>'+
                '<input type ="text" value="'+featureProperties[key]+'"id = "'+key+'">'+
                '</div>'
        }else{
            code_content[key].forEach(function(value){
                options = options+
                    '<option value="'+key+"_"+value.code+'">'+value.content+'</option>';
            });
            field = field+
                '<div class="field">' +
                '<label>' + initConst.colNames.protect[key]+'</label>'+
                '<select class="ui compact search dropdown" id="'+key+'">'+ options+
                '</select>'+
                '</div>';
            options='';
        }
    }
    return field;
};
///////判断待切分多边形是否包含绘制多边形
var intersects = function(besplitfeature,lineorpolygonfeature){
    var flag=true;
    var besplitmultipolygon = besplitfeature.getGeometry();
    var lineorpolygon = lineorpolygonfeature.getGeometry();
    var lineorpolygoncoors = lineorpolygon.getCoordinates()[0];
    lineorpolygoncoors.forEach(function(value){
        if(!besplitmultipolygon.intersectsCoordinate(value)){
            flag = false;
        }
    });
    return flag;
};