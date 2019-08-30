;(function ($, window, document, undefined) {
    /**
     * 函数配置器工具
     * @type {{clear, setArgsTbody, getArgsTbody, effect, convert, handleArgToString}}
     */
    var FunctionUtil = (function () {
        let dbData;

        function _renderSelect(data) {
            if (!Array.isArray(data)) return '<p>未获取到数据！</p>';
            return `
            <select data-select="result" class="form-control">
                ${data.map(i => {
                    return `<option value="${i.value}">${i.name}</option>`
                })}
            </select>
            `
        }
        return {
            setArgsTbody: function (fnData, fnType) {
                if(!Object.prototype.toString.call(fnData) === '[object Object]') return
                var that = this;
                    $functionArgs = $(".eg .eg-function .eg-function-args"),
                    $argsTbody = $(".eg .function-table tbody"),
                    $queryConfig = $functionArgs.find(".query-config-content"),
                    $argExample = $(".eg .eg-function .function-example"),
                    argsHtml = "",
                    target = $(".eg .eg-elem.current").data('id'),
                    renderData = Array.prototype.concat([], fnData.args);
                    // args = this.getExprArgs(fnData.name, fnType, fnData.async, fnData.voluation, target, renderData);
                $functionArgs.show().next().hide();
                $argExample.text(fnData.example || "");
                if (Array.isArray(fnData.args) && fnData.args.length > 0) {
                    renderData.forEach(function(arg, idx) {
                        var typeHtml = arg.type === "Query" ? ('<button data-config="Query" class="btn btn-default btn-sm">'+ arg.ctype +'</button>') : arg.ctype,
                            inputHtml = `<div class="input-group">
                                            <input ${(!!arg.readonly ? "disabled" : "")} class="form-control" data-type="arg" type="text" name="value" value='${arg.default == undefined ? "" : arg.default}'>
                                            ${arg.addon ? '<span class="input-group-addon"  data-placement="left" data-toggle="popover" data-tirgger="click" data-type="'+ arg.addon +'">按钮</span>' : '' }
                                        </div>`;
                        argsHtml += '<tr>' +
                                        '<td data-name="' + arg.cname + '">' + arg.cname + '</td>' +
                                        '<td data-convert="' + arg.type + '">' + typeHtml + '</td>' +
                                        '<td>' + inputHtml +
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
                $queryConfig.empty();
                FunctionUtil.effect("open");

                $('[data-toggle="popover"]').popover('destroy')
                $('[data-toggle="popover"]').popover({
                    contaienr: 'body',
                    html: true,
                    template: '<div class="popover" style="width: 200px;"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                    title: function() {
                        let type = $(this).data('type'),
                            _title = '';

                        switch (type) {
                            case 'dbName':
                                _title = '数据库';
                                break;
                            case 'tableName':
                                _title = '表';
                                break;
                            case 'colName':
                                _title = '列'
                                break;
                        }
                        return `请选择${_title}`;
                    },
                    content: function() {
                        return that.setPopoverContent($(this), $(this).data('type'), dbData);
                    },
                })
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
                        $egContent.animate({width: cWidth - fWidth});
                    }
                } else if (action === "close") {
                    $egContent.animate({width: dWidth - sWidth});
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
            setElemSelected: function(expr, args) {
                var $eg = $('.eg:visible'),
                    expr = expr || $eg.find(".eg-expr").val(),
                    args = args || $eg.find('[data-type="arg"], .queryConfig input').map(function() {
                        return $(this).val()
                    }).get().join(','),
                    matches = (expr + ',' + args).match(/[^{]([A-Z]+)(?=})/img);
                
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
    
                var str = '',
                    startIdx = 0;
                if (fnType === '本地函数') {
                    startIdx = 0;
                    str = '(?<=' + fnName + '\\("'+ target +'",)(.+?)(?=\\))'
                } else if (fnType === '远程函数') {
                    startIdx = 4
                    str = "(?<=functions\\("+ '"'+ target + '")' + "," + '"'+ fnName + '"' + "," + async + "," + voluation + ",(.+?)(?=\\))";
                }
                var expr = $(".eg .eg-expr").val(),
                    argReg = new RegExp(str, 'g'),
                    args = expr.match(argReg);
                
                if (Array.isArray(args)) {
                    return args[0].split(/,(?=[{\w\d]+)/).slice(startIdx).map(el => {
                        var val = /^".+"$/.test(el) ? el.substring(1, el.length - 1) : el;
                        val.endsWith(',') && (val = val.slice(0, val.length - 1));
                        return  /^[A-Z]{4,6}$/.test(val) ? `{${val}}` : val
                    })
                }
                return false;
            },
            renderSystemFnList(fns) {
                if (!Array.isArray(fns)) return;

                var html = '';
                fns.forEach(function(el) {
                    html += `<div class="btn btn-default fn-system-item" data-type="系统函数" data-name="${el.name}" data-cname="${el.cname}">${el.cname}</div>`
                });
                $(".eg .eg-function .eg-system-list").empty().append(html);
            },
            setSystemStatus(clear) {
                clear = !!clear;
                if (clear) return $(".eg .fn-system-item").removeClass("canAdd canDel");

                var $origin = $('.eg .eg-system-list'),
                    $target = $('.eg .fn-system').find(".fn-system-item"),
                    target = $target.map(function() { return $(this).data("name") }).get();
                $origin.find('.fn-system-item').each(function() {
                    var name = $(this).data("name");
                    $(this).removeClass("canAdd").addClass(target.includes(name) ? "" : "canAdd");
                });
            },
            getSystemFnOrder(fns) {
                if (!Array.isArray(fns)) return;
                var target = $(".eg .fn-system .fn-system-item").map(function() {
                    return $(this).data('cname');
                }).get();
                fns.forEach(function(el) {
                    var index = target.indexOf(el.cname);
                    el.index = index > -1 ? index : 9999;
                });
                return fns;
            },

            setPopoverContent: function($el, type, _dbData) {
                
                if (!_dbData) return '<p>获取配置文件错误!</p>';
                let html = '',
                    trIdx = $el.parents('tr').index();
                switch (type) {
                    case 'dbName':
                        let dbNames = Object.keys(_dbData);
                        dbNames = dbNames.map(i => { return { name: i, value: i } })
                        html = _renderSelect(dbNames) + `<button data-type="popover_save" data-resultTr="${trIdx}" class="btn btn-default btn-sm">保存</button>`
                    break;
                    case 'tableName':
                        let _dbName = $el.parents('tr').prev().find('input[data-type="arg"]').val(),
                            tableNames = _dbData[_dbName] && Object.keys(_dbData[_dbName]).filter(el => el != 'newProducts' && el != 'newResources');
                        tableNames = tableNames.map(i => {
                            return {
                                name: `${_dbData[_dbName][i].tableDesc}(${i})`,
                                value: i,
                            }
                        });
                        html = 
                               _renderSelect(tableNames) + `<button data-type="popover_save" data-resultTr="${trIdx}" class="btn btn-default btn-sm">保存</button>`
                                
                        break;
                    case 'colName':
                        let __dbName = $el.parents('tr').prev().prev().find('input[data-type="arg"]').val(),
                            _tableName = $el.parents('tr').prev().find('input[data-type="arg"]').val(),
                            colNames = _dbData[__dbName] && _dbData[__dbName][_tableName] && _dbData[__dbName][_tableName].tableDetail;
                        colNames = colNames && colNames.map(i => {
                            return {
                                name: `${i.cname}(${i.id})`,
                                value: i.id
                            }
                        })
                        html = _renderSelect(colNames) + `<button data-type="popover_save" data-resultTr="${trIdx}" class="btn btn-default btn-sm">保存</button>`
                        break;
                }
                return html;
            },
            getDbData() {
                new FileService().readFile("/profiles/table.json", 'utf-8', function(rst) {
                    dbData = rst;
                });
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
                        '<div class="eg-system-list">' +
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
            $(".eg .queryConfig :text.active").removeClass("active");
            $(".fn-system-item.selected, .fn-types-item.selected, .fn-item.selected").removeClass('selected');
        },
        setData: function (element) {
            var cache = $.data(element, CACHE_KEY),
                $source = cache.$source,
                $result = cache.$result,
                toolbar = cache.toolbar,
                functions = cache.functions,
                systemFunction = cache.systemFunction,
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
            //填充$result结果数据
            if ($result && $result.length > 0) {
                var hasBrace = cache.hasBrace,
                    expr = $result.val();
                if (!hasBrace) {
                    expr = $result.attr("data-expr");
                }
                if (expr) {
                    $eg.find(".eg-expr").val(expr);
                    var matches = expr.match(/[^{]([A-Z]+)(?=})/g);
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
                    // if (type === "remote") {
                    //     data.forEach(function (ditem) {
                    //         cpanel += '<button class="btn btn-default" data-profile=\'' + JSON.stringify(ditem) + '\'>' + ditem.desc + '</button>';
                    //     });
                    // } else if (type === "insert") {
                    //   data.forEach(function (iitem) {
                    //     cpanel += '<button class="btn btn-default" data-insertFn=\'' + JSON.stringify(iitem) + '\'>' + iitem.desc + '</button>';
                    // });
                    // } else {
                    for (var key in data) {
                        var value = data[key];
                        cpanel += '<button data-type="toolbar_btn" class="btn btn-default" value="' + value + '">' + key + '</button>';
                    }
                    // }
                    cpanel += "</div></div>";
                    html += cpanel;
                }
                $eg.find(".eg-toolbar").append(html);
            }
            //填充工具栏数据
            if (Array.isArray(functions)) {
                this.renderToolBar(functions, systemFunction);
                this.setToolBarData(functions[0]);
                $eg.find(".eg-function").show().end().find(".eg-content").css("width", "calc(100% - 550px)");
            } else {
                $eg.find(".eg-function").hide().end().find(".eg-content").css("width", "calc(100% - 250px)");
            }
        },
        renderToolBar: function(functions, systemFunction) {
            var titles = "";
            if (Array.isArray(functions)) {
                functions.forEach(function(el, idx) {
                    titles += '<div class="fn-types-item btn btn-default '+ (idx === 0 ? "selected" : "") +'" data-type="'+ el.title +'">'+ el.title +'</div>'
                })
            };

            var systemFn = "";
            if (Array.isArray(systemFunction)) {
                systemFunction.sort(function(a, b){ return a.index > b.index})
                systemFunction.filter(el => el.index !== 9999).forEach(function(el) {
                    systemFn += `<div class="btn btn-default fn-system-item" data-type="系统函数" data-name="${el.name}" data-cname="${el.cname}">${el.cname}</div>`
                });
                systemFn += `<div class="fn-system-more"><div></div><div></div><div></div></div>`
            }

            var html = '<div class="cpanel" data-title="配置函数">'+
                            '<header class="cpanel-header">' +
                                '<h4 class="cpanel-title">配置函数</h4>' +
                            '</header>' +
                            '<div class="cpanel-body" data-type="normal">' +

                                '<section class="fn-system">' +
                                    systemFn +
                                '</section>' +
                                
                                '<section class="fn-types">' +
                                titles +
                                '</section>' +
                                '<div class="fn-container">'+
                                    '<section class="fn-search">' +
                                        '<input type="text">' +
                                        '<i class="icon icon-search"></i>' +
                                    '</section>'+
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
            $eg.find(".eg-dialog").width(pageWidth  * .75 + sWidth * 2);
            $eg.fadeIn();
            if (cache.onOpen) {
                cache.onOpen();
            }
        },
        bindEvents: function (element) {
            $(document).off("input focusin" + EVENT_NAMESPACE);
            var that = this;
            //控件元素click事件
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-elem", {element: element}, function (event) {
                console.log($(this).hasClass("current"))
                if($(this).hasClass("current")){
                    var result = window.confirm("你却定获取元素本身的值吗？");
                    if(!result) return;
                }
                event.stopPropagation();
                //判断是不是多选模式
                var cache = $.data(event.data.element, CACHE_KEY);
                // if (cache.multi) {
                //     $(this).addClass("selected");
                // } else {
                //     $(this).toggleClass("selected");
                // }
                
                var $eg = $(".eg:visible"),
                    $arg = $eg.find("[data-type='arg'].active, .queryConfig .active"),
                    $egExpr = $eg.find(".eg-expr"),
                    expr = $egExpr.val(),
                    dataId = $(this).attr("data-id"),
                    value = '';
                if ($arg.length > 0) {
                    var valueType = $arg.parent().prev().attr('data-convert');
                    value = valueType === 'ElementNoWrap' ? dataId : "{" + dataId + "}";
                    $arg.val($arg.val() === value ? "" : value).trigger("input");
                } else {
                    value = "{" + dataId + "}";
                    if(expr.indexOf(value) > -1) {
                        $egExpr.val(expr.replace(new RegExp(value, "g"), ""));
                    } else {
                        that.setExpr($egExpr, $egExpr.get(0), expr, value);
                    }
                }
                FunctionUtil.setElemSelected();
            });
            //全局变量
            $(document).on("click" + EVENT_NAMESPACE, '.eg .cpanel-body [data-type="toolbar_btn"].btn', {element: element}, function (event) {
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
                
                var $list = $('.eg .eg-function').find(".eg-system-list");
                    cache = $.data(element, CACHE_KEY);
                if ($list.is(":visible")) {
                    FunctionUtil.setSystemStatus(true);
                    $(this).find(".fn-system .fn-system-item").first().click();
                    $list.hide().prev().show();
                    var newFn = FunctionUtil.getSystemFnOrder(cache.systemFunction);
                    new FileService().writeFile('system_functions.json', JSON.stringify(newFn));
                }
                FunctionUtil.effect("close");
                that.setExpr($egExpr, $egExpr.get(0), $egExpr.val(), value);
            });
            //表达式元素input事件
            $(document).on("input" + EVENT_NAMESPACE, ".eg .eg-expr, .eg [data-type='arg']", {element: element}, function (event) {
                event.stopPropagation();               
                FunctionUtil.setElemSelected();
            });
            
            //面板切换
            $(document).on("click" + EVENT_NAMESPACE, ".eg .cpanel .cpanel-header", function (event) {
                event.stopPropagation();
                $(this).next().slideToggle();
            });

            //保存
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-save", {element: element}, function (event) {
                event.stopPropagation();
                var $eg = $(".eg"),
                    expr = $eg.find(".eg-expr").val(),
                    cache = $.data(event.data.element, CACHE_KEY),
                    $result = cache.$result,
                    $resultFunction = cache.$resultFunction;
                if (!$result || $result.length <= 0) {
                    
                    if ($resultFunction && expr) {
                        var fnName = '';
                        if (expr.startsWith('functions')) {
                            var args = expr.match(/(?<=functions\()(.+?)(?=\))/);
                            args && args[0] && (fnName = args[0].split(',')[1]);
                            fnName && (fnName = fnName.replace(/"/g, ""));
                        }  else {
                            var fnNames = expr.match(/([A-Za-z.]+)(?=\(.*\))/);
                            Array.isArray(fnNames) && (fnName = fnNames[0]);
                        }
                        $resultFunction.call(null, fnName, expr);
                    }
                    $eg.fadeOut();
                } else {
                    var hasBrace = cache.hasBrace;
                    if (!hasBrace) {
                        $result.attr("data-expr", expr);
                        expr = expr.replace(/[{}]/g, "");
                    }
                    $result.is(":input") ? $result.val(expr) : $result.text(expr);
                    $eg.fadeOut();
                    if (cache.onSetProperty) {
                        cache.onSetProperty.call(null, expr);
                    }
                };

            });
            //清除
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-clear", {element: element}, function (event) {
                event.stopPropagation();
                var result = confirm("确定要清除表达式配置数据吗？");
                if (!result) return;

                // czp修改清除只改变值
                $(".eg .eg-dialog .eg-sidebar .eg-result .eg-expr").val("");
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
                var $eg = $('.eg:visible');
                if ($eg.find(".eg-system-list").is(":visible")) $eg.find(".fn-system-more").click();
                var type = $(this).data('type'),
                    cache = $.data(element, CACHE_KEY);
                    fnsData = cache.functions.filter(function(el) { return el.title == type });
                that.clearStyle();
                $(".fn-container").slideDown('fast');
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
            $(document).on("focusin" + EVENT_NAMESPACE, ".eg .eg-expr, .eg .eg-function [data-type='arg'], .queryConfig input", function (event) {
                event.stopPropagation();
                $(".eg .eg-expr, .eg .eg-function [data-type='arg']").removeClass("active");
                $(".eg .queryConfig input").removeClass("active");
                $(this).addClass("active");
            });

            //保存函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-function .function-save", {element: element}, function (event) {
                event.stopPropagation();
                var cache = $.data(element, CACHE_KEY),
                    replaceResult = !!cache.replaceResult,
                    $eg = $(".eg:visible"),
                    $egExpr = $eg.find(".eg-expr"),
                    target = $eg.find('.eg-elem.current').data('id'),
                    fnType = $eg.find(".fn-item.selected").data('type') || $eg.find(".fn-system-item.selected").data('type'),
                    fnName = $eg.find(".fn-item.selected").data('name') ||  $eg.find(".fn-system-item.selected").data('name'),
                    isManyArgsTable = $eg.find(".eg-function-args table").hasClass("manyArgs-table"),
                    result = "";
                if (!target) return;
                if(!fnName) return alert('无选中函数！');
                var args = $eg.find('[data-type="arg"]').map(function() {
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
                args = args.join(',');
                if (fnType === "本地函数") {
                    result = fnName + "("+ '"'+ target + '"' + "," + args +")";
                } else if (fnType === "远程函数"){
                    var async = $eg.find('[data-type="async"]').val(),
                        voluation = $eg.find('[data-type="voluation"]').val();
                    result = "functions("+ '"'+ target + '"' + "," + '"'+ fnName + '"' + "," + async + "," + voluation + "," + args +")";
                } else if (fnType === "系统函数") {
                    result = fnName + "("+ args +")"
                }
                that.setExpr($egExpr, $egExpr.get(0), $egExpr.val(), result, replaceResult);
                $(".eg .eg-function [data-type='arg'].active").removeClass("active");
            });

            //清除插入函数配置
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-function .function-clear", function (event) {
                $(".eg:visible .eg-function [data-type='arg']").each(function() {
                    $(this).val("").removeClass('active');
                });
            });

            // 选择系统函数
            $(document).on("click" + EVENT_NAMESPACE, ".eg .fn-system .fn-system-item", {element: element}, function (event) {
                if ($('.eg .eg-system-list').is(":visible")) return;

                var cname = $(this).data('cname'),
                    cache = $.data(element, CACHE_KEY),
                    fnData = cache.systemFunction.filter(function(el) { return el.cname === cname });
                that.clearStyle();
                $(".fn-container").slideUp('fast');
                $(this).addClass("selected");
                FunctionUtil.setArgsTbody(fnData[0]);
            });

            // 依赖  插件
            (function() {
                $(".eg:visible .eg-dialog").resizable({
                    handles: 'all'
                });

                $(".eg:visible .eg-dialog").draggable();

            })();
            
            // 切换配置函数
            $(document).on("click" + EVENT_NAMESPACE, ".eg .fn-system .fn-system-more", {element: element}, function (event) {
                var $list = $('.eg .eg-function').find(".eg-system-list");
                cache = $.data(element, CACHE_KEY);
                if ($list.is(":visible")) {
                    FunctionUtil.setSystemStatus(true);
                    $(this).find(".fn-system .fn-system-item").first().click();
                    $list.hide().prev().show();
                    var newFn = FunctionUtil.getSystemFnOrder(cache.systemFunction);
                    new FileService().writeFile('system_functions.json', JSON.stringify(newFn));
                    $(".fn-container").slideDown('fast');
                    $(".fn-types .fn-types-item").first().click();
                } else {
                    $(this).parents('.fn-system').find(".fn-system-item").addClass("canDel");
                    $list.show().prev().hide();
                    FunctionUtil.renderSystemFnList(cache.systemFunction);
                    FunctionUtil.setSystemStatus();
                    that.clearStyle();
                    $(".fn-container").slideUp('fast');
                }

                $(".eg .eg-function").is(":hidden") && FunctionUtil.effect("open")
            });

            // 移除系统函数
            $(document).on("click" + EVENT_NAMESPACE, ".eg .fn-system .canDel", {element: element}, function (event) {
                var name = $(this).remove().data('cname');
                $(".eg .eg-system-list").find('[data-cname="'+ name +'"]').addClass("canAdd");
            });

            // 添加系统函数
            $(document).on("click" + EVENT_NAMESPACE, ".eg .eg-system-list .fn-system-item.canAdd", {element: element}, function (event) {
                var $clone = $(this).clone(true),
                    $target = $(".eg .fn-system"),
                    remove;
                if ($target.find(".fn-system-item").length >= 8) {
                    remove = $target.find(".fn-system-item").first().remove().data("cname");
                }
                $(this).removeClass("canAdd");
                $clone.addClass("canDel").removeClass("canAdd").insertBefore($target.find(".fn-system-more"));
                remove && $(".eg .eg-system-list").find('[data-cname="'+ remove +'"]').addClass("canAdd");
            });

            $(document).on("click" + EVENT_NAMESPACE, '.eg .eg-function [data-config="Query"]', {element: element}, function (event) {
                var $this = $(this),
                    $input = $this.parent('td').next('td').find('input'),
                    $content = $('.eg:visible .query-config-content'),
                    val = $input.val(),
                    data = null;
                try{
                    data = JSON.parse(val);
                }catch(err) {
                }
                $content.is(":empty")
                    ? $(this).dbQuerier2({
                            $target: $input,
                            data: data || {},
                            $content: $content,
                        })
                    : $content.empty()
            });

            $(document).on("click" + EVENT_NAMESPACE, '.popover [data-type="popover_save"]', function() {
                let $this = $(this),
                    trIdx = $this.data('resulttr'),
                    val = $this.parents('.popover-content').find('[data-select="result"]').val();
                
                $(this).parents(".popover").prev().popover('hide')
                    .parents('table').find('tbody tr').eq(trIdx).find('input[data-type="arg"]').val(val);
            })
        },
        setExpr: function ($elem, elem, expr, value, replaceExpr) {
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
            !replaceExpr ? $elem.val(result) : $elem.val(value);
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
        zIndex: 1050,//eg对话框z-index值
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