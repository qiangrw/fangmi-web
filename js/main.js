// Global Page Ready Functions
var config = { api_url: "http://123.57.207.201:8080/"};
localStorage.setItem('config', JSON.stringify(config));
var user   = JSON.parse(localStorage.getItem('user'));
var server_err_fn = function(data) { 
    show_common_error("服务器错误，请稍后再试。"); 
    console.log(data);
};
var whole_house = JSON.parse(localStorage.getItem('whole_house'));
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

// global functions                                                                    
var show_loading = function(event) { 
    $('body').addClass('ui-loading');
}
var hide_loading = function(event) { 
    $('body').removeClass('ui-loading');
}


// Global Page before show functions
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
    if (community_id) {
        base_url += "&community_id=" + community_id;
        cur_url += "&community_id=" + community_id;
    }
    var element = "houselist";
    $("#" + element).hide();
    show_loading();
    $.ajax({
        type: 'GET',
        url: base_url,
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

$('#reservelist-page').on('pagebeforeshow', function() {
    var element = "reservelist";
    $("#" + element).hide();
    show_loading();
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/reserve/list?username=" + user.username,
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     console.log(data);
                     if (data.message = "OK") {
                         if (data.reserves.length == 0) {
                             redirect_to("reservelist_empty.html");
                         } else {
                             Tempo.prepare(element)
        .when(TempoEvent.Types.RENDER_COMPLETE, function() {
            hide_loading();
            $("#" + element).show();
            $(".btn-cancel-reserve").click(function(){
                var reserve_id = $(this).attr('rid');
                $.ajax({
                    type: 'PUT',
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", "Bearer " + user.access_token);
                    },
                    url: config.api_url + "api/reserve?id=" + reserve_id + "cancelled=True",
                    success: function(data) {
                        if (data.message == "OK") alert("取消成功");
                        else  show_common_error(data.message); 
                    }
                });    
            }); 
            hide_loading();
        })
    .render(data.reserves);
                         }
                     } 
                 },
        error: server_err_fn
    });  


});


$('#house-detail-page').on('pagebeforeshow', function() {
    var element = "house-detail";
    $("#" + element).hide();
    show_loading();
    var id = getParameter("id");
    var landlord = null;
    if (id == null) return;
    
    var bind_nofav = function() {
        $(".ui-icon-nofav").click(function() {
            // fav the house
            var btn = $(this);
            $.ajax({
                type: 'POST',
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + user.access_token);
                },
                url: config.api_url + "api/apartment/fav?action=append&id=" + id,
                success: function(data) {
                    if (data.message == "OK") {
                        btn.removeClass("ui-icon-nofav").addClass("ui-icon-fav"); 
                        bind_fav();
                    }
                }
            });     
        });
    };
    var bind_fav = function() {
        $(".ui-icon-fav").click(function() {
            var btn = $(this);
            $.ajax({
                type: 'POST',
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + user.access_token);
                },
                url: config.api_url + "api/apartment/fav?action=remove&id=" + id,
                success: function(data) {
                    if (data.message == "OK") {
                        btn.removeClass("ui-icon-fav").addClass("ui-icon-nofav"); 
                        bind_nofav();
                    }
                }
            }); 


        });
    }; 

    $.ajax({
        type: 'GET',
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        url: config.api_url + "api/apartment?id=" + id, 
        success: function(data) {
            if (data.message = "OK") {
                console.log(data);
                Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() 
                    { 
                        $("#" + element).show();
                        bind_fav();
                        bind_nofav();
                        hide_loading(); 
                    }).render(data.apartment);
                landlord = data.apartment.user;
                $.ajax( { 
                    type: 'GET',
                    url: config.api_url + "api/account",
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", "Bearer " + user.access_token);
                    },
                    success: function(data) {
                                 if (data.message = "OK") {
                                     console.log(data.user);
                                     if (data.user.username == landlord.username) {
                                         $("#edit-house-link").show();
                                         $("#reserve-house-link").show();
                                     }
                                     user.avatar = config.api_url + user.avatar;
                                     localStorage.setItem('user', JSON.stringify(user));
                                 } 
                             }
                }); 

            } else {
                redirect_to("signin.html");
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

// user.html
$('#user-page').on('pagebeforeshow', function() {
    if (user == null) {
        redirect_to("signin.html");
        return;
    }
    element = "user-info";
    $("#" + element).hide();
    show_loading();
    if (user_loaded()) {
        Tempo.prepare("user-info").render(user);
        Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
            $("#" + element).show();
            hide_loading();
        }).render(user);
    } else {
        load_user("user-info");
    }
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
                     if (data.message = "OK") {
                         console.log(data);
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
    $("#to_username").val(to_username);
    $("#header-title").val(to_username);

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
                    alert("发送失败");
                }
            }
        });                 
    });
});  

