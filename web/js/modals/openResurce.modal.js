/**
 * 打开资源
 */
function OpenResource($openModal) {
    BaseModal.call(this, $openModal);
    this.$openModal = $openModal;
    
    this.getQueryConfig = function() {
        var config = jdi.fileApi.getProfile('dBTable1Config_custom.json'),
            query = $.extend({}, config, { size: 6, page: 1 });
        query['command'] = "query"
        if (Array.isArray(query['condition'])) {
            query['condition'].forEach(con => {
                con.isReg && (con.value = ('/' + con.value + '/'));
                delete con.isReg
                delete con.cate
            })
        }
        delete query['db'];
        query['fields'].push({ value: "customId" });
        return query;
    };
    this.getTheadFields = function(fields) {
        var data = fields.map((i, idx) => {
            if (i.name) {
                return {
                        text: i.name,
                        key: i.value,
                        type: 0,
                        func: idx === 0 && "detail",
                        template: function (value) {
                            return idx === 0
                                    ? '<a>' + value + '</a>'
                                    : '<span>' + value + '</span>';
                        }
                    }
            }
        });
        data.push({
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
        })
        return data.filter(el => !!el);
    };
    this._pageList = function () {
        var that = this,
            $elem = $("#model_resource_page"),
            attrs = [{
                key: "id",
                alias: "customId"
            }];
            query = this.getQueryConfig();
        $elem.jpagination({
            url: new Service().baseUrl,
            query,
            thead: {
                fields: that.getTheadFields(query["fields"]),
            },
            // thead: {
            //     fields: [{
            //             text: "资源名称",
            //             key: "name",
            //             type: 0,
            //             func: "detail",
            //             template: function (value) {
            //                 return '<a>' + value + '</a>';
            //             }
            //         },
            //         {
            //             text: "处理状态",
            //             key: "state",
            //             type: 0,
            //             func: null,
            //             template: function (value) {
            //                 return value === 1 ? '<span class="text-success">已入库</span>' : '<span class="text-warning">未入库</span>';
            //             }
            //         },
            //         {
            //             text: "操作",
            //             key: "",
            //             type: 1,
            //             items: [{
            //                 text: "删除",
            //                 func: "remove",
            //                 template: function () {
            //                     return '<button class="btn btn-danger">删除</button>';
            //                 }
            //             }]
            //         }
            //     ],
            //     attrs: attrs
            // },
            onDetail: async function () {
                var $tr = $(this).parents("tr"),
                    id = $tr.attr("data-id"),
                    name = $(this).text();
                // var params = { type: 1,isAll: true,}
                // 先获取 布局（分页）

                var resources = await new Service().query(query['table'], [{ col: 'customId', value: id }], ['basicInfo.contactId', 'basicInfo.contactTable', 'basicInfo.contactDb', 'name']),
                    resource = Array.isArray(resources) && resources[0];
                
                if (DataType.isObject(resource)) {

                    var customId = Common.recurseObject(resource, 'basicInfo.contactId'),
                        templates = await new Service().query(resource['basicInfo.contactId'] || 'newResources', [{ col: 'customId', value: customId }]);
                        relTemplate = Array.isArray(templates) && templates[0];
                    new Workspace().load(resource.customId, resource.name, "布局", relTemplate.customId, relTemplate);
                } else {
                    alert('数据加载失败！')
                }
                // new NewService().list(params, function (res) {
                //     if (res.status == -1) return alert("请求错误");
                //     res.result.data.forEach(function (item) {
                //         if (item.customId == id) {
                //             var contactId = item.basicInfo.contactId;
                //             gettableList(contactId)
                //         }
                //     });
                // });

                // function gettableList(contactId) {
                //     var params1 = { type: 0,isAll: true}
                //     new NewService().list(params1, function (res) {
                //         res.result.data.forEach( function (item) {
                //             if(item.customId==contactId){
                //                 var relTemplate = item;
                //                 new Workspace().load(id, name, "布局", item.customId, relTemplate);
                //                 that.$openModal.modal("hide");
                //                 new Main().open();
                //             }
                //         })
                //     })
                // }

                // new ProductService().detail(relId, function (result) {
                //     Common.handleResult(result, function (data) {
                //         if (data) {
                //             new Workspace().load(id, name, "布局", null, null, data);
                //             that.$openModal.modal("hide");
                //             new Main().open();
                //         }
                //     });
                // });

            },
            onRemove: function () {
                var id = $(this).parents("tr").attr("data-id");
                alert('删除，还没写')
                // return new NewService().removePromise(id, 1)
            }
        });
    }
}
OpenResource.prototype = {
    initData: function () {
        var that = this;
        console.log(1111)
        that._pageList();
    },
    execute: function() {
        var that = this;
        that.basicEvents(false, that.initData);
    }
}