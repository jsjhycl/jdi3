function NewService() {
    this.addUrl = '/new/save'; //保存
    this.listUrl = '/new/page'; //获取
    this.removeUrl = '/new/delete/'

}
NewService.prototype = {
    //添加表单或则模板
    add: function (type, data, callback) {
        if (!data) return;
        var that = this;
        $.cajax({
            url: that.addUrl + "/" + type,
            type: "POST",
            data: {
                post: JSON.stringify(data)
            },
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result)
            }
        })
    },
    //获取表单或则模板
    list: function (data, callback) {
        var that = this;
        $.cajax({
            url: that.listUrl,
            type: "POST",
            dataType: "json",
            data: data,
            success: function (result, status, xhr) {
                callback(result);
            }
        })
    },
    //移除
    removePromise: function (id, type) {
        if (!id) return Promise.reject("无效的编号");
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.removeUrl + id + "/" + type,
                type: "GET",
                cache: false,
                dataType: "json",
                success: function (result, status, xhr) {
                    return resolve(result)
                },
                error: function (xhr, status, xhr) {
                    return reject(error)
                }
            })
        })
    }
}