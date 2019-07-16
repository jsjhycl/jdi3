/**
 * 工具栏模块
 */
function toolbar() {
    $("#toolbar [data-type]").click(function (event) { //给工具栏绑定事件
        // 设置禁用不能使用
        if ($(this).data("disable"))
            return;
        var $workspace = $("#workspace"), //获取工作区的
            width = $workspace.outerWidth(), //获取工作区的宽
            height = $workspace.outerHeight(), //获取工作区的高
            $selected = $workspace.find(".resizable"), //获取工作区中选中的元素
            type = $(this).data("type"), //获取点击的类型
            $target = $(event.currentTarget); //获取当前点击元素
            distance = parseInt($selected.css('border-left-width')) + parseInt($selected.css('border-right-width'));
        switch (type) {
            case "align-left": //左对齐
                var $first = $selected.first(); //获取选中的第一个元素
                $selected.each(function () { //选中的元素遍历
                    if ($(this).position().left <= $first.position().left) { //如果当前元素的left小于等于第一个元素的left
                        $first = $(this); //把当前元素替换成$first
                    }
                });
                $selected.not($first).css({ //获取排除$first元素之外的元素
                    "left": $first.position().left, //设置left值
                    "right": "auto" //设置right值
                });
                break;
            case "align-center": //居中对齐
                var $first = $selected.first(), //获取选中的第一个元素
                    median = $first.position().left + $first.outerWidth() / 2; //获取仙子的left+选中元素的宽度的1/2
                $selected.not($first).each(function () { //遍历排除$first元素之外的元素
                    var left = median - $(this).outerWidth() / 2; //获取其余的元素的，宽度
                    $(this).css({
                        "left": left, //设置left
                        "right": "auto" //设置right
                    });
                });
                break;
            case "align-right": //右对齐
                var $first = $selected.first(); //获取选中的第一个元素
                $selected.each(function () { //选中的元素遍历
                    if ($(this).position().left >= $first.position().left) { //如果当前元素的left大于等于第一个元素的left
                        $first = $(this); //把当前元素替换成$first
                    }
                });
                $selected.not($first).each(function () { //获取排除$first元素之外的元素
                    var left = $first.position().left + $first.outerWidth() - $(this).outerWidth(); //得到eft值
                    $(this).css({
                        "left": left, //设置left值
                        "right": "auto" //设置right值
                    });
                });
                break;
            case "align-top": //顶端对齐
                var $first = $selected.first(); //获取选中的第一个元素
                $selected.each(function () { //选中的元素遍历
                    if ($(this).position().top <= $first.position().top) { //如果当前元素的left小于等于第一个元素的top
                        $first = $(this); //把当前元素替换成$first
                    }
                });
                $selected.not($first).css({ //排除第一元素设置css样式
                    "top": $first.position().top,
                    "bottom": "auto"
                });
                break;
            case "align-middle": //中间对齐
                var $first = $selected.first(), //获取选中的第一个元素
                    median = $first.position().top + $first.outerHeight() / 2; //获取第一个元素的top值加上他的高度的1/2
                $selected.not($first).each(function () { //排除第一个元素遍历
                    var top = median - $(this).outerHeight() / 2; //获取top值
                    $(this).css({ //设置css属性
                        "top": top,
                        "bottom": "auto"
                    });
                });
                break;
            case "align-bottom": //低端对齐
                var $first = $selected.first(); //获取选中的第一个元素
                $selected.each(function () { //选中元素的遍历
                    if ($(this).position().top >= $first.position().top) { //如果当前元素的top值大于第一个元素的top值
                        $first = $(this);
                    }
                });
                $selected.not($first).each(function () { //排除第一个元素
                    var top = $first.position().top + $first.outerHeight() - $(this).outerHeight(); //获取第一个元素的top加上他的高度-减上最小的高度
                    $(this).css({ //设置css
                        "top": top,
                        "bottom": "auto"
                    });
                });
                break;
            case "equal-width": //相同宽度
                if ($selected.length <= 1) { //如果没有选择到元素退出程序
                    return;
                }
                var $last_selected = $("#" + LAST_SELECTED_ID).parents('.resizable');
                $selected.css({"width": $last_selected.length > 0 ? $last_selected.width() + distance : "100px"});
                // $selected.css({"width": "100px"});//统一设置样式为100px
                break;
            case "equal-height": //相同高度
                if ($selected.length <= 1) { //如果没有选择到元素退出程序
                    return;
                }
                var $last_selected = $("#" + LAST_SELECTED_ID).parents('.resizable');
                $selected.css({"height": $last_selected.length > 0 ? $last_selected.height()  + distance : "100px"});
                // $selected.css({"height": "100px"});//设置统一高度100px
                break;
            case "equal-all": //相同宽高
                if ($selected.length <= 1) { //如果没有选择到元素退出函数
                    return;
                }
                var $last_selected = $("#" + LAST_SELECTED_ID).parents('.resizable');
                $selected.css({"width": $last_selected.length > 0 ? $last_selected.width() + distance : "100px", "height": $last_selected.length > 0 ? $last_selected.height() + distance : "100px"});
                // $selected.css({"width": "100px", "height": "100px"});//设置高度100px宽度100px
                break;
            case "horizon-space": //水平间距
                if ($selected.length < 3) { //如果选择到的元素小于3个退出程序
                    return;
                }
                var elems_width = 0,
                    $first = $selected.first(), //获取第一个元素的
                    $last = $selected.last(); //获取最后一个元素
                $selected.each(function () { //遍历元素
                    if ($(this).position().left <= $first.position().left) { //如果当前元素的left值小于等于第一个元素 把当前元素赋值给$first
                        $first = $(this);
                    }
                    if ($(this).position().left >= $last.position().left) { //如果当前元素的left大于等于最后一个元素的left 把当前元素赋值给$last
                        $last = $(this);
                    }
                    elems_width += $(this).outerWidth(); //获取它们的外部宽度累加
                });
                if ($first.get(0) === $last.get(0)) { //如果$first和$last相等退出函数
                    return;
                }
                var range_width = $last.position().left + $last.outerWidth() - $first.position().left, //平均宽度等于最后一个元素的laft值+加上最后一个元素的外边距减去第一个元素的left值
                    total_width = range_width - elems_width, //单个宽度等于总的宽度减去元素的外部宽度总和
                    space = total_width / ($selected.length - 1), //间距
                    position = $first.position().left + $first.outerWidth(); //第一个元素的left值加上第一个元素的外边距
                $selected.each(function () { //遍历
                    if (this !== $first.get(0) && this !== $last.get(0)) { //排除一个元素和最后一个元素
                        $(this).css({
                            "left": position + space
                        }); //设置css
                        position += space + $(this).outerWidth();
                    }
                });
                break;
            case "vertical-space": //垂直间距
                if ($selected.length < 3) { //如果选择的元素小于三个退出函数
                    return;
                }
                var elems_height = 0,
                    $first = $selected.first(), //获取第一个元素
                    $last = $selected.last(); //获取最后一个元素
                $selected.each(function () { //遍历
                    if ($(this).position().top <= $first.position().top) { //当前元素的top值小于等于第一个元素的top值把当前元素赋值第一个元素
                        $first = $(this);
                    }
                    if ($(this).position().top >= $last.position().top) { //当前元素的top值大于等于第一个元素的top值吧当前元素赋值给最后一个元素
                        $last = $(this);
                    }
                    elems_height += $(this).outerHeight(); //累加上所有元素的外边距
                });
                if ($first.get(0) === $last.get(0)) { //如果第一个元素个最后一个元素相等退出函数
                    return;
                }
                var range_height = $last.position().top + $last.outerHeight() - $first.position().top, //整体高度等于最后一个元素的top加上最后一个元素的外边距减除最第一个元素的top值
                    total_height = range_height - elems_height, //整体元素的高度等于整体高度减除元素外边距整体高度
                    space = total_height / ($selected.length - 1),
                    position = $first.position().top + $first.outerHeight();
                $selected.each(function () {
                    if (this !== $first.get(0) && this !== $last.get(0)) { //排除最后一个元素和第一个元素
                        $(this).css({
                            "top": position + space
                        }); //设置它们的top值
                        position += space + $(this).outerHeight();
                    }
                });
                break;
            case "put-top": //置顶
                $selected.css("z-index", 501); //选择元素的层级设置为501
                $selected.find(".workspace-node").css("z-index", 500); //其余层级设计500
                break;
            case "put-bottom": //置底
                $selected.css("z-index", 499); //选中元素层级设置499
                $selected.find(".workspace-node").css("z-index", 499); //选中元素下面元素设置499
                break;
            case "left": //移动到左边
                $selected.css({
                    "left": 0,
                    "right": "auto"
                }); //设置样式
                break;
            case "center": //移动到中间
                $selected.each(function () {
                    var left = width / 2 - $(this).outerWidth() / 2; //工作区宽度除2-这个元素的外边距
                    $(this).css({
                        "left": left,
                        "right": "auto"
                    }); //设置样式
                });
                break;
            case "right": //移动到右边
                $selected.css({
                    "left": "auto",
                    "right": 0
                }); //设置样式
                break;
            case "top": //移动到顶端
                $selected.css({
                    "top": 0,
                    "bottom": "auto"
                }); //设置样式
                break;
            case "middle": //移动到中部
                $selected.each(function () {
                    var top = height / 2 - $(this).outerHeight() / 2, //工作区高度除2
                        left = width / 2 - $(this).outerWidth() / 2; //工作区宽度除2
                    $(this).css({ //设置样式
                        "top": top,
                        "bottom": "auto",
                        "left": left,
                        "right": "auto"
                    });
                });
                break;
            case "bottom": //移动到底部
                $selected.css({
                    "top": "auto",
                    "bottom": 0
                }); //设置样式
                break;

            case "functionInsert": //插入函数
                if ($('input.focus').length <= 0) { // 判断有没有选中元素
                    alert('无选中元素！')
                } else {
                    if ($target.hasClass('is_using')) { //判断是否有类名is_using
                        WorkspaceUtil.resetView(true); //调用workspace方法
                    } else {
                        WorkspaceUtil.resetView(true); //调用workspace方法
                        $target.addClass('is_using'); //添加类名
                        WorkspaceUtil.insertFns($(this), true); //调用workspace方法
                        new InsertFnModal($("#insertFunctionModal")).open($(this)); //调用workspace方法
                    }
                }

                break;
            case "functionView": //查看函数配置

                if ($target.hasClass('is_using')) { //判断是否有类名is_using
                    WorkspaceUtil.resetView(true); //调用workspace方法
                    // $target.removeClass('is_using');
                } else {
                    WorkspaceUtil.resetView(true); //调用workspace方法
                    WorkspaceUtil.checkFn($target); //调用workspace方法
                    $target.addClass('is_using'); //添加类名
                }
                break;
        }
    });
}

/* 状态栏的按钮禁用 */
function disableToolbarBtn() {
    $("#buttonbar button[data-state]").css({
        "background-color": "#ccc",
        "cursor": "not-allowed"
    }).data("disable", "true");
}

/* 状态栏的按钮取消禁用 */
function ableToolBarBtn() {
    //移动至
    $("#buttonbar button[data-state='3']").css({
        "background-color": "white",
        "cursor": "pointer"
    }).removeData("disable");
    if ($("#workspace").find(".resizable").length >= 2) {
        $("#buttonbar button[data-state='2']").css({
            "background-color": "white",
            "cursor": "pointer"
        }).removeData("disable");
    }
    if ($("#workspace").find(".focus").length > 0) {
        $("#buttonbar button[data-state='1']").css({
            "background-color": "white",
            "cursor": "pointer"
        }).removeData("disable");
    }
}