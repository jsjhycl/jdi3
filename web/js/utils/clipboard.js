var Clipboard = (function () {
    var data = {};

    return function () {
        return {
            setData: function (key, value) {
                data = {};
                data[key] = value;
                console.log("/Clipboard.setData data:", data);
            },
            getData: function (key) {
                console.log("/Clipboard.setData getData:", data);
                return data[key];
            }
        };
    };
})();