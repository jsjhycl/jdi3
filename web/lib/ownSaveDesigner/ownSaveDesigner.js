/**
 * 数据库本表设计
 */
(function (jQuery, window, document, undefined) {
    var EVENT_NAMESPACE = '.ownSaveDesigner_event',
        CACHE_KEY = 'ownSaveDesigner_cache';

    function ownSaveDesigner(elements, options, type) {
        this.$elements = elements;
        this.options = options;
        this.type = type;
        this.dbList = null
    }

    ownSaveDesigner.constructor = ownSaveDesigner;

    ownSaveDesigner.prototype = {
        cacheData: function (element) {

            if (!element) return;
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.ownSaveDesigner.defaults, that.options || {})
            } else {
                $(element).off(EVENT_NAMESPACE)
                cache = $.extend(cache, that.options || {})
            }
            $.data(element, CACHE_KEY, cache)
            return cache;

        },

        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM(this)
                    var data = that.buildData(this)
                    console.log(data)
                    that.setData(data, this)
                    that.bindEvents(this)
                }
            })
        },

        renderDOM: function (element) {
            if (!element) return;
            var cache = $.data(element, CACHE_KEY)
            if (!cache) return;
            var table = `<table class="ownSaveDesigner-table table table-bordered table-hover table-responsive"><thead><tr>`;
            cache.thead.forEach(function (item) {
                var checkbox = item.hasCheckbox ? `<input class="check-all" type="checkbox">` : "";
                table += `<th class="text-center">${item.text}${checkbox}</th>`
            })
            table += `</tr></thead><tbody></tbody></table>`
            $(element).addClass("ownSaveDesigner").empty().append(table)
        },
        buildData: function (element) {
            var cache = $.data(element, CACHE_KEY);
            if (!cache) return;
            var getProperty = cache.getProperty,
                data = [];
            if (typeof getProperty !== "function") throw "错误的参数类型,getProperty";
            cache.$elems.each(function (index) {
                var id = this.id;
                if (!id) return true;
                var property = getProperty(id),
                    keysObj = {};
                cache.keys.forEach(key => {
                    keysObj[key] = property[key] ? property[key] : [];
                })
                data.push(keysObj)
            })
            return data;
        },
        setData: function (data, element) {
            if (!Array.isArray(data)) return;
            var $tbody = $(".ownSaveDesigner-table tbody");
            if ($tbody.length <= 0) return;
            var tbodyHtml = '',
                cache = $.data(element, CACHE_KEY);
            data.forEach((item, index) => {
                console.log(item)
                if (item.db && item.db.length > 0) {
                    item.db.forEach((db, cIndex) => {
                        tbodyHtml += `<tr class="${cIndex>0?'addtr':''} ${index%2==0?'tr':''}" data-id=${item.id}>`;
                        cache.thead.forEach((td, tIndex) => {

                        })

                        tbodyHtml += `</tr>`
                    })
                } else {

                }

            })
            $tbody.empty().append(tbodyHtml);
        },

        bindEvents: function (element) {}
    }

    $.fn.extend({
        ownSaveDesigner: function (options) {
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.ownSaveDesigner.methods[options](this, args)
            }
            return new ownSaveDesigner(this, options).init()
        }
    })
    $.fn.ownSaveDesigner.defaults = {
        disabled: false,
        $elems: null,
        thead: [{
            name: 'id',
            text: '编号',
            key: 'id',
            template: function (value) {
                return `<input class="form-control" data-key="id" type="text" value="${value}" readonly>`
            }
        }, {
            name: 'cname',
            text: '中文名',
            key: 'cname',
            template: function (value) {
                return `<input class="form-control" data-key="id" type="text" valuae="${value}" readonly>`
            }
        }],
        getProperty: null
    }
    $.fn.ownSaveDesigner.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).ownSaveDesigner({
                    disabled: true
                })
            })
        },
        disabled: function (elements) {
            return elements.each(function () {
                $(this).ownSaveDesigner({
                    disabled: false
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
            $(first).find(".ownSaveDesigner-table tbody tr").each(function (index, tr) {
                var item = {};
                names.forEach(function (name) {
                    if (!item.hasOwnProperty(name)) {
                        var $elem = $(tr).find(`[data-key="${name}"]`),
                            value = $elem.val() || "";
                        if ($elem.is(":checkbox")) {
                            value = !!$elem.is(":cheched");
                        }
                        item[name] = value
                    }
                });
                result.push(item)
            })
            return result;
        }
    }
})(jQuery, window, document)