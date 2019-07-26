//新建表单资源模态框
function CreateTemplate() {
    this.$createTemplate = $("#create_template_modal")
    this.$templateName = $("#template_resource_name")
}
CreateTemplate.prototype = {
    initData: function () {

    },
    bindEvents: function () {
        var that = this;
        that.$createTemplate.find(".modal-footer .save").click(function(){
            var name = that.$templateName.val();
            if(!name) return alert("表单资源不能为空");
            var data = {
                name:name,
                type:"表单"
            }
            new ResourceService().add(data, function (result) {
                var  resId = result.result;
                Common.handleResult(result, function () {
                    new Workspace().init(resId, data.name, "资源", "表单", null, null, null);
                    that.$createTemplate.modal("hide")
                })
            })
            new Main().open();
        })
        that.$createTemplate.on("focusout", "#template_resource_name", function () {
            var value = $(this).val();
            if (value && value.indexOf("_") < 0) {
                $(this).val(value);
            }
        });

    }

}