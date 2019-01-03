/**
 * 页面配置
 * @param $modal
 * @constructor
 */
function PageModal($modal) {
    BaseModal.call(this, $modal, null);

    this.$querier = this.$modalBody.find(".querier");

    const BODY = "BODY";
}

PageModal.prototype = {
    initData: function () {
        var that = this;
        that.$querier.dbQuerier({
            fieldMode: "multi",
            data: new Property().getValue(BODY, "dataSource.db")
        });
    },
    saveData: function () {
        var that = this,
            data = that.$querier.dbQuerier("getData");
        new Property().setValue(BODY, "dataSource.db", data);
    },
    clearData: function () {
        var result = confirm("确定要清除页面属性配置数据吗？");
        if (!result) return;

        var that = this;
        that.$querier.dbQuerier("clearData");
        new Property().remove(BODY, "dataSource.db");
        that.$modal.modal("hide");
    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, that.saveData, that.clearData);
    }
};