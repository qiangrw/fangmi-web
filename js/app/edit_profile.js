function set_user_data(user)
{
    $("#nickname").val(user.nickname);
    user.gender = user.gender ? 1 : 0;
    $("#gender").val(user.gender);
    $("#gender option[value='"+user.gender+"']").attr('selected', 'selected');
    $('#gender').selectmenu('refresh', true);
    $("#horoscope").val(user.horoscope);
    $("#horoscope option[value='"+user.horoscope+"']").attr('selected', 'selected');
    $('#horoscope').selectmenu('refresh', true);
    $("#status").val(user.status);
}

$('#edit-profile-page').on('pagebeforeshow', function() {
    var config = JSON.parse(localStorage.getItem('config'));
    var user  = JSON.parse(localStorage.getItem('user'));
    if (user == null) {
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "signin.html", { role: "page" } );
        return;
    }
    if (!user.nickname) {
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
                           set_user_data(user);
                       } else {
                           alert("验证失败，请重新登录");
                           $( ":mobile-pagecontainer" ).pagecontainer( "change", "signin.html", { role: "page" } );
                       }
                   },
          error: function(data) {
                     alert("验证失败，请重新登录");
                     $( ":mobile-pagecontainer" ).pagecontainer( "change", "signin.html", { role: "page" } );
                 }
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
                    $("#error").html("保存成功");
                    $("#error").hide();
                } else {
                    $("#error").html(data.message);
                    $("#error").show();
                }
            },
            error: function(data) {
                       alert("验证失败，请重新登录");
                       $( ":mobile-pagecontainer" ).pagecontainer( "change", "signin.html", { role: "page" } );
            }
        });                 
    });
}); 
