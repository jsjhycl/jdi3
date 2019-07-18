//新建模型资源模态框
function CreateResource() {
    this.$createResource = $("#create_resource_modal")
    this.$resoureRelId = this.$createResource.find('[name="model_resource_relId"]')
    this.data = []
    this.$resoureName = this.$createResource.find('[name="model_resource_name"]')
    this._fillRelId = function () {
        var that = this,
            value = that.$createResource.find('[name="model_resource_subCategory"]:checked').val(),
            defaultOption = {
                name: "请选择关联模板",
                value: ""
            },
            options = that.data.filter(function (fitem) {
                return value === fitem.basicInfo.subCategory;
            }).map(function (mitem) {
                return {
                    name: mitem.name,
                    value: mitem.id
                }
            });
        Common.fillSelect(that.$resoureRelId, defaultOption, options, null, false);
    }
}
CreateResource.prototype = {
    initData: function () {
        var that = this;
        new ProductService().list("模板", 20, function (result) {
            Common.handleResult(result, function (data) {
                if (!Array.isArray(data)) return;
                that.data = data.slice(0);
                that._fillRelId();
            });
        });
    },
    bindEvents: function () {
        var that = this;
        //切换资源分类
        that.$createResource.on("click", '[name="model_resource_subCategory"]', function () {
            that._fillRelId();
        })
        //选择关联模板事件
        that.$createResource.on("change", '[name="model_resource_relId"]', function () {
            var value = $(this).val();
            if (value) {
                var text = $(this).find("option:selected").text();
                that.$resoureName.val(text.replace("模板产品", "模型资源"));
            } else {
                that.$resoureName.val("");
            }
        });
        //保存资源
        that.$createResource.find(".modal-footer .save").click(function () {
            var name = that.$resoureName.val();
            if (!name) return alert("模型资源名称不能为空！");
            var relid = that.$resoureRelId.val();
            if (!relid) return alert("关联模板不可以为空！");
            var data = {
                relid: relid,
                name: name,
                type: "模型"
            };
            new ResourceService().add(data, function (result) {
                var resId = result.result;
                Common.handleResult(result, function () {
                    new ProductService().detail(data.relid, function (presult) {
                        Common.handleResult(presult, function (pdata) {
                            if (pdata) {
                                new Workspace().load(resId, data.name, "资源", "模型", null, null, pdata)
                            }
                        })
                    })
                    that.$createResource.modal("hide");
                })
            })
            new Main().open();
        })
    }
}