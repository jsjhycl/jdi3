/** 
 * 右键菜单模块
*/
function ContextMenu() {
    //引入属性用于处理各个子模块之间的引用
    this.importProperty = function ($elem, $submenu) {
        var dstId = $elem.attr("id"),//
            $dstDiv = $elem;//当前点击的子模块
        $('#workspace .workspace-node[data-type="div"]').not("#" + dstId).each(function () {//获取工作区中元素(data-type="div")的元素排除自身
            var $menuitem = $('<div class="menuitem"><a>' + this.id + '</a></div>');//生成引入属性的控件栏
            $menuitem.click(function () {//给每个引入属性添加事件
                var srcId = $(this).find("a").text(),//获取点击的元素id
                    $srcDiv = $("#" + srcId),//获取该元素
                    data = DomHelper.getEqualElements($srcDiv, $dstDiv);//获取等值元素返回一个数组
                if (!data.length <= 0) return; //??这个地方可能是bug具体要看

                var result = confirm("您确定要替换引入属性配置的" + data.length + "个元素吗？");//弹窗时候确认替换引入属性配置的元素
                if (!result) return;

                //属性拷贝
                data.forEach(function (item) {//这段代码不会执行data到这里
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
            $submenu.append($menuitem);//把生成的html插入进去
        });
    };

    //批量设置属性 (空白区域有击)
    this.batchSetAttrs = function () {
        var result = confirm("您确定要设置默认属性吗？"); //弹窗是否确认批量设置属性
        if (!result) return;//如果取消直接跳出函数

        var count = 0,
            $nodes = $('#workspace .workspace-node:text,#workspace .workspace-node[data-type="div"] :text');//获取所有工作区中的输入框的值
        $nodes.each(function () {//对获取的元素遍历这是基本属性
            var property = GLOBAL_PROPERTY[this.id];//获取全局变量
            property["controlType"] = "文本输入框";//控件类型设置为文本输入框
            property["fontFamily"] = "宋体";//字体设置成宋体
            property["fontSize"] = "10px";//尺寸设置为10px   兼容性问题最小只用12px
            property["color"] = "black";//颜色设置成黑色
            property["backgroundColor"] = "white";//背景色设置成白色
            count++;
        });
        new Workspace().save(false);
        alert("一共设置了" + count + "个元素的默认属性！");//提示一共设置了几个元素的属性
    };

    /**
     * 批量设置变量
     * $elem 那个子模块
     */
    this.batchSetVals = function ($elem) {
        var count = 0;//声明变量并赋值为0
        $elem.find(":input").each(function () {//在子模块中寻找所有的输入框并遍历
            if ($(this).val() === "&") return true;//如果输入框中的文本值为&则直接跳出程序

            $(this).val("$" + count);//设置对应元素的文本值
            count++;//变量自增
        });
    };

    /**
     * 批量设置中文名
     * $elm为对应的子模块
     */
    this.batchSetNames = function ($elem) {
        var $table = $elem.find("table");//在对应的子模块中寻找table
        if ($table.length <= 0) return alert("找不到批量设置中文名的表格！");//如果找不到table则退出函数并提示

        var arrs = [];//声明一个空的数组
        $table.find(":input").each(function () {//在对应的table中寻找所有的数据
            var id = this.id;//获取当前元素的编号
            if (!id) return true;//如果编号不存在则退出

            var $prev = $(this).parents("td").prev(),//获取对应元素的td
                text = $prev.text().trim();//获取td的元素的内容并除去前后空格(这个地方一直获取为空)
            arrs.push({id: id, cname: text});//把对象添加到数组中
        });
        var property = new Property();//实例化属性栏的实例
        arrs.forEach(function (item) {//遍历数组
            property.setValue(item.id, "cname", item.cname);//遍历数组设置元素的中文名
        });
        alert("设置成功！");//提示弹出成功
    };

    /**
     * 添加控件
     * type为控件类型目前支持的checkbox复选框和text文本输入框
     */
    this.addControl = function (type) {
        var control = new Control();//实例化控件
        control.setControl(type, function ($node) {//调用control下面的setcontrol方法生成控件
            var number = control.createNumber(type);//调用control.createNumber方法生成编号
            $node.attr({//给该元素设置id和表单名属性
                "id": number,
                "name": number
            }).css({//设置生成的css让他距离工作区上右各5px
                "left": "5px",
                "top": "5px"
            });
            $("#workspace").append($node);//把这个元素添加到工作区中
            new Property().setDefault(number);//实例化属性控件并调用setDefault方法设置元素的默认的属性
        });
    };

    /**
     * 复制属性 控件右击
     * type 类型 1表示按行复制属性 2表示按列
     */
    this.copyAttrs = function (type, $elem) {
        var $table = $elem.parents("table");//获取该元素的父元素看是否是表格中的控件
        if ($table.length <= 0) return alert("当前控件不支持按行、按列复制功能！");//如果不是表格中的控件则提示

        var id = $elem.attr("id");//获取当前控件的编号
        if (!id) return alert("没有可复制的属性数据！");//如果获取不到控件的编号则退出函数并提示

        if (type === 1) {//按行复制
            $elem.parents("td").nextAll().each(function () {//遍历但钱控件的的父集中的所有td
                var cid = $(this).find(":input").attr("id");//获取遍历的当前控件的编号(id)
                if (cid) {//如果当前的控件的编号存在
                    new Property().copy(id, cid);//实例化属性并调用copy方法
                }
            });
        } else if (type === 2) {//按列复制
            var index = TableHelper.getTdIndex($elem);//调用tableHelper下面的getTdindex(获取行的index)
            $elem.parents("tr").nextAll().each(function () {//获取所有的列并遍历
                var cid = $(this).find("td").eq(index).find(":input").attr("id");//获取遍历的当前列对应的的对应行的输入框的id
                if (cid) {//如果当前控件的编号存在
                    new Property().copy(id, cid);//实例化属性并调用copy方法
                }
            });
        }
    };

    /**
     * 行编号设置 
     */
    this.setLineId = function ($elem) {
        var $table = $elem.parents("table");//获取该元素的父集并复制
        if ($table.length <= 0) return alert("格式错误！");//如果不是表格中的元素则退出程序并提示

        var $trs = $table.find("tr"),//获取table中所有的行
            rowIndex = -1;//行编号
        $trs.each(function () {
            var $inputs = $(this).find(":input");//获取该行中的所有输入框
            if ($inputs.length > 0) {//如果能够获取到输入框
                rowIndex++;//行编号自增
            }
            var columnIndex = 0;//列表编号
            $inputs.each(function () {//获取所有的行编号并遍历
                $(this).addClass("focus");//给当前的输入框添加类名
                var strId = NumberHelper.idToName(rowIndex, 2) + NumberHelper.idToName(columnIndex, 2),//生成编号AA(表示列)AA(表示行)
                    result = confirm("即将设置的编号为：" + strId + "，确定要设置吗？");//确认弹窗问是否确认修改
                if (result) {//如果确认修改
                    $(this).attr("id", strId);//给该输入框编号从新设置
                    columnIndex++;// 列编号自增
                }
                $(this).removeClass("focus");//移除当前元素的focus类名
            });
        });
    };

    /**
     * 选择页面
     */
    this.selectPage = function () {
        var $workspace = $("#workspace");//获取工作区
        $workspace.addClass("focus");//工作区添加foucs类名
        new Property().load($workspace);//属性重新加载worksapce
    }

    /**
     * 复制当前行
     * $el 当前元素
     * num复制多少行
     */
    this.copyLine = function($el, num) {
        var $parent = $el.parents('tr'),//获取当前元素的父集
            clone,
            $target = $parent.length <= 0 ? $el : $parent.eq(0),//目标元素当父集的长度小于零的时候目标元素为当前元素，否则父集元素的第一个子元素
            control = new Control(),//实例化控件栏
            contextMenu = new ContextMenu(),//实例化右键菜单栏
            maxId,//最大ID
            arr = [];
        // while(num > 0) {
        for (var i = 0; i < num; i ++) {
            clone = $target.clone();//目前行的克隆
            if ($parent.length <= 0) {//如果它的父集元素没有
                var type = $el.get(0).tagName === 'INPUT' ? 'text' : $(dom).get(0).tagName.toLowerCase(),//通过过去标签的标签名如果是input则类型为text 否则为标签名
                    prefix = type == 'div' ? 'DIV_' : "";//如果type为div则把 DIV_ 赋值给prefix否则为空
                maxId = maxId ? NumberHelper.idToName(NumberHelper.nameToId(maxId) + 1, 4) : control.createNumber(type);//判断最大的id是否存在如果存在则吧最大的id+1再生成一个idnam否则直接生成一个
                type == 'text' && addNewProp($el.attr('id'), maxId);//如果type是text则
                type == 'div' ? contextMenu.done(2, $(clone)) : contextMenu.done(3, $(clone));//如果type为div则调用子模块设计器里面的右键菜单栏否则调用控件元素的右键菜单栏
                $(clone).attr({//给当前的元素添加id和name属性
                    id: prefix + maxId,
                    name: prefix + maxId,
                }).css('top', parseFloat($el.css('top')) + (($el.height() + 10) * (i + 1)));//给元素设置距离顶部的距离
            } else {
                $(clone).find('div, input, button, checkbox').each(function(idx, dom) {
                    var type = $(dom).get(0).tagName === 'INPUT' ? 'text' : $(dom).get(0).tagName.toLowerCase(),//通过过去标签的标签名如果是input则类型为text 否则为标签名
                        prefix = type == 'div' ? 'DIV_' : "";//如果type为div则把 DIV_ 赋值给prefix否则为空
                    maxId = maxId ? NumberHelper.idToName(NumberHelper.nameToId(maxId) + 1, 4) : control.createNumber(type);//如果maxid存在生成一个maxid否则创建一个
                    type == 'text' && addNewProp($(dom).attr('id'), maxId);//在全局属性中添加一个新的全局
                    type == 'div' ? contextMenu.done(2, $(dom)) : contextMenu.done(3, $(dom));//如果type为div则调用子模块设计器里面的右键菜单栏否则调用控件元素的右键菜单栏
                    $(dom).attr({//给这个dom添加id和name属性
                        id: prefix + maxId,
                        name: prefix + maxId,
                    });
                });
            }
            arr.push(clone[0]);//吧所有的元素添加到数据中
        }
        //对数组进行反转
        arr.reverse().map(function(i) {
            $target.after(i);
        })
        /**
         * 
         * @param {*} oldId 旧的编号
         * @param {*} newId 新的编号
         */
        function addNewProp(oldId, newId) {
            var newObj = JSON.parse(JSON.stringify(GLOBAL_PROPERTY[oldId])); //通过就的编号获取将要复制的属性
            GLOBAL_PROPERTY[newId] = newObj;//把新的属性添加到全局属性中
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
                elem.jcontextmenu({//通过jcontextmenu设置属性栏
                    menus: [
                        {
                            type: "menuitem",
                            text: "批量设置属性",
                            handler: function () {
                                that.batchSetAttrs();//调用批量设置属性
                            }
                        },
                        {type: "separator"},//分割线
                        {
                            type: "menuitem",
                            text: "添加图片",
                            handler: function () {
                                $('#controlbar .control-item[data-type="img"]').click();
                            }
                        },
                        {type: "separator"},
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
                        {type: "separator"},
                        {
                            type: "menuitem",
                            text: "添加子模块设计器",
                            handler: function () {
                                $('#controlbar .control-item[data-type="div"]').click();
                            }
                        },
                        {type: "separator"},
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
                    menus: [
                        {
                            type: "menuitem",
                            text: "批量设置中文名",
                            handler: function () {
                                that.batchSetNames($(this));
                            }
                        },
                        {type: "separator"},
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
                        {type: "separator"},
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
                    menus: [
                        {
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
                        {type: "separator"},
                        {
                            type: "menuitem",
                            text: "复制属性",
                            submenus: [
                                {
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
                        {type: "separator"},
                        {
                            type: "menuitem",
                            text: "行编号设置",
                            handler: function () {
                                that.setLineId($(this));
                            }
                        },
                        {type: "separator"},
                        {
                            type: "menuitem",
                            text: "选择页面",
                            handler: function () {
                                that.selectPage();
                            }
                        },
                        {type: "separator"},
                        {
                            type: "menuitem",
                            text: "新增当前行",
                            handler: function () {
                                var $el = $(this);
                                    
                                new PromptModal('新增行数', function(val) {
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