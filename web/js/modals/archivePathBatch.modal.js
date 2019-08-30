function ArchivePathBatch($modal, $element) {
    BaseModal.call(this, $modal, $element);//调用基础弹窗布局
    
    this.$dbName = this.$modal.find('[data-type="dbname"]');
    this.$tableName = this.$modal.find('[data-type="tablename"]');
    this.$queryType = this.$modal.find('[data-type="querytype"]');
    this.$left = this.$modal.find('.archive-left-content');
    this.$right = this.$modal.find('.archive-right-content');

    // const TYPE_CONFIG = [//定义type类型
    //     {name: "通用查询", value: 0},
    //     {name: "表格查询", value: 1},
    //     {name: "详情链接", value: 2}
    // ];

    this.TYPE_CONFIG = {
        common: {
            name: '通用查询',
            value: 0
        },
        table: {
            name: '表格查询',
            value: 1
        }
    };

    this._getMetaFieldHtml = function(id, isDelete) {
        return `<i class="meta-field ${isDelete ? 'del' : ''} ">${id}</i>`
    }

    this._renderFields = function(fields, oriObj) {
        let that = this,
            html = '',
            arr = fields.includes('*') ? Object.keys(oriObj) : fields;
        html += arr.map((i, idx) => {
            return `<li class="field-item" data-field="${i}">${that._getMetaFieldHtml((idx + 1))}${i}(${oriObj[i]})</li>`
        }).join('');
        this.$left.empty().append(html)
    };

    this._renderWorkspace = function(dbName, table) {
        let that = this,
            html = '',
            property = new Property();
        $('#workspace').find('input').each(function(idx) {
            let id = this.id,
                cname = property.getValue(id, 'cname'),
                archivePath = property.getValue(id, 'archivePath'),
                isRelated = archivePath && archivePath.dbName === dbName && archivePath.table === table,
                iHtml = isRelated ? that._getMetaFieldHtml($(`.field-item[data-field="${archivePath.field}"]`).index() + 1) : '';
            html += `<li class="control-item ${archivePath && !isRelated ? 'disabled' : ''}" ${ isRelated ? ('data-field="' + archivePath.field + '"') : '' } data-id="${id}">${iHtml}${id}(${cname})</li>`
        });
        this.$right.empty().append(html);
    };

    this._resetData = function () {
        this.$dbName.text('无');
        this.$tableName.text('无');
        this.$queryType.text('无');
        this.$left.empty();
        this.$right.empty();
    };
}

ArchivePathBatch.prototype = {
    initData: async function (data) {

        let id = $("#property_id").val();
        if (!id) return ;

        let query = new Property().getValue(id, 'query.db');
        if (!query) return alert('当前控件未设置查询属性'); ;

        let dbData = await new FileService().readFile('/profiles/table.json');
        if (!dbData) return alert('获取数据失败！');

        let dbName = query.dbName,
            tableName = query.table,
            queryType = this.TYPE_CONFIG[query.type] && this.TYPE_CONFIG[query.type].name || '无',
            queryTypeValue = this.TYPE_CONFIG[query.type] && this.TYPE_CONFIG[query.type].value,
            fields = query.fields,
            ori_fields = {};
        dbData[dbName][tableName].tableDetail.forEach(i => {
            ori_fields[i.id] = i.cname;
        });

        // 填充存档路径title
        this.$dbName.text(dbName || '无');
        this.$tableName.text(tableName || '无');
        this.$queryType.text(queryType || '无').attr('data-type', queryTypeValue);
        this._renderFields(fields, ori_fields);
        this._renderWorkspace(dbName, tableName);
        this.bindEvents();
    },
    saveData: function () {
        let id = $("#property_id").val();//获取$("#property_id")的值
        if (!id) return;//如果没有退出函数

        if (id === "BODY") return alert("页面属性中不可以配置存档路径！");//如果id等于BODY退出函数并提示

        let property = new Property(),
            dbName = this.$dbName.text(),
            table = this.$tableName.text(),
            type = this.$queryType.attr('data-type');
        this.$right.find('.control-item').each(function() {
            let $this = $(this),
                id = $this.attr('data-id'),
                field = $this.attr('data-field'),
                isDisabled = $this.hasClass('disabled'),
                $meta = $this.find('.meta-field'),
                isDel = $meta.hasClass('del');
            if (isDisabled || !$meta || $meta.length <= 0) return;
            else if (isDel) {
                property.remove(id, 'archivePath');    
            } else if (field) {
                property.setValue(id, 'archivePath', { type, dbName, table, field });
            }
        })
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            let result = confirm("确定要清除所有存储路径配置数据吗？");
            if (!result) return;
            let property = new Property(),
                dbName = this.$dbName.text(),
                table = this.$tableName.text(),
                type = this.$queryType.attr('data-type') || '';
            this.$right.find('.control-item').each(function() {
                let $this = $(this),
                    id = $this.attr('data-id'),
                    isDisabled = $this.hasClass('disabled'),
                    archivePath = property.getValue(id, 'archivePath');
                if (isDisabled) return;
                $this.removeAttr('data-field').find('.meta-field').remove();
                if (archivePath && archivePath.dbName === dbName && archivePath.table === table && archivePath.type === type) {
                    property.remove(id, 'archivePath');
                }
            });
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);//调用basicEvents
    },
    bindEvents: function () {
        var that = this;

        // 依赖jquery ui
        ;(function() {
            $(".field-item").draggable({ revert: true });
            $( ".control-item:not(.disabled)" ).droppable({
                drop: function( event, ui ) {
                    let $control = $(event.target),
                        $field = $(ui.draggable),
                        field = $field.attr('data-field'),
                        fieldIdx = $field.index() + 1;
                    $control.attr('data-field', field).find('.meta-field').remove().end().append(that._getMetaFieldHtml(fieldIdx));
                }
              });
        })();

        this.$modal.on('dblclick', '.control-item', function() {
            let $this = $(this);
            $this.removeAttr('data-field').find('.meta-field').addClass('del');
        })
    }
};