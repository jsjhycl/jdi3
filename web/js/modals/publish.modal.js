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
        var param = {type:1,isAll:true}
        // new Service().query("newProducts",[{"col":"status",value:""}],["customId","name","status"]).then(data=>{
        //     con
        // })
        new NewService().getProducts(function(data){
            if(!Array.isArray(data))return;
                var html = '';
                data.forEach(function(item){
                    html+=`<tr data-id="${item.customId}">
                        <td>${item.name}</td>
                        <td>${item.status === 10?"已发布":"未发布"}</td>
                        <td class="text-center"><a class="btn btn-default btn-sm">发布</a></td>
                    </tr>`
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
        that.$modal.on("click", ".modal-body .table .btn", function () {
            var id = $(this).parents("tr").attr("data-id");
            new NewService().publish(id,function(result){
                result.n === 1 && result.ok === 1 ? alert('发布成功') : alert('发布失败')
                that.$modal.modal("hide");
            })
        });
    }
};