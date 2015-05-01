// detail.html
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
                if (data.message == 'OK') {
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
                if (data.message == 'OK') {
                    btn.removeClass("ui-icon-fav").addClass("ui-icon-nofav"); 
                    bind_nofav();
                }
            }); 
        });
    }; 
    get_with_auth("api/apartment?id="+id, function(data) {
        if (data.message == 'OK') {
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
                            devices: [], 
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
                        for (i = 0; i < data.apartment.devices.length; i++) {
                            house.devices.push({
                                name : data.apartment.devices[i].name,
                                count: 1
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

// houselist.html
$('#houselist-page').on('pagebeforeshow', function() {
    if (user == null || user.username == null) {
        redirect_to("signin.html");
        return;
    }
    var base_url = "api/apartment/list?";
    var community_id = getParameter("community_id");
    var school_id = getParameter("school_id");
    var q = getParameter("q");
    if (community_id)  base_url += "&community_id=" + community_id;
    if (school_id)  base_url += "&school_id=" + school_id; 
    if (q)  base_url += "&q=" + q; 
    var element = "houselist";
    $("#" + element).hide();
    show_loading();
    get_with_auth(base_url, function(data) {
        if (data.message == 'OK') tempo_show(element, data.apartments);
    }, server_err_redirect_fn);     
});

// *-empty.html
$('#favlist-empty-page, #reservelist-empty-page, #rentlist-empty-page').on('pagebeforeshow', function() {
    // TODO using recommend api in the future
    var api_name = "api/apartment/list?";
    var element = "recommend-houselist";
    $("#" + element).hide();
    show_loading();
    get_with_auth(api_name, function(data) {
        if (data.message == 'OK') tempo_show(element, data.apartments);
    }, server_err_redirect_fn);
});

// favlist.html
$('#favlist-page').on('pagebeforeshow', function() {
    var element = "favhouselist";
    $("#" + element).hide();
    show_loading();
    get_with_auth("api/apartment/fav", function(data) {
        if (data.message == 'OK') {
            if (data.apartments.length == 0) {
                redirect_to("favlist_empty.html");
                return;
            }
            tempo_show(element, data.apartments);
        }     
    }, server_err_redirect_fn);
});
    

// myhouselist.html
$('#myhouselist-page').on('pagebeforeshow', function() {
    var element = "myhouselist";
    $("#" + element).hide();
    show_loading();
    get_with_auth("api/apartment/list?username=" + user.username, function(data) {
        if (data.message == 'OK') tempo_show(element, data.apartments);
    }, server_err_redirect_fn);
});

$('#post-whole-page').on('pagebeforehide', function() {
     if (whole_house != null) {
        whole_house.title = $("#title").val();
        whole_house.subtitle = $("#subtitle").val();
        whole_house.address =  $("#address").val();
        whole_house.num_bedroom = $("#num_bedroom").val();
        whole_house.num_livingroom =  $("#num_livingroom").val();
        whole_house.rooms[0].price = $("#price").val();
        whole_house.rooms[0].area =  $("#area").val();
     }
});

// post_whole.html
$('#post-whole-page').on('pagebeforeshow', function() {
    // get community list  
    var element = "community_id";
    show_loading();
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/community/list",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     if (data.message == 'OK') {
                         console.log(data);
                         Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                             $('#community_id').selectmenu('refresh', true);
                             $("#community_id").val(whole_house.community_id);
                             $('#community_id').selectmenu('refresh', true);
                             hide_loading();
                         }).render(data.communities);
                     } else {
                         hide_loading();
                         redirect_to("signin.html");
                     }
                 }
    });

    // set value if have 
    if (whole_house != null) {
        if (whole_house.title) $("#title").val(whole_house.title);
        if (whole_house.subtitle) $("#subtitle").val(whole_house.subtitle);
        if (whole_house.address)  $("#address").val(whole_house.address);
        if (whole_house.num_bedroom) $("#num_bedroom").val(whole_house.num_bedroom);
        if (whole_house.num_livingroom) $("#num_livingroom").val(whole_house.num_livingroom);
        if (whole_house.rooms[0].price) $("#price").val(whole_house.rooms[0].price);
        if (whole_house.rooms[0].area) $("#area").val(whole_house.rooms[0].area);
        $("#type").val(whole_house.type);
        if (whole_house.rooms[0].date_entrance != null)  $("#set-entrance-date-link").html("已经设置"); 
        if (whole_house.reserve_choices != null)  $("#set-date-link").html("已经设置");
        if (whole_house.tags != null)  $("#set-keywords-link").html("已经设置");
        if (whole_house.devices != null)  $("#set-devices-link").html("已经设置");
    }


    // post a new house
    $("#submit-post-whole").click(function() {
        whole_house.title = $("#title").val();
        whole_house.subtitle = $("#subtitle").val();
        whole_house.address = $("#address").val();
        whole_house.community_id = $("#community_id").val();
        whole_house.num_bedroom = $("#num_bedroom").val();
        whole_house.num_livingroom = $("#num_livingroom").val();
        whole_house.type = 0;
        whole_house.rooms[0].price =  $("#price").val();
        whole_house.rooms[0].area =  $("#area").val();
        localStorage.setItem('whole_house', JSON.stringify(whole_house));

        var method = "POST";
        if (whole_house.id && whole_house.id != 0) method = "PUT";
        $.ajax({
            type: method,
          beforeSend: function (request) {
              request.setRequestHeader("Authorization", "Bearer " + user.access_token);
          },
          url: config.api_url + "api/apartment",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify(whole_house),
          success: function(data) {
              console.log(data);
              if (data.message == 'OK') {
                  show_common_error("发布成功,开始上传文件 ...");
                  localStorage.removeItem('whole_house');
                  post_photo(data.apartment.id);
              } else  show_common_error(data.message); 
          },
          error: server_err_fn
        });  
    });
});
    
 
$('#post-single-page').on('pagebeforehide', function() {
     if (single_house != null) {
        single_house.title = $("#title").val();
        single_house.subtitle = $("#subtitle").val();
        single_house.address =  $("#address").val();
        single_house.num_bedroom = $("#num_bedroom").val();
        single_house.num_livingroom =  $("#num_livingroom").val();
     }
});
                                                    

