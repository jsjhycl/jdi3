function NewEventsModal($modal, $elemts) {
    BaseModal.call(this, $modal, $elemts)
    this.NAME_SPACE = ".EVENTS"
    //单选按钮的区分
    this.triggerRadioName = 1;
    //全局变量和局部变量
    this.GLOBAL_JSON = null;
    //客户自定义事件
    this.METHODS = null;
    this.EVENTS_DESC = null;
    this.TRIGGER_TYPE = null;
    this.FONT_FAMILY = null;
    this.FONT_SIZE = null;
    this.event = null;
    this.LINKHTML_DATA = null
    this.$eventTbody = this.$modalBody.find(".table .events_tbbody")
    //获取全局变量和局部变量
    this.GET_GLOBAL_JSON = async function () {
        let that = this,
            table = "newProducts",
            conditions = [{
                col: "status",
                value: "10"
            }],
            fields = ["customId", "name"];
        that.GLOBAL_JSON = await new Service().query(table, conditions, fields)
    }
    //获取EVENT的配置信息 
    this.GET_EVENTS_JSON = async function () {
        let that = this,
            EVENTS = await new FileService().readFile("/profiles/events.json");
        that.TRIGGER_TYPE = EVENTS.TRIGGER_TYPE;
        that.FONT_FAMILY = EVENTS.FONT_FAMILY;
        that.FONT_SIZE = EVENTS.FONT_SIZE;
    }
    //获取事件方法
    this.GET_METHODS = async function () {
        let that = this;
        that.METHODS = await new FileService().readFile("/profiles/custom_methods.json")
    }
    //获取事件描述
    this.GET_EVENTS_DESC = async function () {
        let that = this;
        that.EVENTS_DESC = await new FileService().readFile("/profiles/events_desc.json")
    }
    //获取是否有查询
    this.getQueryMethods = function (id) {
        if (!id) return;
        let that = this,
            query = new Property().getValue(id, "query");
        if (!DataType.isObject(query) || !DataType.isObject(query.db) || !query.db.type) return;
        let type = query.db.type,
            methods = {
                common: [{
                    name: "通用查询",
                    value: "commonQuery"
                }, {
                    name: '定时查询',
                    value: 'timeQuery'
                }],
                table: [{
                    name: "表格查询",
                    value: "tableQuery"
                }, {
                    name: '定时查询',
                    value: 'timeQuery'
                }]
            };
        that.METHODS = [...that.METHODS, ...methods[type]]
    }
    //获取表达式函数方法
    this.getExprMethods = function () {
        let that = this,
            exprMethods = new Property().getValue("BODY", "globalMethods");
        if (DataType.isArray(exprMethods)) {
            exprMethods.forEach(item => {
                that.METHODS.push({
                    name: item.fnCname,
                    value: item.expr
                })
            });
        }
    }
    this.renderEvents = function (event = {
        publish: {},
        subscribe: {}
    }) {
        let that = this,
            str = `<tr class="tr">
                    <td><span class="del">×</span></td>
                    <td>
                        ${ that.renderTriggerType ("radio", that.TRIGGER_TYPE, event.publish.type, that.triggerRadioName++ )}
                    </td>
                    <td>
                         ${ that.renderTriggerConditionTable( event.subscribe.conditions ) }
                    </td>
                    <td class="methods">
                        ${that.renderTriggerMethods( "checkbox", that.METHODS, event.subscribe )}
                    </td>
                    <td>
                        ${ that.renderNotify( event.subscribe.notify ) }
                        ${ that.renderSaveHTML( event.subscribe.saveHTML ) }
                        ${ that.renderChangePropertyTable( event.subscribe.property ) }
                        ${ that.renderCopySendTable( event.subscribe.copySend ) }
                        ${ that.renderLinkHTMLTable(event.subscribe.linkHtml) }
                        ${ that.renderTimeQuery(event.subscribe.timeQuery)}
                    
                    </td>
                 </tr>`;
        return str;
    }
    this.renderTimeQuery = function (timeQuery) {
        let that = this,
            queryTable = "",
            str = "",
            id = $("#property_id").val(),
            query = new Property().getValue(id, 'query');
        if (DataType.isObject(query)) {
            if (query.db.type === "common") {
                queryTable = "通用查询"
            } else if (query.db.type === "table") {
                queryTable = "表格查询"
            }
        };
        str = `<div class="condition timeQuery" ${timeQuery ? "" : 'style="display:none"' }>
                    <div style="margin: 0 20px 20px 0; display: inline-block;">
                    <span>查询频率/秒</span>
                            <input style="display: inline-block;width:100px;margin-left:10px;" type="text" data-category="queryTime" class="form-control" data-key="" value="${timeQuery && timeQuery || ""}">
                    </div>
                    <div style="margin: 0 20px 20px 0; display: inline-block;">
                            <span>查询方法</span>
                            <input style="display: inline-block;width:100px;margin-left:10px;" type="text" disabled data-category="queryTable" class="form-control" data-key="" value="${queryTable}">
                    </div>
              </div>`;
        return str;
    }
    this.renderLinkHTMLTable = function (linkHtml) {
        let that = this,
            str = "";
        str = `<div class="conditoion linkHtml"  ${linkHtml ? "" : 'style="display:none"' }>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>跳转页面</th>
                                <th>跳转参数</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${that.renderLinkHTML(linkHtml)}
                        </tbody>
                    </table>
                </div>`
        return str;
    }
    this.renderLinkHTML = function (linkHtml = {}) {
        let that = this,
            str = '';
        if (!DataType.isObject(linkHtml)) return str;

        str += `<tr>
                    <td>
                        ${ that.renderLinkHTMLSelect(linkHtml.table) }
                    </td>
                    <td>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th class="text-center">页面参数</th>
                                    <th class="text-center">参数类型</th>
                                    <th class="text-center">参数值</th>
                                    <th class="text-center"><span class="add">＋</span><th>
                                <tr>
                            </thead>
                            <tbody>
                                ${that.renderLinkHTMLParmas(linkHtml.table,linkHtml.parmas)}
                            </tbody>
                        </table>
                    </td>
                </tr>`

        return str;
    }
    this.renderLinkHTMLParmas = function (table, parmas) {

    }
    this.renderLinkHTMLSelect = function (link) {
        let that = this,
            str = `<select class="form-control"><option value="">请选择跳转页面</option>`
        that.GLOBAL_JSON.forEach(item => {
            str += `<option value="${item.customId}" ${link==item.customId? "selectd" : ""}> ${item.name}(${item.customId})</option>`
        })
        return `${str}</selectd>`;
    }
    this.renderNotify = function (notify) {
        let that = this,
            str = "";
        str = `<div class="codition notify" ${notify ? "" : 'style="display:none"' }>
                    <span>通知元素</span>
                    <input type="text" class="form-control" value="${notify||""}">
               </div>`
        return str;
    }
    this.renderSaveHTML = function (saveHTML) {
        let that = this,
            str = "";
        str = `<div class="condition saveHTML" ${saveHTML ? "" : 'style="display:none"' }>
                <span>保存文件名</span>
                <input type="text" class="form-control" style="display:inline-block;margin-left:10px;" value="${saveHTML}">
            </div>`
        return str;
    }
    this.renderTypeOfValue = function (typekey, type, selected) {
        let defaultType = {
                name: type,
                value: ""
            },
            str = `<select class="form-control" data-save = "${typekey}" data-change-operator="${typekey}">`,
            options = [defaultType, ...ConditionsHelper.typeConfig];
        options.forEach(item => {
            str += `<option value="${item.value}" ${ selected == item.value ? "selected" : ""}>${item.name}</option>`
        })
        return `${str}</select>`
    }
    this.renderCopySendConfigTypeOfValue = function (typekey, type, selected) {
        let defaultType = {
                name: "请选择操作符",
                value: ""
            },
            str = `<select class="form-control" data-save = "${typekey}">`,
            options = [defaultType, ...ConditionsHelper.getOperators(type)];
        options.forEach(item => {
            str += `<option value="${item.value}" ${ selected == item.value ? "selected" : ""}>${item.name}</option>`
        })
        return `${str}</select>`
    }
    this.renderOPeratorSelect = function (type, saveType, relyValue, selected) {
        let defalutOption = {
                name: "请选择操作符",
                value: ""
            },
            options = [defalutOption, ...ConditionsHelper.getOperators(type, relyValue)],
            str = `<select class="form-control" data-save="${saveType}" data-change="${saveType}">`;
        options.forEach(item => {
            str += `<option value="${item.value}" ${ selected==item.value ? "selected" : "" }>${item.name}</option>`
        })
        return str;
    }
    this.renderTriggerMethods = function (inputType = "checkbox", dataSource = [], subscribe = {}) {
        let that = this,
            str = "";
        if (!inputType || !DataType.isArray(dataSource)) return str;
        let checkArr = [];
        if (subscribe.copySend) checkArr.push("copySend");
        if (subscribe.property) checkArr.push("changeProperty");
        if (subscribe.notify) checkArr.push("notify");
        if (subscribe.saveHTML) checkArr.push("saveHTML");
        if (subscribe.linkHtml) checkArr.push("linkHtml")
        subscribe.query && subscribe.query.forEach(item => {
            checkArr.push(item)
        })
        subscribe.custom && subscribe.custom.forEach(item => {
            checkArr.push(item)
        })
        subscribe.exprMethods && subscribe.exprMethods.forEach(item => {
            checkArr.push(item.expression)
        })
        dataSource.forEach(item => {
            str += `<div>
                        <input type="${inputType}" value="${item.value}" ${ checkArr.indexOf(item.value)>-1 ? "checked" : "" } data-show="${item.value}">
                        <span> ${ item.name } </span>
                    </div>`
        });
        return str;
    }
    this.renderTriggerType = function (inputType = "radio", dataSource = [], checked, radioName) {
        var that = this;

        if (!inputType || !DataType.isArray(dataSource)) return;
        let str = "";
        dataSource.forEach(item => {
            str += `<div>
                        <input type="${inputType}" ${ checked == item.value ? "checked" : "" } name="${ radioName }" value="${ item.value }">
                        <span> ${ item.name } </span>
                    </div>`
        })
        return str;
    }
    this.renderTriggerConditionTable = function (conditions = []) {
        let that = this,
            str = `<table class="table table-bordered triggerCondition">
                    <thead>
                        <tr>
                            <th class="text-center">左值类型</th>
                            <th class="text-center">左数值</th>
                            <th class="text-center">操作符</th>
                            <th class="text-center">右值类型</th>
                            <th class="text-center">右数值</th>
                            <th><span class="add" data-add="renderTriggerConditionTbody">+</span></th>
                        </tr>
                    </thead>
                    <tbody>
                       ${ that.renderTriggerConditionTbody(conditions) }
                    </tbody>
               </table>`;
        return str;
    }
    this.renderChangePropertyTable = function (property) {
        let that = this,
            str = '';
        str = `<div class="condition changeProperty" ${property ? "" : 'style="display:none"' }>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th><spa class="add" data-add="renderProperty">＋</span></th>
                                <th class="text-center">元素</th>
                                <th class="text-center">字体</th>
                                <th class="text-center">尺寸</th>
                                <th class="text-center">颜色</th>
                                <th class="text-center">背景色</th>
                                <th class="text-center">可见性</th>
                                <th class="text-center">禁用</th>
                                <th class="text-center">只读</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${that.renderChangeProperty(property)}
                        </tbody>
                    </table>
              </div>`
        return str;
    }
    this.renderCopySendTable = function (copySend) {
        let that = this,
            str = `<div class="conditoion copySend" ${copySend ? "" : 'style="display:none"' }>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th ><span class="add" data-add="renderCopySendTr">+</span></th>
                                    <th class="text-center"> 抄送数据库</th>
                                    <th class="text-center"> 抄送表格</th>
                                    <th class="text-center"> 抄送条件</th>
                                    <th class="text-center"> 抄送配置</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ that.renderCopySendTr(copySend) }
                            </tbody>
                        </table>
                   </div>`;
        return str;
    }
    this.renderCopySendTr = function (copySend = [{}]) {
        let that = this,
            str = '';
        if (!DataType.isArray(copySend)) return str;
        copySend.forEach(item => {
            str += `<tr class="tr">
                        <td>
                            <span class="del">×</span>
                        </td>
                        <td>
                            ${ that.renderCopySendSelect( 'dbName', item.dbName, null, null,"请选择数据库",item.dbName) }
                        </td>
                        <td>
                            ${ that.renderCopySendSelect( 'table', item.dbName, item.table, null,"请选择抄送表",item.table) }
                        </td>
                        <td>
                            ${ that.renderCopySendConditionTable( item.conditions, item.dbName, item.table ) }
                        </td>
                        <td>
                            ${ that.renderCopySendFieldsTable( item.dbName, item.table, item.fields) }
                        </td>
                    </tr>`
        })
        return str;
    }
    this.renderCopySendConditionTable = function (conditions, dbName, table) {
        let that = this,
            str = '';
        str = `<table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>字段</th>
                            <th>操作符</th>
                            <th>数据类型</th>
                            <th>数据</th>
                            <th><span class="add" data-add="renderCopySendCondition">＋</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${that.renderCopySendCondition(conditions,dbName,table)}
                    </tbody>
               </table>`
        return str;
    }
    this.renderCopySendCondition = function (conditions = [{}], dbName, table) {
        let that = this,
            str = "";
        if (!DataType.isArray(conditions)) return str;
        conditions.forEach(item => {
            str += `<tr class="tr">
                        <td>
                            ${ that.renderCopySendSelect( 'field', dbName, table, item.field, "请选择抄送列" ,item.field) }
                        </td>
                        <td>
                            ${ that.renderCopySendConfigTypeOfValue("condition_operator",1,item.operator) }
                        </td>
                        <td>
                            ${ that.copySendConfigTypeOfValue("condition_type",item.type)}
                        </td>
                        <td>
                           <input type="text" class="form-control" value="${item.value||""}">
                        </td>
                        <td>
                            <span class="del">×</span>
                        </td>
                    </tr>`
        })
        return str;
    }
    this.renderCopySendFieldsTable = function (dbName, table, fields) {
        let that = this,
            str = "";
        str = `<table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>抄送列</th>
                            <th>抄送段</th>
                            <th>数据类型</th>
                            <th>元素</th>
                            <th>运算符</th>
                            <th><span class="add" data-add="renderCopySendConfig">＋</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ that.renderCopySendConfig( dbName, table, fields) }
                    </tbody>
               </table>`;
        return str;
    }
    this.renderCopySendConfig = function (dbName, table, fields = [{
        value: {}
    }]) {
        let that = this,
            str = "";
        if (!DataType.isArray(fields)) return str;
        fields.forEach(item => {
            str += `<tr clas="tr">
                        <td>
                            ${ that.renderCopySendSelect( 'field', dbName, table, item.field, "请选择抄送列" ,item.field) }
                        </td>
                        <td>
                            ${ that.renderCopySendSelect( 'field', item.dbName, item.table, item.fieldSplit, "请选择抄送段", item.fieldSplit) }
                        </td>
                        <td>
                            ${ that.copySendConfigTypeOfValue("value_type",item.value.type)}
                        </td>
                        <td>
                            <input type="text" class="form-control" value="${item.element||""}"></input>
                        </td>
                        <td>
                            ${that.renderOPeratorSelect(3, "value_operator", item.value.type, item.value.operator)}
                        </td>
                        <td>
                            <span class="del">×</span> 
                        </td>
                    </tr>`
        })
        return str;
    }
    this.copySendConfigTypeOfValue = function (savekey, selected) {
        let str = `<select class="form-control" data-save = "${savekey}">`,
            options = ConditionsHelper.copySendConfig;
        options.forEach(item => {
            str += `<option value="${item.value}" ${ selected == item.value ? "selected" : ""}>${item.name}</option>`
        })
        return `${str}</select>`
    }
    this.renderCopySendSelect = function (type, dbName, table, field, defalutOption, selected) {
        let that = this,
            data = that.getCopySendSelectData(type, dbName, table, field),
            str = `<select class="form-control" data-save="${type}"><option value="">${defalutOption}</option>`;
        data.forEach(item => {
            str += `<option value="${item.value}" ${ selected==item.value? "selected" : ""}>${item.name}(${item.value})</option>`
        })
        return str;
    }
    this.getCopySendSelectData = function (type, dbName, table, field) {
        let obj = {
            dbName: [],
            table: [],
            field: [],
            fieldSplit: []
        }
        Object.keys(AllDbName).forEach((item) => {
            obj["dbName"].push({
                name: item,
                value: item
            })
        })
        if (type == "table" && dbName) {
            Object.keys(AllDbName[dbName]).forEach(function (item) {
                obj[type].push({
                    name: AllDbName[dbName][item].tableDesc,
                    value: item
                })
            })
        }
        if (type == "field" && dbName && table) {
            AllDbName[dbName][table].tableDetail.forEach(function (item) {
                obj[type].push({
                    name: item.cname,
                    value: item.id
                })
            })
        }
        if (type == "fieldSplit" && dbName && table && field) {
            AllDbName[dbName][table].tableDetail.forEach(function (item) {
                if (item.id == field) {
                    for (var i = 1; i <= item.fieldSplit; i++) {
                        obj[type].push({
                            name: "插入",
                            value: i
                        })
                    }
                }
            })
        }
        return obj[type];
    }
    this.renderChangeProperty = function (property = {}) {
        let that = this,
            str = "";
        if (!DataType.isObject(property)) return str;
        let ids = Object.keys(property),
            propertys = [];
        ids.forEach(item => {
            let propertyObj = {};
            propertyObj.id = item;
            property[item].forEach(citem => {
                propertyObj[citem.name] = citem.value;
            })
            propertys.push(propertyObj)
        })
        str = that.renderProperty(propertys)
        return str;
    }
    this.renderProperty = function (propertys = [{
        "visibility": true
    }]) {
        let that = this,
            str = "";
        if (!DataType.isArray(propertys)) return str;
        propertys.forEach(item => {
            str += `<tr class="tr">
                        <td><span class="del">×</span></td>
                        <td>
                            <input type="text" class="form-control" data-save="id" value="${ item.id || "" }">
                        </td>
                        <td>
                            ${ that.renderFontSelect( "fontFamily", item.fontFamily ) }
                        </td>
                        <td>
                            ${ that.renderFontSelect( "fontSize", item.fontSize) }
                        </td>
                        <td>
                            <input type="text" class="form-control" data-save="color" value="${ item.color || ""}">
                        </td>
                        <td>
                            <input type="text" class="form-control" data-save="backgroundColor" value="${ item.backgroundColor || ""}">
                        </td>
                        <td>
                            <input type="checkbox" class="form-control" data-save="visibility" ${item.visibility?"checked":""}>
                        </td>
                        <td>
                            <input type="checkbox" class="form-control" data-save="disabled" ${ item.disabled ? "checked" : ""}>
                        </td>
                        <td>
                            <input type="checkbox" class="form-control" data-save="readonly" ${ item.readonly ? "checked" : ""}>
                        </td>
                    </tr>`
        })
        return str;
    }
    this.renderFontSelect = function (type, selected) {
        let that = this,
            str = "";
        if (!type) return str;
        str = `<select class="form-control" data-save = "${type}">`;
        if (type == "fontFamily") {
            that.FONT_FAMILY.forEach(item => {
                str += `<option value="${item.value}" ${ selected == item.value ? "selected" : "" }>${item.name}</option>`
            })
        }
        if (type == "fontSize") {
            that.FONT_SIZE.forEach(item => {
                str += `<option value="${item.value}" ${ selected == item.value ? "selected" : "" }>${item.name}</option>`
            })
        }
        return `${str}</select>`
    }
    this.renderTriggerConditionTbody = function (conditions = [{}]) {
        let that = this,
            str = "";
        if (!DataType.isArray(conditions)) return str;
        conditions.forEach(item => {
            str += `<tr class="tr">
                        <td>
                            ${ that.renderTypeOfValue( "leftType", "请选择左值类型", item.leftType) }
                        </td>
                        <td>
                            <input class="form-control" data-save="leftValue" type="text" value="${ item.leftValue || "" }">
                        </td>
                        <td>
                            ${ that.renderOPeratorSelect( 2, "operator", item.leftType, item.operator ) }
                        </td>
                        <td>
                            ${ that.renderTypeOfValue( "rightType", "请选择右值类型", item.rightType) }
                        </td>
                        <td>
                            <input class="form-control" data-save="rightValue" type="text" value="${ item.rightValue || "" }">
                        </td>
                        <td><span class="del">×<span></td>
                    </tr>`
        })
        return str;
    }


}
NewEventsModal.prototype = {
    initData: async function (data) {
        let that = this,
            id = $("#property_id").val(),
            events = data,
            str = "";
        that.clearData()
        try {
            await that.GET_GLOBAL_JSON();
            await that.GET_METHODS();
            await that.GET_EVENTS_DESC()
            await that.GET_EVENTS_JSON()
        } catch (error) {
            alert("获取文件配置失败")
        }
        that.getQueryMethods(id)
        that.getExprMethods()
        $(this).propModifier3({
            $source: $("#workspace"),
            $element: $("#events_modal").find(".clickModal"),
            $result: null,
            data: events
        })
        if (!DataType.isArray(events)) return;
        events.forEach(event => {
            str += that.renderEvents(event)
        })
        that.$eventTbody.append(str)
    },
    saveData: function () {
        let that = this;
    },
    clearData: function () {
        let that = this;
        that.$eventTbody.empty()
    },
    bindEvents: function () {
        let that = this;
        //添加一行
        that.$modal.on("click" + that.NAME_SPACE, ".add", function () {
            let addType = $(this).attr("data-add"),
                $tbody = $(this).parents("table").eq(0).find("tbody").eq(0),
                str = that[addType]();
            console.log(addType)
            $tbody.append(str)
        })
        //移除一行
        that.$modal.on("click" + that.NAME_SPACE, ".del", function () {
            let $tr = $(this).parents("tr").eq(0);
            $tr.remove()
        })
        //触发的类型变化时
        that.$modal.on("change" + that.NAME_SPACE, '[data-change-operator="leftType"]', function () {
            let value = $(this).val(),
                $tr = $(this).parents("tr").eq(0),
                $op = $tr.find('[data-change="operator"]'),
                $html = that.renderOPeratorSelect(2, "operator", value, null);
            $op.replaceWith($html)
        })
        //触发方法的点击
        that.$modal.on("click" + that.NAME_SPACE, ".methods input[type='checkbox']", function () {
            let value = $(this).val(),
                check = $(this).prop("checked");
            console.log(value)
            $target = $(this).parents("tr").find(`.${value}`)
            check ? $target.show() : $target.hide()
        })


    },
    execute: function () {
        let that = this
        that.basicEvents(true, that.initData, that.saveData, that.clearData)
    }
}