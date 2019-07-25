/**
 * 条件配置
 * @param $modal
 * @param $element
 * @param mode
 * @param table
 * @constructor
 */
function ConditionsModal($modal, $element, mode, dbName,table) {
    BaseModal.call(this, $modal, $element);//调用基础模块弹窗
    this.dbName = dbName;
    this.mode = mode;
    this.table = table;
    this.$conditions = this.$modalBody.find(".conditions");//调用jdiCondition

    this._resetData = function () {
        this.$conditions.conditions("clearData");//获取元素下面的conditions设置为cleardata
    }
}

ConditionsModal.prototype = {
    initData: function (data) {
        var that = this;
        that.$conditions.conditions({//调用JDI的condition
            mode: that.mode,
            dbName:that.dbName,
            table: that.table,
            data: data
        });
    },
    saveData: function () {
        var that = this,
            result = "",
            conditions = that.$conditions.conditions("getData");//获取条件配置信息
        if (Array.isArray(conditions) && conditions.length > 0) {//如果conditions是数组且长度大于零
            result = JSON.stringify(conditions);//转换为jSON字符串
        }
        that.$element.val(result);//给元素设置值
    },
    clearData: function () {
        var result = confirm("确定要清除条件配置数据吗？");//提示是否清除
        if (!result) return;//如果为都退出函数

        var that = this;
        that._resetData();//调用_resetData
        that.$element.val("");//给元素的值设置为空
        that.$modal.modal("hide");//模态框为空
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);//调用basicEvents
    }
};