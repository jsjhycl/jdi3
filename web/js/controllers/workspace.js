let WorkspaceUtil = {
    // views: {
    //     'checkFn': '显示配置表达式',
    //     'insertFn': '插入函数'
    // },
    
    /**
     * 
     * @param {String} view 视图
     * @param {DOM} $dom 触发按钮的副本
     * @param {Boolean} flag 是否转换元素
     * @param {表达式带有的参数} args 
     */
    switchWorkspace: function(view, $dom, flag, args) {
        this.resetView();

        let that = this,
            $workspace = $('#workspace'),
            $currentInput = $workspace.find('.focus'),
            $wrap = $('<div id="mask"></div>'),
            $wsCopy = $('<div id="workspace_copy"></div>').html($workspace.html());
        $wrap.css({height: $(document).height()});  // 2019/1/3 添加
        $wsCopy.css({
            width: $workspace.width(),
            height: $workspace.height(),
            backgroundColor: $workspace.css('backgroundColor'),
            position: "absolute",
            top: $workspace.offset().top,
            left: $workspace.offset().left,
            zIndex: 801
        });
        
        if (!flag) {
            that.input2Btn(view, $wsCopy.find('input'), true, $workspace);
        }
        
        if ($currentInput) { $wsCopy.find('[data-domid="' + $currentInput.attr('id') + '"]').addClass('originSelected') };
        // 存在已配置的插入函数参数
        if (args) {
            args = args.split(',')
            $.each(args, function(index, item) {
                let id = item.toString().slice(1, -1);
                if (id) { $wsCopy.find('[data-domid=' + id + ']').addClass('selected'); }
            })
        };
        $wsCopy.children().removeAttr('id');
        $wrap.append($wsCopy).append($dom);
        $('body').append($wrap);
        that.bindEvents();
    },

    /**
     * 
     * @param {DOM} $dom 触发元素
     */
    checkFn: function($dom) {
        this.setMask();
        let that = this,
            view = 'checkFn';
        let $domCopy = DomHelper.copy($dom);
        that.switchWorkspace(view, $domCopy, false, null, null);
    },

    insertFns: function($dom, flag, args) {
        let that = this,
            view = 'insertFn',
            $domCopy = DomHelper.copy($dom);
        that.switchWorkspace(view, $domCopy, flag, args, null);
    },

    /**
     * 
     * @param {String} view 视图
     * @param {DOMS} $doms 带转换的元素
     */
    input2Btn: function(view, $doms, flag, $originContainer) {
        console.log($originContainer)
        $.each($doms, function(index, item) {
            let $dom = $(item),
                id = $dom.attr('id'),
                $origin = $originContainer.find('#' + id);
                isSelected = $dom.parent().hasClass('ui-draggable'),    // 当前元素是否被选中;
                isFocus = $dom.hasClass('focus');    // 输入框有红色背景
            let $span = $('<span data-domId="' + id + '" ></span>'),
                // $temp = isSelected ? $dom.parent() : $dom;
                $temp = $dom;
                $span.css({
                    width: $origin.get(0).offsetWidth,
                    height: $origin.get(0).offsetHeight - 6,
                    position: $origin.css('position'),
                    top: $origin.css('top'),
                    left: $origin.css('left'),
                    zIndex: 10001,
                    display: "inline-block",
                    boxSizing: "border-box"
                });
            switch(view) {
                case 'insertFn':
                    $span.addClass('workspace-node-switch ' + (isFocus ? 'originSelected' : '') ).data('cache', isSelected ? $dom.parent().get(0).outerHTML :$dom.get(0).outerHTML).html(id);
                    break;
                case 'checkFn':
                    let expr =  new Property().getValue(id, 'expression');
                    expr = expr ? '=' + expr : '';
                    if (expr) {
                        $dom.attr({ 'data-toggle': 'tooltip', 'data-placement': 'top', 'title': expr});
                        expr = '=' + expr;
                    }
                    $span.addClass('check-fn-node').html(expr);
                    break;
            }
            $temp.replaceWith($span)
        })
    },

    bindEvents: function() {
        let that = this,
            $mask = $('#mask');

        // 遮罩层关闭事件
        $mask.off('click');
        $mask.on('click', '.copy-dom' ,function(event) {
            new InsertFnModal($("#insertFunctionModal")).close();
            new InsertFnArgsModal().close();
            that.resetView($mask);
        });

        // 选择参数事件
        $('#workspace_copy').on('click', '.workspace-node-switch', function(event) {
            event.stopPropagation();
            let that = this,
                $el = $(this),
                val = '{'+ $el.text() + '}',
                $argInput = $("#insertFunctionArgsModal input.selected"),
                hasArgInput = $argInput.length > 0,
                $customTextarea = $("#insertFunctionArgsModal textarea.selected"),
                isOriginSelected = $el.hasClass('originSelected');
            if (!hasArgInput && !$customTextarea) return;
            else {
                if (!isOriginSelected) {
                    let $tempInput = hasArgInput ? $argInput : $customTextarea;
                    let flag = $el.hasClass('selected');
                    if (flag) {
                        $el.removeClass('selected');
                        $tempInput.val() && $tempInput.val($tempInput.val().replace(new RegExp(val, 'g'), ''))
                    } else {
                        if (hasArgInput) {
                            $tempInput.val() && $('[data-domid="'+ $tempInput.val().replace(/[\{\}]*/g, '') +'"]').removeClass('selected');
                            $argInput.val(val);
                        } else {
                            $customTextarea.val($customTextarea.val() + val);
                        }
                        $el.addClass('selected')
                        $("#insertFunctionArgsModal .insert-fn-name").data('moreargs') ? new InsertFnArgsModal().addMoreArgs() : '';    // 有待优化
                    }
                }
            }
        })

    },

    setMask: function($container) {
        if (!$container) return;
        let arr = ['#controlbar', '.navbar.navbar-fixed-top', '#propertybar', '#toolbar'];
        arr.forEach(function(selector) {
            let $el = $(selector),
                style = {
                    position: "absolute",
                    top: $el.offset().top,
                    left: $el.offset().left,
                    width: $el.width(),
                    height: $el.width(),
                    zIndex: $el.css('z-index') * 1 + 1
                },
                $mask = $('<div class="section-mask"><div>').css(style);
                $container.append($mask);
        });
    },

    // 移除模态框
    resetView: function() {
        $('#mask').remove();
    },
}

