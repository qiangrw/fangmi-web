$('#signin-page').on('pageinit', function() {
    var config = JSON.parse(localStorage.getItem('config'));
    $("#submit-signin").click(function(){
        $.ajax({
            type: 'POST',
            url: config.api_url + "oauth/token",
            data: $("#signin-form").serialize(),
            success: function(data) {
                if (data.access_token) {
                    $("#error").hide();
                    config.access_token = data.access_token;
                    localStorage.setItem('config', JSON.stringify(config));

                    // TODO get user information
                    $( ":mobile-pagecontainer" ).pagecontainer( "change", "index.html", { role: "page" } );
                } else {
                    $("#error").html("* 用户名密码错误");
                    $("#error").show();
                }
            },
            error: function(data) {
                    $("#error").html("* 用户名密码错误");
                    $("#error").show();
                   }
        });
    });
});

