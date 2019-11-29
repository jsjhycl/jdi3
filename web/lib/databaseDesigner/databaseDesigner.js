/**
 * 数据库设计器
 */
(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".databaseDesigner_event",
        CACHE_KEY = "databaseDesigner_cache";

    function databaseDesigner(elements, options) {
        this.$elements = elements
        this.options = options
    }

    databaseDesigner.prototype.constructor = databaseDesigner;

    databaseDesigner.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cahce = that.cacheData(this);
                if (!cahce.disabled) {
                    that.renderDOM(this)
                    that.setData(this)
                    that.bindEvents(this)
                }
            })
        },
        cacheData: function (element) {
            if (!element) return;
            var that = this;
            cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.databaseDesigner.defaults, that.options || {});
            } else {
                $(element).off(EVENT_NAMESPACE);
                cache = $.extend(cache, that.options || {});
            }
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        renderDOM: function (element) {
            if (!element) return;
            var cache = $.data(element, CACHE_KEY);
            if (!cache) return;
            var table = `<table class="databaseDesigner-table table table-bordered table-hover table-responsive"><thead><tr>`
            cache.thead.forEach(function (item) {
                var checkbox = item.hasCheckbox ? '<input class="check-all" type="checkbox">' : "";
                table += `<th class="text-center"> ${item.text }${checkbox }</th>`;
            })
            table += `</tr></thead><tbody></tbody></table>`
            $(element).addClass("databaseDesigner").empty().append(table);
        },
        buildData: function (cache) {
            var data = [],
                dbList = cache.dbList,
                db = cache.db,
                table = cache.table,
                getProperty = cache.getProperty;
            if (dbList[db] && dbList[db][table]) { //如果已经建过数据库
                data = dbList[db][table]["tableDetail"].filter(item => {
                    if (item["id"].length >= 4) {
                        return item
                    }
                })
            } else { //没有建表
                cache.$elems.each(function (index) {
                    var id = this.id
                    if (!id) return false;
                    var property = $.extend(getProperty(id), {}),
                        obj = {
                            id: id,
                            cname: property["cname"],
                            type: 'string',
                            maxlength: 50,
                            isSave: false,
                            fieldSplit: "",
                        }
                    data.push(obj)
                })
            }
            return data;
        },
        setData: function (element) {
            if (!element) return;
            var that = this,
                cache = $.data(element, CACHE_KEY),
                getProperty = cache.getProperty;
            if (typeof getProperty !== 'function') throw "错误参数类型";
            var $tbody = $(element).find(".databaseDesigner-table tbody"),
                tbody = "",
                data = that.buildData(cache);
            data.forEach(item => {
                tbody += `<tr>`
                cache.thead.forEach((jitem, index) => {
                    var template = jitem.template || function (value) {
                            return value
                        },
                        value = item[jitem["key"]];
                    tbody += `<td class="text-center">${template(value)}</td>`


                })
                tbody += `</tr>`
            })
            $tbody.empty().append(tbody);
        },
        bindEvents: function (element) {
            if (!element) return;
            var that = this;
            $(element).on('click' + EVENT_NAMESPACE, "thead th .check-all", {
                element: element
            }, function (event) {
                var current = event.data.element,
                    index = $(this).parent("th").index(),
                    isChecked = $(this).is(":checked");
                $(current).find("tbody tr").each(function () {
                    var $checkbox = $(this).find("td:eq(" + index + ") :checkbox");
                    $checkbox.prop("checked", isChecked);
                });
            })
        }
    }

    $.fn.extend({
        databaseDesigner: function (options) {
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1)
                return $.fn.databaseDesigner.methods[options](this, args)
            }
            return new databaseDesigner(this, options).init();
        }
    })

    $.fn.databaseDesigner.defaults = {
        disabled: false,
        $elems: null,
        thead: [{
            name: 'id',
            text: '编号',
            key: 'id',
            template: function (value) {
                return `<input data-key="id" type="text" value="${value}" class="form-control" readonly>`
            }
        }, {
            name: 'cname',
            text: '中文名',
            key: 'cname',
            template: function (value) {
                return `<input data-key="cname" type="text" value="${value}" class="form-control" readonly>`
            }
        }, {
            name: 'isSave',
            text: '是否入库',
            key: 'db.isSave',
            group: true,
            hasCheckbox: true,
            template: function (value) {
                var isChecked = !!value ? 'checked' : '';
                return `<input data-key="isSave" type="checkbox" ${isChecked}>`
            }
        }, {
            name: 'table',
            text: '表名称',
            key: 'db.table',
            group: 'true',
            template: function (value) {
                return `<input data-key="table" type="text" value="${value}">`
            }
        }],
        getProperty: null
    }

    $.fn.databaseDesigner.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY)
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).databaseDesigner({
                    disabled: false
                })
            })
        },
        disabled: function (elements) {
            return elements.each(function () {
                $(this).databaseDesigner({
                    disabled: true
                })
            })
        },
        getData: function (elements) {
            var first = elements[0],
                cache = $.data(first, CACHE_KEY),
                names = cache.thead.map(function (item) {
                    return item.name
                }),
                result = [];
            $(first).find(".databaseDesigner-table tbody tr").each(function (index, tr) {
                var item = {};

                names.forEach(function (name) {
                    if (!item.hasOwnProperty(name)) {
                        var $elem = $(tr).find(`[data-key="${name}"]`),
                            value = $elem.val() || "";
                        if ($elem.is(":checkbox")) {
                            value = !!$elem.is(":checked");
                        }
                        item[name] = value;
                    }
                });
                result.push(item)
            })
            return result;
        }
    }

}(jQuery, window, document))