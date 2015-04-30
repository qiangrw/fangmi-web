// Global Page Ready Functions
var config = { api_url: "http://123.57.207.201:8080/"};
localStorage.setItem('config', JSON.stringify(config));
var user   = JSON.parse(localStorage.getItem('user'));
var server_err_fn = function(data) { 
    show_common_error("服务器错误，请稍后再试。"); 
    console.log(data);
};
var whole_house = JSON.parse(localStorage.getItem('whole_house'));
var single_house = JSON.parse(localStorage.getItem('single_house'));
var cur_url;
if (whole_house == null) {
    whole_house = {
        rooms: [ {
                   name: 'default', 
                   area: 0, 
                   date_entrance: null
               }]
    };
}
if (single_house == null) { single_house = { }; }


// global functions                                                                    
var show_loading = function(event) { 
    $('body').addClass('ui-loading');
}
var hide_loading = function(event) { 
    $('body').removeClass('ui-loading');
}
function refreshPage()
{
    // TODO currently not work 
    $.mobile.pageContainer.pagecontainer('change', window.location.href, {
        allowSamePageTransition: true,
        transition: 'none',
        reloadPage: true 
        // 'reload' parameter not working yet: //github.com/jquery/jquery-mobile/issues/7406
    });
}
function alert_message(message) { 
    $( "#popup-message" ).html(message);
    $( "#popup" ).popup("open");
}


// Global Page before show functions
$(function() {
    $("[data-role='navbar']").navbar();
    $("[data-role='header'], [data-role='footer']").toolbar();
});
$(document).on('pagebeforeshow', function() {
    // Handling navbar related logic
    $("[data-role='navbar']").navbar();
    $("[data-role='header'], [data-role='footer']").toolbar();
    var id = $.mobile.activePage.attr('id');
    cur_url = $.mobile.activePage.data('url');
    $("#nav-footer li a").removeClass("ui-btn-now");
    if (id == "index-page") $("#nav-footer [data-icon='home']").addClass("ui-btn-now");
    if (id == "user-page") $("#nav-footer [data-icon='user']").addClass("ui-btn-now");
    if (id == "about-page") $("#nav-footer [data-icon='info']").addClass("ui-btn-now");
    if (id == "setting-page") $("#nav-footer [data-icon='gear']").addClass("ui-btn-now");
    user = JSON.parse(localStorage.getItem('user'));
    if (user != null) {
        $(".ui-btn-signin").hide();
        $(".ui-btn-signup").hide();
    } else {
        $(".ui-btn-signin").show();
        $(".ui-btn-signup").show();
    }
    hide_common_error();
});

$('#houselist-page').on('pagebeforeshow', function() {
    cur_url = "houselist.html?"; 
    var base_url = config.api_url + "api/apartment/list?";
    var community_id = getParameter("community_id");
    var school_id = getParameter("school_id");
    var q = getParameter("q");
    if (community_id) {
        base_url += "&community_id=" + community_id;
        cur_url += "&community_id=" + community_id;
    }
    if (school_id) {
        base_url += "&school_id=" + school_id;
        cur_url += "&school_id=" + school_id;
    }
    if (q) {
        base_url += "&q=" + q;
        cur_url += "&q=" + q;
    }
    var element = "houselist";
    $("#" + element).hide();
    show_loading();
    $.ajax({
        type: 'GET',
        url: base_url,
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
            if (data.message = "OK") {
                Tempo.prepare(element)
                    .when(TempoEvent.Types.RENDER_COMPLETE, function() {
                        $("#" + element).show();
                        hide_loading(); 
                    }).render(data.apartments); } 
        },
        error: server_err_fn
    });     
});

 
$('#favlist-empty-page, #reservelist-empty-page, #rentlist-empty-page').on('pagebeforeshow', function() {
    cur_url = "houselist.html?"; 
    // TODO using recommend api in the future
    var base_url = config.api_url + "api/apartment/list?";
    var community_id = getParameter("community_id");
    if (community_id) {
        base_url += "&community_id=" + community_id;
        cur_url += "&community_id=" + community_id;
    }
    var element = "recommend-houselist";
    $("#" + element).hide();
    show_loading();
    $.ajax({
        type: 'GET',
        url: base_url,
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
            console.log(data);
            if (data.message = "OK") {
                Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                    hide_loading(); 
                    $("#" + element).show();
                }).render(data.apartments); } 
        },
        error: server_err_fn
    });     
});
    

