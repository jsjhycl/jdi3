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
            var $elems = $('[data-target="#dataSource_static_modal"],[data-target="#dataSource_db_modal"]');//获取页面中静态数据源，数据库数据源
            if (controlType === "文本输入框" || controlType === "下拉列表") {//判断控件类型是不是文本输入框或则下拉列表
                $elems.prop("disabled", false);//如果是给静态数据源，和数据库数据源的disabled(禁止点击事件)为false
            } else {
                $elems.prop("disabled", true);//如果不是的话则给静态数据源，合适数据库数据源的disabled(禁止点击事件)为true
            }
        },
        /**
         * 执行是否入库按钮的点击
         * @param {*} isSave 
         */
        executeIsSave: async function (isSave) {
            isSave = !!isSave;//强制转换为布尔值
            var $workspace = $("#workspace"),//获取工作区
                $propDbName = $("#property_db_dbName"),
                $propDbTable = $("#property_db_table"),//数据库属性的表名称
                $propDbField = $("#property_db_field"),//数据库属性的字段名称
                $propDbDesc = $("#property_db_desc"),//数据库属性的字段描述
                $propDbFieldSplit = $("#property_db_fieldSplit"),
                customId = $workspace.attr("data-customId"),//布局，或则表单的表名称
                id = $("#property_id").val(),//获取基本属性的编号值
                cname = $("#property_cname").val();//获取基本属性的中文名
            if (!id) return;//如果获取的基本属性的编号值为空直接退出函数
            var dbList = await new FileService().readFile("/profiles/table.json"),
                options =[];
            Object.keys(dbList).forEach(function(item){
                options.push({name:item,value:item})
            })
            Common.fillSelect($propDbName,{name:"请选择",value:""},options,null,true)
            
            let $control = $workspace.find("#" + id),//获取对应的控件
                $elem = id === "BODY" ? $workspace : $control, //如果id=="body"就把工作区赋值给$elem否则把对应的控件赋值给$elm
                property = new Property();//实例化property类
                $propDbName.val(isSave ? "" : "")
                property.save($elem, $propDbName )
            $propDbTable.val(isSave ? "" : "");//如果isSave为true则给表名称赋值
            property.save($elem, $propDbTable);//触发属性属性保存保存表名称
            isSave || Common.fillSelect($propDbTable,{name:"请选择数据表",value:""},null,null,true);

            $propDbField.val(isSave ? "" : "");//如果isSave为true则给字段名称赋值
            property.save($elem, $propDbField);//触发属性保存保存字段名称
            isSave || Common.fillSelect($propDbField,{name:"请选择字段",value:""},null,null,true);

            $propDbFieldSplit.val(isSave? "":"")
            property.save($elem, $propDbFieldSplit)
            isSave || Common.fillSelect($propDbFieldSplit,{name:"请选择字段分段",value:""},null,null,true);

            $propDbDesc.val(isSave ? cname : "");//如果isSave为true则给字段描述赋值
            property.save($elem, $propDbDesc);//触发属性保存保存字段描述
        },

        // ，在基本属性中 选择 控件类型是上传控件时，设置其触发属性的值
        setUploadEvent: function() {
            var type = $("#workspace").data("subtype");
            if (type === "布局") {
                var id = $("#property_id").val(),
                    property = new Property();
                if (id) {
                    var obj = property.getProperty(id);
                        events = null,
                        defaultUpload = {
                            publish: { type: "click", key: id + "_click_SPP", data: null },
                            subscribe: { conditions: null,copySend: null, custom: ["upload"], notify: null, property: null, query: null }
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
                        }
                        !hasUplaod && events.push(defaultUpload);
                    }
                    property.setValue(id, "events", events)
                    property.load($("#" + id))
                }
            } else {

            }
        },

        // 下拉列表，直接弹出数据源配置弹窗
        showDataSourceTab: function() {
            var type = $("#workspace").data("subtype");
            if (type === "布局") {
                $('#dataSource_db_tab_modal').modal('show');
            }
        }
    };
})();