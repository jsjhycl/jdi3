function SetDbDesignerModal($modal) {
    BaseModal.call(this, $modal, null)
    this.Name_space = ".setDbDesigner";
    this.$setDbDesigner = this.$modalBody.find("#setDbDesigner");

    this.$dbName = this.$modalBody.find('[data-type="dbName"]'), //获取数据库名输入框
        this.$tableName = this.$modalBody.find('[data-type="tableName"]'), //获取表格名输入框
        this.$tabeleDesc = this.$modalBody.find('[data-type="tableDesc"]'), //获取表格描述输入框
        this.$reserveOne = this.$modalBody.find('[data-type="reserveOne"]'), //获取备用1输入框
        this.$reserveTwo = this.$modalBody.find('[data-type="reserveTwo"]'), //获取备用2输入框
        this.$reserveThere = this.$modalBody.find('[data-type="reserveThere"]'), //获取备用3输入框
        this.$reserveFour = this.$modalBody.find('[data-type="reserveFour"]'), //获取备用4输入框
        this.$reserveFive = this.$modalBody.find('[data-type="reserveFive"]'); //获取备用5输入框

    //向数据库添加目录总表
    // this._uploderDb = function (data) {
    //     return $.cajax({ //返回一个ajax对象
    //         url: "/api/save/ZZZZZZZ/table.json",
    //         type: "POST",
    //         contentType: "text/plain;charset=utf-8",
    //         data: data,
    //         dataType: "json"
    //     });
    // }
    this._uploderDb = function (data) {
        return new FileService().writeFile('./profiles/table.json', JSON.stringify(data),function(){
            console.log("保存成功")
        });
    }
    this._downloadDB = async function () {
        return await new FileService().readFile("./profiles/table.json", 'utf-8')
    }
    this._getTableValue = function () {

        return $("#name .text-danger").text().replace(/\(|\)/g, "")
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
    this.setDboptions = function () {
        var that =this
        new FileService().readFile("./profiles/table.json", 'utf-8').then(res => {
                var AllDbName = res || {},
                dbName = Object.keys(AllDbName);
                var options = [];
                dbName.forEach(item=>{
                    options.push({name:item,value:item})
                })
                Common.fillSelect(that.$dbName,null,options,dbName[0])
            })

    }

}
SetDbDesignerModal.prototype = {
    initData: function () {
        var that = this;
        that.setDboptions()
        //设置默认的表名
        that._setDefaultTableName()
        //渲染表格
        that.$setDbDesigner.dbDesigner({
            disabled: false,
            $elems: $("#workspace").find(":input"),
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
                    name: "isSave",
                    text: "是否入库",
                    key: "db.isSave",
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
                    key: "db.fieldSplit",
                    group: true,
                    template: function (value) {
                        return '<input class="form-control" data-key="fieldSplit" type="text" value="' + value + '">'
                    }
                }
            ],
            getProperty: new Property().getProperty,
            type: "setDbDesigner"
        })
    },
    saveData: async function () {
        var that = this,
            data = that.$setDbDesigner.dbDesigner("getData"),
            dbName = that.$dbName.val(),
            tableName = that.$tableName.val(),
            tableDesc = that.$tabeleDesc.val(),
            reserveOne = that.$reserveOne.val(),
            reserveTwo = that.$reserveTwo.val(),
            reserveThere = that.$reserveThere.val(),
            reserveFour = that.$reserveFour.val(),
            reserveFive = that.$reserveFive.val(),
            uploderTime = new Date(),
            localData = await new FileService().readFile("./profiles/table.json", 'utf-8') || {},
            tabledetail = [];
            console.log(localData)
        data.forEach(function (item) {
            if (!item.isSave) return true;
            tabledetail.push(item)
        })
        if (!dbName || !tableName) return alert("数据库名和表名为必填选项")
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
        console.log(localData)
        that._uploderDb(localData)
        this._clearData()
    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, that.saveData, null); //绑定基础事件
    },
    bindEvents: function () {

    }
}