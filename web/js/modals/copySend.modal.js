/**
 * 抄送配置
 * @param $modal
 * @param $element
 * @constructor
 */
function CopySendModal($modal, $element) {
    BaseModal.call(this, $modal, $element);

    this.$tbody = this.$modalBody.find(".table tbody");

    const STATE_CONFIG = [
        {name: "启用", value: 1},
        {name: "禁用", value: 0}
    ];

    this._resetData = function () {
        this.$tbody.empty();
    };

    this._addItem = function (data) {
        var that = this,
            $tr = $('<tr>' + TableHelper.buildBtnInputTd("btn-config btn-element", "E", "element") +
                '<td><select class="form-control" data-key="state"></select></td>' +
                '<td><select class="form-control" data-key="table"></select></td>' +
                '<td><select class="form-control" data-key="field"></select></td>' +
                TableHelper.buildBtnInputTd("btn-config btn-conditions", null, "conditions") +
                TableHelper.buildBtnInputTd("btn-config btn-value", null, "value") +
                '<td><button class="btn btn-danger btn-sm remove">删除</button></td></tr>');
        that.$tbody.append($tr);

        var element, state, table, field, conditions, value;
        if (DataType.isObject(data)) {
            element = data.element;
            state = data.state;
            table = data.table;
            field = data.field;
            conditions = data.conditions;
            value = data.value;
        }
        ModalHelper.setInputData($tr.find('[data-key="element"]'), element, false);
        ModalHelper.setSelectData($tr.find('[data-key="state"]'), null, STATE_CONFIG, state, false);
        ModalHelper.setTableSelect(true, $tr.find('[data-key="table"]'), {name: "请选择抄送表", value: ""}, table, true);
        ModalHelper.setFieldSelect($tr.find('[data-key="field"]'), {name: "请选择抄送列", value: ""}, table, field, true);
        ModalHelper.setInputData($tr.find('[data-key="conditions"]'), conditions, true);
        ModalHelper.setInputData($tr.find('[data-key="value"]'), value, true);
    };

    this._removeItem = function ($tr) {
        $tr.remove();
    };
}

CopySendModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();
        if (!Array.isArray(data)) return;

        data.forEach(function (item) {
            that._addItem(item);
        });
    },
    saveData: function () {
        var that = this,
            result = [];
        that.$modalBody.find("tr").each(function () {
            var element = $(this).find('[data-key="element"]').val(),
                state = $(this).find('[data-key="state"]').val(),
                table = $(this).find('[data-key="table"]').val(),
                field = $(this).find('[data-key="field"]').val(),
                conditions = $(this).find('[data-key="conditions"]').val() || null,
                value = $(this).find('[data-key="value"]').val() || null;
            if (state !== "1") return true;

            result.push({
                element: element,
                state: 1,
                table: table,
                field: field,
                conditions: Common.parseData(conditions),
                value: Common.parseData(value)
            });
        });
        if (result.length > 0) {
            that.$element.val(JSON.stringify(result));
        }
    },
    clearData: function () {
        var result = confirm("确定要清除抄送配置数据吗？");
        if (!result) return;

        var that = this;
        that._resetData();
        that.$element.val("");
        that.$modal.modal("hide");
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    },
    bindEvents: function () {
        var that = this;
        that.$modal.off("click");
        //添加
        that.$modal.on("click", ".add", function () {
            that._addItem(null);
        });
        //删除
        that.$modal.on("click", ".remove", function () {
            that._removeItem($(this).parents("tr"));
        });
        //抄送元素
        that.$modal.on("click", ".btn-element", function () {
            var $expr = $(this);
            $expr.exprGenerator({
                hasBrace: false,
                $source: $("#workspace"),
                $result: $expr.next(),
                toolbar: [
                    {title: "类型转换", type: "cast", data: {"数字": "数字", "字符": "字符"}, style: "cpanel-type"},
                    {
                        title: "算术运算符",
                        type: "normal",
                        data: {"+": "+", "-": "-", "*": "*", "/": "/"},
                        style: "cpanel-operator"
                    }
                ]
            });
        });
        //抄送行
        that.$modal.on("click", ".btn-conditions", function () {
            var $conditionsModal = $("#conditionsModal"),
                $element = $(this).next(),
                table = $(this).parents("tr").find('[data-key="table"]').val();
            var conditionsModal = new ConditionsModal($conditionsModal, $element, 1, table);
            conditionsModal.execute();
            $conditionsModal.modal("show");
        });
        //抄送值
        that.$modal.on("click", ".btn-value", function () {
            var $copyValueModal = $("#copyValueModal"),
                $element = $(this).next();
            var copyValueModal = new CopyValueModal($copyValueModal, $element);
            copyValueModal.execute();
            copyValueModal.bindEvents();
            $copyValueModal.modal("show");
        });

        that.$modal.off("change");
        //抄送状态
        that.$modal.on("click", '[data-key="state"]', function () {
            var $inputs = $(this).parents("tr").find(":input,select").not($(this)),
                state = $(this).val();
            $inputs.prop("disabled", state !== "1");
        });
        //抄送表
        that.$modal.on("change", '[data-key="table"]', function () {
            var $fieldSelect = $(this).parents("tr").find('[data-key="field"]'),
                table = $(this).val();
            ModalHelper.setFieldSelect($fieldSelect, {name: "请选择抄送列", value: ""}, table, null, true);
        });
    }
};