/**
 * 数据库设计配置
 * @param $modal
 * @constructor
 */
function DbDesignerModal($modal) {
    BaseModal.call(this, $modal, null); //绑定基础弹窗
    this.AllDbName = {}

    this.NAME_SPACE = ".dbDesigner"

    this.$dbDesigner = this.$modalBody.find("#dbDesigner"); //获取数据库设计器
    this.$keyInfo = this.$modalBody.find("#keyInfo")
    this.$modal = $modal;

    this.$db = $("#dbDesignerModal")
    this.bindChosen = function () {
        $(".chosen").chosen({
            no_results_text: "没有找到想要的数据",
            search_contains: true,
            allow_single_deselect: true,
            width: "100%"
        })
    }
    this.setData = function (rowIndex, columnIndex, key, type) {
        var that = this;
        var $tbody = that.$db.find(".dbdesigner tbody");
        var $tr = $tbody.find("tr")
        $tr.each(function (index, item) {
            if (index > columnIndex) {
                if (!$(this).find('[data-key="isSave"]').is(":checked")) {
                    $(this).find(`td:eq(${rowIndex}) select`).val(key).trigger("change")
                    if (type == "field") {
                        var value = $(this).find('[data-key="id"]').val()
                        $(this).find(`td:eq(${rowIndex}) select`).val(value).trigger("change")
                    }
                }

            }
        })
    }
    //渲染配置数据入库主键设置
    this.renderKeyInfo = function (dbName, tableName, key, value, isAppend, appendTo) {
        var that = this;
        isAppend = !!isAppend;
        // var html = `<tr>
        //     <td><input type="text" class="form-control" data-save="dbName" value="${dbName||""}"></td>
        //     <td><input type="text" class="form-control" data-save="tableName" value="${tableName||""}"></td>
        //     <td><input type="text" class="form-control" data-save="key" value="${key||""}"></td>
        //     <td><input type="text" class="form-control" data-save="value" value="${value||""}"></td>
        //     <td class="text-center"><span class="del">X</span></td>
        // <select class="form-control chosen" data-save="dbName" value="${dbName||""}">
        //                         ${that.renderOptions('dbName',item)}
        //                     </select>
        //  <select class="form-control chosen" data-save="tableName" value="${tableName||""}">
        //                         ${that.renderOptions('table',item)}
        //                     </select>
        // </tr>`;
        var item = {
            dbName: dbName,
            table: tableName,
            field: key
        }
        var html = `<tr>
                        <td>
                            <select class="form-control" data-save="dbName" disabled value="${dbName || ""}">
                                ${that.renderOptions('dbName', item)}
                            </select>
                        </td>
                        <td>
                          <select class="form-control" data-save="tableName" disabled value="${tableName || ""}">
                                ${that.renderOptions('table', item)}
                            </select>
                        </td>
                        <td>
                            <select class="form-control" data-save="key" value="${key || ""}">
                                ${that.renderOptions('field', item)}
                            </select>
                        </td>
                        <td>
                            <select class="form-control" data-save="value" value="${value || ""}">
                                ${that.renderValueSelect(value)}
                            </select>
                        </td>
                    </tr>`;
        isAppend && appendTo.append(html)
        return html
    }
    this.renderOptions = function (type, data) {
        var that = this,
            dbList = that.AllDbName,
            result = new BuildTableJson().getOptions(dbList, type, data);
        if (!Array.isArray(result)) return;
        var html = '',
            selected = data[type];
        result.unshift({
            name: "请选择",
            value: ""
        });
        result.forEach(function (item) {
            html += `<option value="${item.value}" ${selected == item.value ? "selected" : ""}>${item.name} ${item.value ? "(" + item.value + ")" : ""}</option>`
        })
        return html


    }
    this.renderValueSelect = function (selected) {
        var that = this,
            data = [{
                name: "请选择",
                value: ""
            }];
        $("#workspace").find("input").each(function () {
            var obj = {},
                id = $(this).attr("id");
            cname = new Property().getValue(id, 'cname');
            obj.name = cname,
                obj.value = id;
            data.push(obj)
        })
        return that.renderOptionsByData(data, selected)

    }

    this.renderOptionsByData = function (data, select) {
        var html = "";
        if (!select) {

            data.forEach(function (item) {
                html += `<option value="${item.value}" >${item.name} ${item.value ? "(" + item.value + ")" : ""}</option>`
            })
        } else {
            data.forEach(function (item) {
                html += `<option value="${item.value}" ${select == item.value ? "selected" : ""}>${item.name} ${item.value ? "(" + item.value + ")" : ""}</option>`
            })
        }
        return html;
    }
    this.getKeyInfo = function () {
        var that = this,
            result = [],
            $target = that.$keyInfo.find("tbody tr");
        $target.each((trIndx, trEle) => {
            var obj = {};
            $(trEle).find("select").each((index, ele) => {
                var type = $(ele).attr('data-save');
                if ($(ele).val()) {
                    obj[type] = $(ele).val()
                }
            })
            if (Object.keys(obj).length) {
                result.push(obj)
            }
        })
        return result;
    }
    //判断是不是有新加的表
    this.judgeNewTable = function () {
        var that = this,
            data = that.$dbDesigner.dbDesigner("getData"),
            saveInfo = [],
            keyInfo = that.getKeyInfo();
        //得到指定的数组
        data.forEach(item => {
            if (item.isSave) {
                if (item.dbName && item.table) {
                    saveInfo.push(JSON.stringify({
                        dbName: item.dbName,
                        tableName: item.table
                    }))
                }
            }
        })

        var saveData = Array.from(new Set(saveInfo)),
            keyData = [];

        keyInfo.forEach(item => {
            var keyObj = {
                dbName: item.dbName,
                tableName: item.tableName
            }
            keyData.push(JSON.stringify(keyObj))
        })
        if (keyData.length > saveData.length) {
            keyData.forEach((item, index) => {
                if (!saveData.includes(item)) {
                    that.$keyInfo.find("tbody tr").eq(index).remove()
                }
            })

        }
        if (keyData.length = saveData.length) {
            keyData.forEach((item, index) => {
                if (!saveData.includes(item)) {
                    that.$keyInfo.find("tbody tr").eq(index).remove()
                }
            })
            saveData.forEach(item => {
                if (!keyData.includes(item)) {
                    var obj = JSON.parse(item)
                    that.renderKeyInfo(obj.dbName, obj.tableName, "", "", true, that.$keyInfo.find("tbody"))
                }
            })
        }
        if (saveData.length > keyData.length) {
            saveData.forEach(item => {
                if (!keyData.includes(item)) {
                    var obj = JSON.parse(item)
                    that.renderKeyInfo(obj.dbName, obj.tableName, "", "", true, that.$keyInfo.find("tbody"))
                }
            })
        }



    }
}

