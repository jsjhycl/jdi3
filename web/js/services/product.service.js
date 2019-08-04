function ProductService() {
    this.detailUrl = "/product/detail";
    this.listUrl = "/newapi/getpro";
    this.receiveUrl = "/product/receive";
    this.removeUrl = "/newapi/removepro";
    this.submitUrl = "/product/submit";
    this.submitDBUrl = "/product/submitdb";
    this.publishUrl = "/product/publish";
}

ProductService.prototype = {
    detail: function (id, callback) {//获取产品详情
        if (!id) return;
        var that = this;
        $.cajax({
            url: that.detailUrl + "/" + id,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    list: function (type, state, callback) {//获取产品列表
        if (!type || isNaN(state)) return;
        var that = this;
        $.cajax({
            url: that.listUrl + "/" + type + "/" + state,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    receive: function (id, callback) {//接收表单
        if (!id) return;
        var that = this;
        $.cajax({
            url: that.receiveUrl + "/" + id,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    remove: function (id, callback) {//移除资源
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
    removePromise: function (id) {//promise版删除
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
    submit: function (id, callback) {//提交
        if (!id) return;
        var that = this;
        $.cajax({
            url: that.submitUrl + "/" + id,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    submitDB: function (id, callback) {//数据库提交
        if (!id) return;
        var that = this;
        $.cajax({
            url: that.submitDBUrl + "/" + id,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    publish: function (id, callback) {//发布
        if (!id) return;
        var that = this;
        $.cajax({
            url: that.publishUrl + "/" + id,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    }
};