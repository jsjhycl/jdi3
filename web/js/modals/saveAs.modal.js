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
        var queryId = id.slice(0, 8) //获取已经存在的编号 前八位可能有问题
        var condition = [{
                col: "customId",
                value: `/${queryId}/`
            }],
            fields = ["customId"]
        var queryData = await new Service().query(table, condition, fields),
            data = [],
            result = [];
        queryData.forEach(item => {
            data.push(item.customId.replace(/\((.*)\)/img, ""))
        });
        data.forEach(item => {
            if (item.slice(9, 10) == id.slice(9, 10)) {
                result.push(item)
            }
        })
        return result;
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
            var count = res.length,
                dataid = NumberHelper.idToName(count - 1, 1),
                newid = id.slice(0, 8) + dataid + id.slice(9, 10);


            that.$saveAsName.val(`${newid}`)
        })
    },
    saveData: async function () {
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
            var newid = id.slice(0, 8) + "Z" + id.slice(9, 10);
            await new Workspace().save(true, `${newid}`, null)
            new Workspace().load(`${newid}`, name, type, contactId, reltemplate)

        } else {
            var table = type == "表单" ? "newResources" : "newProducts";
            that.getLastSaveId(table, id).then(async res => {
                var count = res.length,
                    dataid = NumberHelper.idToName(count - 1, 1),
                    newid = id.slice(0, 8) + dataid + id.slice(9, 10);
                await new Workspace().save(true, `${newid}`, null)
                new Workspace().load(`${newid}`, name, type, contactId, reltemplate)
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
                id = $workspace.attr("data-id"),
                subtype = $workspace.attr("data-subtype"), //获取工作区data-id\
                id = id.replace(/\((.*)\)/img, "");
            var table = subtype == "表单" ? "newResources" : "newProducts";
            that.getLastSaveId(table, id).then(res => {
                var count = res.length,
                    dataid = NumberHelper.idToName(count - 1, 1);

                if (flag) {
                    dataid = "Z";
                }
                newid = id.slice(0, 8) + dataid + id.slice(9, 10);
                that.$saveAsName.val(`${newid}`)
            })
        })
    }
}