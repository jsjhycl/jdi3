/**
 * 打开表单资源
 */
function OpenTemplate() {
    this.$openModal = $("#open_template_modal")
    this._pageList = function(){
        var that =this,
        $elem = $("#template_resource_page"),
        type = "表单",
        attrs = [{key: "id", alias: "customId"}]; 
        $elem.jpagination({
            url: "/new/table",
            data: {
                commond:"query",
                table:"newResources",
                size:6,
                page:1
            },
            forms: [
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

                    new Workspace().load(id, name, "表单", null, null, null);
                    that.$openModal.modal("hide");
                    new Main().open();
            },
            onRemove: function () {
                var id = $(this).parents("tr").attr("data-id");
                return new NewService().removePromise(id, 0)
            }
        });
    }
}
OpenTemplate.prototype = {
    initData: function () {
        var that = this;
        that._pageList()
    }
}