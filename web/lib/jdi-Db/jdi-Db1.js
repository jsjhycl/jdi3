(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".JDI_DB1",
        CACHE_KEY = "jdiDb1_cache";

    function Db1(elements, options) {
        this.elements = elements;
        this.options = options;
    }
    Db1.prototype.constructor = Db1;
    Db1.prototype = {
        init: function () {
            var that = this;
            return that.elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM(this)
                    that.clear(this)
                    that.bindEvents(this)
                }
            })
        },
        cacheData: function (element) {
            var that = this;
            cache = $.data(element, CACHE_KEY)
            if (!cache) {
                cache = $.extend({}, $.fn.Db1.defaults, that.options || {})
            } else {
                cache = $.extend(cache, that.options || {})
            }
            $(element).off(EVENT_NAMESPACE)
            $.data(element, CACHE_KEY, cache)
            return cache
        },
        clear: function () {
            $(document).off(EVENT_NAMESPACE)
        },
        renderDOM: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY),
                data = cache.data,
                $content = cache.$content,
                $input = cache.$target,
                queryCondition = cache.queryCondition,
                html = `<section class="Db2 queryConfig">
                            <div>
                                <h5 class="query-title">数据库查询配置</h5>
                                <section class="row">
                                    <div class="form-horizontal"></div>
                                    <div class="Db-content">
                                        <div class="Db"></div>
                                        <div class="condition form-group"></div>
                                    </div>
                                </section>
                                <footer class="row" style="margin-top:10px">
                                    <button class="btn btn-primary btn-sm db_save">保存</button>
                                    <button class="btn btn-primary btn-sm db_clear">清除</button>
                                </footer>
                            </div>
                        </section>`;

            $content.find(".queryConfig").remove().end().append(html)
            $(".queryConfig").find(".Db-content .Db").Db({
                $target: $input,
                data: data || {},
                $content: $content.find(".Db-content .Db"),
                isSm: true,
                Db: AllDbName
            })
            $(".queryConfig").find(".Db-content .condition").conditions({
                mode: 4,
                dbName: data.dbName,
                table: data.table,
                data: data.conditions,
                queryCondition: queryCondition,
            })
        },
        bindEvents: function (element) {
            var that = this;
            $(document).on("click" + EVENT_NAMESPACE, ".Db2.queryConfig .db_save", {
                element: element
            }, function () {
                var cache = $.data(element, CACHE_KEY),
                    $target = cache.$target;
                if ($target && $target.length > 0) {
                    var data = $(".queryConfig .Db").Db("getData")
                    var condition = $(".queryConfig .condition").conditions("getData")
                    data.conditions = condition;
                    console.log(data)
                    $target.val(JSON.stringify(data))
                }
            })
            $(document).on("change" + EVENT_NAMESPACE, ".tableName", {
                element: element
            }, function () {
                var dbName = $(document).find(".dbName").val(),
                    tableName = $(this).val();
                $(".queryConfig").find(".Db-content .condition").conditions({
                    mode: 4,
                    dbName: dbName,
                    table: tableName,
                    data: null,
                    queryCondition: null,
                })
            })

        }
    }
    $.fn.extend({
        Db1: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1)
                return $.fn.Db1.methods[options](this, args);
            }
            return new Db1(this, options).init();
        }
    })
    $.fn.Db1.defaults = {
        disabled: false,
        data: {
            table: null,
            conditions: []
        }
    }
    $.fn.Db1.methods = {

    }
})(jQuery, window, document)