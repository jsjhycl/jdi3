function Service() {
    this.baseUrl = "/dbApi/dbOperate";
    this.routerTable = "router"
    this.createTableURL = "/dataApi/api/dataportal/createtable"
    this.queryExteraDbName = "/dataApi/api/dataportal/listexternaldatabases" //获取外库的库名
    this.queryExteraTableName = "/dataApi/api/dataportal/listexternaltables" //获取外库的表名
    this.queryExteraColums = "/dataApi//api/dataportal/listexternalcolumns" //获取外库的字段

    this.queryDb = "/dataApi/api/dataportal/query" //查询所有的数据库所有表的数据
    this.publishURl = "/home/dirCopy"
    //获取远程数据库配置
    this.getRemoterTableURl = "/funApi/getDbData"
    this.queryDbConfig = {
        dbName: "jdi",
        id: "数据库名",
        conditions: [],
        fields: ["dbname"],
    }
    this.queryTableConfig = {
        dbName: "jdi",
        id: "数据库目录",
        conditions: [],
        fields: []
    }
    this.errmsg = {
        "already exists": "已存在",
        "Table": "表格"
    }
    this.qrUrl = '/secureApi/canSave'
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
    // pageList: async function(table, condition, fields, page, size) {
    //     var that = this;
    //     try {
    //         var all = await that.queryCount(table, condition);
    //             querys = await that.query(table, condition, fields, page, size);
    //         querys.count = all.length;
    //         return querys;
    //     } catch (err) {
    //         throw ('pageList err: ', err)
    //     }
    // },
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

    getRouter: function (callBack) {
        return this.query(this.routerTable, [], [], null, null, callBack);
    },

    removeRouters: function (callBack) {
        let config = {
            command: "remove",
            table: this.routerTable,
            condition: [],
        }
        return this.base(config, callBack);
    },

    addRouter: function (save, callBack) {
        if (!save || !Array.isArray(save)) return;
        return this.insert(this.routerTable, save, callBack)
    },
    //创建表
    createTable: function (data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.createTableURL,
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: rst => {
                    var failedMsg = "操作失败！\n消息：";
                    if (DataType.isObject(rst)) {
                        var data = rst.errmsg;
                        if (rst.errno === 0) {
                            resolve(rst);
                        } else {
                            var flag = false;
                            Object.keys(that.errmsg).forEach((item) => {
                                flag = new RegExp(item).test(data)
                                if (flag) {
                                    data = data.replace(new RegExp(item), that.errmsg[item])
                                }
                            })
                            alert(failedMsg + JSON.stringify(data, null, 2));
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
    //获取外库的库名
    getExtraDbName: function (data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.queryExteraDbName,
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: rst => {
                    var failedMsg = "操作失败!\n消息";
                    if(DataType.isObject(rst)){
                        var data = rst.errmsg;
                        if(rst.errno === 0){
                            resolve(rst)
                        }else{
                            alert(failedMsg + JSON.stringify(data, null, 2));
                        }
                    }else{
                        alert(failedMsg + "服务器数据获取异常！")
                        reject("服务器数据获取异常！");
                    }
                },
                error: err => reject(err)
            })
        })
    },
    //获取外库的表名
    getExtraTableName: function (data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.queryExteraTableName,
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: rst => {
                    var failedMsg = "操作失败!\n消息";
                    if (DataType.isObject(rst)) {
                        var data = rst.errmsg;
                        if (rst.errno === 0) {
                            resolve(rst)
                        } else {
                            alert(failedMsg + JSON.stringify(data, null, 2));
                        }
                    } else {
                        alert(failedMsg + "服务器数据获取异常！")
                        reject("服务器数据获取异常！");
                    }
                },
                error: err => {
                    reject(err)
                }
            })
        })
    },
    //获取外库的列名
    getExtraCloums: function (data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.queryExteraColums,
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: rst => {
                    var failedMsg = "操作失败!\n消息";
                    if (DataType.isObject(rst)) {
                        var data = rst.errmsg;
                        if (rst.errno === 0) {
                            resolve(rst)
                        } else {
                            alert(failedMsg + JSON.stringify(data, null, 2));
                        }
                    } else {
                        alert(failedMsg + "服务器数据获取异常！")
                        reject("服务器数据获取异常！");
                    }
                },
                error: err => {
                    reject(err)
                }
            })
        })
    },

    getRemoteTable: function (data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.getRemoterTableURl,
                type: 'post',
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: 'json',
                success: rst => {
                    return resolve(rst)
                },
                error: err => reject(err)
            })
        })
    },

    publish: function (customId) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.publishURl + "?customId=" + customId,
                type: "GET",
                cache: false,
                dataType: "json",
                success: function (result) {
                    return resolve(result)
                },
                error: function (error) {
                    return reject(error)
                }
            })
        })

    },

    //查询数据库中的元素
    queryPromise: function (type, conditions, fields) {
        if (!type) return reject(Common.errMsg("无效的指令参数！"));
        var that = this,
            data = {};
        if (type == "db") {
            data = that.queryDbConfig;
            conditions && (data['conditions'] = conditions)
            fields && (data['fields'] = fields)
        }
        if (type == 'table') {
            data = that.queryTableConfig;
            conditions && (data['conditions'] = conditions)
            fields && (data['fields'] = fields)
        }

        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.queryDb,
                type: "POST",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data),
                dataType: "json",
                success: function (result, status, xhr) {
                    return result.errno === 0 ? resolve(result.data) : reject(console.log(result.errmsg));
                },
                error: function (error) {
                    return reject(console.log(result.errmsg))
                }
            });
        })
    },

    // cansave
    canSave: function (uid) {
        var that = this;
        return new Promise(function (resolve, reject) {
            $.cajax({
                url: that.qrUrl,
                type: "GET",
                data: {
                    uid: uid
                },
                noloading: true,
                contentType: "application/json",
                dataType: "json",
                success: rst => {
                    if (rst.status === 0) {
                        resolve(!!rst.result)
                    } else {
                        reject(rst.result)
                    }
                },
                error: err => reject(err)
            })
        })
    },
}