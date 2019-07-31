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
        // new ProductService().list("布局", 40, function (result) {
        //     Common.handleResult(result, function (data) {
        //         if (!Array.isArray(data)) return;

        //         var html = "";
        //         for (var i = 0; i < data.length; i++) {
        //             var item = data[i];
        //             html += '<tr data-id="' + item.id + '">' +
        //                 '<td>' + item.name + '</td>' +
        //                 '<td class="text-center"><a class="btn btn-default btn-sm">发布</a></td>' +
        //                 '</tr>';
        //         }
        //         that.$modalBody.find(".table").empty().append(html);
        //     });
        // });
        var param = {type:1,isAll:true}
        new NewService().list(param,function(result){
            Common.handleResult(result,function(data){
                var data=data.data
                if(!Array.isArray(data))return;
                var html = '';
                data.forEach(function(item){
                    html+=`<tr data-id="${item.customId}">
                        <td>${item.name}</td>
                        <td>${item.status==1?"未发布":"已发布"}${item.status}</td>
                        <td class="text-center"><a class="btn btn-default btn-sm">发布</a></td>
                    </tr>`
                })
                console.log(html)
                that.$modalBody.find(".table tbody").empty().append(html)
            })
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
            console.log(id)
            new NewService().publish(id,function(result){
                console.log(result)
                Common.handleResult(result,function(data){
                  if(data){
                      alert("发布成功")
                    //   window.location.reload(true)
                    }
               })
            })
            // new ProductService().publish(id, function (result) {
            //     Common.handleResult(result, function () {
            //         alert("发布成功！");
            //         that.$modal.modal("hide");
            //     });
            // });
        });
    }
};