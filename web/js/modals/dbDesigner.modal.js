/**
 * 数据库设计配置
 * @param $modal
 * @constructor
 */
function DbDesignerModal($modal) {
    BaseModal.call(this, $modal, null);//绑定基础弹窗

    this.$dbDesigner = this.$modalBody.find("#dbDesigner");//获取数据库设计器
}

DbDesignerModal.prototype = {
    initData: function () {
        var that = this;
        new Db().getTables(false, function (tables) {//实例化Db.调用getTables
            that.$dbDesigner.dbDesigner({//调用jquery的扩展方法
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
                getProperty: new Property().getProperty//吧property的getproperty方法赋值给getProperty
            });
        });
    },
    saveData: function () {
        var that = this,
            data = that.$dbDesigner.dbDesigner("getData");//调用getData方法
        if (!Array.isArray(data)) return alert("无效的数据类型！");//如果data不是数组退出函数提示

        var property = new Property();//实例化property
        data.forEach(function (item) {//遍历data
            if (!item.isSave) return true;//如果issave为false退出函数
            
            property.setValue(item.id, "db", {//调用property的setValue方法
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
        that.basicEvents(null, that.initData, that.saveData, null);//绑定基础事件
    }
};