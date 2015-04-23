$('#user-page').on('pagebeforeshow', function() {
    var config = JSON.parse(localStorage.getItem('config'));
    var user  = JSON.parse(localStorage.getItem('user'));
    if (user == null) {
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "signin.html", { role: "page" } );
        return;
    }
    
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/account",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
            if (data.message = "OK") {
                $.extend(user, data);
                user.avatar = config.api_url + user.avatar;
                localStorage.setItem('user', JSON.stringify(user));
                Tempo.prepare("user-info").render(user);
            } else {
                alert("验证失败，请重新登录");
                $( ":mobile-pagecontainer" ).pagecontainer( "change", "signin.html", { role: "page" } );
            }
        },
        error: function(data) {
                   $("#error").html("* 用户名密码错误");
                   $("#error").show();
               }
    });           

});
