function NewService() {
    this.addUrl = '/new/save'; //保存
    this.listUrl = '/new/page'; //获取


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
    }
    //
}