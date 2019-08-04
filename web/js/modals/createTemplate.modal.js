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
            new Workspace().init(null,name,"表单",null,null,null)
            that.$createTemplate.modal("hide")
            new Main().open();
        })
    }
}