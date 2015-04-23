$('#setting-page').on('pagebeforeshow', function() {
    var user   = JSON.parse(localStorage.getItem('user'));
    if (user == null) {
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "signin.html", { role: "page" } );
        return;
    }
    $("#signout-btn").click(function(){
        localStorage.removeItem('user');
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "signin.html", { role: "page" } );
    });
});
