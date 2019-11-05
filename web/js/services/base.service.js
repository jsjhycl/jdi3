function BaseService() {
    this.uploadUrl = "/api/upimg"; //指定路径
}

BaseService.prototype = {
    getFile: function (url, callback) { //获取文件
        $.ajax({
            url: url, //赋值url
            type: "GET", //get请求
            dataType: "json", //指定数据类型
            success: function (result, status, xhr) { //成功回调函数
                callback(result);
            },
            error: function (xhr, status, error) { //失败回调函数
                callback(null);
            }
        });
    },
    getFileSync: function (url) {
        var data = null;
        $.ajax({
            url: url, //赋值url
            async: false, //指定同步请求
            type: "GET", //get请求
            dataType: "json", //数据类型
            success: function (result, status, xhr) { //成功回调函数
                data = result;
            },
            error: function (xhr, status, error) { //失败毁掉函数
                data = null;
            }
        });
        return data;
    },
    getAjax: function (url) {
        return $.ajax({ //返回ajax
            url: url,
            type: "GET",
            dataType: "json"
        });
    },
    page: function (url, data, callback) {
        url = url || "/newapi/pagelist"; //如果没有url使用默认的url
        $.ajax({
            url: url, //路径
            type: "POST", //post请求
            data: data, //数据
            dataType: "json", //数据类型
            success: function (result, status, xhr) { //成功回调函数
                callback(result);
            },
            error: function (xhr, status, error) { //失败回调函数
                callback(null);
            }
        });
    },
    upload: function (id, img, formData, callback) {
        var that = this;
        $.ajax({
            url: that.uploadUrl + "/" + id + "/" + img, //路径
            type: "POST", //post请求
            data: formData, //数据
            cache: false, //设置不缓存
            contentType: false, //编码类型
            processData: false, //不转换wi字符串
            success: function (result, status, xhr) { //成功回调函数
                callback(result);
            },
            error: function (xhr, status, error) { //失败回调函数
                callback(null);
            }
        });
    }
};