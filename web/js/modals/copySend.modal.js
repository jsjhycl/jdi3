/**
 * 抄送配置
 * @param $modal
 * @param $element
 * @constructor
 */
function CopySendModal($modal, $element) {
    BaseModal.call(this, $modal, $element); //调用基础模态框事件

    this.$topTBody = this.$modalBody.find(".copySendTop table tbody");
    this.$tbody = this.$modalBody.find(".copySendBottom table tbody"); //获取元素下面的table下面的tbody

    // 库选择器填充
    this._filldbName = function () {
        var that = this;
        var AllDbName = JSON.parse(localStorage.getItem("AllDbName")) || {},
            dbNames = [];

        Object.keys(AllDbName).forEach(function (item) {
            dbNames.push({
                name: item,
                value: item
            })
        })
        Common.fillSelect(that.$modal.find(".copySendTop").find('[data-key="dbName"]'), {
            name: "请选择数据库",
            value: ""
        }, dbNames, '', true);
        Common.fillSelect(that.$modal.find(".copySendTop").find('[data-key="tableName"]'), {
            name: "请选择表",
            value: ""
        }, [], '', true);
    }

    // 表选择器填充
    this._fillTableName = function (dbName) {
        if (!dbName) return;
        var that = this;
        var AllDbName = JSON.parse(localStorage.getItem("AllDbName")) || {},
            tableNames = [];

        Object.keys(AllDbName[dbName]).forEach(function (item) {
            tableNames.push({
                name: item,
                value: item
            })
        })
        Common.fillSelect(that.$modal.find(".copySendTop").find('[data-key="tableName"]'), {
            name: "请选择表",
            value: ""
        }, tableNames, '', true); //调用ModalHelper中的setInputData方法
    }

    //清空下层表格的tbody
    this._resetData = function () { //
        this.$tbody.empty(); //把元素所有内容设置为空
    };

    //清空上层表格的tbody
    this._resetTopData = function () {
        this.$topTBody.empty();
    }

    //清空当前行
    this._removeItem = function ($tr) {
        $tr.remove();
    }

    // 填充当前行
    this._addItem = function (data) {
        var that = this;
        if (!DataType.isObject(data))
            return;
        var $tr = $('<tr>' +
            '<td><input class="form-control" data-key="maps" type="text"></td>' +
            '<td><input class="form-control" data-key="dbName" type="text"></td>' +
            '<td><input class="form-control" data-key="tableName" type="text"></td>' +
            '<td><input class="form-control" data-key="conditions" type="text"></td>' +
            '<td><input class="form-control" data-key="value" type="text"></td>' +
            '<td><button class="btn btn-danger btn-sm remove">删除</button></td>' +
            '</tr>');
        that.$tbody.append($tr);
        ModalHelper.setInputData($tr.find('[data-key="maps"]'), data.maps, true);
        ModalHelper.setInputData($tr.find('[data-key="dbName"]'), data.dbName, false);
        ModalHelper.setInputData($tr.find('[data-key="tableName"]'), data.tableName, false);
        ModalHelper.setInputData($tr.find('[data-key="conditions"]'), data.conditions, true);
        ModalHelper.setInputData($tr.find('[data-key="value"]'), data.value, true);
    }

    // 填充上层数据
    this._setTopData = function (dbName, tableName) {
        var AllDbName = JSON.parse(localStorage.getItem("AllDbName")) || {},
            that = this;
        that.$topTBody.empty();
        if (dbName && tableName) {
            AllDbName[dbName][tableName].tableDetail.forEach(function (item) {
                var $tr = $('<tr>' + TableHelper.buildBtnInputTd("btn-config btn-element", "E", "element") +
                    '<td><input class="form-control" data-key="field" type="text" value="' + item.cname + '(' + item.id + ')"></td>' +
                    '<td><select class="form-control" data-key="fieldSplit"></select></td>' +
                    '<td><button class="btn btn-danger btn-sm remove">删除</button></td></tr>');
                var fieldSplits = [];
                for (var i = 1; i <= item.fieldSplit; i++) {
                    fieldSplits.push({
                        name: "插入",
                        value: i
                    })
                }
                Common.fillSelect($tr.find('[data-key="fieldSplit"]'), {
                    name: "请选择抄送字段",
                    value: ""
                }, fieldSplits, null, true);
                that.$topTBody.append($tr);
            })
        }

    }

    // 获取上层数据
    this._saveTopData = function () {
        var that = this,
            result = {
                maps: [],
                dbName: that.$modalBody.find(".copySendTop").find('[data-key="dbName"]').val(),
                tableName: that.$modalBody.find(".copySendTop").find('[data-key="tableName"]').val(),
                conditions: that.$modalBody.find(".copySendTop").find('[data-key="conditions"]').val(),
                value: that.$modalBody.find(".copySendTop").find('[data-key="value"]').val()
            };
        // if (!result.conditions || !result.value)
        //     return alert("请填写抄送条件和抄送值");
        that.$topTBody.find("tr").each(function () {
            var element = $(this).find('[data-key="element"]').val(), //获取抄送元素的值
                field = $(this).find('[data-key="field"]').val(), //获取抄送列
                fieldSplit = $(this).find('[data-key="fieldSplit"]').val(); //获取抄送字段
            if (!element) return true;
            result.maps.push({
                element: element,
                field: field,
                fieldSplit: Number(fieldSplit)
            })
        })
        if (result.maps.length > 0)
            that._addItem(result);
    }
}

CopySendModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData(); //调用_resetData
        that._resetTopData();
        that._filldbName();
        if (!Array.isArray(data)) return; //如果data不是数组退出函数

        data.forEach(function (item) { //遍历data
            that._addItem(item); //调用_addItem
        });
        $('#copySendPanel').collapse('show');
    },
    saveData: function () {
        var that = this,
            result = [];
        that.$tbody.find("tr").each(function () { //遍历弹窗中的tr
            var maps = $(this).find('[data-key="maps"]').val(),
                dbName = $(this).find('[data-key="dbName"]').val(),
                tableName = $(this).find('[data-key="tableName"]').val(),
                conditions = $(this).find('[data-key="conditions"]').val() || null, //获取抄送行
                value = $(this).find('[data-key="value"]').val() || null; //获取抄送值

            result.push({ //向数组中添加结果
                maps: Common.parseData(maps),
                dbName: dbName,
                tableName: tableName,
                conditions: Common.parseData(conditions),
                value: Common.parseData(value)
            });
        });
        if (result.length > 0) { //如果result的长度大于零
            that.$element.val(JSON.stringify(result)); //把result转换为jSON
        }
    },
    clearData: function () {
        var result = confirm("确定要清除抄送配置数据吗？"); //提示否修改抄送 配置
        if (!result) return; //如果取消退出函数

        var that = this;
        that._resetData(); //调用_resetData
        that.$element.val(""); //元素的值设置为空
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData); //绑定基础事件
    },
    bindEvents: function () {
        var that = this;
        that.$modal.off("click"); //移除事件
        that.$modal.off("change");

        that.$modal.find(".copySendTop").on("change", '[data-key="dbName"]', function () {
            that._fillTableName($(this).val());
        })

        that.$modal.find(".copySendTop").on("click", ".btn-conditions", function () {
            var $conditionsModal = $("#conditionsModal"), //获取条件配置模态框
                $element = $(this).next(), //获取输入框
                table = $(this).parents("tr").find('[data-key="table"]').val(); //获取抄送表的值
            var conditionsModal = new ConditionsModal($conditionsModal, $element, 1, table); //实例化ConditionsModal
            conditionsModal.execute(); //调用execute
            $conditionsModal.modal("show"); //弹窗显示
        });

        that.$modal.find(".copySendTop").on("click", ".btn-value", function () { //抄送值按钮点击
            var $copyValueModal = $("#copyValueModal"), //获取抄送值弹窗
                $element = $(this).next(); //获取抄送值的输入框
            var copyValueModal = new CopyValueModal($copyValueModal, $element); //实例化抄送值的弹窗
            copyValueModal.execute(); //调用execute
            copyValueModal.bindEvents(); //调用bindEvents
            $copyValueModal.modal("show"); //弹窗显示
        });

        that.$modal.find(".copySendTop").on('click', ".btn-search", function () {
            that._setTopData(that.$modal.find(".copySendTop").find('[data-key="dbName"]').val(), that.$modal.find(".copySendTop").find('[data-key="tableName"]').val())
        })

        //抄送元素
        that.$modal.find(".copySendTop").on("click", ".btn-element", function () {
            var $expr = $(this);
            $expr.exprGenerator({ //调用exprGenerator并传入参数
                hasBrace: false,
                $source: $("#workspace"),
                $result: $expr.next(),
                toolbar: [{
                        title: "类型转换",
                        type: "cast",
                        data: {
                            "数字": "数字",
                            "字符": "字符"
                        },
                        style: "cpanel-type"
                    },
                    {
                        title: "算术运算符",
                        type: "normal",
                        data: {
                            "+": "+",
                            "-": "-",
                            "*": "*",
                            "/": "/"
                        },
                        style: "cpanel-operator"
                    }
                ]
            });
        });

        that.$modal.find(".copySendTop").on("click", ".btn-add", function () {
            that._saveTopData();
        })

        that.$modal.find(".copySendTop").on("click", ".btn-collapse", function () {
            that.$modal.find(".copySendTop a").click();
            if ($(this).children().hasClass("glyphicon-chevron-up"))
                $(this).children().removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down")
            else
                $(this).children().removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up")
        })
    }
}