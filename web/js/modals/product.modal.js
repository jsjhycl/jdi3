function ProductModal() {
    this.$receiveModal = $("#receive_product_modal");
    this.$openModal = $("#open_product_modal");

    this.$receiveTemplateTab = this.$receiveModal.find("#receive_template_product_tab");
    this.$openModelTab = this.$openModal.find("#open_model_product_tab");

    this._showReceiveProducts = function () {
        var that = this,
            type = "表单",
            $firstTable = $("#first_template_accordion").find(".table"),
            $secondTable = $("#second_template_accordion").find(".table");
        if (!that.$receiveTemplateTab.is(":visible")) {
            type = "布局";
            $firstTable = $("#first_model_accordion").find(".table");
            $secondTable = $("#second_model_accordion").find(".table");
        }
        that._renderTable(type, 0, $firstTable);
        that._renderTable(type, 10, $secondTable);
    };

    this._renderTable = function (type, state, $table) {
        new ProductService().list(type, state, function (result) {
            Common.handleResult(result, function (data) {
                if (!Array.isArray(data)) return;

                var html = "";
                data.forEach(function (item) {
                    html += '<tr data-id="' + item.id + '" data-customId="' + item.basicInfo.customId + '">' +
                        '<td><a>' + item.name + '</a></td>' +
                        '<td>' + item.categoryName + '</td>' +
                        '<td>' + (item.createorName || item.createor) + '</td>' +
                        '</tr>';
                });
                $table.empty().append(html);
            });
        });
    };

    this._pageList = function () {
        var that = this,
            $elem = $("#template_product_page"),
            type = "表单";
        if (that.$openModelTab.is(":visible")) {
            $elem = $("#model_product_page");
            type = "布局";
        }
        $elem.jpagination({
            url: "/newapi/pagelist",
            data: {
                table: "products",
                conditions: {type: type},
                sort: {createTime: -1},
                pageIndex: 1,
                pageSize: 6
            },
            forms: [
                {name: "type", controlType: "hidden", searchType: "=", value: type},
                {name: "name", controlType: "textbox", searchType: "like", labelText: "产品名称"}
            ],
            thead: {
                fields: [
                    {
                        text: "产品名称",
                        key: "name",
                        type: 0,
                        func: "detail",
                        template: function (value) {
                            return '<a>' + value + '</a>';
                        }
                    },
                    {
                        text: "产品分类",
                        key: "categoryName",
                        type: 0,
                        template: function (value) {
                            return value;
                        }
                    },
                    {
                        text: "审核状态",
                        key: "state",
                        type: 0,
                        dataType: "Number",
                        func: null,
                        template: function (value) {
                            // console.log("value:", value);
                            var config = {
                                    0: {text: "未审核", class: "text-danger"},
                                    10: {text: "审核中", class: "text-info"},
                                    20: {text: "已审核", class: "text-success"},
                                    40: {text: "数据定义", class: "text-primary"}
                                },
                                result = config[value] || {};
                            return '<span class="' + (result.class || "") + '">' + (result.text || "") + '</span>';
                        }
                    },
                    {
                        text: "创建人",
                        key: "createorName",
                        pkey: "createor",//预备的key，为了适应老数据而添加的
                        type: 0,
                        template: function (value) {
                            return value;
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
                attrs: [
                    {key: "id", alias: "id"},
                    {key: "customId", alias: "basicInfo.customId"}
                ]
            },
            onDetail: function () {
                var $tr = $(this).parents("tr"),
                    id = $tr.attr("data-id"),
                    name = $(this).text(),
                    customId = $tr.attr("data-customId");
                that.$openModal.modal("hide");
                new Workspace().load(id, name, "产品", type, "编辑", customId, null);
                new Main().open();
            },
            onRemove: function () {
                var id = $(this).parents("tr").attr("data-id");
                return new ProductService().removePromise(id);
            }
        });
    };
}

ProductModal.prototype = {
    receive: function () {
        var that = this;
        //模态框shown事件
        that.$receiveModal.on("shown.bs.modal", function () {
            that._showReceiveProducts();
        });
        //选项卡shown事件
        that.$receiveModal.find('.nav-tabs [data-toggle="tab"]').on("shown.bs.tab", function () {
            that._showReceiveProducts();
        });
        //打开
        that.$receiveModal.on("click", ".modal-body .table a", function () {
            var id = $(this).parents("tr").attr("data-id"),
                name = $(this).text(),
                type = that.$receiveTemplateTab.is(":visible") ? "表单" : "布局",
                productService = new ProductService();
            productService.receive(id, function (result) {
                Common.handleResult(result, function (data) {
                    if (!data) return;

                    productService.detail(id, function (tresult) {
                        Common.handleResult(tresult, function (tdata) {
                            that.$receiveModal.modal("hide");
                            new Workspace().load(id, name, "产品", type, "审核", tdata.basicInfo.customId, null);
                            new Main().open();
                        });
                    });
                });
            });
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