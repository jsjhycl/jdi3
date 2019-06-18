function ResourceService() {
    this.addUrl = "/resource/new";
    this.listUrl = "/resource/list";
    this.removeUrl = "/resource/remove";
    this.submitUrl = "/resource/submit";
    this.recallUrl = "/resource/reload";
}

ResourceService.prototype = {
    add: function (data, callback) {//新建资源
        if (!data) return;
        var that = this;
        $.cajax({
            url: that.addUrl,
            type: "GET",
            cache: false,
            data: data,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result, data);
            }
        });
    },
    list: function (type, callback) {//资源列表
        if (!type) return;
        var that = this;
        $.cajax({
            url: that.listUrl + "/" + type,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    remove: function remove(id, callback) {//移除资源
        if (!id) return;
        var that = this;
        $.cajax({
            url: that.removeUrl + "/" + id,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    removePromise: function (id) {//promis版移除资源
        if (!id) return Promise.reject("无效的编号！");
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.removeUrl + "/" + id,
                type: "GET",
                cache: false,
                dataType: "json",
                success: function (result, status, xhr) {
                    return resolve(result);
                },
                error: function (xhr, status, error) {
                    return reject(error);
                }
            });
        });
    },
    submit: function submit(id, name, data, callback) {//提交资源
        if (!id || !name || !data) return;
        var that = this;
        $.cajax({
            url: that.submitUrl + "/" + id + "/" + name,
            type: "POST",
            data: data,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    recall: function recall(id, callback) {//资源重加载
        if (!id) return;
        var that = this;
        $.cajax({
            url: that.recallUrl + "/" + id,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    }
};