DbDesignerModal.prototype = {
    initData: async function () {
        var that = this;

        // var dbList = await new FileService().readFile("./profiles/table.json", 'utf-8') || {},
        var dbList = await new BuildTableJson().get(),
            dbList = new BuildTableJson().removeData(dbList), //移除一些不要的数据
            dbNames = [],
            property = new Property(),
            savekeyInfo = property.getValue("BODY", "keyInfo"),
            html = "";
        that.AllDbName = dbList;

        //填充主键配置信息
        savekeyInfo && savekeyInfo.forEach(item => {
            html += that.renderKeyInfo(item.dbName, item.tableName, item.key, item.value, false, false)
        })
        that.$keyInfo.find('tbody').html(html)

        Object.keys(dbList).forEach(function (item) {
            dbNames.push({
                "name": item,
                "value": item
            })
        })
        // that.$dbDesigner.ownSaveDesigner({
        //     disabled: false,
        //     $elems: $("#workspace").find("input"),
        //     thead: [{
        //             name: "id",
        //             text: "编号",
        //             key: "id",
        //             template: function (value) {
        //                 return '<input class="form-control" data-key="id" style="width:80px" type="text" value="' + value + '" readonly>';
        //             }
        //         },
        //         {
        //             name: "cname",
        //             text: "中文名",
        //             key: "cname",
        //             template: function (value) {
        //                 return '<input class="form-control" data-key="cname" style="width:90px" type="text" value="' + value + '" readonly>';
        //             }
        //         }, {
        //             name: "isSave",
        //             text: "是否入库",
        //             key: "db.isSave",
        //             group: true,
        //             hasCheckbox: true,
        //             template: function (value) {
        //                 var isChecked = !!value ? " checked" : "";
        //                 return '<input data-key="isSave" type="checkbox"' + isChecked + '>';
        //             }
        //         }, {
        //             name: "dbName",
        //             text: "数据库名",
        //             key: "db.dbName",
        //             group: true,
        //             template: function (value) {
        //                 var $select = $('<select class="form-control chosen" data-key="dbName"></select>')
        //                 Common.fillSelect($select, {
        //                     name: "请选择库",
        //                     value: ""
        //                 }, dbNames, value, true)
        //                 return $select.get(0).outerHTML;
        //             }
        //         }, {
        //             name: "table",
        //             text: "表名称",
        //             key: "db.table",
        //             group: true,
        //             template: function (value, options) {
        //                 var $select = $('<select class="form-control chosen" data-key="table"></select>');
        //                 Common.fillSelect($select, {
        //                     name: "请选择表",
        //                     value: ""
        //                 }, options, value, true);
        //                 return $select.get(0).outerHTML;
        //             }
        //         }, {
        //             name: "selectField",
        //             text: "存入字段",
        //             key: "db.field",
        //             group: true,
        //             template: function (value, options) {
        //                 var $select = $('<select class="form-control chosen" data-key="selectField"></select>');
        //                 Common.fillSelect($select, {
        //                     name: "请选择字段",
        //                     value: ""
        //                 }, options, value, true);
        //                 return $select.get(0).outerHTML;
        //             }
        //         },
        //         { //新增加
        //             name: "selectFieldSplit",
        //             text: "字段分段",
        //             key: "db.fieldSplit",
        //             group: true,
        //             template: function (value, options) {
        //                 var $select = $('<select class="form-control chosen" data-key="selectFieldSplit"></select>')
        //                 Common.fillSelect($select, {
        //                     name: "请选择第几段",
        //                     value: ""
        //                 }, options, value, true)
        //                 return $select.get(0).outerHTML;
        //             }
        //         },
        //         // {
        //         //     name: "field",
        //         //     text: "字段名称",
        //         //     key: "db.field",
        //         //     group: true,
        //         //     template: function (value) {
        //         //         return '<input class="form-control" data-key="field" type="text" value="' + value + '">';
        //         //     }
        //         // }, 
        //         {
        //             name: "desc",
        //             text: "字段描述",
        //             key: "db.desc",
        //             group: true,
        //             template: function (value) {
        //                 return '<input class="form-control" data-key="desc" type="text" style="width:90px" value="' + value + '">';
        //             }
        //         }, {
        //             name: "fieldSlice",
        //             text: "字段截取",
        //             key: "db.fieldSlice",
        //             group: true,
        //             template: function (value) {
        //                 return '<input class="form-control" data-key="fieldSlice" type="text" style="width:90px" value="' + value + '">';
        //             }
        //         }, {
        //             name: "operation",
        //             text: "操作",
        //             key: "db.op",
        //             group: true,
        //             template: function (value) {
        //                 return '<span id="dbDesignerAdd" class="add">+</span><span style="margin-left:10px" class="del" id="dbDesignerRemove" class="del">×</span>'
        //             }
        //         }
        //     ],
        //     keys:["name","cname","db"],
        //     getProperty: new Property().getProperty,
        //     dbList: dbList, //把property的getproperty方法赋值给getProperty
        //     type: "dbDesigner"
        // })
        that.$dbDesigner.dbDesigner({ //调用jquery的扩展方法
            disabled: false,
            $elems: $("#workspace").find("input"),
            thead: [{
                name: "id",
                text: "编号",
                key: "id",
                template: function (value) {
                    return '<input class="form-control" data-key="id" style="width:80px" type="text" value="' + value + '" readonly>';
                }
            },
            {
                name: "cname",
                text: "中文名",
                key: "cname",
                template: function (value) {
                    return '<input class="form-control" data-key="cname" style="width:90px" type="text" value="' + value + '" readonly>';
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
                name: "dbName",
                text: "数据库名",
                key: "db.dbName",
                group: true,
                template: function (value) {
                    var $select = $('<select class="form-control chosen" data-key="dbName"></select>')
                    Common.fillSelect($select, {
                        name: "请选择库",
                        value: ""
                    }, dbNames, value, true)
                    return $select.get(0).outerHTML;
                }
            }, {
                name: "table",
                text: "表名称",
                key: "db.table",
                group: true,
                template: function (value, options) {
                    var $select = $('<select class="form-control chosen" data-key="table"></select>');
                    Common.fillSelect($select, {
                        name: "请选择表",
                        value: ""
                    }, options, value, true);
                    return $select.get(0).outerHTML;
                }
            }, {
                name: "selectField",
                text: "存入字段",
                key: "db.field",
                group: true,
                template: function (value, options) {
                    var $select = $('<select class="form-control chosen" data-key="selectField"></select>');
                    Common.fillSelect($select, {
                        name: "请选择字段",
                        value: ""
                    }, options, value, true);
                    return $select.get(0).outerHTML;
                }
            },
            { //新增加
                name: "selectFieldSplit",
                text: "字段分段",
                key: "db.fieldSplit",
                group: true,
                template: function (value, options) {
                    var $select = $('<select class="form-control chosen" data-key="selectFieldSplit"></select>')
                    Common.fillSelect($select, {
                        name: "请选择第几段",
                        value: ""
                    }, options, value, true)
                    return $select.get(0).outerHTML;
                }
            },
            // {
            //     name: "field",
            //     text: "字段名称",
            //     key: "db.field",
            //     group: true,
            //     template: function (value) {
            //         return '<input class="form-control" data-key="field" type="text" value="' + value + '">';
            //     }
            // }, 
            {
                name: "desc",
                text: "字段描述",
                key: "db.desc",
                group: true,
                template: function (value) {
                    return '<input class="form-control" data-key="desc" type="text" style="width:90px" value="' + value + '">';
                }
            }, {
                name: "sliceTarget",
                text: "截取标记",
                key: "db.sliceTarget",
                group: true,
                template: function (value) {
                    return '<input class="form-control" data-key="sliceTarget" type="text" style="width:90px" value="' + value + '">';
                }
            }, {
                name: "fieldSlice",
                text: "字段截取",
                key: "db.fieldSlice",
                group: true,
                template: function (value) {
                    return '<input class="form-control" data-key="fieldSlice" type="text" style="width:90px" value="' + value + '">';
                }
            }, {
                name: "operation",
                text: "操作",
                key: "db.op",
                group: true,
                template: function (value) {
                    return '<span id="dbDesignerAdd" class="add">+</span><span style="margin-left:10px" class="del" id="dbDesignerRemove" class="del">×</span>'
                }
            }
            ],
            getProperty: new Property().getProperty,
            dbList: dbList, //把property的getproperty方法赋值给getProperty
            type: "dbDesigner"
        });
        var $addtr = that.$dbDesigner.find("tbody .addtr")
        $addtr.each(function () {
            $(this).find('[data-key="id"]').css("display", "none")
            $(this).find('[data-key="cname"]').css("display", "none")
            // $(this).find('[data-key="isSave"]').css("display","none")
        })
        that.bindChosen()

    },
    judgeSelect: function (data) {
        if (!Array.isArray(data)) return false;
        var result = false;
        data.forEach(item => {
            if (item.isSave) {
                if (!item.dbName || !item.table || !item.selectField) {
                    result = true
                }
            }
        })
        return result;
    },
    saveData: function () {
        var that = this,
            data = that.$dbDesigner.dbDesigner("getData"); //调用getData方法
        // console.log(data, "data")

        if (!Array.isArray(data)) return alert("无效的数据类型！"); //如果data不是数组退出函数提示
        var isSelect = that.judgeSelect(data)
        if (isSelect) { alert("当前数据选择不完全;"); return "judgeFalse" };
        var property = new Property();
        //获取信息
        var savekeyInfo = that.getKeyInfo();

        data.forEach(item => {
            property.setValue(item.id, "db", [])
        })
        GLOBAL_PROPERTY.BODY ? "" : GLOBAL_PROPERTY.BODY = {};
        GLOBAL_PROPERTY.BODY.keyInfo = savekeyInfo
        data.forEach(function (item) {
            if (!item.isSave) return true;
            var db = {
                isSave: item.isSave, //是否入库
                dbName: item.dbName, //存档数据库
                table: item.table, //存档表格
                field: item.selectField,
                fieldSplit: item.selectFieldSplit, //新增加
                desc: item.desc,
                sliceTarget: item.sliceTarget,
                fieldSlice: item.fieldSlice,
            }
            savekeyInfo.forEach(citem => {
                if (citem.dbName == item.dbName && citem.tableName == item.table) {
                    db.queryKey = citem.key
                    db.queryValue = citem.value
                }
            })

            property.pushValue(item.id, "db", db)
        })
    },
    execute: function () {
        var that = this;
        // that.$modal.on("show.bs.modal", function () {
        //     that.initData()
        // })
        // that.$modal.find(".modal-header .close").on("click", function () {
        //     that.$modal.modal("hide")
        // })
        // that.$modal.find(".modal-footer .save").on("click", function () {
        //     that.saveData()
        //     that.$modal.modal("hide")
        // })
        that.basicEvents(null, that.initData, that.saveData, null); //绑定基础事件
    },
    bindEvents: function () {
        var that = this;
        //数据库切换的时候
        that.$db.on("change" + that.NAME_SPACE, "[data-key='dbName']", function (event) {
            var $select = $(event.target).parents("tr").find('[data-key="table"]'),
                key = $(this).val(),
                AllDbName = that.AllDbName || {},
                objTableNames = Object.keys(AllDbName[key] || {}),
                arrTableNames = [],
                arr = [];

            objTableNames.forEach(item => {
                if (AllDbName[key][item]["key"] == undefined) {
                    arr.push(item)
                }
            })
            arr.forEach(function (item) {
                arrTableNames.push({
                    "name": AllDbName[key][item]["tableDesc"],
                    "value": item
                })
            })
            Common.fillSelect($select, {
                name: "请选择表",
                value: ""
            }, arrTableNames, null, true)
            $select.trigger("chosen:updated")

            var rowIndex = $(this).parent('td').index(),
                columnIndex = $(this).parents('tr').index();
            // that.setData(rowIndex,columnIndex,key)
        })

        //切换表格时
        that.$db.on("change" + that.NAME_SPACE, "[data-key='table']", function (event) {
            var $selectDbVal = $(event.target).parents("tr").find('[data-key="dbName"]').val(),
                $select = $(event.target).parents("tr").find('[data-key="selectField"]')
            key = $(this).val(),
                AllDbName = that.AllDbName || {},
                objTableNames = AllDbName[$selectDbVal][key].tableDetail,
                arrFieldsNames = [];
            objTableNames.forEach(function (item) {
                arrFieldsNames.push({
                    "name": item.cname,
                    "value": item.id
                })
            })
            Common.fillSelect($select, {
                name: "请选择字段",
                value: ""
            }, arrFieldsNames, null, true)
            $select.trigger("chosen:updated")
            that.judgeNewTable()
            var rowIndex = $(this).parent('td').index(),
                columnIndex = $(this).parents('tr').index();
            // that.setData(rowIndex,columnIndex,key)
        })

        //切换字段
        that.$db.on("change" + that.NAME_SPACE, "[data-key='selectField']", function (event) {
            var selectDbVal = $(event.target).parents("tr").find('[data-key="dbName"]').val(),
                selectTableVal = $(event.target).parents("tr").find('[data-key="table"]').val(),
                selectField = $(this).val(),
                localData = that.AllDbName || {},
                AllFields = localData[selectDbVal][selectTableVal].tableDetail,
                selectValue = "",
                fieldSplit = [];
            AllFields.forEach(function (item) {

                if (item.id == selectField) {
                    selectValue = Number(item.fieldSplit)
                }
            })
            for (var i = 1; i <= selectValue; i++) {
                fieldSplit.push({
                    name: "插入",
                    value: i
                })
            }
            var $select = $(event.target).parents("tr").find('[data-key="selectFieldSplit"]')
            Common.fillSelect($select, {
                name: "请选择第几段",
                value: ""
            }, fieldSplit, null, true)

            $select.trigger("chosen:updated")

            var rowIndex = $(this).parent('td').index(),
                columnIndex = $(this).parents('tr').index();

            // that.setData(rowIndex,columnIndex,selectField,"field")
        })
        //增加一段
        that.$db.on("click" + that.NAME_SPACE, "#dbDesignerAdd", function (event) {
            // $(this).parents("tr").addClass("tr")
            var target = $(this).parent("td").parent("tr"),
                html = target.clone(),
                html = $.extend(html, {});
            $(html).find(".chosen-container").remove()
            html.addClass("addtr")

            $(html).find('[data-key="id"]').css("display", "none")
            $(html).find('[data-key="cname"]').css("display", "none")
            // $(html).find('[data-key="isSave"]').css("display","none")
            target.after(html)
            var rowspan = Number($(this).parents('tr').find('td').eq(0).attr("rowspan"));
            var dataId = $(this).parents("tr").find('[data-key="id"]').val();
            var ids = $("#dbDesigner tbody tr td").find('[data-key="id"]')
            ids.each(function () {
                if ($(this).val() == dataId) {
                    $(this).parents('tr').find('td').eq(0).attr("rowspan", rowspan + 1)
                    $(this).parents('tr').find('td').eq(1).attr("rowspan", rowspan + 1)
                }
            })

            that.bindChosen()
        })
        //添加一条新的主键配置
        that.$db.on("click" + that.NAME_SPACE, ".savekeyInfoAdd", function () {
            that.renderKeyInfo("", "", "", "", true, that.$keyInfo.find("tbody"))
        })
        //移除一条新的主键配置
        that.$db.on("click" + that.NAME_SPACE, ".del", function () {
            $(this).parents('tr').remove()
            that.judgeNewTable()
        })
        //移除一段
        that.$db.on("click" + that.NAME_SPACE, "#dbDesignerRemove", function (event) {

            var target = $(this).parent("td").parent("tr");
            target.remove();
            var targetId = target.attr("data-id")
            // if(that.$db.find(`tr[data-id="${targetId}"]`).length==1){

            //     that.$db.find(`tr[data-id="${targetId}"]`).removeClass("tr")
            // }
            var rowspan = Number($(this).parents('tr').find('td').eq(0).attr("rowspan"));
            var dataId = $(this).parents("tr").find('[data-key="id"]').val();
            var ids = $("#dbDesigner tbody tr td").find('[data-key="id"]')
            ids.each(function () {
                if ($(this).val() == dataId) {
                    $(this).parents('tr').find('td').eq(0).attr("rowspan", rowspan - 1)
                    $(this).parents('tr').find('td').eq(1).attr("rowspan", rowspan - 1)
                }
            })



        })
        //点击是否入库
        that.$db.on("click" + that.NAME_SPACE, "[data-key='isSave']", function (evetn) {
            var id = $("#workspace").attr("data-id"), //工作区的id
                table = $.extend(that.AllDbName, {}), //所有的tablejson
                dbnames = Object.keys(table); //所有的数据库
            var $tr = $(this).parents("tr"), //点击的当前行
                $dbName = $tr.find('[data-key="dbName"]'), //数据库名
                $table = $tr.find('[data-key="table"]'), //表明
                $field = $tr.find('[data-key="selectField"]'), //字段名
                $id = $tr.find('[data-key="id"]'); //编号
            if ($(this).is(":checked")) {
                dbnames.forEach(function (item) {
                    if (table[item][id]) {
                        $dbName.val(item).trigger("change").trigger("chosen:updated")
                        $table.val(id).trigger("change").trigger("chosen:updated")
                        $field.val($id.val()).trigger("change").trigger("chosen:updated")
                    }
                })
            } else {
                $dbName.val("")
                $table.val("")
                $field.val("")
                $dbName.trigger("chosen:updated")
                $table.trigger("chosen:updated")
                $field.trigger("chosen:updated")
            }
            that.judgeNewTable()

        })

        //点击全部入库
        that.$db.on("click" + that.NAME_SPACE, "thead th .check-all", function () {
            var rowIndex = $(this).parent('th').index();
            var $tbody = that.$db.find(".dbdesigner tbody");
            var $tr = $tbody.find("tr");
            var isChecked = $(this).is(":checked")
            $tr.each(function () {
                var $checkbox = $(this).find(`td:eq(${rowIndex}) :checkbox`);
                $checkbox.prop("checked", !isChecked).trigger("click")
            })
        })

        //鼠标悬浮上去
        that.$db.on("mouseover" + that.NAME_SPACE, "tbody tr", function () {
            var $this = $(this),
                dataId = $this.attr("data-id"),
                $target = that.$db.find(`tbody tr[data-id="${dataId}"]`);
            $target.css("background", "#eee")
        })

        //鼠标移除
        that.$db.on("mouseleave" + that.NAME_SPACE, "tbody tr", function () {
            var $this = $(this),
                dataId = $this.attr("data-id"),
                $target = that.$db.find(`tbody tr[data-id="${dataId}"]`);
            $target.css("background", "")
        })
    }
};