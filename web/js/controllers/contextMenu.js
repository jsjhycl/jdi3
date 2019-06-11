function ContextMenu() {
    //引入属性
    this.importProperty = function ($elem, $submenu) {
        var dstId = $elem.attr("id"),
            $dstDiv = $elem;
        $('#workspace .workspace-node[data-type="div"]').not("#" + dstId).each(function () {
            var $menuitem = $('<div class="menuitem"><a>' + this.id + '</a></div>');
            $menuitem.click(function () {
                var srcId = $(this).find("a").text(),
                    $srcDiv = $("#" + srcId),
                    data = DomHelper.getEqualElements($srcDiv, $dstDiv);
                if (!data.length <= 0) return;

                var result = confirm("您确定要替换引入属性配置的" + data.length + "个元素吗？");
                if (!result) return;

                //属性拷贝
                data.forEach(function (item) {
                    var $src = item.key,
                        $dst = item.value,
                        srcId = $src.attr("id"),
                        dstId = $dst.attr("id");
                    new Property().remove(dstId);
                    $dst.attr({
                        id: srcId,
                        name: $src.attr("name")
                    });
                    $src.attr({
                        id: "",
                        name: ""
                    });
                });
                DomHelper.setIds($dstDiv, "&");
            });
            $submenu.append($menuitem);
        });
    };

    //批量设置属性
    this.batchSetAttrs = function () {
        var result = confirm("您确定要设置默认属性吗？");
        if (!result) return;

        var count = 0,
            $nodes = $('#workspace .workspace-node:text,#workspace .workspace-node[data-type="div"] :text');
        $nodes.each(function () {
            var property = GLOBAL_PROPERTY[this.id];
            property["controlType"] = "文本输入框";
            property["fontFamily"] = "宋体";
            property["fontSize"] = "10px";
            property["color"] = "black";
            property["backgroundColor"] = "white";
            count++;
        });
        new Workspace().save(false);
        alert("一共设置了" + count + "个元素的默认属性！");
    };

    //批量设置变量
    this.batchSetVals = function ($elem) {
        var count = 0;
        $elem.find(":input").each(function () {
            if ($(this).val() === "&") return true;

            $(this).val("$" + count);
            count++;
        });
    };

    //批量设置中文名
    this.batchSetNames = function ($elem) {
        var $table = $elem.find("table");
        if ($table.length <= 0) return alert("找不到批量设置中文名的表格！");

        var arrs = [];
        $table.find(":input").each(function () {
            var id = this.id;
            if (!id) return true;

            var $prev = $(this).parents("td").prev(),
                text = $prev.text().trim();
            arrs.push({
                id: id,
                cname: text
            });
        });
        var property = new Property();
        arrs.forEach(function (item) {
            property.setValue(item.id, "cname", item.cname);
        });
        alert("设置成功！");
    };

    //添加控件
    this.addControl = function (type) {
        var control = new Control();
        control.setControl(type, function ($node) {
            var number = control.createNumber(type);
            $node.attr({
                "id": number,
                "name": number
            }).css({
                "left": "5px",
                "top": "5px"
            });
            $("#workspace").append($node);
            new Property().setDefault(number);
        });
    };

    //复制属性
    this.copyAttrs = function (type, $elem) {
        var $table = $elem.parents("table");
        if ($table.length <= 0) return alert("当前控件不支持按行、按列复制功能！");

        var id = $elem.attr("id");
        if (!id) return alert("没有可复制的属性数据！");

        if (type === 1) {
            //按行复制
            $elem.parents("td").nextAll().each(function () {
                var cid = $(this).find(":input").attr("id");
                if (cid) {
                    new Property().copy(id, cid);
                }
            });
        } else if (type === 2) {
            //按列复制
            var index = TableHelper.getTdIndex($elem);
            $elem.parents("tr").nextAll().each(function () {
                var cid = $(this).find("td").eq(index).find(":input").attr("id");
                if (cid) {
                    new Property().copy(id, cid);
                }
            });
        }
    };

    //行编号设置
    this.setLineId = function ($elem) {
        var $table = $elem.parents("table");
        if ($table.length <= 0) return alert("格式错误！");

        var $trs = $table.find("tr"),
            rowIndex = -1;
        $trs.each(function () {
            var $inputs = $(this).find(":input");
            if ($inputs.length > 0) {
                rowIndex++;
            }
            var columnIndex = 0;
            $inputs.each(function () {
                $(this).addClass("focus");
                var strId = NumberHelper.idToName(rowIndex, 2) + NumberHelper.idToName(columnIndex, 2),
                    result = confirm("即将设置的编号为：" + strId + "，确定要设置吗？");
                if (result) {
                    $(this).attr("id", strId);
                    columnIndex++;
                } else {
                    return false;
                }
                $(this).removeClass("focus");
            });
        });
    };

    //选择页面
    this.selectPage = function () {
        var $workspace = $("#workspace");
        $workspace.addClass("focus");
        new Property().load($workspace);
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
                var type = $el.get(0).tagName === 'INPUT' ? 'text' : $(dom).get(0).tagName.toLowerCase(),
                    prefix = type == 'div' ? 'DIV_' : "";
                maxId = maxId ? NumberHelper.idToName(NumberHelper.nameToId(maxId) + 1, 4) : control.createNumber(type);
                type == 'text' && addNewProp($el.attr('id'), maxId);
                type == 'div' ? contextMenu.done(2, $(clone)) : contextMenu.done(3, $(clone));
                $(clone).attr({
                    id: prefix + maxId,
                    name: prefix + maxId,
                }).css('top', parseFloat($el.css('top')) + (($el.height() + 10) * (i + 1)));
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
                            addNewProp($(dom).attr('id'), inputMaxId);
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

        function addNewProp(oldId, newId) {
            GLOBAL_PROPERTY[newId] = GLOBAL_PROPERTY[oldId];
        }
    }
}

ContextMenu.prototype = {
    done: function (type, elem) {
        var that = this;
        switch (type) {
            case 1:
                //空白区域右键菜单
                elem.jcontextmenu({
                    menus: [{
                            type: "menuitem",
                            text: "批量设置属性",
                            handler: function () {
                                that.batchSetAttrs();
                            }
                        },
                        {
                            type: "separator"
                        },
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
                                $('#controlbar .control-item[data-type="div"]').click();
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
                            handler: function () {
                                that.batchSetNames($(this));
                            }
                        },
                        {
                            type: "separator"
                        },
                        {
                            type: "menuitem",
                            text: "引入属性",
                            dynamic: function ($submenu) {
                                that.importProperty($(this), $submenu);
                            }
                        },
                        {
                            type: "menuitem",
                            text: "批量设置变量",
                            handler: function () {
                                that.batchSetVals($(this));
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
                        {
                            type: "separator"
                        },
                        {
                            type: "menuitem",
                            text: "行编号设置",
                            handler: function () {
                                that.setLineId($(this));
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
                        }
                    ]
                });
                break;
        }
    }
};