(function ($, window, document, undefined) {
    const EVENT_NAMESPACE = ".EVENTANDDESC",
        CACHE_KEY = "EVENTANDDESC_CACHE";

    function EventAndDesc(elements, options) {
        this.$elements = elements;
        this.options = options;
    }
    EventAndDesc.constructor = EventAndDesc;
    EventAndDesc.prototype = {
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
                cache = $.extend({}, $.fn.EventAndDesc.defaults, that.options || {})
            } else {
                $(element).off(EVENT_NAMESPACE);
                cache = $.extend(cache, that.options || {});
            }
            $.data(element, CACHE_KEY, cache);
            return cache
        },
        renderDOM: function (element, data = [{
            publish: {},
            subscribe: {}
        }]) {
            let that = this;
            if (!Array.isArray(data)) return `<h4 style="color:red">数据格式不对</h4>`;
            let html = ``;
            data.forEach(function (item) {
                html += `<form class="form-inline">
                            <div class="form-group">
                                <label>触发事件</label>
                                <select class="form-control">
                                    <option value="">请选择</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>事件描述</label>
                                <input type = "text" class="form-control">
                            </div>
                        </form>`
            })
            $(element).empty().append(html)
        },


    }
    $.fn.extend({
        EventAndDesc: function (options) {
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1)
                return $.fn.EventAndDesc.methods[options](this, args)
            }
            return new EventAndDesc(this, options).init()
        }
    })
    $.fn.EventAndDesc.defaults = {

    }
    $.fn.EventAndDesc.methods = {}
})(jQuery, window, document)