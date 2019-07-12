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
        executeIsSave: function (isSave) {
            
            isSave = !!isSave;//强制转换为布尔值
            var $workspace = $("#workspace"),//获取工作区
                $propDbName = $("#property_db_dbName"),
                $propDbTable = $("#property_db_table"),//数据库属性的表名称
                $propDbField = $("#property_db_field"),//数据库属性的字段名称
                $propDbDesc = $("#property_db_desc"),//数据库属性的字段描述
                customId = $workspace.attr("data-customId"),//模型，或则模板的表名称
                id = $("#property_id").val(),//获取基本属性的编号值
                cname = $("#property_cname").val();//获取基本属性的中文名
            if (!id) return;//如果获取的基本属性的编号值为空直接退出函数
            var dbList = new CommonService().getFileSync("/lib/ZZZZZZZ/table.json")||{},
                options =[];
            Object.keys(dbList).forEach(function(item){
                options.push({name:item,value:item})
            })
            Common.fillSelect($propDbName,{name:"请选择",value:""},options,null,true)
            
            let $control = $workspace.find("#" + id),//获取对应的控件
                $elem = id === "BODY" ? $workspace : $control, //如果id=="body"就把工作区赋值给$elem否则把对应的控件赋值给$elm
                property = new Property();//实例化property类
            $propDbTable.val(isSave ? "" : "");//如果isSave为true则给表名称赋值
            property.save($elem, $propDbTable);//触发属性属性保存保存表名称
            $propDbField.val(isSave ? "" : "");//如果isSave为true则给字段名称赋值
            property.save($elem, $propDbField);//触发属性保存保存字段名称
            $propDbDesc.val(isSave ? cname : "");//如果isSave为true则给字段描述赋值
            property.save($elem, $propDbDesc);//触发属性保存保存字段描述
        }
    };
})();