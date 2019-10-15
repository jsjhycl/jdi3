(function ($, window, document, undefind) {
    const EVENT_NAMESPACE = ".GUIDE",
        CACHE_KEY = 'GUIDE_CACHE';

    function Guide(elements, options) {
        this.$elements = elements;
        this.options = options;

    }
    Guide.prototype.constructor = Guide;
    Guide.prototype = {
        init: function () {
            let that = this;
            return that.$elements.each(function () {
                let cache = that.cacheData(this)
                that.renderDOM(this, cache.items[0])
            })
        },
        cacheData: function (element) {
            if (!element) return;
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.Guide.defaults, that.options || {})
            } else {
                $(element).off(EVENT_NAMESPACE);
                cache = $.extend(cache, that.options || {});
            }
            $.data(element, CACHE_KEY, cache);
            return cache
        },
        renderDOM: function (element, item) {
            let that = this;
            var html = `<section class="modal-dialog w1200px">
                        <section class="modal-content">
                            <header class="modal-header">
                                 <button class = "close" data-dismiss = "modal" >&times;</button> 
                                 <h4>${item.title}</h4>
                            </header>
                            <section class="modal-body content">
                                
                            </section>
                            <footer class = "modal-footer">
                                <button class = "btn btn-primary prev" ${item.isFirst?"disabled":""} step="${item.step}"> << 上一步</button>
                                <button class = "btn btn-primary next" ${item.isFinally?"disabled":""} step="${item.step}"> 下一步 >> </button>
                            </footer>
                        </section>
                    </section>`
            $(element).empty().append(html);
            that.renderconfig(element, item.guideKey)
            that.bindEvents(element)
        },
        renderconfig: function (element, guideKey) {
            let that = this,
                cache = that.cacheData(element);
            $(element).find(".content")[guideKey]({
                data: cache.data || [],
                items: cache.items,
                type: cache.type
            });
        },
        bindEvents: function (element) {
            var that = this;
            //下一步
            $(element).on("click" + EVENT_NAMESPACE, '.next', function (event) {
                let step = Number($(this).attr("step")) + 1,
                    cache = that.cacheData(element);
                that.renderDOM(element, cache.items[step])
            })
            //上一步
            $(element).on("click" + EVENT_NAMESPACE, '.prev', function (event) {
                let step = Number($(this).attr("step")) - 1,
                    cache = that.cacheData(element);
                that.renderDOM(element, cache.items[step])
            })
        }
    }
    $.fn.extend({
        Guide: function (options) {
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1)
                return $.fn.Guide.methods[options](this, args)
            }
            return new Guide(this, options).init()
        }
    })
    $.fn.Guide.defaults = {
        data: null,
        type: "eventGuide",
        items: [{
                title: "添加事件和事件描述", //模态框标题
                step: 0, //第几步
                isFirst: true, //是不是第一步
                isFinally: false, //是不是最后一步
                guideKey: "eventAndDesc", //
                branch: true, //有木有分支
            },
            {
                title: "事件触发触发条件",
            },
            {
                title: "执行方法"
            },
            {
                title: "配置方法"
            }
        ]
    }
    $.fn.Guide.methods = {}
})(jQuery, window, document)