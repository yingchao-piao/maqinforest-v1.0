/**
 * Created by hwt on 2017/7/18.
 */
$('.ui.accordion').accordion();
$('.ui.sidebar').css('top',$('.ui.container.navbar').outerHeight(true));
$('.ui.left.wide.sidebar.hly').sidebar('setting',{
    transition:'overlay',
    dimPage:false,
    closable:false
}).sidebar('show');
$('.ui.right.wide.sidebar.hlyInfo').sidebar('setting',{
    transition:'overlay',
    dimPage:false,
    closable:false
}).sidebar('show');
var initConst = {
    colNames:(function(){
        $.ajaxSettings.async=false;
        var col;
        $.getJSON("../pages/maqin_colnames.json",function(data){
            col=data;
            /*console.log(data);*/
        });
        return col;
        $.ajaxSettings.async=true;
    })(),
    xzcid:{
        "下达武乡":"001",
        "昌马河乡":"002",
        "优云乡":"003",
        "当洛乡":"004",
        "雪山乡":"005",
        "东倾沟乡":"006",
        "大武乡":"007",
        "拉加镇":"008",
        "大武镇":"009",
        "切木曲林场":"010",
        "洋玉林场":"011",
        "德科河林场":"012"
    },
    code_content:(function(){
        $.ajaxSettings.async=false;
        var col;
        $.getJSON("../pages/code_content.json",function(data){
            col=data;
            /*console.log(data);*/
        });
        return col;
        $.ajaxSettings.async=true;
    })()
};
/*var topItems = $('<div class="ui small header item" style="color:black;text-align: center;margin-top: 14px;">' +
    '玛沁县护林员信息</div>');
$('.ui.left.sidebar.hly').prepend(topItems);*/
/*$('.ui.button.openLeftSidebar').val('hly');*/

$.ajax({
    url:'hulinyuan/all',
    type:'GET',
    dataType:'text',
    error:function(XMLHttpRequest,textStatus,errorThrown){
        alert('error message: ' + errorThrown.toString());
    },
    success:function(res){

        var response = JSON.parse(res);

        //console.log(response);
        response.forEach(function(e){
            if(e.beizhu=='NA'|| e.beizhu==null){
                e.beizhu=null;
            }
        });

        var hlyTable = $('#hly').DataTable({
            data:response,
            columns:[
                {'data':'gh_id','name':'管护区','title':'管护区'},
                {'data':'cun','name':'村','title':'村'},
                {'data':'name','name':'姓名','title':'姓名'},
                {'data':'guanhuaera','name':'管护面积','title':'管护面积'},
                {'data':'beizhu','name':'备注','title':'备注'}
            ],
            columnDefs:[
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

        $('#hly tbody').on('click','tr',function(){
            var singlehlyData = [];
            singlehlyData.push(hlyTable.row(this).data());
            $('.ui.right.sidebar.hlyInfo').sidebar('show');
            $('#sidebar_right').css('right',$('.ui.right.sidebar.hlyInfo').width());

            if(typeof(singlehlyData[0])!="undefined"){
                $.ajax({
                    url:'/forestprotect/hulinyuan/'+singlehlyData[0].gh_id,
                    type:'GET',
                    dataType:'text',
                    error:function(XMLHttpRequest,textStatus,errorThrown){
                        alert('error message: '+errorThrown.toString());
                    },
                    success:function(res){
                        var response = JSON.parse(res);

                        if(response.all.length === 0){
                            alert("此护林员信息有误，请核实");
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
                        var hly_personalTable = $('#hly_personal').DataTable({
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
                        var hly_protectTable = $('#hly_protect').DataTable({
                            data:response.protect,
                            columns:[
                                //{'data':'gid','name':'gid','title':'gid'},
                                {'data':'xzc','name':'乡镇场','title':'乡镇场'},
                                {'data':'linban','name':'林班','title':'林班'},
                                {'data':'xiaoban','name':'小班','title':'小班'},
                                {'data':'dilei','name':'地类','title':'地类'},
                                {'data':'xiaobanmianji','name':'小班面积','title':'小班面积'},
                                {'data':'xxb','name':'细小班','title':'细小班'}
                            ],
                            pagingType:'simple_numbers',
                            "ordering":false,
                            'bInfo':false,
                            'bLengthChange':false,
                            'bFilter':false,
                            'bAutoWidth':true,
                            'paging':false,
                            'pageLength':5,
                            dom:'<<t>ip>',
                            destroy:true,
                            "initComplete":function(){
                                var api = this.api();
                                api.$('tr').click(function(){
                                    var td = $(this).find('td');
                                    var features = mapModule.vecLayer.getSource().getFeatures();
                                    var feature;
                                    features.forEach(function(value,index,array){
                                        var properties = value.getProperties();
                                        if(properties.xiang == td[0].innerText
                                            &&properties.lin_ban==td[1].innerText
                                            &&properties.xiao_ban == td[2].innerText
                                            &&properties.di_lei == td[3].innerText
                                            &&properties.mian_ji == td[4].innerText
                                            &&properties.xxb==td[5].innerText){
                                            feature=value;
                                        }
                                    });
                                    /*var feature = mapModule.layerFuncs.selectFeatures(
                                        map.getLayers().item(1),{
                                            mid: td[0].innerText});*/
                                    mapModule.selectedfeatures.clear();
                                    mapModule.selectedfeatures.push(feature);
                                    mapModule.layerFuncs.getxbminfo(feature);
                                })
                            }
                        });

                        var wfsUrl = geoserverUrl+'/wfs';
                        var featureRequest = mapModule.layerFuncs.getFeatureRequest({
                            featureTypes:[layersAttr.layerNames.hulinyuan],
                            filter:ol.format.filter.equalTo('gh_id',singlehlyData[0].gh_id)
                        });
                        mapModule.layerFuncs.fetchaddFeatures(wfsUrl,featureRequest,
                            mapLayerSource.vecLayerSource.xbm_source);

                        $('#layerUp').attr('disabled','disabled');
                    }
                });


            }
        })
    }
});