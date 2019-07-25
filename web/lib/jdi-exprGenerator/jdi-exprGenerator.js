;(function ($, window, document, undefined) {
    /**
     * 函数配置器工具
     * @type {{clear, setArgsTbody, getArgsTbody, effect, convert, handleArgToString}}
     */
    var FunctionUtil = (function () {
        return {
            setArgsTbody: function (fnData, fnType) {
                if(!Object.prototype.toString.call(fnData) === '[object Object]') return
                var $argsTbody = $(".eg .function-table tbody"),
                    $argExample = $(".eg .eg-function .function-example"),
                    argsHtml = "",
                    target = $(".eg .eg-elem.current").data('id'),
                    args = this.getExprArgs(fnData.name, fnType, fnData.async, fnData.voluation, target);
                
                $argExample.text(fnData.example || "");

                if (Array.isArray(fnData.args) && fnData.args.length > 0) {
                    fnData.args.forEach(function(arg, idx) {
                        argsHtml += '<tr>' +
                                        '<td data-name="' + arg.cname + '">' + arg.cname + '</td>' +
                                        '<td data-convert="' + arg.type + '">' + arg.ctype + '</td>' +
                                        '<td>' +
                                            '<input '+ (!!arg.readonly ? "disabled" : "") +' class="form-control" data-type="arg" type="text" name="value" value="'+ ((args && args[idx]) ? args[idx] : (arg.default == undefined ? "" : arg.default)) +'">' +
                                        '</td>' +
                                    '</tr>';
                    });
                    fnData.args[fnData.args.length - 1].auto ? $argsTbody.parent().addClass("manyArgs-table") : $argsTbody.parent().removeClass("manyArgs-table");
                }
                argsHtml += '<tr>' +
                                '<td>是否异步</td>' +
                                '<td>默认</td>' +
                                '<td>' +
                                    '<input type="hidden" class="form-control" disabled data-type="async" value="'+ fnData.async + '">' +
                                    (fnData.async === 1 ? '是' : '否') +
                                '</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td>赋值方式</td>' +
                                '<td>默认</td>' +
                                '<td>' +
                                    '<input type="hidden" class="form-control" disabled data-type="voluation" value="'+ fnData.voluation +'">' +
                                    (fnData.voluation === 1 ? '填充下拉列表' : '赋值文本框') +
                                '</td>' +
                            '</tr>'
                $argsTbody.empty().append(argsHtml);
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
            effect: function (action, $trigger, isRemote) {
                var $eg = $(".eg:visible"),
                    $egFunction = $eg.find(".eg-function"),
                    fWidth = $egFunction.width();
                if (action === "open") {
                    $egInsertFn.css("display", "block").animate({width: fWidth});
                    // if (fWidth <= 0 && isRemote) {
                    //     iWidth <= 0 ? $egContent.animate({width: cWidth - sWidth}) : '';
                    //     $egInsertFn.find('.insert-args').empty();
                    //     $egInsertFn.css("display", "none").width(0);
                    //     $egFunction.css("display", "block").animate({width: sWidth});
                    //     $('.eg .cpanel-body[data-type="remote"] .btn.active, .eg .cpanel-body[data-type="insert"] .btn.active').removeClass("active");
                    //     $trigger.addClass("active");
                    // } else if (iWidth <= 0 && !isRemote) {
                    //   fWidth <= 0 ? $egContent.animate({width: cWidth - sWidth}) : '';
                    //   $egInsertFn.find('.insert-args').empty();
                    //   $egFunction.css("display", "none").width(0);
                    //   $egInsertFn.css("display", "block").animate({width: sWidth});
                    //   $('.eg .cpanel-body[data-type="remote"] .btn.active,.eg .cpanel-body[data-type="insert"] .btn.active').removeClass("active");
                    //   $trigger.addClass("active");
                    // } else {
                    //   if ($trigger.hasClass("active")) {
                    //     $egContent.animate({width: dWidth - sWidth});
                    //       isRemote ? $egFunction.css("display", "none").animate({width: 0})
                    //                : $egInsertFn.css("display", "none").animate({width: 0});
                    //       $trigger.removeClass("active");
                    //     } else {
                    //         $egInsertFn.find('.insert-args').empty();
                    //         $('.eg .cpanel-body[data-type="remote"] .btn.active,.eg .cpanel-body[data-type="insert"] .btn.active').removeClass("active")
                    //         $trigger.addClass("active");
                    //     }
                    // }
                } else {
                    // $egContent.animate({width: dWidth - sWidth});
                    // $egFunction.css("display", "none").animate({width: 0});
                    // $egInsertFn.css("display", "none").animate({width: 0});
                    // $trigger.removeClass("active");
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
            setElemSelected: function(expr, args) {
                var $eg = $('.eg:visible'),
                    expr = expr || $eg.find(".eg-expr").val(),
                    args = args || $eg.find('[data-type="arg"]').map(function() {
                        return $(this).val()
                    }).get().join(','),
                    matches = (expr + ',' + args).match(/[^{]+(?=})/img);
                $eg.find(".eg-elem.selected").removeClass("selected");
                if (matches) {
                    var selector = matches.map(function (item) {
                        return '[data-id="' + item + '"]';
                    }).join(",");
                    $eg.find(selector).addClass("selected");
                }
            },
            getExprArgs(fnName, fnType, async, voluation, target) {
                if (!fnName || !fnType || !target) return false;
    
                var str = '';
                if (fnType === '本地函数') {
                    str = fnName + '\\("'+ target +'"(.+?)\\)'
                } else if (fnType === '远程函数') {
                    str = "functions\\("+ '"'+ target + '"' + "," + '"'+ fnName + '"' + "," + async + "," + voluation + ",(.+?)\\)";
                }
                var expr = $(".eg .eg-expr").val(),
                    argReg = new RegExp(str, 'g'),
                    args = expr.match(argReg);
                console.log(argReg)
                if (args) {
                    return args[0].match(/(\{[A-Z]+\})/g)
                    // return args[0].replace(/\s/g, "").split(",").filter(function(el) { return !!el })
                }
                return false;
            }
        };
    })();

    /**
     *  PS：以下源码注释中，
     *  1、eg表示表达式生成器元素（类名.eg）；
     *  2、eg对话框表示表达式生成器对话框元素（类名.eg-dialog）；
     */
    var EVENT_NAMESPACE = ".eg_event",
        CACHE_KEY = "eg_cache";

    var ExprGenerator = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };
    ExprGenerator.prototype.constructor = ExprGenerator;

    ExprGenerator.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
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
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.exprGenerator.defaults, that.options || {});
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
                    '<h4 class="cpanel-title">表达式</h4>' +
                    '</header>' +
                    '<div class="cpanel-body">' +
                    '<textarea class="eg-expr"></textarea>' +
                    '</div>' +
                    '</div>' +
                    '<footer class="cfooter">' +
                    '<button class="btn btn-default eg-save">确定</button>' +
                    '<button class="btn btn-danger eg-clear">清除</button>' +
                    '</footer>' +
                    '</section>' +
                    '</aside>' +
                    '<section class="eg-function">' +
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
            $(".eg .eg-dialog .eg-sidebar .eg-result .eg-expr").val("");
        },
        clearStyle: function () {
            $(".eg .eg-dialog .eg-page .eg-elem.selected").removeClass("selected");
            $(".eg .eg-dialog .eg-sidebar .eg-toolbar .btn.active").removeClass("active");
            $(".eg .eg-dialog .eg-function .function-args :text.active").removeClass("active");
        },
        setData: function (element) {
            var cache = $.data(element, CACHE_KEY),
                $source = cache.$source,
                $result = cache.$result,
                toolbar = cache.toolbar,
                functions = cache.functions,
                $eg = $(".eg");
            //填充$source来源DOM数据
            if ($source && $source.length > 0) {
                var temp = {},
                    $egPage = $eg.find(".eg-page");
                $egPage.html($source.html()).outerWidth($source.outerWidth()).outerHeight($source.outerHeight());
                $source.find("input").each(function () {
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
                $egPage.find("input").each(function () {
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
            //填充$result结果数据
            if ($result && $result.length > 0) {
                var hasBrace = cache.hasBrace,
                    expr = $result.val();
                if (!hasBrace) {
                    expr = $result.attr("data-expr");
                }
                if (expr) {
                    $eg.find(".eg-expr").val(expr);
                    var matches = expr.match(/[^{]+(?=})/g);
                    if (matches) {
                        var selector = matches.map(function (item) {
                            return '[data-id="' + item + '"]';
                        }).join(",");
                        $eg.find(selector).addClass("selected");
                    }
                }
            }
            //填充工具栏数据
            if (Array.isArray(functions)) {
                this.renderToolBar(functions);
                this.setToolBarData(functions[0]);
            }
        },
        renderToolBar: function(functions) {
            var titles = ""
            if (Array.isArray(functions)) {
                functions.forEach(function(el, idx) {
                    titles += '<div class="fn-types-item btn btn-default '+ (idx === 0 ? "selected" : "") +'" data-type="'+ el.title +'">'+ el.title +'</div>'
                })
            }

            var html = '<div class="cpanel" data-title="配置函数">'+
                            '<header class="cpanel-header">' +
                                '<h4 class="cpanel-title">配置函数</h4>' +
                            '</header>' +
                            '<div class="cpanel-body" data-type="normal">' +
                                '<section class="fn-search">' +
                                    '<input type="text">' +
                                    '<i class="icon icon-search"></i>' +
                                '</section>'+
                                '<section class="fn-types">' +
                                titles +
                                '</section>' +
                                '<section class="fn-category">' +
                                    '<select class="fn-category-select"></select>' +
                                '</section>' +
                                '<section class="fn-wrap">' +
                                '</section>' +
                                '<section>' +
                                    '<div class="fn-desc"></div>' +
                                '</section></div></div>';
            $(".eg").find(".eg-toolbar").empty().append(html);
        },
        setToolBarData: function(fnsData) {
            if (Object.prototype.toString.call(fnsData) !== '[object Object]') return;

            var options = '',
                fnsHtml = '',
                firstFn;
            
                fnsData.title
                ? ($(".eg").find('[data-type="'+ fnsData.title +'"].fn-types-item').addClass("selected").siblings().removeClass("selected"))
                : ($(".eg").find('.fn-types-item').removeClass("selected"));
            
            if (Array.isArray(fnsData.data.categorys)) {
                    fnsData.data.categorys.forEach(function(el) {
                        options += '<option value=' + el + '>' + el + '</option>'
                    });
            }
            if (Array.isArray(fnsData.data.items)) {
                fnsData.data.items.forEach(function(el, index) {
                    if (el.category == fnsData.data.categorys[0]) {
                        !firstFn && (firstFn = el);
                        fnsHtml += '<div class="fn-item" data-name="'+ el.name +'" data-index="'+ index +'" data-type="'+ fnsData.title +'"  data-desc="'+ el.desc +'">'+ (el.cname || el.name) + '（' + el.name + '）</div>'
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
                width = cache.width || 1200,
                height = cache.height || ($(window).height() - top * 2),
                sWidth = $eg.find(".eg-sidebar").width(),
                rHeight = $eg.find(".eg-result").height();
            $eg.css("z-index", zIndex);
            $eg.find(".eg-dialog").css({
                "top": top,
                "z-index": zIndex + 1,
                "width": width,
                "height": height
            });
            $eg.find(".eg-content").width(width - sWidth * 2);
            $eg.find(".eg-content,.eg-sidebar,.eg-toolbar,.eg-result,.eg-function,.eg-insertFn").css("z-index", zIndex + 1);
            $eg.find(".eg-close").css("z-index", zIndex + 2);
            $eg.find(".eg-toolbar").css("bottom", rHeight);
            $eg.find(".eg-function,.eg-insertFn").width(sWidth);
            $eg.fadeIn();
            if (cache.onOpen) {
                cache.onOpen();
            }
        },
        bindEvents: function (element) {
            $(document).off("input focusin" + EVENT_NAMESPACE);
            var that = this;
            //控件元素click事件
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-elem:not(.current)", {element: element}, function (event) {
                event.stopPropagation();
                //判断是不是多选模式
                var cache = $.data(event.data.element, CACHE_KEY);
                // if (cache.multi) {
                //     $(this).addClass("selected");
                // } else {
                //     $(this).toggleClass("selected");
                // }
                
                var $eg = $(".eg:visible"),
                    $arg = $eg.find("[data-type='arg'].active"),
                    $egExpr = $eg.find(".eg-expr"),
                    expr = $egExpr.val(),
                    value = "{" + $(this).attr("data-id") + "}",
                    isActive = $(this).hasClass('selected');
                
                if ($arg.length > 0) {
                    $arg.val($arg.val() === value ? "" : value)
                } else {
                    if(expr.indexOf(value) > -1) {
                        $egExpr.val(expr.replace(new RegExp(value, "g"), ""));
                    } else {
                        that.setExpr($egExpr, $egExpr.get(0), expr, value);
                    }
                }
                FunctionUtil.setElemSelected();
            });
            //类型转换click事件
            $(document).on("click" + EVENT_NAMESPACE, ".eg .cpanel-type .cpanel-body .btn", function (event) {
                event.stopPropagation();
                var $this = $(this),
                    $typeCpanel = $(".eg:visible .cpanel-type"),
                    $operatorCpanel = $(".eg:visible .cpanel-operator");
                $typeCpanel.find(".btn.active").not(this).removeClass("active");
                $this.toggleClass("active");
                if ($this.hasClass("active")) {
                    var value = $this.val();
                    if (value === "数字") {
                        $operatorCpanel.find(".btn").show();
                    } else {
                        $operatorCpanel.find(".btn").hide();
                        $operatorCpanel.find('.btn[value="+"]').show();
                    }
                } else {
                    $operatorCpanel.find(".btn").show();
                }
            });
           
            //表达式元素input事件
            $(document).on("input" + EVENT_NAMESPACE, ".eg .eg-expr, .eg [data-type='arg']", {element: element}, function (event) {
                event.stopPropagation();               
                FunctionUtil.setElemSelected();
            });

            //保存
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-save", {element: element}, function (event) {
                event.stopPropagation();
                var $eg = $(".eg"),
                    cache = $.data(event.data.element, CACHE_KEY),
                    $result = cache.$result;
                if (!$result || $result.length <= 0) return;

                var hasBrace = cache.hasBrace,
                    expr = $eg.find(".eg-expr").val();
                if (!hasBrace) {
                    $result.attr("data-expr", expr);
                    expr = expr.replace(/[{}]/g, "");
                }
                $result.is(":input") ? $result.val(expr) : $result.text(expr);
                $eg.fadeOut();
                if (cache.onSetProperty) {
                    cache.onSetProperty.call(null, expr);
                }
            });
            //清除
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-clear", {element: element}, function (event) {
                event.stopPropagation();
                var result = confirm("确定要清除表达式配置数据吗？");
                if (!result) return;

                // czp修改清除只改变值
                $(".eg .eg-dialog .eg-sidebar .eg-result .eg-expr").val("");
                // var $eg = $(".eg");
                // that.clearData($eg);
                // that.clearStyle($eg);
                // $eg.fadeOut();

                // var cache = $.data(event.data.element, CACHE_KEY),
                //     $result = cache.$result;
                // $result.removeAttr("data-expr");
                // $result.is(":input") ? $result.val("") : $result.text("");
                // if (cache.onClearProperty) {
                //     cache.onClearProperty();
                // }
            });
            //关闭
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-close", {element: element}, function (event) {
                event.stopPropagation();
                $(".eg").fadeOut();
                var cache = $.data(event.data.element, CACHE_KEY);
                if (cache.onClose) {
                    cache.onClose();
                }
            });

            // 选择一级函数分类
            $(document).on("click" + EVENT_NAMESPACE, ".eg .cpanel .fn-types-item", {element: element}, function (event) {
                event.stopPropagation();
                var type = $(this).data('type'),
                    cache = $.data(element, CACHE_KEY);
                    fnsData = cache.functions.filter(function(el) { return el.title == type });
                that.setToolBarData(fnsData[0]);
            });

            // 选择二级函数分类
            $(document).on("change" + EVENT_NAMESPACE, ".eg .cpanel .fn-category-select", {element: element}, function (event) {
                event.stopPropagation();
                var type = $(this).data('type'),
                    val = $(this).val(),
                    cache = $.data(element, CACHE_KEY),
                    fnsData = cache.functions.filter(function(el) { return el.title == type }),
                    fnsHtml = '';
                fnsData[0].data.items.filter(function(el, index) {
                    if(el.category === val) {
                        fnsHtml += '<div class="fn-item" data-name="'+ el.name +'" data-index="'+ index +'" data-type="'+ type +'"  data-desc="'+ el.desc +'">'+ (el.cname || el.name) + '（' + el.name + '）</div>'
                    }
                });
                $(".eg").find(".fn-wrap").empty().append(fnsHtml).find(".fn-item").first().click();
            });
            
            // 选择三级函数分类
            $(document).on("click" + EVENT_NAMESPACE, ".eg .cpanel .fn-item", {element: element}, function (event) {
                event.stopPropagation();
                if ($(this).hasClass('selected')) return;

                var cache = $.data(element, CACHE_KEY),
                    functions = cache.functions,
                    type = $(this).data('type'),
                    idx = $(this).data('index'),
                    fnsData = functions.filter(function(el) { return el.title === type })[0];
                $(".eg .cpanel .fn-item").removeClass('selected');
                $(this).addClass('selected');
                $(".eg .fn-desc").text($(this).data('desc'));
                FunctionUtil.setArgsTbody(fnsData.data.items[idx], type);
                FunctionUtil.setElemSelected();
            });
            
            // 函数搜索
            $(document).on("keydown" + EVENT_NAMESPACE, ".eg .cpanel .fn-search input", {element: element},function (event) {
                event.stopPropagation();
                if (event.keyCode === 13) {
                    var val = $(this).val().trim();
                    if (val) {
                        var functions = $.data(element, CACHE_KEY).functions,
                            html = '';
                        functions.forEach(function(el) {
                            var title = el.title;
                            console.log(el.data.items)
                            el.data.items.forEach(function(fn, idx) {
                                if ((fn.name && fn.name.indexOf(val) > -1) || (fn.cname && fn.cname.indexOf(val) > -1)) {
                                    html += '<div class="fn-item" data-type="'+ title +'" data-name="'+ fn.name +'" data-index="'+ idx +'" data-desc="'+ fn.desc +'">'+ '（'+ el.title +'）' + (fn.cname || fn.name) + '（' + fn.name + '）</div>'
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
            $(document).on("input focusin" + EVENT_NAMESPACE, ".manyArgs-table tbody tr input[data-type='arg']:last", function(event) {
                var $ev = $(event.currentTarget),
                    val = $ev.val();
                if (!$ev) return;
                if (val.trim() != '') {
                    var $clone = $(this).parents('tr').clone(true);
                    $clone.insertAfter($(this).parents('tr')).find("input").val("").removeClass("active");
                }
            });

            //文本框focusin、focusout事件
            $(document).on("focusin" + EVENT_NAMESPACE, ".eg .eg-expr, .eg .eg-function [data-type='arg']", function (event) {
                event.stopPropagation();
                $(".eg .eg-expr, .eg .eg-function [data-type='arg']").removeClass("active");
                $(this).addClass("active");
            });

            //保存函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-function .function-save", function (event) {
                event.stopPropagation();
                var $eg = $(".eg:visible"),
                    $egExpr = $eg.find(".eg-expr")
                    target = $eg.find('.eg-elem.current').data('id'),
                    fnType = $eg.find(".fn-item.selected").data('type'),
                    fnName = $eg.find(".fn-item.selected").data('name'),
                    result = "";
                console.log(fnType, fnName)
                if (!target) return;
                if(!fnName) return alert('无选中函数！');
                var args = $eg.find('[data-type="arg"]').map(function() {
                    var convert = $(this).parent().prev().data('convert'),
                        val = $(this).val();
                    if (/\{(.+?)\}/.test(val)) {
                        return val
                    } else if (convert === 'String') {
                        return '"' + val + '"'
                    } else {
                        return val;
                    }
                }).get().join(',')
                if (fnType === "本地函数") {
                    result = fnName + "("+ '"'+ target + '"' + "," + args +")";
                } else if (fnType === "远程函数"){
                    var async = $eg.find('[data-type="async"]').val(),
                        voluation = $eg.find('[data-type="voluation"]').val();
                    result = "functions("+ '"'+ target + '"' + "," + '"'+ fnName + '"' + "," + async + "," + voluation + "," + args +")";
                }
                that.setExpr($egExpr, $egExpr.get(0), $egExpr.val(), result);
                $(".eg .eg-function [data-type='arg'].active").removeClass("active");
            });

            //清除插入函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-function .function-clear", function (event) {
                $(".eg:visible .eg-function [data-type='arg']").each(function() {
                    $(this).val("").removeClass('active');
                });
            });
        },
        setExpr: function ($elem, elem, expr, value) {
            if (!$elem || $elem.length <= 0 || !elem) return;

            var position = 0;
            if (elem.selectionStart) {
                position = elem.selectionStart;
            } else {
                if (document.selection) {
                    var range = document.selection.createRange();
                    range.moveStart("character", -expr.length);
                    position = range.text.length;
                }
            }
            var result = expr.slice(0, position) + value + expr.substring(position);
            $elem.val(result);
        }
    };

    $.fn.extend({
        exprGenerator: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.exprGenerator.methods[options](this, args);
            }
            return new ExprGenerator(this, options).init();
        }
    });

    $.fn.exprGenerator.defaults = {
        disabled: false,
        top: 20,//eg对话框上偏移量
        zIndex: 9999,//eg对话框z-index值
        width: null,//eg对话框宽度
        height: null,//eg对话框高度
        multi: false,//多选模式
        hasBrace: true,//表达式是否包含大括号
        hasSelf: false,//是否包含自身控件元素
        $source: null,//page数据来源的DOM
        $result: null,//接收表达式的DOM
        toolbar: [],//[{title: "全局变量", show: "normal", data: global},{title: "日期表达式", show: "normal", data: expression}]
        onOpen: function () {
        },
        onClose: function () {
        },
        onSetProperty: function (expr) {
        },
        onClearProperty: function () {
        }
    };

    $.fn.exprGenerator.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).exprGenerator({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).exprGenerator({disabled: true});
            });
        }
    };

})(jQuery, window, document);