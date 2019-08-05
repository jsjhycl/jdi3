/**
 * 静态数据源配置
 * @param $modal
 * @param $element
 * @constructor
 */
function StaticDataSourceModal($modal, $element) {
    BaseModal.call(this, $modal, $element);//调用基础模块

    this.$static = this.$modalBody.find("textarea");//获取弹窗的数据项

    this._resetData = function () {
        this.$static.val("");//给数据项设置为空
    };
}

StaticDataSourceModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();//调用_resetData
        if (DataType.isString(data)) {//如果data是字符串
            that.$static.val(data);//给数据项设置值
        }
    },
    saveData: function () {
        var id = $("#property_id").val();//获取编号id
        if (!id) return;//如果编号id不存在退出函数

        var that = this,
            data = that.$static.val(),//获取数据的值
            $workspace = $("#workspace"),//获取工作区元素
            $control = $workspace.find("#" + id);//在工作区中查找指定的元素
        that.$element.val(data);//给$element设置data
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);//调用property的save方法
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();//获取编号id
        if (!id) {//如果id不存在
            that.$modal.modal("hide");//弹窗隐藏
        } else {
            var result = confirm("确定要清除静态数据源配置数据吗？");//提示是否清除
            if (!result) return;//取消退出函数

            that._resetData();//调用_resetData
            that.$element.val("");//$element设置为空
            new Property().remove(id, "dataSource.static");//调用property的remove方法
            that.$modal.modal("hide");//弹窗隐藏
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(false, that.initData, that.saveData, that.clearData);//绑定基础事件
    }
};


/**
 * 数据库数据源配置
 * @param $modal
 * @param $element
 * @constructor
 */
function DbDataSourceModal($modal, $element) {
    BaseModal.call(this, $modal, $element);

    this.$querier = this.$modalBody.find(".querier");
}

DbDataSourceModal.prototype = {
    initData: function (data) {
        var that = this;
        that.$querier.dbQuerier({
            fieldMode: "single",
            data: data
        });
    },
    saveData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) return;

        var data = that.$querier.dbQuerier("getData"),
            $workspace = $("#workspace"),
            $control = $workspace.find("#" + id);
        that.$element.val(JSON.stringify(data));
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            var result = confirm("确定要清除数据库数据源配置数据吗？");
            if (!result) return;

            that.$querier.dbQuerier("clearData");
            that.$element.val("");
            new Property().remove(id, "dataSource.db");
            that.$modal.modal("hide");
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    }
};

function DataSourceTabModal($modal, $staticElement, $dbElement) {
    BaseModal.call(this, $modal);
    this.$static = this.$modalBody.find("textarea");
    this.$querier = this.$modalBody.find(".querier_tab");
    this.$staticElement = $staticElement;
    this.$dbElement = $dbElement;
}

DataSourceTabModal.prototype = {
    initData: function () {
        var staticData = this.$staticElement.val(),
            dbData = null;
        if (DataType.isString(staticData)) {
            this.$static.val(staticData);
        };
        
        try {
            dbData = this.$dbElement.val() && JSON.parse(this.$dbElement.val());
        } catch(err) {
            dbData = null
        }

        this.$querier.dbQuerier({
            fieldMode: "single",
            data: dbData
        });
        
    },
    saveData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) return;

        var staticData = that.$static.val(),
            dbData = that.$querier.dbQuerier("getData"),
            $workspace = $("#workspace"),
            $control = $workspace.find("#" + id);
        staticData && this.$staticElement.val(staticData);
        new Property().save(id === "BODY" ? $workspace : $control, that.$staticElement);
        if (dbData && dbData.dbName && dbData.table) {
            this.$dbElement.val(JSON.stringify(dbData));
            new Property().save(id === "BODY" ? $workspace : $control, that.$dbElement);
        }
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            var result = confirm("确定要清除下拉列表的数据源配置数据吗？");
            if (!result) return;

            this.$staticElement.val("")
            this.$dbElement.val("");
            this.$querier.dbQuerier("clearData");
            new Property().remove(id, "dataSource.static");
            new Property().remove(id, "dataSource.db");
            this.$modal.modal("hide");
        }
    },

    execute: function () {
        var that = this;
        that.basicEvents(false, that.initData, that.saveData, that.clearData);//绑定基础事件
    }
}