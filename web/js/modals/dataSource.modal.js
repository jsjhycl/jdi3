/**
 * 静态数据源配置
 * @param $modal
 * @param $element
 * @constructor
 */
function StaticDataSourceModal($modal, $element) {
    BaseModal.call(this, $modal, $element);

    this.$static = this.$modalBody.find("textarea");

    this._resetData = function () {
        this.$static.val("");
    };
}

StaticDataSourceModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();
        if (DataType.isString(data)) {
            that.$static.val(data);
        }
    },
    saveData: function () {
        var id = $("#property_id").val();
        if (!id) return;

        var that = this,
            data = that.$static.val(),
            $workspace = $("#workspace"),
            $control = $workspace.find("#" + id);
        that.$element.val(data);
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            var result = confirm("确定要清除静态数据源配置数据吗？");
            if (!result) return;

            that._resetData();
            that.$element.val("");
            new Property().remove(id, "dataSource.static");
            that.$modal.modal("hide");
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(false, that.initData, that.saveData, that.clearData);
    }
};


/**
 * 数据库数据源配置
 * @param $modal
 * @param $element
 * @constructor
 */
function DbDataSourceModal($modal, $element) {
    BaseModal.call(this, $modal, $element);

    this.$querier = this.$modalBody.find(".querier");
}

DbDataSourceModal.prototype = {
    initData: function (data) {
        var that = this;
        that.$querier.dbQuerier({
            fieldMode: "single",
            data: data
        });
    },
    saveData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) return;

        var data = that.$querier.dbQuerier("getData"),
            $workspace = $("#workspace"),
            $control = $workspace.find("#" + id);
        that.$element.val(JSON.stringify(data));
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            var result = confirm("确定要清除数据库数据源配置数据吗？");
            if (!result) return;

            that.$querier.dbQuerier("clearData");
            that.$element.val("");
            new Property().remove(id, "dataSource.db");
            that.$modal.modal("hide");
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    }
};