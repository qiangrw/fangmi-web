$('#signin-page').on('pageinit', function() {
    var config = JSON.parse(localStorage.getItem('config'));
    $("#submit-signin").click(function(){
        $.post(config.api_url + "/oauth/token",
            $("#signin-form").serialize(),
            function(data) {
                alert(data);
            });
    });
});

