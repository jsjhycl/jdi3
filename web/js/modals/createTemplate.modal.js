
//新建表单资源模态框
function CreateTemplate() {
    this.$modal = $("#create_template_modal")
    this.$templateName = $("#template_name")
    this.USER = "admin"
    this.dbCollection = "newResources"
    this._getMaxId = async function () {
        var arr = [],
            maxId = "";
        var res = await new Service().query(this.dbCollection, null, ["customId"]);
        res.forEach(item => {
            var numberId = NumberHelper.nameToId(item.customId.replace(/\((.*)\)/img, ""))
            arr.push(numberId)
        })
        if (arr.length > 0) {
            maxId = arr.max();
        } else {
            maxId = -1
        }
        return NumberHelper.idToName(maxId + 1, 3);
    }
    this._saveDb = async function (type, params) {
        var dbCollection = type == "布局" ? "newProducts" : "newResources";
        return await new Service().insert(dbCollection, params)
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
            console.log(name)
            that._getMaxId().then(res=>{
                var id = res,
                params = [
                    {col: "_id", value: id},
                    {col: "name", value: name},
                    {col: "customId", value: id},
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
                        new Workspace().init( id, name, "表单", null, null, that.USER);
                        that.$modal.modal("hide")
                        new Main().open()
                    }
                })

            })
        })
    }
}