// signin.html
$('#signin-page').on('pageinit', function() {
    var user = {};
    $("#submit-signin").click(function(){
        $.ajax({
            type: 'POST',
            url: config.api_url + "oauth/token",
            data: $("#signin-form").serialize(),
            success: function(data) {
                if (data.access_token != null) {
                    hide_common_error();
                    user.access_token = data.access_token;
                    localStorage.setItem('user', JSON.stringify(user));
                    // TODO save user or bugs may come
                    // save_user();
                    redirect_to("index.html");
                } else {
                    show_common_error(data.message);
                }
            },
            error: server_err_fn
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


// change_password.html
$('#change-password-page').on('pageinit', function() {
    user_post({
        button: "#submit-change-password",
        form:   "#change-password-form",
        api:    "api/account/password/change",
        message: "修改成功，您可以用新密码登录了." 
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
        redirect_to("signin.html");
    });
});   

// set_date.html
$('#set-date-page').on('pageinit', function() {
    $(".flipbox-input").datebox({
        mode: "flipbox",
        afterToday: true
    });
    $("#start_time").datebox({
        mode: "timeflipbox"
    });
    $("#end_time").datebox({
        mode: "timeflipbox"
    });

    if (whole_house.reserve_choices != null) {
        var choices = whole_house.reserve_choices;
        for (i=0; i<choices.length; ++i) {
            var choice = choices[i];
            $("#my-date-list").append(
                '<li><a href="#">' + choice.date + 
                ' '+ from_time(choice.time_start) + ' - ' + from_time(choice.time_end) + '</a></li>'
                ).listview('refresh');
        }
    }

    $("#submit-add-date").click(function() {
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
    $("#set-date-back").click(function() {
        $("#my-date-list li>a").each(function(index) {
            // assign date
            var eles =  $(this).html().split(' ');
            reserve_choices.push({
                date: eles[0],
                time_start: to_time(eles[1], eles[2]),
                time_end:   to_time(eles[4], eles[5])
            });
        });
        whole_house["reserve_choices"] = reserve_choices;
        localStorage.setItem('whole_house', JSON.stringify(whole_house));
        redirect_to("post_whole.html");
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
    $("#set-keywords").click(function() {
        var tags = $("#tags").val().split(',');
        var tag_array = [];
        for (i=0; i<tags.length; ++i) {
            tag_array.push( { name: tags[i] });
        }
        whole_house["tags"] = tag_array;
        localStorage.setItem('whole_house', JSON.stringify(whole_house));
        redirect_to("post_whole.html");
    });  
    $('.input-tags').tagsInput();
});

// set_device.html
$('#set-device-page').on('pageinit', function() {
    $("#set-device").click(function() {
        var devices = [];
        $('input[data-cacheval="false"]').each(function(index) {
            devices.push({
                name: $(this).attr("name"),
                count: 1
            });
        });
        whole_house["devices"] = devices;
        localStorage.setItem('whole_house', JSON.stringify(whole_house));
        // TODO read from url
        redirect_to("post_whole.html");
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
                     Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                         hide_loading();
                         $('#community_id').selectmenu('refresh', true);
                         $("#community_id").val(whole_house.community_id);
                         $('#community_id').selectmenu('refresh', true);

                     }).render(data.communities);
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

        // TODO add valiation

        $.ajax({
            type: 'POST',
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
                    // delete storage
                    // localStorage.removeItem('whole_house');
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

String.prototype.endWith = function (subStr) {
    if (subStr.length > this.length) {
        return false;
    }
    else {
        return (this.lastIndexOf(subStr) == (this.length - subStr.length)) ? true : false;
    }
}

function refreshPage()
{
    $.mobile.changePage( window.location.href, {
        allowSamePageTransition : true,
    transition              : 'none',
    showLoadMsg             : false,
    reloadPage              : true
    });
}
