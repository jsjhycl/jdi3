function Main() {
    this.$main = $(".main");
}

Main.prototype = {
    open: function () {
        this.$main.show();
        new Property().clearDOM();
    },
    close: function () {
        this.$main.hide();
        new Property().clearDOM();
    }
};