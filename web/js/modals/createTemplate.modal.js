//新建模板资源模态框
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
            if(!name) return alert("模板资源不能为空");
            var data = {
                name:name,
                type:"模板"
            }
            new ResourceService().add(data, function (result) {
                var  resId = result.result;
                Common.handleResult(result, function () {
                    new Workspace().init(resId, data.name, "资源", "模板", null, null, null);
                    that.$createTemplate.modal("hide")
                })
            })
            new Main().open();
        })
        that.$createTemplate.on("focusout", "#template_resource_name", function () {
            var value = $(this).val();
            if (value && value.indexOf("_") < 0) {
                $(this).val(value + "_模板资源");
            }
        });

    }

}