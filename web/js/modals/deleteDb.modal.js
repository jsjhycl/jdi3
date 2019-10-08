/* 
数据删除模态框
*/
function DeleteDbModal($modal, $element) {
    BaseModal.call(this, $modal, $element)
    this.$querier = this.$modalBody.find(".querier");

}
DeleteDbModal.prototype = {
    initData: function (data) {
        let that = this;
        that.$querier.Db({
            type: "db",
            data: data,
            Db: AllDbName
        })

    },
    saveDate: function () {
        let that = this;
        var id = $("#property_id").val();
        if (!id) return;
        that.$querier.Db("getData")
        let $workspace = $("#workspace"),
            $control = $workspace.find("#" + id),
            data = that.$querier.Db("getData");

        that.$element.val(JSON.stringify(data));
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);
    },
    clearData: function () {},
    execute: function () {
        let that = this;
        that.basicEvents(true, that.initData, that.saveDate, that.clearData)
    }
}