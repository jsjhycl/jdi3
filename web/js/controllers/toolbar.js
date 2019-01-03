function toolbar() {
    $("#toolbar [data-type]").click(function (event) {
        var $workspace = $("#workspace"),
            width = $workspace.outerWidth(),
            height = $workspace.outerHeight(),
            $selected = $workspace.find(".resizable"),
            type = $(this).data("type");
        switch (type) {
            case "align-left":
                var $first = $selected.first();
                $selected.each(function () {
                    if ($(this).position().left <= $first.position().left) {
                        $first = $(this);
                    }
                });
                $selected.not($first).css({
                    "left": $first.position().left,
                    "right": "auto"
                });
                break;
            case "align-center":
                var $first = $selected.first(),
                    median = $first.position().left + $first.outerWidth() / 2;
                $selected.not($first).each(function () {
                    var left = median - $(this).outerWidth() / 2;
                    $(this).css({
                        "left": left,
                        "right": "auto"
                    });
                });
                break;
            case "align-right":
                var $first = $selected.first();
                $selected.each(function () {
                    if ($(this).position().left >= $first.position().left) {
                        $first = $(this);
                    }
                });
                $selected.not($first).each(function () {
                    var left = $first.position().left + $first.outerWidth() - $(this).outerWidth();
                    $(this).css({
                        "left": left,
                        "right": "auto"
                    });
                });
                break;
            case "align-top":
                var $first = $selected.first();
                $selected.each(function () {
                    if ($(this).position().top <= $first.position().top) {
                        $first = $(this);
                    }
                });
                $selected.not($first).css({
                    "top": $first.position().top,
                    "bottom": "auto"
                });
                break;
            case "align-middle":
                var $first = $selected.first(),
                    median = $first.position().top + $first.outerHeight() / 2;
                $selected.not($first).each(function () {
                    var top = median - $(this).outerHeight() / 2;
                    $(this).css({
                        "top": top,
                        "bottom": "auto"
                    });
                });
                break;
            case "align-bottom":
                var $first = $selected.first();
                $selected.each(function () {
                    if ($(this).position().top >= $first.position().top) {
                        $first = $(this);
                    }
                });
                $selected.not($first).each(function () {
                    var top = $first.position().top + $first.outerHeight() - $(this).outerHeight();
                    $(this).css({
                        "top": top,
                        "bottom": "auto"
                    });
                });
                break;
            case "equal-width":
                if ($selected.length <= 1) {
                    return;
                }
                $selected.css({"width": "100px"});
                break;
            case "equal-height":
                if ($selected.length <= 1) {
                    return;
                }
                $selected.css({"height": "100px"});
                break;
            case "equal-all":
                if ($selected.length <= 1) {
                    return;
                }
                $selected.css({"width": "100px", "height": "100px"});
                break;
            case "horizon-space":
                if ($selected.length < 3) {
                    return;
                }
                var elems_width = 0,
                    $first = $selected.first(),
                    $last = $selected.last();
                $selected.each(function () {
                    if ($(this).position().left <= $first.position().left) {
                        $first = $(this);
                    }
                    if ($(this).position().left >= $last.position().left) {
                        $last = $(this);
                    }
                    elems_width += $(this).outerWidth();
                });
                if ($first.get(0) === $last.get(0)) {
                    return;
                }
                var range_width = $last.position().left + $last.outerWidth() - $first.position().left,
                    total_width = range_width - elems_width,
                    space = total_width / ($selected.length - 1),
                    position = $first.position().left + $first.outerWidth();
                $selected.each(function () {
                    if (this !== $first.get(0) && this !== $last.get(0)) {
                        $(this).css({"left": position + space});
                        position += space + $(this).outerWidth();
                    }
                });
                break;
            case "vertical-space":
                if ($selected.length < 3) {
                    return;
                }
                var elems_height = 0,
                    $first = $selected.first(),
                    $last = $selected.last();
                $selected.each(function () {
                    if ($(this).position().top <= $first.position().top) {
                        $first = $(this);
                    }
                    if ($(this).position().top >= $last.position().top) {
                        $last = $(this);
                    }
                    elems_height += $(this).outerHeight();
                });
                if ($first.get(0) === $last.get(0)) {
                    return;
                }
                var range_height = $last.position().top + $last.outerHeight() - $first.position().top,
                    total_height = range_height - elems_height,
                    space = total_height / ($selected.length - 1),
                    position = $first.position().top + $first.outerHeight();
                $selected.each(function () {
                    if (this !== $first.get(0) && this !== $last.get(0)) {
                        $(this).css({"top": position + space});
                        position += space + $(this).outerHeight();
                    }
                });
                break;
            case "put-top":
                $selected.css("z-index", 501);
                $selected.find(".workspace-node").css("z-index", 500);
                break;
            case "put-bottom":
                $selected.css("z-index", 499);
                $selected.find(".workspace-node").css("z-index", 499);
                break;
            case "left":
                $selected.css({"left": 0, "right": "auto"});
                break;
            case "center":
                $selected.each(function () {
                    var left = width / 2 - $(this).outerWidth() / 2;
                    $(this).css({"left": left, "right": "auto"});
                });
                break;
            case "right":
                $selected.css({"left": "auto", "right": 0});
                break;
            case "top":
                $selected.css({"top": 0, "bottom": "auto"});
                break;
            case "middle":
                $selected.each(function () {
                    var top = height / 2 - $(this).outerHeight() / 2,
                        left = width / 2 - $(this).outerWidth() / 2;
                    $(this).css({
                        "top": top,
                        "bottom": "auto",
                        "left": left,
                        "right": "auto"
                    });
                });
                break;
            case "bottom":
                $selected.css({"top": "auto", "bottom": 0});
                break;
            
            case "functionInsert":
                //插入函数
                    WorkspaceUtil.insertFns($(this), true);
                    new InsertFnModal($("#insertFunctionModal")).open($(this));
                break;
            case "functionView":
                    let $this = $(event.currentTarget);
                    WorkspaceUtil.checkFn($this);
                break;
        }
    });
}