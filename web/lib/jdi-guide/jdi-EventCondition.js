(function ($, window, document, undefined) {
    const EVENT_NAMESPACE = '.EVENTCONDITION',
        CACHE_KEY = "EVENTCONDITION_CACHE";

    function EventCondition(elements, options) {
        this.$elements = elements;
        this.options = options;
    }
    EventCondition.constructor = EventCondition;
    EventCondition.prototype = {
        init: function () {
            let that = this;
            that.$elements.each(function () {
                let cache = that.cacheData(this)
                that.renderDom(this, cache.data)
            })
        },
        cacheData: function (element) {
            if (!element) return;
            var that = this;
            cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.EventCondition, that.options || {})
            } else {
                $(element).off(EVENT_NAMESPACE)
                cache = $.extend(cache, that.options || {})
            }
            $.data(element, CACHE_KEY, cache)
            return cache;

        },
        renderDom: function (element, data = []) {
            let html = `<h4> 条件配置</h4>`
            $(element).empty().append(html)
        }
    }
    $.fn.extend({
        EventCondition: function (options) {
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1)
                return $.fn.EventCondition.methods[options](this, args)
            }
            return new EventCondition(this, options).init()
        }
    })
    $.fn.EventCondition.defaults = {}
    $.fn.EventCondition.methods = {}

})(jQuery, window, document)