(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".querier_event",
        CACHE_KEY = "querier_cache";

    function DbQuerier(elements, options) {
        this.$elements = elements;
        this.options = options;
        this.AllDbName = {};
    }

    DbQuerier.prototype.constructor = DbQuerier;

    DbQuerier.prototype = {
        init: async function () {
            var that = this;
            // that.AllDbName = await new FileService().readFile("/profiles/table.json")
            that.AllDbName = await new BuildTableJson().get()
            that.AllDbName = new BuildTableJson().removeData(that.AllDbName)
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
            var that = this,
                cache = $.data(element, CACHE_KEY),
                noTimeQuery = !!cache.noTimeQuery,
                renderTable = !cache.renderTable,
                isSm = !!cache.isSm,
                labelClass = isSm ? "col-sm-12 text-left" : "col-lg-2",
                inputClass = isSm ? "col-lg-12" : "col-lg-9",
                isColumn = cache.fieldMode === 'column',
                tableHtml = '<div class="form-group">' +
                `<label class="${labelClass} control-label">查询数据库：</label>` +
                `<div class="${inputClass}"><select class="form-control querier-dbName"></select></div>` +
                '</div>' +
                '<div class="form-group">' +
                `<label class="${labelClass} control-label">查询表格：</label>` +
                `<div class="${inputClass}"><select class="form-control querier-table"></select></div>` +
                '</div>',
                querierRate = !noTimeQuery ? '<div class="form-group">' +
                `<label class="${labelClass} control-label">查询频率/秒：</label>` +
                '<div class="col-lg-3"><input class="form-control" data-name="query_time" placeHolder="根据查询频率进行数据查询" /></div>' +
                '</div>' : "",
                conditionsHtml = !isColumn ? '<div class="form-group">' +
                `<label class="${labelClass} control-label">查询条件：</label>` +
                `<div class="${inputClass} querier-conditions"></div>` +
                '</div>' : '';
            $(element).empty().append(tableHtml + querierRate + that.renderFields(element) + conditionsHtml).addClass("form-horizontal querier");
        },
        renderFields: function (element) {
            var cache = $.data(element, CACHE_KEY),
                fieldMode = cache.fieldMode,
                isSm = !!cache.isSm;
            if (fieldMode === "multi") {
                return '<div class="form-group">' +
                    `<label class="${isSm ? "col-sm-12 text-left" : "col-lg-2"} control-label">查询字段：<input class="check-all" type="checkbox"></label>` +
                    `<div class="${isSm ? "col-sm-12" : "col-lg-10"} querier-fields" data-name="querier_fields"></div>` +
                    '</div>';
            } else if (fieldMode === 'single') {
                return '<div class="form-group">' +
                    '<label class="col-lg-2 control-label">显示值字段：</label>' +
                    '<div class="col-lg-10 querier-fields-show" data-name="querier_fields_show"></div>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label class="col-lg-2 control-label">实际值字段：</label>' +
                    '<div class="col-lg-10 querier-fields-real" data-name="querier_fields_real"></div>' +
                    '</div>';
            } else if (fieldMode === 'column') {
                return '<div class="form-group">' +
                    `<label class="${isSm ? "col-sm-12 text-left" : "col-lg-2"} control-label">列名：</label>` +
                    `<div class="${isSm ? "col-sm-12" : "col-lg-2"} querier-fields-column" data-name="querier_fields_column"></div>` +
                    '</div>'
            }
        },
        //设置数据
        setData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY),
                $querierDbName = $(element).find(".querier-dbName"),
                $querierTable = $(element).find(".querier-table"),
                $querierFields = $(element).find(".querier-fields"),
                $querierConditions = $(element).find(".querier-conditions"),
                $queryTime = $(element).find('[data-name="query_time"]'),
                fieldMode = cache.fieldMode,
                noExpression = !!cache.noExpression,
                reduceTypeConfig = !!cache.reduceTypeConfig,
                queryCondition = cache.queryCondition,
                data = cache.data;
            if (fieldMode === "single") {
                $querierFields = $(element).find(".querier-fields-show,.querier-fields-real");
            } else if (fieldMode === 'column') {
                $querierFields = $(element).find(".querier-fields-column");
            };

            var dbName, table, fields, conditions, queryTime;
            if (DataType.isObject(data)) {
                dbName = data.dbName;
                table = data.table;
                fields = data.fields;
                conditions = data.conditions;
                queryTime = data.queryTime;
            }
            var AllDbName = that.AllDbName,
                dbOptions = [],
                tableOptions = [],
                fieldsoptions = [];
            Object.keys(AllDbName).forEach(function (item) {
                dbOptions.push({
                    name: item,
                    value: item
                })
            })
            Common.fillSelect($querierDbName, {
                name: "请选择数据库",
                value: ""
            }, dbOptions, dbName, true)
            if (dbName && AllDbName[dbName]) {
                Object.keys(AllDbName[dbName]).forEach(function (item) {
                    (AllDbName[dbName][item].key !== 0 && AllDbName[dbName][item].key !== 1) && tableOptions.push({
                        name: AllDbName[dbName][item]["tableDesc"],
                        value: item
                    })
                })
                if (table) {
                    AllDbName[dbName][table] && AllDbName[dbName][table].tableDetail.forEach(function (item) {
                        fieldsoptions.push({
                            name: item.cname,
                            value: item.id
                        })
                    });
                }
            }
            Common.fillSelect($querierTable, {
                name: "请选择表",
                value: ""
            }, tableOptions, table, true)
            that.setFields($querierFields, fieldMode, fieldsoptions, fields);
            $querierConditions.conditions({
                mode: 1,
                dbName: dbName,
                table: table,
                data: conditions,
                noExpression: noExpression,
                reduceTypeConfig: reduceTypeConfig,
                queryCondition: queryCondition,
            });
            $queryTime.val(queryTime || "");
        },
        setFields: function ($fieldsDiv, fieldMode, fields, data) {
            if (!$fieldsDiv || $fieldsDiv.length <= 0) return;
            // console.log($fieldsDiv, fields)
            $fieldsDiv.empty();
            if (!Array.isArray(fields)) return;

            $fieldsDiv.each(function () {
                var name = $(this).attr("data-name"),
                    type = fieldMode === "multi" ? "checkbox" : "radio",
                    html = "";
                fields.forEach(function (item) {
                    html += '<label title="' + item.value + '" class="checkbox-inline">' +
                        '<input type="' + type + '" name="' + name + '" value="' + item.value + '">' +
                        item.name + '(' + item.value + ')' + '</label>';
                });
                if (fieldMode == "multi") {
                    html += '<label class="checkbox-inline">' +
                        '<input class="all" type="' + "checkbox" + '" name="' + name + '" value="' + "*" + '">' +
                        "*(所有)" + '</label>'
                }
                $(this).append(html);
            });

            if (!data) return;
            if (fieldMode === "multi") {
                if (!Array.isArray(data)) return;
                data.forEach(function (item) {
                    $fieldsDiv.find(':input[value="' + item + '"]').prop("checked", true);
                });
            } else if (fieldMode === 'single') {
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
            } else if (fieldMode === 'column') {
                $fieldsDiv.find(':input[value="' + data + '"]').prop("checked", true);
            }
        },
        setQuerierDate: function ($date, autoCreate, times) {
            var config = {
                    yearOffset: 0,
                    lang: 'ch',
                    timepicker: false,
                    format: "",
                    formatDate: "",
                },
                timeHtml = '<div class="col-lg-3"><input type="text" class="form-control querier-starttime" placeholder="查询开始日期" /></div>' +
                '<div class="col-lg-3"><input type="text" class="form-control querier-endtime" placeholder="查询截止日期" /></div>',
                config1,
                config2;
            switch (autoCreate) {
                case 'A':
                    config["format"] = "Y";
                    config["formatDate"] = "Y";
                    break;
                case 'B':
                    config["format"] = "Y/m";
                    config["formatDate"] = "Y/m";
                    break;
                case 'C':
                    config["format"] = "Y/m/d";
                    config["formatDate"] = "Y/m/d";
                case 'Z':
                    break;
            }
            if (config["format"]) {
                config1 = times["starttime"] ? $.extend({}, config, {
                    "value": times["starttime"]
                }) : config;
                config2 = times["endtime"] ? $.extend({}, config, {
                    "value": times["endtime"]
                }) : config;
                $(".querier-starttime").length <= 0 && $date.after(timeHtml);
                $(".querier-starttime").attr('data-format', config["format"]).datetimepicker(config1);
                $(".querier-endtime").attr('data-format', config["format"]).datetimepicker(config2);
            } else {
                $(".querier-starttime, .querier-endtime").remove();
            }
        },
        //绑定事件
        bindEvents: function (element) {
            var that = this;
            $(element).on("change" + EVENT_NAMESPACE, ".querier-dbName", {
                element: element
            }, async function (event) {
                event.stopPropagation();
                var dbName = $(this).val(),
                    AllDbName = that.AllDbName,
                    tableOptions = [],
                    $querierTable = $(element).find(".querier-table");
                if (dbName) {
                    Object.keys(AllDbName[dbName]).forEach(function (item) {
                        (AllDbName[dbName][item].key !== 0 && AllDbName[dbName][item].key !== 1) && tableOptions.push({
                            name: AllDbName[dbName][item]["tableDesc"],
                            value: item
                        })
                    })
                }
                Common.fillSelect($querierTable, {
                    name: "请选择表",
                    value: ""
                }, tableOptions, null, true)
            })
            $(element).on("change" + EVENT_NAMESPACE, ".querier-table", {
                element: element
            }, async function (event) {
                event.stopPropagation();
                var table = $(this).val(),
                    celement = event.data.element,
                    cache = $.data(celement, CACHE_KEY),
                    queryCondition = cache.queryCondition,
                    $querierFields = $(celement).find(".querier-fields"),
                    $querierConditions = $(celement).find(".querier-conditions"),
                    AllDbName = that.AllDbName,
                    fieldMode = cache.fieldMode,
                    data = cache.data,
                    fieldsoptions = [],
                    tableAutoCreate;
                dbName = $(celement).find(".querier-dbName").val();
                if (dbName && table) {
                    AllDbName[dbName][table].tableDetail.forEach(function (item) {
                        fieldsoptions.push({
                            name: item.cname,
                            value: item.id
                        })
                    })
                    tableAutoCreate = AllDbName[dbName][table].autoCreate || 'Z';
                }
                if (fieldMode === "single") {
                    $querierFields = $(celement).find(".querier-fields-show,.querier-fields-real");
                } else if (fieldMode === "column") {
                    $querierFields = $(celement).find(".querier-fields-column");
                };
                if (DataType.isObject(data) && data.table === table) {
                    that.setFields($querierFields, fieldMode, fieldsoptions, data.fields);
                    $querierConditions.conditions({
                        mode: 1,
                        dbName: dbName,
                        table: table,
                        data: data.conditions,
                        queryCondition: queryCondition,
                    });
                } else {
                    that.setFields($querierFields, fieldMode, fieldsoptions, null);
                    $querierConditions.conditions({
                        mode: 1,
                        dbName: dbName,
                        table: table,
                        data: null,
                        queryCondition: queryCondition,
                    });
                }
                that.setQuerierDate($(element).find(".querier-date").parent(), tableAutoCreate);
            });
            $(element).on("click" + EVENT_NAMESPACE, ".check-all", {
                element: element
            }, function () {
                var checkAll = $(this).is(":checked")
                $(this).parents(".form-group").find("input").not($('.all')).prop("checked", checkAll)
            })
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
                $(this).dbQuerier({
                    disabled: false
                });
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).dbQuerier({
                    disabled: true
                });
            });
        },
        setData: function (elements, data) {
            return elements.each(function () {
                $(this).dbQuerier({
                    data: data[0]
                });
            });
        },
        clearData: function (elements) {
            return elements.each(function () {
                $(this).dbQuerier({
                    data: null
                });
            });
        },
        getData: function (elements) {
            var $querier = $(elements[0]),
                cache = $.data(elements[0], CACHE_KEY),
                $querierStartTime = $(elements[0]).find(".querier-starttime"),
                $querierEndTime = $(elements[0]).find(".querier-endtime"),
                format = $querierStartTime.data('format') || '',
                now = new Date().toFormatString(format || 'yyyy/mm/dd', false, true),
                queryTime = $(elements[0]).find('[data-name="query_time"]').val() || "",
                fields;
            //获取字段数据
            if (cache.fieldMode === "single") {
                fields = {
                    text: $querier.find(".querier-fields-show :input:checked").val(),
                    value: $querier.find(".querier-fields-real :input:checked").val()
                };
            } else if (cache.fieldMode === 'column') {
                fields = $querier.find(".querier-fields-column :input:checked").val();
            } else {
                fields = [];
                $querier.find(".querier-fields").find(":input").each(function () {
                    if ($(this).is(":checked")) {
                        fields.push($(this).val());
                    }
                });
            }

            let result = {
                dbName: $querier.find(".querier-dbName").val(),
                table: $querier.find(".querier-table").val(),
                fields: fields,
                // querierTime: $querierStartTime.length > 0 ? { starttime: $querierStartTime.val() || now, endtime: $querierEndTime.val() || now } : {},
            };
            !cache.noTimeQuery && (result.queryTime = queryTime);
            cache.fieldMode !== 'column' && (result.conditions = $querier.find(".querier-conditions").conditions("getData"))
            return result;
        }
    };
})(jQuery, window, document);