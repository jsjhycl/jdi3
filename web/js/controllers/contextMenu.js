/** 
 * 右键菜单模块
 */
function ContextMenu() {
    //引入属性用于处理各个子模块之间的引用
    // this.importProperty = function ($elem, $submenu) {
    //     var dstId = $elem.attr("id"), //
    //         $dstDiv = $elem; //当前点击的子模块
    //     $('#workspace .workspace-node[data-type="div"]').not("#" + dstId).each(function () { //获取工作区中元素(data-type="div")的元素排除自身
    //         var $menuitem = $('<div class="menuitem"><a>' + this.id + '</a></div>'); //生成引入属性的控件栏
    //         $menuitem.click(function () { //给每个引入属性添加事件
    //             var srcId = $(this).find("a").text(), //获取点击的元素id
    //                 $srcDiv = $("#" + srcId), //获取该元素
    //                 data = DomHelper.getEqualElements($srcDiv, $dstDiv); //获取等值元素返回一个数组
    //             if (!data.length <= 0) return; //??这个地方可能是bug具体要看

    //             var result = confirm("您确定要替换引入属性配置的" + data.length + "个元素吗？"); //弹窗时候确认替换引入属性配置的元素
    //             if (!result) return;

    //             //属性拷贝
    //             data.forEach(function (item) { //这段代码不会执行data到这里
    //                 var $src = item.key,
    //                     $dst = item.value,
    //                     srcId = $src.attr("id"),
    //                     dstId = $dst.attr("id");
    //                 new Property().remove(dstId);
    //                 $dst.attr({
    //                     id: srcId,
    //                     name: $src.attr("name")
    //                 });
    //                 $src.attr({
    //                     id: "",
    //                     name: ""
    //                 });
    //             });
    //             DomHelper.setIds($dstDiv, "&");
    //         });
    //         $submenu.append($menuitem); //把生成的html插入进去
    //     });
    // };

    //批量设置属性 (空白区域有击)
    this.batchSetAttrs = function () {
        var result = confirm("您确定要设置默认属性吗？"); //弹窗是否确认批量设置属性
        if (!result) return; //如果取消直接跳出函数

        var count = 0,
            $nodes = $('#workspace .workspace-node:text,#workspace .workspace-node[data-type="div"] :text'); //获取所有工作区中的输入框的值
        $nodes.each(function () { //对获取的元素遍历这是基本属性
            var property = GLOBAL_PROPERTY[this.id]; //获取全局变量
            property["controlType"] = "文本输入框"; //控件类型设置为文本输入框
            property["fontFamily"] = "宋体"; //字体设置成宋体
            property["fontSize"] = "10px"; //尺寸设置为10px   兼容性问题最小只用12px
            property["color"] = "black"; //颜色设置成黑色
            property["backgroundColor"] = "white"; //背景色设置成白色
            count++;
        });
        new Workspace().save(false);
        alert("一共设置了" + count + "个元素的默认属性！"); //提示一共设置了几个元素的属性
    };

    /**
     * 批量设置变量
     * $elem 那个子模块
     */
    this.batchSetVals = function ($elem) {
        var count = 0; //声明变量并赋值为0
        $elem.find(":input").each(function () { //在子模块中寻找所有的输入框并遍历
            if ($(this).val() === "&") return true; //如果输入框中的文本值为&则直接跳出程序

            $(this).val("$" + count); //设置对应元素的文本值
            count++; //变量自增
        });
    };

    /**
     * 批量设置中文名
     * $elm为对应的子模块
     */
    this.batchSetNames = function (type, $elem) {
        var arrs = []; //声明一个空的数组
        if (type == 5) {
            $elem.find(":input").each(function () {
                var id = this.id; //获取当前元素的编号
                if (!id) return true; //如果编号不存在则退出
                arrs.push({
                    id: id,
                    cname: $(this).val() || ''
                });
            })
        } else {
            var $table = $elem.find("table"); //在对应的子模块中寻找table
            if ($table.length <= 0) return alert("找不到批量设置中文名的表格！"); //如果找不到table则退出函数并提示

            $table.find(":input").each(function () { //在对应的table中寻找所有的数据
                var id = this.id; //获取当前元素的编号
                if (!id) return true; //如果编号不存在则退出
                var text = '';
                switch (type) {
                    case 1:
                        var index = $(this).parents("td").index(),
                            $tr = $(this).parents("tr").prev();
                        text = $tr.find("td").eq(index).text().trim();
                        break;
                    case 2:
                        var $prev = $(this).parents("td").prev();
                        text = $prev.text().trim();
                        break;
                    case 3:
                        var index = $(this).parents("td").index(),
                            $tr = $(this).parents("tr").next();
                        text = $tr.find("td").eq(index).text().trim();
                        break;
                    case 4:
                        var $next = $(this).parents("td").next();
                        text = $next.text().trim();
                        break;
                    default:
                        break;
                }
                arrs.push({
                    id: id,
                    cname: text
                }); //把对象添加到数组中
            });
        }
        var property = new Property(); //实例化属性栏的实例
        arrs.forEach(function (item) { //遍历数组
            var cname = property.getValue(item.id, "cname");
            if (!cname || cname == item.id)
                property.setValue(item.id, "cname", item.cname); //遍历数组设置元素的中文名
        });
        alert("设置成功！"); //提示弹出成功
    };

    /**
     * 添加控件
     * type为控件类型目前支持的checkbox复选框和text文本输入框
     */
    this.addControl = function (type) {
        var control = new Control(); //实例化控件
        control.setControl(type, function ($node) { //调用control下面的setcontrol方法生成控件
            var number = control.createNumber(type); //调用control.createNumber方法生成编号
            $node.attr({ //给该元素设置id和表单名属性
                "id": number,
                "name": number
            }).css({ //设置生成的css让他距离工作区上右各5px
                "left": "5px",
                "top": "5px"
            });
            $("#workspace").append($node); //把这个元素添加到工作区中
            new Property().setDefault(number); //实例化属性控件并调用setDefault方法设置元素的默认的属性
        });
    };

    /**
     * 复制属性 控件右击
     * type 类型 1表示按行 复制属性 2表示按列
     */
    this.copyAttrs = function (type, $elem) {
        var $table = $elem.parents("table"); //获取该元素的父元素看是否是表格中的控件
        if ($table.length <= 0) return alert("当前控件不支持按行、按列复制功能！"); //如果不是表格中的控件则提示

        var id = $elem.attr("id"); //获取当前控件的编号
        if (!id) return alert("没有可复制的属性数据！"); //如果获取不到控件的编号则退出函数并提示

        if (type === 1) { //按行复制
            $elem.parents("td").nextAll().each(function () { //遍历当前控件的的父集中的所有td
                var cid = $(this).find(":input").attr("id"); //获取遍历的当前控件的编号(id)
                if (cid && cid !== id) { //如果当前的控件的编号存在并不等于选中                  
                    new Property().copy(id, cid); //实例化属性并调用copy方法
                    //获取文本值并赋值给当前元素
                    var textVal = GLOBAL_PROPERTY[cid].value;
                    $(`#${cid}`).attr('value', textVal).val(textVal);
                }
            });
        } else if (type === 2) { //按列复制
            var index = TableHelper.getTdIndex($elem); //调用tableHelper下面的getTdindex(获取行的index)
            $elem.parents("tr").nextAll().each(function () { //获取所有的列并遍历
                var cid = $(this).find("td").eq(index).find(":input").attr("id"); //获取遍历的当前列对应的的对应行的输入框的id
                if (cid && cid !== id) { //如果当前控件的编号存在
                    new Property().copy(id, cid); //实例化属性并调用copy方法
                    //获取文本值并赋值给当前元素
                    var textVal = GLOBAL_PROPERTY[cid].value;
                    $(`#${cid}`).attr('value', textVal).val(textVal);
                }
            });
        }
    };

    /**
     * 行编号设置 
     */
    // this.setLineId = function ($elem) {
    //     var $table = $elem.parents("table"); //获取该元素的父集并复制
    //     if ($table.length <= 0) return alert("格式错误！"); //如果不是表格中的元素则退出程序并提示

    //     var $trs = $table.find("tr"), //获取table中所有的行
    //         rowIndex = -1; //行编号
    //     $trs.each(function () {
    //         var $inputs = $(this).find(":input"); //获取该行中的所有输入框
    //         if ($inputs.length > 0) { //如果能够获取到输入框
    //             rowIndex++; //行编号自增
    //         }
    //         var columnIndex = 0; //列表编号
    //         $inputs.each(function () { //获取所有的行编号并遍历
    //             $(this).addClass("focus"); //给当前的输入框添加类名
    //             var strId = NumberHelper.idToName(rowIndex, 2) + NumberHelper.idToName(columnIndex, 2), //生成编号AA(表示列)AA(表示行)
    //                 result = confirm("即将设置的编号为：" + strId + "，确定要设置吗？"); //确认弹窗问是否确认修改
    //             if (result) { //如果确认修改
    //                 $(this).attr("id", strId); //给该输入框编号从新设置
    //                 columnIndex++; // 列编号自增
    //             } else {
    //                 return false;
    //             }
    //             $(this).removeClass("focus"); //移除当前元素的focus类名
    //         });
    //     });
    // };

    /**
     * 选择页面
     */
    this.selectPage = function () {
        var $workspace = $("#workspace"); //获取工作区
        $workspace.addClass("focus"); //工作区添加foucs类名
        new Property().load($workspace); //属性重新加载worksapce
        $workspace.jresizable({
            mode: "single",
            multi: event.ctrlKey,
            color: "red", // czp修改了颜色
            onStart: function () {
                $workspace.selectable("disable");
            },
            onStop: function () {
                $workspace.selectable("enable");
            }
        });
    }
    //窗口可见性
    this.windowIsShow = function (idx, $this) {
        var resizableNode = $('.resizable-node'),
            resizableNodeChild = resizableNode.children('div');
        if (idx === 2) {
            resizableNode.find('table').hide();
            resizableNodeChild.css({
                "width": "6px",
                "height": "6px",
                "border-radius": "50%",
                "backgroundColor": "#5B9BD5",
                "overflow": "hidden"
            })

            resizableNode.parent().css({
                "width": "10px",
                "height": "10px",
                "border-radius": "50%"
            })

        } else {
            resizableNode.find('table').show();
            resizableNodeChild.css({
                "width": "100%",
                "height": "100%",
                "border-radius": "0",
                "backgroundColor": "transparent",
                "overflow": "visible"
            })
            var resizableNodeTable = resizableNode.find('table'),
                nodeTableWidth = resizableNodeTable.width(),
                nodeTableHeight = resizableNodeTable.height();
            resizableNode.parent().css({
                "width": nodeTableWidth + 'px',
                "height": nodeTableHeight + 5 + 'px',
                "border-radius": "0",
            })

        }
    }
    /**
     * 页面自适应宽高
     */
    this.pageAuto = function () {
        var $workspace = $("#workspace");
        var $childs = $workspace.children();
        if ($childs.length <= 0) return;
        var top = parseFloat($childs.eq(0).css("top")),
            left = parseFloat($childs.eq(0).css("left")),
            width = parseFloat($childs.eq(0).outerWidth()),
            height = parseFloat($childs.eq(0).outerHeight());
        $childs.each(function (index, element) {
            var childTop = parseFloat($(element).css("top")),
                childLeft = parseFloat($(element).css("left"));
            top = childTop < top ? childTop : top;
            left = childLeft < left ? childLeft : left;
            width = (parseFloat($(element).outerWidth()) + childLeft) > width ? (parseFloat($(element).outerWidth()) + childLeft) : width;
            height = (parseFloat($(element).outerHeight()) + childTop) > height ? (parseFloat($(element).outerHeight()) + childTop) : height;
        })
        $childs.each(function () {
            $(this).css({
                top: parseFloat($(this).css("top")) - top,
                left: parseFloat($(this).css("left")) - left
            })
        })
        $workspace.css({
            top: top,
            left: left,
            width: width - left,
            height: height - top
        })
    }

    // 复制当前行
    this.copyLine = function ($el, num) {
        var $parent = $el.parents('tr'),
            clone,
            $target = $parent.length <= 0 ? $el : $parent.eq(0),
            control = new Control(),
            contextMenu = new ContextMenu(),
            maxId,
            arr = [],
            rowspan = 1;
        if ($parent.length > 0) {
            var rowspans = [];
            $target.find("td").each(function () {
                var $td = $(this);
                if (typeof $td.attr("rowspan") !== 'undefined') {
                    rowspans.push(parseInt($td.attr("rowspan")));
                }
            })
            if (rowspans.length > 0)
                rowspan = Math.max.apply(null, rowspans);
        }
        // while(num > 0) {
        for (var i = 0; i < num; i++) {
            clone = $target.clone();
            if ($parent.length <= 0) {
                if ($target.parent().hasClass("ui-draggable-handle")) {
                    $(clone).css({
                        width: $target.parent().width(),
                        height: $target.parent().height(),
                        top: parseInt($target.parent().css("top")) + ($target.height() + 10) * (i + 1)
                    })
                }
                var type = $el.get(0).tagName === 'INPUT' ? 'text' : $(dom).get(0).tagName.toLowerCase(),
                    prefix = type == 'div' ? 'DIV_' : "";
                maxId = maxId ? NumberHelper.idToName(NumberHelper.nameToId(maxId) + 1, 4) : control.createNumber(type);
                type == 'text' && new Property().copy($el.attr('id'), maxId);
                type == 'div' ? contextMenu.done(2, $(clone)) : contextMenu.done(3, $(clone));
                $(clone).attr({
                    id: prefix + maxId,
                    name: prefix + maxId,
                })
                // $target.after(clone[0]);
                arr.push(clone[0]);
            } else {
                var trIndex = $target.index();
                var trs = [];
                $target.parent().find("tr").each(function (ind, ele) {
                    console.log(ind, (trIndex + rowspan) > ind && trIndex >= ind)
                    if ((trIndex + rowspan) > ind && trIndex <= ind) {
                        trs.push($(ele).clone());
                    }
                })
                var inputMaxId;
                trs.forEach(function (ele, ind) {
                    $(ele).find('div, input, button, checkbox').each(function (idx, dom) {
                        var type = $(dom).get(0).tagName === 'INPUT' ? 'text' : $(dom).get(0).tagName.toLowerCase(),
                            prefix = type == 'div' ? 'DIV_' : "";
                        if (type == 'text') {
                            inputMaxId = inputMaxId ? NumberHelper.idToName(NumberHelper.nameToId(inputMaxId) + 1, 4) : control.createNumber(type);
                            new Property().copy($(dom).attr('id'), inputMaxId);
                            // addNewProp($(dom).attr('id'), inputMaxId);
                            contextMenu.done(3, $(dom));
                            $(dom).attr({
                                id: prefix + inputMaxId,
                                name: prefix + inputMaxId,
                            });
                        } else {
                            if (maxId && maxId.indexOf("_") >= 0)
                                maxId = maxId.split("_")[1];
                            maxId = maxId ? NumberHelper.idToName(NumberHelper.nameToId(maxId) + 1, 4) : control.createNumber(type);
                            // type == 'text' && addNewProp($(dom).attr('id'), maxId);
                            type == 'div' ? contextMenu.done(2, $(dom)) : contextMenu.done(3, $(dom));
                            $(dom).attr({
                                id: prefix + maxId,
                                name: prefix + maxId,
                            });
                        }
                    });
                    arr.push(ele[0]);
                })
            }
            // arr.push(clone[0]);
        }
        if (arr.length > 0) {
            arr.reverse().map(function (i) {
                $parent.length <= 0 ? $target.after(i) : $target.parent().find("tr").eq(trIndex + rowspan - 1).after(i);
            })
        }
        /* arr.reverse().map(function (i) {
            $target.after(i);
        }) */

        $target.parents('.workspace-node').height('auto');
    }

    // 手机元素关联工作区元素
    this.relateWorkspace = function ($el) {
        var $origin = $("#workspace").find("input.focus"),
            $target = $("#phone_content").find(".resizable input");

        if ($origin.length === 1 && $target.attr('id') === $el.attr('id')) {
            var origin_id = $origin.attr('id');
            $("#property_relatedId").val(origin_id);
            var property = new Property();
            property.setValue($el.attr('id'), "relatedId", origin_id);
            property.getValue($el.attr('id'), "relatedId") === origin_id && alert('关联元素' + origin_id + '成功')
        }
    }
}

