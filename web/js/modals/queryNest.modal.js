/**
 * 数据库嵌套查询
 * @param $modal
 * @param $element
 * @constructor
 */
function DbNestQueryModal($modal, $element) {
    BaseModal.call(this, $modal, $element);


    this.$querier = this.$modalBody.find(".nest-query-content");
    this.$queryRelated = this.$modalBody.find('[data-name="query_related"]');
    this.$queryRelatedFields = this.$modalBody.find('.query_related_fields');

    this.dbData;


    this._resetData = function () {
        this.$queryRelated.val("");
        this.$queryRelatedFields.empty();
    }

    this._getQueryIds = function () {
        return Object.keys(GLOBAL_PROPERTY).filter(el => {
            return GLOBAL_PROPERTY[el].query && GLOBAL_PROPERTY[el].query.db;
        });
    }

    this._renderFields = function (fields) {
        if (!Array.isArray(fields)) return false;
        var html = "";
        html += fields.map(i => {
            return `<span>${i.id}(${i.cname})</span>`
        }).join('');
        that.$queryRelatedFields.empty().append(html);
    }

}

DbNestQueryModal.prototype = {
    initData: async function (data) {
        var that = this;
        try {
            that.dbData = await new FileService().readFile("/profiles/table.json");
        } catch (err) {
            alert('获取配置文件table.json错误！');
            return false;
        }

        that._resetData();
        that.bindEvents();

        var ids = that._getQueryIds(),
            property = new Property(),
            options = ids.map(i => {
                let db = property.getValue(i, 'query.db'),
                    dbName = db.dbName,
                    table = db.table,
                    tableDesc = that.dbData && that.dbData[dbName] && that.dbData[dbName][table] && that.dbData[dbName][table].tableDesc
                cname = property.getValue(i, 'cname');
                return {
                    name: `${i}(${cname})(${table ? table : "" }/${tableDesc ? tableDesc : ""})`,
                    value: i
                }
            })

        data = data || {};
        var relatedId = data.relatedId;
        Common.fillSelect(that.$queryRelated, {
            name: '请选择关联查询控件编号',
            value: "",
        }, options, relatedId)
        relatedId && this.$queryRelated.trigger('change')
        // 渲染关联查询字段

        that.$querier.dbQuerier({
            fieldMode: "multi",
            data: data || {},
            renderTable: false,
            noTimeQuery: true,
        });
    },
    saveData: function () {
        var id = $("#property_id").val();
        if (!id) return;

        var relatedId = this.$queryRelated.val();
        if (!relatedId) return;
        var that = this,
            result = that.$querier.dbQuerier("getData"),
            data = {
                relatedId,
                ...result
            },

            $workspace = $("#workspace"),
            $control = $workspace.find("#" + id);

        that.$element.val(JSON.stringify(data));
        new Property().save(id === "BODY" ? $workspace : $control, that.$element);
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            var result = confirm("确定要清除数据库查询配置数据吗？");
            if (!result) return;

            that._resetData();
            that.$querier.dbQuerier("clearData");
            that.$element.val("");
            new Property().remove(id, "query.nest");
        }
    },

    bindEvents: function () {
        let that = this;

        that.$modal.on('change', '[data-name="query_related"]', async function () {
            let relatedId = $(this).val(),
                db = new Property().getValue(relatedId, 'query.db');
            if (!db) return false;
            let dbName = db.dbName,
                table = db.table,
                fields = db.fields,
                show_fields = [],
                fields_html = '';

            if (that.dbData[dbName] && that.dbData[dbName][table]) {
                var ori_fields = that.dbData[dbName][table].tableDetail;
                if (fields.includes('*')) show_fields = ori_fields;
                else {
                    fields.forEach(i => {
                        let idx = ori_fields.findIndex(j => j.id == i);
                        idx > -1 && show_fields.push(ori_fields[idx]);
                    })
                };
            };

            fields_html += show_fields.map(i => {
                return `<span>${i.id}(${i.cname})</span>`
            }).join('');
            that.$queryRelatedFields.empty().append(fields_html);
        })
    },

    execute: function () {
        let that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);
    }
};