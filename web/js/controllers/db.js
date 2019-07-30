/**
 * 数据库模块
 */
function Db() {
    /**
     * 获取当前表格获取
     */
    this._getCurrentTable = function () {
        var $workspace = $("#workspace"),//获取当前工作区
            id = $workspace.attr("data-id"),//获取工作区的id
            name = $workspace.attr("data-name"),//获取工作区的data-name属性
            type = $workspace.attr("data-type"),//获取工作区的data-type属性
            subtype = $workspace.attr("data-subtype"),//获取工作区的data-subtype属性
            customId = $workspace.attr("data-customId");//获取工作区的data-customId属性
        if ( subtype === "布局" && customId) return {name: name, value: customId};//如果type是产品或者是数据库定义且subtime为布局并且customid存在 返回当前工作区的name和customid
        else return null;//否则返回空
    };
    /**
     * 
     */
    this._buildTriggerFields = function () {
        var result = [];//定义空数组
        for (var i = 0; i < 20; i++) {//循环遍历小于20
            var item = "C" + i;//定义item c1 c2...
            result.push({name: item, value: item});//向数组中添加对象{name:c1,value:1}
        }
        return result;//返回数组
    };
}

Db.prototype = {
    //获取表格
    getTables: function (hasTrigger, callback) {
        hasTrigger = !!hasTrigger;//hasTrigger转换为布尔值
        var that = this;
        new StructureService().getTables(function (result) {//实例化StructureService并调用getTables方法
            if (Array.isArray(result)) {//如果result是数组的
                //获取当前布局的表数据
                var customId = $("#workspace").attr("data-customId"),//获取工作区的data-customId
                    isExist = result.isExist("value", customId),//判断value属性是否是result的自有属性并且值为customid
                    ctable = that._getCurrentTable();//获取到一个对象
                if (!isExist && ctable) {//如果不是isExist为false且ctable存在
                    result.unshift(ctable);//向result中添加一条数据
                }
                if (hasTrigger) {//如果hasTrigger为真
                    result.unshift({name: "触发表", value: "sys_TRIGGER"});//向result中添加一条对象
                }
            }
            var dbNames =[
                {name:"数据库1",value:"数据库1"},
                {name:"数据库2",value:"数据库2"},
                {name:"数据库3",value:"数据库3"}
            ]
            callback(result,dbNames);
        });
    },
    //获取字段
    getFields: function (table, callback) {
        if (!table) return callback(null);//如果table不存在退出函数

        var that = this;
        if (table === "sys_TRIGGER") {//如果是table是系统触发表
            var fields = that._buildTriggerFields();//调用_buildTriggerfields返回数组[{name:c1,value:1}....]
            return callback(fields);
        }

        new StructureService().getFields(table, function (fields) {//实例化StructureService调用getFields方法
            var result = Array.isArray(fields) ? fields : [];//如果返回的字段是一个数组把结果赋值给result否则把空数组返回给结果
            result = result.map(function (item) {//遍历数组结果
                return {name: item.desc, value: item.name, fieldSplit: item.fieldSplit};//生成对应的格式的
            });
            if (result.length > 0) {//如果result不是一个空的数组
                result.unshift({name: "编号", value: "_id"});//向数组中添加一个函数
            }
            callback(result);//调用回调函数
        });
    }
};