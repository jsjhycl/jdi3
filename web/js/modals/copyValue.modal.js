/**
 * 抄送值配置
 * @param $modal
 * @param $element
 * @constructor
 */
function CopyValueModal($modal, $element) {
    BaseModal.call(this, $modal, $element);//调用基础弹窗

    this.$type = this.$modalBody.find('[data-key="type"]');//获取抄送值的数据类型
    this.$operator = this.$modalBody.find('[data-key="operator"]');//获取抄送值的运算符
    // this.$expr = this.$modalBody.find('[data-key="expr"]');

    this._resetData = function () {
        var that = this;
        that.$type.val("");//数据类型置空
        that.$operator.val("");//运算符置空
        // that.$expr.val("");
    };
}

CopyValueModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();//调用_resetData()

        var type, operator, expr;//定义变量
        if (DataType.isObject(data)) {//判断data是不是object对象
            type = data.type;//赋值数据类型
            operator = data.operator;//赋值运算符
            expr = data.expr;//赋值表达式
        }
        ModalHelper.setSelectData(that.$type, {//调用ModalHelper的setSelectData
            name: "请选择数据类型",
            value: ""
        }, ConditionsHelper.typeConfig, type, true);
        ModalHelper.setSelectData(that.$operator, {//调用ModalHelper的setSelectData
            name: "请选择运算符",
            value: ""
        }, ConditionsHelper.getOperators(3), operator, true);
        // ModalHelper.setInputData(that.$expr, expr, false);
    },
    saveData: function () {
        var that = this,
            type = that.$type.val();//获取数据类型
        if (!type) return alert("无效的数据类型！");//如果数据类型为空退出函数

        var operator = that.$operator.val();//获取运算符
        if (!operator) return alert("无效的运算符！");//如果运算符为空跳出函数

        // var expr = that.$expr.val();
        // if (!expr) return alert("无效的抄送值！");

        that.$element.val(JSON.stringify({//给$element赋值
            type: type,
            operator: operator,
            // expr: expr
        }));
    },
    clearData: function () {
        var result = confirm("确定要清除抄送值配置数据吗？");//提示时候清除
        if (!result) return;//取消则退出函数

        var that = this;
        that._resetData();//执行_resetData
        that.$element.val("");//$element设置为空
        that.$modal.modal("hide");//隐藏弹窗
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);//绑定basicEvents
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

        that.$modal.off("change");//移除弹窗的change事件
        that.$modal.on("change", '[data-key="type"]', function () {//当数据类型发生改变时
            var defaultOption = {name: "请选择运算符", value: ""},//设置defaultOption
                type = $(this).val(),//获取数据类型
                options = ConditionsHelper.getOperators(3, type),//调用ConditionsHelper的getOperators
                operator = that.$operator.val();//获取运算符的所有值
            ModalHelper.setSelectData(that.$operator, defaultOption, options, operator, true);//调用ModalHelper的setSelectData
        });
    }
};