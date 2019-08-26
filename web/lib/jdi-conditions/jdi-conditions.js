;(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".conditions_event",
        CACHE_KEY = "conditions_cache";

    function Conditions(elements, options) {
        this.$elements = elements;
        this.options = options;
        this.AllDbName = null;
    }

    Conditions.prototype.constructor = Conditions;

    Conditions.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.getDbData().then(() => {
                        that.renderDOM(this);
                        that.setData(this);
                        that.bindEvents(this);
                    });
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.conditions.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        getDbData: async function() {
            var data = await new FileService().readFile("./profiles/table.json");
            if (DataType.isObject(data)) this.AllDbName = data;
        },
        renderDOM: function (element) {
            var cache = $.data(element, CACHE_KEY),
                thead = cache.mode === 1 ?
                    '<th>字段</th><th>操作符</th><th>类型</th><th>数据</th>' :
                    '<th>左类型</th><th>左数值</th><th>操作符</th><th>右类型</th><th>右数值</th>',
                html = '<table class="table table-bordered table-striped table-hover ctable">' +
                    '<thead><tr>' + thead + '<th><button class="btn btn-primary btn-sm add">添加</button></th></tr>' +
                    '</thead><tbody></tbody></table>';
            $(element).empty().append(html).addClass("conditions");
        },
        setData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!DataType.isObject(cache)) return;

            var data = cache.data;
            if (!Array.isArray(data)) return;

            var $tbody = $(element).find(".table tbody");
            $tbody.empty();
            data.forEach(function (item) {
                that.setTr(cache.mode, $tbody, item, cache.table, cache.dbName, cache.noExpression, cache.reduceTypeConfig);
            });
        },
        bindEvents: function (element) {
            var that = this;

            $(element).on("click" + EVENT_NAMESPACE, ".add", {element: element}, function (event) {
                event.stopPropagation();
                var celement = event.data.element,
                    cache = $.data(celement, CACHE_KEY);
                if (!DataType.isObject(cache)) return;

                var $tbody = $(celement).find(".table tbody");
                that.setTr(cache.mode, $tbody, null, cache.table,cache.dbName, cache.noExpression, cache.reduceTypeConfig);
            });

            $(element).on("click" + EVENT_NAMESPACE, ".remove", function (event) {
                event.stopPropagation();
                $(this).parents("tr").remove();
            });

            $(element).on("click" + EVENT_NAMESPACE, '[data-key="type"],[data-key="leftType"],[data-key="rightType"]', {element: element}, function (event) {
                event.stopPropagation();

                var celement = event.data.element,
                    cache = $.data(celement, CACHE_KEY);
                if (!DataType.isObject(cache)) return;

                var value = $(this).val(),
                    $expr = $(this).parent().next().find(".btn-expr");
                if (value === "Element") $expr.show();
                else $expr.hide();

                var key = $(this).attr("data-key");
                if (key !== "rightType") {
                    var $tr = $(this).parents("tr"),
                        $operatorSelect = $tr.find('[data-key="operator"]'),
                        defaultOption = {name: "请选择运算符", value: ""},
                        options = ConditionsHelper.getOperators(cache.mode, value),
                        operator = $operatorSelect.val();
                    ModalHelper.setSelectData($operatorSelect, defaultOption, options, operator, false);
                }
            });

            $(element).on("click" + EVENT_NAMESPACE, ".btn-expr", {element: element}, function (event) {
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
                            {title: "全局变量", type: "normal", data: global, style: "cpanel-global"}
                        ]
                    });
                }

                var $expr = $(this);
                new FileService().readFile("/profiles/global.json","UTF-8",function(data) {
                    if (!data) return;
                    buildArgs($expr, data, null);
                });
            });
        },
        setTr: function (mode, $tbody, data, table,dbName, noExpression, reduceTypeConfig) {
            var that = this,
                $tr, $operatorSelect, operator;
            noExpression = !!noExpression;
            reduceTypeConfig = !!reduceTypeConfig;
            if (mode === 1) {
                $tr = $('<tr><td><select class="form-control" data-key="field"></select></td>' +
                    '<td><select class="form-control" data-key="operator"></select></td>' +
                    '<td><select class="form-control" data-key="type"></select></td>' +
                    TableHelper.buildBtnInputTd("btn-config btn-expr", "E", "value", noExpression) +
                    '<td><button class="btn btn-danger btn-sm remove">删除</button></td></tr>');
                $tbody.append($tr);

                $operatorSelect = $tr.find('[data-key="operator"]');
                var field, type, value,fieldOptions = [];
                if (DataType.isObject(data)) {
                    field = data.field;
                    operator = data.operator;
                    type = data.type;
                    value = data.value;
                }
                if(dbName && table && that.AllDbName[dbName] && that.AllDbName[dbName][table]){
                    
                    that.AllDbName[dbName][table].tableDetail.forEach(function(item){
                        fieldOptions.push({name:item.cname,value:item.id})
                    })
                }
                Common.fillSelect($tr.find('[data-key ="field"]'),{name:"请选择字段",value:""},fieldOptions,field,true)
                ModalHelper.setSelectData($operatorSelect, {
                    name: "请选择操作符",
                    value: ""
                }, ConditionsHelper.getOperators(mode), operator, false);
                
                ModalHelper.setSelectData($tr.find('[data-key="type"]'), {
                    name: "请选择类型",
                    value: ""
                }, !reduceTypeConfig ? ConditionsHelper.typeConfig : ConditionsHelper.reduceTypeConfig, type, false);
                
                ModalHelper.setInputData($tr.find('[data-key="value"]'), value, false);

            } else {
                $tr = $('<tr><td><select class="form-control" data-key="leftType"></select></td>' +
                    TableHelper.buildBtnInputTd("btn-config btn-expr", "E", "leftValue") +
                    '<td><select class="form-control" data-key="operator"></select></td>' +
                    '<td><select class="form-control" data-key="rightType"></select></td>' +
                    TableHelper.buildBtnInputTd("btn-config btn-expr", "E", "rightValue") +
                    '<td><button class="btn btn-danger btn-sm remove">删除</button></td></tr>');
                $tbody.append($tr);

                $operatorSelect = $tr.find('[data-key="operator"]');
                var leftType, leftValue, rightType, rightValue;
                if (DataType.isObject(data)) {
                    leftType = data.leftType;
                    leftValue = data.leftValue;
                    operator = data.operator;
                    rightType = data.rightType;
                    rightValue = data.rightValue;
                }
                ModalHelper.setSelectData($tr.find('[data-key="leftType"]'), {
                    name: "请选择左类型",
                    value: ""
                }, ConditionsHelper.typeConfig, leftType, false);
                ModalHelper.setInputData($tr.find('[data-key="leftValue"]'), leftValue, false);
                ModalHelper.setSelectData($operatorSelect, {
                    name: "请选择操作符",
                    value: ""
                }, ConditionsHelper.getOperators(mode), operator, false);
                ModalHelper.setSelectData($tr.find('[data-key="rightType"]'), {
                    name: "请选择右类型",
                    value: ""
                }, ConditionsHelper.typeConfig, rightType, false);
                ModalHelper.setInputData($tr.find('[data-key="rightValue"]'), rightValue, false);
            }
        }
    };

    $.fn.extend({
        conditions: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.conditions.methods[options](this, args);
            }
            return new Conditions(this, options).init();
        }
    });

    $.fn.conditions.defaults = {
        disabled: false,
        mode: 1,//mode：1或者2，模式1表示适用于数据库查询条件、抄送行条件等配置；模式2适用于触发条件配置。
        dbName:null,
        table: null,//模式1形态下的表名称
        data: null,
        onStart: function () {
        },
        onStop: function () {
        }
    };

    $.fn.conditions.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).conditions({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).conditions({disabled: true});
            });
        },
        setData: function (elements, data) {
            return elements.each(function () {
                $(this).conditions({data: data[0]});
            });
        },
        clearData: function (elements) {
            return elements.each(function () {
                $(this).conditions({data: null});
            });
        },
        getData: function (elements) {
            var felement = elements[0],
                cache = $.data(felement, CACHE_KEY);
            if (!DataType.isObject(cache)) return;

            var result = [];
            $(felement).find("tbody tr").each(function () {
                var obj = {};
                $(this).find('[data-key]').each(function () {
                    var key = $(this).attr("data-key");
                    obj[key] = $(this).val();
                    console.log(obj, obj[key])
                });
                result.push(obj);
            });
            if (cache.mode === 1) {
                result.forEach(function (item) {
                    var type = item.type,
                        value = item.value;
                    if (type === "Number") {
                        value = !isNaN(Number(value)) ? Number(value) : 0;
                        item["value"] = value;
                        return true;
                    }
                });
            } else {
                result.forEach(function (item) {
                    var leftType = item.leftType,
                        leftValue = item.leftValue,
                        rightType = item.rightType,
                        rightValue = item.rightValue;
                    if (leftType === "Number") {
                        leftValue = !isNaN(Number(leftValue)) ? Number(leftValue) : 0;
                        item["leftValue"] = leftValue;
                    }
                    if (rightType === "Number") {
                        rightValue = !isNaN(Number(rightValue)) ? Number(rightValue) : 0;
                        item["rightValue"] = rightValue;
                    }
                    return true;
                });
            }
            console.log(result)
            return result;
        }
    };
})(jQuery, window, document);