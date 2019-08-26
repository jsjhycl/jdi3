/**
 * 提交配置
 * @param $modal
 * @param $submit
 * @constructor
 */
function SubmitModal($modal, $submit) {
    this.$modal = $modal
    this.$modalBody = $modal.find(".modal-body")
    this.$submit = $submit;
    this.data = {};
    this.USER = "admin"

    this.$resourceName = this.$modal.find("#Changetemplate_name") 
    this.$resourceCategory = this.$modal.find("#Changetemplate_category")
    this.$resourceSubcategory = this.$modal.find('[name="Changetemplate_subCategory"]:checked')

    this.$modalName = this.$modal.find("#Changemodel_name")
    this.$modalFeature = this.$modal.find("#Changemodel_feature")
    this.$modalCategory = this.$modal.find("#Changemodel_category")
    this.$modalArea = this.$modal.find("#Changemodel_area")
    this.$modalSubcategory = this.$modal.find("#Changemodel_subCategory")
    this.$modalSpare1 = this.$modal.find("#Changemodel_spare1")
    this.$modalSpare2 =this.$modal.find("#Changemodel_spare2")
    this.$modalUserGrade = this.$modal.find("#Changemodel_userGrade")
    this.$modalAutoCreate = this.$modal.find("#Changemodel_autoCreate")
    this.queryBasicInfo = async function(dbCollection,condition){
        return await new Service().query(dbCollection,condition,["basicInfo"])
    }
    this.getDb = function(dbCollection,condition){
        return new Service().query(dbCollection,condition)
    }
    this.setData = function(data,type){
        if(type == "表单"){
            this.$resourceName.val(this.data.name)
            this.$resourceCategory.val(this.data.basicInfo.category)
            
            var subCategory = this.data.basicInfo.subCategory,
                $subCategory = this.$modal.find(`[name="Changetemplate_subCategory"][value="${subCategory}"]`);
            $subCategory.attr("checked",true)
        }
        if(type == "布局"){
            this.$modalName.val(this.data.name)
            this.$modalFeature.val(this.data.basicInfo.feature)
            this.$modalCategory.val(this.data.basicInfo.category)
            this.$modalArea.val(this.data.basicInfo.area)
            this.$modalSubcategory.val(this.data.basicInfo.subCategory)
            this.$modalSpare1.val(this.data.basicInfo.spare1||0)
            this.$modalSpare2.val(this.data.basicInfo.spare2||0)
            this.$modalUserGrade.val(this.data.basicInfo.userGrade)
            this.$modalAutoCreate.val(this.data.basicInfo.autoCreate)
        }
    }
}

