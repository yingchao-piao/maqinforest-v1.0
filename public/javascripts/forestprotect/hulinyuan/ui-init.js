/**
 * Created by hwt on 2017/5/24.
 */

$('.ui.left.sidebar.xbmInfo').sidebar('setting',{
    transition:'overlay',
    dimPage:false,
    closable:false
});
$('.xbminfoclose').click(function(){
    $('.ui.left.sidebar.xbmInfo').sidebar('hide');
    selectedFeatures.clear();
});

var initConst = {
    colNames:(function(){
        $.ajaxSettings.async=false;
        var col;
        $.getJSON("../pages/maqin_colnames.json",function(data){
            col=data;
            console.log(data);
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
    }
};

