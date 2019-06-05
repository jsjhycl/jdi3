;
(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".nv_event",
        CACHE_KEY = "nv_cache";

    function NumViewer(elements, options) {
        this.$elements = elements; //查看元素编号
        this.options = options;
    }

    NumViewer.prototype.constructor = NumViewer;

    NumViewer.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.numViewer.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        bindEvents: function (element) {
            var that = this;
            $(element).on("click" + EVENT_NAMESPACE, {
                element: element
            }, function (event) {
                that.renderDOM(event.data.element);
            });
        },
        renderDOM: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) return;

            var $source = cache.$source,
                $container = $source.find(".viewer");
            if ($container.length <= 0) {
                $container = $('<div class="viewer"></div>');
                $source.append($container);
                that.clearData($container);
                that.setData(element, $container);
            } else {
                $container.remove();
            }
        },
        clearData: function ($container) {
            $container.empty();
        },
        setData: function (element, $container) {
            var cache = $.data(element, CACHE_KEY);
            if (!cache) return;

            if (!$container || $container.length <= 0) return;

            var $source = cache.$source;
            $container.css({
                "width": $source.get(0).offsetWidth + "px",
                "height": $source.get(0).offsetHeight + "px"
            });
            $source.find(cache.selector).each(function (index, item) {
                var position = $(item).position(),
                    type = $(this).attr("data-type");
                if (type !== "div") {
                    var $node = $('<div class="viewer-node">' + item.id + '</div>');
                    $node.css({
                        "left": position.left + "px",
                        "top": position.top + "px",
                        "width": item.offsetWidth + 5,
                        "height": item.offsetHeight + 5
                    });
                    $container.append($node);
                } else {
                    $(item).find(":input").each(function (jindex, jitem) {
                        var $cnode = $('<div class="viewer-node">' + jitem.id + '</div>'),
                            offset = $(jitem).offset(),
                            workapce = $("#workspace").offset();
                        $cnode.css({
                            "left": offset.left - workapce.left + "px",
                            "top": offset.top - workapce.top + "px",
                            "width": jitem.offsetWidth + 5,
                            "height": jitem.offsetHeight + 5
                        });
                        $container.append($cnode);
                    });
                }
            });
        }
    };

    $.fn.extend({
        numViewer: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.numViewer.methods[options](this, args);
            }
            return new NumViewer(this, options).init();
        }
    });

    $.fn.numViewer.defaults = {
        disabled: false,
        $source: null,
        selector: null,
        onStart: function () {},
        onStop: function () {}
    };

    $.fn.numViewer.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).numViewer({
                    disabled: false
                });
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).numViewer({
                    disabled: true
                });
            });
        }
    };
})(jQuery, window, document);