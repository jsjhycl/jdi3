/**
 * 打开资源
 */
function OpenResource($openModal) {
    BaseModal.call(this, $openModal);
    this.$openModal = $openModal;
    
    this.getQueryConfig = function() {
        var config;
        try {
            config = jdi.fileApi.getProfile('dBTable1Config_custom.json');
        } catch(err) {
            config = {}
        }
        var query = $.extend({}, config, { size: 6, page: 1 });
            query['command'] = "query";
            query['table'] = "newProducts";
        if (Array.isArray(query['condition'])) {
            query['condition'].forEach(con => {
                con.isReg && (con.value = ('/' + con.value + '/'));
                delete con.isReg
                delete con.cate
            })
        }
        delete query['db'];
        Array.isArray(query['fields']) ? query['fields'].push({ value: "customId" }) : query['fields'] = [{ name: "布局名称", value: "name" }]
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
            onDetail: async function () {
                var id = $(this).parents("tr").attr("data-id");

                var resources = await new Service().query(query['table'], [{ col: 'customId', value: id }], ['basicInfo.contactId', 'basicInfo.contactTable', 'basicInfo.contactDb', 'name']),
                    resource = Array.isArray(resources) && resources[0];
                if (DataType.isObject(resource)) {
                    var customId = Common.recurseObject(resource, 'basicInfo.contactId'),
                        templates = await new Service().query(resource['basicInfo.contactId'] || 'newResources', [{ col: 'customId', value: customId }]);
                        relTemplate = Array.isArray(templates) && templates[0];
                    new Workspace().load(id, resource.name, "布局", relTemplate ? relTemplate.customId : '', relTemplate);
                    that.$openModal.modal("hide");
                    new Main().open();
                } else {
                    alert('数据加载失败！')
                }
            },
            onRemove: function () {
                var id = $(this).parents("tr").attr("data-id"),
                    p1 = new Service().removeByCustomId(query['table'], id);
                    p2 = new FileService().rmdir('/product/' + id);
                return Promise.all([p1, p2]);
            }
        });
    }
}
OpenResource.prototype = {
    initData: function () {
        var that = this;
        that._pageList();
    },
    execute: function() {
        var that = this;
        that.basicEvents(false, that.initData);
    }
}