function Workspace() {
    this.$workspace = $("#workspace");
    this.NAMESPACE = ".workspace"

    this._getAjax = function (url) {
        return $.cajax({
            url: url,
            type: "GET",
            dataType: "json"
        });
    };

    this._postAjax = function (id, item) {
        if (!id || !DataType.isObject(item)) return;

        return $.cajax({
            url: "/api/save/" + id + "/" + item.name,
            type: "POST",
            contentType: item.contentType,
            data: item.data,
            dataType: "json"
        });
    };

    this._getData = function (id, name, type, subtype, customId) {
        if (!id || !name) return alert("无法保存没有编号、名称的数据！");

        var that = this;
        that.$workspace.click();
        that.$workspace.find(".focus").removeClass("focus");
        //获取setting数据
        var settingData = {
                width: that.$workspace.width(),
                height: that.$workspace.height(),
                bgColor: that.$workspace.css("background-color"),
                items: []
            },
            html = "";
        that.$workspace.find(".workspace-node").each(function () {
            var cid = $(this).attr("id"),
                type = $(this).attr("data-type"),
                position = $(this).position(),
                item = {
                    id: cid,
                    name: $(this).attr("name"),
                    value: $(this).val(),
                    type: type,
                    rect: {
                        width: parseFloat($(this).css("width")),
                        height: parseFloat($(this).css("height")),
                        left: position.left,
                        top: position.top,
                        zIndex: $(this).css("z-index")
                    },
                    attach: {}
                };
            switch (type) {
                case "img":
                    item.attach = {src: cid + ".jpg"};
                    break;
                case "div":
                    item.attach = {html: $(this).html()};
                    break;
            }
            settingData.items.push(item);
            html += new Control().renderHtml(id, item);
        });
        //获取model数据
        var $temp = $('<div></div>');
        $temp.css({
            "position": "absolute",
            "width": settingData.width,
            "height": settingData.height,
            "background-color": settingData.bgColor,
            "overflow": "hidden"
        }).append(html);
        var modelData = '<input id="modelId" type="hidden" name="modelId" value="' + id + '">' +
            '<input id="modelName" type="hidden" name="modelName" value="' + name + '">' +
            $temp.get(0).outerHTML;
        //获取table数据
        var tableData = null;
        if ((type === "产品" || type === "数据库定义") && subtype === "模型" && customId) {
            tableData = new Property().getDbProperty(customId, name);
        }
        return {
            settingData: settingData,
            modelData: modelData,
            tableData: tableData
        };
    };

    /**
     * 第一步，生成setting.json；
     * 第二步，生成property_history_*.json；
     * 第三步，生成property.json；
     * 第四步，生成model.html；
     * @param id
     * @param type
     * @param subtype
     * @param flow
     * @param settingData
     * @param modelData
     * @private
     */
    this._setData = function (isPrompt, id, type, subtype, flow, settingData, modelData, tableData) {
        if (!id || !type || !subtype) return;

        isPrompt = !!isPrompt;
        var that = this,
            arrs = [{
                name: "setting.json",
                contentType: "text/plain;charset=utf-8",
                data: JSON.stringify(settingData)
            }, {
                name: "property.json",
                contentType: "text/plain;charset=utf-8",
                data: JSON.stringify(GLOBAL_PROPERTY)
            }, {
                name: "model.html",
                contentType: "text/html;charset=utf-8",
                data: modelData
            }];
        if (flow) {
            var FLOW_SETTING = {
                "编辑": "property_history_edit.json",
                "审核": "property_history_audit.json",
                "定义": "property_history_define.json",
            };
            arrs.push({
                name: FLOW_SETTING[flow],
                contentType: "text/plain;charset=utf-8",
                data: JSON.stringify(GLOBAL_PROPERTY)
            });
        }
        if ((type === "产品" || type === "数据库定义") && subtype === "模型" && tableData) {
            arrs.push({
                name: "table.json",
                contentType: "text/plain;charset=utf-8",
                data: JSON.stringify(tableData)
            });
        }
        var $y = that._postAjax,
            $ajax = null;
        if (arrs.length === 3) {
            $ajax = $.when($y(id, arrs[0]), $y(id, arrs[1]), $y(id, arrs[2]));
        } else if (arrs.length === 4) {
            $ajax = $.when($y(id, arrs[0]), $y(id, arrs[1]), $y(id, arrs[2]), $y(id, arrs[3]));
        } else if (arrs.length === 5) {
            $ajax = $.when($y(id, arrs[0]), $y(id, arrs[1]), $y(id, arrs[2]), $y(id, arrs[3]), $y(id, arrs[4]));
        }
        if ($ajax) {
            $ajax.done(function () {
                if (isPrompt) {
                    alert("保存成功！");
                }
            }).fail(function () {
                if (isPrompt) {
                    alert("保存失败！");
                }
            });
        }
    };

    this._sameNameValidate = function () {
        var arrs = new Property().getArrayByKey("cname"),
            isRepeat = arrs.isRepeat();
        if (isRepeat) return confirm("存在相同的中文名设置！确定要保存吗？");
        else return true;
    };
}

