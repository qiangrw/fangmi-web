$('#house-detail-page').on('pagebeforeshow', function() {
    if (user.username == null) {
        redirect_to("signin.html");
        return;
    }
    var element = "house-detail";
    $("#" + element).hide();
    show_loading();
    var id = getParameter("id");
    if (id == null) return;
    
    var bind_nofav = function() {
        $(".ui-icon-nofav").click(function() {
            // fav the house
            var btn = $(this);
            post_with_auth("api/apartment/fav?action=append&id=" + id, function(data) {
                if (data.message == "OK" && data.status_code == 200) {
                    btn.removeClass("ui-icon-nofav").addClass("ui-icon-fav"); 
                    bind_fav();
                }
            });
        });
    };
    var bind_fav = function() {
        $(".ui-icon-fav").click(function() {
            var btn = $(this);
            post_with_auth("api/apartment/fav?action=remove&id=" + id, function(data) {
                if (data.message == "OK" && data.status_code == 200) {
                    btn.removeClass("ui-icon-fav").addClass("ui-icon-nofav"); 
                    bind_nofav();
                }
            }); 
        });
    }; 
    get_with_auth("api/apartment?id="+id, function(data) {
        if (data.message = "OK" && data.status_code == 200) {
            Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() { 
                console.log(data.apartment);
                if (user.username == data.apartment.user.username) {
                    $("#edit-house-link").show();
                    $("#edit-house-link").unbind().click(function() {
                        house = {
                            id: data.apartment.id,
                            title: data.apartment.title,
                            subtitle: data.apartment.subtitle,
                            type: data.apartment.type,
                            address: data.apartment.address,
                            community_id: data.apartment.community.id,
                            num_bedroom: data.apartment.num_bedroom,
                            num_livingroom: data.apartment.num_livingroom,
                            tags: [], 
                            rooms: [],
                            reserve_choices: [], 
                        };
                        for (i = 0; i < data.apartment.reserve_choices.length; i++) {
                            house.reserve_choices.push({
                                date: data.apartment.reserve_choices[i].date,
                                time_start: data.apartment.reserve_choices[i].time_start,
                                time_end: data.apartment.reserve_choices[i].time_end
                            });
                        }
                        for (i = 0; i < data.apartment.rooms.length; i++) {
                            house.rooms.push({
                                name : data.apartment.rooms[i].name,
                                price : data.apartment.rooms[i].price,
                                area : data.apartment.rooms[i].area,
                                date_entrance : data.apartment.rooms[i].date_entrance
                            });
                        }
                        for (i = 0; i < data.apartment.tags.length; i++) {
                            house.tags.push({
                                name : data.apartment.tags[i].name
                            });
                        }
                        console.log(house);
                        var type = house.type;
                        var house_type = type == 0 ? 'whole_house' : 'single_house';
                        localStorage.setItem(house_type, JSON.stringify(house));
                        if (type == 0) redirect_to("post_whole.html");
                        else redirect_to("post_single.html");
                    });
                    $("#reserve-house-link").hide();
                    $("#mail-to-landlord-link").hide();
                }
                $("#" + element).show();
                bind_fav();
                bind_nofav();
                hide_loading(); 
            }).render(data.apartment);
        } else {
            redirect_to("signin.html");
        } 
    });
});

