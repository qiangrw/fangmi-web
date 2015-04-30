function reservePageInit() {    
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
            $(".btn-active-reserve").unbind().click(function(){
                var reserve_id = $(this).attr('rid');
                console.log("active reserve with rid=" + reserve_id);
                $.ajax({
                    type: 'PUT',
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", "Bearer " + user.access_token);
                    },
                    url: config.api_url + "api/reserve?id=" + reserve_id + "&cancelled=False",
                    success: function(data) {
                        if (data.status_code == 200 && data.message == "OK") {
                            alert_message("重新预约成功");
                        } else {
                            alert_message(data.message);
                        }
                    }
                });    
            });
            $(".btn-cancel-reserve").unbind().click(function(){
                var reserve_id = $(this).attr('rid');
                $.ajax({
                    type: 'PUT',
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", "Bearer " + user.access_token);
                    },
                    url: config.api_url + "api/reserve?id=" + reserve_id + "&cancelled=True",
                    success: function(data) {
                        if (data.status_code == 200 && data.message == "OK") { 
                            alert_message("预约成功取消");
                        } else {
                            alert_message(data.message);
                        }
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
}



$('#reservelist-page').on('pagebeforeshow', function() {
    reservePageInit();    
});
