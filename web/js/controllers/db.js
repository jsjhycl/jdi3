function Db() {
    this._getCurrentTable = function () {
        var $workspace = $("#workspace"),
            id = $workspace.attr("data-id"),
            name = $workspace.attr("data-name"),
            type = $workspace.attr("data-type"),
            subtype = $workspace.attr("data-subtype"),
            customId = $workspace.attr("data-customId");
        if ((type === "产品" || type === "数据库定义") &&
            subtype === "模型" && customId) return {name: name, value: customId};
        else return null;
    };

    this._buildTriggerFields = function () {
        var result = [];
        for (var i = 0; i < 20; i++) {
            var item = "C" + i;
            result.push({name: item, value: item});
        }
        return result;
    };
}

Db.prototype = {
    getTables: function (hasTrigger, callback) {
        hasTrigger = !!hasTrigger;
        var that = this;
        new StructureService().getTables(function (result) {
            if (Array.isArray(result)) {
                //获取当前模型的表数据
                var customId = $("#workspace").attr("data-customId"),
                    isExist = result.isExist("value", customId),
                    ctable = that._getCurrentTable();
                if (!isExist && ctable) {
                    result.unshift(ctable);
                }
                if (hasTrigger) {
                    result.unshift({name: "触发表", value: "sys_TRIGGER"});
                }
            }
            callback(result);
        });
    },
    getFields: function (table, callback) {
        if (!table) return callback(null);

        var that = this;
        if (table === "sys_TRIGGER") {
            var fields = that._buildTriggerFields();
            return callback(fields);
        }

        new StructureService().getFields(table, function (fields) {
            var result = Array.isArray(fields) ? fields : [];
            result = result.map(function (item) {
                return {name: item.desc, value: item.name, fieldSplit: item.fieldSplit};
            });
            if (result.length > 0) {
                result.unshift({name: "编号", value: "_id"});
            }
            callback(result);
        });
    }
};