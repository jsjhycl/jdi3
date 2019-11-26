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
        var that = this,
            id = $("#workspace").attr("data-id");
        // console.log(id)
        new Service().query("newProducts", [{
            col: 'basicInfo.subCategory',
            value: "基本"
        },{
            col: "customId",
            value:id

        }], ["customId", "name", "status", "lastEditTime", "basicInfo.subCategory"]).then(data => {
            if (!Array.isArray(data)) return;
            var html = "";
            data.sort(function (a, b) {
                return Date.parse(b.lastEditTime) - Date.parse(a.lastEditTime);
            })
            data.forEach(item => {
                if (item.status != -1) {
                    html += `<tr data-id="${item.customId}">
                    <td>${item.name}</td>
                    <td style="color:${item.status==10?"black":"red"}">${item.status == "10"?"已发布":"未发布"}</td>
                    <td class="text-center"><a class="btn btn-default btn-sm publish">发布</a><a class="${item.status == 10 ? "" : "disabled"} btn btn-primary btn-sm cancel">取消发布</a></td>
                </tr>`
                }
                // <a class="btn btn-danger btn-sm remove">删除</a>
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
        that.$modal.on("click", ".modal-body .table .publish", function (event) {
            event.stopPropagation();
            that.$modal.hide().modal('hide');
            var $this = $(this);
            renderQrModal({
                action: 'sign/auth',
                title: "扫码验证权限发布",
                data: new Date().valueOf()
            }, function() {
                var id = $this.parents("tr").attr("data-id"),
                    condition = [{
                        col: "customId",
                        value: id
                    }],
                    save = [{
                        col: "status",
                        value: "10"
                    }];
                new Service().query("newProducts", condition, ["version"]).then(res => {
                    var version = 1;
                    if (!res[0]['version']) {
                        
                        save.push({col: "version.info", value: [1]})
                        save.push({col: "version.isActive", value: 1 })
                        var version = 1;
                    } else {
                        var info = res[0]['version']['info'];
                        if(info.length > 0){
                            version =  Number(info[info.length - 1]) + 1
                        }
                        var versionArr = info;
                        versionArr.push(version)
                        save.push({col: "version.info", value:versionArr})
                        save.push({col: "version.isActive", value:version})
                    }
                    new Workspace().save(false)
                    new Workspace().save(false, undefined, undefined, undefined, undefined, version)
                    new Service().update("newProducts", condition, save).then(result => {
                        result.n === 1 && result.ok === 1 ? alert('发布成功') : alert('发布失败')
                        new Service().publish(id)
                        that.$modal.modal("hide");
                    })
                })
            })

        });
        //删除布局
        // that.$modal.on("click", ".modal-body .table .remove", function () {
        //     var id = $(this).parents("tr").attr("data-id"),
        //         condition = [{
        //             col: "customId",
        //             value: id
        //         }],
        //         save = [{
        //             col: "status",
        //             value: "-1"
        //         }];
        //     new Service().update("newProducts", condition, save).then(result => {
        //         result.n === 1 && result.ok === 1 ? alert('删除成功') : alert('删除失败')
        //         that.$modal.modal("hide");
        //     })
        // });

        // 取消发布 
        that.$modal.on("click", ".modal-body .table .cancel", function () {
            var id = $(this).parents("tr").attr("data-id"),
                condition = [{
                    col: "customId",
                    value: id
                }],
                save = [{
                    col: "status",
                    value: "0"
                }];
            new Service().update("newProducts", condition, save).then(result => {
                result.n === 1 && result.ok === 1 ? alert('取消发布成功！') : alert('取消发布失败！')
                that.$modal.modal("hide");
            })
        });
        

    }
};