$('#myhouselist-page').on('pagebeforeshow', function() {
    cur_url = "houselist.html?"; 
    var base_url = config.api_url + "api/apartment/list?username=" + user.username;
    var element = "myhouselist";
    $("#" + element).hide();
    show_loading();
    $.ajax({
        type: 'GET',
        url: base_url,
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
            console.log(data);
            if (data.message = "OK") {
                Tempo.prepare(element)
                        .when(TempoEvent.Types.RENDER_COMPLETE, function(){
                                $("#" + element).show();
                                hide_loading();
                        })
                        .render(data.apartments); } 
        },
        error: server_err_fn
    });     
});

$('#favlist-page').on('pagebeforeshow', function() {
    var element = "favhouselist";
    $("#" + element).hide();
    show_loading();
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/apartment/fav",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     if (data.message = "OK") {
                         if (data.apartments.length == 0) {
                             redirect_to("favlist_empty.html");
                         }
                         Tempo.prepare(element)
                            .when(TempoEvent.Types.RENDER_COMPLETE, function() 
                             {
                                 hide_loading(); 
                                 $("#" + element).show(); 
                             }).render(data.apartments);
                     } 
                 },
        error: server_err_fn
    });     
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
                     if (data.message = "OK") {
                         if (data.rents.length == 0) {
                             redirect_to("rentlist_empty.html");
                         } else {
                             Tempo.prepare(element)
                                    .when(TempoEvent.Types.RENDER_COMPLETE, function() {
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
          if (data.message = "OK") {
              console.log(data.apartment);
              Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                  $("#" + element).show();
                  hide_loading();
              }).render(data.apartment.devices);
          }
      }
    });
});

$('#choose-date-page').on('pagebeforeshow', function() {
    var element = "choose-date-list";
    $("#" + element).hide();
    show_loading();
    var id = getParameter("id");
    if (id == null) return;
    $.ajax({
        type: 'GET',
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Bearer " + user.access_token);
      },
      url: config.api_url + "api/apartment?id=" + id,
      success: function(data) {
          console.log("choose-date-page:");
          console.log(data.apartment.reserve_choices);
          if (data.message = "OK") {
              Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                  $("#choose-date-list fieldset input").checkboxradio();
                  $("#" + element).show();
                  hide_loading();
              }).render(data.apartment.reserve_choices);
          } 
      }
    }); 

    $("#submit-add-reserve").click(function() {
        var choice_id = $('#choose-date-list input[data-cacheval="false"]').val();
        if (!choice_id) {
            show_common_error("请至少选择一个时间");
            return;
        }
        $.ajax({
            type: 'POST',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Bearer " + user.access_token);
            },
            url: config.api_url + "api/reserve?reserve_choice_id=" + choice_id,
            success: function(data) {
                if (data.message == "OK") show_common_error("预约成功");  
                else  show_common_error(data.message); 
            }
        });    

    });
});


$('#edit-profile-page').on('pageinit', function() {
    var set_user_data = function(user) {
        user.gender = user.gender ? 1 : 0;
        $("#gender").val(user.gender);
        $("#gender option[value='"+user.gender+"']").attr('selected', 'selected');
        $('#gender').selectmenu('refresh', true);
        $("#horoscope").val(user.horoscope);
        $("#horoscope option[value='"+user.horoscope+"']").attr('selected', 'selected');
        $('#horoscope').selectmenu('refresh', true);
        $("#nickname").val(user.nickname);
        $("#status").val(user.status);
    };

    if (user == null) {
        redirect_to("signin.html");
        return;
    }

    if (user_loaded() == false) {
        $.ajax( { 
            type: 'GET',
          url: config.api_url + "api/account",
          beforeSend: function (request) {
              request.setRequestHeader("Authorization", "Bearer " + user.access_token);
          },
          success: function(data) {
                       if (data.message = "OK") {
                           $.extend(user, data.user);
                           user.avatar = config.api_url + user.avatar;
                           localStorage.setItem('user', JSON.stringify(user));
                           set_user_data(user);
                       } else redirect_to("signin.html");
                   },
          error: function(data) { redirect_to("signin.html"); }
        });  
    } else {
        set_user_data(user);
    }

    $("#submit_edit_profile").click(function(){
        $.ajax({
            type: 'POST',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Bearer " + user.access_token);
            },
            url: config.api_url + "api/account",
            data: $("#edit-profile-form").serialize(),
            success: function(data) {
                if (data.message == "OK") {
                    $.extend(user, data.user);
                    user.avatar = config.api_url + user.avatar;
                    localStorage.setItem('user', JSON.stringify(user));
                    show_common_error("保存成功");
                } else  show_common_error(data.message); 
            },
            error: function(data) { redirect_to("signin.html"); }
        });                 
    });
}); 


