function ResourceModal() {
    this.$createModal = $("#create_resource_modal");
    this.$openModal = $("#open_resource_modal");

    this.$createTemplateTab = this.$createModal.find(".modal-body #create_template_resource_tab");
    this.$createModelTab = this.$createModal.find(".modal-body #create_model_resource_tab");

    this.$openTemplateTab = this.$openModal.find("#open_template_resource_tab");
    this.$openModelTab = this.$openModal.find("#open_model_resource_tab");

    this.$templateName = this.$createTemplateTab.find('[name="template_resource_name"]');
    this.$modelRelId = this.$createModelTab.find('[name="model_resource_relId"]');
    this.$modelName = this.$createModelTab.find('[name="model_resource_name"]');
    this.data = [];

    this._fillRelId = function () {
        var that = this,
            value = that.$createModal.find('[name="model_resource_subCategory"]:checked').val(),
            defaultOption = {name: "请选择关联模板", value: ""},
            options = that.data.filter(function (fitem) {
                return value === fitem.basicInfo.subCategory;
            }).map(function (mitem) {
                return {name: mitem.name, value: mitem.id};
            });
        Common.fillSelect(that.$modelRelId, defaultOption, options, null, false);
    };

    this._pageList = function () {
        var that = this,
            $elem = $("#template_resource_page"),
            type = "模板",
            attrs = [{key: "id", alias: "guid"}];
        if (that.$openModelTab.is(":visible")) {
            $elem = $("#model_resource_page");
            type = "模型";
            attrs = [
                {key: "id", alias: "guid"},
                {key: "relId", alias: "relid"}
            ];
        }
        $elem.jpagination({
            url: "/newapi/pagelist",
            data: {
                table: "resources",
                conditions: {type: type},
                sort: {addTime: -1},
                pageIndex: 1,
                pageSize: 6
            },
            forms: [
                {name: "type", controlType: "hidden", searchType: "=", value: type},
                {name: "name", controlType: "textbox", searchType: "like", labelText: "资源名称"}
            ],
            thead: {
                fields: [
                    {
                        text: "资源名称",
                        key: "name",
                        type: 0,
                        func: "detail",
                        template: function (value) {
                            return '<a>' + value + '</a>';
                        }
                    },
                    {
                        text: "处理状态",
                        key: "state",
                        type: 0,
                        func: null,
                        template: function (value) {
                            return value === 1 ? '<span class="text-success">已入库</span>' : '<span class="text-warning">未入库</span>';
                        }
                    },
                    {
                        text: "操作",
                        key: "",
                        type: 1,
                        items: [
                            {
                                text: "删除",
                                func: "remove",
                                template: function () {
                                    return '<button class="btn btn-danger">删除</button>';
                                }
                            }
                        ]
                    }
                ],
                attrs: attrs
            },
            onDetail: function () {
                var $tr = $(this).parents("tr"),
                    id = $tr.attr("data-id"),
                    name = $(this).text();
                if (type === "模型") {
                    var relId = $tr.attr("data-relId");
                    new ProductService().detail(relId, function (result) {
                        Common.handleResult(result, function (data) {
                            if (data) {
                                new Workspace().load(id, name, "资源", "模型", null, null, data);
                                that.$openModal.modal("hide");
                                new Main().open();
                            }
                        });
                    });
                } else {
                    new Workspace().load(id, name, "资源", type, null, null, null);
                    that.$openModal.modal("hide");
                    new Main().open();
                }
            },
            onRemove: function () {
                var id = $(this).parents("tr").attr("data-id");
                return new ResourceService().removePromise(id);
            }
        });
    };
}

ResourceModal.prototype = {
    initdata:function(){
        console.log(12)
    },
    create: function () {
        var that = this;
        //选项卡shown事件
        that.$createModal.find('.nav-tabs [data-toggle="tab"]').on("shown.bs.tab", function () {
            console.log(this)
            if (that.$createModelTab.is(":visible")) {
                new ProductService().list("模板", 20, function (result) {
                    Common.handleResult(result, function (data) {
                        if (!Array.isArray(data)) return;
                        that.data = data.slice(0);
                        that._fillRelId();
                    });
                });
            }
        });
        //模板资源名称focusout事件
        that.$createModal.on("focusout", "#template_resource_name", function () {
            var value = $(this).val();
            if (value && value.indexOf("_") < 0) {
                $(this).val(value + "_模板资源");
            }
        });
        //模型分类click事件
        that.$createModal.on("click", '[name="model_resource_subCategory"]', function () {
            that._fillRelId();
        });
        //关联模板change事件
        that.$createModal.on("change", '[name="model_resource_relId"]', function () {
            var value = $(this).val();
            if (value) {
                var text = $(this).find("option:selected").text();
                that.$modelName.val(text.replace("模板产品", "模型资源"));
            } else {
                that.$modelName.val("");
            }
        });
        //保存click事件
        that.$createModal.find(".modal-footer .save").click(function () {
            var data;
            if (that.$createTemplateTab.is(":visible")) {
                var name = that.$templateName.val();
                if (!name) return alert("模板资源名称不可以为空！");

                data = {
                    name: name,
                    type: "模板"
                };
            } else {
                var name = that.$modelName.val();
                if (!name) return alert("模型资源名称不可以为空！");

                var relid = that.$modelRelId.val();
                if (!relid) return alert("关联模板不可以为空！");

                data = {
                    relid: relid,
                    name: name,
                    type: "模型"
                };
            }
            new ResourceService().add(data, function (result) {
                var resId = result.result;
                Common.handleResult(result, function () {
                    if (data.type === "模型") {
                        new ProductService().detail(data.relid, function (presult) {
                            Common.handleResult(presult, function (pdata) {
                                if (pdata) {
                                    new Workspace().load(resId, data.name, "资源", "模型", null, null, pdata);
                                }
                            });
                        });
                    } else {
                        new Workspace().init(resId, data.name, "资源", "模板", null, null, null);
                    }
                    that.$createModal.modal("hide");
                });
            });
            new Main().open();
        });
    },
    open: function () {
        var that = this;
        //模态框shown事件
        that.$openModal.on("shown.bs.modal", function () {
            that._pageList();
        });
        //选项卡shown事件
        that.$openModal.find('.nav-tabs [data-toggle="tab"]').on("shown.bs.tab", function () {
            that._pageList();
        });
    }
};