function ChangeGlobal($modal) {
    BaseModal.call(this, $modal);
    this.$globaltbody = $modal.find("#gLobalVariable tbody");
    this.$localVariable = $modal.find("#localVariable tbody");
    this.$customizeVariable = $modal.find("#customizeVariable tbody");
    this.NAME_SPACE = ".CHANGEGLOBAL";
    this.path = "./profiles/global.json";
    this.renderTr = function (key, value, isAppend, appendTo) {
        isAppend = !!isAppend;
        var html = `<tr>
                <td><input type="text" class="form-control" data-save="key" value="${key || ""}" /></td>
                <td><input type="text" class="form-control" data-save="desc" value="${value || ""}" /></td>
                <td><span class="del">X</span></td>
                </tr>`
        isAppend && appendTo.append(html);
        return html;
    }
    this.renderCustomTr = function (key, desc, propertyData, propertyQuery, propertyHandle, propertyRender, isAppend, appendTo) {
        isAppend = !!isAppend;
        var html = `<tr>
                        <td class="text-center"><input type="text" data-save="key" class="form-control" value="${key || ''}" ></td>
                        <td class="text-center"><input type="text" data-save="desc" class="form-control" value="${desc || ''}"></td>
                        <td class="text-center"><input type="text" data-save="propertyData" class="form-control" disabled="disabled" value='${propertyData || ''}'></td>
                        <td class="text-center"><input type="text" data-save="propertyQuery" class="form-control" disabled="disabled" value='${propertyQuery || ''}'></td>
                        <td class="text-center"><input type="text" data-save="propertyHandle" class="form-control" disabled="disabled" value='${propertyHandle || ''}'></td>
                        <td class="text-center"><input type="text" data-save="propertyRender" class="form-control" disabled="disabled" value='${propertyRender || ''}'></td>
                        <td class="text-center"><span class="del">X</span></td>                
                    </tr>`
        isAppend && appendTo.append(html)
        return html
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
        that.$customizeVariable.empty()
    },

    setData: function ($target, data, type) {
        var that = this;
        if (!DataType.isArray(data)) return;
        var html = "";
        data.forEach(item => {
            if (type == "自定义变量") {
                html += that.renderCustomTr(item.key, item.desc, item.propertyData, item.propertyQuery, item.propertyHandle, item.propertyRender)
            } else {
                html += that.renderTr(item.key, item.desc)
            }
        });
        $target.html(html);
    },
    getTableData: function ($target, type) {
        var result = [];
        $target.find("tr").each(function () {
            var obj = {}
            $(this).find("input").each(function () {
                var key = $(this).attr("data-save"),
                    value = $(this).val();
                obj[key] = value
            })
            if (type == "自定义变量") {
                if (obj.key && obj.desc) {
                    result.push(obj)
                }
            } else {
                if (obj.key && obj.desc){
                    result.push(obj)
                }
            }
            // if (!$(trEle).find("input:first").val() || !$(trEle).find("input:last").val()) return;
            // result.push({
            //     key: $(trEle).find("input:first").val(),
            //     desc: $(trEle).find("input:last").val(),
            //     value: ""
            // })

        })
        return result;
    },

    saveData: function () {
        var that = this,
            type = that.$modal.find(".nav .active a").text();
        if (type == "全局变量" || type == "局部变量") {
            var $target = type == "全局变量" ? that.$globaltbody : that.$localVariable,
                typeId = type == "局部变量" ? $("#workspace").attr("data-id") : "global",
                result = that.getTableData($target, type);
            that.data[typeId] = result;
            console.log(that.data)

            new FileService().writeFile(that.path, JSON.stringify(that.data))
            // new FileService().writeFile(that.path, JSON.stringify(str))
        }
        if (type == "自定义变量") {
            $target = that.$customizeVariable;
            result = that.getTableData($target, type);
            if (!GLOBAL_PROPERTY.BODY) {
                GLOBAL_PROPERTY.BODY = {}
            }
            GLOBAL_PROPERTY.BODY.customVariable = result;
        }

        // $target.find("tr").each((trIndex, trEle) => {
        //     if (!$(trEle).find("input:first").val() || !$(trEle).find("input:last").val()) return;
        //     save.push({
        //         key: $(trEle).find("input:first").val(),
        //         desc: $(trEle).find("input:last").val(),
        //         value: ""
        //     })

        // })

    },

    bindEvents: function () {
        var that = this;
        that.$modal.on('click' + that.NAME_SPACE, ".globalAdd", function () {
            that.renderTr('', '', true, that.$globaltbody);
        });
        that.$modal.on('click' + that.NAME_SPACE, ".localadd", function () {
            that.renderTr('', '', true, that.$localVariable);
        });
        that.$modal.on('click' + that.NAME_SPACE, ".customizeadd", function () {
            that.renderCustomTr("", "", "", "", "", "", true, that.$customizeVariable)
        })
        that.$modal.on('click' + that.NAME_SPACE, ".del", function () {
            $(this).parents('tr').remove();
        });
        that.$modal.on("click" + that.NAME_SPACE, "a", function (e) {
            e.preventDefault()
            var type = $(this).text();
            if (type == "局部变量" || type == "局部变量") {
                var typeId = type == "局部变量" ? $("#workspace").attr("data-id") : "global",
                    target = type == "局部变量" ? that.$localVariable : that.$globaltbody;
                typeId && that.setData(target, that.data[typeId])
            } else {
                data = GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable;
                that.setData(that.$customizeVariable, data, "自定义变量")
            }
            $(this).tab('show')
        })
    },

    execute: function () {
        this.basicEvents(true, this.initData, this.saveData)
    }
}