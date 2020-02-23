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
            html += `<option value="${value}" data-text="${item.name}" ${selected}>${item.name}${prompt}</option>`
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
        if (!selectFields) {
            selectFields = []
        }
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
    this._renderPropertyDataTr = function (propertyDatas) {
        var that = this,
            str = "";
        if (!Array.isArray(propertyDatas)) {
            return str
        }
        propertyDatas.forEach(propertyData => {
            var propertyData = propertyData ? propertyData : {},
                cname = propertyData ? propertyData.cname : "",
                dbName = propertyData.query ? propertyData.query.dbName : "",
                tableName = propertyData.query ? propertyData.query.table : "",
                conditions = propertyData.query ? propertyData.query.conditions : [],
                fields = propertyData.query ? propertyData.query.fields : [];
            str += `<tr class="tr propertyDataTr">
                <td><input type="text" data-save="cname" class="form-control" value="${cname?cname:''}"></td>
                <td>${that._renderDbNameSelect(dbName)}</td>
                <td>${that._renderTableNameSelect(dbName,tableName)}</td>
                <td>${that._renderQueryCondition(dbName,tableName,conditions)}</td>
                <td class="queryFields checkboxField">${that._renderQueryFields(dbName,tableName,fields)}</td>
                <td><span class="del">×</span></td>
                </tr>`
        })
        return str;
    }
    //渲染属性查询的Tr
    this._renderPropertyQueryTr = function (propertyQuerys) {
        var that = this,
            str = "";
        if (!Array.isArray(propertyQuerys)) {
            return str
        }

        propertyQuerys.forEach(propertyQuery => {
            var variable = propertyQuery ? propertyQuery.oldVariable : "",
                cname = propertyQuery ? propertyQuery.cname : "",
                selectFields = propertyQuery ? propertyQuery.fields : [];
            str += `<tr class="propertyQueryTr">
                    <td><input type="text" class="form-control" data-save="cname" value="${cname?cname:""}"  /></td>
                    <td>${that._renderCustomVariable(variable)}</td>
                    <td class="propertyQueryFields">${that._renderPropertyQueryFields(variable,selectFields)}</td>
                    <td class="text-center"><span class="del">×</span></td>
                </tr>`
        })
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
                name: item.cname ? item.cname : item.key,
                value: item.key
            }
            options.push(option)
            // var propertyData = JSON.parse(item.propertyData)
            // if (Array.isArray(propertyData)) {
            //     propertyData.forEach(citem => {
            //         var option = {
            //             name: citem.cname ? citem.cname : citem.variable,
            //             value: citem.variable
            //         }
            //         options.push(option)
            //     })
            // }
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
                propertyData = item
            }

            // if (item.propertyData && Array.isArray(JSON.parse(item.propertyData))) {
            //     JSON.parse(item.propertyData).forEach(citem => {
            //         if (citem.variable == variable) {
            //             propertyData = citem
            //         }
            //     })
            // }

            // if (item.key == variable) {
            //     propertyData = item.propertyData ? JSON.parse(item.propertyData) : "";
            // }
        })
        if (!DataType.isObject(propertyData)) {
            return "";
            // return alert(`请先配置自定义变量${variable}的属性数据`)
        }
        var dbName = propertyData.dbName,
            tableName = propertyData.table,
            propertyDataFields = propertyData.fields,
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
            str = `<table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="text-center">字段</th>
                                <th class="text-center">操作类型</th>
                                <th class="text-center">数值类型</th>
                            </tr>
                        </thead>
                    <tbody>`;
        propertyHandle.forEach(item => {
            str += `<tr class="propertyHandleConfig">
                        <td><input type="text" class="form-control" data-save="field" disabled="disabled" value="${item.field}"></td>
                        <td>${that._renderPropertyHandleOperation(item.operation)}</td>
                        <td>
                            ${that._renderPropertyHandleType(item.type)}
                        </td>
                    </tr>`
        })
        str += "</tbody></table>";
        return str;
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
                "data-change": "type",
                "data-propertyHandleChange": "propertyHandle"
            };

        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    this._renderPropertyRenderTr = function (propertyRender) {
        var that = this;
        str = `<tr class="propertyRenderTr">
                            <td>${that._renderCustomVariable(propertyRender.variable||"")}</td>
                            <td>${that._renderPropertyRenderFields(propertyRender.variable ,propertyRender.Xline, true,"extrLine")}</td>
                            <td>${that._renderPropertyRenderFields(propertyRender.variable ,propertyRender.Xaxis, true)}</td>
                            <td>${that._renderPropertyRenderYaxis(propertyRender.variable, propertyRender.Yaxis)}</td>
                            <td>${that._renderPropertyRenderType(propertyRender.renderType)}</td>
                            <td><input type="text" class="form-control" data-save="renderPositoon" value="${propertyRender.renderPositoon||''}"></td>
                            <td>
                                <div style = "position:relative">
                                    <input type="text" class="form-control render-color" save-type="style" data-save="color" value="${ propertyRender.renderColor || ""}">
                                    <div class="property-icon-wrap" style="top:2px">
                                        <input type="color" data-belong="render-color" class="property-color-input">
                                    <i class="icon icon-color"></i>
                                </div>
                            </td>
                            <td>
                                <input type="text" class="form-control" data-save="colWidth" value="${propertyRender.ColWisth||''}">
                            </td>
                        </tr>`
        return str;
    }
    this._renderPropertyHandleBodYTr = function (propertyhandels) {
        var that = this,
            str = "";
        propertyhandels.forEach(propertyHandle => {
            var variable = propertyHandle ? propertyHandle.oldVariable : "",
                cname = propertyHandle ? propertyHandle.cname : "",
                handles = propertyHandle ? propertyHandle.handles : [],
                Xaxis = propertyHandle ? propertyHandle.Xaxis : "",
                Yaxis = propertyHandle ? propertyHandle.Yaxis : [];
            str += `<tr class="propertyHandleVariable">
                        <td class="text-center" >
                            <span class="del">×</span>
                        </td>
                        <td>
                            <input type="text" class="form-control" value="${cname?cname:""}" data-save="cname"/>
                        </td>
                        <td >
                            ${that._renderCustomVariable(variable)}
                        </td>
                        <td >
                            ${that._renderPropertyRenderFields(variable, Xaxis, true)} 
                        </td>
                        <td>
                            ${that._renderPropertyHandleYaxis(variable, Yaxis)}
                        </td>
                        <td>
                            ${that._renderPropertyHandleTr(handles)}
                        </td>
                    </tr>`

        })
        return str;
    }
    //渲染属性渲染中的字段选择问题
    this._renderPropertyRenderFields = function (variable, selectedValue, isXAxis, extrLine) {
        var that = this,
            att = isXAxis ? "XAxis" : "Yaxis",
            defaultOption = {
                name: "请选择",
                value: ""
            },
            options = variable ? that._getpropertyRenderXYoption(variable) : [],
            selectedValue = selectedValue,
            isPrompt = true,
            selectClass = "from-control chosen",
            attr = {
                "data-save": att,
                "data-change": att
            };
        if (extrLine == "extrLine") {
            attr = {
                "data-save": 'Xline',
                "data-change": 'Xline'
            }
        }
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    this._renderPropertyHandleFields = function (variable, selectedValue, attr) {
        var that = this,

            defaultOption = {
                name: "请选择",
                value: ""
            },
            options = that._getpropertyRenderXYoption(variable),
            selectedValue = selectedValue,
            isPrompt = true,
            selectClass = "from-control chosen";
        return that._renderSelect(defaultOption, options, selectedValue, isPrompt, selectClass, attr)
    }
    this._getpropertyRenderXYoption = function (variable) {
        var options = [],
            selects = [],
            fields = [],
            data = {};
        GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item, index) {
            if (variable == item.key) {
                data = item;
            }


            // if (variable == item.key) {
            //     var propertyData = JSON.parse(item.propertyData) || {},
            //         propertyQuery = JSON.parse(item.propertyQuery) || {},
            //         dbName = propertyData.query ? propertyData.query.dbName : "",
            //         table = propertyData.query ? propertyData.query.table : "";
            //     selects = propertyQuery.fields ? propertyQuery.fields : propertyData.query.fields;
            //     fields = new BuildTableJson().getOptions(AllDbName, "field", {
            //         dbName: dbName,
            //         table: table
            //     });
            // }
        })
        var dbName = data.dbName,
            table = data.table;
        selects = data.fields;
        fields = new BuildTableJson().getOptions(AllDbName, "field", {
            dbName: dbName,
            table: table
        });
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
                            <th class="text-center">表头</th>
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
    this._renderPropertyHandleYaxis = function (variable, Yaxis) {
        var that = this,
            str = `<table class="table table-bordered" style="margin-bottom: 0px;">
                    <thead>
                        <tr>
                            <th class="text-center">字段</th>
                            <th class="text-center">分割</th>
                            <th class="text-center">是键位</th>
                            <th class="text-center">值</th>
                            <th class="text-center"><span class="add" data-add="propertyHandleYaxis">+</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${that.propertyHandleYaxis(variable,Yaxis)}
                    </tbody>
                    </table>`
        return str;
    }
    this.propertyHandleYaxis = function (variable, Yaxis) {
        var that = this,
            str = "";
        Yaxis && Yaxis.forEach(item => {
            str += `<tr class="YaxisTr">
                        <td>${that._renderPropertyHandleFields(variable,item.field,{"data-save":'field',"data-change":'field'})}</td>
                        <td><input type="text" class="form-control" value="${item.split||''}" data-save="split"></td>
                        <td><input type="checkbox" class="form-control" ${item.isKey?"checked":""} data-save="isKey"></td>
                        <td>${that._renderPropertyHandleFields(variable,item.content,{"data-save":'content',"data-change":'content'})}</td>
                        <td><span class="del">×</span></td>
                </tr>`
        })
        return str;

    }
    this.propertyRenderYaxis = function (variable, Yaxis) {
        var that = this,
            str = "";

        Yaxis && Yaxis.forEach(item => {
            str += `<tr class="YaxisTr">
                        <td>${that._renderPropertyRenderFields(variable,item.name)}</td>
                        <td><input class="form-control" type="text" data-save="headName" value="${item.headName?item.headName:''}"/></td>
                        <td><input type="text" class="form-control" value="${item.split}" data-save="split"></td>
                        <td><span class="del">×</span></td>
                </tr>`
        })
        return str;
    }
    this._renderPropertyRenderContent = function (variable, content) {
        // var that = this,
        //     options = that._getpropertyRenderXYoption(variable);
        // return that._renderFieldsCheckBox(options, content);
    }
    this._getYaxis = function ($target) {
        var that = this,
            result = [];
        $target.each(function () {
            var config = {};
            config.name = $(this).find("[data-save='Yaxis']").val()
            config.headName = $(this).find("[data-save='headName']").val()
            config.split = $(this).find("[data-save='split']").val()
            result.push(config)
        })
        return result;

    }
    this._getPropertyHandleYaxis = function ($target) {
        var that = this,
            result = [];
        $target.each(function () {
            var config = {};
            config.field = $(this).find("[data-save='field']").val()
            config.split = $(this).find("[data-save='split']").val()
            config.isKey = $(this).find("[data-save='isKey']").is(":checked")
            config.content = $(this).find("[data-save='content']").val()
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
    this.updataVariable = function (targets) {
        var that = this;
        targets.each(function () {
            var value = $(this).val(),
                str = that._renderCustomVariable(value);
            $(this).parents("td").eq(0).empty().append(str)
        })
        that.bindChosen()
        // targets.each(() => {
        //     var value = $(this).val(),
        //         str = that._renderCustomVariable(value)

        // })
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
                                    <th class="text-center">变量中文名</th>
                                    <th class="text-center">选择数据库</th>
                                    <th class="text-center">选择数据表</th>
                                    <th class="text-center">查询条件</th>
                                    <th class="text-center" style="width:600px">选择字段</th>
                                    <th><span class="add" data-add="_renderPropertyDataTr">＋</span></th>
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
    renderPropertyQuery: function (propertyQuerys) {

        var that = this,
            str = `<div class="condition propertyQuery" ${propertyQuerys ? "" : 'style="display:none"'}>
                        <table class = "table table-bordered">
                            <thead>
                                <tr>
                                    <th class="text-center">请选择自定义变量</th>
                                    <th class="text-center">变量中文名</th>
                                    <th class="text-center" style="width:500px">请选择字段</th>
                                    <th class="text-center"><span class="add" data-add="_renderPropertyQueryTr">+</span></th>
                                </tr>
                            </thead>
                            <tbody>
                               ${that._renderPropertyQueryTr(propertyQuerys)} 
                            </tbody> 
                        </table>
                    </div>`
        return str;
    },
    //渲染属性处理
    renderPropertyHandle: function (propertyHandle) {
        var that = this,

            str = `<div class="condition propertyHandle" ${propertyHandle?"":'style="display:none"'}>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th class="text-center"><span class="add" data-add="_renderPropertyHandleBodYTr">+</span></th>
                                <th class="text-center">变量中文名</th>
                                <th class="text-center">自定义变量</th>
                                <th class="text-center">X轴</th>
                                <th class="text-center">Y轴</th>
                                <th class="text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody class="propertyHandleTbody">
                            ${that._renderPropertyHandleBodYTr(propertyHandle?propertyHandle:[{variable:"",handles:[],Xaxis:"",Yaxis:[]}])}
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
                            <th class="text-center">X轴所在列</th>
                            <th class="text-center">X轴</th>
                            <th class="text-center">Y轴</th>
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
    getPropertyData: function ($tr, id, index) {
        var that = this,
            key = NumberHelper.idToName(index, 1),
            propertyData = [];
        $tr.each(function (Cindex) {
            var propertyDatatr = {}
            propertyDatatr.variable = id + "_A" + key + NumberHelper.idToName(Cindex, 1)
            propertyDatatr.cname = $(this).find('[data-save="cname"]').val()
            propertyDatatr.query = {}
            propertyDatatr.query.dbName = $(this).find('[data-save="dbName"]').val()
            propertyDatatr.query.table = $(this).find('[data-save="table"]').val()
            propertyDatatr.query.conditions = that._getQueryCondition($(this).find(".copySendCondition"))
            propertyDatatr.query.fields = that._getFields($(this).find(".checkboxField"));
            var data = {}
            data.key = propertyDatatr.variable
            data.cname = propertyDatatr.cname
            data.dbName = propertyDatatr.query.dbName
            data.table = propertyDatatr.query.table
            data.fields = propertyDatatr.query.fields
            if (!GLOBAL_PROPERTY.BODY) { //BODY存在吗
                GLOBAL_PROPERTY.BODY = {};
                GLOBAL_PROPERTY.BODY.customVariable = [];
                GLOBAL_PROPERTY.BODY.customVariable.push(data)
            } else {
                if (!GLOBAL_PROPERTY.BODY.customVariable) { //customVariable
                    GLOBAL_PROPERTY.BODY.customVariable = [];
                    GLOBAL_PROPERTY.BODY.customVariable.push(data)
                } else {
                    var number = -1;
                    GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item, cindex) { //原有的存在吗
                        if (item.key == propertyDatatr.variable) {
                            number = cindex
                        }
                    })
                    if (number == -1) {
                        GLOBAL_PROPERTY.BODY.customVariable.push(data)
                    } else {
                        GLOBAL_PROPERTY.BODY.customVariable[number] = data;
                    }
                }
            }
            propertyData.push(propertyDatatr)
        })


        that.updataVariable($("[data-change='variable']"))
        return propertyData;
    },
    //获取属性查询
    getPropertyQuery: function ($tr, id, index) {
        var that = this,
            key = NumberHelper.idToName(index, 1),
            propertyQuerys = [];
        $tr.each(function (cindex) {
            var propertyQuery = {},
                cname = $(this).find('[data-save="cname"]').val(),
                oldVariable = $(this).find('[data-save="variable"]').val(),
                variable = id + "_B" + key + NumberHelper.idToName(cindex, 1);
            propertyQuery.variable = variable;
            propertyQuery.oldVariable = oldVariable
            propertyQuery.cname = cname;
            propertyQuery.fields = that._getFields($(this).find(".propertyQueryFields"));
            propertyQuerys.push(propertyQuery)
            var data = {};
            data.key = propertyQuery.variable;
            data.cname = propertyQuery.cname;
            data.fields = propertyQuery.fields;
            GLOBAL_PROPERTY.BODY.customVariable.forEach(item => {
                if (item.key == propertyQuery.oldVariable) {
                    data.dbName = item.dbName;
                    data.table = item.table
                }
            })
            var number = -1;
            GLOBAL_PROPERTY.BODY.customVariable.forEach((item, dindex) => {
                if (item.key == data.key) {
                    number = dindex;
                }
            })
            if (number == -1) {
                GLOBAL_PROPERTY.BODY.customVariable.push(data)
            } else {
                GLOBAL_PROPERTY.BODY.customVariable[number] = data;
            }
        })
        that.updataVariable($("[data-change='variable']"))
        return propertyQuerys;
    },
    //获取属性处理
    getPropertyHandle: function ($trs, id, key) {
        var that = this,
            key = NumberHelper.idToName(key, 1)
        results = [];
        $trs.find(".propertyHandleVariable").each((index, $tr) => {
            var result = {
                    variable: "",
                    oldVariable: "",
                    cname: "",
                    Xaxis: "",
                    Yaxis: that._getPropertyHandleYaxis($($tr).find(".YaxisTr")),
                    handles: []
                },
                $propertyHandleConfig = $($tr).find(".propertyHandleConfig");
            var variable = id + "_C" + key + NumberHelper.idToName(index, 1),
                oldVariable = $($tr).find("[data-save='variable']").val(),
                cname = $($tr).find("[data-save='cname']").val(),
                XAxis = $($tr).find("[data-save='XAxis']").val();
            result.Xaxis = XAxis;
            result.cname = cname;
            result.variable = variable;
            result.oldVariable = oldVariable;
            $propertyHandleConfig.each((cindex, tr) => {
                var config = {};
                config.field = $(tr).find("[data-save='field']").val();
                config.operation = $(tr).find("[data-save='operation']").val();
                config.type = $(tr).find("[data-save='type']").val();
                result.handles.push(config)
            })
            results.push(result)

            var data = {}
            data.key = variable;
            data.cname = cname;
            GLOBAL_PROPERTY.BODY.customVariable.forEach(item => {
                if (item.key == oldVariable) {
                    data.dbName = item.dbName;
                    data.table = item.table;
                    data.fields = item.fields
                }
            })
            var number = -1;
            GLOBAL_PROPERTY.BODY.customVariable.forEach((item, dindex) => {
                if (item.key == data.key) {
                    number = dindex;
                }
            })
            if (number == -1) {
                GLOBAL_PROPERTY.BODY.customVariable.push(data)
            } else {
                GLOBAL_PROPERTY.BODY.customVariable[number] = data;
            }

        })
        that.updataVariable($("[data-change='variable']"))
        return results;
    },
    //
    getPropertyRender: function ($tr) {
        var that = this,
            result = {
                variable: "",
                Xaxis: "",
                Yaxis: [],
                // content: [],
                renderType: "",
                renderPositoon: "",
                renderColor: "",
                ColWisth: ""
            };

        $tr.each(function () {
            result.variable = $(this).find('[data-save="variable"]').val();
            result.Xaxis = $(this).find('[data-save="XAxis"]').val();
            result.Xline = $(this).find('[data-save="Xline"]').val();
            // result.content = that._getFields($(this).find(".propertyRenderContent"));
            result.Yaxis = that._getYaxis($(this).find(".YaxisTr"));
            result.renderType = $(this).find('[data-save="renderType"]').val();
            result.renderPositoon = $(this).find('[data-save="renderPositoon"]').val();
            result.renderColor = $(this).find('[data-save="color"]').val();
            result.ColWisth = $(this).find('[data-save="colWidth"]').val()
        })
        console.log(result)
        return result;
    },
    bindEvents: function () {
        var that = this;
        //属性数据数据库切换时
        that.$events.on("change" + that.NAME_SPACE, ".propertyData [data-change='dbName']", function () {
            var $fieldTd = $(this).parents("tr").eq(0).find(".queryFields");
            $fieldTd.empty();
        })
        //属性数据数据表切换时
        that.$events.on("change" + that.NAME_SPACE, ".propertyData [data-change='table']", function () {
            var tableName = $(this).val(),
                dbName = $($(this).parents("tr")[0]).find('[data-change="dbName"]').val(),
                $fieldTd = $(this).parents("tr").eq(0).find(".queryFields"),
                html = that._renderQueryFields(dbName, tableName, []);
            $fieldTd.empty().append(html)
        })
        //属性数据选择字段时
        that.$events.on("click" + that.NAME_SPACE, ".propertyData .checkboxField input", function () {
            var $target = $(this),
                id = $("#property_id").val(),
                index = $(this).parents('tr').eq(1).attr("index");
            that.getPropertyData(that.$events.find(".propertyDataTr"), id, index)
        })
        //数据查询切换自定义变量时
        that.$events.on("change" + that.NAME_SPACE, ".propertyQuery [data-change='variable']", function () {
            var value = $(this).val(),
                html = that._renderPropertyQueryFields(value, []),
                $propertyQueryFields = $(this).parents("tr").eq(0).find(".propertyQueryFields");

            // $propertyQueryFields = that.$events.find(".propertyQueryFields");
            $propertyQueryFields.empty().append(html)
        })
        //属性查询字段点击时候
        that.$events.on("click" + that.NAME_SPACE, ".propertyQueryFields input", function () {
            var id = $("#property_id").val(),
                index = $(this).parents('tr').eq(1).attr("index");
            that.getPropertyQuery(that.$events.find(".propertyQueryTr"), id, index)
        })
        //属性处理自定义变量切换的时候?还有问题
        that.$events.on("change" + that.NAME_SPACE, ".propertyHandleVariable [data-change='variable']", function () {
            var propertyHandleVariable = $(this).val(),
                cname = $(this).parents("tr").eq(0).find("[data-save='cname']").val(),
                data = [],
                html = "";
            GLOBAL_PROPERTY.BODY && GLOBAL_PROPERTY.BODY.customVariable && GLOBAL_PROPERTY.BODY.customVariable.forEach(function (item, index) {
                if (item.key == propertyHandleVariable) {
                    data = item.fields
                }
                // JSON.parse(item.propertyData).forEach(citem => {
                //     if (citem.variable == propertyHandleVariable) {
                //         data = citem.query.fields
                //     }
                // })
                // item.propertyQuery && JSON.parse(item.propertyQuery).forEach(citem => {
                //     if (citem.variable == propertyHandleVariable) {
                //         data = citem.fields
                //     }
                // })
                // if (item.key == propertyHandleVariable) {
                //     if (GLOBAL_PROPERTY.BODY.customVariable[index].propertyData) {
                //         data = JSON.parse(GLOBAL_PROPERTY.BODY.customVariable[index].propertyData).query.fields
                //     }
                //     if (GLOBAL_PROPERTY.BODY.customVariable[index].propertyQuery) {
                //         data = JSON.parse(GLOBAL_PROPERTY.BODY.customVariable[index].propertyQuery).fields
                //     }
                //     // if (GLOBAL_PROPERTY.BODY.customVariable[index].propertyHandle) {
                //     //     check = true;
                //     //     data = JSON.parse(GLOBAL_PROPERTY.BODY.customVariable[index].propertyHandle).handles
                //     // }
                // }
            })
            // if (!check) {
            var handles = []
            data.forEach(item => {
                var config = {
                    field: item,
                    operation: "",
                    type: ""
                }
                handles.push(config)
            })
            var result = [{
                cname: cname,
                oldVariable: propertyHandleVariable,
                handles: handles,
                Xaxis: "",
                Yaxis: ''
            }];
            html = that._renderPropertyHandleBodYTr(result)
            // html += `<tr class="propertyHandleVariable">
            //                     <td rowspan="${result.length+1}">
            //                         ${that._renderCustomVariable(propertyHandleVariable)}
            //                     </td>
            //                      <td rowspan="${result.length+1}">
            //                         ${that._renderPropertyRenderFields(propertyHandleVariable, "", true)} 
            //                     </td>
            //                     <td rowspan="${result.length+1}">
            //                         ${that._renderPropertyHandleYaxis(propertyHandleVariable, [{name:"",slice:"",content:""}])}
            //                     </td>
            //                 </tr>`;
            // html += that._renderPropertyHandleTr(result)
            // } else {
            //     html += `<tr class="propertyHandleVariable">
            //                     <td rowspan="${data.length+1}">
            //                         ${that._renderCustomVariable(propertyHandleVariable)}
            //                     </td>
            //                      <td rowspan="${result.length+1}">
            //                         <input>
            //                     </td>
            //                     <td rowspan="${result.length+1}">
            //                         <input>
            //                     </td>
            //                 </tr>`;
            //     html += that._renderPropertyHandleTr(data)
            // }
            // that.$events.find(".propertyHandle tbody").append(html)
            // $(this).parents("tr").eq(0).next().remove()
            $(this).parents("tr").eq(0).replaceWith($(html))
            that.bindChosen()
        })

        that.$events.on("change" + that.NAME_SPACE, ".propertyHandleVariable [data-propertyHandleChange='propertyHandle']", function () {
            var id = id = $("#property_id").val(),
                index = $(this).parents('tr').eq(1).attr("index");
            that.getPropertyHandle($(".propertyHandle .propertyHandleTbody"), id, index)
        })
        that.$events.on("change" + that.NAME_SPACE, ".propertyRenderTr [data-change='variable']", function () {
            var value = $(this).val(),
                data = {
                    variable: value
                },
                str = that._renderPropertyRenderTr(data),
                $tbody = $(this).parents('tbody').eq(0);
            $tbody.empty().append(str)
            that.bindChosen()
        })

        that.$events.on("change" + that.NAME_SPACE, ".propertyRenderTr .YaxisTr [data-change='Yaxis']", function () {
            var value = $(this).val(),
                text = $(this).find('option:selected').attr('data-text'),
                $target = $(this).parents('tr').eq(0).find('[data-save="headName"]')
                if(value){

                    $target.val(text)
                }else{
                    $target.val("")
                }

        })
    }

}