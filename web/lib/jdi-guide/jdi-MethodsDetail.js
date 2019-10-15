(function ($, window, document, undefined) {
    const EVENT_NAMESPACE = ".METHODSDETSILS",
        CACHE_KEY = "METHODSDETAILS_CACHE";

    function MethodsDetail(elements, options) {
        this.$elements = elements;
        this.options = options
    }
    MethodsDetail.constructor = MethodsDetail;
    MethodsDetail.prototype = {
        init: function () {
            let that = this;
            that.$elements.each(function () {
                let cache = that.cacheData(this)
                that.renderDOM(this, cache.data)
            })
        },
        cacheData: function (element) {
            if (!element) return;
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.MethodsDetail.defaults, that.options || {})
            } else {
                $(element).off(EVENT_NAMESPACE)
                cache = $.extend(cache, that.options || {})
            }
            $.data(element, CACHE_KEY, cache)
            return cache
        },
        renderDOM: function (element, data = []) {
            let html = `<h4>配置的详情</h4>`;
            $(element).empty().append(html)
        }
    }
    $.fn.extend({
        MethodsDetail: function (options) {
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1)
                return $.fn.MethodsDetail.methods[options](this, args)
            }
            return new MethodsDetail(this, options).init()
        }
    })
    $.fn.MethodsDetail.defaults = {}
    $.fn.MethodsDetail.methods = {}
})(jQuery, window, document)