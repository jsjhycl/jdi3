;(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".jpagination_event",
        CACHE_KEY = "jpagination_cache";

    var Pagination = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };

    Pagination.prototype.constructor = Pagination;

    Pagination.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM(this);
                    that.clearData(this);
                    that.setData(this);
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.jcontextmenu.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        renderDOM: function (element) {
            var isRender = !!$(element).attr("data-render");
            if (!isRender) {
                var html = '<header class="jpage-header"><form class="jpage-form form-horizontal"></form></header>' +
                    '<section class="jpage-body">' +
                    '<table class="jpage-table table table-striped table-hover">' +
                    '<thead></thead><tbody></tbody></table></section>' +
                    '<footer class="jpage-footer"><ul class="jpage-pagination pagination"></ul></footer>';
                $(element).addClass("jpage").empty().append(html);
            }
        },
        clearData: function (element) {
            $(element).find(".jpage-form,.jpage-table thead,.jpage-table tbody.jpage-pagination").empty();
        },
        setData: function (element) {
            var that = this,
                $jpage = $(element),
                cache = $.data(element, CACHE_KEY);
            //填充form
            var $jpageForm = $jpage.find(".jpage-header .jpage-form"),
                forms = cache.forms;
            if (Array.isArray(forms)) {
                var html_forms = "";
                forms.forEach(function (item) {
                    var group = "";
                    switch (item.controlType) {
                        case "textbox":
                            group = '<div class="form-group">' +
                                '<label class="col-lg-2 control-label">' + item.labelText + '：</label>' +
                                '<div class="col-lg-8">' +
                                '<input class="form-control" type="text" name="' + item.name + '" placeholder="' + item.labelText + '">' +
                                '</div>' +
                                '</div>';
                            break;
                        case "hidden":
                            group = '<input type="hidden" name="' + item.name + '" value="' + item.value + '">';
                            break;
                    }
                    html_forms += group;
                });
                html_forms += '<button class="jpage-search btn btn-primary">查询</button>';
                $jpageForm.append(html_forms);
            }
            //填充thead
            var $jpageThead = $jpage.find(".jpage-table thead"),
                thead = cache.thead;
            if (thead) {
                var html_thead = "<tr>";
                thead.fields.forEach(function (item) {
                    html_thead += '<th>' + item.text + '</th>';
                });
                $jpageThead.append(html_thead);
            }
            //初始化分页数据
            that.getPageData(element, cache.query);
        },
        bindEvents: function (element) {
            var that = this;
            //查询click事件
            // $(element).on("click" + EVENT_NAMESPACE, ".jpage-search", {element: element}, function (event) {
            //     var current = event.data.element;
            //     $(current).find(".jpage-form").submit(false);
            //     that.removeDisabled(current);

            //     var cache = $.data(current, CACHE_KEY),
            //         postData = that.duplicate(cache.data);
            //     postData["name"] = that.getConditionsData(current, cache.forms);
            //     that.getPageData(current, postData);
            // });
            //上一页click事件
            $(element).on("click" + EVENT_NAMESPACE, ".jpage-up", {element: element}, function (event) {
                var current = event.data.element;
                that.removeDisabled(current);

                var pageIndex = that.getPageIndex(current);
                if (pageIndex === 1) {
                    $(this).parent().addClass("disabled");
                } else {
                    var cache = $.data(current, CACHE_KEY),
                    postData = that.duplicate(cache.query);
                    // postData["name"] = that.getConditionsData(current, cache.forms);
                    postData["page"] = pageIndex - 1;
                    that.getPageData(current, postData);
                }
            });
            //页码click事件
            $(element).on("click" + EVENT_NAMESPACE, ".jpage-number", {element: element}, function (event) {
                var current = event.data.element;
                that.removeDisabled(current);

                var cache = $.data(current, CACHE_KEY),
                    postData = that.duplicate(cache.query),
                    pageIndex = parseInt($(this).attr("data-number"));
                postData["page"] = !isNaN(pageIndex) ? pageIndex : 1;
                that.getPageData(current, postData);
            });
            //下一页click事件
            $(element).on("click" + EVENT_NAMESPACE, ".jpage-down", {element: element}, function (event) {
                var current = event.data.element;
                that.removeDisabled(current);

                var pageIndex = that.getPageIndex(current);
                if (pageIndex === $(element).find(".jpage-number").length) {
                    $(this).parent().addClass("disabled");
                } else {
                    var cache = $.data(current, CACHE_KEY),
                        postData = that.duplicate(cache.query);
                    postData["page"] = pageIndex + 1;
                    that.getPageData(current, postData);
                }
            });
            //remove点击事件
            $(element).on("click" + EVENT_NAMESPACE, ".jpage-table tbody .remove", {element: element}, function (event) {
                var current = event.data.element,
                    cache = $.data(current, CACHE_KEY);
                if (cache.onRemove) {
                    var promise = cache.onRemove.call(this, null);
                    promise.then(function () {
                        var current = event.data.element;
                        that.removeDisabled(current);
                        var postData = that.duplicate(cache.query);
                        postData["page"] = that.getPageIndex(current);
                        that.getPageData(current, postData);
                        // alert("操作失败！消息：" + JSON.stringify(result.result, null, 2));
                    }).catch(function (err) {
                        alert("err:" + JSON.stringify(err, null, 2));
                    });
                }
            });
            //detail点击事件
            $(element).on("click" + EVENT_NAMESPACE, ".jpage-table tbody .detail", {element: element}, function (event) {
                var current = event.data.element,
                    cache = $.data(current, CACHE_KEY);
                if (cache.onDetail) {
                    cache.onDetail.call(this, null);
                }
            });
        },
        getPageCount: function(url, postData) {
            var postData = $.extend({}, postData);
            delete postData["page"];
            delete postData["size"];
            postData["fields"] = ['customId']
            return new Promise((resolve, reject) => {
                return $.cajax({
                    url,
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(postData),
                    dataType: "json",
                    success: rst => rst.status === 0 ? resolve(rst.result.length) : reject(rst.result),
                    error: err => reject(err)
                })
            })
        },
        getPage: function(url, postData) {
            var postData = $.extend({}, postData);
            postData["fields"] = postData["fields"].map(el => el.value);
            return new Promise((resolve, reject) => {
                return $.cajax({
                    url,
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(postData),
                    dataType: "json",
                    success: rst => rst.status === 0 ? resolve(rst.result) : reject(rst.result),
                    error: err => reject(err)
                })
            })
        },
        getPageData: async function (element, postData) {
            var that = this,
                $jpage = $(element),
                cache = $.data(element, CACHE_KEY),
                result = { count: 0, data: null };
            try {
                var count = await this.getPageCount(cache.url, postData),
                    data = await this.getPage(cache.url, postData);
                result.count = count;
                result.data = data;
            } catch(err) {
                alert("分页数据加载失败！");
                throw (err);
            }
            var numbers = Math.ceil(result.count / postData.size);
            if (numbers > 0) {
                var html1 = "";
                html1 += '<li><a class="jpage-up">&laquo;</a></li>';
                for (var i = 1; i <= numbers; i++) {
                    html1 += '<li><a class="jpage-number" data-number="' + i + '">' + i + '</a></li>';
                }
                html1 += '<li><a class="jpage-down">&raquo;</a></li>';
                $jpage.find(".jpage-pagination").empty().append(html1);
                $jpage.find('.jpage-number[data-number="' + postData.page + '"]').parent().addClass("active");
            } else {
                $jpage.find(".jpage-pagination").empty().append('<li><a class="jpage-up">&laquo;</a></li><li><a class="jpage-down">&raquo;</a></li>');
            }
            //填充table
            var data = result.data;
            if (Array.isArray(data)) {
                var html2 = "",
                    thead = cache.thead;
                data.forEach(function (item) {
                    var customId = "";
                    //添加data-*属性
                    var tr = '<tr data-id=' + item.customId + ' >';
                    // thead.attrs.forEach(function (aitem) {
                    //     var value = that.recurseObject(item, aitem.alias);
                    //     customId = value;
                        
                    // });
                    // tr += '';
                    //添加td数据
                    thead.fields.forEach(function (fitem) {
                        var type = fitem.type,
                            dataType = fitem.dataType || "String",
                            key = fitem.key,
                            keys = key.split('.'),
                            secondKey;
                        keys.length > 0 && (secondKey = keys[keys.length - 1])
                        firstKey = keys[0]
                        if (type === 0) {
                            var value;
                            if (dataType === "Number") {
                                value = isNaN(item[firstKey]) ? item[fitem.pkey] : item[firstKey];
                            } else {
                                value = item[firstKey] || item[fitem.pkey];
                            }

                            // console.log(secondKey,value,"1")
                            if(secondKey =="version"){
                                value = value
                            }else{
                                secondKey && DataType.isObject(value) && (value = that.recurseObject(value, secondKey))
                            }
                            
                            var template = fitem.template || function (value) {
                                        return value;
                                    },
                                str = template(value);

                            if (fitem.func) {
                                var $template = $(str);
                                $template.addClass(fitem.func);
                                // tr += '<td>' + $template.get(0).outerHTML +"_"+customId + '</td>';
                                tr += '<td>' + $template.get(0).outerHTML + '</td>';
                            } else {
                                tr += '<td>' + str + '</td>';
                            }
                        } else if (type === 1) {
                            tr += '<td>';
                            fitem.items.forEach(function (sitem) {
                                var str = sitem.template ? sitem.template() : "";
                                if (sitem.func) {
                                    var $template = $(str);
                                    $template.addClass(sitem.func);
                                    tr += $template.get(0).outerHTML;
                                } else {
                                    tr += str;
                                }
                            });
                            tr += '</td>';
                        } else {
                            tr += '<td></td>';
                        }
                    });
                    tr += '</tr>';
                    html2 += tr;
                });
                $jpage.find(".jpage-table tbody").empty().append(html2);
            }
        },
        getConditionsData: function (element, forms) {
            var $jpageForm = $(element).find(".jpage-form"),
                conditions = "";
            forms.forEach(function (item) {
                var name = item.name,
                    $elem = $jpageForm.find('[name="' + name + '"]'),
                    value = item.value || $elem.val();
                if (value) {
                    switch (item.searchType) {
                        case "=":
                            conditions = value;
                            break;
                        case "like":
                            conditions = value;
                            break;
                        default:
                            conditions = value;
                            break;
                    }
                }
            });
            return conditions;
        },
        getPageIndex: function (element) {
            var $active = $(element).find(".jpage-footer .jpage-pagination li.active"),
                number = parseInt($active.find("a").attr("data-number"));
            return !isNaN(number) ? number : 1;
        },
        removeDisabled: function (element) {
            $(element).find(".jpage-footer li.disabled").removeClass("disabled");
        },
        duplicate: function (data) {
            var result = {};
            for (var key in data) {
                result[key] = data[key];
            }
            return result;
        },
        recurseObject: function (data, key) {
            var that = this;
            if (key.indexOf(".") > -1) {
                var temp = that.duplicate(data),
                    keys = key.split(".");
                for (var i = 0; i < keys.length; i++) {
                    var ckey = keys[i],
                        cvalue = temp[ckey];
                    if (!cvalue) {
                        break;
                    } else {
                        temp = cvalue;
                    }
                }
                return temp;
            } else {
                return data[key];
            }
        }
    };

    $.fn.extend({
        jpagination: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.jpagination.methods[options](this, args);
            }
            return new Pagination(this, options).init();
        }
    });

    $.fn.jpagination.defaults = {
        disabled: false,
        url: null,
        data: {},
        forms: [],
        thead: {},
        onDetail: function () {
        },
        onRemove: function () {
        }
    };

    $.fn.jpagination.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).jpagination({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).jpagination({disabled: true});
            });
        }
    };
})(jQuery, window, document);