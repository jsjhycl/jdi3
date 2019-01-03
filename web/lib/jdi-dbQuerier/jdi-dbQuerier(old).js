(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".querier_event",
        CACHE_KEY = "querier_cache";

    function DbQuerier(elements, options) {
        this.$elements = elements;
        this.options = options;
    }

    DbQuerier.prototype.constructor = DbQuerier;

    DbQuerier.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM(this);
                    that.setData(this);
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.dbQuerier.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        //渲染DOM
        renderDOM: function (element) {
            var that = this;
            $(element).empty()
                .append(that.renderTable() + that.renderFields(element) + that.renderConditions())
                .addClass("form-horizontal querier");
        },
        renderTable: function () {
            return '<div class="form-group">' +
                '<label class="col-lg-2 control-label">查询表格：</label>' +
                '<div class="col-lg-9">' +
                '<select class="form-control querier-table"></select>' +
                '</div></div>';
        },
        renderFields: function (element) {
            var cache = $.data(element, CACHE_KEY),
                fieldMode = cache.fieldMode;
            if (fieldMode === "multi") {
                return '<div class="form-group">' +
                    '<label class="col-lg-2 control-label">查询字段：</label>' +
                    '<div class="col-lg-10 querier-fields" data-name="querier_fields"></div></div>';
            } else {
                return '<div class="form-group">' +
                    '<label class="col-lg-2 control-label">显示值字段：</label>' +
                    '<div class="col-lg-10 querier-fields-show" data-name="querier_fields_show"></div>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label class="col-lg-2 control-label">实际值字段：</label>' +
                    '<div class="col-lg-10 querier-fields-real" data-name="querier_fields_real"></div>' +
                    '</div>';
            }
        },
        //这个地方可以使用jdi-conditions插件替换，暂时不处理
        renderConditions: function () {
            return '<div class="form-group">' +
                '<label class="col-lg-2 control-label">查询条件：</label>' +
                '<div class="col-lg-9">' +
                '<table class="table table-bordered table-hover table-condensed table-responsive querier-conditions">' +
                '<thead>' +
                '<tr>' +
                '<th>字段</th>' +
                '<th>类型</th>' +
                '<th>操作符</th>' +
                '<th>数据</th>' +
                '<th><button class="btn btn-primary btn-sm add">添加</button></th>' +
                '</tr>' +
                '</thead>' +
                '<tbody></tbody>' +
                '</table>' +
                '</div></div>';
        },
        //设置数据
        setData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY),
                $tableSelect = $(element).find(".querier-table"),
                $fieldsDiv = $(element).find(".querier-fields"),
                $conditionsTable = $(element).find(".querier-conditions"),
                fieldMode = cache.fieldMode,
                data = cache.data;
            if (fieldMode === "single") {
                $fieldsDiv = $(element).find(".querier-fields-show,.querier-fields-real");
            }
            that.getTables(function (tables) {
                that.setTable($tableSelect, tables, data ? data.table : null);

                var table = $tableSelect.val();
                that.getFields(table, function (fields) {
                    that.setFields($fieldsDiv, fieldMode, fields, data ? data.fields : null);
                    that.setConditions($conditionsTable, cache.conditionThead, fields, data ? data.conditions : null);
                });
            });
        },
        setTable: function ($tableSelect, tables, table) {
            if (!$tableSelect, $tableSelect.length <= 0) return;

            var defaultOption = {name: "请选择表格", value: "", id: null},
                options = Array.isArray(tables) ? tables : [];
            Common.fillSelect($tableSelect, defaultOption, options, null, true);
            if (!table) return;

            $tableSelect.val(table);
        },
        setFields: function ($fieldsDiv, fieldMode, fields, data) {
            if (!$fieldsDiv || $fieldsDiv.length <= 0) return;

            $fieldsDiv.empty();
            if (!Array.isArray(fields)) return;

            $fieldsDiv.each(function () {
                var name = $(this).attr("data-name"),
                    type = fieldMode === "multi" ? "checkbox" : "radio",
                    html = "";
                fields.forEach(function (item) {
                    html += '<label class="checkbox-inline">' +
                        '<input type="' + type + '" name="' + name + '" value="' + item.value + '">' +
                        item.name + '</label>';
                });
                $(this).append(html);
            });

            if (!data) return;
            if (fieldMode === "multi") {
                if (!Array.isArray(data)) return;
                data.forEach(function (item) {
                    $fieldsDiv.find(':input[value="' + item + '"]').prop("checked", true);
                });
            } else {
                var text = null,
                    value = null;
                if (DataType.isObject(data)) {
                    text = data.text;
                    value = data.value;
                }
                $fieldsDiv.each(function () {
                    var name = $(this).attr("data-name");
                    if (name === "querier_fields_show") {
                        if (text) {
                            $(this).find(':input[value="' + text + '"]').prop("checked", true);
                        }
                    } else {
                        if (value) {
                            $(this).find(':input[value="' + value + '"]').prop("checked", true);
                        }
                    }
                });
            }
        },
        setConditions: function ($conditionsTable, conditionThead, fields, conditions) {
            if (!$conditionsTable || $conditionsTable.length <= 0) return;

            var that = this,
                $tbody = $conditionsTable.find("tbody");
            $tbody.empty();
            that.refreshFields(conditionThead, fields);
            if (!Array.isArray(conditions)) return;

            conditions.forEach(function (item) {
                that.setTr($tbody, conditionThead, fields, item);
            });
        },
        //设置条件数据
        setTr: function ($tbody, conditionThead, fields, condition) {
            if (!$tbody || $tbody.length <= 0) return;

            var that = this,
                $tr = $("<tr></tr>");
            conditionThead.forEach(function (item) {
                var $td = $("<td></td>"),
                    $control, $expr;
                if (item.type === "select") {
                    $control = $('<select class="form-control" name="' + item.name + '"></select>');
                    var options = item.items;
                    if (item.name === "operator" && condition && condition["type"]) {
                        options = that.getOperatorsByType(condition["type"]);
                    }
                    Common.fillSelect($control, {name: "请选择" + item.text, value: ""}, options, null, true);
                } else if (item.type === "textbox") {
                    $control = $('<input class="form-control" type="text" name="' + item.name + '" value="">');
                    $expr = $('<button class="btn btn-default expr">E</button>');
                }
                if ($control) {
                    $control.val(DataType.isObject(condition) ? condition[item.name] : "");
                }
                $td.append($expr).append($control);
                $tr.append($td);
            });
            $tr.append('<td><button class="btn btn-danger remove">删除</button></td>');
            $tbody.append($tr);
            if (DataType.isObject(condition) && condition.type === "Element") {
                $tr.find(".expr").show();
            }
        },
        refreshFields: function (conditionThead, fields) {
            if (!Array.isArray(conditionThead)) return;

            for (var i = 0; i < conditionThead.length; i++) {
                var item = conditionThead[i];
                if (item.name === "field") {
                    item["items"] = fields || [];
                    break;
                }
            }
        },
        //绑定事件
        bindEvents: function (element) {
            var that = this;
            $(element).on("change" + EVENT_NAMESPACE, ".querier-table", {element: element}, function (event) {
                event.stopPropagation();
                var table = $(this).val();
                that.getFields(table, function (fields) {
                    var celement = event.data.element,
                        cache = $.data(celement, CACHE_KEY),
                        $fieldsDiv = $(celement).find(".querier-fields"),
                        $conditionsTable = $(celement).find(".querier-conditions"),
                        fieldMode = cache.fieldMode,
                        data = cache.data;
                    if (fieldMode === "single") {
                        $fieldsDiv = $(celement).find(".querier-fields-show,.querier-fields-real");
                    }
                    if (data && data.table === table) {
                        that.setFields($fieldsDiv, fieldMode, fields, data.fields);
                        that.setConditions($conditionsTable, cache.conditionThead, fields, data.conditions);
                    } else {
                        that.setFields($fieldsDiv, fieldMode, fields, null);
                        that.setConditions($conditionsTable, cache.conditionThead, fields, null);
                    }
                });
            });

            $(element).on("click" + EVENT_NAMESPACE, ".querier-conditions thead tr th .add", {element: element}, function (event) {
                event.stopPropagation();
                var celement = event.data.element,
                    $tableSelect = $(celement).find(".querier-table"),
                    table = $tableSelect.val(),
                    $tbody = $(celement).find(".querier-conditions tbody"),
                    cache = $.data(celement, CACHE_KEY);
                that.getFields(table, function (fields) {
                    that.refreshFields(cache.conditionThead, fields);
                    that.setTr($tbody, cache.conditionThead, fields, null);
                });
            });

            $(element).on("click" + EVENT_NAMESPACE, ".querier-conditions tbody tr td .remove", function (event) {
                event.stopPropagation();
                $(this).parents("tr").remove();
            });

            $(element).on("click" + EVENT_NAMESPACE, '.querier-conditions tbody tr td [name="type"]', function (event) {
                event.stopPropagation();
                var value = $(this).val(),
                    $tr = $(this).parents("tr"),
                    $expr = $tr.find(".expr");
                if (value === "Element") {
                    $expr.show();
                } else {
                    $expr.hide();
                }
                var $select = $tr.find('[name="operator"]'),
                    defaultOption = {name: "请选择运算符", value: ""},
                    options = that.getOperatorsByType(value);
                Common.fillSelect($select, defaultOption, options, null, true);
            });

            //PS：此处存在对“表达式生成器”的依赖耦合
            $(element).on("click" + EVENT_NAMESPACE, ".querier-conditions tbody tr td .expr", function (event) {
                event.stopPropagation();

                function buildArgs($expr, staticGlobal, dynamicGlobal) {
                    var global = {};
                    if (DataType.isObject(staticGlobal)) {
                        for (var key in staticGlobal) {
                            var value = staticGlobal[key];
                            global[value + "(静态)"] = "GLOBAL." + key;
                        }
                    }
                    if (DataType.isObject(dynamicGlobal)) {
                        for (var id in dynamicGlobal) {
                            var property = dynamicGlobal[id];
                            //此处过滤规则待优化
                            if (property.cname !== id) {
                                global[property.cname + "(动态)"] = "GLOBAL." + id;
                            }
                        }
                    }
                    $expr.exprGenerator({
                        $source: $("#workspace"),
                        $result: $expr.next(),
                        toolbar: [
                            {title: "类型转换", type: "cast", data: {"数字": "数字", "字符": "字符"}, style: "cpanel-type"},
                            {
                                title: "算术运算符",
                                type: "normal",
                                data: {"+": "+", "-": "-", "*": "*", "/": "/"},
                                style: "cpanel-operator"
                            },
                            {title: "全局变量", type: "normal", data: global, style: "cpanel-global"}
                        ]
                    });
                }

                var $expr = $(this),
                    commonService = new CommonService();
                $.when(commonService.getAjax("/newapi/getprozz"),
                    commonService.getAjax("/profile/global.json")).done(function (result1, result2) {
                    if (!result1 || !result2) return;

                    var data1 = result1[0],
                        data2 = result2[0];
                    if (!data1 || !data2) return;

                    var globalId = data1.status === 0 ? (data1.result ? data1.result.id : null) : null,
                        staticGlobal = data2;
                    if (globalId) {
                        commonService.getFile("/publish/" + globalId + "/property.json", function (dynamicGlobal) {
                            buildArgs($expr, staticGlobal, dynamicGlobal);
                        });
                    } else {
                        buildArgs($expr, staticGlobal, null);
                    }
                }).fail(function (err) {
                    alert("表达式生成器参数数据生成失败！");
                });
            });
        },
        //查询表格、列数据
        getTables: function (callback) {
            //此处存在对Db的依赖耦合
            new Db().getTables(false, function (tables) {
                var result = null;
                if (Array.isArray(tables)) {
                    result = tables;
                }
                if (callback) {
                    callback(result);
                }
            });
        },
        getFields: function (table, callback) {
            //此处存在对Db的依赖耦合
            new Db().getFields(table, function (fields) {
                var result = null;
                if (Array.isArray(fields)) {
                    result = fields;
                }
                if (callback) {
                    callback(result);
                }
            });
        },
        //2017-11-20补充
        getOperatorsByType: function (type) {
            var result = [
                {name: "等于", value: "="},
                {name: "不等于", value: "<>"},
                {name: "大于", value: ">"},
                {name: "小于", value: "<"},
                {name: "大于等于", value: ">="},
                {name: "小于等于", value: "<="},
                {name: "模糊匹配", value: "like"}
            ];
            if (type === "String") {
                result = [
                    {name: "等于", value: "="},
                    {name: "不等于", value: "<>"},
                    {name: "模糊匹配", value: "like"}
                ];
            } else if (type === "Int") {
                result = [
                    {name: "等于", value: "="},
                    {name: "不等于", value: "<>"},
                    {name: "大于", value: ">"},
                    {name: "小于", value: "<"},
                    {name: "大于等于", value: ">="},
                    {name: "小于等于", value: "<="}
                ];
            }
            return result;
        }
    };

    $.fn.extend({
        dbQuerier: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.dbQuerier.methods[options](this, args);
            }
            return new DbQuerier(this, options).init();
        }
    });

    $.fn.dbQuerier.defaults = {
        disabled: false,
        fieldMode: "multi",
        conditionThead: [
            {text: "字段", name: "field", type: "select", items: []},
            {
                text: "类型", name: "type", type: "select", items: [
                {name: "字符串", value: "String"},
                {name: "整形", value: "Int"},
                {name: "元素", value: "Element"},
                {name: "查询字符串", value: "QueryString"}
            ]
            },
            {
                text: "运算符", name: "operator", type: "select", items: [
                {name: "等于", value: "="},
                {name: "不等于", value: "<>"},
                {name: "大于", value: ">"},
                {name: "小于", value: "<"},
                {name: "大于等于", value: ">="},
                {name: "小于等于", value: "<="},
                {name: "模糊匹配", value: "like"}
            ]
            },
            {text: "值", name: "value", type: "textbox"}
        ],
        data: {
            table: null,
            conditions: []
        }
    };

    $.fn.dbQuerier.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).dbQuerier({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).dbQuerier({disabled: true});
            });
        },
        setData: function (elements, data) {
            return elements.each(function () {
                $(this).dbQuerier({data: data[0]});
            });
        },
        clearData: function (elements) {
            return elements.each(function () {
                $(this).dbQuerier({data: null});
            });
        },
        getData: function (elements) {
            var $querier = $(elements[0]),
                cache = $.data(elements[0], CACHE_KEY),
                table = $querier.find(".querier-table").val(),
                fields,
                conditions = [];
            //获取字段数据
            if (cache.fieldMode === "single") {
                fields = {
                    text: $querier.find(".querier-fields-show :input:checked").val(),
                    value: $querier.find(".querier-fields-real :input:checked").val()
                };
            } else {
                fields = [];
                $querier.find(".querier-fields").find(":input").each(function () {
                    if ($(this).is(":checked")) {
                        fields.push($(this).val());
                    }
                });
            }
            //获取条件数据
            $querier.find(".querier-conditions tbody tr").each(function (index, tr) {
                var obj = {};
                cache.conditionThead.forEach(function (item) {
                    var name = item.name;
                    obj[name] = $(tr).find('[name="' + name + '"]').val();
                });
                conditions.push(obj);
            });
            conditions.forEach(function (item) {
                var type = item.type,
                    value = item.value;
                if (type === "Int") {
                    value = !isNaN(Number(value)) ? Number(value) : 0;
                    item["value"] = value;
                    return true;
                }
            });
            return {
                table: table,
                fields: fields,
                conditions: conditions
            };
        }
    };
})(jQuery, window, document);