function FileService() {
    this.baseUrl = "/ioApi/fsop"
}
FileService.prototype = {
    base: function (data, callBack) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.baseUrl,
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: rst => {
                    var faileMsg = "操作失败! \n消息:";
                    if (DataType.isObject(rst)) {
                        var data = rst.result;
                        if (rst.status === 0) {
                            try {
                                var dataJSON = JSON.parse(rst.result);
                                callBack && callBack(dataJSON);
                                resolve(dataJSON);
                            } catch (err) {
                                callBack && callBack(rst.result);
                                resolve(rst.result);
                            }
                        } else {
                            alert(faileMsg + JSON.stringify(data, null, 2));
                            reject(data)
                        }
                    } else {
                        alert(faileMsg + "服务器异常！")
                        reject("服务器异常！")
                    }
                },
                error: err => reject(err)
            })
        })
    },
    //读文件
    readFile: function (router, format, callBack) {
        if (!router) return alert("没有文件路径");
        let config = ["readFile", router, format];
        return this.base(config, callBack)
    },
    //写文件
    writeFile: function (router, data) {
        if (!router) return alert("没有写入路径");
        let config = ["writeFile", router, data]
        return this.base(config)
    },
    //检查路径是否存在
    exists: function (router) {
        if (!router) return alert("路径不存在");
        let config = ["exists", router]
        return this.base(config)
    },
    //移除文件
    unlink: function (router) {
        if (!router) return alert("路径不存在");
        let config = ["unlink", router];
        return this.base(config)
    },
    //更改文件名
    rename: function (router, newRoter) {
        if (!router && !newRoter) return ("路径不正确");
        let config = ["rename", router, newRoter]
    },
    //移除文件夹
    rmdir: function (router) {
        if (!router) return alert("路径不存在");
        let config = ["rmdir", router];
        return this.base(config)
    },
    //新增文件夹
    mkdir: function (router) {
        if (!router) return alert("路径不存在");
        let config = ["mkdir", router];
        return this.base(config)
    },
    //读取文件夹
    readdir: function (router) {
        if (!router) return alert("路径不存在");
        let config = ["readdir", router];
        return this.base(config)
    },
    //查看文件状态判断路径是否存在
    stat: function (router) {
        if (!router) return alert("路径不存在");
        let config = ["stat", router];
        return this.base(config)
    }
}