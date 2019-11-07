var WorkspaceUtil = {
    switchWorkspace: function (view, $dom, flag, args, key) {
        this.resetView();
        var that = this,
            $workspace = $('#workspace'), //获取工作区
            $currentInput = $workspace.find('.focus'), //获取工作区中选中的元素
            $wrap = $('<div id="mask"></div>'), //生成html
            $wrap_content = $('<div id="mask_content"></div>'), //生成html
            $wsCopy = $('<div id="workspace_copy"></div>').html($workspace.html()); //生成html并把以前的工作区的html添加进来
        $wrap.css({
            height: $workspace.height(),
            width: $workspace.width(),
            // height: $workspace.height(),
            top: $workspace.offset().top,
            left: $workspace.offset().left,
            overflow: "scroll"
        }); // 2019/1/3 添加给遮罩设置高度
        $wsCopy.css({ //给复制的元素这是css属性
            width: $workspace.width(),
            height: $workspace.height(),
            backgroundColor: $workspace.css('backgroundColor'),
            position: "absolute",
            // top: $workspace.offset().top,
            // left: $workspace.offset().left,
            zIndex: 801
        });
        if (!flag) { //如果flag为false
            that.input2Btn(view, $wsCopy.find('input'), true, $workspace, key); //调用input2Btn模块
        }

        if ($currentInput) {
            $wsCopy.find('[data-domid="' + $currentInput.attr('id') + '"]').addClass('originSelected')
        }; //如果工作区中有选中的元素在它的复制元素上找到元素添加类名
        // 存在已配置的插入函数参数
        if (args) {
            args = args.split(',') //以逗号分割成数组
            $.each(args, function (index, item) { //遍历
                var id = item.toString().slice(1, -1); //把item转换成字符串从第一个剪切到最后一个
                if (id) {
                    $wsCopy.find('[data-domid=' + id + ']').addClass('selected');
                } //如果id 存在在复制元素上找到对应id的元素添加class
            })
        };

        $wsCopy.children().removeAttr('id'); //在辅助元素的子元素中移除属性id
        // $wrap_content.append($wsCopy).append($dom);
        $wrap_content.append($wsCopy); //在$wrap_content中插入html代码
        $wrap.append($wrap_content); //在$wrap中插入代码
        $('body').append($wrap); //把$wrap添加到body中
        that.bindEvents(); //调用绑定事件
    },
    /**
     * 查看函数配置、元素标号查看器
     * @param {DOM} $dom 触发元素
     */
    checkFn: function ($dom) {
        this.setMask(); //生成遮罩
        var that = this,
            view = 'checkFn';
        var $domCopy = DomHelper.copy($dom); //调用Domhelper的copy方法
        that.switchWorkspace(view, $domCopy, false, null, null); //调用switchWorkspace
    },
    insertFns: function ($dom, flag, args) {
        var that = this,
            view = 'insertFn',
            $domCopy = DomHelper.copy($dom); //调用函数DomHelper的copy方法
        that.switchWorkspace(view, $domCopy, flag, args, null); //调用函数
    },
    //property
    propertyViewer: function ($dom) {
        var that = this,
            key = $dom.attr("data-viewer");
        var $domCopy = DomHelper.copy($dom)
        that.switchWorkspace("property", $domCopy, false, null, key)
    },
    numViewer: function () { //元素查看函数检查函数
        this.switchWorkspace('numViewer', null, false, null, null);
    },
    sameCnameViewer: function ($dom) {
        var that = this;
        view = 'sameCname';
        var $domCopy = DomHelper.copy($dom);
        that.switchWorkspace(view, $domCopy, false, null, "cname")
    },
    input2Btn: function (view, $doms, flag, $originContainer, key) {
        $.each($doms, function (index, item) { //遍历
            var $dom = $(item), //获取对应的dom
                id = $dom.attr('id'), //获取对应dom的id
                $origin = $originContainer.find('#' + id), //获取工作区中对应的元素
                isSelected = $dom.parent().hasClass('ui-draggable'), // 当前元素是否被选中;
                isNode = $dom.hasClass('workspace-node'), // 判断是否是表格中的input
                isFocus = $dom.hasClass('focus'); // 输入框有红色背景
            var $span = $('<span data-domId="' + id + '" data-property="' + key + '" class="property"></span>'),
                // $temp = isSelected ? $dom.parent() : $dom;
                $temp = $dom;
            $span.css({ //设置样式
                width: $origin.get(0).offsetWidth,
                height: isNode ? $origin.get(0).offsetHeight : "100%",
                position: $origin.css('position'),
                top: $origin.css('top'),
                left: $origin.css('left'),
                zIndex: 10001,
                display: "block",
                boxSizing: "border-box"
            });
            switch (view) { //判断view的状态
                case 'insertFn': //如果view是插入函数
                    $span.addClass('workspace-node-switch ' + (isFocus ? 'originSelected' : '')).data('cache', isSelected ? $dom.parent().get(0).outerHTML : $dom.get(0).outerHTML).html(id); //给span添加样式
                    break;
                case 'checkFn': //如果view是查看函数
                    var expr = new Property().getValue(id, 'expression'); //调用property的getvalue方法获取函数表达式
                    expr = expr ? '=' + expr : ''; //如果表达式存在=+表达式  不存在为空
                    if (expr) { //如果表达式存在给他添加一些属性
                        $dom.attr({
                            'data-toggle': 'tooltip',
                            'data-placement': 'top',
                            'title': expr
                        });
                        expr = '=' + expr;
                    }
                    $span.addClass('check-fn-node').html(expr); //给span添加样式并给他添加内容
                    break;
                case 'numViewer': //如果为元素查看器
                    $span.addClass('check-fn-node').html(id); //添加类名并在里面添加id
                    break;
                case 'sameCname':

                    var cnames = new Property().getArrayByKey('cname'),
                        cname = new Property().getValue(id, "cname");
                    if (cnames.indexOf(cname) != cnames.lastIndexOf(cname)) {
                        $span.addClass('check-fn-node').html(cname)
                        $span.css({
                            "color": "red"
                        })
                    } else {
                        $span.addClass('check-fn-node').html(cname)
                    }
                    $span.attr({
                        'data-toggle': 'tooltip',
                        'data-placement': 'top',
                        'title': cname
                    });
                    break;
                case "property":
                    var value = new Property().getValue(id, key)
                    if (typeof value == "object") {
                        value = JSON.stringify(value)
                    }
                    if (value) {
                        $span.attr({
                            'data-toggle': 'tooltip',
                            'data-placement': 'top',
                            'title': value
                        });
                    }
                    $span.addClass('check-fn-node').html(value);
            }
            $temp.replaceWith($span) //把$tmp中的替换成$span
        })
    },
    setValue: function () {
        var that = this;
        var $mask = $('#mask'),
            $target = $mask.find(".chageProperty"),
            property = $target.attr("data-property"),
            id = $target.attr("data-id"),
            value = $target.val();
        if ($target.length < 0) return;
        $mask.find(`.property[data-domid='${id}']`).text(value);
        $mask.find(`.property[data-domid='${id}']`).attr("title", value)
        if (property == "expression" || property == "dataSource.db" || property == "events" || property == "query.db" || property == "archivePath" || Property == "query.nest") {
            if (!value) return;
            value = JSON.parse(value)
        }
        try {
            new Property().setValue(id, property, value)
        } catch (error) {
            alert("请检查保存的数据格式是否正确?")
        }
        var $control = $(`#workspace #${id}`)
        new Property().load($control);
        $mask.find(".property").show();
        $mask.find(".chageProperty").hide();
    },
    bindEvents: function () {
        var that = this,
            $mask = $('#mask'); //获取遮罩元素

        $mask.off('click.workspace'); //移除click.workspace事件
        $('#workspace_copy').off('click.workspace'); //在$('#workspace_copy')元素上移除事件click.workspace
        $('nav').off('click.workspace'); //移除$('nav')上的click.workspace事件
        $("body").off('click.workspace') //移除$("body")上的click.workspace事件
        $mask.on('click.workspace', '.copy-dom', function (event) { //给遮罩上绑定事件
            new InsertFnModal($("#insertFunctionModal")).close(); //实例化InsertFNModal调用close方法
            new InsertFnArgsModal().close(); //实例化InsertFnArgsModal调用close方法
            that.resetView($mask); //调用resetView方法
        });
        $mask.on('click', ".property", function (event) {

            that.setValue()

            $mask.find(".property").show();
            $mask.find(".chageProperty").remove();
            var id = $(this).attr("data-domid"),
                type = $(this).attr("data-property"),
                value = new Property().getValue(id, type);
            var $control = $(`#workspace #${id}`)
            new Property().load($control);
            var $input = $(`<textarea type="text" value='${value?value:""}' class="chageProperty" autofocus:"autofocus" data-id="${id}" data-property="${type}"></textarea>`)
            if (typeof value == "object") {
                value = JSON.stringify(value, null, 2)
            }
            $input.val(value ? value : "")
            $input.css({
                position: $(this).css("position"),
                top: $(this).position().top,
                left: $(this).position().left,
                width: $(this).width(),
                height: $(this).height(),
                "z-index": 10002
            })

            $(this).hide()
            $(this).after($input)
        })
        $mask.on("keydown", function (event) {
            var code = event.keyCode;
            if (code == 13) {
                that.setValue()
            }
        })

        // 选择参数事件
        $('#workspace_copy').on('click.workspace', '.workspace-node-switch', function (event) {
            event.stopPropagation(); //阻止默认事件
            var that = this,
                $el = $(this), //获取点击的元素
                val = '{' + $el.text() + '}', //获取点击元素的内容
                $argInput = $("#insertFunctionArgsModal input.selected"), //获取元素
                hasArgInput = $argInput.length > 0, //对是否有进行判断有为true
                $customTextarea = $("#insertFunctionArgsModal textarea.selected"), //获取元素
                isOriginSelected = $el.hasClass('originSelected'); //检查该元素是否具有originSelected类名
            if (!hasArgInput && !$customTextarea) return; //如果hasArgInput和$customTextarea都为true退出函数
            else {
                if (!isOriginSelected) { //如果isOriginSelected为false
                    var $tempInput = hasArgInput ? $argInput : $customTextarea; //hasArgInput为true时$tempInput为$argInput否则为$customTextarea
                    var flag = $el.hasClass('selected'); //检查该元素是否有selected类名
                    if (flag) { //如果有类名
                        $el.removeClass('selected'); //移除类名
                        $tempInput.val() && $tempInput.val($tempInput.val().replace(new RegExp(val, 'g'), '')) //如果$tempInput.val()有值执行后面的
                    } else { //否则
                        if (hasArgInput) { //如果hasArgInput为true
                            $tempInput.val() && $('[data-domid="' + $tempInput.val().replace(/[\{\}]*/g, '') + '"]').removeClass('selected'); //如果$tempInput.val()存在获取元素移除类名
                            $argInput.val(val); //设置值
                        } else {
                            $customTextarea.val($customTextarea.val() + val); //否则直接设置值
                        }
                        $el.addClass('selected') //移除类名
                        $("#insertFunctionArgsModal .insert-fn-name").data('moreargs') ? new InsertFnArgsModal().addMoreArgs() : ''; // 有待优化
                    }
                }
            }
        });

        $('body').on('click.workspace', '.navbar, #controlbar ,#designer,#ruler', function (ev) { //绑定事件
            ($(ev.target).attr('id') === 'viewer') ? '' : that.resetView(true); //获取元素的id与viewr比较如果为真直接为空否知执行resetView函数
        })
    },
    setMask: function ($container) {
        if (!$container) return; //如果没有选中元素退出程序
        var arr = ['#controlbar', '.navbar.navbar-fixed-top', '#propertybar', '#toolbar'];
        arr.forEach(function (selector) { //数组遍历
            var $el = $(selector), //获取元素
                style = { //设置样式
                    position: "absolute",
                    top: $el.offset().top,
                    left: $el.offset().left,
                    width: $el.width(),
                    height: $el.width(),
                    zIndex: $el.css('z-index') * 1 + 1
                },
                $mask = $('<div class="section-mask"><div>').css(style); //生成一个html并添加css
            $container.append($mask); //添加到$container
        });
    },
    // 移除模态框
    resetView: function (flag) {
        flag = !!flag || false; //flag转布尔值 
        var that = this;
        that.setValue();
        $('#mask').remove(); //移除元素
        $("#insertFunctionModal").hide(); //隐藏元素
        $("#insertFunctionArgsModal").hide(); //隐藏元素
        flag && $('.is_using').removeClass('is_using'); //flag为true时移除类名
    },
}

