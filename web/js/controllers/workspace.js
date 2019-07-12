var WorkspaceUtil = {
    // views: {
    //     'checkFn': '显示配置表达式',
    //     'insertFn': '插入函数',
    //     'numViewer': '查看元素Id'
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
        var that = this,
            $workspace = $('#workspace'),//获取工作区
            $currentInput = $workspace.find('.focus'),//获取工作区中选中的元素
            $wrap = $('<div id="mask"></div>'),//生成html
            $wrap_content = $('<div id="mask_content"></div>'),//生成html
            $wsCopy = $('<div id="workspace_copy"></div>').html($workspace.html());//生成html并把以前的工作区的html添加进来
        $wrap.css({height: $(document).height()});  // 2019/1/3 添加给遮罩设置高度
        $wsCopy.css({//给复制的元素这是css属性
            width: $workspace.width(),
            height: $workspace.height(),
            backgroundColor: $workspace.css('backgroundColor'),
            position: "absolute",
            top: $workspace.offset().top,
            left: $workspace.offset().left,
            zIndex: 801
        });
        if (!flag) {//如果flag为false
            that.input2Btn(view, $wsCopy.find('input'), true, $workspace);//调用input2Btn模块
        }
        
        if ($currentInput) { $wsCopy.find('[data-domid="' + $currentInput.attr('id') + '"]').addClass('originSelected') };//如果工作区中有选中的元素在它的复制元素上找到元素添加类名
        // 存在已配置的插入函数参数
        if (args) {
            args = args.split(',')//以逗号分割成数组
            $.each(args, function(index, item) {//遍历
                var id = item.toString().slice(1, -1);//把item转换成字符串从第一个剪切到最后一个
                if (id) { $wsCopy.find('[data-domid=' + id + ']').addClass('selected'); }//如果id 存在在复制元素上找到对应id的元素添加class
            })
        };

        $wsCopy.children().removeAttr('id');//在辅助元素的子元素中移除属性id
        // $wrap_content.append($wsCopy).append($dom);
        $wrap_content.append($wsCopy);//在$wrap_content中插入html代码
        $wrap.append($wrap_content);//在$wrap中插入代码
        $('body').append($wrap);//把$wrap添加到body中
        that.bindEvents();//调用绑定事件
    },

    /**
     * 查看函数配置、元素标号查看器
     * @param {DOM} $dom 触发元素
     */
    checkFn: function($dom) {
        this.setMask();//生成遮罩
        var that = this,
            view = 'checkFn';
        var $domCopy = DomHelper.copy($dom);//调用Domhelper的copy方法
        that.switchWorkspace(view, $domCopy, false, null, null);//调用switchWorkspace
    },

    insertFns: function($dom, flag, args) {
        var that = this,
            view = 'insertFn',
            $domCopy = DomHelper.copy($dom);//调用函数DomHelper的copy方法
        that.switchWorkspace(view, $domCopy, flag, args, null);//调用函数
    },

    numViewer: function() {//元素查看函数检查函数
        this.switchWorkspace('numViewer', null, false, null, null);
    },

    /**
     * 输入框转为btn
     * @param {String} view 视图
     * @param {DOMS} $doms 带转换的元素
     */
    input2Btn: function(view, $doms, flag, $originContainer) {
        $.each($doms, function(index, item) {//遍历
            var $dom = $(item),//获取对应的dom
                id = $dom.attr('id'),//获取对应dom的id
                $origin = $originContainer.find('#' + id);//获取工作区中对应的元素
                isSelected = $dom.parent().hasClass('ui-draggable'),    // 当前元素是否被选中;
                isNode = $dom.hasClass('workspace-node'),   // 判断是否是表格中的input
                isFocus = $dom.hasClass('focus');    // 输入框有红色背景
            var $span = $('<span data-domId="' + id + '" ></span>'),
                // $temp = isSelected ? $dom.parent() : $dom;
                $temp = $dom;
                $span.css({//设置样式
                    width: $origin.get(0).offsetWidth,
                    height: $origin.get(0).offsetHeight - (isNode ? 0 : 6),
                    position: $origin.css('position'),
                    top: $origin.css('top'),
                    left: $origin.css('left'),
                    zIndex: 10001,
                    display: "inline-block",
                    boxSizing: "border-box"
                });
            switch(view) {//判断view的状态
                case 'insertFn'://如果view是插入函数
                    $span.addClass('workspace-node-switch ' + (isFocus ? 'originSelected' : '') ).data('cache', isSelected ? $dom.parent().get(0).outerHTML :$dom.get(0).outerHTML).html(id);//给span添加样式
                    break;
                case 'checkFn'://如果view是查看函数
                    var expr =  new Property().getValue(id, 'expression');//调用property的getvalue方法获取函数表达式
                    expr = expr ? '=' + expr : '';//如果表达式存在=+表达式  不存在为空
                    if (expr) {//如果表达式存在给他添加一些属性
                        $dom.attr({ 'data-toggle': 'tooltip', 'data-placement': 'top', 'title': expr});
                        expr = '=' + expr;
                    }
                    $span.addClass('check-fn-node').html(expr);//给span添加样式并给他添加内容
                    break;
                case 'numViewer'://如果为元素查看器
                    $span.addClass('check-fn-node').html(id);//添加类名并在里面添加id
                    break;
            }
            $temp.replaceWith($span)//把$tmp中的替换成$span
        })
    },

    bindEvents: function() {
        var that = this,
            $mask = $('#mask');//获取遮罩元素

        $mask.off('click.workspace');//移除click.workspace事件
        $('#workspace_copy').off('click.workspace');//在$('#workspace_copy')元素上移除事件click.workspace
        $('nav').off('click.workspace');//移除$('nav')上的click.workspace事件
        $("body").off('click.workspace')//移除$("body")上的click.workspace事件
        $mask.on('click.workspace', '.copy-dom' ,function(event) {//给遮罩上绑定事件
            new InsertFnModal($("#insertFunctionModal")).close();//实例化InsertFNModal调用close方法
            new InsertFnArgsModal().close();//实例化InsertFnArgsModal调用close方法
            that.resetView($mask);//调用resetView方法
        });

        // 选择参数事件
        $('#workspace_copy').on('click.workspace', '.workspace-node-switch', function(event) {
            event.stopPropagation();//阻止默认事件
            console.log("qiehuang")
            var that = this,
                $el = $(this),//获取点击的元素
                val = '{'+ $el.text() + '}',//获取点击元素的内容
                $argInput = $("#insertFunctionArgsModal input.selected"),//获取元素
                hasArgInput = $argInput.length > 0,//对是否有进行判断有为true
                $customTextarea = $("#insertFunctionArgsModal textarea.selected"),//获取元素
                isOriginSelected = $el.hasClass('originSelected');//检查该元素是否具有originSelected类名
            if (!hasArgInput && !$customTextarea) return;//如果hasArgInput和$customTextarea都为true退出函数
            else {
                if (!isOriginSelected) {//如果isOriginSelected为false
                    var $tempInput = hasArgInput ? $argInput : $customTextarea;//hasArgInput为true时$tempInput为$argInput否则为$customTextarea
                    var flag = $el.hasClass('selected');//检查该元素是否有selected类名
                    if (flag) {//如果有类名
                        $el.removeClass('selected');//移除类名
                        $tempInput.val() && $tempInput.val($tempInput.val().replace(new RegExp(val, 'g'), ''))//如果$tempInput.val()有值执行后面的
                    } else {//否则
                        if (hasArgInput) {//如果hasArgInput为true
                            $tempInput.val() && $('[data-domid="'+ $tempInput.val().replace(/[\{\}]*/g, '') +'"]').removeClass('selected');//如果$tempInput.val()存在获取元素移除类名
                            $argInput.val(val);//设置值
                        } else {
                            $customTextarea.val($customTextarea.val() + val);//否则直接设置值
                        }
                        $el.addClass('selected')//移除类名
                        $("#insertFunctionArgsModal .insert-fn-name").data('moreargs') ? new InsertFnArgsModal().addMoreArgs() : '';    // 有待优化
                    }
                }
            }
        });

        $('body').on('click.workspace', '.navbar, #controlbar', function(ev) {//绑定事件
            ($(ev.target).attr('id') === 'viewer') ? '' : that.resetView(true);//获取元素的id与viewr比较如果为真直接为空否知执行resetView函数
        })
    },

    setMask: function($container) {
        if (!$container) return;//如果没有选中元素退出程序
        var arr = ['#controlbar', '.navbar.navbar-fixed-top', '#propertybar', '#toolbar'];
        arr.forEach(function(selector) {//数组遍历
            var $el = $(selector),//获取元素
                style = {//设置样式
                    position: "absolute",
                    top: $el.offset().top,
                    left: $el.offset().left,
                    width: $el.width(),
                    height: $el.width(),
                    zIndex: $el.css('z-index') * 1 + 1
                },
                $mask = $('<div class="section-mask"><div>').css(style);//生成一个html并添加css
                $container.append($mask);//添加到$container
        });
    },

    // 移除模态框
    resetView: function(flag) {
        flag = !!flag || false;//flag转布尔值 
        $('#mask').remove();//移除元素
        $("#insertFunctionModal").hide();//隐藏元素
        $("#insertFunctionArgsModal").hide();//隐藏元素
        flag && $('.is_using').removeClass('is_using');//flag为true时移除类名
    },
}

