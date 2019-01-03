/**
 * 条件配置
 * @param $modal
 * @param $element
 * @param mode
 * @param table
 * @constructor
 */
function ConditionsModal($modal, $element, mode, table) {
    BaseModal.call(this, $modal, $element);

    this.mode = mode;
    this.table = table;
    this.$conditions = this.$modalBody.find(".conditions");

    this._resetData = function () {
        this.$conditions.conditions("clearData");
    };
}

ConditionsModal.prototype = {
    initData: function (data) {
        var that = this;
        that.$conditions.conditions({
            mode: that.mode,
            table: that.table,
            data: data
        });
    },
    saveData: function () {
        var that = this,
            result = "",
            conditions = that.$conditions.conditions("getData");
        if (Array.isArray(conditions) && conditions.length > 0) {
            result = JSON.stringify(conditions);
        }
        that.$element.val(result);
    },
    clearData: function () {
        var result = confirm("确定要清除条件配置数据吗？");
        if (!result) return;

        var that = this;
        that._resetData();
        that.$element.val("");
        that.$modal.modal("hide");
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    }
};