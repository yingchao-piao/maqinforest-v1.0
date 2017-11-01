/**
 * Created by hwt on 2017/5/31.
 */
$('#timeline').ionRangeSlider({
    type: "double",
    hide_min_max: true,
    hide_from_to: false,
    grid: true,
    grid_num:1,
    from:0,
    step:1,
    values:[2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016]
});

$('#timelinectrl').click(function(){
    $(this).children('i').toggleClass('pause');
});