function Main() {
    this.$main = $(".main");//获取类名为main的元素
}

Main.prototype = {
    open: function () {
        this.$main.show();//显示main元素
        new Property().clearDOM();//实例化property调用clearDom
    },
    close: function () {
        this.$main.hide();//隐藏main元素
        new Property().clearDOM();//实例化property调用clearDom
    }
};