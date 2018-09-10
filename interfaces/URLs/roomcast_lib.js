// roomcast functions

    function roomcast_style() {  
	  if (parent) {
	        var oHead = document.getElementsByTagName("head")[0];
	        var arrStyleSheets = parent.document.getElementsByTagName("style");
	        for (var i = 0; i < arrStyleSheets.length; i++)
	            oHead.appendChild(arrStyleSheets[i].cloneNode(true));
	    }
};
