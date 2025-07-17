jQuery(document).ready(function($) {
    $(".advsearch").on('change',function() {
        $('.toggleadv').hide();
        let view = $(this).attr('data-view').split(',');
        view.forEach(function (item, index){
            $('.toggleadv#'+item).show();
        });
        $('#ecourt-services-case-status-advocate :input').not(':button, :submit, :reset, :hidden,:radio').val('').prop('checked', false).prop('selected', false);
    });

    $("#ecourt-services-case-status-advocate").ecourt_services_do_submit_form('get_advocate');

    $("#ecourt-services-case-status-advocate").on('reset', function(event) {
        setTimeout(function() {
            $("#chkYesAdvocate").attr('checked', true).trigger('change');
        }, 1);
    });
})