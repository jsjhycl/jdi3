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

    // this._getMetaFieldHtml = function(id, isDelete) {
    //     return `<i class="meta-field ${isDelete ? 'del' : ''} ">${id}</i>`
    // }

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
            return `<li class="field-item" data-field="${i}"><span class="field-item-content">${i}(${oriObj[i]})</span><span class="related-control" data-field="${i}" data-id="${controlId}">${controlText}</span></li>`
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
                isRelated = archivePath && archivePath.dbName === dbName && archivePath.table === table;
            html += `<li class="control-item ${archivePath && !isRelated ? 'disabled' : ''}" data-id="${id}">${id}(${cname})</li>`
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
        this._renderFields(fields, ori_fields, dbName, tableName);
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
        this.$right.find('.control-item.del').each(function() {
            let id = $(this).attr('data-id');
            property.remove(id, 'archivePath');
        });
        this.$left.find('.related-control').each(function() {
            let $this = $(this),
                id = $this.attr('data-id'),
                field = $this.attr('data-field'),
                idDel = $this.hasClass('del');
            if (!id) return;
            idDel
                ? property.remove(id, 'archivePath')
                : property.setValue(id, 'archivePath', { type, dbName, table, field });
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

            let property = new Property();
            this.$right.find('.control-item').each(function() {
                let $this = $(this),
                    id = $this.attr('data-id'),
                    canClear = $this.hasClass('disabled');
                !canClear && property.remove(id, 'archivePath');
                $this.removeClass('del');
            });
            this.$left.find('.related-control').each(function() {
                $(this).removeClass('del').attr('data-id', '').text('');
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
            $(".control-item:not(.disabled)").draggable({ revert: true });
            $( ".field-item" ).droppable({
                drop: function( event, ui ) {
                    let $field = $(event.target),
                        $relatedC = $field.find('.related-control'),
                        currControlId = $relatedC.attr('data-id'),
                        $control = $(ui.draggable).removeClass('del'),
                        controlId = $control.attr('data-id'),
                        controlText = $control.text();
                    //  清除重复
                    $(`.related-control[data-id="${controlId}"]`).attr('data-id', "").text("");
                    if (currControlId != controlId) {
                        $(`.control-item[data-id="${currControlId}"]`).addClass('del');
                    }
                    $relatedC.removeClass('del').attr('data-id', controlId).text(controlText);
                }
              });
        })();

        this.$modal.on('dblclick', '.field-item', function() {
            let $this = $(this);
            $this.find('.related-control').addClass('del');
        })
    }
};