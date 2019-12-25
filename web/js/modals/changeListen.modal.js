function ChangeListenModal($modal) {
    BaseModal.call(this, $modal)
    this.$tbody = $modal.find("tbody");
    this.NAME_SPACE = ".CHANGELISTENMODAL"
    this.listens = null;

    this.renderTr = function (data, isAppend) {
        if (!DataType.isObject(data)) data = {};
        isAppend = !!isAppend;
        var html = `<tr>
                    <td class="text-center"><input type="text" ${!isAppend ? "disabled='disables'" : ""} class="form-control" data-name="name" value="${data.name || ""}" /></td>
                    <td class="text-center"><input type="text" class="form-control" data-name="cname" value="${data.cname || ""}" /></td>
                    <td class="text-center"><input type="text" ${!isAppend ? "disabled='disables'" : ""} class="form-control" data-name="arguments" value="${data.arguments || ""}" /></td>
                    <td><span class="del"  ${!isAppend ? "style='display:none'" : ""}>X</span></td>
                </tr>`
        isAppend && this.$tbody.append(html);
        return html;
    }

}
ChangeListenModal.prototype = {
    initData: async function () {
        this.clear()
        await this.setData()
        this.bindEvents();
    },
    clear: function () {
        this.$modal.off(this.NAME_SPACE)
    },
    setData: async function () {
        var listens = await new FileService().readFile("./profiles/listen.json");
        if (!DataType.isObject(listens)) return alert("获取特殊布局文件失败！");
        var html = '',
            that = this;
        that.listens = listens;
        Object.keys(listens).forEach(listen => {
            var obj = {
                name: listen,
                cname: listens[listen]["cname"],
                arguments: listens[listen]["argumentsNumber"]
            }
            html += that.renderTr(obj)
        })
        that.$tbody.empty().append(html);


    },
    bindEvents: function () {
        var that = this;
        that.$modal.on('click' + that.NAME_SPACE, ".add", function () {
            that.renderTr({}, true);
        });
        that.$modal.on('click' + that.NAME_SPACE, ".del", function () {
            $(this).parents('tr').remove();
        });

    },
    saveData: function () {
        var that = this;
        var data = $.extend({}, that.listens)
        this.$tbody.find("tr").each(function () {
            var $tr = $(this),
                obj = {};
            $tr.find('input').each(function () {
                var $input = $(this),
                    type = $input.data('name'),
                    value = $input.val();
                obj[type] = value;
            })
            console.log(obj, data)
            if (data[obj.name]) {
                data[obj.name].cname = obj.cname;
                data[obj.name].argumentsNumber = obj.arguments
            } else {
                data[obj.name] = {
                    cname: obj.cname,
                    argumentsNumber: obj.arguments,
                    detail: []
                }
            }
        })
        new FileService().writeFile("./profiles/listen.json", JSON.stringify(data))
    },
    execute: function () {
        this.basicEvents(true, this.initData, this.saveData)
    }
}