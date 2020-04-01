function OpenConfigModal($modal, key) {
    BaseModal.call(this, $modal);
    this.$body = this.$modal.find(".modal-body");
    this.key = key || 0;
    this.data = null;
    this.customData = null;
    this.cate = null;

    this.configFile = key === 0 ? 'dBTable0Config_custom.json' : 'dBTable1Config_custom.json'

    this.renderCondition = async function ($node, fields, $conditions, defaultData) {
        try {
            !this.cate && (this.cate = await new FileService().readFile('./profiles/category.json', 'utf-8'));
        } catch (err) {
            alert('获取配置文件失败！')
        }
        if (!this.cate) alert('获取配置文件失败！')
        if (!$node || !Array.isArray(fields)) return;

        var that = this,
            html = '';
        fields = fields.map(el => {
            return {
                name: el.cname,
                value: el.id
            }
        });
        if (Array.isArray(defaultData)) {
            defaultData.forEach(i => {
                html += that.renderConditionItem(i, !i.isReg);
            })
        }

        Common.fillSelect($node, {
            name: "选择查询字段",
            value: ""
        }, fields);
        $conditions.empty().append(html);
    };
    this.renderConditionItem = function (condition, isSelect, category) {
        var that = this,
            html = "",
            id = condition.col,
            value = condition.value;
        category = condition.cate || category
        if (isSelect) {
            var options = that.cate[category].slice(0);
            !DataType.isObject(options[0]) && (options = options.map(el => {
                return {
                    name: el.name || el.value || el,
                    value: el.value || el.name || el
                }
            }));
            options.unshift({
                name: '全部',
                value: ''
            });
            html += `
                    <label class="col-lg-3 control-label">${category}：</label>
                    <div class="col-lg-9">
                        <select class="form-control" data-cate="${category}" data-condition data-name="${id}">${options.map(col => `<option value="${col.value}" ${col.value == value ? "selected" : ""} >${col.name}(${col.value})</option>`).join("")}</select>
                    </div>
                    `
        } else {
            html += `
                    <label class="col-lg-3 control-label">${category}：</label>
                    <div class="col-lg-9">
                        <input class="form-control" data-cate="${category}" data-condition data-name="${id}" value="${value}" placehold="输入关键字进行查询">
                    </div>
                    `
        }
        return html;
    }
    this.renderFields = function ($node, fields, defaultData) {
        if (!$node || !Array.isArray(fields)) return;
        var html = '';
        fields.forEach(i => {
            html += `<label class="checkbox-inline"><input type="checkbox" ${defaultData && defaultData.findIndex(el => el.value == i.id) > -1 ? "checked" : ""} data-field data-name="${i.cname}" value="${i.id}">${i.cname}</label>`
        })
        $node.empty().append(html);
    };
}

