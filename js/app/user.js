// captcha related function
var set_captcha_elements = function() {
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

        post_with_data('api/captcha', {mobile: $phone}, function(data) { }, function() {
            show_common_error("验证码发送失败，请稍后再试");
        });

    });          
}




// signin.html 
$('#signin-page').on('pageinit', function() {
    var signin_succ = function(data) {
        hide_loading();
        if (data.message == 'OK') {
            $.extend(user, data.user);
            user.avatar = config.api_url + user.avatar;
            localStorage.setItem('user', JSON.stringify(user));
            redirect_to("index.html");
        } else {
            redirect_to("signin.html");
        }   
    }
    var signin_fail = function(data) { 
        show_common_error("用户名密码错误"); 
        hide_loading();
    }


    $("#submit-signin").unbind().click(function(){
        var mobile = $("#username").val();
        var password = $("#password").val();
        // if (mobile == null || mobile.length != 11) {
        if (mobile == null || mobile.length < 2) {
            show_common_error("手机号码必须为11位.");
            return;
        }
        if (password == null || password.length < 4 || password.length > 20) {
            show_common_error("密码必须是4-20位.");
            return;
        }

        show_loading();
        $.ajax({
            type: 'POST',
            url: config.api_url + "oauth/token",
            data: $("#signin-form").serialize(),
            success: function(data) {
                if (data.access_token != null) {
                    user = {};
                    hide_common_error();
                    console.log(data);
                    user.access_token = data.access_token;
                    get_with_auth("api/account", signin_succ, signin_fail);
                } else {
                    show_common_error("用户验证失败");
                    hide_loading();
                }
            }, 
            error: server_err_fn
        });
    });
});


// user.html
$('#user-page').on('pagebeforeshow', function() {
    if (user == null || user.username == null) {
        redirect_to("signin.html");
        return;
    }
    element = "user-info";
    $("#" + element).hide();
    show_loading();
    get_with_auth("api/account", function(data) {
        if (data.message == 'OK') {
            $.extend(user, data.user);
            user.avatar = config.api_url + user.avatar;
            localStorage.setItem('user', JSON.stringify(user));
            tempo_show(element, user);
        } else {
            hide_loading();
            redirect_to("signin.html");
        }   
    }, server_err_redirect_fn);
});
      
// edit_profile.html
$('#edit-profile-page').on('pagebeforeshow', function() {
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

    if (!user_loaded()) {
        redirect_to("signin.html");
        return;
    }
    set_user_data(user);

    $("#submit_edit_profile").unbind().click(function(){
        var nickname = $("#nickname").val();
        var gender = $("#gender").val();
        var horoscope = $("#horoscope").val();
        var status = $("#status").val();
        if (nickname == null || nickname.length < 1) {
            show_common_error("昵称不能为空");
            return;
        }
        if (gender == null) {
            show_common_error("请选择性别");
            return;
        }
        if (horoscope == null) {
            show_common_error("请选择星座");
            return;
        }
        if (status == null || status.length < 1) {
            show_common_error("个性签名不能为空");
            return;
        }

        post_with_data_auth("api/account", $("#edit-profile-form").serialize(),
            function(data) {
                if (data.message == 'OK') {
                    $.extend(user, data.user);
                    user.avatar = config.api_url + user.avatar;
                    localStorage.setItem('user', JSON.stringify(user));
                    show_common_error("个人信息保存成功");
                } else  show_common_error(data.message); 
            }, server_err_redirect_fn);
    });
}); 

// change_password.html
$('#change-password-page').on('pagebeforeshow', function() {
    user_post({
        button: "#submit-change-password",
        form:   "#change-password-form",
        api:    "api/account/password/change",
        message: "修改成功，您可以用新密码登录了." 
    });   
});


// check_id.html
$('#apply-confirm-page').on('pagebeforeshow', function() {
    user_post({
        button: "#submit-apply-confirm",
        form:   "#apply-confirm-form",
        api:    "api/account/apply/confirmed",
        message: "审核申请发送成功，请耐心等待审核." 
    });
});

