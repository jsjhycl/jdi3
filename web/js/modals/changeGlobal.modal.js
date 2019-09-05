function ChangeGlobal($modal) {
    BaseModal.call(this, $modal);
    this.$globaltbody = $modal.find("#gLobalVariable tbody");
    this.$localVariable = $modal.find("#localVariable tbody")
    this.NAME_SPACE = ".CHANGEGLOBAL";
    this.path = "./profiles/global.json";
    this.renderTr = function (key, value, isAppend, appendTo) {
        isAppend = !!isAppend;
        var html = `<tr>
                    <td><input type="text" class="form-control" value="${key || ""}" /></td>
                    <td><input type="text" class="form-control" value="${value || ""}" /></td>
                    <td><span class="del">X</span></td>
                </tr>`
        isAppend && appendTo.append(html);
        return html;
    }
    this.data = {};
}

ChangeGlobal.prototype = {
    initData: async function () {
        var that = this;
        that.$modal.find(".global").click()
        that.data = await new FileService().readFile(that.path);
        this.clear();
        var data = that.data.global,
            target = that.$globaltbody;
        this.setData(target, data);
        this.bindEvents();
    },

    clear: function () {
        var that = this;
        that.$modal.off(this.NAME_SPACE)
        that.$globaltbody.empty()
        that.$localVariable.empty()
    },

    setData: function ($target, data) {
        var that = this;
        if (!DataType.isArray(data)) return;
        var html = "";
        data.forEach(item => {
            html += that.renderTr(item.key, item.desc)
        });
        $target.html(html);
    },

    saveData: function () {
        var that = this,
            save = [],
            type = that.$modal.find(".nav .active a").text(),
            $target = type == "全局" ? that.$globaltbody : that.$localVariable,
            typeId = type == "局部" ? $("#workspace").attr("data-id") : "global";
        $target.find("tr").each((trIndex,trEle)=>{
            save.push({
                key:$(trEle).find("input:first").val(),
                desc:$(trEle).find("input:last").val(),
                value:""
            })
            
        })
        that.data[typeId] = save
        new FileService().writeFile(that.path, JSON.stringify(that.data))
    },

    bindEvents: function () {
        var that = this;
        that.$modal.on('click' + that.NAME_SPACE, ".globalAdd", function () {
            that.renderTr('', '', true, that.$globaltbody);
        });
        that.$modal.on('click' + that.NAME_SPACE, ".localadd", function () {
            that.renderTr('', '', true, that.$localVariable);
        });
        that.$modal.on('click' + that.NAME_SPACE, ".del", function () {
            $(this).parents('tr').remove();
        });
        that.$modal.on("click" + that.NAME_SPACE, "a", function (e) {
            e.preventDefault()
            var type = $(this).text(),
                typeId = type == "局部" ? $("#workspace").attr("data-id") : "global",
                target = type == "局部" ? that.$localVariable : that.$globaltbody;
            typeId && that.setData(target, that.data[typeId])
            $(this).tab('show')
        })
    },

    execute: function () {
        this.basicEvents(true, this.initData, this.saveData)
    }
}