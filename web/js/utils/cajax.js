$.cajax = function (options, isPrompt) {
    options = options || {};
    noloading = !! options.noloading

    delete options.noloading

    isPrompt = !!isPrompt;

    var $loader = $(".loader");
    !noloading && $loader.show();
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

    var ip =  jdi.fileApi.getConfigUrl().serverUrl,
    // var ip = 'http://172.18.152.111'
    oUrl = options.url;
    nUrl = ip + oUrl;
    options.url = nUrl;
    options.headers = {
        "X-Requested-with": "XMLHttpRequest"
    }

    return $.ajax(options);
};