ContextMenu.prototype = {
    /**
     * 
     * @param {*} type 点击的类型1(工作区空白处点击),2(子模块导入右键),3(控件元素的右键)
     * @param {*} elem 
     */
    done: function (type, elem) {
        var that = this;
        switch (type) {
            case 1:
                //空白区域右键菜单
                elem.jcontextmenu({ //通过jcontextmenu设置属性栏
                    menus: [{
                        type: "menuitem",
                        text: "批量设置属性",
                        handler: function () {
                            that.batchSetAttrs(); //调用批量设置属性
                        }
                    },
                    {
                        type: "separator"
                    }, //分割线
                    {
                        type: "menuitem",
                        text: "添加图片",
                        handler: function () {
                            $('#controlbar .control-item[data-type="img"]').click();
                        }
                    },
                    {
                        type: "separator"
                    },
                    {
                        type: "menuitem",
                        text: "添加复选框",
                        handler: function () {
                            that.addControl("checkbox");
                        }
                    },
                    {
                        type: "menuitem",
                        text: "添加文本框",
                        handler: function () {
                            that.addControl("text");
                        }
                    },
                    {
                        type: "separator"
                    },
                    {
                        type: "menuitem",
                        text: "添加子模块设计器",
                        handler: function () {

                            // $('#controlbar .control-item[data-type="div"]').click();
                            var arrs = [
                                "channelmode=no",
                                "directories=no",
                                "location=no",
                                "menubar=no",
                                "resizable=yes",
                                "scrollbars=no",
                                "status=no",
                                "titlebar=no",
                                "toolbar=no",
                                "width=1000px",
                                "height=700px",
                                "top=100px",
                                "left=200px"
                            ];
                            let editor = window.open("./editor.html", "_blank", arrs.join(", "));
                        }
                    },
                    {
                        type: "separator"
                    },
                    {
                        type: "menuitem",
                        text: "选择页面",
                        handler: function () {
                            that.selectPage();
                        }
                    },
                    {
                        type: "menuitem",
                        text: "页面自适应",
                        handler: function () {
                            that.pageAuto();
                        }
                    }
                    ]
                });
                break;
            case 2:
                //子模块设计器右键菜单
                elem.jcontextmenu({
                    menus: [{
                        type: "menuitem",
                        text: "批量设置中文名",
                        submenus: [{
                            type: "menuitem",
                            text: "由上",
                            handler: function () {
                                that.batchSetNames(1, $(this));
                            }
                        },
                        {
                            type: "menuitem",
                            text: "由左",
                            handler: function () {
                                that.batchSetNames(2, $(this));
                            }
                        },
                        {
                            type: "menuitem",
                            text: "由下",
                            handler: function () {
                                that.batchSetNames(3, $(this));
                            }
                        },
                        {
                            type: "menuitem",
                            text: "由右",
                            handler: function () {
                                that.batchSetNames(4, $(this));
                            }
                        },
                        {
                            type: "separator"
                        },
                        {
                            type: "menuitem",
                            text: "文本值转换",
                            handler: function () {
                                that.batchSetNames(5, $(this));
                            }
                        }
                        ]
                    },
                    // {
                    //     type: "separator"
                    // },
                    // {
                    //     type: "menuitem",
                    //     text: "引入属性",
                    //     dynamic: function ($submenu) {
                    //         that.importProperty($(this), $submenu);
                    //     }
                    // },
                    // {
                    //     type: "menuitem",
                    //     text: "批量设置变量",
                    //     handler: function () {
                    //         that.batchSetVals($(this));
                    //     }
                    // },
                    {
                        type: "separator"
                    },
                    {
                        type: "menuitem",
                        text: "选择页面",
                        handler: function () {
                            that.selectPage();
                        }
                    },
                    {
                        type: "menuitem",
                        text: "页面自适应",
                        handler: function () {
                            that.pageAuto();
                        }
                    }, {
                        type: "separator"
                    }, {
                        type: "menuitem",
                        text: "窗口可见性",
                        submenus: [{
                            type: "menuitem",
                            text: "可见",
                            handler: function () {
                                that.windowIsShow(1);
                            }
                        },
                        {
                            type: "menuitem",
                            text: "不可见",
                            handler: function () {
                                that.windowIsShow(2, $(this));
                            }
                        }
                        ]
                    }
                    ]
                });
                break;
            case 3:
                //控件元素右键菜单
                elem.jcontextmenu({
                    menus: [{
                        type: "menuitem",
                        text: "清除属性",
                        handler: function () {
                            var id = this.id,
                                property = new Property();
                            property.remove(id);
                            property.setDefault(id);
                            //还得修改相应的DOM数据
                        }
                    },
                    {
                        type: "separator"
                    },
                    {
                        type: "menuitem",
                        text: "复制属性",
                        submenus: [{
                            type: "menuitem",
                            text: "按行",
                            handler: function () {
                                that.copyAttrs(1, $(this));
                            }
                        },
                        {
                            type: "menuitem",
                            text: "按列",
                            handler: function () {
                                that.copyAttrs(2, $(this));
                            }
                        }
                        ]
                    },
                    // {
                    //     type: "separator"
                    // },
                    // {
                    //     type: "menuitem",
                    //     text: "行编号设置",
                    //     handler: function () {
                    //         that.setLineId($(this));
                    //     }
                    // },
                    {
                        type: "separator"
                    },
                    {
                        type: "menuitem",
                        text: "选择页面",
                        handler: function () {
                            that.selectPage();
                        }
                    },
                    {
                        type: "menuitem",
                        text: "页面自适应",
                        handler: function () {
                            that.pageAuto();
                        }
                    },
                    {
                        type: "separator"
                    },
                    {
                        type: "menuitem",
                        text: "新增当前行",
                        handler: function () {
                            var $el = $(this);

                            new PromptModal('新增行数', function (val) {
                                var num = Number(val);
                                if (Number.isNaN(num) || num <= 0) {
                                    alert('无效的参数')
                                } else {
                                    that.copyLine($el, num);
                                }
                            }).init()
                        }
                    },
                    {
                        type: "separator"
                    },
                    {
                        type: "menuitem",
                        text: "批量设置查询显示路径",
                        handler: function () {
                            let id = $("#property_id").val(),
                                query = new Property().getValue(id, 'query.db'),
                                nestQuery = new Property().getValue(id, 'query.nest');
                            (query || nestQuery) ? $("#archivePathBatch_modal").modal('show') : alert('当前控件未设置查询属性！')
                        }
                    }
                    ]
                });
                break;
            case 4:
                // 手机元素右键菜单
                elem.jcontextmenu({ //通过jcontextmenu设置属性栏
                    menus: [{
                        type: "menuitem",
                        text: "关联工作区元素",
                        handler: function () {
                            that.relateWorkspace(elem);
                        }
                    }

                    ]
                });
        }
    }
};