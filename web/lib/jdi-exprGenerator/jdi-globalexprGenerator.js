;
(function ($, window, document, undefined) {
    /**
     * 函数配置器工具
     * @type {{clear, setArgsTbody, getArgsTbody, effect, convert, handleArgToString}}
     */


    // 解析参数
    function functions(...arg) {
        return arg;
    }

    var FunctionUtil = (function () {
        let dbData;

        function _renderAddon(addonType) {
            if (!addonType) return '';
            let html = ''
            switch (addonType) {
                case 'query':
                    html += '<span class="input-group-addon addon-query" data-config="query" data-mode="multi"></span>'
                    break;
                case 'queryColumn':
                    // html += '<span class="input-group-addon addon-data"  data-placement="left" data-toggle="popover" data-tirgger="click" data-type="'+ addonType +'"></span>'
                    html += '<span class="input-group-addon addon-query" data-config="query" data-mode="column"></span>'
                    break;
            }
            return html;
        }

        return {
            setArgsTbody: function (fnData, fnType, args) {
                if (!Object.prototype.toString.call(fnData) === '[object Object]') return
                var that = this;
                $functionArgs = $(".eg .eg-function .eg-function-args"),
                    $argsTbody = $(".eg .function-table tbody"),
                    $queryConfig = $functionArgs.find(".query-config-content"),
                    $argExample = $(".eg .eg-function .function-example"),
                    argsHtml = "",
                    target = $(".eg .eg-elem.current").data('id'),
                    renderData = Array.prototype.concat([], fnData.args),
                    hasSetArgs = Array.isArray(args);
                // args = this.getExprArgs(fnData.name, fnType, fnData.async, fnData.voluation, target, renderData);
                $functionArgs.show().next().hide();
                $argExample.text(fnData.example || "");

                // 渲染参数
                if (Array.isArray(fnData.args) && fnData.args.length > 0) {

                    // 渲染填充参数
                    if (hasSetArgs) {
                        let discount = args.length - renderData.length;
                        if (discount > 0) {
                            let lastArg = renderData[renderData.length - 1];
                            while (discount > 0) {
                                renderData.push(lastArg);
                                discount--;
                            }
                        }
                    }

                    renderData.forEach(function (arg, idx) {
                        var val = hasSetArgs ? (args[idx] ? JSON.stringify(args[idx]) : '') : arg.default == undefined ? "" : JSON.stringify(arg.default),
                            valHtml = /^{.+[:].+}$/img.test(val) ? `value='${val}'` : `value=${val}`,
                            inputHtml = `<div class="input-group">
                                            <input ${(!!arg.readonly ? "disabled" : "")} class="form-control" data-type="arg" type="text" name="value" ${valHtml}>
                                            ${_renderAddon(arg.addon)}
                                        </div>`;
                        argsHtml += '<tr>' +
                            '<td data-name="' + arg.cname + '">' + arg.cname + '</td>' +
                            '<td data-convert="' + arg.type + '">' + arg.ctype + '</td>' +
                            '<td>' + inputHtml +
                            '</td>' +
                            '</tr>';
                    });
                    fnData.args[fnData.args.length - 1].auto ? $argsTbody.parent().addClass("global-manyArgs-table") : $argsTbody.parent().removeClass("global-manyArgs-table");
                }
                argsHtml += '<tr>' +
                    '<td>是否异步</td>' +
                    '<td>默认</td>' +
                    '<td>' +
                    '<input type="hidden" class="form-control" disabled data-type="async" value="' + fnData.async + '">' +
                    (fnData.async === 1 ? '是' : '否') +
                    '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>赋值方式</td>' +
                    '<td>默认</td>' +
                    '<td>' +
                    '<input type="hidden" class="form-control" disabled data-type="voluation" value="' + fnData.voluation + '">' +
                    (fnData.voluation === 1 ? '填充下拉列表' : '赋值文本框') +
                    '</td>' +
                    '</tr>'
                $argsTbody.empty().append(argsHtml);
                $queryConfig.empty();
                FunctionUtil.effect("open");
            },
            getArgsTbody: function () {
                var result = [],
                    $argsTbody = $(".eg .eg-function .function-args tbody");
                $argsTbody.find("tr").each(function (index, item) {
                    var name = $(item).find("td:nth-child(1)").attr("data-name"),
                        type = $(item).find("td:nth-child(2)").attr("data-type"),
                        value = $(item).find('[name="value"]').val();
                    result.push({
                        name: name,
                        type: type,
                        value: DataType.convert(type, value)
                    });
                });
                return result;
            },
            effect: function (action) {
                var $eg = $(".eg:visible"),
                    $egDialog = $eg.find(".eg-dialog"),
                    $egContent = $eg.find(".eg-content"),
                    $egSidebar = $eg.find(".eg-sidebar"),
                    $egFunction = $eg.find(".eg-function"),
                    dWidth = $egDialog.width(),
                    cWidth = $egContent.width(),
                    sWidth = $egSidebar.width();
                fWidth = $egFunction.width();
                if (action === "open") {
                    if ($egFunction.is(":hidden")) {
                        $egFunction.show();
                        $egContent.animate({
                            width: cWidth - fWidth
                        });
                    }
                } else if (action === "close") {
                    $egContent.animate({
                        width: dWidth - sWidth
                    });
                    $egFunction.hide();
                }
            },
            convert: function (data, isInsert) {
                var that = this,
                    result = "";
                if (DataType.isObject(data)) {
                    var id = $("#property_id").val();
                    if (id) {
                        if (!isInsert) {
                            var args1 = [id.wrap('"'), data.fname.wrap('"'), data.async, data.mode].join(","),
                                args2 = that.handleArgToString(data.args);
                            result = "functions(" + args1 + args2 + ")";
                        } else {
                            result = data.name + '(' + data.args.join(',') + ')';
                        }
                    }
                }
                return result;
            },
            handleArgToString: function (args) {
                if (!Array.isArray(args)) return "";
                var maps = args.map(function (item) {
                    var type = item.type,
                        value = item.value;
                    if (type === "String") {
                        value = (value || "").wrap('"');
                    }
                    return value;
                });
                if (maps.length > 0) return "," + maps.join(",");
                else return "";
            },
            setElemSelected: function (expr, args) {
                var $eg = $('.eg:visible'),
                    expr = expr || $eg.find(".eg-expr").text(),
                    args = args || $eg.find('[data-type="arg"], .queryConfig input').map(function () {
                        let val = $(this).val();
                        let convert = $(this).parent().parent().prev().data('convert');
                        if (/\{[A-Z]{4}\}/mg.test(val)) {
                            return val.replace(/[{}]/img, '')
                        } else if (convert && convert.includes('Element') && /^[A-Z]{4}$/mg.test(val)) {
                            return val;
                        } else return '';
                    }).get().filter(i => i != ''),
                    matches = expr.match(/[^{]([A-Z]+)(?=})/img),
                    ids = [];
                matches && (ids = [...matches]);
                Array.isArray(args) && (ids = [...ids, ...args])
                $eg.find(".eg-elem.selected").removeClass("selected");
                if (ids.length > 0) {
                    var selector = ids.map(function (item) {
                        return '[data-id="' + item + '"]';
                    }).join(",");
                    $eg.find(selector).addClass("selected");
                }
            },
            getExprArgs(fnName, fnType, async, voluation, target) {
                if (!fnName || !fnType || !target) return false;

                var str = '',
                    startIdx = 0;
                if (fnType === '本地函数') {
                    startIdx = 0;
                    str = '(?<=' + fnName + '\\("' + target + '",)(.+?)(?=\\))'
                } else if (fnType === '远程函数') {
                    startIdx = 4
                    str = "(?<=functions\\(" + '"' + target + '")' + "," + '"' + fnName + '"' + "," + async +"," + voluation + ",(.+?)(?=\\))";
                }
                var expr = $(".eg .eg-expr").val(),
                    argReg = new RegExp(str, 'g'),
                    args = expr.match(argReg);

                if (Array.isArray(args)) {
                    return args[0].split(/,(?=[{\w\d]+)/).slice(startIdx).map(el => {
                        var val = /^".+"$/.test(el) ? el.substring(1, el.length - 1) : el;
                        val.endsWith(',') && (val = val.slice(0, val.length - 1));
                        return /^[A-Z]{4,6}$/.test(val) ? `{${val}}` : val
                    })
                }
                return false;
            },
            getDbData: function () {
                dbData = new BuildTableJson.get()
                dbData = new BuildTableJson.removeData(dbData)
                // new FileService().readFile("/profiles/table.json", 'utf-8', function(rst) {
                //     dbData = rst;
                // });
            },
        };
    })();

    /**
     *  PS：以下源码注释中，
     *  1、eg表示表达式生成器元素（类名.eg）；
     *  2、eg对话框表示表达式生成器对话框元素（类名.eg-dialog）；
     */
    var EVENT_NAMESPACE = ".eg_event_global",
        CACHE_KEY = "eg_cache_global";

    var GlobalExprGenerator = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };
    GlobalExprGenerator.prototype.constructor = GlobalExprGenerator;

    GlobalExprGenerator.prototype = {
        init: function () {
            let that = this;
            return that.$elements.each(function () {
                let cache = that.cacheData(this);
                if (!cache.disabled) {
                    FunctionUtil.getDbData();
                    that.renderDOM();
                    that.clearData();
                    that.clearStyle();
                    that.setData(this);
                    that.setStyle(this);
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            let that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.globalExprGenerator.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(document).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        renderDOM: function () {
            var $eg = $(".eg");
            if ($eg.length <= 0) {
                $eg = $('<section class="eg">' +
                    '<div class="eg-dialog">' +
                    '<article class="eg-content">' +
                    '<div class="eg-page"></div>' +
                    '</article>' +
                    '<aside class="eg-sidebar">' +
                    '<i class="eg-close">&times;</i>' +
                    '<section class="eg-toolbar"></section>' +
                    '<section class="eg-result">' +
                    '<div class="cpanel">' +
                    '<header class="cpanel-header">' +
                    '<h4 class="cpanel-title">已配置函数</h4>' +
                    '</header>' +
                    '<div class="cpanel-body">' +
                    // '<textarea class="eg-expr"></textarea>' +
                    '<div class="eg-expr" contenteditable="false"></div>' +
                    '</div>' +
                    '</div>' +
                    '<footer class="cfooter">' +
                    '<button class="btn btn-default eg-save">确定</button>' +
                    '<button class="btn btn-danger eg-clear">清除</button>' +
                    '</footer>' +
                    '</section>' +
                    '</aside>' +
                    '<section class="eg-function">' +
                    '<div class="eg-function-args">' +
                    '<div class="form-group">' +
                    '<label class="control-label">使用案例：</label>' +
                    '<p class="function-example">' +
                    '</p>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label class="control-label">参数列表：</label>' +
                    '<table class="table table-bordered table-hover table-responsive ctable function-table">' +
                    '<thead><tr><th>名称</th><th>类型</th><th>值</th></tr></thead>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '</div>' +
                    '<div class="query-config-content">' +
                    '</div>' +
                    '<footer class="cfooter">' +
                    '<button class="btn btn-primary function-save">保存</button>' +
                    '<button class="btn btn-danger function-clear">清除</button>' +
                    '</footer>' +
                    '</div>' +
                    '</section>' +
                    '</div>' +
                    '</section>'
                );
                $eg.appendTo(document.body);
            }
        },
        clearData: function () {
            $(".eg .eg-dialog .eg-content .eg-page").empty();
            $(".eg .eg-dialog .eg-sidebar .eg-toolbar").empty();
            $(".eg .eg-dialog .eg-sidebar .eg-result .eg-expr").html("");
        },
        clearStyle: function () {
            $(".eg .eg-dialog .eg-page .eg-elem.selected").removeClass("selected");
            $(".eg .eg-dialog .eg-sidebar .eg-toolbar .btn.active").removeClass("active");
            $(".eg .eg-dialog .eg-function .function-args :text.active").removeClass("active");
            $(".eg .queryConfig :text.active").removeClass("active");
            $(".fn-types-item.selected, .fn-item.selected").removeClass('selected');
        },
        setData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY),
                $source = cache.$source,
                $result = cache.$result,
                toolbar = cache.toolbar,
                functions = cache.functions
            $eg = $(".eg");
            //填充$source来源DOM数据
            if ($source && $source.length > 0) {
                var temp = {},
                    $egPage = $eg.find(".eg-page");
                $egPage.html($source.html()).outerWidth($source.outerWidth()).outerHeight($source.outerHeight());
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
                            height: $(this).height()
                        };
                    }
                });
                var cid = $("#property_id").val();
                $egPage.find("input, canvas").each(function () {
                    var id = this.id,
                        item = temp[id];
                    if (item) {
                        var styles = id === cid && !cache.hasSelf ? "eg-elem current" : "eg-elem",
                            $new = $('<a class="' + styles + '" data-id="' + id + '">' + id + '</a>');
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

            //填充工具栏数据
            if (Array.isArray(functions)) {
                this.renderToolBar(functions);
                this.setToolBarData(functions[0]);
                $eg.find(".eg-function").show().end().find(".eg-content").css("width", "calc(100% - 550px)");
            }
        },
        renderToolBar: function (functions) {
            var titles = "";
            if (Array.isArray(functions)) {
                functions.forEach(function (el, idx) {
                    titles += '<div class="fn-types-item btn btn-default ' + (idx === 0 ? "selected" : "") + '" data-type="' + el.title + '">' + el.title + '</div>'
                })
            };

            var html = '<div class="cpanel" data-title="配置函数">' +
                '<header class="cpanel-header">' +
                '<h4 class="cpanel-title">配置函数</h4>' +
                '</header>' +
                '<div class="cpanel-body" data-type="normal">' +
                '<section class="fn-types">' +
                titles +
                '</section>' +
                '<div class="fn-container">' +
                '<section class="fn-search">' +
                '<input type="text">' +
                '<i class="icon icon-search"></i>' +
                '</section>' +
                '<section class="fn-category">' +
                '<select class="fn-category-select"></select>' +
                '</section>' +
                '<section class="fn-wrap">' +
                '</section>' +
                '<section>' +
                '<div class="fn-desc"></div>' +
                '</section></div></div>' +
                '</div>'

            $(".eg").find(".eg-toolbar").append(html);
        },
        setToolBarData: function (fnsData) {
            if (Object.prototype.toString.call(fnsData) !== '[object Object]') return;

            var options = '',
                fnsHtml = '',
                firstFn;

            fnsData.title ?
                ($(".eg").find('[data-type="' + fnsData.title + '"].fn-types-item').addClass("selected").siblings().removeClass("selected")) :
                ($(".eg").find('.fn-types-item').removeClass("selected"));

            if (Array.isArray(fnsData.data.categorys)) {
                fnsData.data.categorys.forEach(function (el) {
                    options += '<option value=' + el + '>' + el + '</option>'
                });
            }
            if (Array.isArray(fnsData.data.items)) {
                fnsData.data.items.forEach(function (el, index) {
                    if (el.category == fnsData.data.categorys[0]) {
                        !firstFn && (firstFn = el);
                        fnsHtml += '<div class="fn-item" data-name="' + el.name + '" data-index="' + index + '" data-type="' + fnsData.title + '"  data-desc="' + el.desc + '">' + (el.cname || el.name) + '（' + el.name + '）</div>'
                    }
                })
            }
            $(".eg").find(".fn-category-select").data('type', fnsData.title).empty().append(options)
                .end().find(".fn-wrap").empty().append(fnsHtml).find(".fn-item:first").addClass("selected")
                .end().end().find(".fn-desc").text(firstFn.desc);
            FunctionUtil.setArgsTbody(firstFn, fnsData.title);
            FunctionUtil.setElemSelected();
        },
        setStyle: function (element) {
            var $eg = $(".eg"),
                cache = $.data(element, CACHE_KEY),
                top = cache.top || 20,
                zIndex = cache.zIndex || 9999,
                width = cache.width || 1300,
                height = cache.height || ($(window).height() - top * 2),
                sWidth = $eg.find(".eg-sidebar").width(),
                rHeight = $eg.find(".eg-result").height(),
                pageWidth = $eg.find(".eg-page").width();
            $eg.css("z-index", zIndex);
            $eg.find(".eg-dialog").css({
                "top": top,
                "z-index": zIndex + 1,
                "width": width,
                "height": height
            });
            $eg.find(".eg-content,.eg-sidebar,.eg-toolbar,.eg-result,.eg-function,.eg-insertFn").css("z-index", zIndex + 1);
            $eg.find(".eg-close").css("z-index", zIndex + 2);
            $eg.find(".eg-toolbar").css("bottom", rHeight);
            $eg.find(".eg-dialog").width(pageWidth * .75 + sWidth * 2);
            $eg.fadeIn();
            if (cache.onOpen) {
                cache.onOpen();
            }
        },
        bindEvents: function (element) {
            $(document).off("input" + EVENT_NAMESPACE);
            $(document).off("focusin" + EVENT_NAMESPACE);
            var that = this;

            //控件元素click事件
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-elem", {
                element: element
            }, function (event) {
                event.stopPropagation();
                //判断是不是多选模式
                var $eg = $(".eg:visible"),
                    $arg = $eg.find("[data-type='arg'].active, .queryConfig .active"),
                    $egExpr = $eg.find(".eg-expr"),
                    expr = $egExpr.val(),
                    dataId = $(this).attr("data-id"),
                    value = '';
                if ($arg.length > 0) {
                    var valueType = $arg.parent().parent().prev().attr('data-convert');
                    value = valueType === 'ElementNoWrap' ? dataId : "{" + dataId + "}";
                    $arg.val($arg.val() === value ? "" : value).trigger("input");
                } else {
                    value = "{" + dataId + "}";
                    if (expr.indexOf(value) > -1) {
                        $egExpr.val(expr.replace(new RegExp(value, "g"), ""));
                    } else {
                        that.setExpr($egExpr, $egExpr.get(0), expr, value, null, true);
                    }
                }
                FunctionUtil.setElemSelected();
            });
            //表达式元素input事件
            $(document).on("input" + EVENT_NAMESPACE, ".eg .eg-expr, .eg [data-type='arg']", {
                element: element
            }, function (event) {
                event.stopPropagation();
                FunctionUtil.setElemSelected();
            });

            //保存
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-save", {
                element: element
            }, function (event) {
                // event.stopPropagation();
                // var $eg = $(".eg"),
                //     $expr = $eg.find(".eg-expr"),
                //     children = $expr.get(0).childNodes,
                //     expr = '';
                //     cache = $.data(event.data.element, CACHE_KEY),
                //     $result = cache.$result,
                //     $resultFunction = cache.$resultFunction;

                // // 处理 expr
                // children.forEach(i => {
                //     if (i.tagName && i.tagName.toUpperCase() === 'SPAN') {
                //         expr += decodeURI($(i).attr('data-fn'));
                //     } else {
                //         expr += i.textContent;
                //     }
                // });

                // if (!$result || $result.length <= 0) {
                //     if ($resultFunction && expr) {
                //         var fnName = '';
                //         if (expr.startsWith('functions')) {
                //             var args = expr.match(/(?<=functions\()(.+?)(?=\))/);
                //             args && args[0] && (fnName = args[0].split(',')[1]);
                //             fnName && (fnName = fnName.replace(/"/g, ""));
                //         }  else {
                //             var fnNames = expr.match(/([A-Za-z.]+)(?=\(.*\))/);
                //             Array.isArray(fnNames) && (fnName = fnNames[0]);
                //         }
                //         $resultFunction.call(null, fnName, expr);
                //     }
                //     $eg.fadeOut();
                // } else {
                //     var hasBrace = cache.hasBrace;
                //     if (!hasBrace) {
                //         $result.attr("data-expr", expr);
                //         expr = expr.replace(/[{}]/g, "");
                //     }
                //     $result.is(":input") ? $result.val(expr) : $result.text(expr);
                //     $eg.fadeOut();
                //     if (cache.onSetProperty) {
                //         cache.onSetProperty.call(null, expr);
                //     }
                // };
            });
            //清除
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-clear", {
                element: element
            }, function (event) {
                event.stopPropagation();
                var result = confirm("确定要清除表达式配置数据吗？");
                if (!result) return;

                // czp修改清除只改变值
                $(".eg .eg-dialog .eg-sidebar .eg-result .eg-expr").empty();
            });
            //关闭
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-close", {
                element: element
            }, function (event) {
                event.stopPropagation();
                $(".eg").fadeOut();
                var cache = $.data(event.data.element, CACHE_KEY);
                if (cache.onClose) {
                    cache.onClose();
                }
            });

            // 选择一级函数分类
            $(document).on("click" + EVENT_NAMESPACE, ".eg .cpanel .fn-types-item", {
                element: element
            }, function (event) {
                event.stopPropagation();
                var $eg = $('.eg:visible');
                if ($eg.find(".eg-system-list").is(":visible")) $eg.find(".fn-system-more").click();
                var type = $(this).data('type'),
                    cache = $.data(element, CACHE_KEY);
                fnsData = cache.functions.filter(function (el) {
                    return el.title == type
                });
                that.clearStyle();
                $(".fn-container").slideDown('fast');
                that.setToolBarData(fnsData[0]);
            });

            // 选择二级函数分类
            $(document).on("change" + EVENT_NAMESPACE, ".eg .cpanel .fn-category-select", {
                element: element
            }, function (event, noRenderFnList) {
                event.stopPropagation();
                var type = $(this).data('type'),
                    val = $(this).val(),
                    cache = $.data(element, CACHE_KEY),
                    fnsData = cache.functions.filter(function (el) {
                        return el.title == type
                    }),
                    fnsHtml = '',
                    $fnWrap = $(".eg").find(".fn-wrap");
                fnsData[0].data.items.filter(function (el, index) {
                    if (el.category === val) {
                        fnsHtml += '<div class="fn-item" data-name="' + el.name + '" data-index="' + index + '" data-type="' + type + '"  data-desc="' + el.desc + '">' + (el.cname || el.name) + '（' + el.name + '）</div>'
                    }
                });
                $fnWrap.empty().append(fnsHtml);
                !noRenderFnList && $fnWrap.find(".fn-item").first().click();
            });

            // 选择三级函数分类
            $(document).on("click" + EVENT_NAMESPACE, ".eg .cpanel .fn-item", {
                element: element
            }, function (event, args) {
                event.stopPropagation();
                if ($(this).hasClass('selected')) return;

                var cache = $.data(element, CACHE_KEY),
                    functions = cache.functions,
                    type = $(this).data('type'),
                    idx = $(this).data('index'),
                    fnsData = functions.filter(function (el) {
                        return el.title === type
                    })[0];
                $(".eg .cpanel .fn-item").removeClass('selected');
                $(this).addClass('selected');
                $(".eg .fn-desc").text($(this).data('desc'));
                FunctionUtil.setArgsTbody(fnsData.data.items[idx], type, args && args.args);
                FunctionUtil.setElemSelected();
            });

            // 函数搜索
            $(document).on("keydown" + EVENT_NAMESPACE, ".eg .cpanel .fn-search input", {
                element: element
            }, function (event) {
                event.stopPropagation();
                if (event.keyCode === 13) {
                    var val = $(this).val().trim();
                    if (val) {
                        var functions = $.data(element, CACHE_KEY).functions,
                            html = '';
                        functions.forEach(function (el) {
                            var title = el.title;
                            el.data.items.forEach(function (fn, idx) {
                                if ((fn.name && fn.name.indexOf(val) > -1) || (fn.cname && fn.cname.indexOf(val) > -1)) {
                                    html += '<div class="fn-item" data-type="' + title + '" data-name="' + fn.name + '" data-index="' + idx + '" data-desc="' + fn.desc + '">' + '（' + el.title + '）' + (fn.cname || fn.name) + '（' + fn.name + '）</div>'
                                }
                            })
                        });
                        $(".eg").find(".fn-wrap").empty().append(html)
                            .end().find(".fn-types-item").removeClass("selected")
                            .end().find(".fn-category-select").empty()
                            .end().find(".fn-item:first").click();
                        FunctionUtil.setElemSelected();
                    }
                }
            });

            // 插入函数的参数中有...，表示有多个相同参数
            // 重复写是因为事件无法关闭。
            $(document).on("input" + EVENT_NAMESPACE, ".global-manyArgs-table tbody tr input[data-type='arg']:last", function (event) {

                var $ev = $(event.currentTarget),
                    val = $ev.val();
                if (!$ev) return;
                if (val.trim() != '') {
                    var $clone = $(this).parents('tr').clone(true);
                    $clone.insertAfter($(this).parents('tr')).find("input").val("").removeClass("active");

                }
            });
            $(document).on("focusin" + EVENT_NAMESPACE, ".global-manyArgs-table tbody tr input[data-type='arg']:last", function (event) {
                console.log('触发了 focusin')
                var $ev = $(event.currentTarget),
                    val = $ev.val();
                if (!$ev) return;
                if (val.trim() != '') {
                    var $clone = $(this).parents('tr').clone(true);
                    $clone.insertAfter($(this).parents('tr')).find("input").val("").removeClass("active");
                }
            });

            //文本框focusin、focusout事件
            $(document).on("focusin" + EVENT_NAMESPACE, ".eg .eg-expr, .eg .eg-function [data-type='arg'], .queryConfig input", function (event) {
                event.stopPropagation();
                $(".eg .eg-expr, .eg .eg-function [data-type='arg']").removeClass("active");
                $(".eg .queryConfig input").removeClass("active");
                $(this).addClass("active");
            });

            //保存函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-function .function-save", {
                element: element
            }, function (event) {
                event.stopPropagation();
                var cache = $.data(element, CACHE_KEY),
                    replaceResult = !!cache.replaceResult,
                    $eg = $(".eg:visible"),
                    $egExpr = $eg.find(".eg-expr"),
                    fnType = $eg.find(".fn-item.selected").data('type') || $eg.find(".fn-system-item.selected").data('type'),
                    fnName = $eg.find(".fn-item.selected").data('name') || $eg.find(".fn-system-item.selected").data('name'),
                    isManyArgsTable = $eg.find(".eg-function-args table").hasClass("global-manyArgs-table"),
                    result = "";
                if (!fnName) return alert('无选中函数！');
                // 参数为对象时，不转换
                var args = $eg.find('[data-type="arg"]').map(function () {
                    var convert = $(this).parent().prev().data('convert'),
                        isCheckbox = $(this).is(':checkbox'),
                        val = !isCheckbox ? $(this).val() : $(this).is(':checked');
                    if (/\{(.+?)\}/.test(val)) {
                        return val;
                    } else if (convert === 'Number') {
                        return Number(val);
                    } else if (convert === 'Boolean') {
                        return !!val;
                    } else return '"' + val + '"';
                }).get();
                isManyArgsTable && args[args.length - 1] === '""' && args.splice(args.length - 1, 1)
                argsString = args.join(',');
                if (fnType === "本地函数") {
                    result = fnName + "(" + '"' + target + '"' + "," + argsString + ")";
                } else if (fnType === "远程函数") {
                    var async = $eg.find('[data-type="async"]').val(),
                        voluation = $eg.find('[data-type="voluation"]').val();
                    result = "functions(" + '"' + target + '"' + "," + '"' + fnName + '"' + "," + async +"," + voluation + "," + argsString + ")";
                } else if (fnType === "系统函数") {
                    result = fnName + "(" + argsString + ")"
                }

                if (fnType === "系统函数") {
                    that.setExpr($egExpr, $egExpr.get(0), $egExpr.html(), result, replaceResult);
                } else {
                    // 参数为对象时，不转换
                    let argsArr = $eg.find('[data-type="arg"]').map(function () {
                        var convert = $(this).parent().prev().data('convert'),
                            isCheckbox = $(this).is(':checkbox'),
                            val = !isCheckbox ? $(this).val() : $(this).is(':checked');
                        if (/\{([^,]+)\}/.test(val)) {
                            return val;
                        } else if (convert === 'Number') {
                            return Number(val);
                        } else if (convert === 'Boolean') {
                            return !!val;
                        } else {
                            try {
                                return JSON.parse(val);
                            } catch (err) {
                                return val
                            }
                        };
                    }).get();
                    that.setExpr($egExpr, $egExpr.get(0), $egExpr.html(), that.generatExprFn(fnName, result, argsArr), replaceResult);
                }

                $(".eg .eg-function [data-type='arg'].active").removeClass("active");
            });

            //清除插入函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-function .function-clear", function (event) {
                $(".eg:visible .eg-function [data-type='arg']").each(function () {
                    $(this).val("").removeClass('active');
                });
            });


            // 依赖  插件
            (function () {
                $(".eg:visible .eg-dialog").resizable({
                    handles: 'all'
                });

                /* 和 contenteditable 冲突 */
                $(".eg:visible .eg-dialog").draggable();

            })();

            // 数据源
            $(document).on("click" + EVENT_NAMESPACE, '.eg .eg-function [data-config="query"]', {
                element: element
            }, function (event) {
                var $this = $(this),
                    $input = $this.prev('input'),
                    mode = $this.data('mode'),
                    $content = $('.eg:visible .query-config-content'),
                    val = $input.val(),
                    data = null;
                try {
                    data = JSON.parse(val);
                } catch (err) {};

                $content.is(":empty") ?
                    $(this).dbQuerier2({
                        $target: $input,
                        data: data || {},
                        $content: $content,
                        fieldMode: mode
                    }) :
                    $content.empty()
            });

            // 表达式中的函数点击查看参数
            $(document).on('click' + EVENT_NAMESPACE, '.eg-expr .expr-fn-item', {
                element: element
            }, function (event) {
                let $eg = $(".eg"),
                    $this = $(this),
                    fnName = $this.data('fn_name'),
                    fnType = decodeURI($this.data('fn')).startsWith('functions') ? '远程函数' : '本地函数',
                    functions = $.data(element, CACHE_KEY).functions,
                    searchData = functions.filter(i => i.title === fnType)[0].data,
                    fnIdx = searchData.items.findIndex(i => {
                        return i.name === fnName
                    }),
                    fnCate = searchData.items[fnIdx].category,
                    args = decodeURI($this.data('fn_args'));
                try {
                    let _args = JSON.parse(args);
                    args = _args;
                } catch (err) {}
                $eg.find(`.fn-types-item[data-type="${fnType}"]`).trigger('click');
                $eg.find('.fn-category-select').val(fnCate).trigger('change', true);
                $eg.find(`.fn-item[data-name="${fnName}"]`).trigger('click', {
                    args: args
                });
            })
        },
        setExpr: function ($elem, elem, expr, value, replaceExpr, isDom) {
            if (!$elem || $elem.length <= 0 || !elem) return;
            expr = $elem.html();
            $elem.append(value);
        },
        generatExprFn: function (fnName, fnData, args) {
            if (!fnName || !fnData) return;

            let len = $(".eg-expr").find(`span[data-fn_name=${fnName}]`).length,
                newFnName = fnName;
            len > 0 && (newFnName = fnName + `(${len})`);

            if (Array.isArray(args)) {
                args = args.map(i => {
                    return DataType.isObject(i) && i[Object.keys(i)[0]].nodeType != undefined ? ('{' + Object.keys(i)[0] + '}') : i;
                })
            };
            let $span = $(`<span contenteditable="false" data-fn_name="${fnName}" data-fn=${encodeURI(fnData)} data-fn_args=${encodeURI(JSON.stringify(args))} class="expr-fn-item">${newFnName}</span>`);
            return $span.get(0).outerHTML + " ";
        },
        convertExpr: function (expr, cacheFns) {
            if (!expr) return "";
            let that = this;
            return expr.replace(/[a-zA-Z]*?\(([^)]*)\)/img, function () {
                let fn = arguments[0];

                // 远程函数
                if (fn.startsWith('functions')) {
                    try {
                        let args = eval(fn) || [];
                        if (Array.isArray(args) && args[1] && that.isBuiltInFn(fn, args[1], cacheFns)) {
                            return that.generatExprFn(args[1], fn, args.slice(4));
                        } else return fn;
                    } catch (err) {
                        throw ('解析远程函数出错: ', err)
                    }
                } else {
                    // 本地函数
                    let localFnName = fn.match(/(^[a-zA-Z]+)(?=\(.*\))/img);
                    if (!localFnName) return;
                    localFnName = localFnName[0];
                    if (that.isBuiltInFn(fn, localFnName, cacheFns)) {
                        try {
                            eval('function ' + localFnName + '(...args) { return args }');
                            let args = eval(fn);
                            return that.generatExprFn(localFnName, fn, args.slice(1))
                        } catch (err) {
                            throw ('解析本地函数出错！', err);
                        }
                    } else return fn;
                }
            })
        },
        isBuiltInFn: function (fn, fnName, cacheFns) {
            let isRemote = fn.startsWith('functions'),
                fns = cacheFns.filter(i => i.title === (isRemote ? '远程函数' : '本地函数'));
            return fns && fns[0].data.items.findIndex(i => {
                return i.name === fnName;
            }) > -1;
        }
    };

    $.fn.extend({
        globalExprGenerator: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.globalExprGenerator.methods[options](this, args);
            }
            return new GlobalExprGenerator(this, options).init();
        }
    });

    $.fn.globalExprGenerator.defaults = {
        disabled: false,
        top: 20,
        zIndex: 1050,
        width: null,
        height: null,
        multi: false,
        hasBrace: true,
        hasSelf: false,
        $source: null,
        $result: null,
        toolbar: [],
        onOpen: function () {},
        onClose: function () {},
        onSetProperty: function (expr) {},
        onClearProperty: function () {}
    };

    $.fn.globalExprGenerator.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).globalExprGenerator({
                    disabled: false
                });
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).globalExprGenerator({
                    disabled: true
                });
            });
        }
    };

})(jQuery, window, document);