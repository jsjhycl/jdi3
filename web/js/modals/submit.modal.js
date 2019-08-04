/**
 * 提交配置
 * @param $modal
 * @param $submit
 * @constructor
 */
function SubmitModal($modal, $submit) {
    BaseModal.call(this, $modal, null);
    this.$modalBody = this.$modal.find(".modal-body")

    this.$submit = $submit;
    this.queryBasicInfo = async function(dbCollection,condition){
        return await new Service().query(dbCollection,condition,["basicInfo"])
    }
}

SubmitModal.prototype = {
    initData: async function () {
        var that = this;
        res = await new FileService().readFile('./profiles/dBTableConfig.json')
        if (!DataType.isObject(res)) return;
        var $templateDbName = that.$modalBody.find('#template_db'), //表单
            $templateTableName = that.$modalBody.find('#template_table'),
            $modelDbName = that.$modalBody.find("#model_db"),
            $modelTableName = that.$modalBody.find("#model_table");
        var templateDbOptions = [],
            templateTableOptions = [],
            modelDbOptions = [],
            modelTableOptions = [];
        Object.keys(res).forEach(item => {
            templateDbOptions.push({name: item,value: item})
            modelDbOptions.push({name: item,value: item})
        })
        Common.fillSelect($templateDbName, null, templateDbOptions, templateDbOptions[0].value)
        Common.fillSelect($modelDbName, null, modelDbOptions, modelDbOptions[0].value)
        
        if (DataType.isObject(res[Object.keys(res)[0]])) {
            templateTableOptions = Object.keys(res[Object.keys(res)[0]]).filter(i => res[Object.keys(res)[0]][i].key === 0)
            templateTableOptions = templateTableOptions.map(i => { return { value: i, name: i } })

            modelTableOptions = Object.keys(res[Object.keys(res)[0]]).filter(i => res[Object.keys(res)[0]][i].key === 1)
            modelTableOptions = modelTableOptions.map(i => { return { value: i, name: i } })
        }
        Common.fillSelect($templateTableName, null, templateTableOptions, templateTableOptions[0].value)
        Common.fillSelect($modelTableName, null, modelTableOptions, modelTableOptions[0].value)
    },
    saveData: function () {
        new Workspace().save(true)
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, null);
    },
    bindEvents: function () {
        var that = this;
        that.$submit.click(function () {
            var $workspace = $("#workspace"),
                id = $workspace.attr("data-id"),
                name = $workspace.attr("data-name"),
                subtype = $workspace.attr("data-subtype");
            that.$modal.modal("show");
            that.$modal.find("#resource_name").text(name);
            if (subtype === "表单") {
                if(id){
                    that.queryBasicInfo("newResources",[{col:"customId",value:id}]).then(res=>{
                        if(res.length>0){
                            var basicInfo = res[0].basicInfo
                            that.$modal.find('[name="template_category"]').val(basicInfo.category)
                            that.$modal.find('[name="template_subCategory"]').each(function(){
                                if($(this).val()==basicInfo.subCategory){
                                    $(this).attr("selected")
                                }
                            })
                        }
                    })
                }
                $('[name="template_name"]').val(name);
                that.$modal.find('.nav-tabs li:eq(0) a[data-toggle="tab"]').click();
                that.$modal.find('.nav-tabs li:eq(1)').css("display","none");

            } else if (subtype === "布局") {
                $('[name="model_name"]').val(name);
                if(id){
                    that.queryBasicInfo("newProducts",[{col:"customId",value:id}]).then(res=>{
                        if(res.length>0){
                            var basicInfo  = res[0].basicInfo;
                            that.$modalBody.find("#model_feature").val(basicInfo.feature)
                            that.$modalBody.find("#model_category").val(basicInfo.category)
                            that.$modalBody.find("#model_area").val(basicInfo.area)
                            that.$modalBody.find("#model_subCategory").val(basicInfo.subCategory)
                            that.$modalBody.find("#model_userGrade").val(basicInfo.userGrade)
                            that.$modalBody.find("#model_autoCreate").val(basicInfo.autoCreate)
                            
                        }
                    })
                }
                var relTemplate = Common.parseData($workspace.attr("data-relTemplate") || null);
                if (relTemplate) {
                    $('[name="model_subCategory"]').val(relTemplate.basicInfo.subCategory);
                }
                that.$modal.find('.nav-tabs li:eq(0)').css("display","none");
                that.$modal.find('.nav-tabs li:eq(1) a[data-toggle="tab"]').click();
            }

        });
    }
};