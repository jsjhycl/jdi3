function CommonService() {
    this.uploadUrl = "/api/upimg";
}

CommonService.prototype = {
    getFile: function (url, callback) {
        $.cajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    getFileSync: function (url) {
        var data = null;
        $.cajax({
            url: url,
            async: false,
            type: "GET",
            dataType: "json",
            success: function (result, status, xhr) {
                data = result;
            }
        });
        return data;
    },
    getAjax: function (url) {
        if (!url) return;
        return $.cajax({
            url: url,
            type: "GET",
            dataType: "json"
        });
    },
    upload: function (id, img, formData, callback) {
        if (!id || !img || !formData) return;
        var that = this;
        $.cajax({
            url: that.uploadUrl + "/" + id + "/" + img,
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    }
};