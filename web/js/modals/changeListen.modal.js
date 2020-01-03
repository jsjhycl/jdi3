function ChangeListenModal($modal) {
    BaseModal.call(this, $modal)
    this.$tbody = $modal.find("tbody");
    this.NAME_SPACE = ".CHANGELISTENMODAL"
    this.listens = null;

    this.renderTr = function (data, isAppend) {
        if (!DataType.isObject(data)) data = {};
        isAppend = !!isAppend;
        var html = `<tr>
                    <td class="text-center"><input type="text" ${!isAppend ? "disabled='disables'" : ""} class="form-control first" data-name="codePage" value="${data.codePage|| ""}" /></td>
                    <td class="text-center"><input type="text" ${!isAppend ? "disabled='disables'" : ""} class="form-control first" data-name="name" value="${data.name || ""}" /></td>
                    <td class="text-center"><input type="text" class="form-control first" data-name="cname" value="${data.cname || ""}" /></td>
                    <td class="text-center"><input type="text" ${!isAppend ? "" : ""} class="form-control first" data-name="arguments" value="${data.arguments || ""}" /></td>
                    <td class="text-center">${this.renderSpan(data.detail,isAppend)}</td>
                    <td><span class="del"  ${!isAppend ? "style='display:none'" : ""}>X</span></td>
                </tr>`
        isAppend && this.$tbody.append(html);
        return html;
    }
    this.renderSpan = function (data = []) {
        var buildData = ["", "", "", "", "", "", "", "", "", ""]
        data.forEach(item => {
            var position = item["idPosition"] - 1,
                value = item["value"],
                type = item["type"];
            buildData[position] = {
                value: value,
                type: type
            }
        })
        var html = "";
        buildData.forEach(item => {
            html += `<input class="changeListenSpan" value="${item.value?item.value:""}" data-type="${item.type?"id":"id"}"></input>`
        })
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
       
        //     treeData = await new ArrayToTree().getTreeData();
        // queryData = await new ArrayToTree().getDataByposition(4, ["G", "", "", ""], treeData)

        if (!DataType.isObject(listens)) return alert("获取特殊布局文件失败！");
        var html = '',
            that = this;
        that.listens = listens;
        Object.keys(listens).forEach(listen => {
            var obj = {
                name: listen,
                codePage: listens[listen]["codePage"],
                cname: listens[listen]["cname"],
                arguments: listens[listen]["argumentsNumber"],
                detail: listens[listen]["detail"],
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
            $tr.find('.first').each(function () {
                var $input = $(this),
                    type = $input.data('name'),
                    value = $input.val();
                obj[type] = value;
            })
            obj.detail = []
            $tr.find(".changeListenSpan").each(function (index) {
                var $input = $(this),
                    value = $input.val(),
                    type = $input.data("type");
                if (value) {
                    obj.detail.push({
                        type: type,
                        idPosition: index + 1,
                        value: value
                    })
                }
            })


            data[obj.name].cname = obj.cname;
            data[obj.name].argumentsNumber = obj.arguments
            data[obj.name].codePage = obj.codePage,
            data[obj.name].detail = obj.detail
        })
        new FileService().writeFile("./profiles/listen.json", JSON.stringify(data))
    },
    execute: function () {
        this.basicEvents(true, this.initData, this.saveData)
    }
}