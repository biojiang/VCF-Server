jQuery.fn.exists = function( ) { return jQuery(this).length > 0; }


$(document).ready( function( ) {
	var target = "network-data";
	var urlInfo = decodeURI(window.location.href);
	var offset = urlInfo.indexOf("?");
	var strKeyValue = decodeURIComponent(urlInfo.substr(offset));
	// HPO=HP%3A0000286&DS=614080
	//alert("http://192.168.1.5/cgi-bin/Test/results_2.pl" + strKeyValue);
	var json;
	//alert(strKeyValue);
	var reg = /HP:\d{7}/g;
	//var HPO = strKeyValue.split("&");
	var HPO = strKeyValue.match(reg);
	//alert(HPO);
	var content;


	// get CGI returned data using ajax.
	$.ajax({
		url : "http://202.121.178.141/cgi-bin/MDPA/Network.cgi" + strKeyValue,
		type: 'GET',
		dataType: 'text',
		async:false,

		success: function( msg ) {
			$("#" + target).html( msg );
		}
	})
})


