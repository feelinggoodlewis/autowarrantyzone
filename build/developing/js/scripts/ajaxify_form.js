$("#quoteForm").submit(function (event) {
    event.preventDefault();
    sendFormMessage();
});

function sendFormMessage() {
    var phoneMaskVal = $('.quote-form--phone').val().replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
    phoneMaskVal = phoneMaskVal.substring(1, phoneMaskVal.length);
    $('.quote-form--phone-formatted').val(phoneMaskVal);
    var valid = true;
    $("select,.form-item--input").each(function () {
        valid = validateInput(this);
    });
    $('.form-errors').empty();
    $('.form-errors').hide();
    if (valid === true) {
        $('.quote-form button').addClass('disabled');
        var errors = "";
        var formSerialize = $('#quoteForm').serialize();
        var ajaxUrl = "https://lafires.com/d.ashx?ckm_campaign_id=14&ckm_key=GyDWoqNdMlM&ckm_test=1&" + formSerialize + "";
        jQuery.ajax({
            url: ajaxUrl,
            type: "GET",
            dataType: 'jsonp',
            success: function (data) {
                console.log(data);
                
                if (data.success == true) {
                    location.href = data.nextPage;
                    return true;
                }
                if (data.errors) {
                    for (var i = 0; i < data.errors.length; i++) {
                        errors += "<span>" + data.errors[i] + "</span><br>"
                    }
                    $('.form-errors').append(errors);
                    $('.form-errors').show();
                    $('.quote-form button').removeClass('disabled');
                    return true;
                }
                $('.form-errors').append('Something went wrong');
                $('.form-errors').show();
                $('.quote-form button').removeClass('disabled');
            },
            error: function (err) {
                console.log(err);
            }
        });
    } else {
        $('.form-error').html(valid);
    }
}

function validateInput(elem) {
    var elem = $(elem);
    if (elem.length < 0) {
        return;
    }
    var elemParent = $(elem).parent();
    var isEmail = elem.hasClass('quote-form--email');
    var emailValidate = elem.val().match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
    var valid = true;

    elem.removeClass('error');
    elemParent.removeClass('input-error');
    elemParent.find('.desc').hide();

    if (!elem.val().trim() || (isEmail && !emailValidate)) {
        if (isEmail && !emailValidate) {
            elemParent.find('.desc').text('Email is not valid!');
        } else if(isEmail && emailValidate) {
            elemParent.find('.desc').text('Email is required!');
        }
        elemParent.find('.desc').show();
        elem.addClass('error');
        elemParent.addClass('input-error');
        valid = false;
    }

    return valid;
}

function selectLoading(element, show = true) {
    if (show) {
        $(element).addClass('loader');
    } else {
        $(element).removeClass('loader');
    }
}

$(document).ready(function () {
    $(".chosen-select").chosen();

    selectLoading('.form-item-year .chosen-container.chosen-container-single');
});


var apiUrl = "https://www.carqueryapi.com/api/0.3/";
var selectYear = $('.form-item-year .quote-form--year');
var selectMake = $('.form-item-make .quote-form--make');
var selectModel = $('.form-item-model .quote-form--model');

$.getJSON(apiUrl + "?callback=?", { cmd: "getYears", sold_in_us: 1 }, function (data) {

    var minYear = data.Years.min_year;
    var maxYear = data.Years.max_year;

    selectYear.find('option').remove();

    var options = "";
    options += "<option value=''>Select Year</option>";
    for ($i = maxYear; $i >= minYear; $i--) {
        options += "<option value=" + $i + ">" + $i + "</option>";
    }

    selectYear.html(options);
    selectLoading('.form-item-year .chosen-container.chosen-container-single', false);
    selectYear.trigger("chosen:updated");

});

$('body').on('change', '.form-item-year .quote-form--year', function () {
    selectLoading('.form-item-make .chosen-container.chosen-container-single');
    if ($(".quote-form--model").val()) {
        selectLoading('.form-item-model .chosen-container.chosen-container-single');
    }
    var selectYearValue = selectYear.val();

    $.getJSON(apiUrl + "?callback=?", { cmd: "getMakes", year: selectYearValue, sold_in_us: 1 }, function (data) {

        var makes = data.Makes;

        var options = "";
        options += "<option value=''>Select Make</option>";
        for (var i = 0; i < makes.length; i++) {
            options += "<option value=" + makes[i].make_id + ">" + makes[i].make_display + "</option>";
        }

        selectMake.html(options);
        selectMake.removeAttr('disabled');
        selectMake.parents('.form-item-make').removeClass('non-selectable');
        selectLoading('.form-item-make .chosen-container.chosen-container-single', false);
        selectLoading('.form-item-model .chosen-container.chosen-container-single', false);
        selectModel.attr('disabled', 'disabled');
        selectModel.parents('.form-item-model').addClass('non-selectable');
        selectModel.trigger("chosen:updated");
        selectMake.trigger("chosen:updated");

    });

});

$('body').on('change', '.form-item-make .quote-form--make', function () {
    selectLoading('.form-item-model .chosen-container.chosen-container-single');
    var selectYearValue = selectYear.val();
    var selectMakeValue = selectMake.val();
    selectModel.find('option').remove();

    $.getJSON(apiUrl + "?callback=?", { cmd: "getModels", make: selectMakeValue, year: selectYearValue, sold_in_us: 1 }, function (data) {

        var models = data.Models;

        var options = "";
        options += "<option value=''>Select Model</option>";
        for (var i = 0; i < models.length; i++) {
            options += "<option value=" + models[i].model_make_id + ">" + models[i].model_name + "</option>";
        }

        selectModel.html(options);
        selectModel.removeAttr('disabled');
        selectModel.parents('.form-item-model').removeClass('non-selectable');
        selectLoading('.form-item-model .chosen-container.chosen-container-single', false);
        selectModel.trigger("chosen:updated");

    });

});

$('#quoteForm .form-item--input').on('keyup', function (e) {
    validateInput(this);
    var maxLength = parseInt($(this).attr('maxlength'));
    var curentValLength = $(this).val().length;
    curentValLength = curentValLength + 1;


    if ($(this).val().length >= maxLength) {
        return false;
    } else {
        return true;
    }
});

$('#quoteForm select').on('change', function (e) {
    validateInput(this);
});

$(".quote-form--phone").keydown(function (e) {
    var numLength = $(this).val().length;
    var numValue = $(this).val();
    if (numLength == 3 && e.which != 8 && e.which != 0) {
        $(this).val('(' + numValue + ')' + " ");
    } else if (numLength == 9 && e.which != 8 && e.which != 0) {
        $(this).val(numValue + "-");
    }
});

$(function () {

    $('.numeric').not('.quote-form--phone').on('keypress', function (e) {
        if (isNaN(this.value + "" + String.fromCharCode(e.charCode))) return false;
    })
    .on("cut copy paste", function (e) {
        e.preventDefault();
    });

});

$('.quote-form--phone').keydown(function (e) {
    var key = e.charCode || e.keyCode || 0;
    return (
        key == 8 ||
        key == 9 ||
        key == 13 ||
        key == 46 ||
        key == 110 ||
        (key >= 35 && key <= 40) ||
        (key >= 48 && key <= 57) ||
        (key >= 96 && key <= 105)
    );
});