// post_single.html
$('#post-single-page').on('pagebeforeshow', function() {
    // get community list 
    var element = "community_id";
    show_loading();
    $.ajax({
        type: 'GET',
        url: config.api_url + "api/community/list",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + user.access_token);
        },
        success: function(data) {
                     console.log(data);
                     Tempo.prepare(element).when(TempoEvent.Types.RENDER_COMPLETE, function() {
                         hide_loading();
                         $("#community_id").val(single_house.community_id);
                         $('#community_id').selectmenu('refresh', true);
                     }).render(data.communities);
                 }
    });


    // set value if have 
    if (single_house != null) {
        if (single_house.title) $("#title").val(single_house.title);
        if (single_house.subtitle) $("#subtitle").val(single_house.subtitle);
        if (single_house.address) $("#address").val(single_house.address);
        if (single_house.num_bedroom) $("#num_bedroom").val(single_house.num_bedroom);
        if (single_house.num_livingroom) $("#num_livingroom").val(single_house.num_livingroom);
        $("#type").val(single_house.type);
        if (single_house.rooms != null) $(".set-room-link").html("已经设置");
        if (single_house.reserve_choices != null) $(".set-date-link").html("已经设置");
        if (single_house.tags != null)  $(".set-keywords-link").html("已经设置"); 
        if (single_house.devices != null) $(".set-devices-link").html("已经设置");
    }


    // post a new house
    $("#submit-post-single").click(function() {
        single_house.title = $("#title").val();
        single_house.subtitle = $("#subtitle").val();
        single_house.address = $("#address").val();
        single_house.community_id = $("#community_id").val();
        single_house.num_bedroom = $("#num_bedroom").val();
        single_house.num_livingroom = $("#num_livingroom").val();
        single_house.type = 1;
        localStorage.setItem('single_house', JSON.stringify(single_house));

        var method = "POST";
        if (single_house.id && single_house.id != 0) method = "PUT";
        $.ajax({
            type: method,
          beforeSend: function (request) {
              request.setRequestHeader("Authorization", "Bearer " + user.access_token);
          },
          url: config.api_url + "api/apartment",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify(single_house),
          success: function(data) {
              if (data.message == 'OK') {
                  show_common_error("发布成功,开始上传文件 ...");
                  localStorage.removeItem('single_house');
                  post_photo(data.apartment.id);
              } else  show_common_error(data.message); 
          },
          error: server_err_fn
        });  
    });     
});

