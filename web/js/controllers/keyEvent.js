function KeyEvent() {
    var that = this;
    this.ruler = true;
    $(document).keydown(function (event) {
        var code = event.keyCode;
        switch (code) {
            case 27:
                that.escEvent()
                break;
            case 38:
                that.moveUpEvent(event)
                break;
            case 40:
                that.moveDownEvent(event)
                break;
            case 37:
                that.moveLeftEvent(event)
                break;
            case 39:
                that.moveRightEvent(event)
            default:
                break;
        }
    })
}
KeyEvent.prototype = {
    $workspace: $("#workspace"),
    //取消选中的元素
    escEvent: function () {
        $("#delete").css('color', 'white')
        var $target = $(event.target);
        if (!$target.is(".workspace-node")) {
            this.$workspace.find(".ui-selected").removeClass("ui-selected");
            new Property().clearDOM();
            this.$workspace.find(".workspace-node").jresizable("destroy");
        }
        $(".jcontextmenu:visible").hide();
    },
    //元素的上移
    moveUpEvent(event) {
        event.preventDefault();
        var $elm = this.$workspace.find(".ui-draggable");
        if ($elm.length < 1) return;
        $elm.each(function () {
            var top = Number($(this).css('top').slice(0, -2));
            $(this).css('top', top - 5 + 'px')
        })
    },
    //元素的下移
    moveDownEvent(event) {
        event.preventDefault();
        var $elm = this.$workspace.find(".ui-draggable");
        if ($elm.length < 1) return;
        $elm.each(function () {
            var top = Number($(this).css('top').slice(0, -2));
            $(this).css('top', top + 5 + 'px')
        })
    },
    //元素的左移
    moveLeftEvent(event) {
        event.preventDefault();
        var $elm = this.$workspace.find(".ui-draggable");
        if ($elm.length < 1) return;
        $elm.each(function () {
            var left = Number($(this).css('left').slice(0, -2));
            $(this).css('left', left - 5 + 'px')
        })
    },
    //元素的右移
    moveRightEvent(event) {
        event.preventDefault();
        var $elm = this.$workspace.find(".ui-draggable");
        if ($elm.length < 1) return;
        $elm.each(function () {
            var left = Number($(this).css('left').slice(0, -2));
            $(this).css('left', left + 5 + 'px')
        })
    },
}