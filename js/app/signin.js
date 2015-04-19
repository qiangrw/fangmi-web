$('#signin-page').on('pageinit', function() {
    var config = JSON.parse(localStorage.getItem('config'));
    $("#submit-signin").click(function(){
        $.ajax({
            type: 'POST',
            url: config.api_url + "oauth/token",
            data: $("#signin-form").serialize(),
            success: function(data) {
                alert(data);
            }});
    });
});

