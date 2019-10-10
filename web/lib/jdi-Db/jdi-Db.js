(function ($, window, document, undefined) {
    let EVENT_NAMESPACE = ".JDI_DB",
        CACHE_KEY = "jdiDb_cache";

    function Db(elements, options) {
        this.elements = elements;
        this.options = options;
    }
    Db.prototype.constructor = Db;
    Db.prototype = {
        init: function () {
            let that = this;
            return that.elements.each(function () {
                let cache = that.cacheDate(this)
                if (!cache.disabled) {
                    that.renderDOM(this)
                    that.setData(this)
                    that.bindEvents(this)
                }
            })

        },
        cacheDate: function (element) {
            let that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.Db.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        renderDOM: function (element) {
            let that = this,
                cache = $.data(element, CACHE_KEY),
                $content = cache.$content,
                isSm = !!cache.isSm,
                labelClass = isSm ? "col-sm-12 text-left" : "col-lg-2",
                inputClass = isSm ? "col-lg-12" : "col-lg-9",
                formHtml = "";
            formHtml = `<div class="form-group">
                                <label class = "${labelClass} control-label">请选择库:</label>
                                <div class="${inputClass}"><select class="form-control dbName"></select></div>
                            </div>
                            <div class="form-group">
                                <label class="${labelClass} control-label"> 请选择表:</label>
                                <div class="${inputClass}"><select class="form-control tableName"></select></div >
                            </div>`;
            $content ? $content.append(formHtml) : $(element).empty().append(formHtml)
        },
        setData: function (element) {
            let that = this,
                cache = $.data(element, CACHE_KEY),
                $content = cache.$content,
                $DbName = $content ? $content.find(".dbName") : $(element).find(".dbName"),
                $table = $content ? $content.find(".tableName") : $(element).find(".tableName"),
                data = cache.data,
                AllDbName = cache.Db;
            let dbName, tableName, fields, conditions;
            if (DataType.isObject(data)) {
                dbName = data.dbName;
                tableName = data.table;
            }
            let dbOptions, tableOptions;
            dbOptions = that.getDbDateOptions("db", dbName, tableName, AllDbName);
            tableOptions = that.getDbDateOptions("table", dbName, tableName, AllDbName);
            Common.fillSelect($DbName, {
                name: "请选择库",
                value: ""
            }, dbOptions, dbName, false)
            Common.fillSelect($table, {
                name: "请选择表",
                value: ""
            }, tableOptions, tableName, true)


        },
        getDbDateOptions: function (type, dbName, table, AllDbName) {
            let obj = {
                [type]: []
            }
            if (type == "db") {
                Object.keys(AllDbName).forEach((item) => {
                    obj[type].push({
                        name: item,
                        value: item
                    })
                })
            }
            if (type == "table" && dbName) {
                Object.keys(AllDbName[dbName]).forEach((item) => {
                    obj[type].push({
                        name: AllDbName[dbName][item].tableDesc,
                        value: item
                    })
                })
            }
            if (type == "field" && dbName && table) {
                AllDbName[dbName][table].tableDetail.forEach((item) => {
                    obj[type].push({
                        name: item.cname,
                        value: item.id
                    })
                })
            }
            return obj[type]
        },
        bindEvents: function (element) {

            var that = this,
                cache = $.data(element, CACHE_KEY),
                $content = cache.$content;
            $content ? element = $content : "";
            $(element).on("change" + EVENT_NAMESPACE, ".dbName", function () {
                event.stopPropagation();
                var dbName = $(this).val(),
                    cache = $.data(element, CACHE_KEY),
                    // AllDbName = cache.Db,
                    $tableName = $(element).find(".tableName");
                tableOptions = that.getDbDateOptions("table", dbName, "", AllDbName);
                Common.fillSelect($tableName, {
                    name: "请选择表",
                    value: ""
                }, tableOptions, null, true)
            })
        }
    }
    $.fn.extend({
        Db: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.Db.methods[options](this, args);
            }
            return new Db(this, options).init();
        }
    })
    $.fn.Db.defaults = {
        disabled: false,
        type: "db",
        data: {
            db: "",
            table: "",
            conditions: []
        }
    }
    $.fn.Db.methods = {
        setData: function (elements, data) {
            return elements.each(function () {
                $(this).Db({
                    data: data[0]
                })
            })
        },
        clearData: function (elements) {
            return elements.each(function () {
                console.log($(this))
                $(this).Db({
                    data: null
                })
            })
        },
        getData: function (elements) {
            var $Db = $(elements[0]);
            let result = {
                dbName: $Db.find(".dbName").val(),
                table: $Db.find(".tableName").val()
            }
            return result;
        }
    }
})(jQuery, window, document)