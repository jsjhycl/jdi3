function ArchivePathBatch($modal, $element) {
    BaseModal.call(this, $modal, $element);//调用基础弹窗布局
    
    this.$dbName = this.$modal.find('[data-type="dbname"]');
    this.$tableName = this.$modal.find('[data-type="tablename"]');
    this.$queryType = this.$modal.find('[data-type="querytype"]');
    this.$left = this.$modal.find('.archive-left table > tbody');
    this.$right = this.$modal.find('.archive-right-content');

    // const TYPE_CONFIG = [//定义type类型
    //     {name: "通用查询", value: 0},
    //     {name: "表格查询", value: 1},
    //     {name: "详情链接", value: 2}
    // ];

    this.isNest = false;

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

    this._getAPIds = function() {
        return Object.keys(GLOBAL_PROPERTY).filter(id => {
            return GLOBAL_PROPERTY[id].archivePath;
        }).map(id => {
            return {
                id,
                cname: GLOBAL_PROPERTY[id].cname,
                archivePath: GLOBAL_PROPERTY[id].archivePath
            }
        });
    }

    this.correctControl = function(dbName, table, field, aPIds) {
        if (!dbName || !table || !field || !aPIds) return;
        let idx;
        aPIds.forEach((aP, index) => {
            if (dbName === aP.archivePath.dbName && table === aP.archivePath.table && field === aP.archivePath.field) {
                idx = index;
                return false;
            }
        });
        return aPIds[idx];
    };

    this._renderFields = function(fields, oriObj, dbName, table) {
        let that = this,
            html = '',
            arr = fields.includes('*') ? Object.keys(oriObj) : fields,
            aPIds = that._getAPIds();
        html += arr.map((i, idx) => {
            let control = that.correctControl(dbName, table, i, aPIds),
                controlId = control ? control.id : '',
                controlText = control ? `${control.id}(${control.cname})` : '';
            return `<tr><td >${i}(${oriObj[i]})</td><td><input class="related-control form-control" data-field="${i}" data-id="${controlId}" value=${controlText} ></td></tr>`
        }).join('');
        this.$left.empty().append(html);
    };

    this._renderWorkspace = function(dbName, table) {
        let html = '',
            property = new Property();
        $('#workspace').find('input').each(function(idx) {
            let id = this.id,
                cname = property.getValue(id, 'cname'),
                archivePath = property.getValue(id, 'archivePath'),
                isRelated = archivePath && archivePath.dbName === dbName && archivePath.table === table,
                iscurrRelated = isRelated && $(`.related-control[data-field="${archivePath.field}"]`).data('id') === id;
            html += `<li class="control-item ${archivePath && !isRelated ? 'disabled' : ''}" ${iscurrRelated ? 'data-orifield="'+ archivePath.field + '" data-field="'+ archivePath.field +'"' : ''} data-id="${id}">${id}(${cname})</li>`
        });
        this.$right.empty().append(html);
    };

    this._resetData = function () {
        this.$dbName.text('无');
        this.$tableName.text('无');
        this.$queryType.text('无');
        this.$left.empty();
        this.$right.empty();
        this.isNest = false;
    };
}