// message.html
$("#conversation-page").on('pageinit', function() {
    var element = "conversation-list";
    $("#" + element).hide();
    show_loading();
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/message/conversation",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     console.log(data);
                     if (data.message = "OK") {
                         Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                             $("#" + element).show();
                             hide_loading();
                         }).render(data.conversations);
                     } 
                 },
        error: server_err_fn
    });     
});


// message_detail.html
$('#message-detail-page').on('pagebeforeshow', function() {
    var from_username = getParameter("from_username");
    if (from_username == null) return;
    $("#to_username").val(from_username);
    $("#header-title").val(from_username);

    var element = "messagedetail-list";
    $("#" + element).hide();
    show_loading();
    var messages = null;
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/message/list?filter_unread=False&from_username=" + from_username,
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     console.log(data);
                     if (data.message = "OK") {
                         for (i = 0; i < data.messages.length; ++i) {
                             data.messages[i].mine = data.messages[i].from_username != from_username;
                         }
                         messages = data.messages;
                         console.log(data);
                         Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                             hide_loading(); 
                             $("#" + element).show();
                         }).render(data.messages);
                     } 
                 },
        error: server_err_fn
    });     


    $("#submit-post-message").click(function(){
        console.log($("#post-message-form").serialize());
        $.ajax({
            type: 'POST',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Bearer " + user.access_token);
            },
            url: config.api_url + "api/message",
            data: $("#post-message-form").serialize(),
            success: function(data) {
                if (data.message == "OK") {
                    var message =  { mine: true, content: $("#message-content-input").val() };
                    $("#messagedetail-list").append(
                        '<div class="message-div">' + 
                        '<div class="message-img-div"><img src="images/user/user_profile.png" /></div>'+
                        '<div class="message-text-div"><p>' + message.content + '</p></div>'+
                        '</div>'
                        );
                    $("#message-content-input").val('');
                } else  {
                    message_alert("发送失败");
                }
            }
        });                 
    });
});  

// forget_password.html
$('#forget-password-page').on('pageinit', function() {
    set_captcha_elements();
    $("#submit-forget").click(function(){
        $.ajax({
            type: 'POST',
            url: config.api_url + "api/account/password/forget",
            data: $("#forget-password-form").serialize(),
            success: function(data) {
                if (data.message == 'OK') {
                    show_common_error("修改成功，您可以用新密码登录了.");
                } else {
                    show_common_error(data.message);
                }
            },
            error: server_err_fn
        });   

    });    
});


// check_id.html
$('#apply-confirm-page').on('pageinit', function() {
    user_post({
        button: "#submit-apply-confirm",
        form:   "#apply-confirm-form",
        api:    "api/account/apply/confirmed",
        message: "审核申请发送成功，请耐心等待审核." 
    });
});

// check_student.html
$('#apply-student-page').on('pageinit', function() {
    $(':file').change(function(){
        var file = this.files[0];
        var name = file.name;
        var size = file.size;
        var type = file.type;
        // TODO add validation
    });
    function progressHandlingFunction(e){
        if(e.lengthComputable){
            $('progress').attr({value:e.loaded,max:e.total});
        }
    }

    $("#submit-apply-student").click(function() {
        var formData = new FormData($('#apply-student-form')[0]);
        console.log("start updaloding");
        $.ajax({
            url: config.api_url + "api/account/apply/student", 
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
                         if (data.message = "OK") 
            show_common_error("审核学生信息申请发送成功，请耐心等待审核."); 
                         else  
            show_common_error(data.message);
                     },
            error: server_err_fn,
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        });
    });
});



// signup.html
$('#signup-page').on('pageinit', function() {
    set_captcha_elements();
    $("#submit-signup").click(function(){
        $.ajax({
            type: 'POST',
            url: config.api_url + "api/account/register",
            data: $("#signup-form").serialize(),
            success: function(data) {
                if (data.message == 'OK') {
                    // TODO redirect to signup success page
                    show_common_error("注册成功，请登录.");
                } else {
                    show_common_error(data.message);
                }
            },
            error: function(data) { show_common_error('服务器错误'); }
        });   

    });
});

