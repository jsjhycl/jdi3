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
        let config = ["readFile", router, "UTF-8"];
        return this.base(config, callBack)
    },
    //写文件
    writeFile: function (router, data, callBack) {
        if (!router) return alert("没有写入路径");
        let config = ["writeFile", router, data]
        return this.base(config)
    },
    //检查路径是否存在
    exists: function (router, callBack) {
        if (!router) return alert("路径不存在");
        let config = ["exists", router]
        return this.base(config, callBack)
    },
    //移除文件
    unlink: function (router, callBack) {
        if (!router) return alert("路径不存在");
        let config = ["unlink", router];
        return this.base(config, callBack)
    },
    //更改文件名
    rename: function (router, newRoter, callBack) {
        if (!router && !newRoter) return ("路径不正确");
        let config = ["rename", router, newRoter];
        return this.base(config, callBack)
    },
    //移除文件夹
    rmdir: async function (router, callBack) {
        if (!router) return alert("路径不存在");

        let files = await this.readdir(router),
            config = ["rmdir", router];
        if (Array.isArray(files)) {
            for(let i of files) {
                await this.unlink(router + '/' + i);
            }
        }
        return this.base(config, callBack)
    },

    //新增文件夹
    mkdir: function (router, callBack) {
        if (!router) return alert("路径不存在");
        let config = ["mkdir", router];
        return this.base(config, callBack)
    },
    //读取文件夹
    readdir: function (router, callBack) {
        if (!router) return alert("路径不存在");
        let config = ["readdir", router];
        return this.base(config, callBack)
    },
    //查看文件状态判断路径是否存在
    stat: function (router, callBack) {
        if (!router) return alert("路径不存在");
        let config = ["stat", router];
        return this.base(config, callBack)
    }
}