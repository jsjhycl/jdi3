/**
 * 存档路径配置
 * @param $modal
 * @param $element
 * @constructor
 */
function ArchivePathModal($modal, $element) {
    BaseModal.call(this, $modal, $element);//调用基础弹窗模型
    this.$archiveDbName= this.$modalBody.find('[data-key="dbName"]')
    this.$archiveType = this.$modalBody.find('[data-key="type"]');//获取存档类型
    this.$archiveTable = this.$modalBody.find('[data-key="table"]');//获取存档表格
    this.$archiveField = this.$modalBody.find('[data-key="field"]');//获取存单字段
    this.$archiveModelId = this.$modalBody.find('[data-key="modelId"]');//获取模板编号

    const TYPE_CONFIG = [//定义type类型
        {name: "通用查询", value: 0},
        {name: "表格查询", value: 1},
        {name: "详情链接", value: 2}
    ];

    //设置存档类型的下拉框
    this._setTypeSelect = function ($typeSelect, type) {
        ModalHelper.setSelectData($typeSelect, {name: "请选择存档类型", value: ""}, TYPE_CONFIG, type, false);//调用ModalHelper中的setSelectData方法设置下拉抗
        var that = this,
            $formGroup = that.$archiveModelId.parent();//获取模板编号的父集元素
        if (type === 2) $formGroup.show();//如果type等于2给模板编号显示
        else $formGroup.hide();//否则隐藏模板编号
    };

    //设置模板编号
    this._setModelIdSelect = function ($modelIdSelect, modelId) {
        if (!$modelIdSelect || $modelIdSelect.length <= 0) return;//如果模板编号或则模板id的长度小于零退出函数
        new ProductService().list("模型", 40, function (result) {//实例化productServer中的list方法
            Common.handleResult(result, function (data) {//调用Common中的HandleResult方法
                var defaultOption = {name: "请选择模板编号", value: ""},//设置defaultOption
                    options = Array.isArray(data) ? data.map(function (item) {//查看data是不是数组如果是遍历数组否则返回一个空数组
                        return {name: item.name, value: item.id};
                    }) : [];
                Common.fillSelect($modelIdSelect, defaultOption, options, null, true);//调用Common中fillselect方法
                if (modelId) {//如果modelId不存在
                    $modelIdSelect.val(modelId);//设置值
                }
            });
        });
    };

    this._resetData = function () {
        var that = this;
        that.$archiveType.val(0);//获取$archiveType
        Common.fillSelect(that.$archiveTable, {name: "请选择存档表格", value: ""}, null, null, true);//调用Common中的fillSelect
        Common.fillSelect(that.$archiveField, {name: "请选择存档字段", value: ""}, null, null, true);//调用Common中的fillSelect
        Common.fillSelect(that.$archiveModelId, {name: "请选择模板编号", value: ""}, null, null, true);//调用Common中的fillSelect
        Common.fillSelect(that.$archiveDbName,{name:"请选择数据库",value:""},null,null,null,true)//清空存档的数据库为空
    };
}

