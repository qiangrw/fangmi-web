$('#signin-page').on('pageinit', function() {
    var config = JSON.parse(localStorage.getItem('config'));
    $("#submit-signin").click(function(){
        $.ajax(
            dataType: 'JSONP',
            type: 'POST',
            jsonCallback: 'callback', 
            url: config.api_url + "oauth/token",
            data: $("#signin-form").serialize(),
            success: function(data) {
                alert(data);
            });
    });
});

