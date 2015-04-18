$(function(){
    var config = {
        api_url: "http://webkdd.org/"
    };
    localStorage.setItem('config', JSON.stringify(config));
    var user   = JSON.parse(localStorage.getItem('user'));
    if (user != null) {
        // CHECK USER IDENTITY
        if (user.identity == 1) {
        } else {
        }
    }
	$("[data-role='navbar']").navbar();
    $("[data-role='header'], [data-role='footer']").toolbar();
});
$(document).on('pageinit', function() {
	$("[data-role='navbar']").navbar();
    $("[data-role='header'], [data-role='footer']").toolbar();
});


$('#index-page').on('pageinit', function() {
	$("#nav-footer [data-icon=home]").addClass("ui-btn-active");
});
$('#user-page').on('pageinit', function() {
	$("#nav-footer [data-icon=user]").addClass("ui-btn-active");
});
$('#about-page').on('pageinit', function() {
	$("#nav-footer [data-icon=info]").addClass("ui-btn-active");
});
$('#setting-page').on('pageinit', function() {
	$("[data-icon=gear]").addClass("ui-btn-active");
});
$('#message-detail-page').on('pageinit', function() {

});


$('#choose-date-page').on('pageinit', function() {
	bindAble();
	bindSelected();
});
$('#set-date-page').on('pageinit', function() {
	bindSetEmpty();
	bindSetAble();
});

$('#set-keywords-page').on('pageinit', function() {
	$('#tags').tagsInput();
});

function bindAble()
{
	$(".reserve-table .able").click(function(){
		$(this).removeClass("able").addClass("selected");
		bindSelected();
	});
}
function bindSelected()
{
	$(".reserve-table .selected").click(function(){
		$(this).removeClass("selected").addClass("able");
		bindAble();
	});
}

function bindSetEmpty()
{
	$(".reserve-table .able").click(function(){
		$(this).removeClass("able").addClass("empty");
		bindSetAble();
	});
}
function bindSetAble()
{
	$(".reserve-table .empty").click(function(){
		$(this).removeClass("empty").addClass("able");
		bindSetEmpty();
	});
}


function getParameter(name) {
    var url = document.location.href;
    var start = url.indexOf("?")+1;
    if (start==0) {
        return "";
    }
    var value = "";
    var queryString = url.substring(start);
    var paraNames = queryString.split("&");
    for (var i=0; i<paraNames.length; i++) {
        if (name==getParameterName(paraNames[i])) {
            value = getParameterValue(paraNames[i])
        }
    }
    return value;
}

function getParameterName(str) {
    var start = str.indexOf("=");
    if (start==-1) {
        return str;
    }
    return str.substring(0,start);
}

function getParameterValue(str) {
    var start = str.indexOf("=");
    if (start==-1) {
        return "";
    }
    return str.substring(start+1);
}