Workspace.prototype = {
    init: function (id, name, type, subtype, flow, customId, relTemplate) {
        if (!id || !name || !type || !subtype) return;

        var that = this,
            text = type + "/" + subtype + "/" + name,
            attrs = {
                "data-id": id,
                "data-name": name,
                "data-type": type,
                "data-subtype": subtype
            };
        if (flow) {
            attrs["data-flow"] = flow;
        }
        if (customId) {
            text += '<span class="text-danger">(' + customId + ')</span>';
            attrs["data-customId"] = customId;
        }
        if (type === "资源" && subtype === "模型" && DataType.isObject(relTemplate)) {
            attrs["data-relTemplate"] = JSON.stringify(relTemplate);
        }
        $("#name").empty().append(text);
        that.$workspace.empty().attr(attrs);
        new Filter(type, subtype).set();
        GLOBAL_PROPERTY = {};

    },
    load: function (id, name, type, subtype, flow, customId, relTemplate) {
        if (!id || !name || !type || !subtype) return;

        var that = this;
        $.when(that._getAjax("/lib/" + id + "/setting.json"), that._getAjax("/lib/" + id + "/property.json")).done(function (ret1, ret2) {
            that.init(id, name, type, subtype, flow, customId, relTemplate);
            var settingData = ret1[0],
                propertyData = ret2[0];
            var control = new Control(),
                contextMenu = new ContextMenu();
            for (var i = 0; i < settingData.items.length; i++) {
                var item = settingData.items[i];
                control.setControl(item.type, function ($node) {
                    $node.attr({
                        "id": item.id,
                        "name": item.name,
                        "value": item.value,
                        "data-type": item.type
                    });
                    $node.css({
                        "left": item.rect.left,
                        "top": item.rect.top,
                        "z-index": item.rect.zIndex,
                        "width": item.rect.width,
                        "height": item.rect.height
                    });
                    switch (item.type) {
                        case "img":
                            var src = "/lib/" + id + "/res/" + item.attach.src;
                            $node.attr("src", !item.attach ? "../public/images/demo.jpg" :
                                (!item.attach.src ? "../public/images/demo.jpg" : src));
                            contextMenu.done(1, $node);
                            break;
                        case "div":
                            $node.append(item.attach ? item.attach.html : "");
                            contextMenu.done(2, $node);
                            contextMenu.done(3, $node.find(":input"));
                            break;
                        default:
                            contextMenu.done(3, $node);
                            break;
                    }
                    that.$workspace.append($node);
                });
            }
            GLOBAL_PROPERTY = propertyData;

            // 调整工作区大小
            let max_h = 0, max_w = 0;
            that.$workspace.find('div, p, img').each(function(i, el) {
                max_w = $(el).width() > max_w ? $(el).width() : max_w;
                max_h = $(el).height() > max_h ? $(el).height() : max_h;
            });
            that.$workspace.css({
                "width": settingData.width > max_w ? settingData.width : max_w,
                "height": settingData.height > max_h ? settingData.height : max_h,
                "background-color": settingData.bgColor
            });
            new Ruler().drawCoordinates()

        }).fail(function () {
            that.init(id, name, type, subtype, flow, customId, relTemplate);
            alert("数据加载出错！");
        });
    },
    save: function (isPrompt) {
        var that = this,
            isValidate = that._sameNameValidate();
        if (!isValidate) return;

        var id = that.$workspace.attr("data-id"),
            name = that.$workspace.attr("data-name"),
            type = that.$workspace.attr("data-type"),
            subtype = that.$workspace.attr("data-subtype"),
            flow = that.$workspace.attr("data-flow"),
            customId = that.$workspace.attr("data-customId");
        //获取数据
        var data = that._getData(id, name, type, subtype, customId);
        if (data) {
            //保存数据
            that._setData(isPrompt, id, type, subtype, flow, data.settingData, data.modelData, data.tableData);
        }
    },
    clear: function () {
        var that = this;
        that.$workspace.removeAttr("data-id data-name data-type data-subtype").empty();
        $('#property [id^="property_"]').val("");
        $(".container-fluid").hide();
    },
};
