function NewEventsModal($modal, $elemts) {
    BaseModal.call(this, $modal, $elemts)
    this.NAME_SPACE = ".EVENTS"
    //单选按钮的区分
    this.triggerRadioName = 1;
    //已经发布的布局
    this.PUBLISH_JSON = null;
    this.GLOBAL_JSON = null;
    //客户自定义事件
    this.METHODS = null;
    this.EVENTS_DESC = null;
    this.TRIGGER_TYPE = null;
    this.FONT_FAMILY = null;
    this.FONT_SIZE = null;
    this.event = null;
    this.LINKHTML_DATA = null
    this.globalVariable = null;
    this.outerSideVariable = null;
    this.events = [];
    this.$eventTbody = this.$modalBody.find(".table .events_tbbody")
    //获取已经发布的布局
    this.GET_PUBLISH_JSON = async function () {
        let that = this,
            table = "newProducts",
            conditions = [{
                col: "status",
                value: "10"
            }],
            fields = ["customId", "name"];
        that.PUBLISH_JSON = await new Service().query(table, conditions, fields)
    }
    this.GET_GLOBAL_JSON = async function (id) {
        let that = this;
        that.GLOBAL_JSON = await new FileService().readFile("./profiles/global.json");
        that.globalVariable = that.GLOBAL_JSON.globalVariable;
        that.outerSideVariable = that.GET_GLOBAL_JSON[id]
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
        if (methods[type]) {
            that.METHODS = [...that.METHODS, ...methods[type]]
        } else {
            that.METHODS = [...that.METHODS]
        }
    }
    //获取表达式函数方法
    this.getExprMethods = function () {
        let that = this,
            exprMethods = new Property().getValue("BODY", "globalMethods");
        if (DataType.isArray(exprMethods)) {
            exprMethods.forEach(item => {
                that.METHODS.push({
                    name: item.fnCname + '(' + item.fnChineseName + ')',
                    value: item.expr,
                    type: 1
                })
            });
        }
    }
    this.renderEvents = function (event = {
        publish: {},
        subscribe: {}
    }) {
        var sortArr = '';
        if (event.publish.sort)
            sortArr = JSON.stringify(event.publish.sort);
        let that = this,
            str = `<tr data-check='${sortArr}' class="tr eventsTr">
                    <td><span class="del">×</span></td>
                    <td>
                        ${ that.renderTriggerType("radio", that.TRIGGER_TYPE, event.publish.type, that.triggerRadioName++)}
                    </td>
                    <td>
                         ${ that.renderTriggerConditionTable(event.subscribe.conditions)}
                    </td>
                    <td class="methods">
                        ${that.renderTriggerMethods("checkbox", that.METHODS, event.subscribe, event.publish)}
                    </td>
                    <td>
                        ${ that.renderSaveHTML(event.subscribe.saveHTML)}
                        ${ that.renderKeySave(event.subscribe.keySave)}
                        ${ that.renderNextProcess(event.subscribe.nextProcess)}
                        ${ that.renderNotify(event.subscribe.notify)}
                        ${ that.renderTimeQuery(event.subscribe.timeQuery)}
                        ${ that.renderChangePropertyTable(event.subscribe.property)}
                        ${ that.renderCopySendTable(event.subscribe.copySend)}
                        ${ that.renderDeleteTable(event.subscribe.deleteRow)}
                        ${ that.renderLinkHTMLTable(event.subscribe.linkHtml)}
                        ${ that.renderExecuteFn(event.subscribe.executeFn)}
                        ${ that.renderImportDb(event.subscribe.importDb)}
                        ${ that.renderExtendCol(event.subscribe.extendCol)}//zww
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
            if (query.db && query.db.type === "common") {
                queryTable = "通用查询"
            } else if (query.db && query.db.type === "table") {
                queryTable = "表格查询"
            }
        };
        str = `<div class="condition timeQuery" ${timeQuery ? "" : 'style="display:none"'}>
                    <div style="margin: 0 20px 20px 0; display: inline-block;">
                    <span>查询频率/秒</span>
                            <input style="display: inline-block;width:100px;margin-left:10px;" data-save="queryTime" type="text" data-category="queryTime" class="form-control" data-key="" value="${timeQuery && timeQuery || ""}">
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
        str = `<div class="conditoion linkHtml"  ${linkHtml ? "" : 'style="display:none"'}>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="text-center">HTTP</th>
                                <th class="text-center">跳转类型</th>
                                <th class="text-center">跳转页面</th>
                                <th class="text-center">跳转参数</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${that.renderLinkHTML(linkHtml)}
                        </tbody>
                    </table>
                </div>`
        return str;
    }
    this.renderImportDb = function (ImportDbData) {
        let that = this,
            str = '';
        str = `<div class="conditoion importDb"  ${ImportDbData ? "" : 'style="display:none"'}>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="text-center">导入的库名</th>
                                <th class="text-center">导入表名</th>
                                <th class="text-center">excel区域</th>
                                <th class="text-center">数据库区域</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${that.renderImportDbTr(ImportDbData)}
                        </tbody>
                    </table>
                </div>`
        return str;
    }
    this.renderImportDbTr = function (ImportDbData = {}) {
        ImportDbData = ImportDbData || {}
        let that = this,
            str = '';
        str += `<tr class="importDbTr">
            <td>
                <input type="text" class="form-control" data-save="importDbName" value="${ImportDbData.dbName || ""}" data-wrap="true" data-category="linkHtml">
            </td>
            <td>
                <input type="text" class="form-control" data-save="importTableName" value="${ImportDbData.tableName || ""}" data-wrap="true" data-category="linkHtml">
            </td>
            <td>
                <input type="text" class="form-control" data-save="excelArea" data-category="linkHtml" value="${ImportDbData.excelArea || ""}" >
            </td>
            <td>
                <input type="text" class="form-control" data-save="dbArea" data-category="linkHtml" value="${ImportDbData.dbArea || ""}" >
            </td>
        </tr>`
        return str;
    }
    this.renderLinkHTML = function (linkHtml = {}) {
        let that = this,
            str = '';
        if (!linkHtml) linkHtml = {
            table: ""
        };
        str += `<tr class="linkHtmlTr">
                    <td>
                        <input type="text" class="form-control" data-save="linkHttp" value="${linkHtml.http || "http://172.18.152.111/home/model"}">
                    </td>
                    <td>
                        <select class="form-control" data-save="linkType">
                            <option value="linkhtml" ${linkHtml.type == "linkhtml" ? "selected" : ""}>内部跳转</option>
                            <option value="nextProcess" ${linkHtml.type == "nextProcess" ? "selected" : ""}>下一流程</option>
                        </select>
                    </td>
                    <td class="linkCustomId">
                        ${ that.renderLinkHTMLSelect(linkHtml.customId, linkHtml.type)}
                    </td>
                    <td>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th class="text-center">页面参数</th>
                                    <th class="text-center">参数描述</th>
                                    <th class="text-center">参数类型</th>
                                    <th class="text-center">参数值</th>
                                <tr>
                            </thead>
                            <tbody class="linkbody">
                                ${that.renderLinkHTMLParmas(linkHtml.params)}
                            </tbody>
                        </table>
                    </td>
                </tr>`

        return str;
    }
    this.renderLinkHTMLParmas = function (parmas = []) {
        let that = this,
            str = "";
        parmas.forEach((item) => {
            str += `<tr class="linkHtmlParamsTr">
                        <td>
                            <input type="text" class="form-control" data-save="linkKey" readonly="true" save-value="${item.key}" value="${item.key || ""}">
                        </td>
                        <td>
                            <input type="text" class="form-control" data-save="linkDesc" readonly="true" save-value="${item.key}" value="${item.desc || ""}">
                        </td>
                        <td>
                            ${ that.copySendConfigTypeOfValue("linkHtml_type", item.type)}
                        </td>
                        <td>
                            <input type="text" class="form-control" data-save="linkValue" data-wrap="true" data-category="linkHtml" value="${item.value || ""}">
                        </td>
                    </tr>`
        })
        return str;
    }
    this.renderLinkHTMLSelect = function (customId, type = "linkhtml") {
        let that = this,
            str = "";
        if (type == "linkhtml") {
            str = `<select class="form-control chosen" data-save="linkCustomId" data-change="linkCustomId"><option value="">请选择跳转页面</option>`
            that.PUBLISH_JSON.forEach(item => {
                str += `<option value="${item.customId}" ${customId == item.customId ? "selected" : ""}> ${item.name}(${item.customId})</option>`
            })
            str += "</select>"
        } else {
            str = `<input type="text" class="form-control" value="${customId}" data-Inputchange="linkCustomId" data-save="linkCustomId" data-category="nextProcess" data-wrap="true" data-insert="true" >`
        }
        return str;
    }
    this.renderNextProcess = function (nextProcess) {
        let that = this,
            str = "";
        str = `<div class="condition nextProcess" ${nextProcess ? "" : 'style="display:none"'}>
                    <span>下一流程</span>
                    <input type="text" class="form-control" data-save="nextProcess" data-category="nextProcess" data-wrap="true" data-insert="true"  style="display:inline-block;margin-left:10px; width:500px" value='${nextProcess || ""}'>                    
                </div>`;
        return str;
    }
    this.renderNotify = function (notify) {
        let that = this,
            str = "";
        str = `<div class="condition notify" ${notify ? "" : 'style="display:none"'}>
                    <span>通知元素</span>
                    <input type="text" class="form-control" data-save="notifyEl" data-category="notify" data-apply="add"  style="display:inline-block;margin-left:10px;width:500px" value='${notify || ""}'>
               </div>`
        return str;
    }
    this.renderExecuteFn = function (fn) {
        let that = this,
            str = "";
        str = `<div class="condition executeFn" ${fn ? "" : 'style="display:none"'} >
                    <p style="margin:0px">代码执行</p>
                    <textarea style="width:860px;height:200px" data-save="executeFn" >${fn}</textarea>
                </div>`
        return str;
    }
    this.renderSaveHTML = function (saveHTML) {
        let that = this,
            str = "";
        str = `<div class="condition saveHTML" ${saveHTML ? "" : 'style="display:none"'}>
                <span>保存文件名</span>
                <input type="text" class="form-control" style="display:inline-block;margin-left:10px;width:500px" value='${saveHTML || ""}' data-save="saveHTML" data-category="saveHTML" data-wrap="true" data-insert="true">
            </div>`
        return str;
    }

    //zww
    this.renderExtendCol = function (extendCol) {
        var that = this,
            str = `<div class="conditoion extendCol"  ${extendCol ? "" : 'style="display:none"'}>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th class="text-center">自定义变量</th>
                    <th class="text-center">开始</th>
                    <th class="text-center">结束</th>
                </tr>
            </thead>
            <tbody>
                ${that.renderExtendColTr(extendCol)}
            </tbody>
        </table>
    </div>`
        return str;
    }
    //zww
    this.renderExtendColTr = function (extendCol = {}) {
        extendCol = extendCol || {}
        let that = this,
            str = '';
        str += `<tr class="importDbTr">
            <td>
                ${that.renderExtentColSelect(extendCol.selectText)}
            </td>
            <td>
                <input type="text" class="form-control" data-save="startText" value="${extendCol.startText || ""}" >
            </td>
            <td>
                <input type="text" class="form-control" data-save="endText" value="${extendCol.endText || ""}" >
            </td>
        </tr>`
        return str;
    }
    //zww
    this.renderExtentColSelect = function (selectText) {
        var str = `<select class="form-control chosen" data-save="selectText"><option value="">请选择自定义变量</option>`,
            selectArr = GLOBAL_PROPERTY.BODY.customVariable;
        console.log(selectArr, "selectArr");

        selectArr.forEach(item => {
            var selectVal = `${item.desc}(${item.key})`;
            str += `<option value="${selectVal}" ${selectVal == selectText ? "selected" : ""}> ${selectVal}</option>`
        })
        str += "</select>"
        return str;
    }
    // this.renderImportExcel = function (importArea) {
    //     let that = this,
    //         str = "";
    //     str = `<div class="condition importExcel" ${importArea ? "" : 'style="display:none"' }>
    //             <span>导入XLSX的区域</span>
    //             <input type="text" class="form-control" style="display:inline-block;margin-left:10px;width:500px" value='${importArea||""}' data-category="linkHtml" data-save="importExcel">
    //         </div>`
    //     return str;
    // }
    this.renderKeySave = function (key) {
        let that = this,
            str = "";
        str = `<div class="condition keySave" ${key ? "" : 'style="display:none"'}>
                <span>指定主键</span>
                <input type="text" class="form-control" data-wrap="true" style="display:inline-block;margin-left:10px;width:500px" value='${key || ""}' data-category="linkHtml" data-save="keySave">
            </div>`
        return str;
    },
        this.renderTypeOfValue = function (typekey, type, selected) {
            let defaultType = {
                name: type,
                value: ""
            },
                str = `<select class="form-control" data-save = "${typekey}" data-change-operator="${typekey}">`,
                options = [defaultType, ...ConditionsHelper.typeConfig];
            options.forEach(item => {
                str += `<option value="${item.value}" ${selected == item.value ? "selected" : ""}>${item.name}</option>`
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
            str += `<option value="${item.value}" ${selected == item.value ? "selected" : ""}>${item.name}</option>`
        })
        return `${str}</select>`
    }
    this.renderOPeratorSelect = function (type, saveType, relyValue, selected) {
        let defalutOption = {
            name: "请选择操作符",
            value: ""
        }
        options = type == 3 ? ConditionsHelper.getOperators(type, relyValue) : [defalutOption, ...ConditionsHelper.getOperators(type, relyValue)],
            str = `<select class="form-control" data-save="${saveType}" data-change="${saveType}">`;
        options.forEach(item => {
            str += `<option value="${item.value}" ${selected == item.value ? "selected" : ""}>${item.name}</option>`
        })
        return str;
    }
    this.renderTriggerMethods = function (inputType = "checkbox", dataSource = [], subscribe = {}, publish = {}) {
        let that = this,
            str = "";
        if (!inputType || !DataType.isArray(dataSource)) return str;
        let checkArr = [];
        if (subscribe.copySend) checkArr.push("copySend");
        if (subscribe.deleteRow) checkArr.push("deleteRow");
        if (subscribe.property) checkArr.push("changeProperty");
        if (subscribe.notify) checkArr.push("notify");
        if (subscribe.saveHTML) checkArr.push("saveHTML");
        if (subscribe.linkHtml) checkArr.push("linkHtml");
        if (subscribe.nextProcess) checkArr.push("nextProcess");
        if (subscribe.executeFn) checkArr.push("executeFn");
        if (subscribe.importExcel) checkArr.push("importExcel");
        if (subscribe.importDb) checkArr.push("importDb");
        if (subscribe.keySave) checkArr.push("keySave");
        if (subscribe.extendCol) checkArr.push("extendCol");//zww

        console.log(checkArr)
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
                        <input type="${inputType}" value='${item.value}' class="triggerMethods" ${item.type ? 'data-exper="true"' : ""} ${checkArr.indexOf(item.value) > -1 ? "checked" : ""} data-name='${item.name}'>
                        <span> ${ item.name} </span>`
            str += '</div>'
        });
        return str;
    }
    this.renderTriggerType = function (inputType = "radio", dataSource = [], checked, radioName) {
        var that = this;

        if (!inputType || !DataType.isArray(dataSource)) return;
        let str = "";
        dataSource.forEach(item => {
            str += `<div>
                        <input type="${inputType}" data-key="trigger_type" ${checked == item.value ? "checked" : ""} name="${radioName}" value="${item.value}">
                        <span> ${ item.name} </span>
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
                       ${ that.renderTriggerConditionTbody(conditions)}
                    </tbody>
               </table>`;
        return str;
    }
    this.renderChangePropertyTable = function (property) {
        let that = this,
            str = '';
        str = `<div class="condition changeProperty" ${property ? "" : 'style="display:none"'}>
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
            str = `<div class="conditoion copySend" ${copySend ? "" : 'style="display:none"'}>
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
                                ${ that.renderCopySendTr(copySend)}
                            </tbody>
                        </table>
                   </div>`;
        return str;
    }
    this.renderDeleteTable = function (deleteData) {
        let that = this,
            str = `<div class="condition deleteRow" ${deleteData ? "" : 'style="display:none"'}>
                <table class="table table-bordered" >
                    <thead>
                        <tr>
                            <th ><span class="add" data-add="renderDeleteTr">+</span></th>
                            <th class="text-center"> 数据库</th>
                            <th class="text-center"> 数据表</th>
                            <th class="text-center"> 删除条件</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${that.renderDeleteTr(deleteData)}
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
            str += `<tr class="tr copySendTr">
                        <td>
                            <span class="del">×</span>
                        </td>
                        <td>
                            ${ that.renderCopySendSelect('dbName', item.dbName, null, null, "请选择数据库", item.dbName)}
                        </td>
                        <td>
                            ${ that.renderCopySendSelect('table', item.dbName, item.table, null, "请选择抄送表", item.table)}
                        </td>
                        <td>
                            ${ that.renderCopySendConditionTable(item.dbName, item.table, item.conditions)}
                        </td>
                        <td>
                            ${ that.renderCopySendFieldsTable(item.dbName, item.table, item.fields)}
                        </td>
                    </tr>`
        })
        return str;
    }
    this.renderDeleteTr = function (deleteData = [{}]) {
        let that = this,
            str = '';
        if (!DataType.isArray(deleteData)) return str;
        deleteData.forEach(item => {
            str += `<tr class="tr deleteTr">
                <td>
                    <span class="del">×</span>
                </td>
                <td>
                    ${ that.renderCopySendSelect('dbName', item.dbName, null, null, "请选择数据库", item.dbName)}
                </td>
                <td>
                    ${ that.renderCopySendSelect('table', item.dbName, item.table, null, "请选择抄送表", item.table)}
                </td>
                <td>
                    ${ that.renderCopySendConditionTable(item.dbName, item.table, item.conditions)}
                </td>
                        </td>
            </tr>`
        })
        return str;
    }
    this.renderCopySendConditionTable = function (dbName, table, conditions) {
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
                        ${that.renderCopySendCondition(dbName, table, conditions)}
                    </tbody>
               </table>`
        return str;
    }
    this.renderCopySendCondition = function (dbName, table, conditions = [{}]) {
        let that = this,
            str = "";
        if (!DataType.isArray(conditions)) return str;
        conditions.forEach(item => {
            str += `<tr class="tr copySendCondition">
                        <td>
                            ${ that.renderCopySendSelect('field', dbName, table, item.field, "请选择抄送列", item.field)}
                        </td>
                        <td>
                            ${ that.renderCopySendConfigTypeOfValue("condition_operator", 1, item.operator)}
                        </td>
                        <td>
                            ${ that.copySendConfigTypeOfValue("condition_type", item.type)}
                        </td>
                        <td>
                           <input type="text" data-category="copySend_conditions" data-wrap="true" data-save="condition_value" class="form-control" value='${item.value || ""}'>
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
                            <th style="width:90px">
                                <span class="add" data-add="renderCopySendConfig">＋</span>
                                <span style="color:red;" class="autoCopySend">批量配置</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ that.renderCopySendConfig(dbName, table, fields)}
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
            str += `<tr class="tr copySendFieldTr">
                        <td class="changeFieldSplit">
                            ${ that.renderCopySendSelect('field', dbName, table, item.field, "请选择抄送列", item.field)}
                        </td>
                        <td>
                            ${ that.renderCopySendSelect('fieldSplit', dbName, table, item.field, "请选择抄送段", item.fieldSplit)}
                        </td>
                        <td>
                            ${ that.copySendConfigTypeOfValue("value_type", item.value.type)}
                        </td>
                        <td>
                            <input type="text" data-save="element" data-wrap="true" class="form-control" data-category="copySend" value='${item.element || ""}'></input>
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
        let str = `<select class="form-control" data-save = "${savekey}" data-change="${savekey}">`,
            options = ConditionsHelper.copySendConfig;
        options.forEach(item => {
            str += `<option value="${item.value}" ${selected == item.value ? "selected" : ""}>${item.name}</option>`
        })
        return `${str}</select>`
    }
    this.renderCopySendSelect = function (type, dbName, table, field, defalutOption, selected) {

        let that = this,
            data = that.getCopySendSelectData(type, dbName, table, field),
            str = `<select class="form-control chosen" data-save="${type}" data-change="${type}"><option value="">${defalutOption}</option>`;

        data.forEach(item => {
            str += `<option value="${item.value}" ${selected == item.value ? "selected" : ""}>${item.name}(${item.value})</option>`
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
            str += `<tr class="tr changePropertyTr">
                        <td><span class="del">×</span></td>
                        <td>
                            <input type="text" class="form-control"  data-category="property" save-type="id" data-save="id" value="${ item.id || ""}">
                        </td>
                        <td>
                            ${ that.renderFontSelect("fontFamily", item.fontFamily)}
                        </td>
                        <td>
                            ${ that.renderFontSelect("fontSize", item.fontSize)}
                        </td>
                        <td style="position:relative">
                            <input type="text" class="form-control propety-color" save-type="style" data-save="color" value="${ item.color || ""}">
                            <div class="property-icon-wrap">
                                <input type="color" data-belong="propety-color" class="property-color-input">
                            <i class="icon icon-color"></i>
                        </div>
                        </td>
                        <td style="position:relative">
                            <input type="text" class="form-control property-background" save-type="style" data-save="backgroundColor" value="${ item.backgroundColor || ""}">
                            <div class="property-icon-wrap">
                                <input type="color" data-belong="property-background" class="property-color-input">
                            <i class="icon icon-color"></i>
                        </div>
                        </td>
                        <td>
                            <input type="checkbox" class="form-control" save-type="style" data-save="visibility" ${item.visibility ? "checked" : ""}>
                        </td>
                        <td>
                            <input type="checkbox" class="form-control" save-type="attribute" data-save="disabled" ${ item.disabled ? "checked" : ""}>
                        </td>
                        <td>
                            <input type="checkbox" class="form-control" save-type="attribute" data-save="readonly" ${ item.readonly ? "checked" : ""}>
                        </td>
                    </tr>`
        })
        return str;
    }
    this.renderFontSelect = function (type, selected) {
        let that = this,
            str = "";
        if (!type) return str;
        str = `<select class="form-control" save-type="style" data-save = "${type}">`;
        if (type == "fontFamily") {
            that.FONT_FAMILY.forEach(item => {
                str += `<option value="${item.value}" ${selected == item.value ? "selected" : ""}>${item.name}</option>`
            })
        }
        if (type == "fontSize") {
            that.FONT_SIZE.forEach(item => {
                str += `<option value="${item.value}" ${selected == item.value ? "selected" : ""}>${item.name}</option>`
            })
        }
        return `${str}</select>`
    }
    this.renderTriggerConditionTbody = function (conditions = [{}]) {
        let that = this,
            str = "";
        if (!DataType.isArray(conditions)) return str;
        conditions.forEach(item => {
            str += `<tr class="tr triggerConditionTr">
                        <td>
                            ${ that.renderTypeOfValue("leftType", "请选择左值类型", item.leftType)}
                        </td>
                        <td>
                            <input class="form-control" data-save="leftValue" data-category="trigger" data-wrap="true" type="text" value="${ item.leftValue || ""}">
                        </td>
                        <td>
                            ${ that.renderOPeratorSelect(2, "operator", item.leftType, item.operator)}
                        </td>
                        <td>
                            ${ that.renderTypeOfValue("rightType", "请选择右值类型", item.rightType)}
                        </td>
                        <td>
                            <input class="form-control" data-save="rightValue" data-category="trigger" data-wrap="true" type="text" value="${ item.rightValue || ""}">
                        </td>
                        <td><span class="del">×<span></td>
                    </tr>`
        })
        return str;
    }
    this.setUsingClass = function ($input) {
        if (!$input) return;
        this.$modal.find(".applied").removeClass("applied");
        var category = $input.data('category'),
            val = $input.parents('tr').first().find('[data-category="' + category + '"]').map(function () {
                return $(this).val()
            }).get().join(','),
            matches = val && val.match(/[A-Z]{4}/g);
        if (matches) {
            var selector = matches.map(function (item) {
                return '[data-id="' + item + '"]';
            }).join(",");
            this.$modal.find(selector).addClass("applied");
        };
    }
    //获取选择的值
    this.getTriggerConditions = function ($triggerConditionTr) {
        let conditions = [];
        $triggerConditionTr.each(function () {
            let condition = {};
            condition.leftType = $(this).find('[data-save="leftType"]').val();
            condition.leftValue = $(this).find('[data-save="leftValue"]').val();
            condition.operator = $(this).find('[data-save="operator"]').val();
            condition.rightType = $(this).find('[data-save="rightType"]').val();
            condition.rightValue = $(this).find('[data-save="rightValue"]').val();
            conditions.push(condition)
        })
        conditions.length > 0 ? "" : conditions = null;
        return conditions
    }
    this.getTriggerCustomMethods = function (triggerMethods) {
        let customs = ["save", "copySend", "upload", "login", "checkAll", "cancelAll", "batchSave", "sendMessage"],
            result = [];
        triggerMethods.each(function () {
            var value = $(this).val();
            if (customs.indexOf(value) > -1) {
                result.push(value)
            }
        })
        result.length > 0 ? "" : result = null;
        return result;
    }
    this.judgeCheckMehods = function (type, triggerMethods) {
        var result = false;
        triggerMethods.each(function () {
            if ($(this).val() == type) {
                result = true;
            }
        })
        return result;
    }
    this.getCopySend = function ($copySends) {
        var that = this,
            copySends = [];
        $copySends.each(function () {
            var copysend = {};
            copysend.dbName = $(this).find('[data-save="dbName"]').val();
            copysend.table = $(this).find('[data-save="table"]').val();
            copysend.conditions = that.getCopySendCondition($(this).find(".copySendCondition"));
            copysend.fields = that.getCopySendFields($(this).find(".copySendFieldTr"));
            copySends.push(copysend)
        })
        return copySends;
    }
    this.getDelete = function ($deletes) {
        var that = this,
            deletes = [];
        $deletes.each(function () {
            var Delete = {};
            Delete.dbName = $(this).find('[data-save="dbName"]').val();
            Delete.table = $(this).find('[data-save="table"]').val();
            Delete.conditions = that.getCopySendCondition($(this).find(".copySendCondition"));
            deletes.push(Delete)
        })
        return deletes;
    }
    this.getCopySendCondition = function ($conditions) {
        var conditions = [];
        $conditions.each(function () {
            var condition = {};
            condition.field = $(this).find('[data-save="field"]').val();
            condition.operator = $(this).find('[data-save="condition_operator"]').val();
            condition.type = $(this).find('[data-save="condition_type"]').val();
            condition.value = $(this).find('[data-save="condition_value"]').val();
            conditions.push(condition)
        })
        return conditions
    }
    this.getCopySendFields = function ($copySendFields) {
        var fields = [];
        $copySendFields.each(function () {
            var field = {};
            field.field = $(this).find('[data-save="field"]').val();
            field.fieldSplit = Number($(this).find('[data-save="fieldSplit"]').val());
            field.element = $(this).find('[data-save="element"]').val();
            field.value = {
                type: $(this).find('[data-save="value_type"]').val(),
                operator: $(this).find('[data-save="value_operator"]').val()
            }
            fields.push(field)
        })
        return fields;
    }
    this.getChangeProperty = function ($propertys) {
        let property = {};
        $propertys.each(function () {
            let id = $(this).find('[data-save="id"]').val();
            if (id) {
                property[id] = [];
                var $fontFamily = $(this).find('[data-save="fontFamily"]'),
                    $fontSize = $(this).find('[data-save="fontSize"]'),
                    $color = $(this).find('[data-save="color"]'),
                    $backgroundColor = $(this).find('[data-save="backgroundColor"]'),
                    $visibility = $(this).find('[data-save="visibility"]'),
                    $disabled = $(this).find('[data-save="disabled"]'),
                    $readonly = $(this).find('[data-save="readonly"]');
                if ($fontFamily.val()) {
                    property[id].push({
                        type: $fontFamily.attr("save-type"),
                        name: $fontFamily.attr("data-save"),
                        value: $fontFamily.val()
                    })
                }
                if ($fontSize.val()) {
                    property[id].push({
                        type: $fontSize.attr("save-type"),
                        name: $fontSize.attr("data-save"),
                        value: $fontSize.val()
                    })
                }
                if ($color.val()) {
                    property[id].push({
                        type: $color.attr("save-type"),
                        name: $color.attr("data-save"),
                        value: $color.val()
                    })
                }
                if ($backgroundColor.val()) {
                    property[id].push({
                        type: $backgroundColor.attr("save-type"),
                        name: $backgroundColor.attr("data-save"),
                        value: $backgroundColor.val()
                    })
                }
                property[id].push({
                    type: $visibility.attr("save-type"),
                    name: $visibility.attr("data-save"),
                    value: $visibility.is(":checked")
                })
                property[id].push({
                    type: $disabled.attr("save-type"),
                    name: $disabled.attr("data-save"),
                    value: $disabled.is(":checked")
                })
                property[id].push({
                    type: $readonly.attr("save-type"),
                    name: $readonly.attr("data-save"),
                    value: $readonly.is(":checked")
                })
            }
        })
        return property;

    }
    this.getLinkHtml = function ($tr) {
        let that = this,
            result = {};
        $tr.each(function () {
            result.http = $(this).find('[data-save="linkHttp"]').val()
            result.type = $(this).find('[data-save="linkType"]').val()
            result.customId = $(this).find('[data-save="linkCustomId"]').val()
            result.params = that.getLinkParams($(this).find(".linkHtmlParamsTr"))
        })
        return result;
    }
    this.getImportDb = function ($tr) {
        let that = this,
            result = {};
        $tr.each(function () {
            result.dbName = $(this).find('[data-save="importDbName"]').val()
            result.tableName = $(this).find('[data-save="importTableName"]').val()
            result.excelArea = $(this).find('[data-save="excelArea"]').val()
            result.dbArea = $(this).find('[data-save="dbArea"]').val()
        })
        return result
    }
    this.getLinkParams = function ($tr) {
        let that = this,
            result = [];
        $tr.each(function () {
            var obj = {};
            obj.key = $(this).find('[data-save="linkKey"]').val();
            obj.desc = $(this).find('[data-save="linkDesc"]').val();
            obj.type = $(this).find('[data-save="linkHtml_type"]').val();
            obj.value = $(this).find('[data-save="linkValue"]').val();
            result.push(obj)
        })
        return result;
    }
    this.bindChosen = function () {
        $(".chosen").chosen({
            no_results_text: "没有找到想要的数据",
            search_contains: true,
            allow_single_deselect: true,
            width: "100%",
        })
    }
    //zww
    this.getExtendCol = function ($tr) {
        let result = {};
        $tr.each(function () {
            result.startText = $(this).find('[data-save="startText"]').val()
            result.endText = $(this).find('[data-save="endText"]').val()
            result.selectText = $(this).find('[data-save="selectText"]').val()
        })
        return result;
    }
}
NewEventsModal.prototype = {
    initData: async function (data) {
        let that = this,
            id = $("#property_id").val(),
            events = data,
            str = "";
        that.clearData()
        that.events = events
        try {
            await that.GET_PUBLISH_JSON();
            await that.GET_METHODS();
            await that.GET_EVENTS_DESC()
            await that.GET_EVENTS_JSON()
            await that.GET_GLOBAL_JSON(id)
        } catch (error) {
            alert("获取文件配置失败")
        }
        that.getQueryMethods(id)
        that.getExprMethods()
        $(this).propModifier3({
            $source: $("#workspace"),
            $element: $("#events_modal").find(".clickModal"),
            $result: null,
            data: events,
            type: "defalut"
        })
        if (!DataType.isArray(events)) return;
        events.forEach(event => {
            str += that.renderEvents(event)
        })
        that.$eventTbody.append(str);
        that.judgeCheck();//判断是否选中
        that.bindChosen();
        // $(".moveTable").colResizable({
        //     liveDrag: true,
        //     resizeMode: "overflow",
        //     disabled: true,
        //     disabledColumns: [0, 3]
        //     // gripInnerHtml:"<div class='grip'></div>", 
        //     // draggingClass:"dragging", 
        //     // resizeMode:'fit'
        // });

    },
    judgeCheck: function () {
        var $eventsAttr = $('.eventsTr').attr('data-check'),
            $attrCheck = JSON.parse($eventsAttr),
            methodsContent = $('.eventsTr').find('.methods > div'),
            checkedArr = [];
        for (var i = 0; i < methodsContent.length; i++) {
            var value = this.commonData(methodsContent, i);
            value && checkedArr.push(value);
        }
        if (checkedArr.length === 0) $attrCheck = [];
        var filterArr = $attrCheck.filter(ele => {
            return checkedArr.indexOf(ele) == -1;
        })
        for (var m = 0; m < filterArr.length; m++) {
            var findIdx = $attrCheck.indexOf(filterArr[m]);
            if (findIdx > -1) $attrCheck.splice(findIdx, 1);
        }
        $('.eventsTr').attr('data-check', JSON.stringify($attrCheck));
        for (var i = 0; i < methodsContent.length; i++) {
            var value = this.commonData(methodsContent, i),
                checkbox = methodsContent.eq(i).find('input[type="checkbox"]');
            if (value) {
                var findItemIdx = $attrCheck.indexOf(value);
                checkbox.parent('div').append(`<span class="checked-num" data-value="${value}">${findItemIdx + 1}</span>`);
            }
        }
    },
    commonData: function (methodsContent, i) {
        var checkbox = methodsContent.eq(i).find('input[type="checkbox"]'),
            isExper = checkbox.attr('data-exper'),
            value = '';
        if (checkbox.prop('checked')) {
            if (isExper) {
                var dataName = checkbox.attr('data-name');
                value = dataName.replace(/\([^\)]*\)/g, "");
            } else {
                value = checkbox.val();
            }
            return value;
        }
    },
    saveData: function () {
        let that = this,
            id = $("#property_id").val();
        if (!id) return;
        let result = [];

        that.$modal.find(".eventsTr").each(function (index) {
            let trigger_type = $(this).find('[data-key="trigger_type"]:checked').val(),
                trigger_key = [id, trigger_type, "SPP" + index].join("_"),
                trigger_data = null,
                trigger_conditions = that.getTriggerConditions($(this).find(".triggerConditionTr")),
                trigger_custom_methods = that.getTriggerCustomMethods($(this).find(".triggerMethods:checked")),
                $exprMethods = $(this).find('[data-exper="true"]:checked'),
                trAttr = $(this).attr('data-check'),
                exprMethods = [],
                copySend = null,
                deleteRow = null,
                property = null,
                notify = null,
                query = null,
                timeQuery = null,
                saveHTML = null,
                linkHtml = null,
                executeFn = null,
                nextProcess = null,
                importExcel = false,
                keySave = null,
                importDb = null,
                extendCol = null;//zww

            if (that.judgeCheckMehods("commonQuery", $(this).find(".triggerMethods:checked"))) {
                query = []
                query.push("commonQuery")
            }
            if (that.judgeCheckMehods("importExcel", $(this).find(".triggerMethods:checked"))) {
                importExcel = true;
            }
            if (that.judgeCheckMehods("keySave", $(this).find(".triggerMethods:checked"))) {
                keySave = $(this).find('[data-save="keySave"]').val()
            }
            if (that.judgeCheckMehods("tableQuery", $(this).find(".triggerMethods:checked"))) {
                query = []
                query.push("tableQuery")
            }
            if (that.judgeCheckMehods("copySend", $(this).find(".triggerMethods:checked"))) {
                copySend = that.getCopySend($(this).find('.copySendTr'))
            }
            if (that.judgeCheckMehods("deleteRow", $(this).find(".triggerMethods:checked"))) {
                deleteRow = that.getDelete($(this).find('.deleteTr'))
            }
            if (that.judgeCheckMehods("changeProperty", $(this).find(".triggerMethods:checked"))) {
                property = that.getChangeProperty($(this).find(".changePropertyTr"))
            }
            if (that.judgeCheckMehods("linkHtml", $(this).find(".triggerMethods:checked"))) {
                linkHtml = that.getLinkHtml($(this).find('.linkHtmlTr'))
            }
            if (that.judgeCheckMehods("extendCol", $(this).find(".triggerMethods:checked"))) {
                extendCol = that.getExtendCol($(this).find('.extendCol'))
            }//zww
            if (that.judgeCheckMehods("importDb", $(this).find(".triggerMethods:checked"))) {
                importDb = that.getImportDb($(this).find(".importDbTr"))
            }
            if (that.judgeCheckMehods("notify", $(this).find(".triggerMethods:checked"))) {
                var arr = $(this).find('[data-save="notifyEl"]').val().split(",")
                notify = []
                arr.forEach(function (item) {
                    if (item) {
                        notify.push(item)
                    }
                });
            }
            if (that.judgeCheckMehods("timeQuery", $(this).find(".triggerMethods:checked"))) {
                timeQuery = $(this).find('[data-category="queryTime"]').val()
            };
            if (that.judgeCheckMehods("saveHTML", $(this).find(".triggerMethods:checked"))) {
                saveHTML = $(this).find('[data-save="saveHTML"]').val()
            };
            if (that.judgeCheckMehods("executeFn", $(this).find(".triggerMethods:checked"))) {
                executeFn = $(this).find('[data-save="executeFn"]').val()
            };
            if (that.judgeCheckMehods("nextProcess", $(this).find(".triggerMethods:checked"))) {
                nextProcess = $(this).find('[data-save="nextProcess"]').val()
            };
            $exprMethods.each(function () {
                exprMethods.push({
                    fnCname: $(this).next('span').text(),
                    expression: $(this).val()
                })
            });
            if (trAttr) var sortArr = JSON.parse(trAttr);
            var specialArr = ['keySave', 'saveHTML', 'nextProcess'];
            for (var i = 0; i < specialArr.length; i++) {
                var specialIdx = sortArr.indexOf(specialArr[i]);
                if (specialIdx > -1) {
                    var specialVal = $(`.${specialArr[i]}`).find(`[data-save="${specialArr[i]}"]`).val();
                    if (!specialVal) sortArr.splice(specialIdx, 1);
                }
            }
            if (trigger_type) {
                result.push({
                    publish: {
                        type: trigger_type,
                        key: trigger_key,
                        data: trigger_data,
                        sort: sortArr
                    },
                    subscribe: {
                        conditions: trigger_conditions,
                        custom: trigger_custom_methods,
                        copySend: copySend,
                        deleteRow: deleteRow,
                        property: property,
                        notify: notify,
                        query: query,
                        timeQuery: timeQuery,
                        exprMethods: exprMethods,
                        saveHTML: saveHTML,
                        linkHtml: linkHtml,
                        nextProcess: nextProcess,
                        executeFn: executeFn,
                        importExcel: importExcel,
                        importDb: importDb,
                        keySave: keySave,
                        extendCol: extendCol//zww
                    }
                })
            }
        })
        result.length > 0 ? that.$element.val(JSON.stringify(result)) : that.$element.val("");

        var $workspace = $("#workspace"), //获取工作区
            $control = $workspace.find("#" + id); //获取对应id的元素
        new Property().save(id === "BODY" ? $workspace : $control, that.$element); //实例化property调用save方法

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
                str = "";
            if (addType == "renderCopySendCondition" || addType == "renderCopySendConfig") {
                let dbName = $(this).parents("tr").eq(1).find('[data-save="dbName"]').val(),
                    table = $(this).parents("tr").eq(1).find('[data-save="table"]').val();
                str = that[addType](dbName, table)
            } else {
                str = that[addType]();
            }
            $tbody.append(str)
            that.bindChosen()
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
                $leftValue = $tr.find('[data-save="leftValue"]')
            $html = that.renderOPeratorSelect(2, "operator", value, null);
            if (value == "outerSideVariable") {

            }
            $op.replaceWith($html)
        })
        //触发方法的点击
        that.$modal.on("click" + that.NAME_SPACE, ".methods input[type='checkbox']", function () {
            var checkArr = [];
            let $this = $(this),
                value = $this.val(),
                check = $this.prop("checked"),
                $thisParent = $this.parent(),
                $thisParents = $this.parents('tr'),
                parentsAttrArr = $thisParents.attr('data-check');
            if (parentsAttrArr) {
                var attrArr = JSON.parse(parentsAttrArr);
                checkArr = attrArr.concat(checkArr);
            }
            var $thisExper = $this.attr('data-exper'),
                $thisDataName = $this.attr('data-name'),
                $thisName = $thisDataName.replace(/\([^\)]*\)/g, "");
            $thisExper ? value = $thisName : value = value;
            if (check) {
                var maxNum = 0;
                checkArr.push(value);
                maxNum = checkArr.findIndex(ele => ele === value);
                $thisParent.append(`<span class="checked-num" data-value="${value}">${maxNum + 1}</span>`);
            } else {
                var findIdx = checkArr.findIndex(ele => ele === value),
                    parentSib = $thisParent.siblings();
                checkArr.splice(findIdx, 1);
                $thisParent.find('.checked-num').remove();
                if (checkArr.length) {
                    parentSib.each((idx, node) => {
                        var nodeExper = $(node).find('.triggerMethods').attr('data-exper');
                        var triggerVal = '';
                        if (nodeExper) {
                            var triggerDataName = $(node).find('.triggerMethods').attr('data-name');
                            triggerVal = triggerDataName.replace(/\([^\)]*\)/g, "");
                        } else {
                            triggerVal = $(node).find('.triggerMethods').val();
                        }
                        if (checkArr.includes(triggerVal)) {
                            var findCheck = checkArr.findIndex(item => item === triggerVal);
                            $(node).find('.checked-num').text(findCheck + 1);
                        }
                    })
                }
            }
            $this.parents('tr').attr('data-check', JSON.stringify(checkArr));
            let arr = ["save", "upload", "login", "checkAll", "cancelAll", "changeProperty", "copySend", "notify", "saveHTML", "linkHtml", "nextProcess", "executeFn", "importExcel", "importDb", "keySave", "deleteRow", "extendCol"];//zww
            if (!arr.includes(value)) {
                return;
            }
            $target = $this.parents("tr").find(`.${value}`);
            check ? $target.show() : $target.hide()
        })
        that.$modal.on("change" + that.NAME_SPACE, "[data-change='dbName']", function () {
            let $table = $(this).parents("tr").eq(0).find('[data-change="table"]'),
                dbName = $(this).val(),
                $html = that.renderCopySendSelect("table", dbName, null, null, "请选择抄送表", null);
            $table.parent("td").empty().append($html)
            that.bindChosen()

        })
        that.$modal.on("change" + that.NAME_SPACE, "[data-change='table']", function () {
            let $field = $(this).parents("tr").eq(0).find('[data-change="field"]'),
                tableName = $(this).val(),
                dbName = $($(this).parents("tr")[0]).find('[data-change="dbName"]').val(),
                $html = that.renderCopySendSelect("field", dbName, tableName, null, "请选择抄送字段", null);
            $field.parent("td").empty().append($html)
            that.bindChosen()

        })
        that.$modal.on("change" + that.NAME_SPACE, ".changeFieldSplit [data-change='field']", function () {
            let $tr = $(this).parents("tr").eq(0),
                $tr1 = $(this).parents("tr").eq(1),
                dbName = $tr1.find('[data-change="dbName"]').val(),
                table = $tr1.find('[data-change="table"]').val(),
                field = $tr.find('[data-change="field"]').val(),
                $fieldSplit = $tr.find('[data-change="fieldSplit"]'),
                $html = that.renderCopySendSelect("fieldSplit", dbName, table, field, "请选择", null);

            $fieldSplit.parent("td").empty().append($html)
            that.bindChosen()

        })
        //批量设置抄送
        that.$modal.on("click" + that.NAME_SPACE, '.autoCopySend', function () {

            let $tr = $(this).parents("tr").eq(1),
                $table = $(this).parents("table").eq(0),
                dbName = $tr.find('[data-change="dbName"]').val(),
                table = $tr.find('[data-change="table"]').val(),
                element = $("#workspace").find("input"),
                fields = [],
                elementId = [],
                fieldsId = [];
            element.each(function () {
                var id = $(this).attr("id");
                if (id != 'ZZZZ') {
                    elementId.push(id)
                }
            })
            if (dbName && table) {
                AllDbName[dbName][table]['tableDetail'].forEach(item => {
                    fieldsId.push(item.id)
                })
            }
            elementId.forEach((id) => {
                if (fieldsId.includes(id)) {
                    var obj = {
                        "field": id,
                        "fieldSplit": 0,
                        "element": "{" + id + "}",
                        "value": {
                            "type": "Element",
                            "operator": "="
                        }
                    }
                    fields.push(obj)
                }

            })
            var html = that.renderCopySendConfig(dbName, table, fields)
            $table.find("tbody").empty().append(html)

        })
        that.$modal.on("change" + that.NAME_SPACE, '[data-change="value_type"]', function () {
            let value = $(this).val(),
                $op = $(this).parents("tr").eq(0).find('[data-change="value_operator"]'),
                $html = that.renderOPeratorSelect(3, "value_operator", value, null)
            $op.replaceWith($html)
            that.bindChosen()

        })
        that.$modal.on('focusin input', ':text', function () {
            // pm-elem3 添加类名 applied;
            that.$modal.find(":text.active").removeClass("active");
            $(this).addClass('active');
            that.setUsingClass($(this));
        });
        that.$modal.on('click', '.pm-elem3', function () {
            // $(this).toggleClass('applied');
            var $target = that.$modal.find(":text.active"),
                category = $target.data('category');
            if (!category) return;
            var id = $(this).data("id"),
                isWrap = !!$target.data("wrap"),
                isInsert = !!$target.data("insert"),
                originVal = $target.val().split(','),
                val = isWrap ? "{" + id + "}" : $(this).data("id"),
                isExist = originVal.isExist(null, val),
                isAdd = !!$target.data('apply');
            // console.log(id)
            if (isInsert) {
                Common.insertAfterText($target.get(0), val);
            } else if ($(this).hasClass("applied") && isExist) {
                $target.val(originVal.join().replace(new RegExp(val + '[,]*', 'g'), ""));
            } else {
                $target.val(isAdd ? $target.val() + "," + val : val);
            }
            that.setUsingClass($target);
        });
        that.$modal.on("change" + that.NAME_SPACE, "[data-change='linkCustomId']", function () {
            let value = $(this).val(),
                data = that.GLOBAL_JSON[value],
                str = that.renderLinkHTMLParmas(data),
                $linkbody = that.$modal.find(".linkbody");
            $linkbody.empty().append(str)
        })
        that.$modal.on("change" + that.NAME_SPACE, "[data-save='linkType']", function () {
            let type = $(this).val(),
                str = that.renderLinkHTMLSelect("", type),
                $linkCustomId = that.$modal.find(".linkCustomId"),
                $linkbody = that.$modal.find(".linkbody");
            $linkCustomId.empty().append(str);
            $linkbody.empty()
            if (type == "nextProcess") {
                var data = [{
                    key: "isNext",
                    desc: "下一流程",
                    value: ""
                }],
                    html = that.renderLinkHTMLParmas(data)
                $linkbody.append(html)
            }
            that.bindChosen()
        })
        that.$modal.on("click" + that.NAME_SPACE, '.changeView', function () {
            var Viewflag = $(this).is(':checked')
            if (Viewflag) {
                $(that).propModifier3({
                    $source: $("#workspace"),
                    $element: $("#events_modal").find(".clickModal"),
                    $result: null,
                    data: that.events,
                    type: "area"
                })
            } else {
                $(that).propModifier3({
                    $source: $("#workspace"),
                    $element: $("#events_modal").find(".clickModal"),
                    $result: null,
                    data: that.events,
                    type: "defalut"
                })
            }

        })
        that.$modal.on("input change" + that.NAME_SPACE, ".property-color-input", function (event) {
            var $this = $(this),
                target = $this.data('belong');
            that.$modal.find("." + target).val($this.val()).focus().trigger("blur");
            // $("." + target).val($this.val()).focus().trigger("blur");
            $this.val("#FFFFFF");
        })


    },
    execute: function () {
        let that = this
        that.basicEvents(true, that.initData, that.saveData, that.clearData)

    }
}