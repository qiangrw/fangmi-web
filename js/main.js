// Global Page Ready Functions
var config = { api_url: "http://api.funmi.cn/"};
localStorage.setItem('config', JSON.stringify(config));
var user   = JSON.parse(localStorage.getItem('user'));
var server_err_fn = function(data) { 
    show_common_error("服务器错误，请稍后再试。"); 
    hide_loading();
    console.log(data);
};
var server_err_redirect_fn = function(data) { 
    console.log(data);
    hide_loading();
    redirect_to("signin.html");
};
var whole_house = JSON.parse(localStorage.getItem('whole_house'));
var single_house = JSON.parse(localStorage.getItem('single_house'));
var cur_url;
if (whole_house == null) {
    whole_house = {
        type: 0,
        rooms: [ {
            name: 'default', 
            area: 0, 
            date_entrance: null
        }]
    };
}
if (single_house == null) { single_house = { type: 1 }; }


// global functions                                                                    
var show_loading = function(event) { $('body').addClass('ui-loading'); }
var hide_loading = function(event) { $('body').removeClass('ui-loading'); }
var redirect_to = function(page) { 
    hide_loading();
    $( ":mobile-pagecontainer" ).pagecontainer( "change", page, { role: "page" } ); 
}
var wait_and_redirect_to = function(page, time) {
    if (time == null) time = 1000;
    window.setTimeout(function(){
        redirect_to(page);
    }, time);
}
var show_common_error = function(error) {
    $("#error").html(error);
    $("#error").show();
}
var hide_common_error = function() {
    $("#error").html('');
    $("#error").hide();
}
function refreshPage()
{
    // TODO currently not work 
    /*$.mobile.pageContainer.pagecontainer('change', window.location.href, {
        allowSamePageTransition: true,
        transition: 'none',
        reload: true,
        reloadPage: true 
        // 'reload' parameter not working yet: //github.com/jquery/jquery-mobile/issues/7406
    });*/
    $.mobile.activePage.trigger("pagebeforecreate");
    $.mobile.activePage.trigger("pagecreate");
    $.mobile.activePage.trigger("pageinit");
    $.mobile.activePage.trigger("pagebeforeshow");
    // $.mobile.activePage.trigger("pageinit");
}
function alert_message(message) { 
    $( "#popup-message" ).html(message);
    $( "#popup" ).popup("open");
}

// deal with all the file uploading problem
function progressHandlingFunction(e){
    if(e.lengthComputable){
        $('progress').attr({value:e.loaded,max:e.total});
    }
}

// whether user is loaded before
function user_loaded() {
    return user != null && user.username != null;
}


// Global Page before show functions
$(function() {
    $("[data-role='navbar']").navbar();
    $("[data-role='header'], [data-role='footer']").toolbar({ tapToggle:false});
});

$(document).on('pagebeforeshow', function() {
    // Handling navbar related logic
    $("[data-role='navbar']").navbar();
    $("[data-role='header'], [data-role='footer']").toolbar({ tapToggle:false});
    var id = $.mobile.activePage.attr('id');
    cur_url = $.mobile.activePage.data('url');
    $("#nav-footer li a").removeClass("ui-btn-now");
    console.log("[log] loading " + id);
	$("[data-role='navbar']").show();
    if (id == "index-page") $("#nav-footer [data-icon='home']").addClass("ui-btn-now");
    if (id == "user-page") $("#nav-footer [data-icon='user']").addClass("ui-btn-now");
    if (id == "about-page") $("#nav-footer [data-icon='info']").addClass("ui-btn-now");
    if (id == "setting-page") $("#nav-footer [data-icon='gear']").addClass("ui-btn-now");
	if (id == "signin-page")  $("[data-role='navbar']").hide();
	if (id == "signup-page")  $("[data-role='navbar']").hide();
	if (id == "forget-password-page")  $("[data-role='navbar']").hide();
	
    user = JSON.parse(localStorage.getItem('user'));
    if (user != null && user.username != null) {
        $(".ui-btn-signin").hide();
        $(".ui-btn-signup").hide();
    } else {
        $(".ui-btn-signin").show();
        $(".ui-btn-signup").show();
    }
    hide_common_error();
});

$('#index-page').on('pagebeforeshow', function() {
    console.log("loading");
	if (user != null && user.access_token != null) {
		var base_url = "api/apartment/list";
		var element = "home-houselist";
		$("#" + element).hide();
		show_loading();
		$("#empty-houselist-notice").hide();
		get_with_auth(base_url, function(data) {
			if (data.message == 'OK') {
				tempo_show(element, data.apartments);
				if (data.apartments == null || data.apartments.length == 0) $("#empty-houselist-notice").show();
			}  else {
				hide_loading();
			} 
		}, function() {hide_loading();});     
	}
});