function Workspace() {
    this.$workspace = $("#workspace");
    this.$phone = $("#phone_content");
    this.NAMESPACE = ".workspace";
    this.editor = null;
    this.USER = null;
    this.edit = null;
    //查询数据库
    this.queryDb = function (dbCollection, condition) {
        return new Service().query(dbCollection, condition)
    }
    //插入数据库
    this.inserDb = function (dbCollection, data) {
        return new Service().insert(dbCollection, data)
    }
    //更新数据库
    this.updataDb = function (dbCollection, condition, data) {
        return new Service().update(dbCollection, condition, data)
    }
    //移除数据库
    this.removeDb = function (dbCollection, condition) {
        return new Service().remove(dbCollection, condition)
    }
    //移除文件
    this.removeFile = function (Router) {
        return new FileService().rmdir(Router)
    }
    //读取文件
    this.readFile = function (Router) {
        return new FileService().readFile(Router, "UTF-8");
    }
    // //判断文件是否存在
    this.judgeFile = function (Router) {
        return new FileService().exists(Router)
    }
    // //创建文件夹
    this.mkdirFile = function (Router) {
        return new FileService().mkdir(Router)
    }
    // //保存文件
    this.saveFile = function (Router, data) {
        return new FileService().writeFile(Router, data)
    }
    //获取工作区中的数据
    this._getData = function (id, name, type, contactId) {
        if (!name) return alert("无法保存没有编号、名称的数据！");
        let that = this;

        that.$workspace.click();
        that.$workspace.find(".focus").removeClass(".focus");
        var settingData, modelData, tableData, phoneData, phoneSettingData, html = "",
            phoneHtml = "";
        //生成settingData数据
        settingData = {
            width: that.$workspace.width(),
            height: that.$workspace.height(),
            bgColor: that.$workspace.css("background-color"),
            items: []
        }
        that.$workspace.find(".workspace-node").each(function () {
            let isPhoneId = $(this).attr("id").startsWith("phone_");
            if (isPhoneId) return;
            let $this = $(this),
                cid = $this.attr("id"),
                cname = $this.attr("name"),
                cval = $this.val(),
                type = $this.attr("data-type"),
                subtype = $this.data("subtype"),
                position = $this.position(),
                item = {
                    id: cid,
                    name: cname,
                    value: cval,
                    type: type,
                    rect: {
                        width: parseFloat($this.css("width")),
                        height: parseFloat($this.css("height")),
                        left: position.left,
                        top: position.top,
                        zIndex: $this.css("z-index")
                    },
                    attach: {}
                };
            switch (type) {
                case "img":
                    item.attach = {
                        src: $(this).attr('src')
                    }
                    break
                case "div":
                    item.attach = {
                        html: $this.html()
                    }
                    break
                case "arrow":
                    item["subtype"] = subtype
                    break
            }
            settingData.items.push(item);
            html += new Control().renderHtml(id, item, subtype)
        })
        //生成phonesettingData
        phoneSettingData = {
            items: []
        }
        that.$phone.click()
        that.$phone.find(".workspace-node").each(function () {
            var $this = $(this),
                cid = $this.attr('id'),
                type = $this.attr("data-type"),
                left = parseFloat($this.css("left")),
                top = parseFloat($this.css("top")),
                item = {
                    id: cid,
                    name: $this.attr(name),
                    value: $this.val(),
                    type: type,
                    rect: {
                        width: parseFloat($this.css("width")),
                        height: parseFloat($this.css("height")),
                        left: left,
                        top: top,
                        zIndex: $this.zIndex
                    }
                };
            switch (type) {
                case "img":
                    item.attach = {
                        src: $(this).attr('src')
                    }
                    break;
                case "div":
                    item.attach = {
                        html: $this.html
                    }
                    break;
                case "arrow":
                    item["subtype"] = $this.data("subtype")
                    break
            }
            phoneHtml += new Control().getPhoneControlHtml($this, cid);
            phoneSettingData.items.push(item)
        })

        if (type == "布局") {
            tableData = new Property().getDbProperty(contactId, name)
        }

        var hiddenInput = '<input id="modelId" type="hidden" name="modelId" value="' + id + '">' +
            '<input id="modelName" type="hidden" name="modelName" value="' + name + '">';
        phoneData = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>手机页面</title></head><body>' +
            hiddenInput +
            '<input id="modelType" type="hidden" name="modelType" value="' + id + '">' +
            '<div style="position: relative">' +
            phoneHtml +
            '</div></body></html>';

        var $temp = $('<div id="modal_contain"></div>'),
            $temp_contain = $('<div></div>'),
            css_obj = {
                "position": "relative",
                "margin": "0 auto",
                "width": settingData.width,
                "height": settingData.height,
                "background-color": settingData.bgColor
            };
        $temp.css(css_obj).append($temp_contain.css(css_obj).append(html)); //插入到html中
        modelData = '<input id="modelId" type="hidden" name="modelId" value="' + id + '">' +
            '<input id="modelName" type="hidden" name="modelName" value="' + name + '">' +
            $temp.get(0).outerHTML;
        return {
            settingData: settingData,
            modelData: modelData,
            tableData: tableData,
            phoneData: phoneData,
            phoneSettingData: phoneSettingData
        }

    }
    this._setData = function (isPrompt, id, type, settingData, modelData, tableData, phoneData, phoneSettingData,version) {
        var that = this,
            property = {},
            phone_property = {};
        for (var i in GLOBAL_PROPERTY) {
            i.startsWith('phone_') ? phone_property[i] = GLOBAL_PROPERTY[i] : property[i] = GLOBAL_PROPERTY[i];
        }
        var arrs = [{ //定义arrs
            name: "setting.json",
            contentType: "text/plain;charset=utf-8",
            data: JSON.stringify(settingData)
        }, {
            name: "property.json",
            contentType: "text/plain;charset=utf-8",
            data: JSON.stringify(property)
        }, {
            name: "model.html",
            contentType: "text/html;charset=utf-8",
            data: modelData
        }, {
            name: "phone.html",
            contentType: "text/html;charset=utf-8",
            data: phoneData
        }, {
            name: "phone_setting.json",
            contentType: "text/html;charset=utf-8",
            data: JSON.stringify(phoneSettingData)
        }, {
            name: "phone_property.json",
            contentType: "text/html;charset=utf-8",
            data: JSON.stringify(phone_property)
        }]
        if (type == "布局" && tableData) { //如果type为产品或则type为数据库定义且type为布局且tabledata存在
            arrs.push({ //向数组中添加
                name: "table.json",
                contentType: "text/plain;charset=utf-8",
                data: JSON.stringify(tableData)
            });
        }
        var router = type == "布局" ? `./product/${id}${version?'.'+version:""}` : `./resource/${id}`;
        that.judgeFile(router).then(res => {
            //文件夹不存在
            if (!res) {
                return that.mkdirFile(router)
            }
        }).then(() => {
            var $y = that.saveFile,
                res = $.when(arrs.map(i => {
                    return $y(`./${router}/${i.name}`, i.data)
                }))
            if (res) { //如果$ajax存在的话
                res.done(function () { //执行ajax函数的 done方法
                    if (isPrompt) { //如果ispromt是真值的话提示保存成功
                        alert("保存成功！");
                    }
                }).fail(function () {
                    if (isPrompt) { //如果ispromt是真值的话提示保存失败
                        alert("保存失败！");
                    }
                });
            }
        })

    }
    this._sameNameValidate = function () {
        var arrs = new Property().getArrayByKey("cname"), //实例化property调用getArrayBykey方法
            isRepeat = arrs.isRepeat(); //调用数组的扩展函数isRepeat
        if (isRepeat) return confirm("存在相同的中文名设置！确定要保存吗？"); //如果存在提示
        else return true; //否则退出函数
    };
}
Workspace.prototype = {
    init: async function (id, name, type, contactId, relTemplate, edit, setting) {
        if (!id || !name || !type) return;
        var that = this,
            text = name + '<span class="text-danger">' + "(" + id + ")" + '</span>',
            attrs = {
                'data-id': id,
                "data-name": name,
                "data-type": type,
                "data-contactId": contactId,
                "data-relTemplate": ""
            };
        that.edit = edit;
        if (type == "布局" && DataType.isObject(relTemplate)) {
            attrs["data-relTemplate"] = JSON.stringify(relTemplate)
        }
        $("#name").empty().append(text);
        that.$workspace.empty().attr(attrs);
        //解决文件名的问题
        if (!setting) {
            that.$workspace.append($(`<input type="hidden" class="workspace-node" data-type="hidden" value="${id}" style="display:none" id="ZZZZ" name="布局名">`))
        }
        if (setting) {
            var result = setting.items.some(function (item) {
                return item.id == "ZZZZ"
            })
            if (!result) {
                that.$workspace.append($(`<input type="hidden" class="workspace-node" data-type="hidden" value="${id}" style="display:none" id="ZZZZ" name="布局名">`))
            }
        }
        that.$phone.empty().parents("#phone_warp").hide();
        new Filter(type).set();
        id ? $("#saveAs").show() : $("#saveAs").hide();
        $("#toolbar").css('right', "260px") //设置样式
        $("#toolbar").css('left', "140px") //设置样式
        GLOBAL_PROPERTY = {}; //全局属性值空
        LAST_SELECTED_ID = null; // 最后一次被选中的元素id
        LAST_POSITION = {}; // 选中元素的初始位置
        // var db = await new FileService().readFile("./profiles/table.json", "utf-8")
        var db = await new BuildTableJson().get()
        for (dbName in db) {
            for (table in db[dbName]) {
                if (db[dbName][table]["key"] == 0 || db[dbName][table]["key"] == 1) {
                    delete db[dbName][table]
                }

            }
        }
        AllDbName = db;
        that.save(false, null, null)
    },
    load: function (id, name, type, contactId, relTemplate, edit, isCreate) {
        if (!id || !type || !name) return;
        var that = this,
            url = type === "表单" ? `./resource/${id}` : (isCreate ? `./resource/${contactId}` : `./product/${id}`);
        $.when(that.readFile(url + "/setting.json"), that.readFile(url + "/property.json")).done(function (ret1, ret2) {
            that.init(id, name, type, contactId, relTemplate, edit, ret1);
            var settingData = ret1,
                propertyData = ret2;
            var control = new Control(),
                contextMenu = new ContextMenu();
            for (var i = 0; i < settingData.items.length; i++) { //遍历小于settingData.items.length的数
                var item = settingData.items[i]
                control.setControl(item.type, function ($node) { //调用control中的setControl方法
                    $node.attr({ //添加属性
                        "id": item.id,
                        "name": item.name,
                        "value": item.value,
                        "data-type": item.type
                    });
                    $node.css({ //添加样式
                        "left": item.rect.left,
                        "top": item.rect.top,
                        "z-index": item.rect.zIndex,
                        "width": item.rect.width,
                        "height": item.rect.height
                    });
                    switch (item.type) {
                        case "img": //如果类型为img
                            var src = item.attach.src; //生成src
                            $node.attr("src", !item.attach ? "../public/images/demo.jpg" : (!item.attach.src ? "../public/images/demo.jpg" : src)); //如果item.attach不存在
                            contextMenu.done(1, $node); //调用contextMenu中的done方法
                            break;
                        case "div": //如果类型为div
                            $node.append(item.attach ? item.attach.html : ""); //向当前元素中添加元素
                            contextMenu.done(2, $node); //调用contextMenu中的done方法
                            contextMenu.done(3, $node.find(":input")); //调用contextMenu中的done方法
                            break;
                        case "arrow":
                            $node.attr('data-subtype', item.subtype)
                            control.drawArrow($node, item.subtype, item.rect.width, item.rect.height)
                        default:
                            contextMenu.done(3, $node); //调用contextMenu中的done方法
                            break;
                    }
                    that.$workspace.append($node);
                });
            }
            that.$workspace.find("#ZZZZ").val(id)
            GLOBAL_PROPERTY = propertyData; //赋值
            //解决保存文件名的问题
            if (!GLOBAL_PROPERTY["ZZZZ"]) {
                new Property().setValue("ZZZZ", null, {
                    cname: "布局名",
                    name: "ZZZZ"
                })
            }
            that.loadPhone(id, contactId, type);
            var max_h = 0,
                max_w = 0;
            that.$workspace.find('div, p, img').each(function (i, el) { //对工作区中元素进行累加得到宽度
                max_w = $(el).width() > max_w ? $(el).width() : max_w; //判断当前元素的宽度
                max_h = $(el).height() > max_h ? $(el).height() : max_h;
            });
            that.$workspace.css({ //设置样式
                "width": settingData.width > max_w ? settingData.width : max_w,
                "height": settingData.height > max_h ? settingData.height : max_h,
                "background-color": settingData.bgColor
            });
            new Ruler().drawCoordinates();
            AccessControl.bindPagePersentEvent(id);
            Observer.observe($("#workspace"))
        }).fail(function () { //如果失败
            that.init(id, name, type, contactId, relTemplate, that.USER); //调用init方法
        });
    },
    loadPhone: function (id, contactId, type, isCreate) {
        var that = this;
        var url = type === "表单" ? `./resource/${id}` : (isCreate ? `./resource/${contactId}` : `./product/${id}`);
        $.when(that.readFile(url + "/phone_setting.json"), that.readFile(url + "/phone_property.json")).done(function (ret1, ret2) { //调用函数_getAjax获取json
            var phoneSettingData = ret1 || {},
                phonePropertyData = ret2 || {};
            var control = new Control(), //实例化Control
                contextMenu = new ContextMenu(); //实例化contextMenu

            for (var j = 0; j < phoneSettingData.items.length; j++) { //遍历小于settingData.items.length的数
                var item = phoneSettingData.items[j];
                control.setControl(item.type, function ($node) { //调用control中的setControl方法
                    $node.attr({ //添加属性
                        "id": item.id,
                        "name": item.name,
                        "value": item.value,
                        "data-type": item.type
                    });
                    $node.css({ //添加样式
                        "left": item.rect.left,
                        "top": item.rect.top,
                        "z-index": item.rect.zIndex,
                        "width": item.rect.width,
                        "height": item.rect.height
                    });
                    switch (item.type) {
                        case "img": //如果类型为img
                            var src = item.attach.src; //生成src
                            $node.attr("src", !item.attach ? "../public/images/demo.jpg" : (!item.attach.src ? "../public/images/demo.jpg" : src)); //如果item.attach不存在
                            break;
                        case "div": //如果类型为div
                            $node.append(item.attach ? item.attach.html : ""); //向当前元素中添加元素
                            break;
                        case "arrow":
                            $node.attr('data-subtype', item.subtype)
                            control.drawArrow($node, item.subtype, item.rect.width, item.rect.height)
                    }
                    contextMenu.done(4, $node);
                    that.$phone.append($node);
                }, true);
            }
            GLOBAL_PROPERTY = $.extend({}, GLOBAL_PROPERTY, phonePropertyData); //赋值

        }).fail(function (err) { //如果失败
        });
    },
    save: function (isPrompt, saveAsId, changeId, changeData, changeName,version) {
        var that = this;
        if (isPrompt) {
            var isValidate = that._sameNameValidate(); //调用_sameNameValidate
            if (!isValidate) return;
        }
        var saveId = null;
        var id = that.$workspace.attr("data-id"), //获取工作区data-id
            name = that.$workspace.attr("data-name"), //获取工作区data-name
            type = that.$workspace.attr("data-type")
        contactId = that.$workspace.attr("contactId"); //获取工作区data-subtype
        saveId = id,
            dbCollection = type == "表单" ? "newResources" : "newProducts";

        if (saveAsId) {
            saveId = saveAsId
            var condition = [{
                col: "customId",
                value: id
            }]
            //查询原来的信息 插入新的
            this.queryDb(dbCollection, condition).then(res => {
                var data = res[0];
                var params = [{
                        col: "_id",
                        value: saveAsId
                    },
                    {
                        col: "customId",
                        value: saveAsId
                    },
                    {
                        col: "name",
                        value: data.name
                    },
                    {
                        col: "edit",
                        value: that.USER + "," + new Date().toFormatString(null, true)
                    },
                    {
                        col: "createTime",
                        value: new Date().toFormatString(null, true)
                    },
                    {
                        col: "createor",
                        value: that.USER
                    },
                    {
                        col: "basicInfo",
                        value: data.basicInfo
                    }
                ]
                this.inserDb(dbCollection, params)
            })
            var data = that._getData(saveId, name, type, contactId)
            if (data) {
                that._setData(isPrompt, saveId, type, data.settingData, data.modelData, data.tableData, data.phoneData, data.phoneSettingData, version)
            }

        }
        if (changeId) {
            if (type == "布局") {
                saveId = changeId;
                var queryCondition = [{
                    col: "customId",
                    value: changeId
                }]
                that.queryDb(dbCollection, queryCondition).then(res => { //查询新的id是否存在
                    if (res.length > 0) return alert(`布局ID（${changeId}）以存在`);
                    var condition = [{
                        col: "customId",
                        value: id
                    }]
                    that.removeDb(dbCollection, condition) //移除原来的id
                    that.removeFile(`/product/${id}`) //移除文件
                    that.inserDb(dbCollection, changeData) //插入新的数据
                    var data = that._getData(saveId, name, type, contactId)
                    if (data) {
                        that._setData(isPrompt, saveId, type, data.settingData, data.modelData, data.tableData, data.phoneData, data.phoneSettingData, version)
                    }
                    //设置新的属性
                    that.$workspace.attr({
                        "data-id": changeId,
                        "data-name": changeName
                    })
                    that.$workspace.find("#ZZZZ").val(changeId)
                    //设置新的名字
                    var text = changeName + '<span class="text-danger">' + "(" + changeId + ")" + '</span>'
                    $("#name").empty().append(text)
                })
            }
            if (type == "表单") { //修改表单信息时不需要更新
                saveId = changeId;
                var queryCondition = [{
                        col: "customId",
                        value: changeId
                    }],
                    data = that._getData(saveId, name, type, contactId)
                that.queryDb(dbCollection, queryCondition).then(res => {
                    if (res.length > 0) return alert(`表单ID（${changeId}）以存在`);
                    var condition = [{
                        col: "customId",
                        value: id
                    }]
                    that.removeDb(dbCollection, condition)
                    that.removeFile(`/resource/${id}`)
                    that.inserDb(dbCollection, changeData)
                    if (data) {
                        that._setData(isPrompt, saveId, type, data.settingData, data.modelData, data.tableData, data.phoneData, data.phoneSettingData, version)
                    }
                    that.$workspace.attr({
                        "data-id": changeId,
                        "data-name": changeName
                    })
                    that.$workspace.find("#ZZZZ").val(changeId)
                    var text = changeName + '<span class="text-danger">' + "(" + changeId + ")" + '</span>'
                    $("#name").empty().append(text)

                })
            }
            //移除原来的数据 文件夹
        }
        if (!saveAsId && !changeId && !changeData) {
            var data = that._getData(saveId, name, type, contactId)
            if (data) {
                that._setData(isPrompt, saveId, type, data.settingData, data.modelData, data.tableData, data.phoneData, data.phoneSettingData, version)
                var dbcondition = [{
                        col: "_id",
                        value: saveId
                    }],
                    dbdata = [{
                        col: "lastEditTime",
                        value: new Date().toFormatString(null, true)
                    }];
                that.updataDb(dbCollection, dbcondition, dbdata)
            }
        }

    }
}