
//新建布局资源模态框
function CreateResource() {
    this.$createResource = $("#create_resource_modal")
    BaseModal.call(this, this.$createResource);
    this.$resoureRelId = this.$createResource.find('[name="model_resource_relId"]')
    this.data = []
    this.$resoureName = this.$createResource.find('[name="model_resource_name"]')
    this._fillRelId = function () {
        var that = this,
            value = that.$createResource.find('[name="model_resource_subCategory"]:checked').val(),
            defaultOption = {
                name: "请选择关联表单",
                value: ""
            },
            options = that.data.filter(function (fitem) {
                return value === fitem.basicInfo.subCategory;
            }).map(function (mitem) {
                return {
                    name: mitem.name,
                    value: mitem.customId
                }
            });
        Common.fillSelect(that.$resoureRelId, defaultOption, options, null, false);
    }
}
CreateResource.prototype = {
    initData: function () {
        var that = this;

        //查询表单中的布局
        var dbCollection = "newResources";
        new Service().query(dbCollection,null,null).then(res=>{
            if(!Array.isArray(res)) return;
            that.data = res;
            that._fillRelId()
        })
       
    },
    bindEvents: function () {
        var that = this;
        //切换资源分类
        that.$createResource.on("click", '[name="model_resource_subCategory"]', function () {
            that._fillRelId();
        })
        //选择关联表单事件
        that.$createResource.on("change", '[name="model_resource_relId"]', function () {
            var value = $(this).val();
            if (value) {
                var text = $(this).find("option:selected").text();
                that.$resoureName.val(text);
            } else {
                that.$resoureName.val("");
            }
        });
        //保存资源
        that.$createResource.find(".modal-footer .save").click(function () {
            var name = that.$resoureName.val();
            if (!name) return alert("布局名称不能为空！");
            var relid = that.$resoureRelId.val();
            if (!relid) return alert("关联表单不可以为空！");
            var data = {
                relid: relid,
                name: name,
                type: "布局"
            };
            var subCategory = "";
            that.data.forEach(function(item){
                if(item.customId==relid){
                    subCategory = item;
                }
            })
            new Workspace().load(null, name, "布局", relid, subCategory)
            that.$createResource.modal("hide");
            new Main().open();
        })
    },
    execute: function() {
        this.basicEvents(true, this.initData);
    }
}