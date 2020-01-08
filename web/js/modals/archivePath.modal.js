/**
 * 存档路径配置
 * @param $modal
 * @param $element
 * @constructor
 */
function ArchivePathModal($modal, $element) {
    BaseModal.call(this, $modal, $element); //调用基础弹窗布局
    this.$archiveDbName = this.$modalBody.find('[data-key="dbName"]')
    this.$archiveType = this.$modalBody.find('[data-key="type"]'); //获取存档类型
    this.$archiveTable = this.$modalBody.find('[data-key="table"]'); //获取存档表格
    this.$archiveField = this.$modalBody.find('[data-key="field"]'); //获取存单字段
    this.$archiveModelId = this.$modalBody.find('[data-key="modelId"]'); //获取表单编号
    this.$archiveRepeat = this.$modalBody.find('[data-key="repeat"]');
    this.$archiveIncrease = this.$modalBody.find('[data-key="increase"]');
    this.$archiveFieldSplitor = this.$modalBody.find('[data-key="fieldSplit"]');
    this.$archiveFieldIndex = this.$modalBody.find('[data-key="fieldIndex"]');

    const TYPE_CONFIG = [ //定义type类型
        {
            name: "通用查询",
            value: 0
        },
        {
            name: "表格查询",
            value: 1
        },
        {
            name: "详情链接",
            value: 2
        }
    ];

    //设置存档类型的下拉框
    this._setTypeSelect = function ($typeSelect, type) {
        ModalHelper.setSelectData($typeSelect, {
            name: "请选择查询类型",
            value: ""
        }, TYPE_CONFIG, type, false); //调用ModalHelper中的setSelectData方法设置下拉抗
        var that = this,
            $formGroup = that.$archiveModelId.parent(); //获取表单编号的父集元素
        if (type === 2) $formGroup.show(); //如果type等于2给表单编号显示
        else $formGroup.hide(); //否则隐藏表单编号
    };

    this._resetData = function () {
        var that = this;
        that.$archiveType.val(0); //获取$archiveType
        Common.fillSelect(that.$archiveTable, {
            name: "请选择查询表格",
            value: ""
        }, null, null, true); //调用Common中的fillSelect
        Common.fillSelect(that.$archiveField, {
            name: "请选择查询字段",
            value: ""
        }, null, null, true); //调用Common中的fillSelect
        Common.fillSelect(that.$archiveModelId, {
            name: "请选择表单编号",
            value: ""
        }, null, null, true); //调用Common中的fillSelect
        Common.fillSelect(that.$archiveDbName, {
            name: "请选择数据库",
            value: ""
        }, null, null, null, true) //清空存档的数据库为空
        that.$archiveRepeat.prop('checked', false);
        that.$archiveIncrease.prop('checked', false);
        that.$archiveFieldSplitor.val("")
        that.$archiveFieldIndex.val("")
    };
}

