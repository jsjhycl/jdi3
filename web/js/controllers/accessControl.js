/** 
 * 是否允许点击模块静态数据源，数据库数据源
 */
var AccessControl = (function () {
    return {
        /**
         * 根据控件类型对页面中的属性栏中的静态数据源，数据库数据源的阻止点击事件
         * @param {*} controlType 控件类型
         */
        executeControlType: function (controlType) {
            var $elems = $('[data-target="#dataSource_static_modal"],[data-target="#dataSource_db_modal"]'); //获取页面中静态数据源，数据库数据源
            if (controlType === "文本输入框" || controlType === "下拉列表" || controlType === "树形控件" || controlType === "联动控件" || controlType === "自定义下拉列表") { //判断控件类型是不是文本输入框或则下拉列表
                $elems.prop("disabled", false); //如果是给静态数据源，和数据库数据源的disabled(禁止点击事件)为false
            } else {
                $elems.prop("disabled", true); //如果不是的话则给静态数据源，合适数据库数据源的disabled(禁止点击事件)为true
            }
        },
        /**
         * 执行是否入库按钮的点击
         * @param {*} isSave 
         */
        executeIsSave: async function (isSave) {
            isSave = !!isSave; //强制转换为布尔值
            var $workspace = $("#workspace"), //获取工作区
                $propDbName = $("#property_db_dbName"),
                $propDbTable = $("#property_db_table"), //数据库属性的表名称
                $propDbField = $("#property_db_field"), //数据库属性的字段名称
                $propDbDesc = $("#property_db_desc"), //数据库属性的字段描述
                $propDbFieldSplit = $("#property_db_fieldSplit"),
                customId = $workspace.attr("data-customId"), //布局，或则表单的表名称
                id = $("#property_id").val(), //获取基本属性的编号值
                cname = $("#property_cname").val(); //获取基本属性的中文名
            if (!id) return; //如果获取的基本属性的编号值为空直接退出函数
            var dbList = await new FileService().readFile("/profiles/table.json"),
                options = [];
            Object.keys(dbList).forEach(function (item) {
                options.push({
                    name: item,
                    value: item
                })
            })
            Common.fillSelect($propDbName, {
                name: "请选择",
                value: ""
            }, options, null, true)

            let $control = $workspace.find("#" + id), //获取对应的控件
                $elem = id === "BODY" ? $workspace : $control, //如果id=="body"就把工作区赋值给$elem否则把对应的控件赋值给$elm
                property = new Property(); //实例化property类
            $propDbName.val(isSave ? "" : "")
            property.save($elem, $propDbName)
            $propDbTable.val(isSave ? "" : ""); //如果isSave为true则给表名称赋值
            property.save($elem, $propDbTable); //触发属性属性保存保存表名称
            isSave || Common.fillSelect($propDbTable, {
                name: "请选择数据表",
                value: ""
            }, null, null, true);

            $propDbField.val(isSave ? "" : ""); //如果isSave为true则给字段名称赋值
            property.save($elem, $propDbField); //触发属性保存保存字段名称
            isSave || Common.fillSelect($propDbField, {
                name: "请选择字段",
                value: ""
            }, null, null, true);

            $propDbFieldSplit.val(isSave ? "" : "")
            property.save($elem, $propDbFieldSplit)
            isSave || Common.fillSelect($propDbFieldSplit, {
                name: "请选择字段分段",
                value: ""
            }, null, null, true);

            $propDbDesc.val(isSave ? cname : ""); //如果isSave为true则给字段描述赋值
            property.save($elem, $propDbDesc); //触发属性保存保存字段描述
        },

        // ，在基本属性中 选择 控件类型是上传控件时，设置其触发属性的值
        setUploadEvent: function () {
            var type = $("#workspace").data("type");
            if (type === "布局") {
                var id = $("#property_id").val(),
                    property = new Property();
                if (id) {
                    var obj = property.getProperty(id);
                    events = null,
                        defaultUpload = {
                            publish: {
                                type: "click",
                                key: id + "_click_SPP",
                                data: null
                            },
                            subscribe: {
                                conditions: null,
                                copySend: null,
                                custom: ["upload"],
                                notify: null,
                                property: null,
                                query: null
                            }
                        }
                    // 触发属性未配置
                    if (!obj.events || !Array.isArray(obj.events) || obj.events.length <= 0) {
                        events = [defaultUpload];
                    } else {
                        // 触发属性已配置，遍历所有配置，如果已经有上传，则不需要配置，否则新加一条触发配置，只配置上传方法
                        events = obj.events.slice(0);
                        var hasUplaod = false;
                        for (var i = 0; i < events.length; i++) {
                            if (events[i].subscribe.custom.indexOf("upload") > -1) {
                                hasUplaod = true;
                                break;
                            }
                        }!hasUplaod && events.push(defaultUpload);
                    }
                    property.setValue(id, "events", events)
                    property.load($("#" + id))
                }
            } else {

            }
        },

        // 下拉列表，直接弹出数据源配置弹窗
        showDataSourceTab: function () {
            var type = $("#workspace").data("type");
            if (type === "布局") {
                $('#dataSource_db_tab_modal').modal('show');
            }
        },

        executePagePersent: function ($control) {
            let customId = $("#workspace").attr('data-id');
            if (!customId || !(customId.slice(2, 3) === 'K')) return;

            let $table = $control.parents('table');
            if (!$table || $table.length <= 0) return;

            let id = $control.attr('id'),
                location = $control.parent().attr('location');
            if (!location) return false;

            let rowMap = location.split(':')[0],
                currColStart = rowMap.split('-')[0] * 1,
                currRowStart = rowMap.split('-')[1] * 1,
                property = new Property();
            rowPersent = property.getValue(id, 'page.rowPersent'),
                colPersent = property.getValue(id, 'page.colPersent');

            if (rowPersent && colPersent) return;
            // 横百分比未设置

            let PAGE_PERSENT = this.getPagePersent($table)

            // PAGE_PERSENT = [];

            // for(let i = 0; i <= row; i ++) {
            //     PAGE_PERSENT.push([]);
            // }

            // 抽象table表格
            // $table.find('tr').each(function() {
            //     var $tr = $(this),
            //         trIdx = $tr.index();
            //     $tr.find('td').each(function() {
            //         var $td = $(this),
            //             tdIdx = $td.index(),
            //             colspan = Number($td.attr('colspan')) || 1,
            //             rowspan = Number($td.attr('rowspan')) || 1,
            //             inputId = $td.find('input').attr('id'),
            //             rowPer = property.getValue(inputId, 'page.rowPersent'),
            //             colPer = property.getValue(inputId, 'page.colPersent');
            //         // if (rowPer || colPer) {
            //             for (let i = 0; i < rowspan; i ++) {
            //                 for (let j = 0; j < colspan; j ++) {
            //                     // if (rowPer) {
            //                         var averageRowPer = rowPer / colspan,
            //                             averageColPer = colPer / rowspan;
            //                         if (!DataType.isObject(PAGE_PERSENT[trIdx + i][tdIdx + j])) {
            //                             // PAGE_PERSENT[trIdx + i][tdIdx + j] = { row: averageRowPer, id: inputId }
            //                             PAGE_PERSENT[trIdx + i][tdIdx + j] = { id: inputId }
            //                             rowPer && !PAGE_PERSENT[trIdx + i][tdIdx + j].row && (PAGE_PERSENT[trIdx + i][tdIdx + j].row = averageRowPer)
            //                             colPer && !PAGE_PERSENT[trIdx + i][tdIdx + j].col && (PAGE_PERSENT[trIdx + i][tdIdx + j].col = averageColPer)
            //                         } else {
            //                             let curr = 0;
            //                             while( curr < col && (trIdx + i < row) && DataType.isObject(PAGE_PERSENT[trIdx + i][curr])) {
            //                                 curr ++;
            //                             };
            //                             curr >= col && curr -1
            //                             !DataType.isObject(PAGE_PERSENT[trIdx + i][curr]) && (PAGE_PERSENT[trIdx + i][curr] = { id: inputId })
            //                             // PAGE_PERSENT[trIdx + i][curr] = { id: inputId }
            //                             rowPer && !PAGE_PERSENT[trIdx + i][curr].row && (PAGE_PERSENT[trIdx + i][curr].row = averageRowPer)
            //                             colPer && !PAGE_PERSENT[trIdx + i][curr].col && (PAGE_PERSENT[trIdx + i][curr].col = averageColPer)
            //                         }
            //                     // }
            //                 }   
            //             }
            //         // }
            //     })
            // });

            // $table.find('tr').each(function() {
            //     let $tr = $(this);
            //     $tr.find('td input').each(function() {
            //         let $td = $(this).parent('td'),
            //             location = $td.attr('location'),
            //             inputId = $(this).attr('id');
            //         if (!location) return false;
            //         let rowPer = property.getValue(inputId, 'page.rowPersent'),
            //             colPer = property.getValue(inputId, 'page.colPersent'),
            //             colspan = Number($td.attr('colspan')) || 1,
            //             rowspan = Number($td.attr('rowspan')) || 1,
            //             rowMap = location.split(':')[0],
            //             colMap = location.split(':')[1] || rowMap,
            //             colStart = rowMap.split('-')[0] * 1,
            //             rowStart = rowMap.split('-')[1] * 1,
            //             colEnd = colMap.split('-')[0] * 1,
            //             rowEnd = colMap.split('-')[1] * 1;
            //         for (let i = rowStart; i <= rowEnd; i ++) {
            //             for (let j = colStart; j <= colEnd; j ++) {
            //                 let averageRowPer = rowPer / colspan,
            //                     averageColPer = colPer / rowspan;
            //                 PAGE_PERSENT[i][j] = { id: inputId };
            //                 rowPer && (PAGE_PERSENT[i][j].row = averageRowPer)
            //                 colPer && (PAGE_PERSENT[i][j].col = averageColPer)
            //             }   
            //         }
            //     })
            // });

            if (!rowPersent) {
                var {
                    width
                } = _calcPrev(id, currRowStart, currColStart);
                width > 0 && property.setValue(id, 'page.rowPersent', width);
            }

            // 纵百分比未设置
            if (!colPersent) {
                var {
                    height
                } = _calcPrev(id, currRowStart, currColStart);
                height > 0 && property.setValue(id, 'page.colPersent', height)
            }

            function _calcPrev(id, rowIdx, colIdx) {

                let sumH = 0,
                    sumW = 0;
                PAGE_PERSENT.forEach(tr => {
                    if (tr[colIdx] && tr[colIdx].id !== id) {
                        sumH += tr && tr[colIdx].col || 0
                    }
                })

                if (PAGE_PERSENT[rowIdx]) {
                    PAGE_PERSENT[rowIdx].forEach(td => {
                        if (td && td.id !== id) {
                            sumW += td && td.row || 0;
                        }
                    })
                }

                sumH = 100 - sumH;
                sumW = 100 - sumW;
                sumH = (sumH >= 100 || sumH < 0) ? "" : sumH;
                sumW = (sumW >= 100 || sumW < 0) ? "" : sumW;

                return {
                    height: Math.round(sumH),
                    width: Math.round(sumW)
                }
            }
        },

        clearRemainPagePVal: function (id, type) {

            let TABLE_MAP = AccessControl.getPagePersent($("#" + id).parents('table')),
                property = new Property(),
                ids = [],
                {
                    rowStart,
                    rowEnd,
                    colStart,
                    colEnd
                } = Common.getTdLocation($("#" + id).parent());

            if (type === "rowPersent") {
                for (let i = rowStart; i <= rowEnd; i++) {
                    for (let j = colStart; j < TABLE_MAP[i].length; j++) {
                        let _id = TABLE_MAP[i][j].id;
                        _id !== id && !ids.includes(_id) && ids.push(_id)
                    }
                };
                ids.forEach(item => {
                    property.setValue(item, `page.rowPersent`, '');
                    this.setPagePersentVal($("#" + item));
                });
            }

            if (type === "colPersent") {
                for (let i = rowEnd; i < TABLE_MAP.length; i++) {
                    for (let j = colStart; j <= colEnd; j++) {
                        let _id = TABLE_MAP[i][j].id;
                        _id !== id && !ids.includes(_id) && ids.push(_id)
                    }
                };
                ids.forEach(item => {
                    property.setValue(item, `page.colPersent`, '');
                    this.setPagePersentVal($("#" + item));
                });
            }
        },

        getPagePersent: function ($table) {
            if (!$table || $table.length <= 0) return false;
            var PAGE_PERSENT = [],
                {
                    row
                } = TableHelper.getRowAndCol($table);
            for (let i = 0; i <= row; i++) {
                PAGE_PERSENT.push([]);
            };

            $table.find('tr').each(function () {
                let $tr = $(this);
                $tr.find('td input').each(function () {
                    let $td = $(this).parent('td'),
                        location = $td.attr('location'),
                        inputId = $(this).attr('id');
                    if (!location) return false;
                    let property = new Property(),
                        rowPer = property.getValue(inputId, 'page.rowPersent'),
                        colPer = property.getValue(inputId, 'page.colPersent'),
                        colspan = Number($td.attr('colspan')) || 1,
                        rowspan = Number($td.attr('rowspan')) || 1,
                        {
                            colStart,
                            rowStart,
                            colEnd,
                            rowEnd
                        } = Common.getTdLocation($td);
                    for (let i = rowStart; i <= rowEnd; i++) {
                        for (let j = colStart; j <= colEnd; j++) {
                            let averageRowPer = rowPer / colspan,
                                averageColPer = colPer / rowspan;
                            PAGE_PERSENT[i][j] = {
                                id: inputId
                            };
                            rowPer && (PAGE_PERSENT[i][j].row = averageRowPer)
                            colPer && (PAGE_PERSENT[i][j].col = averageColPer)
                        }
                    }
                })
            });
            return PAGE_PERSENT
        },

        findRemainCell: function (id, rowIdx, colIdx) {
            let rowStart = 0;
            for (let i = rowIdx; i < PAGE_PERSENT.length; i++) {
                if (PAGE_PERSENT[i][colIdx].id !== id) {
                    rowStart = PAGE_PERSENT[i][colIdx].id;
                    return false;
                }
            };
            console.log(rowStart)
        },

        bindPagePersentEvent: function (workSpaceId) {
            if (!workSpaceId || workSpaceId.slice(2, 3) !== 'K') return;
            let NAME_SPACE = '.PAGE_PERSENT',
                that = this;
            $("#workspace").off(NAME_SPACE)
            if (workSpaceId.slice(2, 3) === 'K') {
                $("#workspace").on('input' + NAME_SPACE, "table input[id]", function () {
                    let $this = $(this),
                        val = $this.val(),
                        id = $this.attr('id'),
                        persent = val.split(/[,，]/);
                    rowP = persent[0],
                        colP = persent[1];

                    if (!id) return;

                    let property = new Property(),
                        {
                            rowPersent,
                            colPersent
                        } = property.getValue(id, 'page');

                    if (rowPersent != rowP) {
                        property.setValue(id, 'page.rowPersent', rowP);
                        $("#propertybar #property_page_rowPersent").val(rowP);
                        that.clearRemainPagePVal(id, 'rowPersent');
                    }

                    if (colPersent != colP) {
                        property.setValue(id, 'page.colPersent', colP);
                        $("#propertybar #property_page_colPersent").val(colP);
                        that.clearRemainPagePVal(id, 'colPersent');
                    }
                });
            }
        },

        setPagePersentVal: function ($control, Value) {
            let customId = $("#workspace").attr('data-id');
            if (!customId || !(customId.slice(3, 4) === 'W') || !$control || $control.length <= 0) return;

            let id = $control.attr('id');
            if (!id) return;

            let {
                rowPersent = '', colPersent = ''
            } = new Property().getValue(id, 'page') || {};
            $control.val(
                Value ?
                Value :
                (!rowPersent && !colPersent) ? '' : (rowPersent + ',' + colPersent)
            )
        }
    };
})();