function NewEventsModal($modal, $element) {
    this.triggerName = 1;
    BaseModal.call(this, $modal, $element)
    this.$tbody = this.$modalBody.find(".table .events_tbbody");
    //怎加一条配置
    this.addItem = this.$modalBody.find(".addAll");
    this.TRIGGER_TYPE = [
        {
            name: "加载",
            value: 'load'
        },
        {
            name: "点击",
            value: "click"
        },
        {
            name: "双击",
            value: "dbclick"
        },
        {
            name: "选择变化",
            value: "change"
        },
        {
            name: "获取焦点",
            value: "focusin"
        },
        {
            name: "文本变化",
            value: "input"
        },
        {
            name: "失去焦点",
            value: "focusout"
        }
    ];
    this.Font_FAMILY = [
        {
            name: "无",
            value: ""
        },
        {
            name: "宋体",
            value: "宋体"
        },
        {
            name: "微软雅黑",
            value: "微软雅黑"
        },
        {
            name: "黑体",
            value: "黑体"
        },
        {
            name: "serif",
            value: "serif"
        }
    ];
    this.FONT_SIZE = [
        {
            name: "无",
            value: ""
        },
        {
            name: "12px",
            value: "12px"
        },
        {
            name: "14px",
            value: "14px"
        },
        {
            name: "16px",
            value: "16px"
        },
        {
            name: "18px",
            value: "18px"
        },
        {
            name: "20px",
            value: "20px"
        },
    ];
    this.data = [{
        publish: {
            type: null,
            key: null,
            data: null
        },
        subscribe: {
            conditions: null,
            property: null,
            query: null,
            custom: null,
            copySend: null,
        }
    }];
    this.METHODS = [];
    this.copySendDbName = [];
    this.evetnsDesc = {};
    //获取客户自定义的事件
    this._initCustomMethods = async function () {
        try {
            var result = await new FileService().readFile("/profiles/custom_methods.json"); //调用commonService中的getFileSync方法
            this.METHODS = result || [];
        } catch(err) {
            return alert('获取配置文件错误！')
        }
    };
    //获取表格查询或则通用查询
    this._initQueryMethods = function () {
        var id = $("#property_id").val();
        if (!id) return;
        var query = new Property().getValue(id, "query");
        if (!DataType.isObject(query)) return;

        var db = query.db;
        if (!DataType.isObject(db)) return;

        var type = db.type,
            name = {
                "common": "通用查询",
                "table": "表格查询"
            } [type],
            value = type + "Query";
        this.METHODS.push({
            name: name,
            value: value
        })
    };
    //清空数据
    this._resetData = function () {
        this.$tbody.empty();
        this.METHODS = [];
    }
    //生成方法
    this.productMethods = function (subscribe) {
        var arr = [];
        if (subscribe.copySend) arr.push("copySend");
        if (subscribe.property) arr.push("changeProperty");
        if (subscribe.notify) arr.push("notify");
        subscribe.query && subscribe.query.forEach(function (item) {
            arr.push(item)
        })
        subscribe.custom && subscribe.custom.forEach(function (item) {
            arr.push(item)
        })
        var str = "";
        this.METHODS.forEach(function (item) {
            str += `<div>
                        <input type="checkbox" value="${item.value}" ${arr.indexOf(item.value)>-1?"checked":""} class="triggerMethods">
                        <span>${item.name}</span>
                    </div>`

        })
        return str
    }
    //生成字体和尺寸 type = family字体  type = size
    this.productFont = function (type, select) {
        var str = ""
        if (type == "family") {
            this.Font_FAMILY.forEach(function (item) {
                str += `<option value="${item.value}" ${ select==item.value? "selected" : ""}>${item.name}</option>`
            })
        }
        if (type == "size") {
            this.FONT_SIZE.forEach(function (item) {
                str += `<option value="${item.value}" ${ select==item.value?"selected":""}>${item.name}</option>`
            })
        }
        return str
    }
    //生成触发类型
    this.triggerTypeOptions = function (check, name) {
        var str = ""
        this.TRIGGER_TYPE.forEach(element => {
            str += `<div>
                        <input type="radio" ${ check == element.value ? "checked": ""} name="${name}" value="${element.value}" data-key="trigger_type" data-desc="triggerType">
                        <span>${element.name}</span>
                    </div>`;
        });
        return str;
    }
    //生成值类型下拉框
    this.typeOfValueOptions = function (tyepeKey, type, select) {
        var defaultType = {
                name: type,
                value: ""
            },
            str = `<select class="form-control" data-key="${tyepeKey}">`,
            options = [defaultType, ...ConditionsHelper.typeConfig];
        options.forEach(function (item) {
            str += `<option value="${item.value}" ${ select == item.value ? "selected" : ""}>${item.name}</option>`
        })
        return `${str}</select>`
    }
    //mode 1 数据库查询配置 mode 2 触发条件配置
    this.operateTypeOptions = function (modeType, $select, type, select) {
        var defaultOption = {
                name: "请选择操作符",
                value: ""
            },
            options = [defaultOption, ...ConditionsHelper.getOperators(modeType, type)],
            $select = $select || this.$tbody.find('[data-key="triggerOperator"]'),
            str = "";
        if (select) {
            options.forEach(function (item) {
                str += `<option value="${item.value}" ${select == item.value ?"selected":""}>${item.name}</option>`
            })
            return str;
        } else {
            $select.empty();
            options.forEach(function (item) {
                str += `<option value="${item.value}">${item.name}</option>`
            })
            $select.append(str)
        }
    }
    //抄送行中的操作符
    this.copySendOperatorOptions = function (modeType, select) {
        var defaultOption = {
                name: "请选择操作符",
                value: ""
            },
            options = [defaultOption, ...ConditionsHelper.getOperators(modeType)],
            str = "";
        options.forEach(function (item) {
            str += `<option value="${item.value}" ${select == item.value?"selected":""}>${item.name}</option>`
        })
        return str;
    }
    //抄送行中的操作类型
    this.copySendTypeOptions = function (select) {
        var str = '',
            defaultOption = {
                name: "请选择类型",
                value: ""
            },
            options = [defaultOption, ...ConditionsHelper.typeConfig];
        options.forEach(function (item) {
            str += `<option value="${item.value}" ${ select == item.value ? "selected" : ""}>${item.name}</option>`
        });
        return str;
    }
    //抄送值类型的数据
    this.copyValueTypeOptions = function (mode, type, select) {
        var str = '',
            defaultOption = {
                name: "请选择操作符",
                value: ""
            },
            options = [defaultOption, ...ConditionsHelper.getOperators(mode, type)]
        options.forEach(function (item) {
            str += `<option value="${item.value}" ${ select == item.value ? "selected" : ""}>${item.name}</option>`
        })
        return str;
    }
    //渲染条件配置
    this.renderCondition = function (conditions) {
        if (!DataType.isArray(conditions)) return "";
        var that = this;
        var str = "";
        conditions.forEach(function (item) {
            str += `<tr class="trigger_conditions">
             <td>
                 ${that.typeOfValueOptions("leftType","请选择左类型",item.leftType)}
             </td>
             <td>
                 <input class="form-control" data-category="conditions" data-wrap="true" data-key="leftValue" type="text" value="${item.leftValue}">
             </td>
             <td>
                 <select class="form-control" data-key="triggerOperator">
                    ${that.operateTypeOptions(2,null,item.leftType,item.operator)}
                 </select>
             </td>
             <td>
                 ${that.typeOfValueOptions("rightType","请选择右类型",item.rightType)}
             </td>
             <td>
                 <input class="form-control" data-category="conditions" data-wrap="true" data-key="rightValue" type="text" value="${item.rightValue}">
             </td>
             <td>
                 <button class="btn btn-danger btn-sm removeTriggerCondition">删除</button>
             </td>
         </tr>`
        })
        return str;
    }
    //渲染属性改变
    this.renderProperty = function (property) {
        if (!DataType.isObject(property)) return "";
        var ids = Object.keys(property),
            propertys = [],
            str = "",
            that = this;
        ids.forEach(function (item) {
            var propertyObj = {};
            propertyObj.id = item
            property[item].forEach(function (citem) {
                propertyObj[citem.name] = citem.value
            })
            propertys.push(propertyObj)
        })
        propertys.forEach(function (item) {
            str += `<tr class="changePropertyTr">
            <td>
                <button class="btn btn-danger btn-sm removeChangeProperty">删除</button>
            </td>
            <td>
                <input type="text" data-category="property" class="form-control" data-type="id" data-name="id" value="${item.id}">
            </td>
            <td>
                <select class="form-control" data-type="style" data-name="fontFamily">
                    ${that.productFont("family",item.fontFamily)}
                </select>
            </td>
            <td>
                <select class="form-control" data-type="style" data-name="fontSize">
                     ${that.productFont("size",item.fontSize)}
                </select>
            </td>
            <td>
                <input type="text" class="form-control" data-type="style" data-name="color" value="${item.color||''}">
            </td>
            <td>
                <input type="text" class="form-control" data-type="style" data-name="backgroundColor" value="${item.backgroundColor||''}">
            </td>
            <td>
                <input type="checkbox" data-type="style" data-name="visibility" ${item.visibility?"checked":""}>
            </td>
            <td>
                <input type="checkbox" data-type="attribute" data-name="disabled" ${item.disabled?"checked":""}>

            </td>
            <td>
                <input type="checkbox" data-type="attribute" data-name="readonly" ${item.readonly?"checked":""}>
            </td>
        </tr>`
        })
        return str;
    }
    //填充下拉抄送数据库，抄送表，抄送列，抄送字段
    this.fillCopySend = function (type, dbName, table, field, fieldSplit) {
        var dbNames = [],
            tables = [],
            fields = [],
            fieldSplits = []
        str = "";
        Object.keys(AllDbName).forEach(function (item) {
            dbNames.push({
                name: item,
                value: item
            })
        })
        if (dbName) {
            Object.keys(AllDbName[dbName]).forEach(function (item) {
                tables.push({
                    name: item,
                    value: item
                })
            })
            if (table) {
                AllDbName[dbName][table].tableDetail.forEach(function (item) {
                    fields.push({
                        name: item.cname,
                        value: item.id
                    })
                    if (item.id == field) {
                        for (var i = 1; i <= item.fieldSplit; i++) {
                            fieldSplits.push({
                                name: "插入",
                                value: i
                            })
                        }
                    }
                })
            }
        }
        if (type == "dbName") {
            str = `<option value="">请选择抄送数据库</option>`
            dbNames.forEach(function (item) {
                str += `<option value="${item.value}" ${ dbName==item.value? "selected" : ""}>${item.name}</option>`
            })
        }
        if (type == "table") {
            str = `<option value="">请选择抄送表格</option>`
            tables.forEach(function (item) {
                str += `<option value="${item.value}" ${ table==item.value? "selected" : ""}>${item.name}(${item.name})</option>`
            })
        }
        if (type == "field") {
            str = `<option value="">请选择抄送字段</option>`
            fields.forEach(function (item) {
                str += `<option value="${item.value}" ${ field==item.value? "selected" : ""}>${item.name}(${item.name})</option>`
            })
        }
        if (type == "fieldSplit") {
            str = `<option value="">请选抄送字段分段</option>`
            fieldSplits.forEach(function (item) {
                str += `<option value="${item.value}" ${ fieldSplit==item.value? "selected" : ""}>${item.name}(${item.value})</option>`
            })
        }
        return str;

    }
    this.renderCopySendCondition = function (conditions, dbName, table, field) {
        if (!DataType.isArray(conditions)) return "";
        var that = this,
            str = "";
        conditions.forEach(function (item) {
            str += ` <tr class="copySendCondition">
            <td>
                <select class="form-control" data-key="copySendConditionField">
                    ${that.fillCopySend("field",dbName,table,field,null)}
                </select>
            </td>
            <td>
                <select class="form-control" data-key="copySendConditionOperator">
                    ${that.copySendOperatorOptions(1,item.operator)}
                </select>
            </td>
            <td>
                <select class="form-control" data-key="copySendConditionType">
                    ${that.copySendTypeOptions(item.type)}
                </select>
            </td>
            <td>
                <input class="form-control" data-category="copySend_conditions" data-key="copySendConditionValue" type="text" value="${item.value}">
            </td>
            <td>
                <button class="btn btn-danger btn-sm removeCopyLine">删除</button>
            </td>
        </tr>`

        })
        return str;

    }
    //渲染数据抄送
    this.renderCopySend = function (copysend) {
        if (!DataType.isArray(copysend)) return "";
        var that = this,
            str = "";

        copysend.forEach(function (item) {
            str += ` <tr class="copySendTr">
            <td>
                <button class="btn btn-danger btn-sm removeCopySend">删除</button>
            </td>
            <td>
                <input type="text" data-category="copySend" class="form-control" value="${item.field}" data-type="copySendElement">
            </td>
            <td>
                <select class="form-control" data-key="state" data-type="copySendState">
                    <option value="1" ${item.state==1?"selected":""}>启用</option>
                    <option value="0" ${item.state==0?"selected":""}>禁用</option>
                </select>
            </td>
            <td>
                <select class="form-control" data-key="dbName" data-type="copySendDbName">
                    ${that.fillCopySend("dbName",item.dbName,null,null,null)}
                </select>
            </td>
            <td>
                <select class="form-control" data-key="table" data-type="copySendTable">
                    ${that.fillCopySend("table",item.dbName,item.table,null,null)}
                </select>
            </td>
            <td>
                <select class="form-control" data-key="field" data-type="copySendField">
                    ${that.fillCopySend("field",item.dbName,item.table,item.field,null)}
                </select>
            </td>
            <td>
                <select class="form-control" data-key="fieldSplit" data-type="copySendFieldSplit">
                    ${that.fillCopySend("fieldSplit",item.dbName,item.table,item.field,item.fieldSplit)}
                </select>
            </td>
            <td>
                <table class="table table-bordered copyLine">
                    <thead>
                        <tr>
                            <th>字段</th>
                            <th>操作符</th>
                            <th>类型</th>
                            <th style="width:80px">数据</th>
                            <th><button class="btn btn-primary btn-sm addCopySendLine">添加</button></th>
                        </tr>
                    </thead>
                    <tbody>
                       ${that.renderCopySendCondition(item.conditions,item.dbName,item.table,item.field)}
                    </tbody>
                </table>
            </td>
            <td>
                <select class="form-control" data-key="copy_value_type">
                    ${that.copySendTypeOptions(item.value?item.value.type:"")}
                </select>
            </td>
            <td>
                <select class="form-control" data-key="copy_value_operator" >
                      ${that.copyValueTypeOptions(3,item.value?item.value.type:null,item.value?item.value.operator:null)}              
                </select>
            </td>
            
        </tr>`
        })
        return str;
    }
    //增加一条事件配置
    this._addItem = function (item) {
        var that = this,
            $str = $(`<tr class="tr">
            <td style="width: 50px">
                <button class="btn btn-danger btn-sm removeAll">删除</button>
            </td>
            <td style="width: 140px">
                ${that.triggerTypeOptions(item.publish.type,that.triggerName++)}
            </td>
            
            <td style="width: 600px">
                <table class="table table-bordered triggerCondition">
                    <thead>
                        <tr>
                            <th class="text-center">左值类型</th>
                            <th class="text-center">左数值</th>
                            <th class="text-center">操作符</th>
                            <th class="text-center">右值类型</th>
                            <th class="text-center">右数值</th>
                            <th><button class="btn btn-primary btn-sm addTriggerCondition">添加</button></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${that.renderCondition(item.subscribe.conditions)}
                    </tbody>
                </table>
            

            <td class="methods" style="width: 90px">
                ${this.productMethods(item.subscribe)}
            </td>

            <td class="condition">
                <div class="notify" ${item.subscribe.notify?"":'style="display:none"'}>
                    <div style="margin-bottom:20px">
                        <span>通知元素</span>
                        <input style="display:inline-block;width:300px;margin-left:10px;" type="text" data-category="notify"  data-apply="add" class="form-control" data-key="notifyEl" value="${item.subscribe.notify||''}">
                    </div>
                </div>
                <div class="changeProperty"  ${item.subscribe.property?"":'style="display:none"'}>
                    <div>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th><button class="btn btn-primary btn-sm addChangeProperty">添加</button></th>
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
                                ${that.renderProperty(item.subscribe.property)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="copySend"  ${item.subscribe.copySend?"":'style="display:none"'}>
                    <div>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th ><button class="btn btn-primary btn-sm addCopySend">添加</button></th>
                                    <th style="width:70px" class="text-center">元素</th>
                                    <th style="width:80px" class="text-center">抄送状态</th>
                                    <th style="width:100px" class="text-center">抄送数据库</th>
                                    <th class="text-center">抄送表</th>
                                    <th class="text-center">抄送列</th>
                                    <th class="text-center">抄送字段</th>
                                    <th class="text-center">抄送行</th>
                                    <th class="text-center">数据类型</th>
                                    <th class="text-center">运算符</th>
                                </tr>
                                
                            </thead>
                            <tbody>
                                ${that.renderCopySend(item.subscribe.copySend)}
                               
                            </tbody>

                        </table>
                    </div>
                </div>
            </td>
            
        </tr>`);
        that.$tbody.append($str)
    }
    //移除表格中的一行
    this._removeItem = function ($tr) {
        $tr.remove()
    }
    //获取触发条件
    this.getTriggerConditions = function (triggerConditions) {
        var conditions = [];
        triggerConditions.each(function () {
            var condition = {};
            condition.leftType = $(this).find('[data-key="leftType"]').val();
            condition.leftValue = $(this).find('[data-key="leftValue"]').val();
            condition.operator = $(this).find('[data-key="triggerOperator"]').val();
            condition.rightType = $(this).find('[data-key="rightType"]').val();
            condition.rightValue = $(this).find('[data-key="rightValue"]').val();
            conditions.push(condition)
        })
        if (conditions.length > 0) {
            return conditions
        } else {
            return null;
        }

    }
    //获取客户自定义的方法
    this.getCustomMethods = function (triggerMethods) {
        var customs = ["save", "upload", "login", "checkAll", "cancelAll", "saveHTML"],
            result = [];
        triggerMethods.each(function () {
            var value = $(this).val();
            if (customs.indexOf(value) > -1) {
                result.push(value)
            }
        })
        if (result.length > 0) {
            return result;
        } else {
            return null
        }
    }
    //判断是否点击了
    this.judgeCheckMehods = function (type, triggerMethods) {
        var result = false;
        triggerMethods.each(function () {
            if ($(this).val() == type) {
                result = true;
            }
        })
        return result;
    }
    //获取抄送配置的配置条件
    this.getCopySendCondition = function ($conditions) {
        var conditions = [];
        $conditions.each(function () {
            var condition = {};
            condition.field = $(this).find('[data-key="copySendConditionField"]').val();
            condition.operator = $(this).find('[data-key="copySendConditionOperator"]').val();
            condition.type = $(this).find('[data-key="copySendConditionType"]').val();
            condition.value = $(this).find('[data-key="copySendConditionValue"]').val();
            conditions.push(condition)
        })
        return conditions
    }
    //获取抄送
    this.getCopySend = function ($copySends) {
        var that = this,
            copySends = [];
        $copySends.each(function () {
            var copysend = {};
            copysend.element = $(this).find('[data-type="copySendElement"]').val(),
                copysend.state = $(this).find('[data-type="copySendState"]').val();
            copysend.dbName = $(this).find('[data-type="copySendDbName"]').val();
            copysend.table = $(this).find('[data-type="copySendTable"]').val();
            copysend.field = $(this).find('[data-type="copySendField"]').val();
            copysend.fieldSplit = Number($(this).find('[data-type="copySendFieldSplit"]').val());
            copysend.value = null;
            var type = $(this).find('[data-type="copy_value_type"]').val(),
                operator = $(this).find('[data-type="copy_value_operator"]').val();
            if (type && operator) {
                copysend.value.type = type;
                copysend.value.operator = operator;
            }
            copysend.conditions = that.getCopySendCondition($(this).find(".copySendCondition"))
            copySends.push(copysend)
        })
        return copySends;
    }
    //获取改变属性
    this.getChangeProperty = function ($propertys) {
        var property = {};
        $propertys.each(function () {
            id = $(this).find('[data-name="id"]').val();
            if (id) {
                property[id] = [];
                var $fontFamily = $(this).find('[data-name="fontFamily"]'),
                    $fontSize = $(this).find('[data-name="fontSize"]'),
                    $color = $(this).find('[data-name="color"]'),
                    $backgroundColor = $(this).find('[data-name="backgroundColor"]'),
                    $visibility = $(this).find('[data-name="visibility"]'),
                    $disabled = $(this).find('[data-name="disabled"]'),
                    $readonly = $(this).find('[data-name="readonly"]');
                if ($fontFamily.val()) {
                    property[id].push({
                        type: $fontFamily.attr("data-type"),
                        name: $fontFamily.attr("data-name"),
                        value: $fontFamily.val()
                    })
                }
                if ($fontSize.val()) {
                    property[id].push({
                        type: $fontSize.attr("data-type"),
                        name: $fontSize.attr("data-name"),
                        value: $fontSize.val()
                    })
                }
                if ($color.val()) {
                    property[id].push({
                        type: $color.attr("data-type"),
                        name: $color.attr("data-name"),
                        value: $color.val()
                    })
                }
                if ($backgroundColor.val()) {
                    property[id].push({
                        type: $backgroundColor.attr("data-type"),
                        name: $backgroundColor.attr("data-name"),
                        value: $backgroundColor.val()
                    })
                }
                property[id].push({
                    type: $visibility.attr("data-type"),
                    name: $visibility.attr("data-name"),
                    value: $visibility.is(":checked")
                })
                property[id].push({
                    type: $disabled.attr("data-type"),
                    name: $disabled.attr("data-name"),
                    value: $disabled.is(":checked")
                })
                property[id].push({
                    type: $readonly.attr("data-type"),
                    name: $readonly.attr("data-name"),
                    value: $readonly.is(":checked")
                })

            }
        })
        return property
    }
    //给点击查看配置时的是否
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
    //渲染描述表格
    this.renderDescribeTable = function (data) {
        var that = this;
        if (!DataType.isObject(data)) return;
        var $target = this.$modal.find(".box"),
            str = `<table class="table table-bordered">
                    <thead>
                        <tr>
                            ${ that.renderTable("head",data.head)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr >
                            ${that.renderTable("body",data.body)}
                        </tr>
                    </tbody>
                </table>`;
        $target.empty();
        $target.append(str);
    }
    this.renderTable = function (type, data) {
        if (!DataType.isArray(data)) return;
        var str = ""
        if (type == "head") {
            data.forEach(function (item) {
                str += `<th class="text-center">${item}</th>`;
            })
        }
        if (type == "body") {
            data.forEach(function (item) {
                str += `<td class="text-center">${item}</td>`;
            })
        }
        return str
    }

}
NewEventsModal.prototype = {
    initData: async function (data) {
                
        var that = this;
        that._resetData();
        that._initCustomMethods().then(() => {
            that._initQueryMethods();
        }).then(async () => {
            if (!Array.isArray(data)) { //如果data不是一个数组 添加一个默认值
                data = that.data
            }
            try {
                var desc  = await new FileService().readFile("/profiles/events_desc.json")
                that.evetnsDesc = desc || {
                    triggerType: {}
                }
                $(this).propModifier3({
                    $source: $("#workspace"),
                    $element: $("#events_modal").find(".clickModal"),
                    $result: null,
                    data: data
                })
                data.forEach(function (item) {
                    that._addItem(item)
                })
            } catch(err) {
                return alert('获取配置文件错误！')
            }
        })
    },
    saveData: function () {
        var id = $("#property_id").val();
        if (!id) return;
        var that = this,
            result = [];
        that.$modalBody.find(".tr").each(function (index) {
            var trigger_type = $(this).find('[data-key="trigger_type"]:checked').val(),
                trigger_key = [id, trigger_type, "SPP" + index].join("_"),
                trigger_data = null,
                trigger_conditions = that.getTriggerConditions($(this).find('.trigger_conditions')),
                trigger_custom_methods = that.getCustomMethods($(this).find(".triggerMethods:checked")),
                copySend = null,
                property = null,
                notify = null,
                query = null;
            if (that.judgeCheckMehods("commonQuery", $(this).find(".triggerMethods:checked"))) {
                query = []
                query.push("commonQuery")
            }
            if (that.judgeCheckMehods("tableQuery", $(this).find(".triggerMethods:checked"))) {
                query = []
                query.push("tableQuery")
            }
            //判断抄送是否点击
            if (that.judgeCheckMehods("copySend", $(this).find(".triggerMethods:checked"))) {
                copySend = that.getCopySend($(this).find('.copySendTr'))
            }
            if (that.judgeCheckMehods("changeProperty", $(this).find(".triggerMethods:checked"))) {
                property = that.getChangeProperty($(this).find(".changePropertyTr"))
            }
            if (that.judgeCheckMehods("notify", $(this).find(".triggerMethods:checked"))) {
                var arr = $(this).find('[data-key="notifyEl"]').val().split(",")
                notify = []
                arr.forEach(function (item) {
                    if (item) {
                        notify.push(item)
                    }
                })
            }
            if (trigger_type) {
                result.push({
                    publish: {
                        type: trigger_type,
                        key: trigger_key,
                        data: trigger_data,
                    },
                    subscribe: {
                        conditions: trigger_conditions,
                        custom: trigger_custom_methods,
                        copySend: copySend,
                        property: property,
                        notify: notify,
                        query: query
                    }
                })
            }

        })
        that.$element.val(JSON.stringify(result))
        var $workspace = $("#workspace"),//获取工作区
        $control = $workspace.find("#" + id);//获取对应id的元素
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);//实例化property调用save方法

    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val(); //获取编号id
        if (!id) { //如果编号id不存在
            that.$modal.modal("hide"); //弹窗关闭
        } else {
            var result = confirm("确定要清除触发配置数据吗？"); //提示是否
            if (!result) return; //如果取消退出函数

            that._resetData(); //调用_resetData
            that.$element.val(""); //将$element设置为空
            new Property().remove(id, "events"); //调用property的remove方法
            that.$modal.modal("hide"); //弹窗隐藏
        }
    },
    bindEvents: function () {
        var that = this;
        //添加一条配置
        that.addItem.on("click", function () {
            that.data.forEach(function (item) {
                that._addItem(item)
            })
        })
        //减少一条配置
        that.$modal.on("click", ".removeAll", function () {
            var $tr = $(this).parents("tr");
            that._removeItem($tr)
        })
        //左类型或则右类型变换时
        that.$modal.on("change", '[data-key="leftType"]', function (event) {
            event.stopPropagation();
            var value = $(this).val(),
                $tr = $($(this).parents("tr")[0]);
            $select = $tr.find('[data-key="triggerOperator"]');
            that.operateTypeOptions(2, $select, value)
        })
        //移除条件配置
        that.$modal.on("click", ".removeTriggerCondition", function () {
            var $tr = $(this).parents("tr")[0];
            that._removeItem($tr)
        })
        //添加触发条件
        that.$modal.on("click", ".addTriggerCondition", function () {
            var $tbody = $($(this).parents("table")[0]).find("tbody"),
                str = `<tr class="trigger_conditions"><td>${that.typeOfValueOptions("leftType","请选择左类型")}</td>
                    <td><input class="form-control" data-category="conditions" data-wrap="true" data-key="leftValue" type="text"></td>
                    <td>
                        <select class="form-control" data-key="triggerOperator">
                            <option value="">请选择操作符</option>
                        </select>
                    </td>
                    <td>
                        ${that.typeOfValueOptions("rightType","请选择右类型")}
                    </td>
                    <td>
                        <input class="form-control" data-category="conditions" data-wrap="true" data-key="rightValue" type="text">
                    </td>
                    <td>
                        <button class="btn btn-danger btn-sm removeTriggerCondition">删除</button>
                    </td>
                </tr>`
            $tbody.append(str)
        })
        //选择对应的方法显示隐藏配置信息
        that.$modal.on("click", '.methods input[type="checkbox"]', function () {
            var value = $(this).val(),
                check = $(this).prop("checked"),
                $copySendTable = $(this).parents("tr").find(".copySend"),
                $changeProperty = $(this).parents("tr").find(".changeProperty");
            $notify = $(this).parents("tr").find(".notify")
            if (value == "changeProperty") {
                check ? $changeProperty.show() : $changeProperty.hide()
            }
            if (value == "copySend") {
                check ? $copySendTable.show() : $copySendTable.hide()
            }
            if (value == "notify") {
                check ? $notify.show() : $notify.hide()
            }
        })
        //增加属性改变栏
        that.$modal.on("click", ".addChangeProperty", function () {
            var $tbody = $($(this).parents("table")[0]).find("tbody"),
                str = `<tr  class="changePropertyTr">
                <td>
                    <button class="btn btn-danger btn-sm removeChangeProperty">删除</button>
                </td>
               <td>
                   <input type="text" data-category="property" class="form-control" data-type="id" data-name="id">
               </td>
               <td>
                   <select class="form-control" data-type="style" data-name="fontFamily">
                       ${that.productFont("family")}
                   </select>
               </td>
               <td>
                   <select class="form-control" data-type="style" data-name="fontSize">
                        ${that.productFont("size")}
                   </select>
               </td>
               <td>
                   <input type="text" class="form-control" data-type="style" data-name="color">
               </td>
               <td>
                   <input type="text" class="form-control" data-type="style" data-name="backgroundColor">
               </td>
               <td>
                   <input type="checkbox" data-type="style" data-name="visibility">
               </td>
               <td>
                   <input type="checkbox" data-type="attribute" data-name="disabled">

               </td>
               <td>
                   <input type="checkbox" data-type="attribute" data-name="readonly">
               </td>
           </tr>`;
            $tbody.append(str)
        })
        //删除属性改变栏
        that.$modal.on("click", ".removeChangeProperty", function () {
            var $tr = $(this).parents("tr")[0];
            that._removeItem($tr)
        })
        //添加抄送行
        that.$modal.on("click", ".addCopySendLine", function () {
            var $tbody = $($(this).parents("table")[0]).find("tbody"),
                dbName = $($(this).parents("table")[1]).find("[data-key='dbName']").val(),
                table = $($(this).parents("table")[1]).find("[data-key='table']").val(),
                str = `<tr class="copySendCondition">
                <td>
                    <select class="form-control" data-key="copySendConditionField">
                    ${that.fillCopySend("field",dbName,table,null,null)}
                    </select>
                </td>
                <td>
                    <select class="form-control" data-key="copySendConditionOperator">
                        ${that.copySendOperatorOptions(1)}
                    </select>
                </td>
                <td>
                    <select class="form-control" data-key="copySendConditionType">
                        ${that.copySendTypeOptions()}
                    </select>
                </td>
                <td>
                    <input class="form-control" data-key="copySendConditionValue" type="text">
                </td>
                <td>
                    <button class="btn btn-danger btn-sm removeCopyLine">删除</button>
                </td>
            </tr>`;
            $tbody.append(str);
        })
        //移除抄送行
        that.$modal.on("click", ".removeCopyLine", function () {
            var $tr = $(this).parents("tr")[0];
            that._removeItem($tr)
        })
        //添加抄送配置
        that.$modal.on("click", ".addCopySend", function () {
            var $tbody = $($(this).parents("table")[0]).find("tbody").eq(0),
                str = ` <tr class="copySendTr">
                <td>
                    <button class="btn btn-danger btn-sm removeCopySend">删除</button>
                </td>
                <td>
                    <input type="text" data-category="copySend" class="form-control" data-type="copySendElement">
                </td>
                <td>
                    <select class="form-control" data-key="state" data-type="copySendState">
                        <option value="1">启用</option>
                        <option value="0">禁用</option>
                    </select>
                </td>
                <td>
                    <select class="form-control" data-key="dbName" data-type="copySendDbName">
                        ${that.fillCopySend("dbName",null,null,null,null)}
                    </select>
                </td>
                <td>
                    <select class="form-control" data-key="table" data-type="copySendTable">
                        <option value="" selected="">请选择抄送表</option>
                    </select>
                </td>
                <td>
                    <select class="form-control" data-key="field" data-type="copySendField">
                        <option value="" selected="">请选择抄送列</option>
                    </select>
                </td>
                <td>
                    <select class="form-control" data-key="fieldSplit" data-type="copySendFieldSplit">
                        <option value="" selected="">请选择抄送字段</option>
                    </select>
                </td>
                <td>
                    <table class="table table-bordered copyLine">
                        <thead>
                            <tr>
                                <th>字段</th>
                                <th>操作符</th>
                                <th>类型</th>
                                <th style="wisth:80px">数据</th>
                                <th><button class="btn btn-primary btn-sm addCopySendLine">添加</button></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <select class="form-control" data-key="field">
                                        <option value="">请选择字段</option>
                                    </select>
                                </td>
                                <td>
                                    <select class="form-control" data-key="operator">
                                        <option value="" selected="">请选择操作符</option>
                                        <option value="=">等于</option>
                                        <option value="<>">不等于</option>
                                        <option value="like">模糊匹配</option>
                                        <option value=">">大于</option>
                                        <option value=">=">大于等于</option>
                                        <option value="<">小于</option>
                                        <option value="<=">小于等于</option>
                                    </select>
                                </td>
                                <td>
                                    <select class="form-control" data-key="type">
                                        <option value="" selected="">请选择类型</option>
                                        <option value="String">字符串</option>
                                        <option value="Number">数字</option>
                                        <option value="Element">元素</option>
                                        <option value="QueryString">查询字符串</option>
                                    </select>
                                </td>
                                <td>
                                    <input class="form-control" data-key="value" type="text">
                                </td>
                                <td>
                                    <button class="btn btn-danger btn-sm removeCopyLine">删除</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
                <td>
                    <select class="form-control" data-key="copy_value_type">
                        <option value="" selected="">数据类型</option>
                        <option value="String">字符串</option>
                        <option value="Number">数字</option>
                        <option value="Element">元素</option>
                        <option value="QueryString">查询字符串</option>
                    </select>
                </td>
                <td>
                    <select class="form-control" data-key="copy_value_operator">
                        <option value="" selected="">运算符</option>
                        <option value="=">赋值</option>
                        <option value="+">自增</option>
                        <option value="-">自减</option>
                        <option value="*">自乘</option>
                        <option value="/">自除</option>
                    </select>
                </td>
                
            </tr>`;
            $tbody.append(str)
        })
        //移除抄送配置
        that.$modal.on("click", ".removeCopySend", function () {
            var $tr = $(this).parents("tr")[0];
            that._removeItem($tr)
        })
        //抄送数据库
        that.$modal.on("change", '[data-key="dbName"]', function () {
            var $tableSelect = $($(this).parents("tr")[0]).find('[data-key ="table"]'),
                dbName = $(this).val(),
                tableOptions = [];
            if (dbName) {
                Object.keys(AllDbName[dbName]).forEach(function (item) {
                    tableOptions.push({
                        name: item,
                        value: item
                    })
                })
            }
            Common.fillSelect($tableSelect, {
                name: "请选择抄送表",
                value: ""
            }, tableOptions, null, true)
        })
        //抄送表
        that.$modal.on("change", '[data-key="table"]', function () {
            var $fieldSelect = $($(this).parents("tr")[0]).find('[data-key="field"]'),
                table = $(this).val(),
                dbName = $($(this).parents("tr")[0]).find('[data-key="dbName"]').val(),
                fieldOptions = [];
            if (dbName && table) {
                AllDbName[dbName][table].tableDetail.forEach(function (item) {
                    fieldOptions.push({
                        name: item.cname,
                        value: item.id
                    })
                })
            }
            Common.fillSelect($fieldSelect, {
                name: "请选择字段",
                value: ""
            }, fieldOptions, null, true)
        });
        //处理字段属性
        that.$modal.on("change", '[data-key="field"]', function () {
            var $fieldSplitSelect = $($(this).parents("tr")[0]).find('[data-key="fieldSplit"]'),
                dbName = $($(this).parents("tr")[0]).find('[data-key="dbName"]').val(),
                table = $($(this).parents("tr")[0]).find('[data-key="table"]').val(),
                field = $($(this).parents("tr")[0]).find('[data-key="field"]').val(),
                fieldSplit = "",
                fieldSplitOptions = [];
            if (dbName && table && field) {
                AllDbName[dbName][table].tableDetail.forEach(function (item) {
                    if (item.id == field) {
                        fieldSplit = item.fieldSplit
                    }
                })
                for (var i = 1; i <= fieldSplit; i++) {
                    fieldSplitOptions.push({
                        name: "插入",
                        value: i
                    })
                }
            }
            Common.fillSelect($fieldSplitSelect, {
                name: "插入",
                value: ""
            }, fieldSplitOptions, null, true)
        })
        //处理抄送类型变化时抄送值变化
        that.$modal.on("change", '[data-key="copy_value_type"]', function () {
            var value = $(this).val(),
                $operator = $(this).parent("td").next("td").find('[data-key="copy_value_operator"]');
            $operator.empty();
            var str = that.copyValueTypeOptions(3, value, null)
            $operator.append(str)
        })
        //当点击选中元素
        that.$modal.on('click', '.pm-elem3', function () {
            // $(this).toggleClass('applied');
            var $target = that.$modal.find(":text.active"),
                category = $target.data('category');
            if (!category) return;
            var id = $(this).data("id"),
                isWrap = !!$target.data("wrap"),
                originVal = $target.val().split(','),
                val = isWrap ? "{" + id + "}" : $(this).data("id"),
                isExist = originVal.isExist(null, val),
                isAdd = !!$target.data('apply');
            console.log(isExist);

            if ($(this).hasClass("applied") && isExist) {
                $target.val(originVal.join().replace(new RegExp(val + '[,]*', 'g'), ""));
            } else {
                $target.val(isAdd ? $target.val() + "," + val : val);
            }
            that.setUsingClass($target);
        });
        //点击输入框
        that.$modal.on('focusin input', ':text', function () {
            // pm-elem3 添加类名 applied;
            that.$modal.find(":text.active").removeClass("active");
            $(this).addClass('active');
            that.setUsingClass($(this));
        });
        //点击触发类型加载描述
        that.$modal.on("click", '[data-desc="triggerType"]', function () {
            console.log($(this).data())
            var value = $(this).val(),
                data = {
                    head: that.evetnsDesc.triggerType.head,
                    body: that.evetnsDesc.triggerType[value],
                }
            that.renderDescribeTable(data)
        })

    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    }
}