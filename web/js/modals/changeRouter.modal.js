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
                    <td><button class="btn btn-danger del">删除</button></td>
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
            console.log('data', data);
            if (!Array.isArray(data)) return;
            var html = "";
            data.forEach(item => {
                html += that.renderTr(item)
            });
            that.$tbody.empty().append(html);
        })
    },

    saveData: function() {
        var save = [];
        var save = this.$tbody.find("tr").map(function() {
            var $tr = $(this);
            return $tr.find('input').map(function() {
                var $input = $(this);
                return {
                    col: $input.data('name'),
                    value: $input.val()
                }
            });
        });
        console.log(save);
    },

    bindEvents: function() {
        var that = this;
        that.$modal.on('click' + that.NAME_SPACE, ".add", function() {
            that.renderTr({}, true);
        });
        that.$modal.on('click' + that.NAME_SPACE, ".del", function() {
            var $parent = $(this).parents('tr'),
                result = window.confirm("确定删除该路由配置？");
            result && $parent.remove();
        });
    },

    execute: function() {
        this.basicEvents(true, this.initData, this.saveData)
    }
}