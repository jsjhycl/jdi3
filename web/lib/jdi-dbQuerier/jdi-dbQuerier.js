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
            var that = this,
                tableHtml = '<div class="form-group">' +
                    '<label class="col-lg-2 control-label">查询数据库：</label>' +
                    '<div class="col-lg-9"><select class="form-control querier-dbName"></select></div>' +
                    '</div>'+'<div class="form-group">' +
                    '<label class="col-lg-2 control-label">查询表格：</label>' +
                    '<div class="col-lg-9"><select class="form-control querier-table"></select></div>' +
                    '</div>',
                conditionsHtml = '<div class="form-group">' +
                    '<label class="col-lg-2 control-label">查询条件：</label>' +
                    '<div class="col-lg-9 querier-conditions"></div>' +
                    '</div>';
            $(element).empty().append(tableHtml + that.renderFields(element) + conditionsHtml).addClass("form-horizontal querier");
        },
        renderFields: function (element) {
            var cache = $.data(element, CACHE_KEY),
                fieldMode = cache.fieldMode;
            if (fieldMode === "multi") {
                return '<div class="form-group">' +
                    '<label class="col-lg-2 control-label">查询字段：</label>' +
                    '<div class="col-lg-10 querier-fields" data-name="querier_fields"></div>' +
                    '</div>';
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
        //设置数据
        setData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY),
                $querierDbName = $(element).find(".querier-dbName"),
                $querierTable = $(element).find(".querier-table"),
                $querierFields = $(element).find(".querier-fields"),
                $querierConditions = $(element).find(".querier-conditions"),
                fieldMode = cache.fieldMode,
                data = cache.data;
            if (fieldMode === "single") {
                $querierFields = $(element).find(".querier-fields-show,.querier-fields-real");
            }

            var dbName, table, fields, conditions;
            if (DataType.isObject(data)) {
                dbName = data.dbName;
                table = data.table;
                fields = data.fields;
                conditions = data.conditions;
            }

            // var db = new Db();
            // db.getTables(false, function (tables,dbNames) {
            //     // ModalHelper.setSelectData($querierDbName, {name: "请选择数据库", value: ""}, dbNames, dbName, true)
            //     // ModalHelper.setSelectData($querierTable, {name: "请选择查询表", value: ""}, tables, table, true);
            //     db.getFields(table, function (arrs) {
            //         console.log(fieldMode, arrs, fields)
            //         // that.setFields($querierFields, fieldMode, arrs, fields);
            //         $querierConditions.conditions({
            //             mode: 1,
            //             table: table,
            //             data: conditions
            //         });
            //     });
            // });
            console.log(dbName,table,fields,conditions)
            var AllDbName = new CommonService().getFileSync("/lib/ZZZZZZZ/table.json")||{},
                dbOptions = [],
                tableOptions = [];
                fieldsoptions = []
                Object.keys(AllDbName).forEach(function(item){
                    dbOptions.push({name:item,value:item})
                })
                Common.fillSelect($querierDbName,{name:"请选择数据库",value:""},dbOptions,dbName,true)
                if(dbName){
                    Object.keys(AllDbName[dbName]).forEach(function(item){
                        tableOptions.push({name:item,value:item})
                    })
                    if(table){
                        AllDbName[dbName][table].tableDetail.forEach(function(item){
                            console.log(item)
                            fieldsoptions.push({name:item.cname,value:item.id})
                        })
                    }
                }
                Common.fillSelect($querierTable,{name:"请选择表",value:""},tableOptions,table,true)
                that.setFields($querierFields, fieldMode, fieldsoptions, fields);
                $querierConditions.conditions({
                    mode: 1,
                    dbName:dbName,
                    table: table,
                    data: conditions
                });

                
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
        //绑定事件
        bindEvents: function (element) {
            var that = this;
            $(element).on("change"+ EVENT_NAMESPACE, ".querier-dbName",{element:element},function(event){
                event.stopPropagation();
                var dbName = $(this).val(),
                AllDbName = new CommonService().getFileSync("/lib/ZZZZZZZ/table.json")||{},
                tableOptions = [],
                $querierTable = $(element).find(".querier-table");
                if(dbName){
                   Object.keys(AllDbName[dbName]).forEach(function(item){
                       tableOptions.push({name:item,value:item})
                   }) 
                }
                Common.fillSelect($querierTable,{name:"请选择表",value:""},tableOptions,null,true)
            })
            $(element).on("change" + EVENT_NAMESPACE, ".querier-table", {element: element}, function (event) {
                event.stopPropagation();

                var table = $(this).val(),
                    celement = event.data.element,
                    cache = $.data(celement, CACHE_KEY),
                    $querierFields = $(celement).find(".querier-fields"),
                    $querierConditions = $(celement).find(".querier-conditions"),
                    AllDbName = new CommonService().getFileSync("/lib/ZZZZZZZ/table.json")||{},
                    fieldMode = cache.fieldMode,
                    data = cache.data,
                    fieldsoptions = [],
                    dbName = $(celement).find(".querier-dbName").val();
                    if(dbName&&table){
                        AllDbName[dbName][table].tableDetail.forEach(function(item){
                            fieldsoptions.push({name:item.cname,value:item.id})
                        })
                    }
                if (fieldMode === "single") {
                    $querierFields = $(celement).find(".querier-fields-show,.querier-fields-real");
                }
                if (DataType.isObject(data) && data.table === table) {
                    that.setFields($querierFields, fieldMode, fieldsoptions, data.fields);
                    $querierConditions.conditions({
                        mode: 1,
                        dbName:dbName,
                        table: table,
                        data: data.conditions
                    });
                } else {
                    that.setFields($querierFields, fieldMode, fieldsoptions, null);
                    $querierConditions.conditions({
                        mode: 1,
                        dbName:dbName,
                        table: table,
                        data: null
                    });
                }



                // new Db().getFields(table, function (fields) {
                //     var celement = event.data.element,
                //         cache = $.data(celement, CACHE_KEY),
                //         $querierFields = $(celement).find(".querier-fields"),
                //         $querierConditions = $(celement).find(".querier-conditions"),
                //         fieldMode = cache.fieldMode,
                //         data = cache.data;
                //         console.log(celement,cache,$querierFields,$querierConditions,fieldMode,data)
                //     if (fieldMode === "single") {
                //         $querierFields = $(celement).find(".querier-fields-show,.querier-fields-real");
                //     }
                //     if (DataType.isObject(data) && data.table === table) {
                //         that.setFields($querierFields, fieldMode, fields, data.fields);
                //         $querierConditions.conditions({
                //             mode: 1,
                //             table: table,
                //             data: data.conditions
                //         });
                //     } else {
                //         that.setFields($querierFields, fieldMode, fields, null);
                //         $querierConditions.conditions({
                //             mode: 1,
                //             table: table,
                //             data: null
                //         });
                //     }
                // });
            });
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
                fields;
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
            return {
                dbName:$querier.find(".querier-dbName").val(),
                table: $querier.find(".querier-table").val(),
                fields: fields,
                conditions: $querier.find(".querier-conditions").conditions("getData")
            };
        }
    };
})(jQuery, window, document);