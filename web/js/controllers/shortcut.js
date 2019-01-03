function shortcut() {
    $(document).keydown(function (event) {
        var control = new Control();
        //删除
        if (event.keyCode === 46) {
            control.remove();
        }
        //复制
        if (event.ctrlKey && event.keyCode === 67) {
            if (event.target === document.body) {
                control.copy($("#workspace").find(".resizable-node"));
            }
        }
        //粘贴
        if (event.ctrlKey && event.keyCode === 86) {
            if (event.target === document.body) {
                control.paste();
            }
        }
    });
}
