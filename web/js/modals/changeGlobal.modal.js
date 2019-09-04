function ChangeGlobal($modal) {
    BaseModal.call(this, $modal);
    this.$tbody = $modal.find("tbody");
    this.NAME_SPACE = ".CHANGEGLOBAL";
    this.path = "./profiles/global.json";
    this.renderTr = function (key, value, isAppend) {
        isAppend = !!isAppend;
        var html = `<tr>
                    <td><input type="text" class="form-control" value="${key || ""}" /></td>
                    <td><input type="text" class="form-control" value="${value || ""}" /></td>
                    <td><span class="del">X</span></td>
                </tr>`
        isAppend && this.$tbody.append(html);
        return html;
    }
}

ChangeGlobal.prototype = {
    initData: function () {
        this.clear();
        this.setData();
        this.bindEvents();
    },

    clear: function () {
        this.$modal.off(this.NAME_SPACE)
    },

    setData: async function () {
        var that = this;
        var data = await new FileService().readFile(that.path);
        if (!DataType.isObject(data)) return;
        var html = "";
        for (var key in data) {
            html += that.renderTr(key, data[key]);
        }
        that.$tbody.html(html);
    },

    saveData: function () {
        var that = this,
            save = {};
        this.$tbody.find("tr").each(function (trIndex, trEle) {
            save[$(trEle).find("input:first").val()] = $(trEle).find("input:last").val();
            // $(this).find("input").each((index, element) => {
            //     save[$(element).attr("data-name")] = $(element).val()
            // })
        });
        new FileService().writeFile(that.path, JSON.stringify(save))
    },

    bindEvents: function () {
        var that = this;
        that.$modal.on('click' + that.NAME_SPACE, ".add", function () {
            that.renderTr('', '', true);
        });
        that.$modal.on('click' + that.NAME_SPACE, ".del", function () {
            $(this).parents('tr').remove();
        });
    },

    execute: function () {
        this.basicEvents(true, this.initData, this.saveData)
    }
}