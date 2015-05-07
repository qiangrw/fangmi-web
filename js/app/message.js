// conversation.html
$("#conversation-page").on('pagebeforeshow', function() {
    $("#empty-conversationlist-notice").hide();
    var element = "conversation-list";
    get_with_auth("api/message/conversation", function(data) {
        if (data.message == 'OK') {
            tempo_show(element, data.conversations, function() {
                if (data.conversations == null || data.conversations.length == 0) {
                    $("#empty-conversationlist-notice").show();
                } else {
                    $("#empty-conversationlist-notice").hide();
                }
            });
        } 
    }, server_err_redirect_fn);
});


// message.html
$('#message-page').on('pagebeforeshow', function() {
    var from_username = getParameter("from_username");
    if (from_username == null) return;
    $("#to_username").val(from_username);
    $("#header-title").val(from_username);


    var post_binding_func = function() {
        $("#submit-post-message").unbind().click(function(){
            console.log('clicked');
            $.ajax({
                type: 'POST',
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", "Bearer " + user.access_token);
                },
                url: config.api_url + "api/message",
                data: $("#post-message-form").serialize(),
                success: function(data) {
                    if (data.message == 'OK') {
                        var message =  { mine: true, content: $("#message-content-input").val() };
                        $("#messagedetail-list").append(
                            '<div class="message-div">' + 
                            '<div class="message-img-div"><img src="images/user/user_profile.png" /></div>'+
                            '<div class="message-text-div"><p>' + message.content + '</p></div>'+
                            '</div>'
                            );
                        $("#message-content-input").val('');
                    } else  {
                        alert_message("发送失败");
                    }
                }, 
                error: function(data) { alert_message("网络错误，请稍后再试"); }
            });                 
        });
    };      

    var element = "messagedetail-list";
    $("#" + element).hide();
    show_loading();
    get_with_auth("api/message/list?filter_unread=False&from_username=" + from_username, function(data) {
        if (data.message == 'OK') {
            var messages = data.messages;
            for (i = 0; i < messages.length; ++i) {
                messages[i].mine = messages[i].from_username != from_username;
            }
            tempo_show(element, messages, post_binding_func);
        }
    });

});  

