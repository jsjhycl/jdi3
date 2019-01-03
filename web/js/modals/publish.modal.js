/**
 * 发布配置
 * @param $modal
 * @constructor
 */
function PublishModal($modal) {
    BaseModal.call(this, $modal, null);
}

PublishModal.prototype = {
    initData: function () {
        var that = this;
        new ProductService().list("模型", 40, function (result) {
            Common.handleResult(result, function (data) {
                if (!Array.isArray(data)) return;

                var html = "";
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    html += '<tr data-id="' + item.id + '">' +
                        '<td>' + item.name + '</td>' +
                        '<td class="text-center"><a class="btn btn-default btn-sm">发布</a></td>' +
                        '</tr>';
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
        that.$modal.on("click", ".modal-body .table .btn", function () {
            var id = $(this).parents("tr").attr("data-id");
            new ProductService().publish(id, function (result) {
                Common.handleResult(result, function () {
                    alert("发布成功！");
                    that.$modal.modal("hide");
                });
            });
        });
    }
};