// setting.html
$('#setting-page').on('pagebeforeshow', function() {
    if (user == null) {
        redirect_to("signin.html");
        return;
    }
    if (user_loaded()) {
        Tempo.prepare("user-setting-info").render(user);
    } else {
        load_user("user-setting-info");
    }
    $("#signout-btn").unbind().click(function(){
        localStorage.removeItem('user');
        localStorage.removeItem('whole_house');
        localStorage.removeItem('single_house');
        redirect_to("signin.html");
    });
});   

// set_date.html
$('#set-date-page').on('pageinit', function() {
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
$('#set-rooms-page').on('pageinit', function() {
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
$('#set-entrance-date-page').on('pageinit', function() {
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
$('#set-keywords-page').on('pageinit', function() {
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
$('#set-device-page').on('pageinit', function() {
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

$('#post-single-page').on('pageinit', function() {
    // get community list   e
    var element = "community_id";
    show_loading();
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/community/list",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     console.log(data);
                     Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                         hide_loading();
                         $("#community_id").val(single_house.community_id);
                         $('#community_id').selectmenu('refresh', true);
                     }).render(data.communities);
                 }
    });


    // set value if have 
    if (single_house != null) {
        $("#title").val(single_house.title);
        $("#subtitle").val(single_house.subtitle);
        $("#address").val(single_house.address);
        $("#num_bedroom").val(single_house.num_bedroom);
        $("#num_livingroom").val(single_house.num_livingroom);
        $("#type").val(single_house.type);
        if (single_house.rooms != null) {
            $(".set-room-link").html("已经设置");
        }
        if (single_house.reserve_choices != null) {
            $(".set-date-link").html("已经设置");
        }
        if (single_house.tags != null) {
            $(".set-keywords-link").html("已经设置");
        }
        if (single_house.devices != null) {
            $(".set-devices-link").html("已经设置");
        }
    }


    // post a new house
    $("#submit-post-single").click(function() {
        single_house.title = $("#title").val();
        single_house.subtitle = $("#subtitle").val();
        single_house.address = $("#address").val();
        single_house.community_id = $("#community_id").val();
        single_house.num_bedroom = $("#num_bedroom").val();
        single_house.num_livingroom = $("#num_livingroom").val();
        single_house.type = 1;
        localStorage.setItem('single_house', JSON.stringify(single_house));

        var method = "POST";
        if (whole_house.id && whole_house.id != 0) method = "PUT";
        $.ajax({
            type: method,
          beforeSend: function (request) {
              request.setRequestHeader("Authorization", "Bearer " + user.access_token);
          },
          url: config.api_url + "api/apartment",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify(single_house),
          success: function(data) {
              if (data.message == "OK") {
                  // TODO 上传图片
                  show_common_error("发布成功");
                  localStorage.removeItem('single_house');
                  redirect_to("detail.html?id=" + data.apartment.id);
              } else  show_common_error(data.message); 
          },
          error: server_err_fn
        });  
    });     
});



$('#post-whole-page').on('pageinit', function() {
    // get community list   e
    var element = "community_id";
    show_loading();
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/community/list",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     if (data.message == "OK" && data.status_code == 200) {
                         console.log(data);
                         Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                             $('#community_id').selectmenu('refresh', true);
                             $("#community_id").val(whole_house.community_id);
                             $('#community_id').selectmenu('refresh', true);
                             hide_loading();
                         }).render(data.communities);
                     } else {
                         hide_loading();
                         redirect_to("signin.html");
                     }
                 }
    });

    // set value if have 
    if (whole_house != null) {
        $("#title").val(whole_house.title);
        $("#subtitle").val(whole_house.subtitle);
        $("#address").val(whole_house.address);
        $("#num_bedroom").val(whole_house.num_bedroom);
        $("#num_livingroom").val(whole_house.num_livingroom);
        $("#price").val(whole_house.rooms[0].price);
        $("#area").val(whole_house.rooms[0].area);
        $("#type").val(whole_house.type);
        if (whole_house.rooms[0].date_entrance != null) {
            $("#set-entrance-date-link").html("已经设置");
        }
        if (whole_house.reserve_choices != null) {
            $("#set-date-link").html("已经设置");
        }
        if (whole_house.tags != null) {
            $("#set-keywords-link").html("已经设置");
        }
        if (whole_house.devices != null) {
            $("#set-devices-link").html("已经设置");
        }
    }


    // post a new house
    $("#submit-post-whole").click(function() {
        whole_house.title = $("#title").val();
        whole_house.subtitle = $("#subtitle").val();
        whole_house.address = $("#address").val();
        whole_house.community_id = $("#community_id").val();
        whole_house.num_bedroom = $("#num_bedroom").val();
        whole_house.num_livingroom = $("#num_livingroom").val();
        whole_house.type = 0;
        whole_house.rooms[0].price =  $("#price").val();
        whole_house.rooms[0].area =  $("#area").val();
        localStorage.setItem('whole_house', JSON.stringify(whole_house));

        var method = "POST";
        if (whole_house.id && whole_house.id != 0) method = "PUT";
        $.ajax({
            type: method,
          beforeSend: function (request) {
              request.setRequestHeader("Authorization", "Bearer " + user.access_token);
          },
          url: config.api_url + "api/apartment",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify(whole_house),
          success: function(data) {
              if (data.message == "OK") {
                  // TODO 上传图片
                  show_common_error("发布成功");
                  localStorage.removeItem('whole_house');
                  redirect_to("detail.html?id=" + data.apartment.id);
              } else  show_common_error(data.message); 
          },
          error: server_err_fn
        });  
    });
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

function user_loaded() {
    return user.username != null;
}

function load_user(element) {
    $("#" + element).hide();
    show_loading();
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/account",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     if (data.message = "OK") {
                         $.extend(user, data.user);
                         user.avatar = config.api_url + user.avatar;
                         localStorage.setItem('user', JSON.stringify(user));
                         Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                             $("#" + element).show();
                             hide_loading();
                         }).render(user);
                     } else {
                         redirect_to("signin.html");
                     }
                 },
        error: function(data) { show_common_error("用户名密码错误"); }
    });   
}

