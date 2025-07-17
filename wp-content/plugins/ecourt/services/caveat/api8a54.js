jQuery(document).ready(function ($) {
  $(".cevsearch").on("change", function () {
    $(".togglecav").hide();
    let view = $(this).attr("data-view").split(",");
    view.forEach(function (item, index) {
      $(".togglecav#" + item).show();
    });
    $("#ecourt-services-case-status-caveat :input")
      .not(":button, :submit, :reset, :hidden,:radio")
      .val("")
      .prop("checked", false)
      .prop("selected", false);
  });

  $("#ecourt-services-caveat-search-caveat").ecourt_services_do_submit_form(
    "get_caveat"
  );

  $("#ecourt-services-caveat-search-caveat").on("reset", function (event) {
    setTimeout(function () {
      $("#chkYesCaveat").attr("checked", true).trigger("change");
    }, 1);
  });
});
