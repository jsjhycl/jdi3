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
            // if (item.slice(9, 10) == id.slice(9, 10)) {
            //     result.push(item)
            // }
            if (item == id) result.push(item);
        })
        return result;
    }
    //对数组进行排序获取最大的那个
    this.sortStringArr = function (sortArr) {
        var newArr = sortArr.sort(function (a, b) {
            return a.localeCompare(b)
        })
        return newArr[newArr.length - 1];
    }
    //获取下一个编号
    this.getNextId = function (id) {
        var arr = ["0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
            numberId = id.slice(8, 9),
            index = arr.indexOf(numberId) + 1;
        newindex = index % 26
        return arr[newindex]
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
            var lastid = that.sortStringArr(res),
                nextid = that.getNextId(lastid),
                newid = id.slice(0, 8) + nextid + id.slice(9, 10);
            // var count = res.length,
            //     dataid = NumberHelper.idToName(count - 1, 1),
            //     newid = id.slice(0, 8) + dataid + id.slice(9, 10);

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
            // var table = type == "表单" ? "newResources" : "newProducts";
            // that.getLastSaveId(table, id).then(async res => {
            //     var count = res.length,
            //         dataid = NumberHelper.idToName(count - 1, 1),
            //         newid = id.slice(0, 8) + dataid + id.slice(9, 10);
            //     await new Workspace().save(true, `${newid}`, null)
            //     new Workspace().load(`${newid}`, name, type, contactId, reltemplate)
            // });
            var newid = that.$saveAsName.val()
            await new Workspace().save(true, `${newid}`, null)
            new Workspace().load(`${newid}`, name, type, contactId, reltemplate)
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
                var lastid = that.sortStringArr(res),
                    nextid = that.getNextId(lastid);

                if (flag) {
                    nextid = "Z";
                }
                newid = id.slice(0, 8) + nextid + id.slice(9, 10);
                that.$saveAsName.val(`${newid}`)
            })
        })
    }
}