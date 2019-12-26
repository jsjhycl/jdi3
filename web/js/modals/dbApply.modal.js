function DbApplyModal($modal) {
    BaseModal.call(this, $modal, null)
    this.NAME_SPACE = '.dbApply'

    this.$dbApply = this.$modalBody.find("#dbApply")

    this.$dbName = this.$modalBody.find('[data-type="dbName"]') //库名
    this.$table = this.$modalBody.find('[data-type="tableName"]') //表名
    this.$tableDesc = this.$modalBody.find('[data-type="description"]') //表描述
    this.$listTable = this.$modalBody.find('[data-type="databaseList"]') //外库目录表
    this.$databaseName = this.$modalBody.find('[data-type="databaseName"]') //外库的库名
    this.$databaseTableName = this.$modalBody.find('[data-type="databaseTableName"]') //外库的表名

    // this.$IPArea = this.$modalBody.find('[data-type="IPArea"]')
    // this.$mapTableName = this.$modalBody.find('[data-type="mapTableName"]')
    // this.$port = this.$modalBody.find('[data-type="port"]')
    // this.$userName = this.$modalBody.find('[data-type="userName"]')
    // this.$password = this.$modalBody.find('[data-type="passWord"]')
    // this.$dbType = this.$modalBody.find('[data-type="dbType"]')


    this.$queryDb = this.$modalBody.find('.queryDb')
    this.clearData = function () {
        this.$table.val($("#workspace").attr("data-id"))
        this.$tableDesc.val($("#workspace").attr("data-name"))
        this.$listTable.val("")
        this.$databaseName.val("")
        this.$databaseTableName.val("")
        // this.$IPArea.val("")
        // this.$dbName.val("")
        // this.$mapTableName.val("")
        // this.$port.val("")
        // this.$userName.val("")
        // this.$password.val("")
        // this.$dbType.val("")
        // this.$dbApply.empty()
        // 172.18.184.9 KAOQIN CHECKINOUT 1433 sa Cepg2016 sqlserver
    }
    this.renderOptions = function ($target, data, showName) {
        if (!Array.isArray(data)) return;
        var html = '';
        data.forEach(item => {
            html += `<option value="${item.value}">${item.name}${showName?'('+item.value+')':''}</option>`
        })
        $target.empty().append(html)
    }

    // this.dataArr = ["id", "type", "maxLength", "cname", "mapId"]

    //获取外库数据库目录表
    this.getListTable = async function (data) {
        if (!DataType.isObject(data)) return;
        var that = this,
            dbNames = Object.keys(data),
            listTabls = [{
                value: "",
                name: "请选择外库目录表"
            }];
        listens = await new FileService().readFile("./profiles/listen.json")
        outsideDatabase = listens.outsideDatabase;
        dbNames.forEach(dbName => {
            var tables = Object.keys(data[dbName]);
            tables.forEach(table => {
                if (table.indexOf(outsideDatabase.detail[0].value) == outsideDatabase.detail[0].idPosition - 1) { //  应用外库的时候需要用到的
                    var obj = {
                        value: table,
                        name: data[dbName][table].tableDesc
                    }
                    listTabls.push(obj)
                    // console.log(data[dbName][table])
                }
            })
        })
        // console.log(12, listTabls)
        return listTabls;
    }

}
DbApplyModal.prototype = {
    initData: async function () {
        var that = this,
            listTables = await that.getListTable(AllDbName);
        that.renderOptions(that.$listTable, listTables, true)
        that.clearData()
    },
    renderTable: function (data) {
        var that = this;
        var $html = ``
        if (!Array.isArray(data)) return alert("查询数据不对")
        data.forEach(dataTr => {
            $html += `${that.renderTr(dataTr)}`
        })
        return `${$html}`;
    },
    renderTr: function (dataTr) {
        $tr = "<tr>"
        Object.keys(dataTr).forEach(key => {
            $tr += `<td><input class="form-control" ${key =="cname"|| key == "id" ? "" : 'disabled="disabled"' } type="text" data-save="${key}" value="${dataTr[key]}"></td>`
        })
        return `${$tr}</tr>`;

    },
    transformData: function (data) {
        if (!Array.isArray(data)) return "";
        data.forEach((item, index) => {
            item["cname"] = ""
            item["name"] = NumberHelper.idToName(index, 4)
        })
        return data
    },
    saveData: function () {
        var that = this;
        var arr = [];
        that.$dbApply.find("tr").each(function () {
            var obj = {}
            $(this).find("input").each(function () {
                var type = $(this).attr('data-save')
                obj[type] = $(this).val()
            })
            arr.push(obj)
        })

        var database = that.$dbName.val(),
            table = that.$table.val(),
            description = that.$tableDesc.val(),
            metadataModelId = that.$listTable.val(),
            metadataName = that.$databaseName.val(),
            mapTable = that.$databaseTableName.val();
        //     mapTable = that.$mapTableName.val(),
        //     ip = that.$IPArea.val(),
        //     port = that.$port.val(),
        //     userName = that.$userName.val(),
        //     password = that.$password.val(),
        //     dbtype = that.$dbType.val();
        if (!database || !table || !description || !metadataModelId || !metadataName || !mapTable) {
            return alert("请填写完整的数据")
        }

        var postData = {
            database: database,
            table: table,
            description: description,
            onlyRegiste: true,
            dbInfo: {
                metadataModelId: metadataModelId,
                metadataName: metadataName,
                mapTable: mapTable
            },
            columns: arr
        }
        console.log(postData)
        new Service().createTable(postData).then(res => {
            console.log(res)
        })

    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, that.saveData, null); //绑定基础事件
    },
    bindEvents: function () {
        var that = this;

        //切换外库目录表
        that.$listTable.on("change" + that.NAME_SPACE, function () {
            event.preventDefault()
            var listTable = $(this).val();
            if (!listTable) {
                that.$databaseName.find('option').remove()
                that.$databaseTableName.find('option').remove()
                return
            };
            var postData = {
                id: listTable.toLowerCase()
            }
            new Service().getExtraDbName(postData).then(res => {
                var data = res.data,
                    mapData = data.map(function (item) {
                        return {
                            value: item.metadataName,
                            name: item.metadataName,
                        }
                    });
                mapData.unshift({
                    name: "请选择数据库",
                    value: ""
                })
                that.renderOptions(that.$databaseName, mapData, false)
            })
        })
        //切换外库映射库
        that.$databaseName.on("change" + that.NAME_SPACE, function () {
            event.preventDefault()
            var listTable = that.$listTable.val(),
                databaseName = $(this).val();
            if (!databaseName) {
                that.$databaseTableName.find('option').remove()
                return
            };
            var postData = {
                "metadataModelId": listTable,
                "metadataName": databaseName
            }
            new Service().getExtraTableName(postData).then(res => {
                var data = res.data,
                    mapData = [];
                data.forEach(item => {
                    mapData.push({
                        name: item,
                        value: item
                    })
                });
                mapData.unshift({
                    name: "请选择数据表",
                    value: ""
                })
                that.renderOptions(that.$databaseTableName, mapData, false)
            })
        })
        //切换外库映射表
        that.$databaseTableName.on("change" + that.NAME_SPACE, function () {
            event.preventDefault();
            var listTable = that.$listTable.val(),
                databaseName = that.$databaseName.val(),
                databaseTableName = $(this).val();
            if (!databaseTableName) {
                that.$dbApply.empty()
                return
            };
            var postData = {
                "metadataModelId": listTable,
                "metadataName": databaseName,
                "tableName": databaseTableName
            }
            new Service().getExtraCloums(postData).then(res => {
                var data = res.data;
                data = that.transformData(data);
                var mapData = [];
                data.forEach(item => {
                    var obj = {
                        mapName: item.column_name,
                        type: item.type_name,
                        lenght: item.length,
                        cname: item.cname,
                        name: item.name
                    }
                    mapData.push(obj)
                })
                var html = that.renderTable(mapData);
                that.$dbApply.empty().append(html)

            })
        })

        //获取数据库结构
        // that.$queryDb.on("click" + that.NAME_SPACE, function () {
        //     event.preventDefault()
        //     var IPArea = that.$IPArea.val(),
        //         dbName = that.$dbName.val(),
        //         mapTableName = that.$mapTableName.val(),
        //         port = that.$port.val(),
        //         userName = that.$userName.val(),
        //         password = that.$password.val(),
        //         dbType = that.$dbType.val();
        //     // 172.18.184.9 KAOQIN CHECKINOUT 1433 sa Cepg2016 sqlserver
        //     console.log(IPArea,dbName,mapTableName,port,userName,password,dbType)
        //     if (!IPArea || !dbName || !mapTableName || !port || !userName || !password || !dbType) return alert("请填写完整的数据");
        //     let postData = {
        //         type: dbType,
        //         option: {
        //             user: userName,
        //             password: password,
        //             server: IPArea,
        //             database: dbName,
        //             table: mapTableName,
        //             port: Number(port)
        //         }
        //     }
        //     new Service().getRemoteTable(postData).then(res => {
        //         if (res.status === 0) {

        //             var data = that.transformData(res.result),
        //                 html = that.renderTable(data);
        //             that.$dbApply.empty().append(html)
        //         } else {
        //             alert(res.result)
        //         }
        //     })
        // })
    }
}