/**
 * 抄送值配置
 * @param $modal
 * @param $element
 * @constructor
 */
function CopyValueModal($modal, $element) {
    BaseModal.call(this, $modal, $element);

    this.$type = this.$modalBody.find('[data-key="type"]');
    this.$operator = this.$modalBody.find('[data-key="operator"]');
    // this.$expr = this.$modalBody.find('[data-key="expr"]');

    this._resetData = function () {
        var that = this;
        that.$type.val("");
        that.$operator.val("");
        // that.$expr.val("");
    };
}

CopyValueModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();

        var type, operator, expr;
        if (DataType.isObject(data)) {
            type = data.type;
            operator = data.operator;
            expr = data.expr;
        }
        ModalHelper.setSelectData(that.$type, {
            name: "请选择数据类型",
            value: ""
        }, ConditionsHelper.typeConfig, type, true);
        ModalHelper.setSelectData(that.$operator, {
            name: "请选择运算符",
            value: ""
        }, ConditionsHelper.getOperators(3), operator, true);
        // ModalHelper.setInputData(that.$expr, expr, false);
    },
    saveData: function () {
        var that = this,
            type = that.$type.val();
        if (!type) return alert("无效的数据类型！");

        var operator = that.$operator.val();
        if (!operator) return alert("无效的运算符！");

        // var expr = that.$expr.val();
        // if (!expr) return alert("无效的抄送值！");

        that.$element.val(JSON.stringify({
            type: type,
            operator: operator,
            // expr: expr
        }));
    },
    clearData: function () {
        var result = confirm("确定要清除抄送值配置数据吗？");
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

        // that.$modal.off("click");
        // that.$modal.on("click", ".btn-expr", function () {
        //     var $expr = $(this);
        //     $expr.exprGenerator({
        //         hasBrace: true,
        //         $source: $("#workspace"),
        //         $result: $expr.prev(),
        //         toolbar: [
        //             {title: "类型转换", type: "cast", data: {"数字": "数字", "字符": "字符"}, style: "cpanel-type"},
        //             {
        //                 title: "算术运算符",
        //                 type: "normal",
        //                 data: {"+": "+", "-": "-", "*": "*", "/": "/"},
        //                 style: "cpanel-operator"
        //             }
        //         ]
        //     });
        // });

        that.$modal.off("change");
        that.$modal.on("change", '[data-key="type"]', function () {
            var defaultOption = {name: "请选择运算符", value: ""},
                type = $(this).val(),
                options = ConditionsHelper.getOperators(3, type),
                operator = that.$operator.val();
            ModalHelper.setSelectData(that.$operator, defaultOption, options, operator, true);
        });
    }
};