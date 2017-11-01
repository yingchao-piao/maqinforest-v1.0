/**
 * Created by hwt on 2017/9/19.
 */
function UnionObj(){
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
    this.xxbFeatures=[];
    this.UnionSource= new ol.source.Vector({wrapX:false});
    this.UnionVec = new ol.layer.Vector({
        source:this.UnionSource,
        style:resultstyle
    });
    this.union=function(feature1,feature2){
        //实现两个细小班union，并将结果添加到source中去
        var format = new ol.format.GeoJSON();
        var turfFeature1 = format.writeFeatureObject(feature1);
        var turfFeature2 = format.writeFeatureObject(feature2);
        var union = turf.union(turfFeature1,turfFeature2);
        var unionFeature = format.readFeature(union);
        this.UnionSource.addFeature(unionFeature);
    };
    this.wfstdelete=function(){
        //实现原来两个细小班的删除
        var options = {
            srsName:'EPSG:2342',
            featureNS:layersAttr.workspace_test,
            featurePrefix:layersAttr.workspace_test,
            featureType:[layersAttr.layerNames.xbm]
        };
        wfst.delete(this.xxbFeatures[0],options);
        wfst.delete(this.xxbFeatures[1],options);
    };
    this.wfstinsert=function(){
        //实现union结果的存储
        var options = {
            srsName:'EPSG:2342',
            featureNS:layersAttr.workspace_test,
            featurePrefix:layersAttr.workspace_test,
            featureType:[layersAttr.layerNames.xbm]
        };
        wfst.insert(this.UnionSource.getFeatures()[0],options);
    };
}