$.cajax = function (options, isPrompt) {
    options = options || {};
    isPrompt = !!isPrompt;

    var $loader = $(".loader");
    $loader.show();

    options.error = function (xhr, status, error) {
        $loader.hide();
        if (isPrompt) {
            alert(status);
        }
    };

    var complete = options.complete;
    options.complete = function (xhr, status) {
        $loader.hide();
        if (complete) {
            complete(xhr, status);
        }
    };

    // var ip = 'http://172.18.152.111:3000',
       var ip =  jdi.fileApi.getConfigUrl(),
        oUrl = options.url;
        nUrl = ip + oUrl;
    options.url = nUrl;
	options.headers = {
		"X-Requested-with": "XMLHttpRequest"
	}

    return $.ajax(options);
};