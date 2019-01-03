function BaseService() {
    this.uploadUrl = "/api/upimg";
}

BaseService.prototype = {
    getFile: function (url, callback) {
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            },
            error: function (xhr, status, error) {
                callback(null);
            }
        });
    },
    getFileSync: function (url) {
        var data = null;
        $.ajax({
            url: url,
            async: false,
            type: "GET",
            dataType: "json",
            success: function (result, status, xhr) {
                data = result;
            },
            error: function (xhr, status, error) {
                data = null;
            }
        });
        return data;
    },
    getAjax: function (url) {
        return $.ajax({
            url: url,
            type: "GET",
            dataType: "json"
        });
    },
    page: function (url, data, callback) {
        url = url || "/newapi/pagelist";
        $.ajax({
            url: url,
            type: "POST",
            data: data,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            },
            error: function (xhr, status, error) {
                callback(null);
            }
        });
    },
    upload: function (id, img, formData, callback) {
        var that = this;
        $.ajax({
            url: that.uploadUrl + "/" + id + "/" + img,
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (result, status, xhr) {
                callback(result);
            },
            error: function (xhr, status, error) {
                callback(null);
            }
        });
    }
};