$('#rentlist-page').on('pagebeforeshow', function() {
    var element = "rentlist";
    $("#" + element).hide();
    show_loading();
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/rent/list",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     console.log(data);
                     if (data.message == 'OK') {
                         if (data.rents.length == 0) {
                             redirect_to("rentlist_empty.html");
                         } else {
                             Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                                 hide_loading(); 
                                 $("#" + element).show();
                             }).render(data.rents);
                         }
                     } 
                 },
        error: server_err_fn
    });     
});


$('#more-device-page').on('pagebeforeshow', function() {
    var element = "more-device-list";
    $("#" + element).hide();
    show_loading();
    var id = getParameter("id");
    var landlord = null;
    if (id == null) return;
    $.ajax({
        type: 'GET',
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Bearer " + user.access_token);
      },
      url: config.api_url + "api/apartment?id=" + id,
      success: function(data) {
          if (data.message == 'OK') {
              console.log(data.apartment);
              Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                  $("#" + element).show();
                  hide_loading();
              }).render(data.apartment.devices);
          }
      }
    });
});


// set_date.html
$('#set-date-page').on('pagebeforeshow', function() {
    var type = getParameter("type");
    var house_type = type == 0 ? 'whole_house' : 'single_house';
    var house = type == 0 ? whole_house : single_house;
    console.log(type);

    $(".flipbox-input").datebox({ mode: "flipbox", afterToday: true });
    $("#start_time").datebox({ mode: "timeflipbox" }); 
    $("#end_time").datebox({ mode: "timeflipbox" });

    if (house.reserve_choices != null) {
        var choices = house.reserve_choices;
        for (i=0; i<choices.length; ++i) {
            var choice = choices[i];
            $("#my-date-list").append(
                '<li><a href="#">' + choice.date + 
                ' '+ from_time(choice.time_start) + ' - ' + from_time(choice.time_end) + '</a></li>'
                ).listview('refresh');
        }
    }

    $("#submit-add-date").unbind().click(function() {
        var date = $('#reserve_date').val();
        var start = $('#start_time').val();
        var end = $('#end_time').val();
        if (date.length == 0 || start.length == 0 || end.length == 0) {
            alert("请点击图标选择时间");
            return;
        }

        $("#my-date-list").append(
            '<li><a href="#">' + date + 
            ' '+ start + ' - ' + end + '</a></li>'
            ).listview('refresh');
        $("#my-date-list li").click(function() {
            $(this).remove();
            $("#my-date-list").listview('refresh');
        });
    });

    $("#my-date-list li").click(function() {
        $(this).remove();
        $("#my-date-list").listview('refresh');
    });

    var reserve_choices = [];
    $("#set-date-back").unbind().click(function() {
        $("#my-date-list li>a").each(function(index) {
            // assign date
            var eles =  $(this).html().split(' ');
            reserve_choices.push({
                date: eles[0],
                time_start: to_time(eles[1], eles[2]),
                time_end:   to_time(eles[4], eles[5])
            });
        });
        var type = getParameter("type");
        var house_type = type == 0 ? 'whole_house' : 'single_house';
        var house = type == 0 ? whole_house : single_house;
        house["reserve_choices"] = reserve_choices;
        var type = getParameter("type");
        var house_type = type == 0 ? 'whole_house' : 'single_house';
        var house = type == 0 ? whole_house : single_house;
        localStorage.setItem(house_type, JSON.stringify(house));
        if (type == 0) redirect_to("post_whole.html");
        else redirect_to("post_single.html");
    });
});


// set_rooms.html
$('#set-rooms-page').on('pagebeforeshow', function() {
    var type = 1;
    var house_type = type == 0 ? 'whole_house' : 'single_house';
    var house = type == 0 ? whole_house : single_house;

    $(".flipbox-input").datebox({ mode: "flipbox", afterToday: true });
    if (house.rooms != null) {
        var rooms = house.rooms;
        for (i=0; i<rooms.length; ++i) {
            var room = rooms[i];
            $("#my-room-list").append(
                '<li><a href="#" name="'+room.name+ '" price="' + room.price + '" area="' + room.area + '" date_entrance="' + room.date_entrance +   '">' + 
                room.name  + ' ['+ room.price + '元/月 ' + room.area + '平方] ' +  room.date_entrance + '</a></li>' 
                ).listview('refresh');
        }
    }

    $("#submit-add-room").unbind().click(function() {
        var name = $('#name').val();
        var price = $('#price').val();
        var area = $('#area').val();
        var date_entrance = $('#date_entrance').val();
        if (name.length == 0 || price.length == 0 || area.length == 0 || date_entrance.length == 0) {
            alert("请把房间信息填充完整.");
            return;
        }

        $("#my-room-list").append(
            '<li><a href="#" name="'+name+ '" price="' + price + '" area="' + area +  '" date_entrance="' + date_entrance +   '">' + 
            name  + ' ['+ price + '元/月 ' + area + '平方] ' +  date_entrance + '</a></li>' 
            ).listview('refresh');
        $("#my-room-list li").click(function() {
            $(this).remove();
            $("#my-room-list").listview('refresh');
        });
    });

    $("#my-room-list li").click(function() {
        $(this).remove();
        $("#my-room-list").listview('refresh');
    });

    var rooms = [];
    $("#set-room-back").unbind().click(function() {
        $("#my-room-list li>a").each(function(index) {
            // assign date
            rooms.push({
                name:  $(this).attr("name"), 
                price:  $(this).attr("price"), 
                area:  $(this).attr("area"), 
                date_entrance:  $(this).attr("date_entrance")
            });
        });
        house["rooms"] = rooms;
        localStorage.setItem(house_type, JSON.stringify(house));
        redirect_to("post_single.html");
    });
});


