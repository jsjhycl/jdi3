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
        new Workspace().save(false)
        new Service().query("newProducts", null, ["customId", "name", "status"]).then(data => {
            if (!Array.isArray(data)) return;
            var html = "";
            data.forEach(item=>{
                if(item.status != -1){
                    html += `<tr data-id="${item.customId}">
                    <td>${item.name}</td>
                    <td>${item.status == "10"?"已发布":"未发布"}</td>
                    <td class="text-center"><a class="btn btn-default btn-sm publish">发布</a> <a class="btn btn-danger btn-sm remove">删除</a></td>
                </tr>`
                }
            })
            that.$modalBody.find(".table tbody").empty().append(html)
        })
    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, null, null);
    },
    bindEvents: function () {
        var that = this;
        //发布布局
        that.$modal.on("click", ".modal-body .table .publish", function () {
            var id = $(this).parents("tr").attr("data-id"),
                condition = [{col:"customId",value:id}],
                save = [{col:"status",value:"10"}];
            new Service().update("newProducts",condition,save).then(result=>{
                result.n === 1 && result.ok === 1 ? alert('发布成功') : alert('发布失败')
                that.$modal.modal("hide");
            })
        });
        //删除布局
        that.$modal.on("click", ".modal-body .table .remove", function(){
            var id = $(this).parents("tr").attr("data-id"),
            condition = [{col:"customId",value:id}],
            save = [{col:"status",value:"-1"}];
            new Service().update("newProducts",condition,save).then(result=>{
                result.n === 1 && result.ok === 1 ? alert('删除成功') : alert('删除失败')
                that.$modal.modal("hide");
            })
        })

    }
};