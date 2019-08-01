;(function ($, window, document, undefined) {
    /**
     *  PS：以下源码注释中，
     *  1、pm表示属性修改器元素（类名.pm）；
     *  2、pm对话框表示属性修改器对话框元素（类名.pm-dialog）；
     */
    var EVENT_NAMESPACE = ".pm_event2",
        CACHE_KEY = "pm_cache2";

    var PropModifier3 = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };
    PropModifier3.prototype.constructor = PropModifier3;

    PropModifier3.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM();
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
                cache = $.extend({}, $.fn.propModifier2.defaults, that.options || {});
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
            // var $pm = $(".pm2");
            // if ($pm.length <= 0) {
            //     $pm = $('<section class="pm2"><div class="pm-dialog">' +
            //         '<i class="pm-close">&times;</i>' +
            //         '<section class="pm-content"><div class="pm-page"></div></section>');
            //     $pm.appendTo(document.body);
            // }
        },
        
        setData: function (element) {
            var $pm = $(".pm2");
            // new Propertybar($pm.find(".pm-propertybar")).init(true, "_copy");
            $pm.find(".pm-propertybar").html('<div class="pm-textarea-wrap"><textarea readonly class="pm-textarea"></textarea></div>')
            //填充页面元素
            var cache = $.data(element, CACHE_KEY),
                $source = cache.$source;
                $element = cache.$element
            if ($source && $source.length > 0) {
                var temp = {},
                    $pmPage = $element;
                $pmPage.html($source.html()).outerWidth($source.outerWidth()).outerHeight($source.outerHeight());
                $source.find("input, canvas").each(function () {
                    var id = this.id,
                        position = $(this).position();
                    if (!temp.hasOwnProperty(id) && position) {
                        temp[id] = {
                            position: $(this).css("position"),
                            top: position.top,
                            left: position.left,
                            zIndex: $(this).css("z-index"),
                            width: $(this).width(),
                            height: $(this).height(),
                            isFocus: $(this).hasClass('focus')
                        };
                    }
                });
                $pmPage.find("input, canvas").each(function () {
                    var id = this.id,
                        item = temp[id];
                    if (item) {
                        var $new = $('<a class="pm-elem3" data-id="' + id + '">' + id + '</a>');
                        $new.css({
                            "position": item.position,
                            "top": item.top,
                            "left": item.left,
                            "z-index": item.zIndex,
                            "width": item.width,
                            "height": item.height
                        });
                        item.isFocus && $new.addClass('selected');
                        $(this).replaceWith($new);
                    }
                });
            }

            //填充data数据样式
            var data = cache.data;
            if (data && Array.isArray(data)) {
                data.forEach(function(i) {
                    $('.pm3 .pm-elem3[data-id="' + i + '"]').addClass("applied");
                });
                $pm.find('.pm-textarea').val(data.join(','));
            }
            $pm.fadeIn();
            if (cache.onOpen) {
                cache.onOpen();
            }
        },
        setStyle: function (element) {
            var $pm = $(".pm2"),
                $pmDialog = $pm.find(".pm-dialog"),
                $pmContent = $pm.find(".pm-content"),
                $pmClose = $pm.find(".pm-close"),
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
            $pmContent.width(width);
            $pmContent.height(height);
            $pm.css("z-index", zIndex);
            $pmClose.css("z-index", zIndex + 1);
            $pmResult.css("z-index", zIndex + 1);
        },
        bindEvents: function (element) {
            var that = this;
            //加载
            $(document).on("click" + EVENT_NAMESPACE, ".pm3 .pm-elem3", {element: element}, function (event) {
                // var $this = $(this);

                // if($this.hasClass('selected')) return;
                
                // var id = $this.data('id'),
                //     $textarea = $('.pm-textarea'),
                //     textarea = $textarea.val();
                // if($this.hasClass('applied')) {
                //     $this.removeClass('applied');
                //     var reg = eval('/[,]*('+id+')/');
                //     $textarea.val(textarea.replace(reg, ""))
                // } else {
                //     $this.addClass('applied');
                //     textarea ? ($textarea.val(textarea+','+id)) : $textarea.val(id);
                // }
            });
           
            //关闭
            $(document).on("click" + EVENT_NAMESPACE, ".pm2 .pm-close", {element: element}, function (event) {
                $(".pm2:visible").fadeOut();
            });
        }
    };

    $.fn.extend({
        propModifier3: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.propModifier2.methods[options](this, args);
            }
            return new PropModifier3(this, options).init();
        }
    });

    $.fn.propModifier3.defaults = {
        disabled: false,
        top: 20,//pm对话框上偏移量
        zIndex: 1050,//pm对话框z-index值
        width: null,//pm对话框宽度
        height: null,//pm对话框高度
        $source: null,//page数据来源的DOM
        $element:null,
        $result: null,//接收结果数据的DOM
        data: null
    };

    $.fn.propModifier3.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).propModifier2({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).propModifier2({disabled: true});
            });
        }
    };

})(jQuery, window, document);