
//新建表单资源模态框
function CreateTemplate() {
    this.$modal = $("#create_template_modal")
    this.$templateName = $("#template_name")
    this.USER = "admin"
    this.dbCollection = "newResources"
    this._getMaxId = async function (category) {
        var arr = [],
            maxId = "";
        var res = await new Service().query("maxResourceId", [{"col":"type",value:category}], [category]);
        if(res.length<1) return "AA"
        res.forEach(item => {
            var customId = item[category]
            var numberId = NumberHelper.nameToId(customId)
            arr.push(numberId)
        })
        if (arr.length > 0) {
            maxId = arr.max();
        } else {
            maxId = -1
        }
        return NumberHelper.idToName(maxId + 1, 2);
    }
    this.updateMaxId = async function (category,id) {
       var condition = [{"col":"type",value:category}],
            data = [{col:"type",value:category},{col:category,value:id}];
        new Service().update("maxResourceId",condition,data)
    }
}
CreateTemplate.prototype = {
    initData: function () {

    },
    bindEvents: function () {
        var that = this;
        that.$modal.find(".modal-footer .save").click(function(){
            var name = that.$templateName.val(),
                category = $('[name="template_category"]').val(),
                subCategory =$('[name="template_subCategory"]:checked').val();
            if(!name && !category && !subCategory) return alert("表单资源不能为空");
            that._getMaxId(category).then(res=>{
                var id = res,
                params = [
                    {col: "_id", value: category+id},
                    {col: "name", value: name},
                    {col: "customId", value: category+id},
                    {col: "createTime", value:new Date().toFormatString(null, true)},
                    {col: "createor", value:that.USER},
                    {col: "basicInfo", value:{
                        category: category,
                        subCategory: subCategory
                    }},
                    {col: "edit", value:that.USER+","+new Date().toFormatString(null, true)}
                ]
                new Service().insert(that.dbCollection,params).then(res=>{
                    if(res.ok==1&&res.n==1){
                        new Workspace().init( category+id, name, "表单", null, null, that.USER);
                        that.$modal.modal("hide")
                        that.updateMaxId(category,id)
                        $("#workspace").css({"width":"0px","height":"0px"})
                        new Main().open()
                    }
                })

            })
        })
    }
}