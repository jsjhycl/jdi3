function SetDbDesignerModal($modal) {
    this.$modal = $modal; //赋值
    this.$modalBody = $modal.find(".modal-body");

    this.Name_space = ".setDbDesigner";
    this.$setDbDesigner = this.$modalBody.find("#setDbDesigner");
    this.NAME_SPACE = ".setdbDesigner"
    this.$dbName = this.$modalBody.find('[data-type="dbName"]'); //获取数据库名输入框
    this.$dbNameList = this.$modalBody.find("#setDbDbName")
    this.$tableName = this.$modalBody.find('[data-type="tableName"]'); //获取表格名输入框
    this.$tabeleDesc = this.$modalBody.find('[data-type="tableDesc"]'); //获取表格描述输入框
    this.$reserveOne = this.$modalBody.find('[data-type="reserveOne"]'); //获取备用1输入框
    this.$reserveTwo = this.$modalBody.find('[data-type="reserveTwo"]'); //获取备用2输入框
    this.$reserveThere = this.$modalBody.find('[data-type="reserveThere"]'); //获取备用3输入框
    this.$reserveFour = this.$modalBody.find('[data-type="reserveFour"]'); //获取备用4输入框
    this.$reserveFive = this.$modalBody.find('[data-type="reserveFive"]'); //获取备用5输入框
    this._uploderDb = function (data) {
        return new FileService().writeFile('./profiles/table.json', JSON.stringify(data), function () {

        });
    }
    this._getTableValue = function () {
        var value = $("#name .text-danger").text()
        return value.slice(1, value.length - 1)
        // return $("#name .text-danger").text().replace(/\(|\)/g, "")
    }
    this._setDefaultTableName = function () {
        var value = this._getTableValue()
        $("#setDbDesignerModal").find('[data-type="tableName"]').val(value)
    }
    this._clearData = function () {
        this.$dbName.val("");
        this.$tableName.val("");
        this.$tabeleDesc.val("");
        this.$reserveOne.val("");
        this.$reserveTwo.val("");
        this.$reserveThere.val("");
        this.$reserveFour.val("");
        this.$reserveFive.val("");
    }
    this.setDboptions = async function () {
        var that = this;
        new Service().queryPromise('table', [], ["数据库名"]).then(res => {
            var data = [];
            res.forEach(item => {
                if (data.indexOf(item["数据库名"]) == -1) {
                    data.push(item["数据库名"])

                }
            })

            var $options = ""
            data.forEach(item => {
                $options += `<option value="${item}">${item}</option>`
            })
            that.$dbNameList.empty().append($options)
        })
        this.localData = await new BuildTableJson().get()
        this.localData = new BuildTableJson().removeData(this.localData)
        // new FileService().readFile("./profiles/table.json", 'utf-8').then(res => {
        //     this.localData = res;
        // var AllDbName = res || {},
        //     dbName = Object.keys(AllDbName);
        // var options = [];
        // dbName.forEach(item => {
        //     options.push({
        //         name: item,
        //         value: item
        //     })
        // })
        // Common.fillSelect(that.$dbName, null, options, dbName[0])
        // })
        // console.log(this.localData)

    }
    this.localData = null
    this.dbList = null
    this.tableName = null
}
SetDbDesignerModal.prototype = {
    initData: async function () {
        var that = this;
        that._clearData();
        // that.dbList = await new FileService().readFile("./profiles/table.json", 'utf-8') || {};
        that.dbList = await new BuildTableJson().get()
        that.dbList = new BuildTableJson().removeData(that.dbList)
        await that.setDboptions()
        // console.log(new BuildTableJson().get())
        //设置默认的表名
        that._setDefaultTableName();
        that.tableName = that._getTableValue()
        var db = Object.keys(that.dbList);
        that.initTable(db[0])
        that.initTableHeader(db[0])
    },
    initTableHeader: function (dbName) {
        var that = this;
        if (that.dbList[dbName] && that.dbList[dbName][that.tableName]) {
            var tabledetail = that.dbList[dbName][that.tableName];
            that.$dbName.val(dbName)
            that.$tabeleDesc.val(tabledetail.tableDesc)
            that.$reserveOne.val(tabledetail.reserveOne)
            that.$reserveTwo.val(tabledetail.reserveTwo)
            that.$reserveThere.val(tabledetail.reserveThere)
            that.$reserveFour.val(tabledetail.reserveFour)
            that.$reserveFive.val(tabledetail.reserveFive)
        } else {
            that.$tabeleDesc.val("")
            that.$reserveOne.val("")
            that.$reserveTwo.val("")
            that.$reserveThere.val("")
            that.$reserveFour.val("")
            that.$reserveFive.val("")
        }

    },
    initTable: function (dbName) {
        var that = this;
        // that.$setDbDesigner.dbDesigner({
        //     disabled: false,
        //     $elems: $("#workspace").find("input"),
        //     thead: [{
        //             name: "id",
        //             text: "编号",
        //             key: "id",
        //             template: function (value) {
        //                 return '<input class="form-control" data-key="id" type="text" value="' + value + '" readonly>';
        //             }
        //         },
        //         {
        //             name: "cname",
        //             text: "中文名",
        //             key: "cname",
        //             template: function (value) {
        //                 return '<input class="form-control" data-key="cname" type="text" value="' + value + '" readonly>';
        //             }
        //         },
        //         {
        //             name: "type",
        //             text: "数据类型",
        //             key: "type",
        //             template: function (value) {
        //                 return `<select class="form-control" data-key="type">
        //                             <option value="string" ${value=="string"?"selected":""}>字符型</option>
        //                             <option value="int" ${value=="int"?"selected":""}>整型</option>
        //                             <option value="float" ${value=="float"?"selected":""}>浮点型</option>
        //                             <option value="time" ${value=="time"?"selected":""}>日期型</option>
        //                             <option value="datetime" ${value=="datetime"?"selected":""}>时间型</option>
        //                         </select>`
        //             }
        //         },
        //         {
        //             name: "maxlength",
        //             text: "数据长度",
        //             key: "maxlength",
        //             template: function (value) {
        //                 return `<input class="form-control"  data-key="maxlength" type="text" value="${value||50}"></input>`
        //             }
        //         },
        //         {
        //             name: "isSave",
        //             text: "是否入库",
        //             key: "isSave",
        //             group: true,
        //             hasCheckbox: true,
        //             template: function (value) {
        //                 var isChecked = !!value ? " checked" : "";
        //                 return '<input data-key="isSave" type="checkbox"' + isChecked + '>';
        //             }
        //         },
        //         { //新增加
        //             name: "fieldSplit",
        //             text: "字段分段",
        //             key: "fieldSplit",
        //             group: true,
        //             template: function (value) {
        //                 return '<input class="form-control" data-key="fieldSplit"  type="text" value="' + value + '">'
        //             }
        //         }
        //     ],
        //     getProperty: new Property().getProperty,
        //     dbList: that.dbList,
        //     db: dbName,
        //     table: that.tableName,
        //     type: "setDbDesigner"
        // })
        that.$setDbDesigner.databaseDesigner({
            disabled: false,
            $elems: $("#workspace").find("input"),
            thead: [{
                    name: "id",
                    text: "编号",
                    key: "id",
                    template: function (value) {
                        return '<input class="form-control" data-key="id" type="text" value="' + value + '" readonly>';
                    }
                },
                {
                    name: "cname",
                    text: "中文名",
                    key: "cname",
                    template: function (value) {
                        return '<input class="form-control" data-key="cname" type="text" value="' + value + '" readonly>';
                    }
                },
                {
                    name: "type",
                    text: "数据类型",
                    key: "type",
                    template: function (value) {
                        return `<select class="form-control" data-key="type">
                                    <option value="string" ${value=="string"?"selected":""}>字符型</option>
                                    <option value="int" ${value=="int"?"selected":""}>整型</option>
                                    <option value="float" ${value=="float"?"selected":""}>浮点型</option>
                                    <option value="time" ${value=="time"?"selected":""}>日期型</option>
                                    <option value="datetime" ${value=="datetime"?"selected":""}>时间型</option>
                                </select>`
                    }
                },
                {
                    name: "maxlength",
                    text: "数据长度",
                    key: "maxlength",
                    template: function (value) {
                        return `<input class="form-control"  data-key="maxlength" type="text" value="${value||50}"></input>`
                    }
                },
                {
                    name: "isSave",
                    text: "是否入库",
                    key: "isSave",
                    group: true,
                    hasCheckbox: true,
                    template: function (value) {
                        var isChecked = !!value ? " checked" : "";
                        return '<input data-key="isSave" type="checkbox"' + isChecked + '>';
                    }
                },
                { //新增加
                    name: "fieldSplit",
                    text: "字段分段",
                    key: "fieldSplit",
                    group: true,
                    template: function (value) {
                        return `<input class="form-control" data-key="fieldSplit"  type="text" value=${value>0?value:""}>`
                    }
                }
            ],
            getProperty: new Property().getProperty,
            dbList: that.dbList,
            db: dbName,
            table: that.tableName
        })
    },
    saveData: async function () {
        var that = this;
        that.$modal.hide().modal('hide');
        renderQrModal({
            action: 'sign/auth',
            title: "扫码验证权限建表",
            data: new Date().valueOf()
        }, function () {
            // var data = that.$setDbDesigner.dbDesigner("getData"),
            var data = that.$setDbDesigner.databaseDesigner("getData"),
                dbName = that.$dbName.val(),
                tableName = that.$tableName.val(),
                tableDesc = that.$tabeleDesc.val(),
                reserveOne = that.$reserveOne.val(),
                reserveTwo = that.$reserveTwo.val(),
                reserveThere = that.$reserveThere.val(),
                reserveFour = that.$reserveFour.val(),
                reserveFive = that.$reserveFive.val(),
                uploderTime = new Date(),
                localData = that.localData || {},
                tabledetail = [];
            data.forEach(function (item) {
                if (!item.isSave) return true;
                tabledetail.push(item)
            })
            if (tabledetail.length < 1) return alert("请选择入库的字段");
            if (!dbName || !tableName || !tableDesc) return alert("数据库名和表名,表注解为必填选项")
            if (localData[dbName]) {
                localData[dbName][tableName] = {
                    "tableDesc": tableDesc,
                    "reserveOne": reserveOne,
                    "reserveTwo": reserveTwo,
                    "reserveThere": reserveThere,
                    "reserveFour": reserveFour,
                    "reserveFive": reserveFive,
                    "uploderTime": uploderTime,
                    "tableDetail": tabledetail
                }
            } else {
                localData[dbName] = {
                    [tableName]: {
                        "tableDesc": tableDesc,
                        "reserveOne": reserveOne,
                        "reserveTwo": reserveTwo,
                        "reserveThere": reserveThere,
                        "reserveFour": reserveFour,
                        "reserveFive": reserveFive,
                        "uploderTime": uploderTime,
                        "tableDetail": tabledetail
                    }
                }
            }
            var bingocolumns = []
            tabledetail.forEach(function (item) {
                var obj = {
                    name: item.id,
                    type: item.type,
                    cname: item.cname,
                    fieldSplit: item.fieldSplit.trim()
                }
                if (item.type == "string") {
                    obj.maxlength = item.maxlength
                }
                bingocolumns.push(obj)
            })

            var bingoData = {
                database: dbName,
                table: tableName,
                description: tableDesc,
                columns: bingocolumns
            }
            修改接口
            new Service().createTable(bingoData).then(res => {
                that._clearData()
                that._uploderDb(localData).then(res => {
                    that.$modal.modal("hide")
                })
            })
        })

    },

    execute: function () {
        var that = this;
        that.$modal.on("show.bs.modal", function () {
            that.initData()
        })
        that.$modal.find(".modal-header .close").on("click", function () {
            that.$modal.modal("hide")
        })
        that.$modal.find(".modal-footer .save").on("click", function (event) {
            event.stopPropagation();
            that.saveData()

        })

        // that.basicEvents(null, that.initData, that.saveData, null); //绑定基础事件
    },
    bindEvents: function () {
        var that = this;
        that.$modalBody.on("change" + that.NAME_SPACE, "[data-key='type']", function (event) {
            var type = $(this).val()
            var $tr = $($(this).parents("tr")),
                $dataLength = $tr.find('[data-key="maxlength"]');
            type == "string" ? ($dataLength.removeAttr("readonly"), $dataLength.val(50)) : ($dataLength.attr("readonly", true) && $dataLength.val(""))

        })
        that.$modal.on("change" + that.NAME_SPACE, '[data-type="dbName"]', function () {
            var dbName = $(this).val()
            if (!dbName) return;
            that.initTableHeader(dbName)
            that.initTable(dbName)
        })
    }
}