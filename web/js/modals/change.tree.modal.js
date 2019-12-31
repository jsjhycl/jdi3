function ChangeCategoryTree($modal) {
    BaseModal.call(this, $modal);

}
ChangeCategoryTree.prototype = {
    initData: async function () {
        var that = this;
        var cates = await new FileService().readFile("./profiles/category1.json");
        if (!Array.isArray(cates)) return;
        $('#changeCategoryTree').buildTree({
            data: cates,
            tableName: 'category1',
            id: "changeCategoryTree",
        }, function (params) {
            that.saveData(params);
        })
    },
    saveData: function (params) {
        new FileService().writeFile("./profiles/category1.json", JSON.stringify(params), function (res) {
            console.log(res)
        })
    },
    execute: function () {
        this.basicEvents(true, this.initData)
    }
}
