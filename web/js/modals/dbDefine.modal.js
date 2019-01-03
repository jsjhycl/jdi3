/**
 * 数据库定义配置
 * @param $modal
 * @constructor
 */
function DbDefineModal($modal) {
    BaseModal.call(this, $modal, null);
}

DbDefineModal.prototype = {
    initData: function () {
        var that = this;
        new ProductService().list("模型", 20, function (result) {
            Common.handleResult(result, function (data) {
                if (!Array.isArray(data)) return;

                var html = "";
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    html += '<tr data-id="' + item.id + '" data-customId="' + item.basicInfo.customId + '">' +
                        '<td><a>' + item.name + '</a></td>' +
                        '<td class="text-center">' + item.type + '</td></tr>';
                }
                that.$modalBody.find(".table").empty().append(html);
            });
        });
    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, null, null);
    },
    bindEvents: function () {
        var that = this;
        that.$modal.on("click", ".modal-body .table a", function () {
            var $tr = $(this).parents("tr"),
                id = $tr.data("id"),
                name = $(this).text(),
                customId = $tr.attr("data-customId");
            that.$modal.modal("hide");
            new Workspace().load(id, name, "数据库定义", "模型", "定义", customId, null);
            new Main().open();
        });
    }
};