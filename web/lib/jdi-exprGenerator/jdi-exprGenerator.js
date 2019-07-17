;(function ($, window, document, undefined) {
    /**
     * 函数配置器工具
     * @type {{clear, setArgsTbody, getArgsTbody, effect, convert, handleArgToString}}
     */
    var FunctionUtil = (function () {
        return {
            clear: function (isInsert) {
              if (isInsert) {
                $(".eg-insert-select").val("");
                $args = $(".insert-args-table input");
                $.each($args, function(index, el) {
                  $(el).val("").removeClass("active");
                });
              } else {
                var $asyncSelect = $(".eg:visible .eg-function .function-async"),
                    $modeSelect = $(".eg:visible .eg-function .function-mode"),
                    $argsTbody = $(".eg:visible .eg-function .function-args tbody");
                $asyncSelect.val(0);
                $modeSelect.val(0);
                $argsTbody.empty();
              }
            },
            setArgsTbody: function (data, args, isRemote) {
                var $argsTbody;
                if (isRemote) {
                  $argsTbody = $(".eg:visible .eg-function .function-args tbody");
                  // $('.eg-insertFn').width(0).hide().next().show();
                } else {
                  $argsTbody = $(".eg-insert-select");
                  // $('.eg-function').width(0).hide().prev().show();
                }
                $argsTbody.empty();
                if (DataType.isObject(data)) {
                    var html = "";
                    if (isRemote) {
                      data.args.forEach(function (item) {
                          var arg = Array.isArray(args) ? args.filter(function (fitem) {
                                  return fitem.name === item.name;
                              })[0] : null,
                              readonly = item.readonly ? ' value="' + item.value + '" readonly' : ' value="' + (arg ? arg.value : "") + '"',
                              str = '<tr>' +
                                  '<td data-name="' + item.name + '">' + item.name + '</td>' +
                                  '<td data-type="' + item.type + '">' + DataType.toText(item.type) + '</td>' +
                                  '<td><input class="form-control" type="text" name="value"' + readonly + '></td>' +
                                  '</tr>';
                      html += str;
                    });
                  } else {
                    html += '<option value="">请选择</option>'
                    data.fns.forEach(function (item) {
                      str = '<option value="' + item.name + '" data-args=' + JSON.stringify(item.args) + ' class="insertFn-' + item.name + '">' + item.name + '</option>';
                      html += str;
                    })
                  }
                    $argsTbody.append(html);
                }
            },
            getArgsTbody: function () {
                var result = [],
                    $argsTbody = $(".eg:visible .eg-function .function-args tbody");
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
                    $egDialog = $eg.find(".eg-dialog"),
                    $egContent = $eg.find(".eg-content"),
                    $egSidebar = $eg.find(".eg-sidebar"),
                    $egFunction = $eg.find(".eg-function"),
                    $egInsertFn = $eg.find(".eg-insertFn"),
                    dWidth = $egDialog.width(),
                    cWidth = $egContent.width(),
                    sWidth = $egSidebar.width(),
                    fWidth = $egFunction.width(),
                    iWidth = $egInsertFn.width();
                if (action === "open") {
                    if (fWidth <= 0 && isRemote) {
                        iWidth <= 0 ? $egContent.animate({width: cWidth - sWidth}) : '';
                        $egInsertFn.find('.insert-args').empty();
                        $egInsertFn.css("display", "none").width(0);
                        $egFunction.css("display", "block").animate({width: sWidth});
                        $('.eg .cpanel-body[data-type="remote"] .btn.active, .eg .cpanel-body[data-type="insert"] .btn.active').removeClass("active");
                        $trigger.addClass("active");
                    } else if (iWidth <= 0 && !isRemote) {
                      fWidth <= 0 ? $egContent.animate({width: cWidth - sWidth}) : '';
                      $egInsertFn.find('.insert-args').empty();
                      $egFunction.css("display", "none").width(0);
                      $egInsertFn.css("display", "block").animate({width: sWidth});
                      $('.eg .cpanel-body[data-type="remote"] .btn.active,.eg .cpanel-body[data-type="insert"] .btn.active').removeClass("active");
                      $trigger.addClass("active");
                    } else {
                      if ($trigger.hasClass("active")) {
                        $egContent.animate({width: dWidth - sWidth});
                          isRemote ? $egFunction.css("display", "none").animate({width: 0})
                                   : $egInsertFn.css("display", "none").animate({width: 0});
                          $trigger.removeClass("active");
                        } else {
                            $egInsertFn.find('.insert-args').empty();
                            $('.eg .cpanel-body[data-type="remote"] .btn.active,.eg .cpanel-body[data-type="insert"] .btn.active').removeClass("active")
                            $trigger.addClass("active");
                        }
                    }
                } else {
                    $egContent.animate({width: dWidth - sWidth});
                    $egFunction.css("display", "none").animate({width: 0});
                    $egInsertFn.css("display", "none").animate({width: 0});
                    $trigger.removeClass("active");
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
                    '<section class="eg-insertFn">' +
                    '<div class="form-group">' +
                    '<label class="control-label">选择函数：</label>' +
                    '<select class="form-control eg-insert-select" placeholder="请选择">' +
                    '<option>' +
                    '</option>' +
                    '</select>' +
                    '<div class="insert-args">' +
                    '</div>' +
                    '<footer class="cfooter">' +
                    '<button class="btn btn-primary insertFn-save">保存</button>' +
                    '<button class="btn btn-danger insertFn-clear">清除</button>' +
                    '</footer>' +
                    '</div>' +
                    '</section>' +
                    '<section class="eg-function">' +
                    '<div class="form-group">' +
                    '<label class="control-label">调用方式：</label>' +
                    '<select class="form-control function-async">' +
                    '<option value="0">同步</option>' +
                    '<option value="1">异步</option>' +
                    '</select>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label class="control-label">赋值方式</label>' +
                    '<select class="form-control function-mode">' +
                    '<option value="0">赋值</option>' +
                    '<option value="1">填充</option>' +
                    '</select>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label class="control-label">参数列表：</label>' +
                    '<table class="table table-bordered table-hover table-responsive ctable function-args">' +
                    '<thead><tr><th>名称</th><th>类型</th><th>值</th></tr></thead>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '</div>' +
                    '<footer class="cfooter">' +
                    '<button class="btn btn-primary function-save">保存</button>' +
                    '<button class="btn btn-danger function-clear">清除</button>' +
                    '</footer>' +
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
            if (toolbar && toolbar.length > 0) {
                var html = "";
                for (var i = 0; i < toolbar.length; i++) {
                    var item = toolbar[i],
                        title = item.title,
                        type = item.type,
                        data = item.data,
                        style = item.style ? " " + item.style : "",
                        cpanel = '<div class="cpanel' + style + '" data-title="' + title + '">' +
                            '<header class="cpanel-header">' +
                            '<h4 class="cpanel-title">' + title + '</h4>' +
                            '</header>' +
                            '<div class="cpanel-body" data-type="' + type + '">';
                    if (type === "remote") {
                        data.forEach(function (ditem) {
                            cpanel += '<button class="btn btn-default" data-profile=\'' + JSON.stringify(ditem) + '\'>' + ditem.desc + '</button>';
                        });
                    } else if (type === "insert") {
                      data.forEach(function (iitem) {
                        cpanel += '<button class="btn btn-default" data-insertFn=\'' + JSON.stringify(iitem) + '\'>' + iitem.desc + '</button>';
                    });
                    } else {
                        for (var key in data) {
                            var value = data[key];
                            cpanel += '<button class="btn btn-default" value="' + value + '">' + key + '</button>';
                        }
                    }
                    cpanel += "</div></div>";
                    html += cpanel;
                }
                $eg.find(".eg-toolbar").append(html);
            }
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
            $eg.find(".eg-content").width(width - sWidth);
            $eg.find(".eg-content,.eg-sidebar,.eg-toolbar,.eg-result,.eg-function,.eg-insertFn").css("z-index", zIndex + 1);
            $eg.find(".eg-close").css("z-index", zIndex + 2);
            $eg.find(".eg-toolbar").css("bottom", rHeight);
            $eg.find(".eg-function,.eg-insertFn").width(0).hide();
            $eg.fadeIn();
            if (cache.onOpen) {
                cache.onOpen();
            }
        },
        bindEvents: function (element) {
            var that = this;
            //控件元素click事件
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-elem:not(.current)", {element: element}, function (event) {
                event.stopPropagation();
                //判断是不是多选模式
                var cache = $.data(event.data.element, CACHE_KEY);
                if (cache.multi) {
                    $(this).addClass("selected");
                } else {
                    $(this).toggleClass("selected");
                }
                var $eg = $(".eg:visible"),
                    $active = $eg.find(".eg-function .function-args :text.active"),
                    $active_insert = $eg.find(".eg-insertFn :text.active"),
                    $egExpr = $eg.find(".eg-expr"),
                    expr = $egExpr.val(),
                    value = "{" + $(this).attr("data-id") + "}";
                if ($active.length > 0) {
                    that.setExpr($active, $active.get(0), $active.val(), value);
                } else if ($active_insert.length > 0) {
                  let val = $active_insert.val(),
                      id = value;
                  if ($(this).hasClass("selected")) {
                    // 选中样式问题
                    that.setExpr($active_insert, $active_insert.get(0), "", "");
                    that.setExpr($active_insert, $active_insert.get(0), $active_insert.val(), value);
                  } else {
                    $active_insert.val(val.replace(new RegExp(id, "g"), ""));
                  }
                } else {
                    if ($(this).hasClass("selected")) {
                        var type = $eg.find('.cpanel-body[data-type="cast"] .btn.active').text(),
                            cast = function (type, value) {
                                if (type === "数字") {
                                    value = "Number(" + value + ")";
                                } else if (type === "字符") {
                                    value = "String(" + value + ")";
                                }
                                return value;
                            };
                        that.setExpr($egExpr, $egExpr.get(0), expr, cast(type, value));
                    } else {
                        $egExpr.val(expr.replace(new RegExp(value, "g"), ""));
                    }
                }
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
            //运算符、全局变量、本地函数click事件
            $(document).on("click" + EVENT_NAMESPACE, '.eg .cpanel-body[data-type="normal"] .btn,.cpanel-body[data-type="local"] .btn', function (event) {
                event.stopPropagation();
                var $eg = $(".eg:visible"),
                    $egExpr = $eg.find(".eg-expr"),
                    value = $(this).val();
                //2017/9/16演示前添加的特殊处理
                var text = $(this).text();
                if (text.indexOf("时间控件") > -1) {
                    var id = $("#property_id").val();
                    value = value.replace("{ID}", id);
                }
                that.setExpr($egExpr, $egExpr.get(0), $egExpr.val(), value);
            });
            //表达式元素input事件
            $(document).on("input" + EVENT_NAMESPACE, ".eg .eg-expr", {element: element}, function (event) {
                event.stopPropagation();               
                var $eg = $(".eg"),
                    expr = $(this).val(),
                    matches = expr.match(/[^{]+(?=})/g);
                $eg.find(".eg-elem.selected").removeClass("selected");
                if (matches) {
                    var selector = matches.map(function (item) {
                        return '[data-id="' + item + '"]';
                    }).join(",");
                    $eg.find(selector).addClass("selected");
                }
            });

            $(document).on("focusin" + EVENT_NAMESPACE, ".eg .eg-expr", {element: element}, function (event) {
                $(".eg .eg-function .function-args :text.active,.eg .eg-insertFn :text.active").removeClass("active");
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
            //面板切换
            $(document).on("click" + EVENT_NAMESPACE, ".eg .cpanel .cpanel-header", function (event) {
                event.stopPropagation();
                $(this).next().slideToggle();
            });
            //打开函数配置面板
            $(document).on("click" + EVENT_NAMESPACE, '.eg .cpanel-body[data-type="remote"] .btn, .eg .cpanel-body[data-type="insert"] .btn', function (event) {
              let isRemote = !!$(event.currentTarget).data('profile');
                event.stopPropagation();
                var $asyncSelect = $(".eg:visible .eg-function .function-async"),
                    $modeSelect = $(".eg:visible .eg-function .function-mode"),
                    $insertSelect = $(".eg:visible .eg-insertFn .eg-insert-select"),
                    profile = isRemote ? $(this).attr("data-profile") || null : $(this).attr("data-insertFn") || null,
                    value = $(this).attr("data-value") || null;
                profile = Common.parseData(profile);
                value = Common.parseData(value);
                if (DataType.isObject(value)) {
                    $asyncSelect.val(value.async || 0);
                    $modeSelect.val(value.mode || 0);
                    // $insertSelect.val();
                    FunctionUtil.setArgsTbody(profile, value.args, isRemote);
                } else {
                    $asyncSelect.val(0);
                    $modeSelect.val(0);
                    $insertSelect.val("");
                    FunctionUtil.setArgsTbody(profile, null, isRemote);
                }
                FunctionUtil.effect("open", $(this), isRemote);
            });

            //函数选择框change事件
            $(".eg .eg-insertFn .eg-insert-select").on("change" + EVENT_NAMESPACE, function(event) {
                let $args = $(".eg .eg-insertFn .insert-args");
                    $args.empty();
                let $curOption = $('.insertFn-' + $(event.currentTarget).val()),
                    args = $curOption.data('args'),
                    str = '',
                    temp = '',
                    // str = '<table class="table insert-args-table"><tr><th>参数</th><th>值</th></tr>',
                    flag = false;
                if ($curOption.length === 0) return;
                args = Array.isArray(args) ? args : Array.prototype.concat([], args);
                args.forEach(function (item, index) {
                  if (item === '...') {
                    let {$1, $2} = Common.cutString(args[index - 1]);
                    item = $1 + ($2 + 1);
                    flag = true;
                  }
                  str += '<tr><td>' + item + '</td><td><input type="text" class="form-control" /></td></tr>'
                })
                str += '</table>';
                if (flag) {
                  temp = '<table class="table insert-args-table manyArgs-table"><tr><th>参数</th><th>值</th></tr>';
                } else {
                  temp = '<table class="table insert-args-table"><tr><th>参数</th><th>值</th></tr>';
                }
                $args.empty().append(temp + str);
            });
            
            // 插入函数的参数中有...，表示有多个相同参数
            $(document).on("input" + EVENT_NAMESPACE, ".manyArgs-table tr:last-child input", function(event) {
              
              let $ev = $(event.currentTarget),
                  val = $ev.val();
              if (!$ev) return;
              if (val.trim() != '') {
                let {$1, $2} = Common.cutString($ev.parent().prev().text());
                $(".eg .eg-insertFn .insert-args .insert-args-table").append(
                  '<tr><td>' + $1 + ($2 + 1) + '</td><td><input class="form-control" /></td></tr>'
                )
              }
            })

            //文本框focusin、focusout事件
            $(document).on("focusin" + EVENT_NAMESPACE, ".eg .eg-function .function-args :text,.eg .eg-insertFn :text", function (event) {
                event.stopPropagation();
                $(".eg .eg-function .function-args :text.active,.eg .eg-insertFn :text.active").removeClass("active");
                $(this).addClass("active");
            });

            //保存函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-function .function-save", function (event) {
                event.stopPropagation();
                var $trigger = $('.eg:visible .cpanel-body[data-type="remote"] .btn.active');
                if ($trigger.length > 0) {
                    var $asyncSelect = $(".eg:visible .eg-function .function-async"),
                        $modeSelect = $(".eg:visible .eg-function .function-mode"),
                        profile = Common.parseData($trigger.attr("data-profile") || null);
                    var data = {
                        id: profile.id,
                        fname: profile.fname,
                        async: parseInt($asyncSelect.val()),
                        mode: parseInt($modeSelect.val()),
                        args: FunctionUtil.getArgsTbody()
                    };
                    $trigger.attr("data-value", JSON.stringify(data));
                    var $eg = $(".eg:visible"),
                        $egExpr = $eg.find(".eg-expr"),
                        value = FunctionUtil.convert(data);
                    that.setExpr($egExpr, $egExpr.get(0), $egExpr.val(), value);
                }
            });

            //清除函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-function .function-clear", function (event) {
                event.stopPropagation();
                var result = confirm("确定要清除远程函数的配置数据吗？");
                if (!result) return;

                FunctionUtil.clear();
                var $trigger = $('.eg:visible .cpanel-body[data-type="remote"] .btn.active');
                if ($trigger.length > 0) {
                    $trigger.attr("data-value", "");
                    FunctionUtil.effect("close", $trigger);
                }
            });

            //保存插入函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-insertFn .insertFn-save", function (event) {
              event.stopPropagation();
              var $trigger = $('.eg:visible .cpanel-body[data-type="insert"] .btn.active');
              if ($trigger.length > 0) {
                  let $select = $(".eg-insert-select"),
                      $args = $(".insert-args-table input"),
                      args = [];
                  $.each($args, function(i, el) {
                      let val = $(el).val().trim()
                      if (val != '') {
                        args.push(val)
                      }
                  });
                  let data = {
                    name: $select.val(),
                    args: args
                  };
                  $trigger.attr("data-value", JSON.stringify(data));
                  var $eg = $(".eg:visible"),
                  $egExpr = $eg.find(".eg-expr"),
                  value = FunctionUtil.convert(data, true);
                  that.setExpr($egExpr, $egExpr.get(0), $egExpr.val(), value);
                  $(".eg .eg-function .function-args :text.active,.eg .eg-insertFn :text.active").removeClass("active");
              }
            });

            //清除插入函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-insertFn .insertFn-clear", function (event) {
                event.stopPropagation();
                var result = confirm("确定要清除插入函数的配置数据吗？");
                if (!result) return;
                FunctionUtil.clear(true);
                var $trigger = $('.eg:visible .cpanel-body[data-type="insert"] .btn.active');
                if ($trigger.length > 0) {
                    $trigger.attr("data-value", "");
                    FunctionUtil.effect("close", $trigger);
                }
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