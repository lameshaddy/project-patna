//Defines ucfirst function
function ucfirst(str) {
    var firstLetter = str.substr(0, 1);
    return firstLetter.toUpperCase() + str.substr(1);
}

//Judges category filter
jQuery(document).ready(function(){
    jQuery(document).on("click",'.ww_cat_filter, .cdir_next, .cdir_prev',function(e){
        e.preventDefault();
        var data = jQuery(this).data('nav');
        var page = jQuery(this).parent().siblings('.count').find('span').html();
        var cat_slug = jQuery('#divisions').val();
        if(cat_slug=='-1'){
            location.reload();
        }
        var data_nonce = jQuery('.ww_html').data( "nonce" );
        var data_profile = jQuery('.ww_html').data( "profile" );
        var data_filter = jQuery('.ww_html').data( "filter" );
        var show_link = jQuery('#show_link_or_not').val();

        jQuery.ajax({
            type: "post",
            //dataType: "json",
            url: ajaxurl,
            data: {
                action: "judge_filter",
                term_slug: cat_slug,
                filter: data_filter,
                profile_image: data_profile,
                paged:page,
                show_link: show_link,
                type:data,
                security:data_nonce,
            },
            success: function (response) {
                var d = jQuery.parseJSON(response);
                var data = d.result;
                var html ='<table class="data-table-1"><caption>'+jQuery('#divisions').find('option:selected').html()+'</caption><thead>';
                html +='<tr>';
                for(var i in data){
                    var key = i;
                    var val = data[i];
                }

                for(var k in val){
                    html +='<th scope="col" >'+k+'</th>';
                }
                html +='</tr>';
                html +='</thead><tbody>';
                jQuery.each(data, function (i) {
                    html +='<tr>';
                    jQuery.each(data[i], function (key, val) {


                        html +='<td>'+val+'</td>';


                    });
                    html +='</tr>';
                });
                html +='</tbody></table>';
                if(d.fp>d.ppp){
                    html +='<div class="row">';
                    html +='<div class="col-xs-12">';
                    html +='<div class="pagination" role="navigation" aria-label="'+'Pagination'+'">';
                    html +='<ul>';
                    if(d.first==1)
                    {
                        html +='<li><a data-nav="prev" class="cdir_prev" href="#">Previous</a></li>';
                    }else
                    {}
                    html +='<li class="count">Page - <span class="cpaged">'+d.paged+'</span> of '+d.mp+'</li>';
                    if(d.last==1)
                    {}else
                    {
                        html +='<li><a data-nav="next" class="cdir_next" href="#">Next</a></li>';
                    }
                    html +='</ul>';
                    html +='</div>';
                    html +='</div>';
                    html +='</div>';
                }
                if(jQuery.isEmptyObject(data)){
                    jQuery('.ww_html').html("<p>No data found!</p>");
                }else{

                    jQuery('.ww_html').html(html);
                    jQuery('body').trigger('targetExternalLinks');
                    jQuery('table').each(function() {
                        if((jQuery(this).find('th').length > 0) || jQuery(this).find('thead').length > 0){
                            jQuery(this).not('.no-responsive').basictable({  breakpoint: 991, forceResponsive: true});
                        }else{
                            jQuery(this).wrap("<div class='tableWrapperResponsive' style='width:100%; overflow-x:scroll'>  </div>")
                        }
                    });
                }
            }
        });

    });
});

//Judges pagination
jQuery(document).ready(function(){
    jQuery("body").find('.ww_nxt, .ww_prv').click(function(e){
        e.preventDefault();

        var data = jQuery(this).data('nav');
        var page = jQuery(this).parent().siblings('.count').find('span').html();
        var slug = jQuery(this).parents('.whoswho').data('id');
        var name = jQuery(this).parents('.whoswho').data('name');
        var show_link = jQuery('#show_link_or_not').val();
        var data_nonce = jQuery('.ww_html').data( "nonce" );
        var data_profile = jQuery('.ww_html').data( "profile" );
        var data_filter = jQuery('.ww_html').data( "filter" );

        jQuery.ajax({
            method: "POST",
            url: ajaxurl,
            data: { action:"judge_pages", paged:page, tax_slug:slug, type:data, profile_image:data_profile, filter:data_filter, show_link:show_link, security:data_nonce }
        })
            .done(function( response ) {
                var obj = JSON.parse(response);
                var data = obj.html;
                var caption='';
                if(name!='uncategorized'){
                    caption = '<caption>'+name+'</caption>';
                }
                var html ='<table class="data-table-1">'+caption+'<thead>';
                html +='<tr>';
                for(var i in data){
                    var key = i;
                    var val = data[i];
                }
                for(var k in val){
                    html +='<th scope="col">'+k+'</th>';
                }
                html +='</tr>';
                html +='</thead><tbody>';

                jQuery.each(data, function (i) {

                    html +='<tr>';
                    jQuery.each(data[i], function (key, val) {
                        html +='<td>'+val+'</td>';
                    });
                    html +='</tr>';
                });
                html +='</tbody></table>';
                if(jQuery.isEmptyObject(data)){
                    jQuery("div[data-id='"+slug+"']").find('div.tb_content').html("<p>No data found!</p>");
                }else{
                    jQuery("div[data-id='"+slug+"']").find('div.tb_content').html(html);
                    jQuery('body').trigger('targetExternalLinks');
                    jQuery('table').each(function() {
                        if((jQuery(this).find('th').length > 0) || jQuery(this).find('thead').length > 0){
                            jQuery(this).not('.no-responsive').basictable({  breakpoint: 991, forceResponsive: true});
                        }else{
                            jQuery(this).wrap("<div class='tableWrapperResponsive' style='width:100%; overflow-x:scroll'>  </div>")
                        }
                    });
                }
                jQuery("div[data-id='"+slug+"']").find(".paged").html(obj.paged);
                if(obj.last==1)
                {
                    jQuery("div[data-id='"+slug+"']").find(".ww_nxt").hide();
                }else
                {
                    jQuery("div[data-id='"+slug+"']").find(".ww_nxt").show();
                }
                if(obj.first==1)
                {
                    jQuery("div[data-id='"+slug+"']").find(".ww_prv").show();
                }else
                {
                    jQuery("div[data-id='"+slug+"']").find(".ww_prv").hide();
                }

            });
    });
});
