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
        // var that = this,
        //     id = $("#workspace").attr("data-id"),
        //     attrName = $("#workspace").attr("data-name"),
        //     subtype = $("#workspace").attr("data-subtype"),
        //     customId = $("#workspace").attr("data-customId"),
        //     name = "",
        //     basicInfo = {},
        //     data = {};
        // if ($("#submit_model_tab").is(":visible")) {
        //     type = 1
        //     name = $('[name="model_name"]').val();
        //     basicInfo["category"] = $('[name="model_category"]').val();
        //     basicInfo["subCategory"] = $('[name="model_subCategory"]').val();
        //     basicInfo["feature"] = $('[name="model_feature"]').val();
        //     basicInfo["userGrade"] = $('[name="model_userGrade"]').val();
        //     basicInfo["area"] = $('[name="model_area"]').val();
        //     basicInfo["autoCreate"] = $('[name="model_autoCreate"]').val();
        //     //缺少关联表单
        //     basicInfo["contactId"] = ""
        // } else {
        //     type = 0
        //     name = $('[name="template_name"]').val();
        //     basicInfo["category"] = $('[name="template_category"]').val();
        //     basicInfo["subCategory"] = $('[name="template_subCategory"]:checked').val();
        // }
        // var data = new Workspace()._getData(id, attrName, subtype, customId);
        // console.log(data)
        //     params = {
        //         customId: id,
        //         name: name,
        //         basicInfo: basicInfo,
        //         data: data
        //     }
        // // params = JSON.stringify(params)
        // new NewService().add(type, params, function (result) {
        //     console.log(result)
        // })

        // new ResourceService().submit(id, name, data, function (result) {
        //     Common.handleResult(result, function (data) {
        //         if (!data) return;

        //         alert("提交成功！");
        //         that.$modal.modal("hide");
        //         window.location.reload(true);
        //     });
        // });
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
            console.log(id, name, subtype)
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