ArchivePathBatch.prototype = {
    initData: async function (data) {

        let id = $("#property_id").val();
        if (!id) return ;

        let query = new Property().getValue(id, 'query.db');
        if (!query) {
            this.isNest = true;
            query = new Property().getValue(id, 'query.nest');
        }
        if (!query) return alert('当前控件未设置查询属性'); ;

        let dbData = await new FileService().readFile('/profiles/table.json');
        if (!dbData) return alert('获取数据失败！');

        let dbName = query.dbName,
            tableName = query.table,
            queryType = this.TYPE_CONFIG[query.type] && this.TYPE_CONFIG[query.type].name || (this.isNest ? '嵌套查询' :'无'),
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
        this._renderFields(fields, ori_fields, dbName, tableName);
        this._renderWorkspace(dbName, tableName);
        this.bindEvents();
    },
    saveData: function () {
        let id = $("#property_id").val();
        if (!id) return;

        if (id === "BODY") return alert("页面属性中不可以配置存档路径！");

        let property = new Property(),
            dbName = this.$dbName.text(),
            table = this.$tableName.text(),
            type = this.$queryType.attr('data-type');
        this.$right.find('.control-item').each(function() {
            let id = $(this).attr('data-id'),
                field = $(this).attr('data-field'),
                orifield = $(this).attr('data-orifield');
            field
                ? property.setValue(id, 'archivePath', { type, dbName, table, field })
                : orifield && property.remove(id, 'archivePath')
        });
    },
    clearData: function () {
        var that = this,
            id = $("#property_id").val();
        if (!id) {
            that.$modal.modal("hide");
        } else {
            let result = confirm("确定要清除当前查询已配置的存档路径？");
            if (!result) return;

            this.$right.find('.control-item[data-field]').each(function() {
                $(this).removeAttr('data-field');
            });
            this.$left.find('.related-control').each(function() {
                $(this).attr('data-id', '').val('');
            });
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData);//调用basicEvents
    },
    bindEvents: function () {
        var that = this;

        this.$modal.on('focusin', 'table .related-control', function() {
            $(this).parents('tbody').find('.related-control').removeClass('active').end().end().addClass('active');
            let field = $(this).data('field')
            field && $(`.control-item[data-field="${field}"]`).addClass('active').siblings().removeClass('active');
        });

        this.$modal.on('input', 'table .related-control', function() {
            let $this = $(this),
                oldField = $this.data('field');
                matches = $this.val().match(/^([A-Z]{4}?\b)(?=\(.*|$)/g);
            if (matches) {
                let controlId = matches[0],
                    $control = $(`.control-item[data-id="${controlId}"]`),
                    controlField = $control.attr('data-field');
                
                if (oldField !== controlId) { $(`.control-item[data-field="${oldField}"]`).removeAttr('data-field'); }
                controlField && controlField != oldField && $(`.related-control[data-field="${controlField}"]`).attr('data-id', '').val('');
                $control.attr('data-field', oldField);
            } else {
                $(`.control-item[data-field="${oldField}"]`).removeAttr('data-field');
            }
        });

        this.$modal.on('click', '.control-item', function() {
            let $target = that.$modal.find('.related-control.active');
            if (!$target || $target.length <= 0) return;
            let $this = $(this),
                controlId = $this.data('id'),
                targetField = $target.data('field');
            
            $this.attr('data-field', targetField).addClass('active').siblings().removeClass('active').end().siblings(`[data-field="${targetField}"]`).removeAttr('data-field');
            $target.parents('tbody').find(`.related-control[data-id="${controlId}"]`).attr('data-id', "").val('')
                .end().end().attr('data-id', controlId).val($this.text())
        });

        this.$modal.on('click', '.archive-title .auto-match', function() {
            var workspaceNode = {};
            that.$right.find('.control-item').each(function() {
                var id = $(this).attr('data-id');
                if (id === 'zzzz') return;
                workspaceNode[id] = {
                    text: $(this).text(),
                    $dom: $(this)
                };
            })

            that.$left.find('.related-control').each(function() {
                var $this = $(this),
                    field = $this.attr('data-field');

                if (workspaceNode[field]) {
                    $this.attr('data-id', field).val(workspaceNode[field].text);
                    workspaceNode[field].$dom.attr('data-field', field)
                    // .siblings(`[data-field="${field}"]`).removeAttr('data-field');
                    delete workspaceNode[field];
                } else {
                    $this.val('').attr('data-id', '')
                }
            });

            var nodeKeys = Object.keys(workspaceNode);
            if (nodeKeys.length > 0) {
                nodeKeys.forEach(i => {
                    workspaceNode[i].$dom.removeAttr('data-field')
                })
            }

        })
    }
};