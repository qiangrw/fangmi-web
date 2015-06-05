// reservelist.html
var tempo_object = null;
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
				if (tempo_object == null) tempo_object = Tempo.prepare(element);
                tempo_object.when(TempoEvent.Types.RENDER_COMPLETE, function() {
                    $(".btn-active-reserve").unbind().click(function(){
                        var reserve_id = $(this).attr('rid');
                        var apartment_id = $(this).attr('aid');
                        console.log("active reserve with rid=" + reserve_id);
                        console.log("active reserve with aid=" + apartment_id);
                        redirect_to("choose_date.html?id=" + apartment_id);
                        /*put_with_auth("api/reserve?id=" + reserve_id + "&cancelled=False", function(data) {
                            if (data.message == "OK") {
                                refreshPage();
                            } else {
                                alert_message(data.message);
                            }
                        });*/
                    });
                    $(".btn-cancel-reserve").unbind().click(function(){
                        var reserve_id = $(this).attr('rid');
                        put_with_auth("api/reserve?id=" + reserve_id + "&cancelled=True", function(data) {
                            if (data.message == "OK") { 
                                refreshPage();
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

// reserve_result.html
$('#reserve-result-page').on('pagebeforeshow', function() {
    var element = "reserve-friends";
	show_loading();
	var apartment_id = getParameter("apartment_id");
    var id = getParameter("id");
	get_with_auth("api/reserve/list?apartment_id=" + apartment_id + "&reserve_choice_id=" + id, function(data) {
        console.log(data.reserves);
        if (data.message == 'OK') {
			$("#person-count").html(data.reserves.length);
			var reserve0 = data.reserves[0].reserve_choice;
			console.log(reserve0);
			$("#my-reserve-time").html(reserve0.date + " " + reserve0.time_start + " - " + reserve0.time_end);
			$("#reserve-mail-to-landloard").attr("href", "message.html?from_username=" + data.reserves[0].apartment.user.username);
            Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                $("#with-" + user.username + " div").hide();
				$("#with-" + user.username).hide();
				$("#" + element).show();
                hide_loading();
            }).render(data.reserves);
        } 
    });
});


// choose_date.html 
$('#choose-date-page').on('pagebeforeshow', function() {
	if (user == null || user.is_student == false) {
		redirect_to("check_student.html");
		return;
	}
	
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
            if (data.message == 'OK') {
                show_common_error("预约成功");
				redirect_to("reserve_result.html?apartment_id=" + id + "&id=" + choice_id);
                // wait_and_redirect_to("reservelist.html");
            }
            else  show_common_error(data.message); 
        });
    });
});

// reserve_detail.html
var reserve_detail_tempo = null;
$("#reserve-detail-page").on('pagebeforeshow', function() {
    var element = "reserve-detail-list";
    var apartment_id = getParameter("id");
	$("#" + element).hide();
    if (apartment_id == null) return;
	$("#empty-reserve-notice").hide();
    show_loading();
    get_with_auth("api/reserve/list?apartment_id=" + apartment_id,
        function(data) {
            if (data.message == 'OK' && data.reserves.length > 0) {
				if (reserve_detail_tempo == null) 
					reserve_detail_tempo = Tempo.prepare(element);
                reserve_detail_tempo.when(TempoEvent.Types.RENDER_COMPLETE, function(){
                    hide_loading();
					$("#" + element).show();
                }).render(data.reserves) 
            } else {
				$("#empty-reserve-notice").show();
                hide_loading();
			}
        }
		);
});
