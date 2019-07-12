/**
 * 数据库设计配置
 * @param $modal
 * @constructor
 */
function DbDesignerModal($modal) {
    BaseModal.call(this, $modal, null); //绑定基础弹窗


    this.NAME_SPACE = ".dbDesigner"

    this.$dbDesigner = this.$modalBody.find("#dbDesigner"); //获取数据库设计器

    this.$db = $("#dbDesignerModal")


}

DbDesignerModal.prototype = {
    initData: function () {
        var that = this;

        var dbList = JSON.parse(localStorage.getItem("AllDbName")) || {}
        var dbNames = []
        Object.keys(dbList).forEach(function (item) {
            dbNames.push({
                "name": item,
                "value": item
            })
        })
        // new Db().getTables(false, function (tables) {console.log(tables)})
        that.$dbDesigner.dbDesigner({ //调用jquery的扩展方法
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
                }, {
                    name: "isSave",
                    text: "是否入库",
                    key: "db.isSave",
                    group: true,
                    hasCheckbox: true,
                    template: function (value) {
                        var isChecked = !!value ? " checked" : "";
                        return '<input data-key="isSave" type="checkbox"' + isChecked + '>';
                    }
                }, {
                    name: "dbName",
                    text: "数据库名",
                    key: "db.dbName",
                    group: true,
                    template: function (value) {
                        var $select = $('<select data-key="dbName"></select>')
                        Common.fillSelect($select, {
                            name: "请选择库",
                            value: ""
                        }, dbNames, value, true)
                        return $select.get(0).outerHTML;
                    }
                }, {
                    name: "table",
                    text: "表名称",
                    key: "db.table",
                    group: true,
                    template: function (value,options) {
                        var $select = $('<select data-key="table"></select>');
                        Common.fillSelect($select, {
                            name: "请选择表",
                            value: ""
                        }, options, value, true);
                        return $select.get(0).outerHTML;
                    }
                }, {
                    name: "selectField",
                    text: "存入字段",
                    key: "db.field",
                    group: true,
                    template: function (value,options) {
                        var $select = $('<select data-key="selectField"></select>');
                        Common.fillSelect($select, { name: "请选择字段", value: "" }, options, value, true);
                        return $select.get(0).outerHTML;
                    }
                },
                { //新增加
                    name: "selectFieldSplit",
                    text: "字段分段",
                    key: "db.fieldSplit",
                    group: true,
                    template: function (value,options) {
                        var $select = $('<select data-key="selectFieldSplit"></select>')
                        Common.fillSelect($select, { name: "请选择第几段", value: "" }, options, value, true)
                        return $select.get(0).outerHTML;
                    }
                }, 
                // {
                //     name: "field",
                //     text: "字段名称",
                //     key: "db.field",
                //     group: true,
                //     template: function (value) {
                //         return '<input class="form-control" data-key="field" type="text" value="' + value + '">';
                //     }
                // }, 
                {
                    name: "desc",
                    text: "字段描述",
                    key: "db.desc",
                    group: true,
                    template: function (value) {
                        return '<input class="form-control" data-key="desc" type="text" value="' + value + '">';
                    }
                }
            ],
            getProperty: new Property().getProperty //把property的getproperty方法赋值给getProperty
        });
    },
    saveData: function () {
        var that = this,
            data = that.$dbDesigner.dbDesigner("getData"); //调用getData方法
        if (!Array.isArray(data)) return alert("无效的数据类型！"); //如果data不是数组退出函数提示
        console.log(data)
        var property = new Property(); //实例化property
        data.forEach(function (item) { //遍历data
            console.log(item,"保存")
            if (!item.isSave) return true; //如果issave为false退出函数
            property.setValue(item.id, "db", { //调用property的setValue方法
                isSave: item.isSave,//是否入库
                dbName:item.dbName,//存档数据库
                table: item.table,//存档表格
                field: item.selectField,
                // selectField:item.selectField,
                fieldSplit: item.selectFieldSplit,//新增加
                desc: item.desc,
            });
        });
    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, that.saveData, null); //绑定基础事件
    },
    bindEvents: function () {
        var that = this;
        //数据库切换的时候
        that.$db.on("change" + that.NAME_SPACE, "[data-key='dbName']", function (event) {
            var $select = $(event.target).parents("tr").find('[data-key="table"]'),
                key = $(this).val(),
                AllDbName = JSON.parse(localStorage.getItem('AllDbName')),
                objTableNames = Object.keys(AllDbName[key]),
                arrTableNames = [];
            objTableNames.forEach(function (item) { arrTableNames.push({ "name": item, "value": item }) })
            Common.fillSelect($select, { name: "请选择表", value: "" }, arrTableNames, null, true)
        })
        //切换表格时
        that.$db.on("change" + that.NAME_SPACE, "[data-key='table']", function (event) {
            var $selectDbVal = $(event.target).parents("tr").find('[data-key="dbName"]').val(),
                $select = $(event.target).parents("tr").find('[data-key="selectField"]')
                key = $(this).val(),
                AllDbName = JSON.parse(localStorage.getItem('AllDbName')),
                objTableNames = AllDbName[$selectDbVal][key].tableDetail,
                arrFieldsNames = [];
            objTableNames.forEach(function (item) {
                arrFieldsNames.push({"name": item.cname, "value": item.id})
            })
            Common.fillSelect($select, {name: "请选择字段", value: ""}, arrFieldsNames, null, true)
        })
        //切换字段
        that.$db.on("change"+ that.NAME_SPACE, "[data-key='selectField']",function(event){
            var selectDbVal = $(event.target).parents("tr").find('[data-key="dbName"]').val(),
                selectTableVal = $(event.target).parents("tr").find('[data-key="table"]').val(),
                selectField = $(this).val(),
                localData = JSON.parse(localStorage.getItem('AllDbName')),
                AllFields = localData[selectDbVal][selectTableVal].tableDetail,
                selectValue = "",
                fieldSplit = [];
            AllFields.forEach(function (item) {
                
                if(item.id == selectField){
                    selectValue = Number(item.fieldSplit)
                }
            })
            for(var i = 1; i <= selectValue; i++){
                fieldSplit.push({name:"插入",value:i})
            }
            var $select = $(event.target).parents("tr").find('[data-key="selectFieldSplit"]')
            Common.fillSelect($select,{name:"请选择第几段",value:""},fieldSplit,null,true)
        })

    }
};