SubmitModal.prototype = {
    initData: async function () {
        var that = this,
            $workspace = $("#workspace"),
            type = $workspace.attr("data-type"),
            id = $workspace.attr('data-id')
            dbCollection= type== "表单" ? "newResources": "newProducts",
            condition=[{col:"customId",value:id}];
        if(type =="表单"){
            that.$modalBody.find('.nav-tabs li:eq(0) a[data-toggle="tab"]').click();
            that.$modalBody.find('.nav-tabs li:eq(1)').css("display","none");
        }else{
            that.$modal.find('.nav-tabs li:eq(0)').css("display","none");
            that.$modal.find('.nav-tabs li:eq(1) a[data-toggle="tab"]').click();
        }
        that.getDb(dbCollection,condition).then(res=>{
            that.data = res[0]
            that.setData(that.data,type)
        })
    },
    saveData: function () {
        // new Workspace().save(true)
    },
    execute: function () {
        var that = this;
    },
    bindEvents: function () {
        var that = this;
        that.$submit.click(function () {
            // var $workspace = $("#workspace"),
            //     id = $workspace.attr("data-id"),
            //     name = $workspace.attr("data-name"),
            //     subtype = $workspace.attr("data-subtype");
            // that.$modal.modal("show");
            // that.$modal.find("#resource_name").text(name);
            // if (subtype === "表单") {
            //     if(id){
            //         that.queryBasicInfo("newResources",[{col:"customId",value:id}]).then(res=>{
            //             if(res.length>0){
            //                 var basicInfo = res[0].basicInfo
            //                 that.$modal.find('[name="template_category"]').val(basicInfo.category)
            //                 that.$modal.find('[name="template_subCategory"]').each(function(){
            //                     if($(this).val()==basicInfo.subCategory){
            //                         $(this).attr("checked","true")
            //                     }
            //                 })
            //             }
            //         })
            //     }
            //     $('[name="template_name"]').val(name);
            //     that.$modal.find('.nav-tabs li:eq(0) a[data-toggle="tab"]').click();
            //     that.$modal.find('.nav-tabs li:eq(1)').css("display","none");

            // } else if (subtype === "布局") {
            //     $('[name="model_name"]').val(name);
            //     if(id){
            //         that.queryBasicInfo("newProducts",[{col:"customId",value:id}]).then(res=>{
            //             if(res.length>0){
            //                 var basicInfo  = res[0].basicInfo;
            //                 that.$modalBody.find("#model_feature").val(basicInfo.feature)
            //                 that.$modalBody.find("#model_category").val(basicInfo.category)
            //                 that.$modalBody.find("#model_area").val(basicInfo.area)
            //                 that.$modalBody.find("#model_subCategory").val(basicInfo.subCategory)
            //                 that.$modalBody.find("#model_userGrade").val(basicInfo.userGrade)
            //                 that.$modalBody.find("#model_autoCreate").val(basicInfo.autoCreate)
            //                 that.$modalBody.find("#model_spare1").val(basicInfo.spare1||"0")
            //                 that.$modalBody.find("#model_spare2").val(basicInfo.spare2||"0")
            //             }
            //         })
            //     }
            //     var relTemplate = Common.parseData($workspace.attr("data-relTemplate") || null);
            //     if (relTemplate) {
            //         $('[name="model_subCategory"]').val(relTemplate.basicInfo.subCategory);
            //     }
            //     that.$modal.find('.nav-tabs li:eq(0)').css("display","none");
            //     that.$modal.find('.nav-tabs li:eq(1) a[data-toggle="tab"]').click();
            // }

        });
        that.$modal.on("show.bs.modal",function(){
            that.initData()
        })
        that.$modal.find(".save").on("click",function(){
            var type = $("#workspace").attr("data-type"),
                oldId = $("#workspace").attr("data-id")
                id = "",
                condition=[],
                data = that.data;
            if(type=="表单"){
                if(!that.$resourceName.val()) return alert("表单名为必填选项")
                id = data.customId.slice(1,data.customId.length);
                condition = [
                    {col:"_id",value:that.$resourceCategory.val()+id},
                    {col: "name", value: that.$resourceName.val()},
                    {col:"customId",value:that.$resourceCategory.val()+id},
                    {col: "createTime", value:data.createTime},
                    {col: "createor", value:data.createor},
                    {col: "basicInfo", value:{
                        category: that.$resourceCategory.val(),
                        subCategory: that.$modal.find('[name="Changetemplate_subCategory"]:checked').val()
                    }},
                    {col: "edit", value:data.edit +";"+ that.USER+","+new Date().toFormatString(null, true)}
                ]
                if(oldId!=that.$resourceCategory.val()+id){
                    new Workspace().save(true,null,that.$resourceCategory.val()+id,condition,that.$resourceName.val())
                }else{
                    var dbCollection = type == "表单" ? "newResources" : "newProducts",
                    name = that.$resourceName.val()
                    condition = [{ col: "customId", value: oldId}],
                    data = [{col:"name",value:name}];
                    var result = new Service().update(dbCollection,condition,data)
                   result.then(res=>{
                      $("#workspace").attr("data-name",name)
                      var text = name+ '<span class="text-danger">' + "(" + oldId + ")" + '</span>';
                      $("#name").empty().append(text);
                      alert("保存成功")
                   })

                }
            }
            if(type=="布局"){
                if(!that.$modalName.val()) return alert("布局名为必填选项");
                var autoCreate = that.$modalAutoCreate.val(),
                    userGrade  = that.$modalUserGrade.val(),
                    feature = that.$modalFeature.val(),
                    category = that.$modalCategory.val(),
                    subCategory = that.$modalSubcategory.val(),
                    area = that.$modalArea.val(),
                    spare1 = that.$modalSpare1.val(),
                    spare2 = that.$modalSpare2.val(),
                    contactId = data.basicInfo.contactId.replace(/\((.*)\)/img, "");
                if(data.customId.length>10){
                    var saveAsNumber = data.customId.slice(10,that.data.customId.length)
                }
                id = autoCreate + userGrade + feature + category + area + spare1 + spare2 + contactId + (saveAsNumber?saveAsNumber:"");
                condition = [
                    {col: "_id", value: id},
                    {col: "name", value: that.$modalName.val()},
                    {col: "customId", value: id},
                    {col: "createor", value: data.createor},
                    {col: "createTime", value: data.createTime},
                    {col: "edit", value: data.edit + ";" + that.USER+","+new Date().toFormatString(null, true)},
                    {col: "basicInfo", value:{
                        category: category,
                        subCategory: subCategory,
                        feature: feature,
                        userGrade: userGrade,
                        area: area,
                        autoCreate: autoCreate,
                        spare1: spare1,
                        spare2: spare2,
                        contactId: data.basicInfo.contactId
                    }}
                ]
                if(oldId != id){
                    new Workspace().save(true,null,id,condition,that.$modalName.val())
                }else{
                    var dbCollection = type == "表单" ? "newResources" : "newProducts",
                    name = that.$modalName.val(),
                    condition = [{ col: "customId", value: oldId}],
                    data = [{col:"name",value:name}];
                    var result = new Service().update(dbCollection,condition,data)
                   result.then(res=>{
                      $("#workspace").attr("data-name",name)
                      var text = name+ '<span class="text-danger">' + "(" + oldId + ")" + '</span>';
                      $("#name").empty().append(text);
                      alert("保存成功")
                   })
                }
            }
            that.$modal.modal("hide")
        })
    }
};