// set_entrance_date.html
$('#set-entrance-date-page').on('pagebeforeshow', function() {
    if (whole_house.rooms[0].date_entrance) {
        $('#entrance_date').val(whole_house.rooms[0].date_entrance);
    }
    $("#set-entrance-date").click(function() {
        var date = $('#entrance_date').val();
        if (date.length == 0) {
            alert("请点击图标选择时间");
            return;
        }
        whole_house.rooms[0].date_entrance = date;
        localStorage.setItem('whole_house', JSON.stringify(whole_house));
        redirect_to("post_whole.html");
    });
});

// set_keywords.html
$('#set-keywords-page').on('pagebeforeshow', function() {
    var type = getParameter("type");
    var house_type = type == 0 ? 'whole_house' : 'single_house';
    var house = type == 0 ? whole_house : single_house;

    var tags_text = "";
    if (house.tags != null) {
        for (i = 0; i < house.tags.length; ++i) {
            if (i != 0) tags_text += ",";
            tags_text += house.tags[i].name;
        }
    }
    $('.input-tags').val(tags_text);


    $("#set-keywords").unbind().click(function() {
        var tags = $("#tags").val().split(',');
        var tag_array = [];
        for (i=0; i<tags.length; ++i) {
            tag_array.push( { name: tags[i] });
        }
        var type = getParameter("type");
        var house_type = type == 0 ? 'whole_house' : 'single_house';
        var house = type == 0 ? whole_house : single_house;
        house["tags"] = tag_array;
        localStorage.setItem(house_type, JSON.stringify(house));
        if (type == 0) redirect_to("post_whole.html");
        else redirect_to("post_single.html");
    });  
    $('.input-tags').tagsInput();
});

// set_devices.html
$('#set-device-page').on('pagebeforeshow', function() {
    $("#set-device").unbind().click(function() {
        var devices = [];
        $('input[data-cacheval="false"]').each(function(index) {
            devices.push({
                name: $(this).attr("name"),
                count: 1
            });
        });
        var type = getParameter("type");
        var house_type = type == 0 ? 'whole_house' : 'single_house';
        var house = type == 0 ? whole_house : single_house;
        house["devices"] = devices;
        localStorage.setItem(house_type, JSON.stringify(house));
        var type = getParameter("type");
        if (type == 0) redirect_to("post_whole.html");
        else redirect_to("post_single.html");
    });
});


