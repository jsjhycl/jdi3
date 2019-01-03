function StructureService() {
    this.tablesUrl = "/newapi/gettables";
    this.fieldsUrl = "/newapi/getfields";
}

StructureService.prototype = {
    getTables: function (callback) {
        var that = this;
        $.cajax({
            url: that.tablesUrl,
            cache: false,
            type: "GET",
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    },
    getFields: function (table, callback) {
        if (!table) return;
        var that = this;
        $.cajax({
            url: that.fieldsUrl + "/" + table,
            cache: false,
            type: "GET",
            dataType: "json",
            success: function (result, status, xhr) {
                callback(result);
            }
        });
    }
};