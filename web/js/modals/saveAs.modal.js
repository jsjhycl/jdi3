/**
 * 另存为
 */
function SaveAsModal($modal) {
    BaseModal.call(this, $modal, null)
    this.$saveAsName = this.$modalBody.find('[data-key="name"]');
    this.$lastName = this.$modalBody.find('[data-key="lastName"]');
    this.$isFinalName = this.$modalBody.find('[data-key="isFinalName"]');
    this.$workspace = $("#workspce");

    this._clearData = function () {
        this.$saveAsName.val();
        this.$lastName.val();
        this.$isFinalName.attr("checked", false);
    }
    this.getLastSaveId = async function (table, id) {
        var condition = [{
                col: "customId",
                value: id
            }],
            fields = ["customId"]
        return await new Service().query(table, condition, fields)
    }

}
SaveAsModal.prototype = {
    initData: function () {
        var that = this;
        that._clearData();
        var $workspace = $("#workspace"),
            id = $workspace.attr("data-id");
        if (!id) return alert("保存才可以另存")
        var id = id.replace(/\((.*)\)/img, "");
        var subtype = $workspace.attr("data-subtype");
        var table = subtype == "表单" ? "newResources" : "newProducts";
        that.getLastSaveId(table, id).then(res => {
            var count = res.length;
            that.$saveAsName.val(`${id}(${count})`)
        })
    },
    saveData: function () {
        var that = this;
        isFinsh = that.$isFinalName.prop("checked");
        if (isFinsh) {
            new Workspace().save(true, false, isFinsh)
        } else {
            var $workspace = $("#workspace"),
                id = $workspace.attr("data-id"),
                subtype = $workspace.attr("data-subtype"),
                id = id.replace(/\((.*)\)/img, "");
            var table = subtype == "表单" ? "newResources" : "newProducts";
            that.getLastSaveId(table, id).then(res => {
                var count = res.length;
                new Workspace().save(true, `${id}(${count})`)
            });
        }
    },

    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, null)
    },
    bindEvents: function () {
        var that = this;
        that.$isFinalName.on("click", function () {
            var flag = that.$isFinalName.prop("checked"),
                $workspace = $("#workspace"),
                id = $workspace.attr("data-id")
            subtype = $workspace.attr("data-subtype"); //获取工作区data-id\
            id = id.replace(/\((.*)\)/img, "");
            var table = subtype == "表单" ? "newResources" : "newProducts";
            that.getLastSaveId(table, id).then(res => {
                var count = res.length;
                if (flag) {
                    count = 99;
                }
                that.$saveAsName.val(`${id}(${count})`)                
            })
        })
    }
}