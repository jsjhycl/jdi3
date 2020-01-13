function BuildTableJson() {

}
BuildTableJson.prototype = {
    get: async function () {
        var table = await this.getTable();
        return await this._buildTableJson(table)
    },
    getTable: function () {
        return new Service().queryPromise('table', [], ["*"])
    },
    _buildTableJson: function (table) {
        let tablejson = {}
        if (!Array.isArray(table)) return tablejson;
        var dbName = []
        table.forEach(item => {
            if (dbName.indexOf(item["数据库名"]) == -1) {
                dbName.push(item["数据库名"])

            }
        })
        dbName.forEach(db => {
            tablejson[db] = {
                "newResources": {
                    "desc": "表单",
                    "key": 0,
                    "tableDetail": [{
                        "id": "name",
                        "cname": "资源名称"
                    }, {
                        "id": "customId",
                        "cname": "编号"
                    }, {
                        "id": "basicInfo.category",
                        "cname": "表单分类"
                    }, {
                        "id": "basicInfo.subCategory",
                        "cname": "子分类"
                    }]
                },
                "newProducts": {
                    "desc": "布局",
                    "key": 1,
                    "tableDetail": [{
                        "id": "name",
                        "cname": "资源名称"
                    }, {
                        "id": "customId",
                        "cname": "编号"
                    }, {
                        "id": "basicInfo.category",
                        "cname": "表单分类"
                    }, {
                        "id": "basicInfo.subCategory",
                        "cname": "表单子分类"
                    }, {
                        "id": "basicInfo.feature",
                        "cname": "布局特性"
                    }, {
                        "id": "basicInfo.userGrade",
                        "cname": "布局用户级别"
                    }, {
                        "id": "basicInfo.area",
                        "cname": "布局区域"
                    }, {
                        "id": "basicInfo.autoCreate",
                        "cname": "自动分表"
                    }]
                },
            }
        });
        table.forEach(table => {
            tablejson[table["数据库名"]][table["表名"]] = {
                tableDesc: table["表注解"],
                reserveOne: table["备用1"],
                reserveTwo: table["备用2"],
                reserveThere: table["备用3"],
                reserveFour: table["备用4"],
                reserveFive: table["备用5"],
                uploderTime: table["注册日期"],
                tableDetail: this.getFields(table)
            }
        })
        tablejson["jdi"] = {
            "newResources": {
                "desc": "表单",
                "key": 0,
                "tableDetail": [{
                    "id": "name",
                    "cname": "资源名称"
                }, {
                    "id": "customId",
                    "cname": "编号"
                }, {
                    "id": "basicInfo.category",
                    "cname": "表单分类"
                }, {
                    "id": "basicInfo.subCategory",
                    "cname": "子分类"
                }]
            },
            "newProducts": {
                "desc": "布局",
                "key": 1,
                "tableDetail": [{
                    "id": "name",
                    "cname": "资源名称"
                }, {
                    "id": "customId",
                    "cname": "编号"
                }, {
                    "id": "basicInfo.category",
                    "cname": "表单分类"
                }, {
                    "id": "basicInfo.subCategory",
                    "cname": "表单子分类"
                }, {
                    "id": "basicInfo.feature",
                    "cname": "布局特性"
                }, {
                    "id": "basicInfo.userGrade",
                    "cname": "布局用户级别"
                }, {
                    "id": "basicInfo.area",
                    "cname": "布局区域"
                }, {
                    "id": "basicInfo.autoCreate",
                    "cname": "自动分表"
                }]
            },
            "数据库目录": {
                "tableDesc": "数据库目录",
                "tableDetail": [{
                    "id": "数据库名",
                    "cname": "数据库名"
                }, {
                    "id": "表名",
                    "cname": "表名"
                }, {
                    "id": "表中文名",
                    "cname": "表中文名"
                }]
            }
        }
        return tablejson
    },
    getFields: function (table) {

        var fields = [];
        if (!table["备用1"]) {
            fields.push({
                "id": "ID",
                "cname": "主键ID不可修改"
            })
        }
        for (key in table) {
            if (table[key] && key.includes("A")) {
                try {
                    var value = JSON.parse(table[key]);
                    fields.push({
                        id: key,
                        cname: value['c'],
                        type: value['t'],
                        mapId: value['m'],
                        maxlength: value['l'],
                        isSave: true,
                        fieldSplit: value['f']
                    })
                } catch (error) {

                }
            }
        }
        return fields;
    },
    //获取对应的options
    getOptions: function (dbList, ckey, data) {
        var dbName = data.dbName || "",
            table = data.table || "",
            field = data.field || "",
            options = [];
        if (ckey == "dbName") {
            Object.keys(dbList).forEach(function (item) {
                options.push({
                    name: item,
                    value: item
                })
            })
        }
        if (ckey == "table") {
            if (dbName) {
                var arr = [];
                var table = Object.keys(dbList[dbName]).forEach(function (item) {
                    if (dbList[dbName][item]["key"] == undefined) {
                        arr.push(item)
                    }
                })
                arr.forEach(function (item) {
                    options.push({
                        name: dbList[dbName][item]["tableDesc"],
                        value: item
                    })
                })
            }
        }
        if (ckey == "field") {
            if (dbName && table) {
                var fields = (dbList[dbName][table] && dbList[dbName][table].tableDetail) || [];
                fields.forEach(function (item) {
                    options.push({
                        name: item.cname,
                        value: item.id
                    })
                })
            }
        }
        if (ckey == "fieldSplit") {
            if (dbName && table) {
                var fields = (dbList[dbName][table] && dbList[dbName][table].tableDetail) || [],
                    fieldSplits = '';
                fields.forEach(function (item) {
                    if (data.id == item.id) {
                        fieldSplits = Number(item.fieldSplit)
                    }
                })
                for (i = 1; i <= fieldSplits; i++) {
                    options.push({
                        name: "插入",
                        value: String(i)
                    })
                }
            }
        }

        return options;
    },
    //移除newResources和newProducts的数据
    removeData: function (data) {
        var table = $.extend({}, data),
            dbNames = Object.keys(table);
        dbNames.forEach(dbName => {
            delete table[dbName]["newProducts"]
            delete table[dbName]["newResources"]
        })
        return table;
    }
}