ArchivePathModal.prototype = {
    initData: function (data) {
        var that = this,
            dbs = [],
            AllDbName = JSON.parse(localStorage.getItem("AllDbName"))||{};
            
            Object.keys(AllDbName).forEach(function(item){
                dbs.push({name:item,value:item})
            })

        that._resetData();//调用_resetData方法
        if (data) {//如果data存在
            //填充数据库下拉框
            var dbName = data.dbName,
                table = data.table,
                tableOptions = [],
                fieldsoptions = [];
                
            that._setTypeSelect(that.$archiveType, data.type);//调用_setTypeSelect
            Common.fillSelect(that.$archiveDbName,{name:"请选择存档数据库",value:""},dbs,data.dbName,true)
            if(dbName){
                Object.keys(AllDbName[dbName]).forEach(function(item){
                    tableOptions.push({name:item,value:item})
                })
                if(table){
                    AllDbName[dbName][table].tableDetail.forEach(function(item){
                        fieldsoptions.push({name:item.cname,value:item.id})
                    })
                }
            }
            Common.fillSelect(that.$archiveTable, {name: "请选择存档表格", value: ""}, tableOptions,data.table, true)
            Common.fillSelect(that.$archiveField, {name:"请选择存档字段",value:""},fieldsoptions,data.field,true)
            // ModalHelper.setTableSelect(false, that.$archiveTable, {name: "请选择存档表格", value: ""}, data.table, true);//调用_setTypeSelect
            // ModalHelper.setFieldSelect(that.$archiveField, {name: "请选择存档字段", value: ""}, data.table, data.field, true);//调用_setTypeSelect
            // that._setModelIdSelect(that.$archiveModelId, data.modelId);//调用_setTypeSelect
        } else {
            //填充数据库下拉框
            that._setTypeSelect(that.$archiveType, null);//调用_setTypeSelect
            Common.fillSelect(that.$archiveDbName,{name:"请选择存档数据库",value:""},dbs,null,true)
            Common.fillSelect(that.$archiveTable,{name:"请选择存档表",value:""},null,null,true)
            Common.fillSelect(that.$archiveField,{name:"请选择存档字段",value:""},null,null,true)
            // ModalHelper.setTableSelect(false, that.$archiveTable, {name: "请选择存档表格", value: ""}, null, true);//调用_setTypeSelect
            // ModalHelper.setFieldSelect(that.$archiveField, {name: "请选择存档字段", value: ""}, null, null, true);//调用_setTypeSelect
            // that._setModelIdSelect(that.$archiveModelId, null);//调用_setTypeSelect
        }
    },
    saveData: function () {
        console.log(12)
        var id = $("#property_id").val();//获取$("#property_id")的值
        if (!id) return;//如果没有退出函数

        if (id === "BODY") return alert("页面属性中不可以配置存档路径！");//如果id等于BODY退出函数并提示

        var that = this,
            data = {},
            $control = $("#workspace").find("#" + id);//获取工作区中的对应id的元素
        that.$modal.find(".modal-body .form-control").each(function () {//获取元素遍历
            var key = $(this).attr("data-key"),//获取当前元素的data-key
                type = $(this).attr("data-type"),//获取当前元素的data-type
                value = $(this).val();//获取当前元素的值
            data[key] = DataType.convert(type, value);//调用DataType的convert方法
        });
        console.log(data)
        that.$element.val(JSON.stringify(data));//给元素设置值
        new Property().save($control, that.$element);//调用property的save方法
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();//获取$("#property_id")的值
        if (!id) {//如果id为false
            that.$modal.modal("hide");//这个弹窗隐藏
        } else {//否则
            var result = confirm("确定要清除存储路径配置数据吗？");//提示
            if (!result) return;//如果取消退出函数

            that._resetData();//调用_resetData
            that.$element.val("");//给该元素值设置为空
            new Property().remove(id, "archivePath");//实例化Property调用remove方法
            that.$modal.modal("hide");//弹窗隐藏
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);//调用basicEvents
    },
    bindEvents: function () {
        var that = this;
        that.$archiveType.change(function () {//存档类型发生变化时
            var $formGroup = that.$archiveModelId.parent(),//获取模板编号的父集元素
                type = DataType.convert($(this).attr("data-type"), $(this).val());//把data-type属性和现在的值 传给datatype的convert方法
            if (type === 2) $formGroup.show();//如果type等于2 存单编号显示
            else $formGroup.hide();//否则隐藏
        });
        that.$archiveDbName.change(function(){
           
            var dbName = $(this).val(),
                tableOptions = [],
                AllDbName = JSON.parse(localStorage.getItem("AllDbName"))||{},
                $select = $("#archivePath_modal").find('[data-key="table"]');
                console.log($select)
            if(dbName){
                console.log(AllDbName,AllDbName[dbName],dbName)
                Object.keys(AllDbName[dbName]).forEach(function(item){
                    tableOptions.push({name:item,value:item})
                })
            }
            Common.fillSelect($select,{name:"请选择存档表格",value:""},tableOptions,null,true)
        })

        that.$archiveTable.change(function () {//当存单表格值发生变化
            var dbName = $("#archivePath_modal").find('[data-key="dbName"]').val(),
                AllDbName = JSON.parse(localStorage.getItem("AllDbName"))||{},
                table =$(this).val(),
                fieldsoptions = [],
                $select = $("#archivePath_modal").find('[data-key="field"]');
                if(dbName&&table){
                    AllDbName[dbName][table].tableDetail.forEach(function(item){
                        fieldsoptions.push({name:item.cname,value:item.id})
                    })
                }
                Common.fillSelect($select,{name:"请选择存档字段",value:""},fieldsoptions,null,true)
            // ModalHelper.setFieldSelect(that.$archiveField, {name: "请选择存档字段", value: ""}, table, null, true);//调用ModalHelper.setFieldSelect
        });
    }
};