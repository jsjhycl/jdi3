/**
 * 另存为
 */
function SaveAsModal($modal) {
    BaseModal.call(this, $modal, null)
    this.saveAsName = this.$modalBody.find('[data-key="name"]')
    this.$workspace = $("#workspce");

}
SaveAsModal.prototype = {
    initData:function(){
        var that = this;
        name = that.$workspace.attr("data-name")
        type = that.$workspace.attr("data-type")
        
    },
    saveData: function () {
        console.log("保存")
    },
    clearData: function () {
        console.log("清除")
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData)
    },
    bindEvents: function () {

    }
}