// simple user related post logic 
function user_post(pconfig) {
    $(pconfig.button).unbind().click(function(){
        if (pconfig.required.length != 0) {
            for (var i = 0; i < pconfig.required.length; ++i) {
                if ($(pconfig.required[i]).val() == "") {
                    show_common_error("请将表单填写完整");
                    return;
                }
            }
        }


        $.ajax({
            type: 'POST',
            url: config.api_url + pconfig.api,
            beforeSend: function (request) { request.setRequestHeader("Authorization", "Bearer " + user.access_token); },
            data: $(pconfig.form).serialize(),
            success: function(data) {
                if (data.message == 'OK') {
                    show_common_error(pconfig.message);
                    if (pconfig.succ_func) pconfig.succ_func();
                } else {
                    show_common_error(data.message);
                }
            },
            error: server_err_fn
        });   
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

function to_time(time, type) {
    var eles = time.split(':');
    eles[0] = parseInt(eles[0]);
    if (type == '下午' && eles[0] != 12 ) {
        eles[0] += 12; 
    } else if (type == '上午' && eles[0] == 12) {
        eles[0] = 0;
    }
    return (eles[0] + ":" + eles[1] + ":" + "00");
}

function from_time(time) {
    var eles = time.split(':');
    eles[0] = parseInt(eles[0]);
    type = '上午';
    if (eles[0] > 12) type = '下午';
    if (eles[0] == 0) {
        type = '上午';
        eles[0] = 12;
    }
    return (eles[0] + ":" + eles[1] + " " + type);
}


function post_photo(apartment_id)
{         
    $("#id").val(apartment_id);
    var formData = new FormData($('#file-form')[0]);
    console.log("start updaloding");
    $.ajax({
        url: config.api_url + "api/apartment/photos", 
        type: 'POST',
        xhr: function() {  
            var myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){ 
                console.log("updalod");
                myXhr.upload.addEventListener('progress',progressHandlingFunction, false); 
            }
            return myXhr;
        },
        beforeSend: function (request) {
                        console.log("before updalod");
                        request.setRequestHeader("Authorization", "Bearer " + user.access_token);
                    },
        success: function(data) {
                     if (data.message == 'OK') { 
                         show_common_error("文件发送成功."); 
                         redirect_to("detail.html?id=" + apartment_id);
                     }
                     else  show_common_error(data.message);
                 },
        error: server_err_fn,
        data: formData,
        cache: false,
        contentType: false,
        processData: false
    });
}

function get_with_auth(api_name, succ_func, error_func) {
    ajax_with_auth('GET', api_name, succ_func, error_func);
}

function put_with_auth(api_name, succ_func, error_func) {
    ajax_with_auth('PUT', api_name, succ_func, error_func);
}

function post_with_auth(api_name, succ_func, error_func) {
    ajax_with_auth('POST', api_name, succ_func, error_func);
}

function get_without_auth(api_name, succ_func, error_func) {
    ajax_without_auth('GET', api_name, succ_func, error_func);
}

function put_without_auth(api_name, succ_func, error_func) {
    ajax_without_auth('PUT', api_name, succ_func, error_func);
}

function post_without_auth(api_name, succ_func, error_func) {
    ajax_without_auth('POST', api_name, succ_func, error_func);
}

function post_with_data_auth(api_name, data, succ_func, error_func) {
    if (error_func == null) error_func = server_err_fn;
    $.ajax({
        type: 'POST',
      beforeSend: function (request) { request.setRequestHeader("Authorization", "Bearer " + user.access_token); },
      url: config.api_url + api_name,
      data: data,
      success: succ_func,
      error: error_func
    });  
} 
function put_with_data_auth(api_name, data, succ_func, error_func) {
    if (error_func == null) error_func = server_err_fn;
    $.ajax({
        type: 'PUT',
      beforeSend: function (request) { request.setRequestHeader("Authorization", "Bearer " + user.access_token); },
      url: config.api_url + api_name,
      data: data,
      success: succ_func,
      error: error_func
    });  
}                                 
          
function post_with_data(api_name, data, succ_func, error_func) {
    if (error_func == null) error_func = server_err_fn;
    $.ajax({
      type: 'POST',
      url: config.api_url + api_name,
      data: data,
      success: succ_func,
      error: error_func
    });  
}        

function ajax_without_auth(type, api_name, succ_func, error_func) {
    if (error_func == null) error_func = server_err_fn;
    $.ajax( { 
        type: type,
      url: config.api_url + api_name,
      success: succ_func,
      error: error_func
    });   
}


function ajax_with_auth(type, api_name, succ_func, error_func) {
    if (error_func == null) error_func = server_err_fn;
    $.ajax( { 
        type: type,
      url: config.api_url + api_name,
      beforeSend: function (request) { request.setRequestHeader("Authorization", "Bearer " + user.access_token); },
      success: succ_func,
      error: error_func
    });   
}

var tempo_hide = function(element) {
    $("#" + element).show();
    hide_loading();
}
function tempo_show(element, data, binding_func) {
    console.log("[TempoShow]");
    console.log(data);
    $("#" + element).hide();
    show_loading();
    Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
        tempo_hide(element);
        if (binding_func != null) binding_func();
    }).render(data);
}

function tempo_obj_show(element, obj, data, binding_func) {
    console.log("[TempoShow]");
    console.log(data);
    $("#" + element).hide();
    show_loading();
	if (obj == null) obj = Tempo.prepare(element);
    obj.when(TempoEvent.Types.RENDER_COMPLETE, function() {
        tempo_hide(element);
        if (binding_func != null) binding_func();
    }).render(data);
}


function get_today() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    if (dd<10) { dd='0'+dd } 
    if (mm<10) { mm='0'+mm } 
    return (yyyy + "-" + mm + "-" + dd );
}

function get_tommorow() {
    var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var dd = currentDate.getDate();
    var mm = currentDate.getMonth() + 1;
    var yyyy = currentDate.getFullYear();
    if (dd<10) { dd='0'+dd } 
    if (mm<10) { mm='0'+mm } 
    return (yyyy + "-" + mm + "-" + dd );
}
