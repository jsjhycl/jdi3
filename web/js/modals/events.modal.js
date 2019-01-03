/**
 * 事件配置（触发配置）
 * @param $modal
 * @param $element
 * @constructor
 */
function EventsModal($modal, $element) {
    BaseModal.call(this, $modal, $element);

    this.$tbody = this.$modalBody.find(".table tbody");

    const EVENT_TYPES = [
        {name: "加载", value: "load"},
        {name: "点击(链接、按钮)", value: "click"},
        {name: "双击(链接、按钮)", value: "dblclick"},
        {name: "选择变化(下拉列表)", value: "change"},
        {name: "获取焦点(文本框)", value: "focusin"},
        {name: "文本变化(文本框)", value: "input"},
        {name: "失去焦点(文本框)", value: "focusout"}
    ];
    var CUSTOM_METHODS = [];//来源于自定义方法
    var QUERY_METHODS = [];//来源于数据查询配置

    this._initCustomMethods = function () {
        var result = new CommonService().getFileSync("/profile/custom_methods.json");
        CUSTOM_METHODS = result || [];
    };

    this._initQueryMethods = function () {
        var id = $("#property_id").val();
        if (!id) return;

        var query = new Property().getValue(id, "query");
        if (!DataType.isObject(query)) return;

        var db = query.db;
        if (!DataType.isObject(db)) return;

        var type = db.type,
            name = {"common": "通用查询", "table": "表格查询"}[type],
            value = type + "Query";
        QUERY_METHODS.push({name: name, value: value});
    };

    this._resetData = function () {
        this.$tbody.empty();
        CUSTOM_METHODS = [];
        QUERY_METHODS = [];
    };

    this._addItem = function (data) {
        var that = this,
            $tr = $('<tr><td><select class="form-control" data-key="type"></select></td>' +
                TableHelper.buildBtnInputTd("btn-config btn-conditions", null, "conditions") +
                '<td><select class="form-control" data-key="custom" multiple="multiple"></select></td>' +
                '<td><select class="form-control" data-key="query" multiple="multiple"></select></td>' +
                TableHelper.buildBtnInputTd("btn-config btn-property", null, "property") +
                TableHelper.buildBtnInputTd("btn-config btn-copySend", null, "copySend") +
                '<td><button class="btn btn-danger btn-sm remove">删除</button></td></tr>');
        that.$tbody.append($tr);

        var type, conditions, custom, query, property, copySend;
        if (DataType.isObject(data)) {
            var publish = data.publish;
            if (DataType.isObject(publish)) {
                type = publish.type;
            }
            var subscribe = data.subscribe;
            if (DataType.isObject(subscribe)) {
                conditions = subscribe.conditions;
                custom = subscribe.custom;
                query = subscribe.query;
                property = subscribe.property;
                copySend = subscribe.copySend;
            }
        }
        ModalHelper.setSelectData($tr.find('[data-key="type"]'), {
            name: "请选择触发类型",
            value: ""
        }, EVENT_TYPES, type, false);
        ModalHelper.setInputData($tr.find('[data-key="conditions"]'), conditions, true);
        ModalHelper.setSelectData($tr.find('[data-key="custom"]'), null, CUSTOM_METHODS, custom, false);
        ModalHelper.setSelectData($tr.find('[data-key="query"]'), null, QUERY_METHODS, query, false);
        ModalHelper.setInputData($tr.find('[data-key="property"]'), property, true);
        ModalHelper.setInputData($tr.find('[data-key="copySend"]'), copySend, true);
    };

    this._removeItem = function ($tr) {
        $tr.remove();
    };
}

EventsModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();
        that._initQueryMethods();
        that._initCustomMethods();
        if (!Array.isArray(data)) {//添加一个默认值
            data = [
                {
                    publish: {
                        type: null,
                        key: null,
                        data: null
                    },
                    subscribe: {
                        conditions: null,
                        property: null,
                        query: null,
                        custom: null,
                        copySend: null
                    }
                }
            ];
        }
        data.forEach(function (item) {
            that._addItem(item);
        });
    },
    saveData: function () {
        var id = $("#property_id").val();
        if (!id) return;

        var that = this,
            data = [],
            $workspace = $("#workspace"),
            $control = $workspace.find("#" + id);
        that.$tbody.find("tr").each(function () {
            var type = $(this).find('[data-key="type"]').val(),
                conditions = $(this).find('[data-key="conditions"]').val() || null,
                custom = $(this).find('[data-key="custom"]').val(),
                query = $(this).find('[data-key="query"]').val(),
                property = $(this).find('[data-key="property"]').val() || null,
                copySend = $(this).find('[data-key="copySend"]').val() || null;

            if (type) {
                data.push({
                    publish: {
                        type: type,
                        key: [id, type, "SPP"].join("_"),
                        data: null
                    },
                    subscribe: {
                        conditions: Common.parseData(conditions),
                        custom: custom,
                        query: query,
                        property: Common.parseData(property),
                        copySend: Common.parseData(copySend)
                    }
                });
            }
        });
        that.$element.val(JSON.stringify(data));
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            var result = confirm("确定要清除触发配置数据吗？");
            if (!result) return;

            that._resetData();
            that.$element.val("");
            new Property().remove(id, "events");
            that.$modal.modal("hide");
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    },
    bindEvents: function () {
        var that = this;
        that.$modal.on("click", ".add", function () {
            that._addItem(null);
        });
        that.$modal.on("click", ".remove", function () {
            var $tr = $(this).parents("tr");
            that._removeItem($tr);
        });
        that.$modal.on("click", ".btn-conditions", function () {
            var $conditionsModal = $("#conditionsModal"),
                $element = $(this).next();
            var conditionsModal = new ConditionsModal($conditionsModal, $element, 2, null);
            conditionsModal.execute();
            $conditionsModal.modal("show");
        });
        that.$modal.on("click", ".btn-property", function () {
            var $result = $(this).next(),
                data = Common.parseData($result.val() || null);
            $(this).propModifier({
                $source: $("#workspace"),
                $result: $result,
                data: data
            });
        });
        that.$modal.on("click", ".btn-copySend", function () {
            var $copySendModal = $("#copySendModal"),
                $element = $(this).next();
            var copySendModal = new CopySendModal($copySendModal, $element);
            copySendModal.execute();
            copySendModal.bindEvents();
            $copySendModal.modal("show");
        });
    }
};


