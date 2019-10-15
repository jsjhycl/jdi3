(function ($, window, document, undefined) {
    const EVENT_NAMESPACE = '.EVENTMeTHODS',
        CACHE_KEY = "EVENTMETHODS_CACHE";

    function EventMehods(elements, options) {
        this.$elements = elements;
        this.options = options
    }
    EventMehods.constructor = EventMehods;
    EventMehods.prototype = {
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
                cache = $.extend({}, $.fn.EventMehods.defaults, that.options || {})
            } else {
                $(element).off(EVENT_NAMESPACE)
                cache = $.extend(cache, that.options || {})
            }
            $.data(element, CACHE_KEY, cache)
            return cache
        },
        renderDOM: function (element, data = []) {
            let html = `<h4>执行方法</h4>`;
            $(element).empty().append(html)
        }
    }
    $.fn.extend({
        EventMehods: function (options) {
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1)
                return $.fn.EventMehods.methods[options](this, args)
            }
            return new EventMehods(this, options).init()
        }
    })
    $.fn.EventMehods.defaults = {}
    $.fn.EventMehods.methods = {}
})(jQuery, window, document)