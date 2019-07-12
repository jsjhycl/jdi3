/**
 * 抄送配置
 * @param $modal
 * @param $element
 * @constructor
 */
function CopySendModal($modal, $element) {
    BaseModal.call(this, $modal, $element);//调用基础模态框事件

    this.$tbody = this.$modalBody.find(".table tbody");//获取元素下面的table下面的tbody

    const STATE_CONFIG = [//抄送状态
        {name: "启用", value: 1},
        {name: "禁用", value: 0}
    ];

    
    //清空表格的tbody
    this._resetData = function () {//
        this.$tbody.empty();//把元素所有内容设置为空
    };
    //添加抄送元素
    this._addItem = function (data) {
        var that = this,
            $tr = $('<tr>' + TableHelper.buildBtnInputTd("btn-config btn-element", "E", "element") +
                '<td><select class="form-control" data-key="state"></select></td>' +
                '<td><select class="form-control" data-key="dbName"></select></td>' +
                '<td><select class="form-control" data-key="table"></select></td>' +
                '<td><select class="form-control" data-key="field"></select></td>' +
                '<td><select class="form-control" data-key="fieldSplit"></select></td>' +//增加抄送
                TableHelper.buildBtnInputTd("btn-config btn-conditions", null, "conditions") +
                TableHelper.buildBtnInputTd("btn-config btn-value", null, "value") +
                '<td><button class="btn btn-danger btn-sm remove">删除</button></td></tr>');//生成抄送行的html
        that.$tbody.append($tr);//添加到tbody中
        var element, state, dbName, table, field, fieldSplit, conditions, value;//声明变量
        if (DataType.isObject(data)) {//如果data是对象
            element = data.element;//赋值抄送元素
            state = data.state;//赋值抄状态
            dbName = data.dbName;
            table = data.table;//赋值抄送表格
            field = data.field;//赋值抄送列
            fieldSplit = data.fieldSplit;//赋值抄送插入字段
            conditions = data.conditions;//赋值抄送行
            value = data.value;//赋值抄送值
        }
        var AllDbName = JSON.parse(localStorage.getItem("AllDbName"))||{},
            dbNames = [],
            tables = [],
            fields = [],
            fieldSplits = [];

        Object.keys(AllDbName).forEach(function(item){
            dbNames.push({name:item,value:item})
        })
        if(dbName){
            Object.keys(AllDbName[dbName]).forEach(function(item){
                tables.push({name:item,value:item})
            })
            if(table){
                AllDbName[dbName][table].tableDetail.forEach(function(item){
                    fields.push({name:item.cname,value:item.id})
                    if(item.id ==field){
                        for(var i=1;i<=item.fieldSplit;i++){
                            fieldSplits.push({name:"请插入",value:i})
                        }
                    }
                })
            }
        }
        ModalHelper.setInputData($tr.find('[data-key="element"]'), element, false);//调用ModalHelper中的setInputData方法
        ModalHelper.setSelectData($tr.find('[data-key="state"]'), null, STATE_CONFIG, state, false);//调用ModalHelper中的setInputData方法
        Common.fillSelect($tr.find('[data-key="dbName"]'), {name: "请选择抄送数据库", value: ""}, dbNames, dbName, true);//调用ModalHelper中的setInputData方法
        Common.fillSelect($tr.find('[data-key="table"]'),{name:"请选择数据表",value:""},tables,table,true);
        Common.fillSelect($tr.find('[data-key="field"]'),{name:"请选择抄送列",value:""},fields,field,true);
        Common.fillSelect($tr.find('[data-key="fieldSplit"]'),{name:"请选择抄送字段",value:""},fieldSplits,fieldSplit,true);
        // ModalHelper.setTableSelect(true, $tr.find('[data-key="table"]'), {name: "请选择抄送表", value: ""}, table, true);//调用ModalHelper中的setInputData方法
        // ModalHelper.setFieldSelect($tr.find('[data-key="field"]'), {name: "请选择抄送列", value: ""}, table, field, true);//调用ModalHelper中的setInputData方法
        // ModalHelper.setFieldSplitSelect($tr.find('[data-key="fieldSplit"]'), {name:"插入",value:"0"}, table, field, fieldSplit, true)//调用ModalHelper中的setInputData方法
        ModalHelper.setInputData($tr.find('[data-key="conditions"]'), conditions, true);//调用ModalHelper中的setInputData方法
        ModalHelper.setInputData($tr.find('[data-key="value"]'), value, true);//调用ModalHelper中的setInputData方法
    };
    this._removeItem = function ($tr) {
        $tr.remove();//当前的tr移除
    };
}

CopySendModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();//调用_resetData
        if (!Array.isArray(data)) return;//如果data不是数组退出函数

        data.forEach(function (item) {//遍历data
            that._addItem(item);//调用_addItem
        });
    },
    saveData: function () {
        var that = this,
            result = [];
        that.$modalBody.find("tr").each(function () {//遍历弹窗中的tr
            var element = $(this).find('[data-key="element"]').val(),//获取抄送元素的值
                state = $(this).find('[data-key="state"]').val(),//获取抄送状态
                dbName = $(this).find('[data-key="dbName"]').val(),
                table = $(this).find('[data-key="table"]').val(),//获取抄送表
                field = $(this).find('[data-key="field"]').val(),//获取抄送列
                fieldSplit = $(this).find('[data-key="fieldSplit"]').val();//获取抄送字段
                conditions = $(this).find('[data-key="conditions"]').val() || null,//获取抄送行
                value = $(this).find('[data-key="value"]').val() || null;//获取抄送值
            if (state !== "1") return true;//如果抄送状态为1退出函数

            result.push({//向数组中添加结果
                element: element,
                state: 1,
                dbName:dbName,
                table: table,
                field: field,
                fieldSplit:Number(fieldSplit),
                conditions: Common.parseData(conditions),
                value: Common.parseData(value)
            });
        });
        if (result.length > 0) {//如果result的长度大于零
            that.$element.val(JSON.stringify(result));//把result转换为jSON
        }
    },
    clearData: function () {
        var result = confirm("确定要清除抄送配置数据吗？");//提示否修改抄送 配置
        if (!result) return;//如果取消退出函数

        var that = this;
        that._resetData();//调用_resetData
        that.$element.val("");//元素的值设置为空
        that.$modal.modal("hide");//弹窗隐藏
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);//绑定基础事件
    },
    bindEvents: function () {
        var that = this;
        that.$modal.off("click");//移除事件
        //添加
        that.$modal.on("click", ".add", function () {
            that._addItem(null);//调用_addItem
        });
        //删除
        that.$modal.on("click", ".remove", function () {
            that._removeItem($(this).parents("tr"));//调用_removeItem
        });
        //抄送元素
        that.$modal.on("click", ".btn-element", function () {
            var $expr = $(this);
            $expr.exprGenerator({//调用exprGenerator并传入参数
                hasBrace: false,
                $source: $("#workspace"),
                $result: $expr.next(),
                toolbar: [
                    {title: "类型转换", type: "cast", data: {"数字": "数字", "字符": "字符"}, style: "cpanel-type"},
                    {
                        title: "算术运算符",
                        type: "normal",
                        data: {"+": "+", "-": "-", "*": "*", "/": "/"},
                        style: "cpanel-operator"
                    }
                ]
            });
        });
        //抄送行
        that.$modal.on("click", ".btn-conditions", function () {
            var $conditionsModal = $("#conditionsModal"),//获取条件配置模态框
                $element = $(this).next(),//获取输入框
                table = $(this).parents("tr").find('[data-key="table"]').val();//获取抄送表的值
            var conditionsModal = new ConditionsModal($conditionsModal, $element, 1, table);//实例化ConditionsModal
            conditionsModal.execute();//调用execute
            $conditionsModal.modal("show");//弹窗显示
        });
        //抄送值
        that.$modal.on("click", ".btn-value", function () {//抄送值按钮点击
            var $copyValueModal = $("#copyValueModal"),//获取抄送值弹窗
                $element = $(this).next();//获取抄送值的输入框
            var copyValueModal = new CopyValueModal($copyValueModal, $element);//实例化抄送值的弹窗
            copyValueModal.execute();//调用execute
            copyValueModal.bindEvents();//调用bindEvents
            $copyValueModal.modal("show");//弹窗显示
        });

        that.$modal.off("change");//移除弹窗的change事件
        //抄送状态
        that.$modal.on("click", '[data-key="state"]', function () {//抄送状态改变
            var $inputs = $(this).parents("tr").find(":input,select").not($(this)),//获取input框和选择框
                state = $(this).val();//获取现在的值
            $inputs.prop("disabled", state !== "1");//给$input设置disabled属性
        });
        //抄送数据库
        that.$modal.on("change",'[data-key="dbName"]',function(){
            var $tableSelect = $(this).parents("tr").find('[data-key ="table"]'),
                dbName = $(this).val(),
                AllDbName = JSON.parse(localStorage.getItem("AllDbName"))||{},
                tableOptions = [];
            if(dbName){
                Object.keys(AllDbName[dbName]).forEach(function(item){
                    tableOptions.push({name:item,value:item})
                })
            }
            Common.fillSelect($tableSelect,{name:"请选择抄送表",value:""},tableOptions,null,true)
        })
        //抄送表
        that.$modal.on("change", '[data-key="table"]', function () {//抄送表改变是
            var $fieldSelect = $(this).parents("tr").find('[data-key="field"]'),//获取抄送列的值
                table = $(this).val(),//获取抄送抄送表的值
                dbName = $(this).parents("tr").find('[data-key="dbName"]').val(),
                AllDbName = JSON.parse(localStorage.getItem("AllDbName"))||{},
                fieldOptions = [];
            if(dbName&&table){
                AllDbName[dbName][table].tableDetail.forEach(function(item){
                    fieldOptions.push({name:item.cname,value:item.id})
                })
            }
            Common.fillSelect($fieldSelect,{name:"请选择字段",value:""},fieldOptions,null,true)
            // ModalHelper.setFieldSelect($fieldSelect, {name: "请选择抄送列", value: ""}, table, null, true);//调用ModalHelper的setFieldSelect方法
        });
        //处理字段属性
        that.$modal.on("change",'[data-key="field"]', function () {//抄送类改变
            // var $fieldSplitSelect = $(this).parents("tr").find('[data-key="fieldSplit"]'),//获取抄送字段
            // field = $(this).val();//获取抄送列的值
            // var table = $(this).parents("tr").find('[data-key="table"]').val();//获取抄送表的值
            // ModalHelper.setFieldSplitSelect($fieldSplitSelect,{name: "插入", value: "0"}, table, field, null, true)//调用ModalHelper的setFieldSelect方法
            var $fieldSplitSelect = $(this).parents("tr").find('[data-key="fieldSplit"]'),
                dbName = $(this).parents("tr").find('[data-key="dbName"]').val(),
                table = $(this).parents("tr").find('[data-key="table"]').val(),
                field = $(this).parents("tr").find('[data-key="field"]').val(),
                fieldSplit = "",
                fieldSplitOptions = [],
                AllDbName = JSON.parse(localStorage.getItem("AllDbName"))||{};
                if(dbName&&table&&field){
                    AllDbName[dbName][table].tableDetail.forEach(function(item){
                        if(item.id==field){
                            fieldSplit = item.fieldSplit
                        }
                    })
                    for(var i=1;i<=fieldSplit;i++){
                        fieldSplitOptions.push({name:"插入",value:i})
                    }
                }
                Common.fillSelect($fieldSplitSelect,{name:"插入",value:""},fieldSplitOptions,null,true)
        })
    }
};