function Workspace() {
    this.$workspace = $("#workspace");//获取工作区的元素
    this.NAMESPACE = ".workspace"

    this._getAjax = function (url) {
        return $.cajax({//返回一个ajax
            url: url,
            type: "GET",
            dataType: "json"
        });
    };

    this._postAjax = function (id, item) {
        if (!id || !DataType.isObject(item)) return;//如果id或则item不是对象退出函数
        console.log(id,item.name)

        return $.cajax({//返回一个ajax对象
            url: "/api/save/" + id + "/" + item.name,
            type: "POST",
            contentType: item.contentType,
            data: item.data,
            dataType: "json"
        });
    };

    this._getData = function (id, name, type, subtype, customId) {
        if (!id || !name) return alert("无法保存没有编号、名称的数据！");//如果id或者name不存在的退出函数并提示

        var that = this;
        that.$workspace.click();//执行工作区点击事件
        that.$workspace.find(".focus").removeClass("focus");//寻找工作区中的类名为focus的元素移除类名
        //获取setting数据
        var settingData = {
                width: that.$workspace.width(),
                height: that.$workspace.height(),
                bgColor: that.$workspace.css("background-color"),
                items: []
            },
            html = "";
        that.$workspace.find(".workspace-node").each(function () {//获取工作区中类名workspace-node的元素遍历函数
            var cid = $(this).attr("id"),//获取当前元素的id
                type = $(this).attr("data-type"),//获取当前元素的data-type
                position = $(this).position(),//获取当前元素的定位信息
                item = {//对item对象进行一些赋值
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
            switch (type) {//对类型进行判断
                case "img"://如果是img类型
                    item.attach = {src: cid + ".jpg"};//item下面的属性进行赋值
                    break;
                case "div"://如果为div类型
                    item.attach = {html: $(this).html()};//对item下面的attach属性进行赋值
                    break;
            }
            settingData.items.push(item);//向settingData中添加item
            html += new Control().renderHtml(id, item);//实例化control调用renderHtml函数累加起来
        });
        //获取model数据
        var $temp = $('<div></div>');//生成元素
        $temp.css({//给元素添加样式
            "position": "absolute",
            "width": settingData.width,
            "height": settingData.height,
            "background-color": settingData.bgColor,
            "overflow": "hidden"
        }).append(html);//插入到html中
        var modelData = '<input id="modelId" type="hidden" name="modelId" value="' + id + '">' +
            '<input id="modelName" type="hidden" name="modelName" value="' + name + '">' +
            $temp.get(0).outerHTML;
        //获取table数据
        var tableData = null;
        if ((type === "产品" || type === "数据库定义") && subtype === "模型" && customId) {//如果type是产品或则是数据库定义subtype是模型且customid存在
            tableData = new Property().getDbProperty(customId, name);//实例化property调用getDbproperty
        }
        return {//返回setingData  modeldData tableData
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
        if (!id || !type || !subtype) return;//如果id或则type或则subtype都不存在则退出函数

        isPrompt = !!isPrompt;//对isPrompt进行取布尔值
        var that = this,
            arrs = [{//定义arrs
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
        if (flow) {//如果flow有值时
            var FLOW_SETTING = {//定义FLOW_SETTING
                "编辑": "property_history_edit.json",
                "审核": "property_history_audit.json",
                "定义": "property_history_define.json",
            };
            arrs.push({//先数组中添加
                name: FLOW_SETTING[flow],
                contentType: "text/plain;charset=utf-8",
                data: JSON.stringify(GLOBAL_PROPERTY)
            });
        }
        if ((type === "产品" || type === "数据库定义") && subtype === "模型" && tableData) {//如果type为产品或则type为数据库定义且type为模型且tabledata存在
            arrs.push({//向数组中添加
                name: "table.json",
                contentType: "text/plain;charset=utf-8",
                data: JSON.stringify(tableData)
            });
        }
        var $y = that._postAjax,//将调用函数的返回值赋值给$y
            $ajax = null;
        if (arrs.length === 3) {//如果数组的长度为3
            $ajax = $.when($y(id, arrs[0]), $y(id, arrs[1]), $y(id, arrs[2]));//调用ajax
        } else if (arrs.length === 4) {//如果数组长度为4
            $ajax = $.when($y(id, arrs[0]), $y(id, arrs[1]), $y(id, arrs[2]), $y(id, arrs[3]));//调用ajax
        } else if (arrs.length === 5) {//如果数组长度为5
            $ajax = $.when($y(id, arrs[0]), $y(id, arrs[1]), $y(id, arrs[2]), $y(id, arrs[3]), $y(id, arrs[4]));//调用数组长度
        }
        if ($ajax) {//如果$ajax存在的话
            $ajax.done(function () {//执行ajax函数的 done方法
                if (isPrompt) {//如果ispromt是真值的话提示保存成功
                    alert("保存成功！");
                }
            }).fail(function () {
                if (isPrompt) {//如果ispromt是真值的话提示保存失败
                    alert("保存失败！");
                }
            });
        }
    };

    this._sameNameValidate = function () {
        var arrs = new Property().getArrayByKey("cname"),//实例化property调用getArrayBykey方法
            isRepeat = arrs.isRepeat();//调用数组的扩展函数isRepeat
        if (isRepeat) return confirm("存在相同的中文名设置！确定要保存吗？");//如果存在提示
        else return true;//否则退出函数
    };
}

Workspace.prototype = {
    init: function (id, name, type, subtype, flow, customId, relTemplate) {
        if (!id || !name || !type || !subtype) return;//如果id和name和type和subtype不存在退出函数

        var that = this,
            text = type + "/" + subtype + "/" + name,//赋值
            attrs = {
                "data-id": id,
                "data-name": name,
                "data-type": type,
                "data-subtype": subtype
            };
        if (flow) {//如果flow为真
            attrs["data-flow"] = flow;//向attrs中添加属性
        }
        if (customId) {//如果cusomId存在
            text += '<span class="text-danger">(' + customId + ')</span>';//赋值
            attrs["data-customId"] = customId;//向attrs中添加属性
        }
        if (type === "资源" && subtype === "模型" && DataType.isObject(relTemplate)) {//如果type为资源subtype为模型relTemplate为对象
            attrs["data-relTemplate"] = JSON.stringify(relTemplate);//向attrs中添加属性
        }
        $("#name").empty().append(text);//获取元素置空并添加html
        that.$workspace.empty().attr(attrs);//将工作区置空并添加属性
        new Filter(type, subtype).set();//实例化Filter并调用set方法
        $("#toolbar").css('right',"260px")//设置样式
        $("#toolbar").css('left',"140px")//设置样式
        GLOBAL_PROPERTY = {};//全局属性值空

    },
    load: function (id, name, type, subtype, flow, customId, relTemplate) {
        if (!id || !name || !type || !subtype) return;//如果id或则name或type或subtype都为空退出函数

        var that = this;
        $.when(that._getAjax("/lib/" + id + "/setting.json"), that._getAjax("/lib/" + id + "/property.json")).done(function (ret1, ret2) {//调用函数_getAjax获取json
            that.init(id, name, type, subtype, flow, customId, relTemplate);//调用init方法
            var settingData = ret1[0],//辅值
                propertyData = ret2[0];
            var control = new Control(),//实例化Control
                contextMenu = new ContextMenu();//实例化contextMenu
            for (var i = 0; i < settingData.items.length; i++) {//遍历小于settingData.items.length的数
                var item = settingData.items[i];//赋值
                control.setControl(item.type, function ($node) {//调用control中的setControl方法
                    $node.attr({//添加属性
                        "id": item.id,
                        "name": item.name,
                        "value": item.value,
                        "data-type": item.type
                    });
                    $node.css({//添加样式
                        "left": item.rect.left,
                        "top": item.rect.top,
                        "z-index": item.rect.zIndex,
                        "width": item.rect.width,
                        "height": item.rect.height
                    });
                    switch (item.type) {
                        case "img"://如果类型为img
                            var src = "/lib/" + id + "/res/" + item.attach.src;//生成src
                            $node.attr("src", !item.attach ? "../public/images/demo.jpg" : (!item.attach.src ? "../public/images/demo.jpg" : src));//如果item.attach不存在
                            contextMenu.done(1, $node);//调用contextMenu中的done方法
                            break;
                        case "div"://如果类型为div
                            $node.append(item.attach ? item.attach.html : "");//向当前元素中添加元素
                            contextMenu.done(2, $node);//调用contextMenu中的done方法
                            contextMenu.done(3, $node.find(":input"));//调用contextMenu中的done方法
                            break;
                        default:
                            contextMenu.done(3, $node);//调用contextMenu中的done方法
                            break;
                    }
                    that.$workspace.append($node);//向工作区中添加元素
                });
            }
            GLOBAL_PROPERTY = propertyData;//赋值

            // 调整工作区大小
            var max_h = 0, max_w = 0;
            that.$workspace.find('div, p, img').each(function(i, el) {//对工作区中元素进行累加得到宽度
                max_w = $(el).width() > max_w ? $(el).width() : max_w;//判断当前元素的宽度
                max_h = $(el).height() > max_h ? $(el).height() : max_h;
            });
            that.$workspace.css({//设置样式
                "width": settingData.width > max_w ? settingData.width : max_w,
                "height": settingData.height > max_h ? settingData.height : max_h,
                "background-color": settingData.bgColor
            });
            new Ruler().drawCoordinates()//调用Ruler的drawCoordinates

        }).fail(function () {//如果失败
            that.init(id, name, type, subtype, flow, customId, relTemplate);//调用init方法
            alert("数据加载出错！");
        });
    },
    /**
     * 
     * @param {} isPrompt 是否保存后提示信息true为提示false为不提示 
     */
    save: function (isPrompt) {
        var that = this,
            isValidate = that._sameNameValidate();//调用_sameNameValidate
        if (!isValidate) return;//如果isValidate退出函数

        var id = that.$workspace.attr("data-id"),//获取工作区data-id
            name = that.$workspace.attr("data-name"),//获取工作区data-name
            type = that.$workspace.attr("data-type"),//获取工作区data-type
            subtype = that.$workspace.attr("data-subtype"),//获取工作区data-subtype
            flow = that.$workspace.attr("data-flow"),//获取工作区data-flow
            customId = that.$workspace.attr("data-customId");//获取工作区data-customid
        //获取数据
        var data = that._getData(id, name, type, subtype, customId);//调用_getdata
        if (data) {//如果data为true
            //保存数据
            that._setData(isPrompt, id, type, subtype, flow, data.settingData, data.modelData, data.tableData);//调用_setdata
        }
    },
    clear: function () {
        var that = this;
        that.$workspace.removeAttr("data-id data-name data-type data-subtype").empty();//移除工作区属性并且清空
        $('#property [id^="property_"]').val("");//获取属性栏中所有id以property_的元素并且清空
        $(".container-fluid").hide();//隐藏元素
    },
};
