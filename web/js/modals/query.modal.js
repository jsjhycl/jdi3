/**
 * 数据库查询配置
 * @param $modal
 * @param $element
 * @constructor
 */
function DbQueryModal($modal, $element) {
    BaseModal.call(this, $modal, $element);

    this.$triggerSelecet = this.$modalBody.find('[data-key="triggerType"]')
    this.$typeSelect = this.$modalBody.find('[data-key="type"]');
    this.$querier = this.$modalBody.find(".querier");

    this._resetData = function () {
        this.$typeSelect.val("");
        this.$triggerSelecet.val("");
    };
}

DbQueryModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();

        var queryData = null;
        if (DataType.isObject(data)) {
            queryData = {
                dbName: data.dbName,
                table: data.table,
                fields: data.fields,
                conditions: data.conditions,
                queryTime: data.queryTime,
                renderTable: data.renderTable
            };
            var type = data.type || "",
                triggerType = data.triggerType || "";
            if (type) {
                that.$typeSelect.val(type);
            }
            triggerType && that.$triggerSelecet.val(triggerType)
        }
        that.$querier.dbQuerier({
            fieldMode: "multi",
            data: queryData,
            renderTable: true,
        }).then(function () {
            if (data && data.type === "foldmenu") {
                that.$querier.find('.form-group').eq(1).nextAll().hide();
            }
        })
    },
    saveData: function () {
        var id = $("#property_id").val();
        if (!id) return;

        var that = this,
            result = that.$querier.dbQuerier("getData"),
            data = {
                triggerType: that.$triggerSelecet.val(),
                type: that.$typeSelect.val(),
                dbName: result.dbName,
                table: result.table,
                fields: result.fields,
                conditions: result.conditions,
                queryTime: result.queryTime,
                renderTable: result.renderTable
            },
            $workspace = $("#workspace"),
            $control = $workspace.find("#" + id);
        that.$element.val(JSON.stringify(data));
        
        // that.deleteEvents(id)
        //删除触发中的查询事件
        if (that.$triggerSelecet.val()) {
            that.setEvent(id, data)
        }
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);
        new Property().load($control);
    },
    deleteEvents: function (id) {
        if (!id) return;
        var property = new Property(),
        events = property.getValue(id,"events")||[];
        events.forEach(event => {
            event.subscribe.query =[]                
        });
        
    },
    setEvent: function (id, data) {
        if (!id) return;
        var property = new Property(),
            events = property.getValue(id, "events") || [],
            trigger_type = data.triggerType,
            length = events.length,
            trigger_key = [id, trigger_type, "SPP" + (length - 1)].join("_"),
            eventObj = {
                publish: {
                    type: trigger_type,
                    key: trigger_key,
                    data: null
                },
                subscribe: {
                    conditions: null,
                    custom: null,
                    copySend: null,
                    property: null,
                    notify: null,
                    query: [],
                    timeQuery: null,
                    exprMethods: [],
                    saveHTML: null,
                    linkHtml: null,
                    nextProcess: null,
                    executeFn: null,
                    importExcel: false,
                    importDb: null,
                    keySave: null
                }
            };


        if (data.type == "common") {
            eventObj.subscribe.query = ["commonQuery"]
            eventObj.publish.sort = ["commonQuery"]
        }
        if (data.type == "table") {
            eventObj.subscribe.query = ["tableQuery"]
            eventObj.publish.sort = ["tableQuery"]
        }
        if (events.length == 0) { //如果没有事件
            eventObj.publish.key = [id, trigger_type, "SPP" + 0].join("_")
            events.push(eventObj)
        } else {
            var isExist = false;
            isExist = events.some(item => {
                return JSON.stringify(item) == JSON.stringify(eventObj)
            });
            alert("修改配置后请修改对应的触发事件")
            if (!isExist) {
                eventObj.publish.key = [id, trigger_type, "SPP" + length].join("_")
                events.push(eventObj)
            }
        }
        property.setValue(id, "events", events)


    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            var result = confirm("确定要清除数据库查询配置数据吗？");
            if (!result) return;

            that._resetData();
            that.$querier.dbQuerier("clearData");
            that.$element.val("");
            new Property().remove(id, "query.db");
            that.$modal.modal("hide");
        }
    },
    bindEvents: function () {
        var that = this;

        //  切换查询类型
        that.$modal.on('change', '.modal-body [data-key="type"]', function () {
            if ($(this).val() === "foldmenu") {
                that.$querier.find('.form-group').eq(1).nextAll().hide();
            } else {
                that.$querier.find('.form-group').eq(1).nextAll().show();
            }
        })
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    }
};