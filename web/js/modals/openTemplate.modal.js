/**
 * 打开表单资源
 */
function OpenTemplate($openModal) {
    BaseModal.call(this, $openModal);
    this.$openModal = $openModal;
    this.getQueryConfig = function() {
        var config = jdi.fileApi.getProfile('dBTable0Config_custom.json'),
            query = $.extend({}, config, { size: 8, page: 1 });
        query['command'] = "query";
        query['table'] = "newResources";
        if (Array.isArray(query['condition'])) {
            query['condition'].forEach(con => {
                con.isReg && (con.value = ('/' + con.value + '/'));
                delete con.isReg
                delete con.cate
            })
        }
        delete query['db'];
        Array.isArray(query['fields']) ? query['fields'].push({ value: "customId" }) : (query['fields'] = [{ value: "customId" }])
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
    this._pageList = function(){
        var that =this,
            $elem = $("#template_resource_page"),
            attrs = [{key: "id", alias: "_id"}]; 
            query = that.getQueryConfig();
        $elem.jpagination({
            getPage: new Service().pageList,
            url: new Service().baseUrl,
            query,
            thead: {
                fields: that.getTheadFields(query["fields"]),
            },
            onDetail: async function () {
                var id = $(this).parents("tr").attr("data-id"),
                    template = await new Service().query(query['table'], [{ col: 'customId', value: id }], ['customId', 'name'])
                    new Workspace().load(template[0].customId, template[0].name, "表单", null, null, null);
                    that.$openModal.modal("hide");
                    new Main().open();
            },
            onRemove: function () {
                var id = $(this).parents("tr").attr("data-id"),
                    p1 = new Service().removeByCustomId(query['table'], id);
                    p2 = new FileService().rmdir('/resource/' + id);
                return Promise.all([p1, p2])
            }
        });
    }
}
OpenTemplate.prototype = {
    initData: function () {
        var that = this;
        that._pageList()
    },
    execute: function() {
        var that = this;
        that.basicEvents(false, that.initData)
    }
}