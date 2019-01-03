/**
 * 存档路径配置
 * @param $modal
 * @param $element
 * @constructor
 */
function ArchivePathModal($modal, $element) {
    BaseModal.call(this, $modal, $element);

    this.$archiveType = this.$modalBody.find('[data-key="type"]');
    this.$archiveTable = this.$modalBody.find('[data-key="table"]');
    this.$archiveField = this.$modalBody.find('[data-key="field"]');
    this.$archiveModelId = this.$modalBody.find('[data-key="modelId"]');

    const TYPE_CONFIG = [
        {name: "通用查询", value: 0},
        {name: "表格查询", value: 1},
        {name: "详情链接", value: 2}
    ];

    //设置存档类型
    this._setTypeSelect = function ($typeSelect, type) {
        ModalHelper.setSelectData($typeSelect, {name: "请选择存档类型", value: ""}, TYPE_CONFIG, type, false);
        var that = this,
            $formGroup = that.$archiveModelId.parent();
        if (type === 2) $formGroup.show();
        else $formGroup.hide();
    };

    //设置模板编号
    this._setModelIdSelect = function ($modelIdSelect, modelId) {
        if (!$modelIdSelect || $modelIdSelect.length <= 0) return;
        new ProductService().list("模型", 40, function (result) {
            Common.handleResult(result, function (data) {
                var defaultOption = {name: "请选择模板编号", value: ""},
                    options = Array.isArray(data) ? data.map(function (item) {
                        return {name: item.name, value: item.id};
                    }) : [];
                Common.fillSelect($modelIdSelect, defaultOption, options, null, true);
                if (modelId) {
                    $modelIdSelect.val(modelId);
                }
            });
        });
    };

    this._resetData = function () {
        var that = this;
        that.$archiveType.val(0);
        Common.fillSelect(that.$archiveTable, {name: "请选择存档表格", value: ""}, null, null, true);
        Common.fillSelect(that.$archiveField, {name: "请选择存档字段", value: ""}, null, null, true);
        Common.fillSelect(that.$archiveModelId, {name: "请选择模板编号", value: ""}, null, null, true);
    };
}

ArchivePathModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();
        if (data) {
            that._setTypeSelect(that.$archiveType, data.type);
            ModalHelper.setTableSelect(false, that.$archiveTable, {name: "请选择存档表格", value: ""}, data.table, true);
            ModalHelper.setFieldSelect(that.$archiveField, {name: "请选择存档字段", value: ""}, data.table, data.field, true);
            that._setModelIdSelect(that.$archiveModelId, data.modelId);
        } else {
            that._setTypeSelect(that.$archiveType, null);
            ModalHelper.setTableSelect(false, that.$archiveTable, {name: "请选择存档表格", value: ""}, null, true);
            ModalHelper.setFieldSelect(that.$archiveField, {name: "请选择存档字段", value: ""}, null, null, true);
            that._setModelIdSelect(that.$archiveModelId, null);
        }
    },
    saveData: function () {
        var id = $("#property_id").val();
        if (!id) return;

        if (id === "BODY") return alert("页面属性中不可以配置存档路径！");

        var that = this,
            data = {},
            $control = $("#workspace").find("#" + id);
        that.$modal.find(".modal-body .form-control").each(function () {
            var key = $(this).attr("data-key"),
                type = $(this).attr("data-type"),
                value = $(this).val();
            data[key] = DataType.convert(type, value);
        });
        that.$element.val(JSON.stringify(data));
        new Property().save($control, that.$element);
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            var result = confirm("确定要清除存储路径配置数据吗？");
            if (!result) return;

            that._resetData();
            that.$element.val("");
            new Property().remove(id, "archivePath");
            that.$modal.modal("hide");
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    },
    bindEvents: function () {
        var that = this;
        that.$archiveType.change(function () {
            var $formGroup = that.$archiveModelId.parent(),
                type = DataType.convert($(this).attr("data-type"), $(this).val());
            if (type === 2) $formGroup.show();
            else $formGroup.hide();
        });
        that.$archiveTable.change(function () {
            var table = $(this).val();
            ModalHelper.setFieldSelect(that.$archiveField, {name: "请选择存档字段", value: ""}, table, null, true);
        });
    }
};