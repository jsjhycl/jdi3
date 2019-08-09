
//新建布局资源模态框
function CreateResource() {
    this.$createResource = $("#create_resource_modal")
    BaseModal.call(this, this.$createResource);
    this.$resoureRelId = this.$createResource.find('[name="model_resource_relId"]')
    this.data = []
    this.USER = "admin"
    this.dbCollection = "newProducts"
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
                    name: `${mitem.name}(${mitem.customId})`,
                    value: mitem.customId
                }
            });
        Common.fillSelect(that.$resoureRelId, defaultOption, options, null, false);
        that.$createResource.find("#model_subCategory").val(value)
    }
    this.queryModal = function (condition) {
        return new Service().queryCount(this.dbCollection,condition)
    },
    this.saveDb =function (params) {
        return new Service().insert(this.dbCollection, params)
    }
    this.clearData = function(){

    }

}
CreateResource.prototype = {
    initData: function () {
        console.log(12)
        var that = this;
        //查询表单中的布局
        that.$createResource.find("#model_spare1").val(0)
        that.$createResource.find("#model_spare2").val(0)
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
                that.$resoureName.val(text.replace(/\((.*)\)/img, ""));
            } else {
                that.$resoureName.val("");
            }
        });
        //保存资源
        that.$createResource.find(".modal-footer .save").click(function () {
            var name = that.$resoureName.val(),
                category = that.$createResource.find('[name="model_category"]').val(),
                subCategory = that.$createResource.find('[name="model_subCategory"]').val(),
                feature = that.$createResource.find('[name="model_feature"]').val(),
                userGrade = that.$createResource.find('[name="model_userGrade"]').val(),
                area = that.$createResource.find('[name="model_area"]').val(),
                autoCreate = that.$createResource.find('[name="model_autoCreate"]').val(),
                spare1 = that.$createResource.find('[name="model_spare1"]').val(),
                spare2 = that.$createResource.find('[name="model_spare2"]').val(),
                contactId = that.$createResource.find('[name="model_resource_relId"]').val();

            if(!name || !category || !subCategory || !feature || !userGrade || !area || !autoCreate || ! spare1 || !spare2 || !contactId)return alert("请填写完整的数据");

            var id = autoCreate + userGrade + feature + category + area + spare1 + spare2 + contactId.replace(/\((.*)\)/img, ""),
                params = [
                    {col: "_id", value: id},
                    {col: "name", value: name},
                    {col: "customId", value: id},
                    {col: "createTime", value: new Date().toFormatString(null, true)},
                    {col: "createor", value: that.USER},
                    {col: "edit", value:that.USER+","+new Date().toFormatString(null, true)},
                    {col: "basicInfo", value:{
                        category: category,
                        subCategory: subCategory,
                        feature: feature,
                        userGrade: userGrade,
                        area: area,
                        autoCreate: autoCreate,
                        spare1: spare1,
                        spare2: spare2,
                        contactId: contactId
                    }}

                ],
                condition = [{col:"customId", value:id}];

                var relTemplate = "";
                that.data.forEach(item=>{
                    if(item.customId==contactId){
                        relTemplate = item
                    }
                })
                that.queryModal(condition).then(res=>{
                    if(res.length > 0) return alert("布局编号已存在");
                    that.saveDb(params).then(res=>{
                        if(res.ok==1&&res.n==1){
                            new Workspace().load( id, name, "布局", contactId , relTemplate, that.USER, true);
                            that.$createResource.modal("hide")
                            new Main().open()
                        }
                    })


                })  
        })
    },
    execute: function() {
        // this.initData()
        this.basicEvents(true, this.initData);
    }
}