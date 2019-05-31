/**
 * 数据库设计配置
 * @param $modal
 * @constructor
 */
function DbDesignerModal($modal) {
    BaseModal.call(this, $modal, null);

    this.$dbDesigner = this.$modalBody.find("#dbDesigner");
}

DbDesignerModal.prototype = {
    initData: function () {
        var that = this;
        new Db().getTables(false, function (tables) {
            that.$dbDesigner.dbDesigner({
                disabled: false,
                $elems: $("#workspace").find(":input"),
                thead: [
                    {
                        name: "id",
                        text: "编号",
                        key: "id",
                        template: function (value) {
                            return '<input class="form-control" data-key="id" type="text" value="' + value + '" readonly>';
                        }
                    },
                    {
                        name: "cname",
                        text: "中文名",
                        key: "cname",
                        template: function (value) {
                            return '<input class="form-control" data-key="cname" type="text" value="' + value + '" readonly>';
                        }
                    }, {
                        name: "isSave",
                        text: "是否入库",
                        key: "db.isSave",
                        group: true,
                        hasCheckbox: true,
                        template: function (value) {
                            var isChecked = !!value ? " checked" : "";
                            return '<input data-key="isSave" type="checkbox"' + isChecked + '>';
                        }
                    }, {
                        name: "table",
                        text: "表名称",
                        key: "db.table",
                        group: true,
                        template: function (value) {
                            console.log("dbDesigner value:", value);
                            var $select = $('<select data-key="table"></select>');
                            Common.fillSelect($select, {name: "请选择表", value: ""}, tables, value, true);
                            return $select.get(0).outerHTML;
                        }
                    }, {
                        name: "field",
                        text: "字段名称",
                        key: "db.field",
                        group: true,
                        template: function (value) {
                            return '<input class="form-control" data-key="field" type="text" value="' + value + '">';
                        }
                    }, {
                        name: "desc",
                        text: "字段描述",
                        key: "db.desc",
                        group: true,
                        template: function (value) {
                            return '<input class="form-control" data-key="desc" type="text" value="' + value + '">';
                        }
                    }, {//新增加
                        name: "fieldSplit",
                        text: "字段分段",
                        key: "db.fieldSplit",
                        group: true,
                        template: function (value) {
                            return '<input class="form-control" data-key="fieldSplit" type="text" value="' + value + '">'
                        }
                    }
                ],
                getProperty: new Property().getProperty
            });
        });
    },
    saveData: function () {
        var that = this,
            data = that.$dbDesigner.dbDesigner("getData");
        if (!Array.isArray(data)) return alert("无效的数据类型！");

        var property = new Property();
        data.forEach(function (item) {
            if (!item.isSave) return true;
            
            property.setValue(item.id, "db", {
                isSave: item.isSave,
                table: item.table,
                field: item.field,
                desc: item.desc,
                fieldSplit:item.fieldSplit//新增加
            });
        });
    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, that.saveData, null);
    }
};