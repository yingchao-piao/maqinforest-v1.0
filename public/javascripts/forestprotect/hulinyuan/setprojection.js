/**
 * Created by hwt on 2017/9/1.
 */
function search(query){
    fetch('https://epsg.io/?format=json&q='+query).then(function(response){
        return response.json();
    }).then(function(json){
        var results = json['result'];
        if(results&&results.length>0){
            for(var i = 0, ii = results.length;i<ii;i++){
                var result = results[i];
                if(result){
                    var code = result['code'],name=result['name'],
                        proj4def = result['proj4'], bbox=result['bbox'];
                    if(code && code.length>0&&proj4def&&proj4def.length>0&&bbox&&bbox.length==4){
                        setProjection(code,name,proj4def,bbox);
                        return
                    }
                }
            }
        }
    });
}
function setprojection(code,name,proj4def,bbox){
    if(code ===null || name === null || proj4def === null || bbox === null){
        return;
    }
    var newProjCode = 'EPSG:'+code;
    proj4.defs(newProjCode,proj4def);
    var newProj = ol.proj.get(newProjCode);
    var fromLonLat = ol.proj.getTransform('EPSG:3857',newProj);

    var extent = ol.extent.applyTransform(
        [bbox[1],bbox[2],bbox[3],bbox[0]],fromLonLat
    );
    newProj.setExtent(extent);
    return newProj;
}