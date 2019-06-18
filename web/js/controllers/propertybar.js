function Propertybar($container) {
    this.$container = $container;
}

Propertybar.prototype = {
    init: function (isPM, suffix) {
        isPM = !!isPM;//对isPM转换为正则
        suffix = suffix || "";//如果suffix存在则用suffix否则为空
        var that = this,
            result = new CommonService().getFileSync("/profile/propertybar.json");//实例化CommonService调用getFileSync方法
        if (!result) return;//如果没有退出函数

        var data = result;
        if (isPM) {//如果是PM为true
            data = that.getPM(result);//调用getPM返回true或false
        }
        html = that.render(data, suffix);//调用render函数
        that.$container.empty().append(html);//把html插入到$container
    },
    render: function (data, suffix) {
        if (!Array.isArray(data)) return;//如过data不是数组退出函数

        suffix = suffix || "";//suffix有值 就用suffix否则为空
        var html = "";
        data.forEach(function (item, index) {//遍历data
            var name = item.name,//把name赋值到name对应属性栏的title
                value = item.value + suffix,//itemvalue+suffix赋值到value上
                id = value + "_property",//吧value加_property赋值到id
                expand = index === 0 ? ' aria-expanded="true"' : "",//index等于0则把aria-expanded="true"赋值到expand控制属性栏的折叠
                collapse = index === 0 ? "collapse in" : "collapse";//如果index等于0 collapse in赋值给collapse

            html += '<div class="property-group" data-first-filter="' + value + '">' +
                '<header class="property-header" data-toggle="collapse" data-target="#' + id + '"' + expand + '>' +
                '<span class="property-toggle"></span><h4 class="property-title">' + name + '</h4></header>' +
                '<div class="property-body ' + collapse + '" id="' + id + '">' +
                '<table class="property-table">';//生成html

            var tbody = "";
            item.items.forEach(function (jitem, jindex) {//遍历item下面的items
                var jname = jitem.name,//把遍历的name赋值 对应属性的名
                    jvalue = jitem.value.replace(".", "_") + suffix,//把.变化成_添加suffix赋值给jvalue
                    jid = "property_" + jvalue,//property_+jvalue赋值给jid
                    wclass = !!jitem.isPM ? "w70" : "w75",//判断jitem中的isPM是否为真为真是wclass赋值为w70否则赋值为w75
                    dataType = ' data-dataType="' + (jitem.dataType || "String") + '"',//判断jitem中的dataType是否存在存在 存在就用dataType否则用string
                    attrOrStyle = jitem.attrOrStyle ? ' data-attrOrStyle="' + jitem.attrOrStyle + '"' : "",//jitem.attrOrStyle是否存在存在赋值data-attrOrStyle=jitem.attrOrStyle否则为空
                    readonly = !!jitem.readonly ? ' readonly="readonly"' : "",//判断jitem.readonly是否存在 存在赋值readonly="readonly" 否则为空
                    disabled = !!jitem.disabled ? ' disabled="disabled"' : "",//判断jitem.disabled是否存在 存在赋值disabled="disabled"否则为空
                    attaches = dataType + attrOrStyle + readonly + disabled,
                    modal = ' data-toggle="modal" data-target="#' + jvalue + '_modal"',
                    control = "";
                switch (jitem.controlType) {//判断controlType的类型
                    case "textbox"://为文本输入框时
                        control = '<input id="' + jid + '" type="text"' + attaches + '>';//赋值html
                        break;
                    case "select"://为下拉框时
                        var $select = $('<select id="' + jid + '"' + attaches + '></select>');
                        Common.fillSelect($select, null, jitem.items, null, false);
                        control = $select.get(0).outerHTML;//赋值html
                        break;
                    case "checkbox"://为复选框
                        control = '<input id="' + jid + '" type="checkbox"' + attaches + '>';//赋值html
                        break;
                    case "textbox_expr"://为表达式配置
                        control = '<input class="' + wclass + '" id="' + jid + '" type="text"' + attaches + '>' +
                            '<button class="btn btn-default btn-xs btn-config btn-expr">E</button>';//赋值html
                        break;
                    case "textbox_btn"://textbox_btn
                        control = '<input class="' + wclass + '" id="' + jid + '" type="text"' + attaches + '>' +
                            '<button class="btn btn-default btn-xs"' + modal + disabled + '>…</button>';//赋值html
                        break;
                    case "textarea_btn"://为textarea_btn
                        control = '<textarea class="' + wclass + '" id="' + jid + '" ' + attaches + '></textarea>' +
                            '<button class="btn btn-default btn-xs"' + modal + disabled + '>…</button>';//赋值html
                        break;
                    default://默认情况
                        control = '<input id="' + jid + '" type="text"' + attaches + '>';
                        break;
                }
                tbody += '<tr data-second-filter="' + jvalue + '">' +
                    '<td><label for="' + jid + '">' + jname + '</label></td>' +
                    '<td>' + control + '</td>' +
                    '</tr>';//生成html
            });

            html += tbody + '</table></div></div>';//生成html
        });
        return html;//返回html
    },
    getPM: function (data) {
        return data.filter(function (item) {//data进行过滤
            if (!!item.isPM) {//如果item中的isPM存在
                item.items = item.items.filter(function (jitem) {//遍历item中的items中
                    return !!jitem.isPM;//退出函数
                });
                return true;//退出函数
            } else return false;//退出函数
        });
    }
};