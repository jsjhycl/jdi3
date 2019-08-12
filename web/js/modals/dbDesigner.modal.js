/**
 * 数据库设计配置
 * @param $modal
 * @constructor
 */
function DbDesignerModal($modal) {
    BaseModal.call(this, $modal, null); //绑定基础弹窗
    this.AllDbName = {}

    this.NAME_SPACE = ".dbDesigner"
    
    this.$dbDesigner = this.$modalBody.find("#dbDesigner"); //获取数据库设计器

    this.$db = $("#dbDesignerModal")


}

DbDesignerModal.prototype = {
    initData: async function () {
        var that = this;

        var dbList = await new FileService().readFile("./profiles/table.json", 'utf-8') || {},
         dbNames = [];
         that.AllDbName = dbList;
        Object.keys(dbList).forEach(function (item) {
            dbNames.push({
                "name": item,
                "value": item
            })
        })
        that.$dbDesigner.dbDesigner({ //调用jquery的扩展方法
            disabled: false,
            $elems: $("#workspace").find(":input"),
            thead: [{
                    name: "id",
                    text: "编号",
                    key: "id",
                    template: function (value) {
                        return '<input class="form-control" data-key="id" style="width:80px" type="text" value="' + value + '" readonly>';
                    }
                },
                {
                    name: "cname",
                    text: "中文名",
                    key: "cname",
                    template: function (value) {
                        return '<input class="form-control" data-key="cname" style="width:90px" type="text" value="' + value + '" readonly>';
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
                    template: function (value, options) {
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
                    template: function (value, options) {
                        var $select = $('<select data-key="selectField"></select>');
                        Common.fillSelect($select, {
                            name: "请选择字段",
                            value: ""
                        }, options, value, true);
                        return $select.get(0).outerHTML;
                    }
                },
                { //新增加
                    name: "selectFieldSplit",
                    text: "字段分段",
                    key: "db.fieldSplit",
                    group: true,
                    template: function (value, options) {
                        var $select = $('<select data-key="selectFieldSplit"></select>')
                        Common.fillSelect($select, {
                            name: "请选择第几段",
                            value: ""
                        }, options, value, true)
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
                        return '<input class="form-control" data-key="desc" type="text" style="width:90px" value="' + value + '">';
                    }
                }, {
                    name: "operation",
                    text: "操作",
                    key: "db.op",
                    group: true,
                    template: function (value) {
                        return '<span id="dbDesignerAdd" class="add">+</span><span style="margin-left:10px" class="del" id="dbDesignerRemove" class="del">×</span>'
                    }
                }
            ],
            getProperty: new Property().getProperty,
            dbList:dbList, //把property的getproperty方法赋值给getProperty
            type:"dbDesigner"
        });
    },
    saveData: function () {
        var that = this,
            data = that.$dbDesigner.dbDesigner("getData"); //调用getData方法
        if (!Array.isArray(data)) return alert("无效的数据类型！"); //如果data不是数组退出函数提示
        var property = new Property();
            data.forEach(item=>{
                property.setValue(item.id,"db",[])
            })
            data.forEach(function(item){
                if(!item.isSave) return true;
                property.pushValue(item.id,"db",{
                    isSave: item.isSave,//是否入库
                    dbName:item.dbName,//存档数据库
                    table: item.table,//存档表格
                    field: item.selectField,
                    fieldSplit: item.selectFieldSplit,//新增加
                    desc: item.desc,
                })
            })
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
                AllDbName = that.AllDbName||{},
                objTableNames = Object.keys(AllDbName[key]||{}),
                arrTableNames = [],
                arr = [];
                
            objTableNames.forEach(item=>{
                if(AllDbName[key][item]["key"] == undefined){
                    arr.push(item)
                }
            })
            arr.forEach(function (item) {
                arrTableNames.push({
                    "name": AllDbName[key][item]["tableDesc"],
                    "value": item
                })
            })
            Common.fillSelect($select, {
                name: "请选择表",
                value: ""
            }, arrTableNames, null, true)
        })
        //切换表格时
        that.$db.on("change" + that.NAME_SPACE, "[data-key='table']", function (event) {
            var $selectDbVal = $(event.target).parents("tr").find('[data-key="dbName"]').val(),
                $select = $(event.target).parents("tr").find('[data-key="selectField"]')
            key = $(this).val(),
                AllDbName = that.AllDbName||{},
                objTableNames = AllDbName[$selectDbVal][key].tableDetail,
                arrFieldsNames = [];
            objTableNames.forEach(function (item) {
                arrFieldsNames.push({
                    "name": item.cname,
                    "value": item.id
                })
            })
            Common.fillSelect($select, {
                name: "请选择字段",
                value: ""
            }, arrFieldsNames, null, true)
        })
        //切换字段
        that.$db.on("change" + that.NAME_SPACE, "[data-key='selectField']", function (event) {
            var selectDbVal = $(event.target).parents("tr").find('[data-key="dbName"]').val(),
                selectTableVal = $(event.target).parents("tr").find('[data-key="table"]').val(),
                selectField = $(this).val(),
                localData = that.AllDbName||{},
                AllFields = localData[selectDbVal][selectTableVal].tableDetail,
                selectValue = "",
                fieldSplit = [];
            AllFields.forEach(function (item) {

                if (item.id == selectField) {
                    selectValue = Number(item.fieldSplit)
                }
            })
            for (var i = 1; i <= selectValue; i++) {
                fieldSplit.push({
                    name: "插入",
                    value: i
                })
            }
            var $select = $(event.target).parents("tr").find('[data-key="selectFieldSplit"]')
            Common.fillSelect($select, {
                name: "请选择第几段",
                value: ""
            }, fieldSplit, null, true)
        })
        //增加一段
        that.$db.on("click" + that.NAME_SPACE, "#dbDesignerAdd", function (event) {
            var target = $(this).parent("td").parent("tr"),
                html = target.clone();
            target.after(html)
        })
        //移除一段
        that.$db.on("click" + that.NAME_SPACE, "#dbDesignerRemove", function (event) {
            var $table = $("#dbDesigner"),
                $ids = $table.find('[data-key="id"]'), 
                ids = [],
                value = $(this).parents("tr").find('[data-key="id"]').val();
            $ids.each(function(){
                ids.push($(this).val())
            })
            console.log(value)
            var num=0;
            ids.forEach(function(item){
                if(item==value){
                    num++
                }
            })
            console.log(num)
            if(num>1){
                var target = $(this).parent("td").parent("tr");
                target.remove()
            }

        })
    }
};