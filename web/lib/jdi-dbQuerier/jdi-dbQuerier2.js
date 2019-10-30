(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".querier2_event",
        CACHE_KEY = "querier2_cache";

    function DbQuerier2(elements, options) {
        this.$elements = elements;
        this.options = options;
    }

    DbQuerier2.prototype.constructor = DbQuerier2;

    DbQuerier2.prototype = {
        init: async function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM(this);
                    that.clear(this)
                    // that.setData(this);
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.dbQuerier2.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        clear: function () {
            $(document).off(EVENT_NAMESPACE);
        },
        //渲染DOM
        renderDOM: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY),
                data = cache.data,
                fieldMode = cache.fieldMode,
                noConditions = cache.noConditions,
                $content = cache.$content,
                queryCondition = cache.queryCondition,
                html = `
                <section class="query queryConfig">
                    <div>
                        <div>
                            <h5 class="query-title">数据库查询配置</h5>
                            <section class="row">
                                <div class="form-horizontal">
                                </div>
                                <div class="querier-content"></div>
                            </section>
                            <footer class="row">
                                <button class="btn btn-primary btn-sm db_save">保存</button>
                                <button class="btn btn-danger btn-sm db_clear">清除</button>
                            </footer>
                        </div>
                    </div>
                </section>
                `;

            $content.find('.queryConfig').remove().end().append(html);
            $(".queryConfig").find(".querier-content").dbQuerier({
                fieldMode: fieldMode || "multi",
                data: data || {},
                noTimeQuery: true,
                isSm: true,
                noExpression: true,
                queryCondition: queryCondition
            }).then(function() {
                if (noConditions) {
                    $content.find('.querier-content').find('.form-group').eq(1).nextAll().hide()
                } else {
                    $content.find('.querier-content').find('.form-group').eq(1).nextAll().show()
                }
            })
            $(".queryConfig").show();
        },

        //绑定事件
        bindEvents: function (element) {
            var that = this;
            $(document).on("click" + EVENT_NAMESPACE, ".query.queryConfig .db_save", {
                element: element
            }, function () {
                var cache = $.data(element, CACHE_KEY);
                var $target = cache.$target;
                if ($target && $target.length > 0) {
                    var data = $(".queryConfig").find(".querier-content").dbQuerier("getData");
                    $target.val(JSON.stringify(data))
                };
                $(".queryConfig").hide();
            });
            $(document).on("click" + EVENT_NAMESPACE, ".query.queryConfig .db_clear", {
                element: element
            }, function () {
                var result = confirm("确定要清除数据库查询配置数据吗？");
                if (!result) return;
                $(".queryConfig").find(".querier-content").dbQuerier("clearData");
            })
        }
    };

    $.fn.extend({
        dbQuerier2: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.dbQuerier2.methods[options](this, args);
            }
            return new DbQuerier2(this, options).init();
        }
    });

    $.fn.dbQuerier2.defaults = {
        disabled: false,
        fieldMode: "multi",
        data: {
            table: null,
            conditions: []
        }
    };

    $.fn.dbQuerier2.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).dbQuerier2({
                    disabled: false
                });
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).dbQuerier2({
                    disabled: true
                });
            });
        },
        setData: function (elements, data) {
            return elements.each(function () {
                $(this).dbQuerier2({
                    data: data[0]
                });
            });
        },
        clearData: function (elements) {
            return elements.each(function () {
                $(this).dbQuerier2({
                    data: null
                });
            });
        },
        getData: function (elements) {
            var $querier = $(elements[0]),
                cache = $.data(elements[0], CACHE_KEY),
                $querierStartTime = $(elements[0]).find(".querier-starttime"),
                $querierEndTime = $(elements[0]).find(".querier-endtime"),
                format = $querierStartTime.data('format') || '',
                now = new Date().toFormatString(format || 'yyyy/mm/dd', false, true),
                queryTime = $(elements[0]).find('[data-name="query_time"]').val() || "",
                fields;
            //获取字段数据
            if (cache.fieldMode === "single") {
                fields = {
                    text: $querier.find(".querier-fields-show :input:checked").val(),
                    value: $querier.find(".querier-fields-real :input:checked").val()
                };
            } else {
                fields = [];
                $querier.find(".querier-fields").find(":input").each(function () {
                    if ($(this).is(":checked")) {
                        fields.push($(this).val());
                    }
                });
            }
            return {
                dbName: $querier.find(".querier-dbName").val(),
                table: $querier.find(".querier-table").val(),
                querierTime: $querierStartTime.length > 0 ? {
                    starttime: $querierStartTime.val() || now,
                    endtime: $querierEndTime.val() || now
                } : {},
                fields: fields,
                conditions: $querier.find(".querier-conditions").conditions("getData"),
                queryTime: queryTime
            };
        }
    };
})(jQuery, window, document);