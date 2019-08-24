function ChangeRouter($modal) {
    BaseModal.call(this, $modal);
    this.$tbody = $modal.find("tbody");
    this.NAME_SPACE = ".CHANGEROUTER";
    this.renderTr = function(data, isAppend) {
        if (!DataType.isObject(data)) data = {};
        isAppend = !!isAppend;
        var html = `<tr>
                    <td><input type="text" class="form-control" data-name="origin" value="${data.origin || ""}" /></td>
                    <td><input type="text" class="form-control" data-name="path"  value="${data.path || ""}" /></td>
                    <td><input type="text" class="form-control" data-name="target"  value="${data.target || ""}" /></td>
                    <td><span class="del">X</span></td>
                </tr>`
        isAppend && this.$tbody.append(html);
        return html;
    }
}

ChangeRouter.prototype = {
    initData: function() {
        this.clear();
        this.setData();
        this.bindEvents();
    },

    clear: function() {
        this.$modal.off(this.NAME_SPACE)
    },

    setData: function() {
        var that = this;
        new Service().getRouter(function(data) {
            if (!Array.isArray(data)) return;
            var html = "";
            data.forEach(item => {
                html += that.renderTr(item)
            });
            that.$tbody.empty().append(html);
        })
    },

    saveData: async function() {
        var save = [],
            service = new Service();
        await service.removeRouters();
        this.$tbody.find("tr").each(function() {
            var $tr = $(this),
                arr = $tr.find('input').map(function() {
                    var $input = $(this);
                    return {
                        col: $input.data('name'),
                        value: $input.val()
                    }
                }).get();
            save.push(service.addRouter(arr));
        });
        Promise.all(save).then(() => {
            console.log(arguments);
        })
    },

    bindEvents: function() {
        var that = this;
        that.$modal.on('click' + that.NAME_SPACE, ".add", function() {
            that.renderTr({}, true);
        });
        that.$modal.on('click' + that.NAME_SPACE, ".del", function() {
            $(this).parents('tr').remove();
        });
    },

    execute: function() {
        this.basicEvents(true, this.initData, this.saveData)
    }
}