OpenConfigModal.prototype = {
    initData: function () {
        this.renderDom();
        this.setData();
        this.bindEvents();
    },

    renderDom: function () {
        var str = `<div class="form-horizontal">
                    <div class="form-group"><label class="col-lg-2 control-label">查询数据库：</label>
                        <div class="col-lg-9">
                            <select disabled class="form-control" data-name="dbName"></select>
                        </div>
                    </div>
                    <div class="form-group"><label class="col-lg-2 control-label">查询表：</label>
                        <div class="col-lg-9">
                            <select disabled class="form-control" data-name="tableName"></select>
                        </div>
                    </div>
                    <div class="form-group"><label class="col-lg-2 control-label">查询条件：</label>
                        <div class="col-lg-9">
                            <div class="row">
                                <div class="col-lg-3">
                                    <select class="form-control" data-name="table_conditions"></select>
                                </div>
                                <div class="col-lg-9" data-name="table_conditions_wrap">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-lg-2 control-label">显示字段：</label>
                        <div class="col-lg-9" data-name="table_fields"></div>
                    </div>
                </div>
                `
        this.$body.empty().append(str);
    },

    setData: async function () {
        try {
            // var data = await new FileService().readFile("./profiles/table.json", 'utf-8'),
            var data = await new BuildTableJson().get(),
                customData = jdi.fileApi.getProfile(this.configFile);
        } catch (err) {
            !customData && jdi.fileApi.setProfile(this.configFile, "{}");
            customData = {}
        }

        this.data = data;
        this.customData = customData;
        var $dbName = this.$body.find('[data-name="dbName"]'),
            dbSelect = [],
            $tableName = this.$body.find('[data-name="tableName"]'),
            tableSelect,
            $tableConditions = this.$body.find('[data-name="table_conditions"]'),
            $tableConditionsWrap = this.$body.find('[data-name="table_conditions_wrap"]'),
            $tableFields = this.$body.find('[data-name="table_fields"]'),
            fields;

        Object.keys(data).forEach(i => dbSelect.push({
            name: i,
            value: i
        }));
        tableSelect = customData["db"] ?
            Object.keys(data[customData["db"]]).map(el => {
                if (data[customData["db"]][el].key === this.key) return {
                    name: el,
                    value: el
                }
            }) :
            Object.keys(data[dbSelect[0].value]).map(el => {
                if (data[dbSelect[0].value][el].key === this.key) return {
                    name: el,
                    value: el
                }
            })

        fields = customData["table"] ?
            data[customData["db"]][customData["table"]].tableDetail : [];

        Common.fillSelect($dbName, null, dbSelect, customData["db"]);
        Common.fillSelect($tableName, {
            name: "全部",
            value: ""
        }, tableSelect.filter(el => !!el), customData["table"]);
        fields1 = [{
            id: "name",
            cname: "资源名称"
        },
        {
            id: "customId",
            cname: "编号"
        }
        ]
        this.renderCondition($tableConditions, fields1, $tableConditionsWrap, customData["condition"]);
        this.renderFields($tableFields, fields, customData["fields"]);
    },

    saveData: function () {

        var that = this,
            data = {},
            dbName = this.$body.find('[data-name="dbName"]').val(),
            tableName = this.$body.find('[data-name="tableName"]').val(),
            $tableConditions = this.$body.find('[data-condition]'),
            $tableFields = this.$body.find('[data-field]:checked');

        if ($tableFields.length <= 0) {
            alert("至少选中一个显示字段！");
            return -1
        }

        data['db'] = dbName;
        data['table'] = tableName || Object.keys(this.data[dbName]).filter(table => this.data[dbName][table].key === that.key);
        data['condition'] = [];
        $tableConditions.each(function () {
            var $this = $(this),
                val = $this.val();
            val && data['condition'].push({
                col: $this.data('name'),
                value: val,
                isReg: !$this.is("select"),
                cate: $this.data('cate')
            });
        });
        data['fields'] = [];
        $tableFields.each(function () {
            var $this = $(this);
            data['fields'].push({
                name: $this.data('name'),
                value: $this.val(),
            });
        });
        jdi.fileApi.setProfile(this.configFile, JSON.stringify(data))


        this.$modal.css('opacity', 0);
        $(`#${(key === 0 ? 'open_template_modal' : 'open_resource_modal')}`).modal('show');
        this.$modal.css('opacity', 1)
    },

    clearData: function () {
        var result = window.confirm("确认清除配置数据？"),
            that = this;
        if (result) {
            var db = that.$body.find('[data-name="dbName"] option').attr('value'),
                tables = Object.keys(that.data[db]).filter(i => that.data[db][i].key === that.key)
            var data = {
                "db": db,
                "table": tables[0],
                "fields": [{
                    value: that.data[db][tables[0]].tableDetail[0].id,
                    name: that.data[db][tables[0]].tableDetail[0].cname
                }]
            }
            jdi.fileApi.setProfile(this.configFile, JSON.stringify(data));
            return result;
        }
    },

    bindEvents: function () {
        var that = this;
        this.$modal.on('change', '[data-name="dbName"]', function () {
            var value = $(this).val(),
                tables = that.data[value],
                $tableName = that.$body.find('[data-name="tableName"]'),
                tableSelect = [],
                $tableConditions = that.$body.find('[data-name="table_conditions"]'),
                $tableConditionsWrap = that.$body.find('[data-name="table_conditions_wrap"]'),
                $tableFields = that.$body.find('[data-name="table_fields"]');

            if (DataType.isObject(tables)) {
                Object.keys(tables).forEach(table => {
                    tables[table].key === that.key && tableSelect.push({
                        name: table,
                        value: table
                    });
                });
            }
            Common.fillSelect($tableName, {
                name: "全部",
                value: ""
            }, tableSelect);
            that.renderCondition($tableConditions, [], $tableConditionsWrap);
            that.renderFields($tableFields, []);
        });

        this.$modal.on('change', '[data-name="tableName"]', function () {
            var value = $(this).val(),
                db = that.$body.find('[data-name="dbName"]').val(),
                $tableConditions = that.$body.find('[data-name="table_conditions"]'),
                $tableConditionsWrap = that.$body.find('[data-name="table_conditions_wrap"]'),
                $tableFields = that.$body.find('[data-name="table_fields"]'),
                table = that.data[db][value];
            fields = [];
            fields = table && Array.isArray(table.tableDetail) ? table.tableDetail : [];
            that.renderCondition($tableConditions, fields, $tableConditionsWrap);
            that.renderFields($tableFields, fields);
        });

        this.$modal.on('change', '[data-name="table_conditions"]', function () {
            var value = $(this).val(),
                name = $(this).find("option:selected").text(),
                $tableConditionsWrap = that.$body.find('[data-name="table_conditions_wrap"]'),
                html = '';
            if (!value || name == "请选择查询字段") $tableConditionsWrap.empty();
            if (value && that.$modal.find(`[data-condition][data-name="${value}"]`).length <= 0) {
                html += that.renderConditionItem({
                    col: value,
                    value: ""
                }, !!that.cate[name], name)
                $tableConditionsWrap.empty().append(html);//zww
                // $tableConditionsWrap.append(html)
            };
            that.$body.find(`[data-condition][data-name="${value}"]`).focus()
        });
    },

    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData); //绑定基础事件
    },
}