/**
 * 控件模块
 */
function Control() {
    this.CONTROL_TYPES = {//声明一下控件类型
        text: '<input data-type="text" type="text" value="">',
        button: '<input data-type="button" type="button" value="button">',
        checkbox: '<input data-type="checkbox" type="checkbox" value="">',
        img: '<img data-type="img">',
        div: '<div data-type="div"></div>'
    };
    this.CONTROL_HTML = {//声明一下控件html
        text: '<input data-type="text" type="text">',
        button: '<input data-type="button" type="button">',
        checkbox: '<input data-type="checkbox" type="checkbox">',
        img: '<div data-type="img"></div>',
        div: '<div data-type="div"></div>'
    };
}

Control.prototype = {
    /**
     * 
     * @param {*} type 类型 img div child 默认
     */
    createNumber: function (type) {
        var $workspace = $("#workspace"),//获取工作区
            arrs = [],//申明数组
            prefix = "",//
            $nodes = null;
        switch (type) {//对类型进行判断不同的类型进行赋值
            case "img"://如果是img类型
                prefix = "IMG_";//prefix赋值为IMG_
                $nodes = $workspace.find('.workspace-node[data-type="img"]'); //获取工作区中所有的类型为img的元素
                break;
            case "div"://如果是div类型
                prefix = "DIV_";//prefix赋值为Div_
                $nodes = $workspace.find('.workspace-node[data-type="div"]');//获取工作区所有类型为div的元素
                break;
            case "child"://如果是child类型
                prefix = "";
                $nodes = $workspace
                    .find('.workspace-node:not(.workspace-node[data-type="img"],.workspace-node[data-type="div"]),.workspace-node[data-type="div"] :input');//获取工作区中的所欲类型为img和div和div下面的input元素
                break;
            default://默认类型
                prefix = "";
                $nodes = $workspace.find('.workspace-node:not(.workspace-node[data-type="img"],.workspace-node[data-type="div"]),.workspace-node[data-type="div"] :input');//获取工作区中除了类型为img，div和div下面的input元素的所有元素
                break;
        }
        $nodes.each(function () {//对获取到的元素进行遍历
            var id = $(this).attr("id");//获取该元素的编号id
            if (id) {//如果编号id存在
                arrs.push(id.substring(prefix.length));//像数组中添加除去prefix后面的值
            }
        });
        var max = arrs.max("String");//获取数组最大的编号
        if (!max) return prefix + "AAAA";//如果不存在则给max赋值为AAA
        else return prefix + NumberHelper.idToName(NumberHelper.nameToId(max) + 1, 4);//否则生成最大的元素并赋值
    },
    /**
     * 获取对应类型的代码
     * @param {*} type 
     */
    getControl: function (type) {
        var that = this;
        return $(that.CONTROL_TYPES[type]); //返回对应类型的html
    },
    //设置对应类型的代码
    setControl: function (type, callback) {
        var that = this,
            $node = $(that.CONTROL_TYPES[type]),//s生成对应类型的html
            contextMenu = new ContextMenu();//实例化右键菜单栏
        $node.addClass("workspace-node").css({//给元素添加css属性定位为绝对定位 层级为500
            "position": "absolute",
            "z-index": 500
        });
        switch (type) {//对应不同类型的添加不同的右键菜单栏
            case "img"://当为img类型时添加右键菜单栏与空白时候一样
                contextMenu.done(1, $node);
                break;
            case "div"://当为div类型时添加右键菜单栏为子模块一样
                contextMenu.done(2, $node);
                break;
            default://当没有的时候添加控件元素菜单栏
                contextMenu.done(3, $node);
                break;
        }
        if (callback) {//判断时候有回调函数
            callback.call(this, $node);//把回调函数绑定到this上
        }
    },
    /**
     * 渲染html
     * @param {*} id 
     * @param {*} basic 
     */
    renderHtml: function (id, basic) {
        var that = this,
            $node = $(that.CONTROL_HTML[basic.type]);//生成对应的html
        $node.attr({"id": basic.id, "name": basic.name}).val(basic.value || "");//给生成的元素议案家编号id和name并给他赋值如果有的话
        $node.css({//给对应的元素设置css
            "position": "absolute",//设置绝对定位
            "left": basic.rect.left,//设置left
            "top": basic.rect.top,//设置top
            "width": basic.rect.width,//设置width
            "height": basic.rect.height,//设置height
            "z-index": basic.rect.zIndex//设置层级
        });
        switch (basic.type) {
            case "img"://如果为图片类型
                var src = "/lib/" + id + "/res/" + basic.attach.src, //图片路径
                    img = !basic.attach ? "../public/images/demo.jpg" : (!basic.attach.src ? "../public/images/demo.jpg" : src);//如果没有basic.attach则使用../public/images/demo.jpg否则判断basic.attach是否存在不存在使用默认路径
                $node.css({//给图片设置css样式
                    "background": "url(" + src + ") no-repeat center center",
                    "background-size": "100% 100%"
                });
                break;
            case "div":
                $node.append(basic.attach ? basic.attach.html : "");//判断basic.attach是否存在 存在则直接添加下面的html否则不添加
                break;
            default:
                break;
        }
        return $node.get(0).outerHTML;//返回
    },
    //删除控件
    remove: function () {
        var $selected = $("#workspace").find(".resizable");//获取工作区中选中的元素
        if ($selected.length <= 0) return alert("请选择需要删除的元素");//如果没有获取到选中的元素则退出函数并提示

        var result = confirm("确定删除选中的元素吗？");//提示是否删除选中的元素
        if (!result) return;//取消的话退出函数

        $selected.each(function () {//遍历选中的元素
            var $wsnode = $(this).find(".workspace-node");//获取当前元素下的工作元素
            if ($wsnode.data("type") === "div") {//如果它的类型是div
                $wsnode.find(":input").each(function () {//寻找该元素下面所有的input输入框
                    new Property().remove(this.id);//实例化属性并移除对应的id属性
                });
            } else {
                new Property().remove($wsnode.attr("id"));//实例化属性并移除对应的id属性
            }
        });
        $selected.remove();//选中元素移除
        new Workspace().save(false);//实例化工作区并保存
    },
    //复制控件
    copy: function ($selected) {
        if (!$selected || $selected.length <= 0) return;//如果没有选择控件退出函数

        if ($selected.length > 1) return alert("不支持复制多个控件");//如果选择多个控件退出函数并提示

        var type = $selected.attr("data-type");//获取当前控件的类型
        if (type === "img" || $selected.find(":input").length > 0) return alert("不支持的复制类型！");//如果选择的是img类型或者控件下面没有input输入框退出函数并提示

        var id = $selected.attr("id");//获取选择的元素的编号id
        new Clipboard().setData("controlId", id);//实例化Clipboard并调用setData方法  设置一个data
    },
    paste: function () {
        var that = this,
            id = new Clipboard().getData("controlId");//实例化cliboard并获取controlId对应的值
        if (!id) return;//如果没有退出函数

        var $elem = $("#" + id),//获取对应id的元素
            type = $elem.attr("data-type");//获取对应元素的type类型
        if (!type || type === "img" || $elem.find(":input").length > 0) return;//如果类型不存在或则为img或则下面没有input输入框则退出则这函数

        that.setControl(type, function ($node) {
            var number = that.createNumber(type);//获取对应类型的编号id
            $node.attr({//为对应的元素设置编号id和name
                "id": number,
                "name": number
            }).css({//添加css属性
                "left": "5px",
                "top": ($(window).scrollTop() + 5) + "px"
            });
            if (type === "div") {//如果类型是div
                var name = prompt("输入新控件的内容：", "");//弹窗提示输入
                if (name) {
                    $node.html(name);//插入输入的内容
                }
                new ContextMenu().done(2, $node);//实例化右键菜单栏绑定子模块设计右键菜单栏
            } else {
                new ContextMenu().done(3, $node);//实例化右键菜单栏绑定控件右键菜单栏
            }
            $("#workspace").append($node);//把元素添加到工作区
            new Property().setDefault(number);//实例化property设置一些默认属性
        });
    }
};
