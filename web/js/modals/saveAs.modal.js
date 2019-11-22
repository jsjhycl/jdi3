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
                value: `/${id}/`
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
        id = id.replace(/\((.*)\)/img, "");
        var type = $workspace.attr("data-type");
        var table = type == "表单" ? "newResources" : "newProducts";
        that.getLastSaveId(table, id).then(res => {
            var count = res.length;
            that.$saveAsName.val(`${id}(${count})`)
        })
    },
    saveData: function () {
        var that = this;
        var isFinsh = that.$isFinalName.prop("checked");
        var $workspace = $("#workspace"),
            id = $workspace.attr("data-id"),
            type = $workspace.attr("data-type"),
            name = $workspace.attr("data-name"),
            contactId = $workspace.attr("data-contactid"),
            reltemplate = $workspace.attr("data-reltemplate"),
            id = id.replace(/\((.*)\)/img, "");
        if (isFinsh) {
            new Workspace().save(true, `${id}(99)`, null)
        } else {
            var table = type == "表单" ? "newResources" : "newProducts";
            that.getLastSaveId(table, id).then(async res => {
                var count = res.length;
                await new Workspace().save(true, `${id}(${count})`, null)
                new Workspace().load(`${id}(${count})`, name, type, contactId, reltemplate)
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