function Service() {
    this.queryUrl = "/new/table/";
}
Service.prototype = {
    request: function (url, data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.queryUrl + url,
                type: "POST",
                data: data,
                dataType: "json",
                success: function (result) {
                    return resolve(result)
                },
                error: function (result) {
                    return reject(result)
                }
            })
        })
    }

}