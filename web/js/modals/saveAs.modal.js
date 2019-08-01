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

}
SaveAsModal.prototype = {
    initData: function () {
        var that = this;
        that._clearData();
        var $workspace = $("#workspace"),
            id = $workspace.attr("data-id"),
            id = id.replace(/\((.*)\)/img, ""), //获取工作区data-id
            saveName;
        var subtype = $workspace.attr("data-subtype");
        var type = subtype == "表单" ? "0" : "1";
        var promise = new NewService().queryHistory(id, type)
        promise.then(function (res) {
            if (res.status == -1) return alert("获取数据失败");
            var data = res.result
            var count = data;
            saveName = `${id}(${count})`;
            that.$saveAsName.val(saveName)
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
                var type = subtype == "表单" ? "0" : "1";
            promise = new NewService().queryHistory(id, type);
            promise.then(function (res) {
                if (res.status == -1) return alert("获取数据失败");
                var data = res.result,
                    count = data,
                    saveId = `${id}(${count})`;
                new Workspace().save(true, saveId)
            })
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
            var type = subtype == "表单" ? "0" : "1";

            var promise = new NewService().queryHistory(id, subtype)
            promise.then(function (res) {
                if (res.status == -1) return alert("获取数据失败");
                var data = res.result,
                    count = data;
                if (flag) {
                    count = 99;
                }
                var saveName = `${id}(${count})`;
                that.$saveAsName.val(saveName)
            })


        })
    }
}