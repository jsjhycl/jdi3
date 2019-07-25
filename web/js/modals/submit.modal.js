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
        var that = this,
            id = $("#workspace").attr("data-id"),
            name = "",
            data = {};
        if ($("#submit_model_tab").is(":visible")) {
            name = $('[name="model_name"]').val();
            data["category"] = $('[name="model_category"]').val();
            data["subCategory"] = $('[name="model_subCategory"]').val();
            data["feature"] = $('[name="model_feature"]').val();
            data["userGrade"] = $('[name="model_userGrade"]').val();
            data["area"] = $('[name="model_area"]').val();

        } else {
            name = $('[name="template_name"]').val();
            data["category"] = $('[name="template_category"]').val();
            data["subCategory"] = $('[name="template_subCategory"]:checked').val();
        }
        new ResourceService().submit(id, name, data, function (result) {
            Common.handleResult(result, function (data) {
                if (!data) return;

                alert("提交成功！");
                that.$modal.modal("hide");
                window.location.reload(true);
            });
        });
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
                type = $workspace.attr("data-type"),
                subtype = $workspace.attr("data-subtype");
            if (!id) return alert("无法提交没有编号的数据！");

            new Workspace().save(false);
            switch (type) {
                case "资源":
                    that.$modal.modal("show");
                    that.$modal.find("#resource_name").text(name);
                    if (subtype === "模板") {
                        $('[name="template_name"]').val(name.replace("_模板资源", "_模板产品"));
                        that.$modal.find('.nav-tabs li:eq(0) a[data-toggle="tab"]').click();
                    } else if (subtype === "模型") {
                        $('[name="model_name"]').val(name.replace("_模型资源", ""));
                        var relTemplate = Common.parseData($workspace.attr("data-relTemplate") || null);
                        if (relTemplate) {
                            $('[name="model_subCategory"]').val(relTemplate.basicInfo.subCategory);
                        }
                        that.$modal.find('.nav-tabs li:eq(1) a[data-toggle="tab"]').click();
                    }
                    break;
                case "产品":
                    new ProductService().submit(id, function (result) {
                        Common.handleResult(result, function () {
                            alert("提交成功！");
                            window.location.reload(true);
                        });
                    });
                    break;
                case "数据库定义":
                    new ProductService().submitDB(id, function (result) {
                        Common.handleResult(result, function (data) {
                            if (!data) return;

                            alert("提交成功！");
                            window.location.reload(true);
                        });
                    });
                    break;
            }
        });
    }
};