ArchivePathModal.prototype = {
    initData: function (data) {
        var that = this,
            dbs = []; //获取数据库配置信息
        Object.keys(AllDbName).forEach(function (item) { //生成数据库数组
            dbs.push({
                name: item,
                value: item
            })
        })

        that._resetData(); //调用_resetData方法
        if (data) { //如果data存在
            //填充数据库下拉框
            var dbName = data.dbName, //数据库名
                table = data.table, //数据表名
                tableOptions = [], //表格下拉选项
                fieldsoptions = []; //字段下拉选项

            that._setTypeSelect(that.$archiveType, data.type); //调用_setTypeSelect
            Common.fillSelect(that.$archiveDbName, {
                name: "请选择查询数据库",
                value: ""
            }, dbs, data.dbName, true) //生成数据库下拉框填充默认选项
            if (dbName) { //如果数据库是选中的
                Object.keys(AllDbName[dbName]).forEach(function (item) { //遍历数据库下面所有的表生成，表的下拉选项
                    tableOptions.push({
                        name: AllDbName[dbName][item]["tableDesc"],
                        value: item
                    })
                })
                if (table) { //如果表存在
                    AllDbName[dbName][table] && AllDbName[dbName][table].tableDetail.forEach(function (item) { //数据库下面对应的表的字段  生成字段下拉选项

                        fieldsoptions.push({
                            name: item.cname,
                            value: item.id
                        })
                    })
                }
            }
            Common.fillSelect(that.$archiveTable, {
                name: "请选择查询表格",
                value: ""
            }, tableOptions, data.table, true) //填充存档表格下拉选项
            Common.fillSelect(that.$archiveField, {
                name: "请选择查询字段",
                value: ""
            }, fieldsoptions, data.field, true) //填充存档字段下拉选项
            that.$archiveRepeat.prop('checked', !!data.repeat)
            that.$archiveIncrease.prop('checked', !!data.increase)
            that.$archiveFieldSplitor.val(data.fieldSplit)
            that.$archiveFieldIndex.val(data.fieldIndex)

        } else {
            //填充数据库下拉框
            that._setTypeSelect(that.$archiveType, null); //调用_setTypeSelect
            Common.fillSelect(that.$archiveDbName, {
                name: "请选择查询数据库",
                value: ""
            }, dbs, null, true) //填充存档数据库下拉选项
            Common.fillSelect(that.$archiveTable, {
                name: "请选择查询表",
                value: ""
            }, null, null, true) //填充存档表格下拉选项
            Common.fillSelect(that.$archiveField, {
                name: "请选择查询字段",
                value: ""
            }, null, null, true) //填充存档字段下拉选项
            that.$archiveRepeat.prop('checked', false);
            that.$archiveIncrease.prop('checked', false);
            that.$archiveFieldSplitor.val("");
            that.$archiveFieldIndex.val("");
        }
    },
    saveData: function () {
        var id = $("#property_id").val(); //获取$("#property_id")的值
        if (!id) return; //如果没有退出函数

        if (id === "BODY") return alert("页面属性中不可以配置查询结果显示路径！"); //如果id等于BODY退出函数并提示

        var that = this,
            data = {},
            $control = $("#workspace").find("#" + id); //获取工作区中的对应id的元素
        that.$modal.find(".modal-body [data-key]").each(function () { //获取元素遍历
            var key = $(this).attr("data-key"), //获取当前元素的data-key
                type = $(this).attr("data-type"), //获取当前元素的data-type
                value = !$(this).is(':checkbox') ? $(this).val() : $(this).is(':checked'); //获取当前元素的值
            data[key] = DataType.convert(type, value); //调用DataType的convert方法
        });

        that.$element.val(JSON.stringify(data)); //给元素设置值
        new Property().save($control, that.$element); //调用property的save方法
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val(); //获取$("#property_id")的值
        if (!id) { //如果id为false
            that.$modal.modal("hide"); //这个弹窗隐藏
        } else { //否则
            var result = confirm("确定要清除存储路径配置数据吗？"); //提示
            if (!result) return; //如果取消退出函数

            that._resetData(); //调用_resetData
            that.$element.val(""); //给该元素值设置为空
            new Property().remove(id, "archivePath"); //实例化Property调用remove方法
            that.$modal.modal("hide"); //弹窗隐藏
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData); //调用basicEvents
    },
    bindEvents: function () {
        var that = this;
        that.$archiveType.change(function () { //存档类型发生变化时
            var $formGroup = that.$archiveModelId.parent(), //获取表单编号的父集元素
                type = DataType.convert($(this).attr("data-type"), $(this).val()); //把data-type属性和现在的值 传给datatype的convert方法
            if (type === 2) $formGroup.show(); //如果type等于2 存单编号显示
            else $formGroup.hide(); //否则隐藏
        });
        that.$archiveDbName.change(function () { //当存档数据库发生变化时

            var dbName = $(this).val(), //获取存档数据库名
                tableOptions = [], //声明变量下拉表格选项
                $select = $("#archivePath_modal").find('[data-key="table"]'); //获取table下拉框
            if (dbName) {
                Object.keys(AllDbName[dbName]).forEach(function (item) {
                    tableOptions.push({
                        name: AllDbName[dbName][item]["tableDesc"],
                        value: item
                    })
                })
            }
            Common.fillSelect($select, {
                name: "请选择查询表格",
                value: ""
            }, tableOptions, null, true)
        })

        that.$archiveTable.change(function () { //当存单表格值发生变化
            var dbName = $("#archivePath_modal").find('[data-key="dbName"]').val(),
                table = $(this).val(),
                fieldsoptions = [],
                $select = $("#archivePath_modal").find('[data-key="field"]');
            if (dbName && table) {
                AllDbName[dbName][table].tableDetail.forEach(function (item) {
                    fieldsoptions.push({
                        name: item.cname,
                        value: item.id
                    })
                })
            }
            Common.fillSelect($select, {
                name: "请选择查询字段",
                value: ""
            }, fieldsoptions, null, true)
        });
    }
};