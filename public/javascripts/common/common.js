/**
 * Created by hwt on 2017/6/5.
 */
$('.ui.segment.mainnavbar > .ui.secondary.pointing.menu')
    .on('click', '.item', function() {
        if(!$(this).hasClass('dropdown')) {
            $(this)
                .addClass('active')
                .siblings('.item')
                .removeClass('active');
        }
    });