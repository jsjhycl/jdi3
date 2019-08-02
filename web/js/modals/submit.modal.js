/**
 * 提交配置
 * @param $modal
 * @param $submit
 * @constructor
 */
function SubmitModal($modal, $submit) {
    BaseModal.call(this, $modal, null);

    this.$submit = $submit;
}

SubmitModal.prototype = {
    saveData: function () {
        new Workspace().save(true)
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, null, that.saveData, null);
    },
    bindEvents: function () {
        var that = this;
        that.$submit.click(function () {
            var $workspace = $("#workspace"),
                id = $workspace.attr("data-id"),
                name = $workspace.attr("data-name"),
                subtype = $workspace.attr("data-subtype");
            // if (subtype=="表单" || !id) return alert("无法提交没有编号的数据！");

            // new Workspace().save(false);
            that.$modal.modal("show");
            that.$modal.find("#resource_name").text(name);
            if (subtype === "表单") {
                $('[name="template_name"]').val(name);
                that.$modal.find('.nav-tabs li:eq(0) a[data-toggle="tab"]').click();
            } else if (subtype === "布局") {
                $('[name="model_name"]').val(name);
                var relTemplate = Common.parseData($workspace.attr("data-relTemplate") || null);
                if (relTemplate) {
                    $('[name="model_subCategory"]').val(relTemplate.basicInfo.subCategory);
                }
                that.$modal.find('.nav-tabs li:eq(1) a[data-toggle="tab"]').click();
            }
            // switch (type) {
            //     case "资源":
            //         that.$modal.modal("show");
            //         that.$modal.find("#resource_name").text(name);
            //         if (subtype === "表单") {
            //             $('[name="template_name"]').val(name.replace("_表单资源", "_表单产品"));
            //             that.$modal.find('.nav-tabs li:eq(0) a[data-toggle="tab"]').click();
            //         } else if (subtype === "布局") {
            //             $('[name="model_name"]').val(name.replace("_布局资源", ""));
            //             var relTemplate = Common.parseData($workspace.attr("data-relTemplate") || null);
            //             if (relTemplate) {
            //                 $('[name="model_subCategory"]').val(relTemplate.basicInfo.subCategory);
            //             }
            //             that.$modal.find('.nav-tabs li:eq(1) a[data-toggle="tab"]').click();
            //         }
            //         break;
            //     case "产品":
            //         new ProductService().submit(id, function (result) {
            //             Common.handleResult(result, function () {
            //                 alert("提交成功！");
            //                 window.location.reload(true);
            //             });
            //         });
            //         break;
            //     case "数据库定义":
            //         new ProductService().submitDB(id, function (result) {
            //             Common.handleResult(result, function (data) {
            //                 if (!data) return;

            //                 alert("提交成功！");
            //                 window.location.reload(true);
            //             });
            //         });
            //         break;
            // }
        });
    }
};