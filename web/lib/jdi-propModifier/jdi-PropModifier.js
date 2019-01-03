;(function ($, window, document, undefined) {
    /**
     *  PS：以下源码注释中，
     *  1、pm表示属性修改器元素（类名.pm）；
     *  2、pm对话框表示属性修改器对话框元素（类名.pm-dialog）；
     */
    var EVENT_NAMESPACE = ".pm_event",
        CACHE_KEY = "pm_cache";

    var PropModifier = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };
    PropModifier.prototype.constructor = PropModifier;

    PropModifier.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM();
                    that.clearData();
                    that.setData(this);
                    that.setStyle(this);
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.propModifier.defaults, that.options || {});
            } else {
                // $(document).off(EVENT_NAMESPACE);
                cache = $.extend(cache, that.options || {});
            }
            $.data(element, CACHE_KEY, cache);
            // 这个地方有个超级超级大的坑
            // 1、当前插件的模式为多对一，即多个元素可以触发一个UI；
            // 2、插件UI为单例模式；
            // 3、插件UI内部的元素事件注册必须是不同元素更新一次；
            $(document).off(EVENT_NAMESPACE);
            return cache;
        },
        renderDOM: function () {
            var $pm = $(".pm");
            if ($pm.length <= 0) {
                $pm = $('<section class="pm"><div class="pm-dialog">' +
                    '<i class="pm-close">&times;</i>' +
                    '<section class="pm-content"><div class="pm-page"></div></section>' +
                    '<aside class="pm-sidebar">' +
                    '<section class="pm-propertybar"></section>' +
                    '<section class="pm-button">' +
                    '<button class="btn btn-default pm-apply">应用</button>' +
                    '<button class="btn btn-danger pm-remove">删除</button>' +
                    '</section>' +
                    '<section class="pm-result">' +
                    '<button class="btn btn-primary pm-save">保存</button>' +
                    '<button class="btn btn-danger pm-clear">清除</button>' +
                    '</section>' +
                    '</aside></div></section>');
                $pm.appendTo(document.body);
            }
        },
        clearData: function () {
            $(".pm .pm-dialog .pm-content .pm-page .pm-elem.selected")
                .removeAttr("data-value")
                .removeClass("selected");
            $(".pm .pm-dialog .pm-sidebar .pm-propertybar").empty();
        },
        setData: function (element) {
            var $pm = $(".pm");
            //填充属性栏
            new Propertybar($pm.find(".pm-propertybar")).init(true, "_copy");
            //填充页面元素
            var cache = $.data(element, CACHE_KEY),
                $source = cache.$source;
            if ($source && $source.length > 0) {
                var temp = {},
                    $pmPage = $pm.find(".pm-page");
                $pmPage.html($source.html()).outerWidth($source.outerWidth()).outerHeight($source.outerHeight());
                $source.find("input").each(function () {
                    var id = this.id,
                        position = $(this).position();
                    if (!temp.hasOwnProperty(id) && position) {
                        temp[id] = {
                            position: $(this).css("position"),
                            top: position.top,
                            left: position.left,
                            zIndex: $(this).css("z-index"),
                            width: $(this).width(),
                            height: $(this).height()
                        };
                    }
                });
                $pmPage.find("input").each(function () {
                    var id = this.id,
                        item = temp[id];
                    if (item) {
                        var $new = $('<a class="pm-elem" data-id="' + id + '">' + id + '</a>');
                        $new.css({
                            "position": item.position,
                            "top": item.top,
                            "left": item.left,
                            "z-index": item.zIndex,
                            "width": item.width,
                            "height": item.height
                        });
                        $(this).replaceWith($new);
                    }
                });
            }
            //填充data数据样式
            var data = cache.data;
            if (data) {
                for (var id in data) {
                    $('.pm .pm-elem[data-id="' + id + '"]')
                        .attr({
                            "data-id": id,
                            "data-value": JSON.stringify(data[id])
                        })
                        .addClass("applied");
                }
            }
            $pm.fadeIn();
            if (cache.onOpen) {
                cache.onOpen();
            }
        },
        setStyle: function (element) {
            var $pm = $(".pm"),
                $pmDialog = $pm.find(".pm-dialog"),
                $pmContent = $pm.find(".pm-content"),
                $pmClose = $pm.find(".pm-close"),
                $pmSidebar = $pm.find(".pm-sidebar"),
                $pmResult = $pm.find(".pm-result"),
                cache = $.data(element, CACHE_KEY),
                top = cache.top || 15,
                zIndex = cache.zIndex || 9999,
                width = cache.width || 1200,
                height = cache.height || ($(window).height() - top * 2);
            $pmDialog.css({
                "top": top,
                "z-index": zIndex,
                "width": width,
                "height": height
            });
            $pmContent.width(width - $pmSidebar.outerWidth());
            $pmContent.height(height);
            $pm.css("z-index", zIndex);
            $pmClose.css("z-index", zIndex + 1);
            $pmResult.css("z-index", zIndex + 1);
        },
        bindEvents: function (element) {
            var that = this;
            //加载
            $(document).on("click" + EVENT_NAMESPACE, ".pm .pm-elem", {element: element}, function (event) {
                that.clearPropertybar();

                var $pm = $(".pm");
                $pm.find(".pm-elem.selected").removeClass("selected");
                $(this).addClass("selected");

                var id = $(this).attr("data-id");
                $pm.find("#property_id_copy").val(id);

                var data = Common.parseData($(this).attr("data-value") || null);
                if (!Array.isArray(data)) return;

                $(this).addClass("applied");
                data.forEach(function (item) {
                    var name = "property_" + item.name + "_copy",
                        $elem = $pm.find("#" + name),
                        dataType = $elem.attr("data-dataType");
                    if (dataType === "Object" || dataType === "Array") {
                        $elem.val(JSON.stringify(item.value));
                    } else if (dataType === "Boolean") {
                        $elem.prop("checked", item.value);
                    } else {
                        $elem.val(item.value);
                    }
                });
            });
            //应用
            $(document).on("click" + EVENT_NAMESPACE, ".pm .pm-apply", {element: element}, function (event) {
                var $pm = $(".pm:visible"),
                    id = $pm.find("#property_id_copy").val(),
                    $elems = $pm.find('.pm-propertybar [id^="property_"]:not(#property_id_copy)'),
                    data = [];
                $elems.each(function () {
                    var id = this.id,
                        name = (id.split("_"))[1],//先简化获取
                        value = $(this).val(),
                        dataType = $(this).attr("data-dataType"),
                        attrOrStyle = $(this).attr("data-attrOrStyle");
                    if ($(this).is(":checkbox")) {
                        data.push({type: attrOrStyle, name: name, value: $(this).is(":checked")});
                    } else {
                        if (value) {
                            var svalue = DataType.convert(dataType, value);
                            data.push({type: attrOrStyle, name: name, value: svalue});
                        }
                    }
                });
                $pm.find('.pm-elem[data-id="' + id + '"]').attr("data-value", JSON.stringify(data)).addClass("applied");
            });
            //删除
            $(document).on("click" + EVENT_NAMESPACE, ".pm .pm-remove", {element: element}, function (event) {
                var $pm = $(".pm:visible"),
                    id = $pm.find("#property_id_copy").val();
                $pm.find('.pm-elem[data-id="' + id + '"]').removeAttr("data-value").removeClass("applied");
            });
            //保存
            $(document).on("click" + EVENT_NAMESPACE, ".pm .pm-save", {element: element}, function (event) {
                var cache = $.data(event.data.element, CACHE_KEY),
                    $pm = $(".pm:visible"),
                    $applied = $pm.find(".pm-elem.applied"),
                    data = {};
                $applied.each(function () {
                    var id = $(this).attr("data-id"),
                        value = $(this).attr("data-value") || null;
                    data[id] = Common.parseData(value);
                });
                $pm.fadeOut();
                cache.$result.val(JSON.stringify(data));
            });
            //清除
            $(document).on("click" + EVENT_NAMESPACE, ".pm .pm-clear", {element: element}, function (event) {
                var result = confirm("确定要清除元素修改配置数据吗？");
                if (result) {
                    var cache = $.data(event.data.element, CACHE_KEY),
                        $pm = $(".pm:visible");
                    cache.$result.val("");
                    $pm.fadeOut();
                    that.clearData($pm);
                }
            });
            //关闭
            $(document).on("click" + EVENT_NAMESPACE, ".pm .pm-close", {element: element}, function (event) {
                $(".pm:visible").fadeOut();
            });
        },
        clearPropertybar: function () {
            var $pm = $(".pm:visible");
            $pm.find(":text").val("");
            $pm.find(":checkbox").prop("checked", false);
            $pm.find(":checkbox#property_visibility_copy").prop("checked", true);
            $pm.find("select").val("");
        }
    };

    $.fn.extend({
        propModifier: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.propModifier.methods[options](this, args);
            }
            return new PropModifier(this, options).init();
        }
    });

    $.fn.propModifier.defaults = {
        disabled: false,
        top: 20,//pm对话框上偏移量
        zIndex: 9999,//pm对话框z-index值
        width: null,//pm对话框宽度
        height: null,//pm对话框高度
        $source: null,//page数据来源的DOM
        $result: null,//接收结果数据的DOM
        // data: {
        //     "AAAB": [
        //         {type: "style", name: "fontSize", value: "18px"},
        //         {type: "style", name: "fontFamily", value: "宋体"}
        //     ],
        //     "AAAC": [
        //         {type: "style", name: "color", value: "red"}
        //     ]
        // },
        data: null
    };

    $.fn.propModifier.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).propModifier({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).propModifier({disabled: true});
            });
        }
    };

})(jQuery, window, document);