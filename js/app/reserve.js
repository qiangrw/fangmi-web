// reservelist.html
$('#reservelist-page').on('pagebeforeshow', function() {
    var element = "reservelist";
    $("#" + element).hide();
    show_loading();
    get_with_auth("api/reserve/list?username=" + user.username, function(data) {
        console.log(data);
        if (data.message == 'OK') {
            if (data.reserves.length == 0) {
                redirect_to("reservelist_empty.html");
            } else {
                Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                    $(".btn-active-reserve").unbind().click(function(){
                        var reserve_id = $(this).attr('rid');
                        console.log("active reserve with rid=" + reserve_id);
                        put_with_auth("api/reserve?id=" + reserve_id + "&cancelled=False", function(data) {
                            if (data.message == "OK") {
                                alert_message("重新预约成功");
                            } else {
                                alert_message(data.message);
                            }
                        });
                    });
                    $(".btn-cancel-reserve").unbind().click(function(){
                        var reserve_id = $(this).attr('rid');
                        put_with_auth("api/reserve?id=" + reserve_id + "&cancelled=True", function(data) {
                            if (data.message == "OK") { 
                                alert_message("预约成功取消");
                            } else {
                                alert_message(data.message);
                            }
                        });    
                    });  
                    hide_loading();
                    $("#" + element).show();
                }).render(data.reserves);
            }
        } 
    }, server_err_redirect_fn);
});


// choose_date.html 
$('#choose-date-page').on('pagebeforeshow', function() {
    var element = "choose-date-list";
    $("#" + element).hide();
    show_loading();
    var id = getParameter("id");
    if (id == null) return;
    get_with_auth("api/apartment?id=" + id, function(data) {
        console.log(data.apartment.reserve_choices);
        if (data.message == 'OK') {
            Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                $("#choose-date-list fieldset input").checkboxradio();
                $("#" + element).show();
                hide_loading();
            }).render(data.apartment.reserve_choices);
        } 
    });

    $("#submit-add-reserve").click(function() {
        var choice_id = $('#choose-date-list input[data-cacheval="false"]').val();
        if (!choice_id) {
            show_common_error("请至少选择一个时间");
            return;
        }
        post_with_auth("api/reserve?reserve_choice_id=" + choice_id, function(data) {
            if (data.message == 'OK') show_common_error("预约成功");  
            else  show_common_error(data.message); 
        });
    });
});

// reserve_detail.html
$("#reserve-detail-page").on('pagebeforeshow', function() {
    var element = "reserve-detail-list";
    var apartment_id = getParameter("id");
    if (apartment_id == null) return;
    $("#" + element).hide();
    show_loading();
    get_with_auth("api/reserve/list?apartment_id=" + apartment_id,
        function(data) {
            console.log(data);
            if (data.message == 'OK') {
                Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function(){
                    if (data.reserves.length > 0) {
                        $("#" + element).show();
                    }
                    hide_loading();
                }).render(data.reserves) 
            } 
        });
});

