$(function(){
    var config = {
        api_url: "http://webkdd.org/"
    };
    localStorage.setItem('config', JSON.stringify(config));
    var user   = JSON.parse(localStorage.getItem('user'));
    if (user != null) {
        // CHECK USER IDENTITY
        if (user.identity == 1) {
        } else {
        }
    }
	
	
	
	bindAble();
	bindSelected();
});

function bindAble()
{
	$(".reserve-table .able").click(function(){
		$(this).removeClass("able").addClass("selected");
		bindSelected();
	});
}
function bindSelected()
{
	$(".reserve-table .selected").click(function(){
		$(this).removeClass("selected").addClass("able");
		bindAble();
	});
}


function getParameter(name) {
    var url = document.location.href;
    var start = url.indexOf("?")+1;
    if (start==0) {
        return "";
    }
    var value = "";
    var queryString = url.substring(start);
    var paraNames = queryString.split("&");
    for (var i=0; i<paraNames.length; i++) {
        if (name==getParameterName(paraNames[i])) {
            value = getParameterValue(paraNames[i])
        }
    }
    return value;
}

function getParameterName(str) {
    var start = str.indexOf("=");
    if (start==-1) {
        return str;
    }
    return str.substring(0,start);
}

function getParameterValue(str) {
    var start = str.indexOf("=");
    if (start==-1) {
        return "";
    }
    return str.substring(start+1);
}
