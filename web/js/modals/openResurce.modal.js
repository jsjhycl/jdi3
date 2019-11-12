/**
 * 打开资源
 */
function OpenResource($openModal) {
    BaseModal.call(this, $openModal);
    this.$openModal = $openModal;
    this.globalJsonPath = "./profiles/global.json";
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
        Array.isArray(query['fields']) ? query['fields'].push({ value: "customId" }) : query['fields'] = [{ name: "布局名称", value: "name" }, { value: "customId" }]
        query['fields'].push({
            name: '版本号',
            value: 'version'
        })
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
                            if (idx === 0) {
                                return '<a>' + value + '</a>' 
                            } else if (idx === fields.length - 1) {
                                var str = '';
                                if (DataType.isObject(value)) {
                                    var selected = value.isActive;
                                    value = value.info||[];
                                    str += '<select class="form-control version">' +value.map(i => {
                                        return `<option value="${i}" ${i==selected?"selected":""}>${i}</option>`
                                    }).join('') + '</select>'
                                }
                                return str
                            } else {
                                return '<span>' + value + '</span>'
                            }
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
                var id = $(this).parents("tr").attr("data-id"),
                    version = $(this).parents("tr").find(".version").val();


                var resources = await new Service().query(query['table'], [{ col: 'customId', value: id }], ['basicInfo.contactId', 'basicInfo.contactTable', 'basicInfo.contactDb', 'name', 'edit']),
                    resource = Array.isArray(resources) && resources[0];
                if (DataType.isObject(resource)) {
                    var customId = Common.recurseObject(resource, 'basicInfo.contactId'),
                        templates = await new Service().query(resource['basicInfo.contactId'] || 'newResources', [{ col: 'customId', value: customId }]);
                        relTemplate = Array.isArray(templates) && templates[0];
                    new Workspace().load(id, resource.name, "布局", relTemplate ? relTemplate.customId : '', relTemplate, resource.edit,undefined,version);
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
                if(id.length >= 10){
                    new FileService().readFile(that.globalJsonPath).then(res=>{
                        var data = res;
                        if(data[id]){
                            delete data[id]
                            new FileService().writeFile(that.globalJsonPath, JSON.stringify(data)) 
                        }
                    });
                }
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