function Propertybar($container) {
    this.$container = $container;
}

Propertybar.prototype = {
    init: function (isPM, suffix) {
        isPM = !!isPM;
        suffix = suffix || "";
        var that = this,
            result = new CommonService().getFileSync("/profile/propertybar.json");
        if (!result) return;

        var data = result;
        if (isPM) {
            data = that.getPM(result);
        }
        html = that.render(data, suffix);
        that.$container.empty().append(html);
    },
    render: function (data, suffix) {
        if (!Array.isArray(data)) return;

        suffix = suffix || "";
        var html = "";
        data.forEach(function (item, index) {
            var name = item.name,
                value = item.value + suffix,
                id = value + "_property",
                expand = index === 0 ? ' aria-expanded="true"' : "",
                collapse = index === 0 ? "collapse in" : "collapse";

            html += '<div class="property-group" data-first-filter="' + value + '">' +
                '<header class="property-header" data-toggle="collapse" data-target="#' + id + '"' + expand + '>' +
                '<span class="property-toggle"></span><h4 class="property-title">' + name + '</h4></header>' +
                '<div class="property-body ' + collapse + '" id="' + id + '">' +
                '<table class="property-table">';

            var tbody = "";
            item.items.forEach(function (jitem, jindex) {
                var jname = jitem.name,
                    jvalue = jitem.value.replace(".", "_") + suffix,
                    jid = "property_" + jvalue,
                    wclass = !!jitem.isPM ? "w70" : "w75",
                    dataType = ' data-dataType="' + (jitem.dataType || "String") + '"',
                    attrOrStyle = jitem.attrOrStyle ? ' data-attrOrStyle="' + jitem.attrOrStyle + '"' : "",
                    readonly = !!jitem.readonly ? ' readonly="readonly"' : "",
                    disabled = !!jitem.disabled ? ' disabled="disabled"' : "",
                    attaches = dataType + attrOrStyle + readonly + disabled,
                    modal = ' data-toggle="modal" data-target="#' + jvalue + '_modal"',
                    control = "";
                switch (jitem.controlType) {
                    case "textbox":
                        control = '<input id="' + jid + '" type="text"' + attaches + '>';
                        break;
                    case "select":
                        var $select = $('<select id="' + jid + '"' + attaches + '></select>');
                        Common.fillSelect($select, null, jitem.items, null, false);
                        control = $select.get(0).outerHTML;
                        break;
                    case "checkbox":
                        control = '<input id="' + jid + '" type="checkbox"' + attaches + '>';
                        break;
                    case "textbox_expr":
                        control = '<input class="' + wclass + '" id="' + jid + '" type="text"' + attaches + '>' +
                            '<button class="btn btn-default btn-xs btn-config btn-expr">E</button>';
                        break;
                    case "textbox_btn":
                        control = '<input class="' + wclass + '" id="' + jid + '" type="text"' + attaches + '>' +
                            '<button class="btn btn-default btn-xs"' + modal + disabled + '>…</button>';
                        break;
                    case "textarea_btn":
                        control = '<textarea class="' + wclass + '" id="' + jid + '" ' + attaches + '></textarea>' +
                            '<button class="btn btn-default btn-xs"' + modal + disabled + '>…</button>';
                        break;
                    default:
                        control = '<input id="' + jid + '" type="text"' + attaches + '>';
                        break;
                }
                tbody += '<tr data-second-filter="' + jvalue + '">' +
                    '<td><label for="' + jid + '">' + jname + '</label></td>' +
                    '<td>' + control + '</td>' +
                    '</tr>';
            });

            html += tbody + '</table></div></div>';
        });
        return html;
    },
    getPM: function (data) {
        return data.filter(function (item) {
            if (!!item.isPM) {
                item.items = item.items.filter(function (jitem) {
                    return !!jitem.isPM;
                });
                return true;
            } else return false;
        });
    }
};