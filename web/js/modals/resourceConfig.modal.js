function ResourceConfigModal($modal) {
    BaseModal.call(this, $modal);

    this.$body = this.$modal.find(".modal-body");
}

ResourceConfigModal.prototype = {

    initData: function() {

    },

    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData);//绑定基础事件
    },
}