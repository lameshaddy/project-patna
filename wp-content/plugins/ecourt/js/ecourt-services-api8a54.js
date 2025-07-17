jQuery(document).ready(function ($) {
  $(".act-single").select2();
  $.validator.addMethod("indianDate", function (value, element) {
      return value.match(/^\d\d?\/\d\d?\/\d\d\d\d$/);
    }, "Please enter a date in the format DD/MM/YYYY.");
  $.validator.addMethod("lettersonly", function (value, element) {
      return this.optional(element) || /^[a-z ]+$/i.test(value);
    }, "Please enter only letters");
  $.validator.addMethod("fromLessTo", function (value, element) {
      let from_date = $("#from_date").val();
      let to_date = new Date(value);

      if (from_date == "") return false;

      from_date = new Date(from_date);

      return to_date.getTime() >= from_date.getTime();
    }, "To date should not be earlier than from date");
	
	
	
  $.validator.addMethod("last7days", function (value, element) {
      let one_day = 1000 * 60 * 60 * 24;
      let current_date = new Date();
      let selected_date = new Date(value);
if (selected_date <= current_date){
     let diff = Math.ceil(
        (current_date.getTime() - selected_date.getTime()) / one_day);
      return diff <= 8 && diff > 0;
}else{
	let diff = Math.ceil(
        (current_date.getTime() < selected_date.getTime()) / one_day);
      return diff <= 8 && diff > 0;
	}}, "Date must be within last 7 days from today");

  let stopTabFunction = function (e) {
    if (e.keyCode == 9) {
      e.preventDefault();
    }
  };

  $.fn.extend({
    ajax_call_services_form: function ($action) {
      let form = $(this);
      let formDataArray = form.serializeArray();
      let formData = {};

      $.map(formDataArray, function (n, i) {
        if (n["value"] !== "") {
          formData[n["name"]] = n["value"];
        }
      });

      formData.action = $action;

      $.ajax({
        type: "POST",
        dataType: "json",
        url: "/wp-admin/admin-ajax.php",
        data: formData,
        beforeSend: function () {
          form.find("input,button").attr("disabled", "disabled");
          $(".resultsHolder > div").addClass("hide");
          $(".service-loader").removeClass("hide");
          document.addEventListener("keydown", stopTabFunction);
        },
        success: function (response) {
          $(".service-loader").addClass("hide");
          form.find("input,button").removeAttr("disabled");
          if (response.success) {
            $("#cnrResults").html(response.data).removeClass("hide");
            $('.distTableContent').each(function (){
              formData.est_code = $(this).attr('data-est-code');
              $(this).attr('data-form-data',JSON.stringify(formData));
            })
            $("#cnrResults table").not(".no-responsive").basictable({breakpoint: 991, forceResponsive: true,});
            $("html, body").animate({
                scrollTop: $(".resultsHolder").offset().top,
              }, 1200);
          } else {
            let data = $.parseJSON(response.data);
            let message = data.message ? data.message : "Nothing Found";
            $("#cnrResults")
              .html('<div class="notfound" role="alert">' + message + "</div>")
              .removeClass("hide");
          }

          $("input.enter-captcha").val("");
          $(".captcha-refresh-btn").trigger("click");
          document.removeEventListener("keydown", stopTabFunction);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $(".service-loader").addClass("hide");
          form.find("input,button").removeAttr("disabled");
          $(".captcha-refresh-btn").trigger("click");
          $("#cnrResults")
            .html(
              '<div class="notfound" role="alert">Unable to reach API server</div>'
            )
            .removeClass("hide");
        },
        complete: function (){
          if($('.loadMoreCases').length > 0){
            $('.loadMoreCases').attr('data-action',$action);
          }

        }
      });
    },
  });
  $.fn.extend({
    ecourt_services_do_submit_form: function ($action) {

      let globalRules = {
          est_code: { required: true },
          siwp_captcha_value: { required: true },
        },
        globalMessages = {
          est_code: {
            required: "Court Complex/Establishment field is required.",
          },
          siwp_captcha_value: { required: "Captcha field is required." },
        },
        validations = {
          reg_no: { required: true, digits: true, maxlength: 20 },
          fir_no: { digits: true, maxlength: 20 },
          reg_year: {
            required: true,
            digits: true,
            minlength: 4,
            maxlength: 4,
          },
          fil_no: { required: true, digits: true, maxlength: 20 },
          date: { required: true, indianDate: true },
        },
        messages = {
          reg_no: {
            required: "Case number field is required.",
            number: "Only numeric digits are allowed",
            maxlength: $.validator.format(
              "Maximum {0} digits number is allowed"
            ),
          },
          reg_year: {
            required: "Year field is required.",
            number: "Only numeric digits are allowed",
            maxlength: $.validator.format(
              "Maximum {0} digits number is allowed"
            ),
            minlength: $.validator.format(
              " Please enter at least {0} characters"
            ),
          },
          fir_no: {
            required: "FIR number field is required.",
            number: "Only numeric digits are allowed",
            maxlength: $.validator.format(
              "Maximum {0} digits number is allowed"
            ),
          },
          fil_no: {
            required: "Filing Number field is required.",
            number: "Only numeric digits are allowed",
            maxlength: $.validator.format(
              "Maximum {0} digits number is allowed"
            ),
          },
          date: { required: "Date field is required." },
        },
        rules = {},
        validationMessages = {};

      let validationObject = {
        ignore: ":hidden",
        errorElement: "p",
        errorPlacement: function (error, element) {
          error.attr({
            role: "alert",
            tabindex: "0",
            "aria-label": error.html(),
          });

          if (
            element.attr("name") == "barcode[state_code]" ||
            element.attr("name") == "barcode[bar_code]" ||
            element.attr("name") == "barcode[year]"
          ) {
            error.insertAfter($("#advocate_year"));
          } else if (
            element.attr("name") == "advocate_date" ||
            element.attr("name") == "date" ||
            element.attr("name") == "from_date" ||
            element.attr("name") == "to_date"
          ) {
            element.parent().append(error);
          } else {
            error.insertAfter(element);
          }
        },
        highlight: function (element,errorClass){
        setTimeout(function (){
              $(element.form).find("p.error-input").each(function (){
                $(this).attr('aria-label',$(this).html())
              });
            })
         },
        errorClass: "error-input",
        validClass: "valid-input",
        submitHandler: function (form) {
          $(form).ajax_call_services_form($action);
          return false;
        },
      };

      if ($action == "get_cases") {
        rules = { reg_no: validations.reg_no, reg_year: validations.reg_year };
        validationMessages = {
          reg_no: messages.reg_no,
          reg_year: messages.reg_year,
        };
      }

      if ($action == "get_case_number_order_details") {
        rules = { reg_no: validations.reg_no, reg_year: validations.reg_year };
        validationMessages = {
          reg_no: messages.reg_no,
          reg_year: messages.reg_year,
        };
      }

      if ($action == "get_fir_details") {
        rules = {
          fir_no: validations.fir_no,
          reg_year: { digits: true, minlength: 4, maxlength: 4 },
          police_station: { required: true },
        };
        validationMessages = {
          reg_no: messages.reg_no,
          reg_year: messages.reg_year,
          fir_no: messages.fir_no,
          police_station: { required: "Police Station field is required." },
        };
      }

      if ($action == "get_act") {
        rules = { national_act_code: { required: true } };
        validationMessages = {
          national_act_code: { required: "Act Type field is required" },
        };
      }

      if ($action == "get_filling") {
        rules = { fil_no: validations.fil_no, reg_year: validations.reg_year };
        validationMessages = {
          fil_no: messages.fil_no,
          reg_year: messages.reg_year,
        };
      }

      if ($action == "get_causes") {
        rules = {
          date: { ...validations.date, last7days: true },
          court: { required: true },
        };
        validationMessages = {
          date: { required: "Cause list date field is required" },
        };
      }

      if ($action == "get_parties" || $action == "get_parties_order") {
        rules = {
          reg_year: validations.reg_year,
          litigant_name: { required: true, maxlength: 50,lettersonly:(EcourtServicesData.currentLang == 'en') ? true : false },
        };
        validationMessages = {
          reg_year: messages.reg_year,
          litigant_name: {
            required: "Petitioner/Respondent field is required.",
            maxlength: $.validator.format(
              "Maximum {0} characters is allowed"
            ),
          },
        };
      }

      if ($action == "get_order_date") {
        rules = {
          from_date: validations.date,
          to_date: { ...validations.date, fromLessTo: true },
        };
        validationMessages = {
          from_date: { required: "Form date field is required" },
          to_date: { required: "To date field is required" },
        };
      }

      if ($action == "get_court_number") {
        rules = { courtname: { required: true } };
        validationMessages = {
          courtname: { required: "Court number field is required." },
        };
      }

      if ($action == "get_cases_by_year") {
        rules = {
          case_type: { required: true },
          reg_year: validations.reg_year,
        };
        validationMessages = {
          reg_year: messages.reg_year,
          case_type: { required: "Case type field is required." },
        };
      }

      if ($action == "get_advocate") {
        rules = {
          advocate_name: { required: true, maxlength: 50,lettersonly:(EcourtServicesData.currentLang == 'en') ? true : false },
          "barcode[year]": validations.reg_year,
          "barcode[state_code]": { required: true },
          "barcode[bar_code]": { required: true, digits: true },
          advocate_date: validations.date,
        };
        (validationObject.groups = {
          advocate_bar_code:
            "barcode[year] barcode[bar_code] barcode[state_code]",
        }),
          (validationMessages = {
            "barcode[bar_code]": { required: "Bar code field is required" },
            "barcode[state_code]": { required: "State code field is required" },
            "barcode[year]": messages.reg_year,
            advocate_date: { required: "Cause list date field is required" },
            advocate_name: {
              required: "Advocate field is required.",
              maxlength: $.validator.format(
                "Maximum {0} characters is allowed"
              ),
            },
          });
      }

      if ($action == "get_caveat") {
        rules = {
          caveator_name: {
            required: true,
            minlength: 3,
            lettersonly: (EcourtServicesData.currentLang == 'en') ? true : false
          },
          caveatee_name: {minlength: 3, lettersonly: (EcourtServicesData.currentLang == 'en') ? true : false},
          caveat_number: {required: true, number: true},
          reg_year: validations.reg_year
        }

        validationMessages = {
          caveator_name: { required: "Caveator Name field is required." },
          caveat_number: { required: "Caveat Number field is required." },
          reg_year: messages.reg_year,
        };
      }

      (validationObject.rules = $.extend({}, globalRules, rules)),
        (validationObject.messages = $.extend(
          {},
          globalMessages,
          validationMessages
        ));

      $(this).validate(validationObject);
    },
  });

  $(".serviceType").on("change", function () {
    $(".est_code").removeAttr("required");
    $(this)
      .parents("form")
      .find(":input,select")
      .not(":button, :submit, :reset, :hidden,:radio")
      .val("")
      .prop("checked", false)
      .prop("selected", false);
    $(".toggle").hide();
    $(".toggle#" + $(this).attr("data-view")).show();
    $(".est_code:visible").attr("required", "required");
    $("#police_station, #court, #courtname").attr("disabled", "disabled");
  });

  $('.ecourt-services-form form input[type="reset"]').on("click", function (evt) {
      evt.preventDefault();
      $(this).closest("form").get(0).reset();
      $(".toggle").hide();
      $(".toggle#courtComplex").show();
      $(".resultsHolder > div").addClass("hide");
    });

  $(".est_code").on("change", function () {
    let targetSelect = "";
    let hasCourt = $("#court").length;
    let hasCourtname = $("#courtname").length;
    let hasCaseType = $("#case_type").length;
    let hasPoliceStation = $("#police_station").length;

    if (
      hasCourt <= 0 &&
      hasCourtname <= 0 &&
      hasCaseType <= 0 &&
      hasPoliceStation <= 0
    )
      return;

    let form = $(this).parents("form");
    let formData = {};

    if (hasCourt > 0) {
      targetSelect = "#court";
      formData.action = "get_court_lists";
    } else if (hasCourtname > 0) {
      targetSelect = "#courtname";
      formData.action = "get_court_name";
    } else if (hasCaseType > 0) {
      targetSelect = "#case_type";
      formData.action = "get_case_types";
    } else if (hasPoliceStation > 0) {
      targetSelect = "#police_station";
      formData.action = "get_police_stations";
    }

    if ($(this).val() == "") {
      form.find(targetSelect).attr("disabled", "disabled");
      return;
    }

    let formDataArray = form.serializeArray();

    $.map(formDataArray, function (n, i) {
      if (n["value"] !== "") {
        formData[n["name"]] = n["value"];
      }
    });

    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/wp-admin/admin-ajax.php",
      data: formData,
      beforeSend: function () {
        form.find("input,button").attr("disabled", "disabled");
        form.find(targetSelect).attr("disabled", "disabled");
        $(".resultsHolder > div").addClass("hide");
        $(".service-loader").removeClass("hide");
        document.addEventListener("keydown", stopTabFunction);
      },
      success: function (response) {
        $(".service-loader").addClass("hide");
        form.find("input,button").removeAttr("disabled");
        form.find(targetSelect).removeAttr("disabled");
        if (response.success) {
          $(targetSelect).html(response.data);
        } else {
          let data = $.parseJSON(response.data);
          if (data.message) {
            $("#cnrResults").html(
              '<div class="notfound" role="alert">' + data.message + "</div>"
            );
          } else {
            $("#cnrResults").html(
              '<div class="notfound" role="alert">Nothing Found</div>'
            );
          }
        }
        document.removeEventListener("keydown", stopTabFunction);
      },
    });
  });

  $("body").on("click", ".viewCnrDetailsBack", function (e) {
    let action = $(this).attr("data-action");
    $(".resultsHolder > div,.ecourt-services-form").addClass("hide");
    if (action == "backCaseList") {
      $(".ecourt-services-form,#cnrResults").removeClass("hide");
      $(".viewCnrDetailsBack").addClass("hide");
    } else if (action == "backCnrDetails") {
      $("#cnrResultsDetails").removeClass("hide");
      $(".viewCnrDetailsBack").attr("data-action", "backCaseList");
    }

    let backView = $('.resultsHolder');
    let backId =  $(this).attr('data-back-id')
    if(backId) backView =   $($("#"+backId));

    $("html, body").animate({scrollTop:backView.offset().top - 250,}, 1200);

    if(backId){
      setTimeout(function (){
        backView.find('td').css({"background-color": "#d5eb1f54","transition":"0.5s"});
      },1500)
      setTimeout(function (){
        backView.find('td').css({ 'background-color' : ''} )
      },4000)
    }
  });

  $("body").on("click", ".viewCnrDetails ,.caseTransferredToFromCNRDetails", function (e) {
    e.preventDefault();
    let data = {};
    let cno = $(this).attr("data-cno");
    let est_code = $(this).attr("data-est-code");
    let render_type = $(this).attr("data-render-type");
    let back_id = $(this).parents('tr').attr("id");
    $(".resultsHolder > div,.ecourt-services-form").addClass("hide");

    data.cino = cno;
    data.action = "get_cnr_details";
    data.es_ajax_request = 1;

    if (render_type == "cavet") {
      data.action = "get_cav_details";
    }

    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/wp-admin/admin-ajax.php",
      data: data,
      beforeSend: function () {
        $("html, body").animate({scrollTop: $(".resultsHolder").offset().top - 200,}, 800);
        $(".service-loader").removeClass("hide");
        $('.viewCnrDetailsBack').attr('data-back-id',back_id);
      },
      success: function (response) {
        $(".service-loader").addClass("hide");
        $(".viewCnrDetailsBack").removeClass("hide");
        if (response.success) {
          $("#cnrResultsDetails")
            .html(response.data)
            .attr("data-cno", cno)
            .removeClass("hide");
          $("html, body").animate(
            {
              scrollTop: $(".resultsHolder").offset().top - 200,
            },
            1200
          );
          $("#cnrResultsDetails table").not(".no-responsive").basictable({
            breakpoint: 991,
            forceResponsive: true,
          });
        } else {
          let data = $.parseJSON(response.data);
          if (data.message) {
            $("#cnrResultsDetails")
              .html(
                '<div class="notfound" role="alert">' + data.message + "</div>"
              )
              .removeClass("hide");
          } else {
            $("#cnrResultsDetails")
              .html('<div class="notfound" role="alert">Nothing Found</div>')
              .removeClass("hide");
          }
        }
      },
      error: function(){
        $('.viewCnrDetailsBack').trigger('click')
      }
    });
  });

  $("body").on("click", "#getBusiness", function () {
    let data = {};

    let businessDate = $(this).attr("data-business-date");

    data.fields = $(this).data("case");
    data.action = "get_business";
    data.es_ajax_request = 1;

    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/wp-admin/admin-ajax.php",
      data: data,
      beforeSend: function () {
        $(".resultsHolder > div,.viewCnrDetailsBack").addClass("hide");
        $(".service-loader").removeClass("hide");
        $("html, body").animate(
          {
            scrollTop: $(".resultsHolder").offset().top - 200,
          },
          1200
        );
      },
      success: function (response) {
        $(".service-loader").addClass("hide");
        if (response.success) {
          $("#cnrResultsBusiness")
            .html(response.data)
            .attr("data-business-date", businessDate)
            .removeClass("hide");
          $("#cnrResultsBusiness").after(
            '<div class="printBusinessHolder text-center"><button class="btn btn-style-outline accent-color accent-border-color" id="printBusiness">Print</button></div>'
          );
          $(".viewCnrDetailsBack")
            .attr("data-action", "backCnrDetails")
            .removeClass("hide");
          $("html, body").animate(
            {
              scrollTop: $(".resultsHolder").offset().top - 200,
            },
            1200
          );
          $("#cnrResultsBusiness table").not(".no-responsive").basictable({
            breakpoint: 991,
            forceResponsive: true,
          });
        } else {
          let data = $.parseJSON(response.data);
          let message = data.message ? data.message : "Nothing Found";
          $("#cnrResults")
            .html('<div class="notfound" role="alert">' + message + "</div>")
            .removeClass("hide");
        }
      },
    });
  });

  $("body").on("click", "#printBusiness", function () {
    let printContent = document.getElementById("cnrResultsBusiness");
    let WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title></title>");
    WinPrint.document.write(
      '<link rel="stylesheet" href="/wp-content/themes/sdo-theme/css/base.css" type="text/css" />'
    );
    WinPrint.document.write(printContent.innerHTML);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    setTimeout(function () {WinPrint.close();}, 100, WinPrint);
  });


  $("body").on("click", ".loadMoreCases", function (e) {
    e.preventDefault();
    let $this = $(this),parentHolder = $this.parents('.distTableContent');
    let nextPage = parentHolder.attr('data-next-page');
    let formData = JSON.parse(parentHolder.attr('data-form-data'));
    let labelClicked = $this.attr('aria-label');

    formData.page = nextPage;
    formData['loadmore_clicked'] = 1;

    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/wp-admin/admin-ajax.php",
      data: formData,
      beforeSend: function () {
        $this.addClass('disabled').parent().addClass('waiting');
        $this.attr({'role':'alert','aria-label': 'Loading Data'});
      },
      success: function (response) {
        $this.removeClass('disabled').parent().removeClass('waiting');
        if (response.success) {
          let dataObj = $(response.data);
          let trData = dataObj.find('table tbody tr');

          parentHolder.find('table tbody').append(trData);
          parentHolder.attr('data-form-data',JSON.stringify(formData));
          parentHolder.attr('data-total-cases',dataObj.attr('data-total-cases'));
          parentHolder.attr('data-next-page',dataObj.attr('data-next-page'));
          if(dataObj.find('.loadMoreCasesHolder').length == 0){
            parentHolder.find('.loadMoreCasesHolder').hide();
          }
          parentHolder.not(".no-responsive").basictable({breakpoint: 991, forceResponsive: true,});
        }
        $this.removeAttr('role');
        $this.attr({'aria-label': labelClicked});
      },
    });
  });
});
