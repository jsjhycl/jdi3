/**
 * 键盘事件模块
 */
function KeyEvent() {
    var that = this;
    this.ruler = true;
    $(document).keydown(function (event) { //给整个文档绑定键盘事件
        if ($('input:focus, textarea:focus').length <= 0) {
            var code = event.keyCode; //获取点击键盘的keyCode
            switch (code) {
                case 27: //如果按下的是esc
                    that.escEvent() //执行取消事件
                    break;
                case 38: //按下键盘上键
                    that.moveUpEvent(event) //执行向上移动事件
                    break;
                case 40: //按下键盘的下键
                    that.moveDownEvent(event) //执行向下移动事件
                    break;
                case 37: //按下键盘的左键
                    that.moveLeftEvent(event) //执行向左移动事件
                    break;
                case 39: //按下键盘的右键
                    that.moveRightEvent(event) //执行向右移动事件
                default:
                    break;
            }
        }
    })
}
KeyEvent.prototype = {
    $workspace: $("#workspace"), //获取工作区的
    //取消选中的元素
    escEvent: function () {
        $("#delete").css('color', 'white') //给删除按钮的字体颜色修改为白色
        var $target = $(event.target);
        if (!$target.is(".workspace-node")) { //如果选中的元素没有worksapce-node类名
            this.$workspace.find(".ui-selected").removeClass("ui-selected"); //找出工作区中所有的选中元素移除uiselected元素
            new Property().clearDOM(); //实例化property调用clearDom方法
            this.$workspace.find(".workspace-node").jresizable("destroy"); //调用jresizable方法传入destroy
        }
        $(".jcontextmenu:visible").hide(); //类名为jcontextmenu的元素隐藏
        WorkspaceUtil.resetView(true)
    },
    //元素的上移
    moveUpEvent(event) {
        var $elm = this.$workspace.find(".ui-draggable"); //获取工作区中所有
        if ($elm.length < 1) return; //如果没有选中的元素退出程序
        event.preventDefault(); //阻止键盘的默认事件

        if (event.shiftKey) {
            $elm.each(function () {
                var height = Number($(this).css('height').slice(0, -2));
                $(this).css('height', height + 1 + 'px').css('border', "none")
            })
        } else {
            $elm.each(function () { //遍历所有选中的元素
                var top = Number($(this).css('top').slice(0, -2)); //获取它们top值
                $(this).css('top', top - 1 + 'px').css('border', "none") //当前元素的top值+5px
            })
        }
    },
    //元素的下移
    moveDownEvent(event) {
        var $elm = this.$workspace.find(".ui-draggable"); //获取工作区中所有
        if ($elm.length < 1) return; //如果没有选中的元素退出程序
        event.preventDefault(); //阻止键盘的默认事件
        if (event.shiftKey) {
            $elm.each(function () {
                var height = Number($(this).css('height').slice(0, -2));
                $(this).css('height', height - 1 + 'px').css('border', "none")
            })
        } else {
            $elm.each(function () { //遍历所有选中的元素
                var top = Number($(this).css('top').slice(0, -2)); //获取它们top值
                $(this).css('top', top + 1 + 'px').css('border', "none") //当前元素的top值-5px
            })
        }
    },
    //元素的左移
    moveLeftEvent(event) {
        var $elm = this.$workspace.find(".ui-draggable"); //获取工作区中所有
        if ($elm.length < 1) return; //如果没有选中的元素退出程序
        event.preventDefault(); //阻止键盘的默认事件
        if (event.shiftKey) {
            $elm.each(function () {
                var width = Number($(this).css("width").slice(0, -2));
                $(this).css("width", width - 1 + "px").css('border', 'none')
            })
        } else {
            $elm.each(function () { //遍历所有选中的元素
                var left = Number($(this).css('left').slice(0, -2)); //获取它们left值
                $(this).css('left', left - 1 + 'px').css('border', "none") //当前元素的top值+5px
            })
        }
    },
    //元素的右移
    moveRightEvent(event) {
        var $elm = this.$workspace.find(".ui-draggable"); //获取工作区中所有
        if ($elm.length < 1) return; //如果没有选中的元素退出程序
        event.preventDefault(); //阻止键盘的默认事件
        if (event.shiftKey) {
            $elm.each(function () {
                var width = Number($(this).css("width").slice(0, -2));
                $(this).css("width", width + 1 + "px").css('border', 'none')
            })
        } else {
            $elm.each(function () { //遍历所有选中的元素
                var left = Number($(this).css('left').slice(0, -2)); //获取它们left值
                $(this).css('left', left + 1 + 'px').css('border', "none") //当前元素的top值-5px
            })
        }
    },
}