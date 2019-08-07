function SetDbDesignerModal($modal) {
    BaseModal.call(this, $modal, null)
    this.Name_space = ".setDbDesigner";
    this.$setDbDesigner = this.$modalBody.find("#setDbDesigner");
    this.NAME_SPACE = ".setdbDesigner"
    this.$dbName = this.$modalBody.find('[data-type="dbName"]'); //获取数据库名输入框
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
        var that = this
        new FileService().readFile("./profiles/table.json", 'utf-8').then(res => {
            var AllDbName = res || {},
                dbName = Object.keys(AllDbName);
            var options = [];
            dbName.forEach(item => {
                options.push({
                    name: item,
                    value: item
                })
            })
            Common.fillSelect(that.$dbName, null, options, dbName[0])
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
                    name: "type",
                    text: "数据类型",
                    key: "type",
                    template: function (value) {
                        return `<select class="form-control" data-key="type"><option value="int">整型</option><option value="float">浮点型</option><option value="string">字符型</option><option value="time">日期型</option><option value="datatime">时间型</option></select>`
                    }
                },
                {
                    name: "maxlength",
                    text: "数据长度",
                    key: "maxlength",
                    template: function (value) {
                        return `<input class="form-control"  data-key="maxlength" type="text" value="${value}" readonly></input>`
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
        var bingocolumns = []
        tabledetail.forEach(function(item){
            var obj = {
                name:item.id,
                type:item.type,
                cname:item.cname
            }
            if(item.type=="string"){obj.maxlength=item.maxlength}
            bingocolumns.push(obj)
        })
    
        var bingoData = {
            database:dbName,
            table:tableName,
            columns:bingocolumns 
        }
        
       new Service().createTable(bingoData).then(res=>{
           this._clearData()
           that._uploderDb(localData)
       })
        
    },

    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, that.saveData, null); //绑定基础事件
    },
    bindEvents: function () {
        var that = this;
        that.$modalBody.on("change" + that.NAME_SPACE, "[data-key='type']", function (event) {
            var type = $(this).val()
            var $tr = $($(this).parents("tr")),
                $dataLength = $tr.find('[data-key="maxlength"]');
            type=="string" ? $dataLength.removeAttr("readonly") : ($dataLength.attr("readonly",true) && $dataLength.val(""))
            
        })
    }
}