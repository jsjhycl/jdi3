function CommonService() {
    this.uploadUrl = "/api/upimg";
    this.saveFileUrl = "/api/saveFile";
}

CommonService.prototype = {
    getFile: function (url, callback) {//获取文件
        $.cajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    getFileSync: function (url) {//同步获取文件
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
    getAjax: function (url) {//返回ajax对象
        if (!url) return;
        return $.cajax({
            url: url,
            type: "GET",
            dataType: "json"
        });
    },
    upload: function (id, img, formData, callback) {//上传文件
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
    },
    saveFile: function(fileName, data, callback) {
        var that = this;
        $.cajax({
            url: that.saveFileUrl,
            type: "POST",
            data: {
                fileName: fileName,
                data: data
            },
            dataType: "json",
            success: function (result, status, xhr) {
                callback && callback(result);
            }
        });
    }
};