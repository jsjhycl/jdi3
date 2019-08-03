/**
 * 打开表单资源
 */
function OpenTemplate($openModal) {
    BaseModal.call(this, $openModal);
    this.$openModal = $openModal;
    this.getQueryConfig = function() {
        var config = jdi.fileApi.getProfile('dBTableConfig_custom.json'),
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
        return query;
    };
    this.getTheadFields = function(fields) {
        var data = fields.map((i, idx) => {
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
        return data;
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
            // forms: [
            //     {name: "name", controlType: "textbox", searchType: "like", labelText: "资源名称"}
            // ],
            thead: {
                fields: that.getTheadFields(query["fields"]),
                attrs: attrs
            },
            onDetail: async function () {
                var $tr = $(this).parents("tr"),
                    id = $tr.attr("data-id"),
                    // name = $(this).text();
                    
                    // new Workspace().load(id, name, "表单", null, null, null);
                    // that.$openModal.modal("hide");
                    // new Main().open();
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
    },
    execute: function() {
        var that = this;
        that.basicEvents(false, that.initData)
    }
}