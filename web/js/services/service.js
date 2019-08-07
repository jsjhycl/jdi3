function Service() {
    this.baseUrl = "/dbApi/dbOperate";
    this.createTableURL = "/dataApi/api/dataportal/createtable"
}
Service.prototype = {
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
                    var failedMsg = "操作失败！\n消息：";
                    if (DataType.isObject(rst)) {
                        var data = rst.result;
                        if (rst.status === 0) {
                            callBack && callBack(rst.result);
                            resolve(rst.result);
                        } else {
                            if (data.indexOf('key') > -1 && data.indexOf('insertDocument') > -1) {
                                alert(failedMsg + '当前编号已存在！');
                            } else {
                                alert(failedMsg + JSON.stringify(data, null, 2));
                            }
                            reject(data);
                        }
                    } else {
                        alert(failedMsg + "服务器数据获取异常！")
                        reject("服务器数据获取异常！");
                    };
                },
                error: err => reject(err)
            })
        })
    },
    queryCount: function (table, condition) {
        if (!table) return alert('查询表名不存在！');
        let config = {
            command: "query",
            table: table,
            condition: condition || [],
        };
        return this.base(config);
    },
    query: function (table, condition, fields, page, size, callBack) {
        if (!table) return alert('查询表名不存在！');
        let config = {
            command: "query",
            table: table,
            condition: condition || [],
            fields: fields || [],
        };
        page != undefined && (config['page'] = page);
        size && (config['size'] = size);

        return this.base(config, callBack);
    },
    insert: function (table, save, callBack) {
        if (!table) return alert("插入表名不存在")
        let config = {
            command: "insert",
            table: table,
            save: save || []
        }
        return this.base(config, callBack);
    },

    update: function (table, condition, save, callBack) {
        if (!table || !Array.isArray(condition) || condition.length <= 0) return alert("更新表名或条件不存在！");
        let config = {
            command: "update",
            table: table,
            condition: condition || [],
            save: save || []
        }
        return this.base(config, callBack);
    },

    remove: function (table, condition, callBack) {
        if (!table || !Array.isArray(condition) || condition.length <= 0) return alert("删除表名或条件不存在！");
        let config = {
            command: "remove",
            table: table,
            condition: condition,
        }
        return this.base(config, callBack);
    },
    removeByCustomId: function (table, customId, callBack) {
        return this.remove(table, [{
            col: 'customId',
            value: customId
        }], callBack);
    },
    createTable: function (data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.createTableURL,
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success:rst=>{
                    var failedMsg = "操作失败！\n消息：";
                    if (DataType.isObject(rst)) {
                        var data = rst.errmsg;
                        if (rst.errno === 0) {
                            resolve(rst);
                        } else {
                            alert(failedMsg + JSON.stringify(data, null, 2));
                        }
                    } else {
                        alert(failedMsg + "服务器数据获取异常！")
                        reject("服务器数据获取异常！");
                    };
                },
                error:err=>reject(err)
            })
        })
    }
}