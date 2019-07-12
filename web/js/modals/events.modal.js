/**
 * 事件配置（触发配置）
 * @param $modal
 * @param $element
 * @constructor
 */
function EventsModal($modal, $element) {
    BaseModal.call(this, $modal, $element);//绑定基础事件

    this.$tbody = this.$modalBody.find(".table tbody");//获取模态框的tbody

    const EVENT_TYPES = [//定义事件 类型
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
        var result = new CommonService().getFileSync("/profile/custom_methods.json");//调用commonService中的getFileSync方法
        CUSTOM_METHODS = result || [];//如果result有值就赋值否则赋值为空
    };

    this._initQueryMethods = function () {
        var id = $("#property_id").val();//获取编号id
        if (!id) return;//如果id不存在退出函数

        var query = new Property().getValue(id, "query");//实例化property调用getvalue方法
        if (!DataType.isObject(query)) return;//判断query是不是对象不是退出函数

        var db = query.db;//讲query的db赋值给db
        if (!DataType.isObject(db)) return;//如果db不死对象 退出函数

        var type = db.type,//讲db的type赋值给type
            name = {"common": "通用查询", "table": "表格查询"}[type],//获取type对应的值 通用查询还是表格查询并赋值给name
            value = type + "Query";//讲type+query赋值给value
        QUERY_METHODS.push({name: name, value: value});//向QUERY_METHODS中添加
    };

    this._resetData = function () {
        this.$tbody.empty();//讲tbody清空
        CUSTOM_METHODS = [];//赋值为空数组
        QUERY_METHODS = [];//赋值为空数组
    };

    this._addItem = function (data) {
        var that = this,
            $tr = $('<tr><td><select class="form-control" data-key="type"></select></td>' +
                TableHelper.buildBtnInputTd("btn-config btn-conditions", null, "conditions") +
                '<td><select class="form-control" data-key="custom" multiple="multiple"></select></td>' +
                '<td><select class="form-control" data-key="query" multiple="multiple"></select></td>' +
                TableHelper.buildBtnInputTd("btn-config btn-property", null, "property") +
                TableHelper.buildBtnInputTd("btn-config btn-copySend", null, "copySend") +
                '<td><button class="btn btn-danger btn-sm remove">删除</button></td></tr>');//生成tr的html代码
        that.$tbody.append($tr);//将html添加到$tbody

        var type, conditions, custom, query, property, copySend;//声明变量
        if (DataType.isObject(data)) {//判断data是不是对象
            var publish = data.publish;//将data.publish赋值给 publish
            if (DataType.isObject(publish)) {//判断publish是不是对象
                type = publish.type;//讲publish的type赋值费type
            }
            var subscribe = data.subscribe;//将data的subscribe赋值给subscribe
            if (DataType.isObject(subscribe)) {//判断subscribe是不是对象
                conditions = subscribe.conditions;//赋值
                custom = subscribe.custom;//赋值
                query = subscribe.query;//赋值
                property = subscribe.property;//赋值
                copySend = subscribe.copySend;//赋值
            }
        }
        ModalHelper.setSelectData($tr.find('[data-key="type"]'), {//调用ModalHelper的setSelectData
            name: "请选择触发类型",
            value: ""
        }, EVENT_TYPES, type, false);
        ModalHelper.setInputData($tr.find('[data-key="conditions"]'), conditions, true);//调用ModalHelper的setSelectData
        ModalHelper.setSelectData($tr.find('[data-key="custom"]'), null, CUSTOM_METHODS, custom, false);//调用ModalHelper的setSelectData
        ModalHelper.setSelectData($tr.find('[data-key="query"]'), null, QUERY_METHODS, query, false);//调用ModalHelper的setSelectData
        ModalHelper.setInputData($tr.find('[data-key="property"]'), property, true);//调用ModalHelper的setSelectData
        ModalHelper.setInputData($tr.find('[data-key="copySend"]'), copySend, true);//调用ModalHelper的setSelectData
    };

    this._removeItem = function ($tr) {
        $tr.remove();//将tr移除
    };
}

EventsModal.prototype = {
    initData: function (data) {
        var that = this;
        that._resetData();//调用_resetData
        that._initQueryMethods();//调用_initQueryMethods
        that._initCustomMethods();//调用_initCustomMethods
        if (!Array.isArray(data)) {//如果data不是一个数组 添加一个默认值
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
        data.forEach(function (item) {//遍历data
            that._addItem(item);//执行_addItem
        });
    },
    saveData: function () {
        var id = $("#property_id").val();//获取编号id
        if (!id) return;//如果id不存在退出函数

        var that = this,
            data = [],
            $workspace = $("#workspace"),//获取工作区
            $control = $workspace.find("#" + id);//获取对应id的元素
        that.$tbody.find("tr").each(function () {//遍历tr
            var type = $(this).find('[data-key="type"]').val(),//获取触发类型
                conditions = $(this).find('[data-key="conditions"]').val() || null,//获取触发条件
                custom = $(this).find('[data-key="custom"]').val(),//获取固定方法
                query = $(this).find('[data-key="query"]').val(),//获取数据查询
                property = $(this).find('[data-key="property"]').val() || null,//获取属性改变
                copySend = $(this).find('[data-key="copySend"]').val() || null;//获取数据抄送

            if (type) {//如果type存在
                data.push({//向data中添加数据
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
        that.$element.val(JSON.stringify(data));//将datajson化并添加到$element
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);//实例化property调用save方法
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();//获取编号id
        if (!id) {//如果编号id不存在
            that.$modal.modal("hide");//弹窗关闭
        } else {
            var result = confirm("确定要清除触发配置数据吗？");//提示是否
            if (!result) return;//如果取消退出函数

            that._resetData();//调用_resetData
            that.$element.val("");//将$element设置为空
            new Property().remove(id, "events");//调用property的remove方法
            that.$modal.modal("hide");//弹窗隐藏
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);//绑定基础事件
    },
    bindEvents: function () {
        var that = this;
        that.$modal.on("click", ".add", function () {//点击添加
            that._addItem(null);//执行_addItem
        });
        that.$modal.on("click", ".remove", function () {//点击移除
            var $tr = $(this).parents("tr");//获取tr
            that._removeItem($tr);//移除tr
        });
        that.$modal.on("click", ".btn-conditions", function () {//点击条件配置按钮
            var $conditionsModal = $("#conditionsModal"),//获取条件配置按钮
                $element = $(this).next();//获取属兔输入框
            var conditionsModal = new ConditionsModal($conditionsModal, $element, 2, null);//实例化条件配置
            conditionsModal.execute();//执行conditionsModal的execute
            $conditionsModal.modal("show");//条件配置模态框显示
        });
        that.$modal.on("click", ".btn-property", function () {//点击属性改变按钮
            var $result = $(this).next(),
                data = Common.parseData($result.val() || null);//调用Common的parseData方法
            $(this).propModifier({//调用propModifier
                $source: $("#workspace"),
                $result: $result,
                data: data
            });
        });
        that.$modal.on("click", ".btn-copySend", function () {//点击抄送按钮
            var $copySendModal = $("#copySendModal"),//获取抄送按钮模态框
                $element = $(this).next();//获取输入框
            var copySendModal = new CopySendModal($copySendModal, $element);//实例化抄送模态框
            copySendModal.execute();//执行copySendModal.execute
            copySendModal.bindEvents();//执行copySendModal.bindEvents
            $copySendModal.modal("show");//模态框显示
        });
    }
};


