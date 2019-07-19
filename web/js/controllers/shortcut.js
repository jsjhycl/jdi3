function shortcut() {
    $(document).keydown(function (event) { //全局键盘绑定事件
        var control = new Control(); //实例化control对象
        //删除
        if (event.keyCode === 46) { //如果按下del按键
            control.remove(); //调用control的remove方法
        }
        //复制
        if (event.ctrlKey && event.keyCode === 67) { //如果按下ctrl和c按键
            if (event.target === document.body) { //如果条件成立
                control.copy($("#workspace").find(".resizable-node")); //调用control下面的copy方法
            }
        }
        //粘贴
        if (event.ctrlKey && event.keyCode === 86) { //如果按下ctrl+v按键
            if (event.target === document.body) { //如果条件成立
                control.paste(); //调用control下面的paste方法
            }
        }
    });
}