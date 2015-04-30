var signin_succ = function(data) {
    hide_loading();
    if (data.message = "OK" && data.status_code == 200) {
        $.extend(user, data.user);
        user.avatar = config.api_url + user.avatar;
        localStorage.setItem('user', JSON.stringify(user));
        redirect_to("index.html");
    } else {
        redirect_to("signin.html");
    }   
}
var signin_fail = function(data) { show_common_error("用户名密码错误"); }

// signin.html
$('#signin-page').on('pageinit', function() {
    $("#submit-signin").click(function(){
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
                    show_common_error(data.message);
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
    get_with_auth("api/account", function(data) {
        if (data.message = "OK" && data.status_code == 200) {
            $.extend(user, data.user);
            user.avatar = config.api_url + user.avatar;
            localStorage.setItem('user', JSON.stringify(user));
            element = "user-info";
            $("#" + element).hide();
            show_loading();
            Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                $("#" + element).show();
                hide_loading();
            }).render(user);  
        } else {
            redirect_to("signin.html");
        }   

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

