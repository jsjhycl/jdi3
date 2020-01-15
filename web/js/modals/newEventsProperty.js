/**
 * 用于处理事件中的 属性数据。属性查询 属性处理 属性渲染配置
 */
function newEventsProperty() {
    this.NAME_SPACE = ".EVENTSPROPERTY"
    this.$events = $("#events_modal")
    this.operationOptions = [{
            name: "值不变",
            value: "origin"
        },
        {
            name: "起始值",
            value: "start"
        },
        {
            name: "终止值",
            value: "end"
        },
    ]
    this.NumberType = [{
            name: "自然数",
            value: "dayTime"
        },
        {
            name: "数字",
            value: "number"
        },
        {
            name: "字母",
            value: "letter"
        }
    ]


    /**
     * 
     * @param {*} defaultOption //默认下来列表选线
     * @param {*} options //选项
     * @param {*} selectedValue //选中值
     * @param {*} isPrompt //是否带选中值
     * @param {*} SelectClass //下来列表的class
     * @param {*} isAppend //是否添加到
     * @param {*} appendTo //添加到
     */
    this._renderSelect = function (defaultOption, options, selectedValue, isPrompt, selectClass, attr, isAppend, appendTo) {
        if (!Array.isArray(options)) {
            options = []
        }
        isPrompt = !!isPrompt;
        isAppend = !!isAppend;
        var data = Array.prototype.slice.call(options, 0);
        if (DataType.isObject(defaultOption)) {
            data.unshift(defaultOption)
        }
        var html = `<select class="${selectClass}">`;
        data.forEach(item => {
            var value = item.value,
                prompt = "",
                selected = "";
            if (isPrompt && value) {
                prompt = `(${value})`
            }
            if (value == selectedValue) {
                selected = "selected"
            }
            html += `<option value="${value}" ${selected}>${item.name}${prompt}</option>`
        });
        html += `</select>`
        var $select = $(html);
        $select.attr(attr);
        isAppend && appendTo($select.get(0).outerHTML);
        return $select.get(0).outerHTML
    }
    this._renderFieldsCheckBox = function (fields, selectFields) {
        var that = this,
            str = "";
        fields.forEach(function (item) {
            str += `<label title="${item.value}" class="checkbox-inline">
                        <input type="checkbox" name="${item.name}" ${selectFields.includes(item.value)?"checked":""} value="${item.value}">${item.name}(${item.value})
                    </label>`
        });
        return str;
    }
    this._renderQueryCondition = function (dbName, tableName, conditions) {
        var that = this,
            str = "";
        str = `<table class="table table-bordered">
                    <thead>
                        <tr>
                            <th class="text-center">字段</th>
                            <th class="text-center">操作符</th>
                            <th class="text-center">数据类型</th>
                            <th class="text-center">数据</th>
                            <th><span class="add" data-add="renderCopySendCondition">＋</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${that._renderConditionTr(dbName, tableName, conditions)}
                    </tbody>
               </table>`
        return str;
    }
    //渲染查询的
    this._renderConditionTr = function (dbName, table, conditions) {
        var that = this,
            str = "";
        if (!Array.isArray(conditions)) return str;
        conditions.forEach(item => {
            str += `<tr class="tr copySendCondition">
                        <td>
                           ${that._renderConditionFields(dbName,table,item.field)}
                        </td>
                        <td>
                            ${that._renderQueryOpearation(item.operator)}       
                        </td>
                        <td>
                           ${that._renderQueryType(item.type)}
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

    //渲染属性查询的Tr
    this._renderPropertyDataTr = function (propertyData) {
        var that = this,
            str = "",
            propertyData = propertyData ? propertyData : {},
            dbName = propertyData.query ? propertyData.query.dbName : "",
            tableName = propertyData.query ? propertyData.query.table : "",
            conditions = propertyData.query ? propertyData.query.conditions : [],
            fields = propertyData.query ? propertyData.query.fields : [];
        str += `<tr class="tr propertyDataTr">
            <td>${that._renderCustomVariable(propertyData.variable)}</td>
            <td>${that._renderDbNameSelect(dbName)}</td>
            <td>${that._renderTableNameSelect(dbName,tableName)}</td>
            <td>${that._renderQueryCondition(dbName,tableName,conditions)}</td>
            <td class="queryFields checkboxField">${that._renderQueryFields(dbName,tableName,fields)}</td>
            </tr>`
        return str;
    }
    //渲染自定义变量下拉列表
    this._renderCustomVariable = function (selectedValue) {
        var that = this,
            defaultOption = {
                name: "请选择自定义变量",
                value: ""
            },
            options = [],
            selectedValue = selectedValue,
            isPrompt = true,
            selectClass = "from-control chosen",
            attr = {
                "data-save": "variable",
                "data-change": "variable"
            }
        GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item) {
            var option = {
                name: item.desc,
                value: item.key
            }
            options.push(option)
        })
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    //渲染数据库下拉列表
    this._renderDbNameSelect = function (selectedValue) {
        var that = this,
            defaultOption = {
                name: "请选择数据库",
                value: ""
            },
            options = new BuildTableJson().getOptions(AllDbName, "dbName", {}),
            selectedValue = selectedValue,
            isPrompt = false,
            selectClass = "from-control chosen",
            attr = {
                "data-save": "dbName",
                "data-change": "dbName"
            };
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    //渲染表下拉列表
    this._renderTableNameSelect = function (dbName, selectedValue) {
        var that = this,
            defaultOption = {
                name: "请选择数据表",
                value: ""
            },
            options = new BuildTableJson().getOptions(AllDbName, "table", {
                dbName: dbName
            }),
            selectedValue = selectedValue,
            isPrompt = true,
            selectClass = "from-control chosen",
            attr = {
                "data-save": "table",
                "data-change": "table"
            };
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)

    }
    //渲染字段下拉列表
    this._renderConditionFields = function (dbName, tableName, selectField) {
        var that = this,
            defaultOption = {
                name: "请选择列",
                value: ""
            },
            options = new BuildTableJson().getOptions(AllDbName, "field", {
                dbName: dbName,
                table: tableName
            }),
            selectedValue = selectField,
            isPrompt = true,
            selectClass = "from-control chosen",
            attr = {
                "data-save": "field",
                "data-change": "field"
            };
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    //渲染查询操作符
    this._renderQueryOpearation = function (selectedValue) {
        var that = this,
            defaultOption = {
                name: "请选择操作符",
                value: ""
            },
            options = ConditionsHelper.getOperators(1),
            selectedValue = selectedValue,
            isPrompt = false,
            selectClass = "from-control chosen",
            attr = {
                "data-save": "condition_operator",
                "data-change": "condition_operator"
            };
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)

    }
    //渲染查询的数据类型
    this._renderQueryType = function (selectedValue) {
        var that = this,
            defaultOption = "",
            options = ConditionsHelper.copySendConfig,
            selectedValue = selectedValue,
            isPrompt = false,
            selectClass = "from-control chosen",
            attr = {
                "data-save": "condition_type",
                "data-change": "condition_type"
            };
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    //渲染查询字段的选择字段
    this._renderQueryFields = function (dbName, tableName, selectFields) {
        var that = this,
            fields = new BuildTableJson().getOptions(AllDbName, "field", {
                dbName: dbName,
                table: tableName
            });
        return that._renderFieldsCheckBox(fields, selectFields)
    }
    //获取查询属性
    this._getQueryCondition = function ($conditions) {
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
    //获取字段
    this._getFields = function ($target) {
        var result = [];
        $target.find("input:checked").each(function () {
            result.push($(this).val())
        })
        return result;
    }
    //渲染属性查询的字段
    this._renderPropertyQueryFields = function (variable, selectFields) {
        var that = this,
            propertyData = "";
        GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item, index) {
            if (item.key == variable) {
                propertyData = item.propertyData ? JSON.parse(item.propertyData) : "";
            }
        })
        if (!DataType.isObject(propertyData)) {
            return "";
            // return alert(`请先配置自定义变量${variable}的属性数据`)
        }
        var dbName = propertyData.query.dbName,
            tableName = propertyData.query.table,
            propertyDataFields = propertyData.query.fields,
            tableFields = new BuildTableJson().getOptions(AllDbName, "field", {
                dbName: dbName,
                table: tableName
            }),
            fields = [];
        tableFields.forEach(function (item) {
            if (propertyDataFields.includes(item.value)) {
                fields.push(item)
            }
        })

        return that._renderFieldsCheckBox(fields, selectFields)

    }
    //渲染数据处理的表
    this._renderPropertyHandleTr = function (propertyHandle) {
        var that = this,
            str = "";
        // if (propertyHandle.length == 0) {
        //     GLOBAL_PROPERTY && GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable.forEach(item => {
        //         if (item.key == variable) {
        //             propertyHandle = item.propertyHandle ? JSON.parse(item.propertyHandle).fields : []
        //         }
        //     })
        // }
        propertyHandle.forEach(item => {
            str += `<tr class="propertyHandleConfig">
                <td><input type="text" class="form-control" data-save="field" disabled="disabled" value="${item.field}"></td>
                <td>${that._renderPropertyHandleOperation(item.operation)}</td>
                <td>
                    ${that._renderPropertyHandleType(item.type)}
                </td>
            </tr>`
        })
        return str
    }
    //渲染属性处理的操作类型
    this._renderPropertyHandleOperation = function (selectedValue) {
        var that = this,
            defaultOption = {
                name: "请选择操作类型",
                value: ""
            },
            options = that.operationOptions,
            selectedValue = selectedValue,
            isPrompt = true,
            selectClass = "form-control chosen",
            attr = {
                "data-save": "operation",
                "data-change": "operation"
            };

        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    //渲染属性处理的值类型
    this._renderPropertyHandleType = function (selectedValue) {
        var that = this,
            defaultOption = {
                name: "请选择值类型",
                value: ""
            },
            options = that.NumberType,
            selectedValue = selectedValue,
            isPrompt = true,
            selectClass = "form-control chosen",
            attr = {
                "data-save": "type",
                "data-change": "type"
            };

        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    this._renderPropertyRenderTr = function (propertyRender) {
        var that = this;
        str = `<tr class="propertyRenderTr">
                            <td>${that._renderCustomVariable(propertyRender.variable||"")}</td>
                            <td>${that._renderPropertyRenderFields(propertyRender.variable ,propertyRender.Xaxis, true)}</td>
                            <td>${that._renderPropertyRenderYaxis(propertyRender.variable, propertyRender.Yaxis)}</td>
                            <td class="propertyRenderContent">${that._renderPropertyRenderContent(propertyRender.variable, propertyRender.content)}</td>
                            <td>${that._renderPropertyRenderType(propertyRender.renderType)}</td>
                            <td><input type="text" class="form-control" data-save="renderPositoon" value="${propertyRender.renderPositoon}"></td>
                            <td style="position:relative">
                                <input type="text" class="form-control render-color" save-type="style" data-save="color" value="${ propertyRender.renderColor || ""}">
                                <div class="property-icon-wrap">
                                    <input type="color" data-belong="render-color" class="property-color-input">
                                <i class="icon icon-color"></i>
                            </td>
                            <td>
                                <input type="text" class="form-control" data-save="colWidth" value="${propertyRender.ColWisth}">
                            </td>
                        </tr>`
        return str;
    }
    //渲染属性渲染中的字段选择问题
    this._renderPropertyRenderFields = function (variable, selectedValue, isXAxis) {
        var that = this,
            att = isXAxis ? "XAxis" : "Yaxis",
            defaultOption = {
                name: "请选择",
                value: ""
            },
            options = that._getpropertyRenderXYoption(variable),
            selectedValue = selectedValue,
            isPrompt = true,
            selectClass = "from-control chosen",
            attr = {
                "data-save": att,
                "data-change": att
            };
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    this._getpropertyRenderXYoption = function (variable) {
        var options = [],
            selects = [],
            fields = [];
        GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item) {
            if (variable == item.key) {
                var propertyData = JSON.parse(item.propertyData) || {},
                    propertyQuery = JSON.parse(item.propertyQuery) || {},
                    dbName = propertyData.query ? propertyData.query.dbName : "",
                    table = propertyData.query ? propertyData.query.table : "";
                selects = propertyQuery.fields,
                    fields = new BuildTableJson().getOptions(AllDbName, "field", {
                        dbName: dbName,
                        table: table
                    });
            }
        })
        fields.forEach(item => {
            if (selects.includes(item.value)) {
                options.push(item)
            }
        })
        return options;
    }
    //属性渲染的渲染类型
    this._renderPropertyRenderType = function (selectedValue) {
        var that = this,
            defaultOption = {
                name: "请选择渲染类型",
                value: ""
            },
            options = [{
                name: '累加',
                value: '0'
            }, {
                name: '替换',
                value: '1'
            }],
            selectedValue = selectedValue,
            isPrompt = false,
            selectClass = "form-control chosen",
            attr = {
                "data-save": "renderType",
                "data-change": "renderType"
            };
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    //属性渲染的位置
    this._renderPropertyRenderPostiion = function (selectedValue) {
        var that = this,
            defaultOption = {
                name: "请选择渲染类型",
                value: ""
            },
            options = [{
                name: '',
                value: '0'
            }, {
                name: '替换',
                value: '1'
            }],
            selectedValue = selectedValue,
            isPrompt = false,
            selectClass = "form-control chosen",
            attr = {
                "data-save": "renderType",
                "data-change": "renderType"
            };
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    this._renderPropertyRenderYaxis = function (variable, Yaxis) {
        var that = this,
            str = `<table class="table table-bordered" style="margin-bottom: 0px;">
                    <thead>
                        <tr>
                            <th class="text-center">字段</th>
                            <th class="text-center">分割</th>
                            <th class="text-center"><span class="add" data-add="propertyRenderYaxis">+</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${that.propertyRenderYaxis(variable,Yaxis)}
                    </tbody>
                    </table>`
        return str;
    }
    this.propertyRenderYaxis = function (variable, Yaxis) {
        var that = this,
            str = "";

        Yaxis && Yaxis.forEach(item => {
            str += `<tr class="YaxisTr">
                        <td>${that._renderPropertyRenderFields(variable,item.name)}</td>
                        <td><input type="text" class="form-control" value="${item.split}" data-save="split"></td>
                        <td><span class="del">×</span></td>
                </tr>`
        })
        return str;
    }
    this._renderPropertyRenderContent = function (variable, content) {
        var that = this,
            options = that._getpropertyRenderXYoption(variable);
        return that._renderFieldsCheckBox(options, content);
    }
    this._getYaxis = function ($target) {
        var that = this,
            result = [];
        $target.each(function () {
            var config = {};
            config.name = $(this).find("[data-save='Yaxis']").val()
            config.split = $(this).find("[data-save='split']").val()
            result.push(config)
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


}
newEventsProperty.prototype = {
    //渲染属性数据
    renderPropertyQueryData: function (propertyData) {
        var that = this,
            str = `<div class="conditoion propertyData" ${propertyData ? "" : 'style="display:none"'}>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th class="text-center">选择自定义变量</th>
                                    <th class="text-center">选择数据库</th>
                                    <th class="text-center">选择数据表</th>
                                    <th class="text-center">查询条件</th>
                                    <th class="text-center" style="width:600px">选择字段</th>
                                </tr>
                            </thead>
                            <tbody>
                               ${that._renderPropertyDataTr(propertyData)}
                            </tbody>
                        </table>
                   </div>`;
        return str;
    },
    //渲染属性查询
    renderPropertyQuery: function (propertyQuery) {

        var that = this,
            variable = propertyQuery ? propertyQuery.variable : "",
            selectFields = propertyQuery ? propertyQuery.fields : [],
            str = `<div class="condition propertyQuery" ${propertyQuery ? "" : 'style="display:none"'}>
                        <table class = "table table-bordered">
                            <thead>
                                <tr>
                                    <th class="text-center">请选择自定义变量</th>
                                    <th class="text-center" style="width:500px">请选择字段</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="propertyQueryTr">
                                    <td>${that._renderCustomVariable(variable)}</td>
                                    <td class="propertyQueryFields">${that._renderPropertyQueryFields(variable,selectFields)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>`
        return str;
    },
    //渲染属性处理
    renderPropertyHandle: function (propertyHandle) {
        var that = this,
            variable = propertyHandle ? propertyHandle.variable : "",
            handles = propertyHandle ? propertyHandle.handles : [],
            str = `<div class="condition propertyHandle" ${propertyHandle?"":'style="display:none"'}>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="text-center">自定义变量</th>
                                <th class="text-center">字段</th>
                                <th class="text-center">操作类型</th>
                                <th class="text-center">数值类型</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="propertyHandleVariable">
                                <td rowspan="${handles.length+1}">
                                    ${that._renderCustomVariable(variable)}
                                </td>
                            </tr>
                            ${that._renderPropertyHandleTr(handles)}
                        </tbody>
                    </table>
                </div>`
        return str;

    },
    propertyRender: function (propertyRender) {
        if (!propertyRender) {
            propertyRender = {}
        }
        var that = this,
            str = `<div class="condition propertyRender" ${propertyRender.variable?"":'style="display:none"'}>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th class="text-center">自定义变量</th>
                            <th class="text-center">X轴</th>
                            <th class="text-center">Y轴</th>
                            <th class="text-center">渲染内容</th>
                            <th class="text-center">渲染类型</th>
                            <th class="text-center">渲染位置</th>
                            <th class="text-center">渲染颜色</th>
                            <th class="text-center">列宽</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${that._renderPropertyRenderTr(propertyRender)}
                    </tbody>
                </table>
            </div>`;
        return str;
    },
    //获取属性数据
    getPropertyData: function ($tr) {
        var that = this,
            result = {};
        $tr.each(function () {
            result.variable = $(this).find('[data-save="variable"]').val(),
                result.query = {},
                result.query.dbName = $(this).find('[data-save="dbName"]').val(),
                result.query.table = $(this).find('[data-save="table"]').val(),
                result.query.conditions = that._getQueryCondition($(this).find(".copySendCondition")),
                result.query.fields = that._getFields($(this).find(".checkboxField"));
        })
        return result;
    },
    //获取属性查询
    getPropertyQuery: function ($tr) {
        var that = this,
            propertyQuery = {};
        $tr.each(function () {
            propertyQuery.variable = $(this).find('[data-save="variable"]').val();
            propertyQuery.fields = that._getFields($(this).find(".propertyQueryFields"))
        })
        GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item, index) {
            if (item.key == propertyQuery.variable) {
                GLOBAL_PROPERTY.BODY.customVariable[index].propertyQuery = JSON.stringify(propertyQuery)
            }
        })
        return propertyQuery;
    },
    //获取属性处理
    getPropertyHandle: function () {
        var that = this,
            result = {
                variable: "",
                handles: []
            },
            $variableTr = that.$events.find(".propertyHandleVariable"),
            $propertyHandleConfig = that.$events.find(".propertyHandleConfig");
        $variableTr.each(function () {
            var variable = $(this).find("[data-save='variable']").val()
            result.variable = variable;
        })
        $propertyHandleConfig.each(function () {
            var config = {};
            config.field = $(this).find("[data-save='field']").val();
            config.operation = $(this).find("[data-save='operation']").val();
            config.type = $(this).find("[data-save='type']").val();
            result.handles.push(config)
        })
        GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item, index) {
            if (item.key == result.variable) {
                GLOBAL_PROPERTY.BODY.customVariable[index].propertyHandle = JSON.stringify(result)
            }
        })
        return result;
    },
    //
    getPropertyRender: function () {
        var that = this,
            result = {
                variable: "",
                Xaxis: "",
                Yaxis: [],
                content: [],
                renderType: "",
                renderPositoon: "",
                renderColor: "",
                ColWisth: ""
            },
            $tr = that.$events.find(".propertyRenderTr");

        $tr.each(function () {
            result.variable = $(this).find('[data-save="variable"]').val();
            result.Xaxis = $(this).find('[data-save="XAxis"]').val();
            result.content = that._getFields($(this).find(".propertyRenderContent"));
            result.Yaxis = that._getYaxis($(this).find(".YaxisTr"));
            result.renderType = $(this).find('[data-save="renderType"]').val();
            result.renderPositoon = $(this).find('[data-save="renderPositoon"]').val();
            result.renderColor = $(this).find('[data-save="color"]').val();
            result.ColWisth = $(this).find('[data-save="colWidth"]').val()
        })
        return result;
    },
    bindEvents: function () {
        var that = this;
        //属性数据数据库切换时
        that.$events.on("change" + that.NAME_SPACE, ".propertyData [data-change='dbName']", function () {
            var $fieldTd = that.$events.find(".queryFields");
            $fieldTd.empty();
        })
        //属性数据数据表切换时
        that.$events.on("change" + that.NAME_SPACE, ".propertyData [data-change='table']", function () {
            var tableName = $(this).val(),
                dbName = $($(this).parents("tr")[0]).find('[data-change="dbName"]').val(),
                $fieldTd = that.$events.find(".queryFields"),
                html = that._renderQueryFields(dbName, tableName, []);
            $fieldTd.empty().append(html)
        })
        //属性数据选择字段时
        that.$events.on("click" + that.NAME_SPACE, ".propertyData .checkboxField input", function () {
            var $target = $(this);
            var propertyData = that.getPropertyData(that.$events.find(".propertyDataTr"))
            GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item, index) {
                if (item.key == propertyData.variable) {
                    GLOBAL_PROPERTY.BODY.customVariable[index].propertyData = JSON.stringify(propertyData)
                }
            })
        })
        //数据查询切换自定义变量时
        that.$events.on("change" + that.NAME_SPACE, ".propertyQuery [data-change='variable']", function () {
            var value = $(this).val(),
                html = that._renderPropertyQueryFields(value, []),
                $propertyQueryFields = that.$events.find(".propertyQueryFields");
            $propertyQueryFields.empty().append(html)
        })
        //属性查询字段点击时候
        that.$events.on("click" + that.NAME_SPACE, ".propertyQueryFields input", function () {
            var propertyQuery = that.getPropertyQuery(that.$events.find(".propertyQueryTr"))
            GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item, index) {
                if (item.key == propertyQuery.variable) {
                    GLOBAL_PROPERTY.BODY.customVariable[index].propertyQuery = JSON.stringify(propertyQuery)
                }
            })

        })
        //属性处理自定义变量切换的时候?还有问题
        that.$events.on("change" + that.NAME_SPACE, ".propertyHandleVariable [data-change='variable']", function () {
            var propertyHandleVariable = $(this).val(),
                data = [],
                check = false,
                html = "";
            GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item, index) {
                if (item.key == propertyHandleVariable) {
                    if (GLOBAL_PROPERTY.BODY.customVariable[index].propertyQuery) {
                        data = JSON.parse(GLOBAL_PROPERTY.BODY.customVariable[index].propertyQuery).fields
                        check = false
                    }
                    if (GLOBAL_PROPERTY.BODY.customVariable[index].propertyHandle) {
                        check = true;
                        data = JSON.parse(GLOBAL_PROPERTY.BODY.customVariable[index].propertyHandle).handles
                    }
                }
            })
            if (!check) {
                var result = []
                data.forEach(item => {
                    var config = {
                        field: item,
                        operation: "",
                        type: ""
                    }
                    result.push(config)
                })
                html += `<tr class="propertyHandleVariable">
                                <td rowspan="${result.length+1}">
                                    ${that._renderCustomVariable(propertyHandleVariable)}
                                </td>
                            </tr>`;
                html += that._renderPropertyHandleTr(result)
            } else {
                html += `<tr class="propertyHandleVariable">
                                <td rowspan="${data.length+1}">
                                    ${that._renderCustomVariable(propertyHandleVariable)}
                                </td>
                            </tr>`;
                html += that._renderPropertyHandleTr(data)
            }
            that.$events.find(".propertyHandle tbody").empty().append(html)
            that.bindChosen()
        })
        that.$events.on("change" + that.NAME_SPACE, ".propertyRenderTr [data-change='variable']", function () {
            var value = $(this).val()
            console.log(value)
        })
    }

}