// check_student.html
$('#apply-student-page').on('pagebeforeshow', function() {
    $(':file').change(function(){
        var file = this.files[0];
        var name = file.name;
        var size = file.size;
        var type = file.type;
        // TODO add validation
    });

    $("#submit-apply-student").unbind().click(function() {
        var real_name = $("#real_name").val();
        var id_number = $("#id_number").val();
        var school = $("#school").val();
        var major = $("#major").val();
        var student_id = $("#student_id").val();
        if (real_name == "" || id_number == "" || 
            school == "" || major == "" || student_id == "") {
            show_common_error("请将表单填写完整");
            return;
        }


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
            beforeSend: function (request) { request.setRequestHeader("Authorization", "Bearer " + user.access_token); },
            success: function(data) {
                console.log(data);
                if (data.status_code == 200 && data.message == 'OK') show_common_error("审核学生信息申请发送成功，请耐心等待审核."); 
                else  show_common_error(data.message);
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
$('#signup-page').on('pagebeforeshow', function() {
    set_captcha_elements();
    $("#submit-signup").click(function(){
        hide_common_error();
        var mobile = $("#phone").val();
        var captcha = $("#captcha").val();
        var password = $("#password").val();
        var password_confirm = $("#password_confirm").val();
        console.log(mobile);
        if (mobile == null || mobile.length != 11) {
            show_common_error("手机号码必须为11位.");
            return;
        }
        if (captcha == null || captcha < 2) {
            show_common_error("请填写手机验证码.");
            return;
        }
        if (password == null || password.length < 4 || password.length > 20) {
            show_common_error("密码必须是4-20位.");
            return;
        }
        if (password_confirm != password) {
            show_common_error("两次密码输入不一致.");
            return;
        }

        $.ajax({
            type: 'POST',
            url: config.api_url + "api/account/register",
            data: $("#signup-form").serialize(),
            success: function(data) {
                if (data.message == 'OK') {
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
    if (user == null || user.username == null) {
        hide_loading();
        redirect_to("signin.html");
        return;
    }
    element = "user-setting-info";
    $("#" + element).hide();
    show_loading();
    get_with_auth("api/account", function(data) {
        if (data.message == 'OK') {
            $.extend(user, data.user);
            user.avatar = config.api_url + user.avatar;
            localStorage.setItem('user', JSON.stringify(user));

            Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                $("#" + element).show();
                hide_loading();

                // bind events
                $("#signout-btn").unbind().click(function(){
                    console.log("here");
                    if (user != null) localStorage.removeItem('user');
                    if (whole_house != null) localStorage.removeItem('whole_house');
                    if (single_house != null) localStorage.removeItem('single_house');
                    redirect_to("signin.html");
                });      
            }).render(user);
        } else {
            hide_loading();
            redirect_to("signin.html");
        }
    }, server_err_redirect_fn);
});
 
// forget_password.html
$('#forget-password-page').on('pagebeforeshow', function() {
    set_captcha_elements();
    $("#submit-forget").unbind().click(function(){
        var mobile = $("#phone").val();
        var captcha = $("#captcha").val();
        var password = $("#password").val();
        var password_confirm = $("#password_confirm").val();
        console.log(mobile);
        if (mobile == null || mobile.length != 11) {
            show_common_error("手机号码必须为11位.");
            return;
        }
        if (captcha == null || captcha < 2) {
            show_common_error("请填写手机验证码.");
            return;
        }
        if (password == null || password.length < 4 || password.length > 20) {
            show_common_error("密码必须是4-20位.");
            return;
        }
        if (password_confirm != password) {
            show_common_error("两次密码输入不一致.");
            return;
        }   
        
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

$('#search-mate-page').on('pageinit', function() {
    if (user == null || user.username == null) {
        redirect_to("signin.html");
        return;
    }
    var base_url = "api/user/list?";
    var username = getParameter("username");
    if (username)  base_url += "&username=" + username;
    var element = "user-list";
    $("#" + element).hide();
    show_loading();
    ajax_without_auth("GET", base_url, function(data) {
        if (data.message == 'OK') tempo_show(element, data.users);
    }, server_err_redirect_fn);     
});