function save_user()
{  
    $.ajax({
        type: 'GET',
    url: config.api_url + "api/account",
    beforeSend: function (request) {
        request.setRequestHeader("Authorization", "Bearer " + user.access_token);
    },
    success: function(data) {
                 if (data.message = "OK") {
                     $.extend(user, data.user);
                     user.avatar = config.api_url + user.avatar;
                     localStorage.setItem('user', JSON.stringify(user));
                 } else {
                     redirect_to("signin.html");
                 }
             },
    error: server_err_fn
    });  
}


function user_post(pconfig) {
    $(pconfig.button).click(function(){
        $.ajax({
            type: 'POST',
        url: config.api_url + pconfig.api,
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        data: $(pconfig.form).serialize(),
        success: function(data) {
            if (data.message == 'OK') {
                show_common_error(pconfig.message);
            } else {
                show_common_error(data.message);
            }
        },
        error: server_err_fn
        });   
    });    
}

function show_common_error(error) {
    $("#error").html(error);
    $("#error").show();
}

function hide_common_error(error) {
    $("#error").html('');
    $("#error").hide();
}

function set_captcha_elements() {
    var time = 60;
    var timer_id = setInterval(settime, 1000);
    $("#vcode-timer").html(time);
    clearInterval(timer_id);
    $("#vcode-timer").html("");
    $("#info").html("获取验证码");

    var enableButton = function(){ $("#go").button('enable'); }
    var settime = function(time){
        time = $("#vcode-timer").html();
        if(time == "") time = 60;
        time -= 1;
        $("#vcode-timer").html(time);
        $("#info").html("秒后重新获取");
        if(time > 0) {
        } else {
            time = 60;
            $("#vcode-timer").html(time);
            $("#go").button('enable');
            $("#go").attr('disabled',false);
            clearInterval(timer_id);
            $("#vcode-timer").html("");
            $("#info").html("获取验证码");
        }
    }

    $("#go").click(function(event){
        event.preventDefault();
        var $phone = $("#phone").val();
        if($phone == undefined || $phone.length != 11) {
            alert("手机号码应该为11位数字。" + $phone);
            return;
        }
        $("#go").attr('disabled',true);
        $("#submit-signup").attr('disabled', false);

        var minutes = 0.1;
        $("#go").attr("value", minutes);
        timer_id = setInterval(settime, 1000);

        // TODO send vcode request
    });          
}

function redirect_to(page) {
    $( ":mobile-pagecontainer" ).pagecontainer( "change", page, { role: "page" } );
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


function get_with_auth(api_name, succ_func, error_func) {
    ajax_with_auth('GET', api_name, succ_func, error_func);
}
function post_with_auth(api_name, succ_func, error_func) {
    ajax_with_auth('POST', api_name, succ_func, error_func);
}

function ajax_with_auth(type, api_name, succ_func, error_func) {
    if (error_func == null) error_func = server_err_fn;
    $.ajax({ type: type,
        url: config.api_url + api_name,
      beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Bearer " + user.access_token);
      },
      success: succ_func,
      error: error_func
    });   
} 
