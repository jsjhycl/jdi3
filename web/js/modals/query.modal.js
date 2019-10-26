/**
 * 数据库查询配置
 * @param $modal
 * @param $element
 * @constructor
 */
function DbQueryModal($modal, $element) {
    BaseModal.call(this, $modal, $element);

    this.$typeSelect = this.$modalBody.find('[data-key="type"]');
    this.$querier = this.$modalBody.find(".querier");

    this._resetData = function () {
        this.$typeSelect.val("");
    };
}

DbQueryModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();

        var queryData = null;
        if (DataType.isObject(data)) {
            queryData = {
                dbName: data.dbName,
                table: data.table,
                fields: data.fields,
                conditions: data.conditions,
                queryTime: data.queryTime,
                renderTable: data.renderTable
            };
            var type = data.type || "";
            if (type) {
                that.$typeSelect.val(type);
            }
        }
        that.$querier.dbQuerier({
            fieldMode: "multi",
            data: queryData,
            renderTable: true,
        }).then(function() {
            if (data && data.type === "foldmenu") {
                that.$querier.find('.form-group').eq(1).nextAll().hide();
            }
        })
    },
    saveData: function () {
        var id = $("#property_id").val();
        if (!id) return;

        var that = this,
            result = that.$querier.dbQuerier("getData"),
            data = {
                type: that.$typeSelect.val(),
                dbName: result.dbName,
                table: result.table,
                fields: result.fields,
                conditions: result.conditions,
                queryTime: result.queryTime,
                renderTable: result.renderTable
            },
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
            var result = confirm("确定要清除数据库查询配置数据吗？");
            if (!result) return;

            that._resetData();
            that.$querier.dbQuerier("clearData");
            that.$element.val("");
            new Property().remove(id, "query.db");
            that.$modal.modal("hide");
        }
    },
    bindEvents: function () {
        var that = this;

        //  切换查询类型
        that.$modal.on('change', '.modal-body [data-key="type"]', function() {
            if ($(this).val() === "foldmenu") {
                that.$querier.find('.form-group').eq(1).nextAll().hide();
            } else {
                that.$querier.find('.form-group').eq(1).nextAll().show();
            }
        })
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    }
};