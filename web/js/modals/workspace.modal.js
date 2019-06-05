/**
 * 工作区配置
 * @param $modal
 * @constructor
 */
function WorkspaceModal($modal) {
    BaseModal.call(this, $modal, null);
}

WorkspaceModal.prototype = {
    initData: function () {
        var $workspace = $("#workspace");
        $("#width").val($workspace.width());
        $("#height").val($workspace.height());
        $("#bgColor").val($workspace.css("background-color").colorHex());
    },
    saveData: function () {
        var width = $("#width").val(),
            height = $("#height").val(),
            bgColor = $("#bgColor").val();
        if (!width || !height || !bgColor) return;

        $("#workspace").css({
            "width": width,
            "height": height,
            "background-color": bgColor
        });
        new Ruler().drawCoordinates()
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, null);
    }
};