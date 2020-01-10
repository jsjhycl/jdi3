function Property() {
    this.$propertybar = $("#propertybar"); //获取属性栏
    this.BODY = "BODY";
    this._clearStyles = function () {
        var that = this;
        $("#workspace").find(".focus").removeClass("focus"); //获取工作区所有类名为focus的元素并移除focus类名
        that.$propertybar.find(":text,select").val(""); //找到属性栏中所有的输入框下拉框清空它们的值
        that.$propertybar.find(":checkbox:checked").prop("checked", false); //所有的复选框变成没有勾选的
        that.$propertybar.find("#property_relatedId").parents('tr').remove();
    };
    this._traverseProperty = function ($elem) {
        if (!$elem || $elem.length <= 0) return; //如果没有选中元素退出函数

        var that = this,
            id = $elem.attr("id"); //获取当前元素的id值
        isArrow = $elem.data('type') === 'arrow';
        if (id === "workspace") { //如果id值为workspace
            id = that.BODY; //id赋值为BODY
            !GLOBAL_PROPERTY[that.BODY] && that.setDefault(id); //调用setDefault方法 设置一下默认的属性
        }
        // 清空属性
        this.$propertybar.find("[id^=property_]").val("");
        AccessControl.executePagePersent($elem);

        var data = $.extend(true, {
            id: id
        }, that.getProperty(id)) //调用jquery的extend方法把{id:id}和调用getProperty方法返回的对象递归合并
        for (var key in data) { //遍历data对象
            var value = data[key], //获取key值
                $property = $("#property_" + key); //把key值加上#property_这样可以获取页面上的元素
            //判断“第一层属性”是否为“属性配置元素”
            if ($property.length > 0) { //是“属性配置元素”
                //PS：第一层属性值为字符串或者对象
                if ($property.is(":text") || $property.is("textarea") || $property.is("select")) { //“属性配置元素”为文本框或者下拉列表
                    var tvalue = (DataType.isObject(value) || Array.isArray(value)) ? JSON.stringify(value) : value; //判断这个值是否是object或则是数组
                    $property.val(tvalue); //设定文本框的值
                }
                if ($property.is(":checkbox")) { //“属性配置元素”为复选框
                    $property.prop("checked", !!value); //给起设置为true或则false
                }
            } else { //不是“属性配置元素”
                //PS：继续遍历属性值，获取“属性配置元素”
                if (DataType.isObject(value)) { //判断是不是object
                    for (var ckey in value) { //遍历对象
                        var cvalue = value[ckey]; //获取对象对象的对应key的值
                        $property = $("#property_" + key + "_" + ckey); //获取页面上对应的元素
                        if ((key + ckey) == "dbdbName" || (key + ckey) == "dbtable" || (key + ckey) == "dbfield" || (key + ckey) == "dbfieldSplit") {
                            this.setOptions($property, ckey, value)
                        }
                        if ($property.length > 0) { //如果能获取到元素
                            if ($property.is(":text") || $property.is("textarea") || $property.is("select")) { //属性配置元素为文本框或则下拉框
                                $property.val((DataType.isObject(cvalue) || Array.isArray(cvalue)) ? JSON.stringify(cvalue) : cvalue); //判断这个值是不是是不是对象或则数组如果是转换成字符串存到输入框中否则直接存进去
                            }
                            if ($property.is(":checkbox")) { //如果是复选框
                                $property.prop("checked", !!cvalue); //给这个复选框设置true或则false
                            }
                        }

                    }
                }
            }
        } !isArrow && $elem.addClass("focus"); //给这个元素添加类名focus
    };
    //生成下拉列表
    this.setOptions = function ($select, ckey, data) {
        var dbName = data.dbName,
            table = data.table,
            field = data.field,
            dbList = AllDbName,
            options = [],
            selectValue = "";

        if (ckey == "dbName") {
            selectValue = data.dbName
            Object.keys(dbList).forEach(function (item) {
                options.push({
                    name: item,
                    value: item
                })
            })
        }
        if (ckey == "table") {
            selectValue = data.table
            if (dbName) {
                Object.keys(dbList[dbName]).forEach(function (item) {
                    options.push({
                        name: dbList[dbName][item]["tableDesc"],
                        value: item
                    })
                })
            }
        }
        if (ckey == "field") {
            selectValue = data.field
            if (dbName && table && dbList[dbName][table]) {
                var fields = dbList[dbName][table].tableDetail;
                fields.forEach(function (item) {
                    options.push({
                        name: item.cname,
                        value: item.id
                    })
                })
            }
        }
        if (ckey == "fieldSplit") {

            if (dbName && table && dbList[dbName][table]) {
                var fields = dbList[dbName][table].tableDetail,
                    fieldSplits = '';
                fields.forEach(function (item) {
                    if (data.field == item.id) {
                        fieldSplits = Number(item.fieldSplit)
                    }
                })
                selectValue = fieldSplits;
                for (i = 1; i <= fieldSplits; i++) {
                    options.push({
                        name: "插入",
                        value: String(i)
                    })
                }
            }
        }

        Common.fillSelect($select, {
            name: "请选择",
            value: ""
        }, options, selectValue, true)
    };

    this.setRelatedId = function ($control) {
        if (!$control || !$control.attr('id').startsWith('phone_')) return;
        $("#property_relatedId").length <= 0 && $("#property_id").parents('tr').after('<tr data-second-filter="relatedId"><td><label for="property_relatedId">关联元素编号</label></td><td><input id="property_relatedId" type="text" data-datatype="String" data-attrorstyle="attribute"></td></tr>');
    }
}

Property.prototype = {

    /**
     * 加载属性
     * @param {*} $control 
     */
    load: function ($control) {
        if (!$control || $control.length <= 0) return; //如果没有选择控件退出函数

        var that = this;
        that._clearStyles(); //调用_clearStyles
        that.setRelatedId($control);

        var isBody = $control.attr("id") === "workspace"; //获取当前控件的id如果是worksapce则给isbody赋值为true
        if (isBody || //isBod为true时
            (!isBody && //或则不止整个工作区时
                (
                    //非子模块元素
                    ($control.hasClass("workspace-node") && $control.attr("data-type") !== "div") ||
                    //子模块元素内部的表单元素
                    ($control.parents(".workspace-node").data("type") === "div" && $control.is(":input") && !$control.is(".workspace-node"))
                )
            )
        ) {
            that._traverseProperty($control); //调用_traverseProperty
            AccessControl.executeControlType($("#property_controlType").val()); //获取该元素的文本类型然后给数据源属性判断是否可以点击
            AccessControl.setPagePersentVal($control);
        }
    },
    /**
     * 保存属性
     * @param {*} $control 
     * @param {*} $property 
     */
    save: function ($control, $property) {
        if (!$control || $control.length <= 0) return; //如果$control不存则或则长度小于0退出函数
        if (!$property || $property.length <= 0) return; //如果$property不存则或则长度小于0退出函数

        var that = this,
            isBody = $control.attr("id") === "workspace", //判断选中的元素是不是工作区如果是isbody设置为true否则设置为false
            id = isBody ? that.BODY : $control.attr("id"), //判断是不是工作区是的话给id这是为BODY如果不是获取该元素的id值
            pid = $property.attr("id"), //获取$property的id属性
            pkey = pid.substring("property_".length), //把获取的pid除去property_后的值赋值给pkey
            pvalue = $property.val(); //获取对应元素的值
        //修改元素属性（特殊处理）
        if (!isBody) {
            if (pid === "property_value") { //pid等于property_value
                GLOBAL_PROPERTY[id].value = pvalue;
                $control.val(pvalue);
                $control.attr("value", pvalue); //则在$control修改value值
            }
            if (pid === "property_name") { //pid等于property_name
                $control.attr("name", pvalue); //则在$control修改name值
            }
        }
        //转换数据类型
        var dataType = $property.attr("data-dataType"); //获取$property上的data-type属性
        pvalue = DataType.convert(dataType, pvalue, $property); //对应元素转换为对应的类型
        //PS：待递归优化
        var ckey;
        if (pkey.indexOf("_") > -1) { //在pkey中寻找 _
            var keys = pkey.split("_");
            pkey = keys.length >= 1 ? keys[0] : ""; //判断keys的长度是否大于等于1吧数组的第一个元素赋值给pkey
            ckey = keys.length >= 2 ? keys[1] : ""; //判断keys的长度是否大于等于2把数组的第二个元素赋值给ckey
        }
        if (ckey) { //如果ckey存在
            if (!GLOBAL_PROPERTY[id].hasOwnProperty(pkey)) { //如果对应的GLOBAL_PROPERTY下面的id中没有改属性
                GLOBAL_PROPERTY[id][pkey] = {}; //为这个id下t添加一个空的对象
            }
            if (ckey == "db" || ckey == "nest") {
                pvalue ? GLOBAL_PROPERTY[id][pkey][ckey] = pvalue : delete GLOBAL_PROPERTY[id][pkey][ckey]
            } else {
                GLOBAL_PROPERTY[id][pkey][ckey] = pvalue; //如果存在这个属性则给这个属性下面对应的key赋值
            }
        } else {
            GLOBAL_PROPERTY[id][pkey] = pvalue; //如果不存ckey直接给这个pkey属性赋值
        }
    },
    /**
     * 清除DOM
     */
    clearDOM: function () {
        $("#workspace.focus").removeClass("focus"); //获取工作区中的focus的类名
        $("#workspace").find(".focus").removeClass("focus"); //移除工作区中所有具有focus类名的元素的focus类名
        this.$propertybar.find('[id^="property_"]').val(""); //属性栏中的所有所有已property_开头的id值设置为空
    },
    /**
     * 获取属性
     * @param {*} id 
     */
    getProperty: function (id) {
        if (!id) return null; //如果id不存在退出函数
        return $.extend(true, {}, GLOBAL_PROPERTY[id]); //返回GLOBAL_PROPERTY对应的id的属性与一个空对象合并的结果
    },
    /**
     * 获取数据库属性
     * @param {*} defaultName 默认的表名称
     * @param {*} defaultDesc 默认的字段描述
     */
    // getDbProperty: function (defaultName, defaultDesc) {
    //     var result = {};//声明一个空对象
    //     for (var id in GLOBAL_PROPERTY) {//遍历GLOBAL_PROPERTY
    //         var property = GLOBAL_PROPERTY[id],//获取对应id的属性
    //             db = property.db;//获取对应id下的property属性的db属性
    //         if (db && !!db.isSave) {//判断db属性是否存在且db下面的isSave属性为真
    //             var table = db.table;//获取对应的存入表名称
    //             if (table) {//如果表存在
    //                 var field = db.field,//字段名称
    //                     fieldSplit = db.fieldSplit,//字段分段
    //                     desc = db.desc;//字段描述
    //                     dbName = db.dbName
    //                 if (result.hasOwnProperty(table)) {//result对象中是存在table这个属性
    //                     var fields = result[table]["fields"];
    //                     if (!Array.isArray(fields)) {//如果fields不是一个数组
    //                         fields = [];//给字段名称设置一个空数组
    //                     }
    //                     fields.push({id:id,dbName:dbName, name: field, desc: desc, type: "String", fieldSplit: fieldSplit});//向fields中添加一条对象
    //                 } else {//reslut中不存在这个table
    //                     result[table] = {//新增加一个table属性
    //                         desc: defaultName === table ? defaultDesc : table,//如果defalutname等于table则使用defaultDesc否则table
    //                         fields: []
    //                     };
    //                     result[table].fields.push({id:id,dbName:dbName, name: field, desc: desc, type: "String", fieldSplit: fieldSplit});//向fields中添加一条对象
    //                 }
    //             }

    //         }
    //     }
    //     return result;//返回对象
    // },

    getDbProperty: function (defaultName, defaultDesc) {
        var result = {};
        for (var id in GLOBAL_PROPERTY) {
            var property = GLOBAL_PROPERTY[id],
                saveDb = property.db;
            if (DataType.isArray(saveDb)) {
                saveDb.forEach(db => {
                    if (db && !!db.isSave) { //判断db属性是否存在且db下面的isSave属性为真
                        var table = db.table; //获取对应的存入表名称
                        if (table) { //如果表存在
                            var field = db.field, //字段名称
                                fieldSplit = db.fieldSplit, //字段分段
                                dbName = db.dbName,
                                sliceTarget = db.sliceTarget,
                                fieldSlice = db.fieldSlice,
                                desc = db.desc; //字段描述
                            if (result.hasOwnProperty(table)) { //result对象中是存在table这个属性
                                var fields = result[table]["fields"];
                                if (!Array.isArray(fields)) { //如果fields不是一个数组
                                    fields = []; //给字段名称设置一个空数组
                                }
                                fields.push({
                                    id: id,
                                    dbName: dbName,
                                    name: field,
                                    desc: desc,
                                    type: "String",
                                    fieldSplit: fieldSplit,
                                    sliceTarget: sliceTarget,
                                    fieldSlice: fieldSlice
                                }); //向fields中添加一条对象
                            } else { //reslut中不存在这个table
                                result[table] = { //新增加一个table属性
                                    desc: defaultName === table ? defaultDesc : table, //如果defalutname等于table则使用defaultDesc否则table
                                    fields: []
                                };
                                result[table].fields.push({
                                    id: id,
                                    dbName: dbName,
                                    name: field,
                                    desc: desc,
                                    type: "String",
                                    fieldSplit: fieldSplit,
                                    sliceTarget: sliceTarget,
                                    fieldSlice: fieldSlice
                                }); //向fields中添加一条对象
                            }
                        }

                    }
                })
            }
        }
        return result;
    },
    /**
     * 
     * @param {*} id 
     * @param {*} key 
     */
    getValue: function (id, key) {
        if (!id) return; //如果id不存则退出函数
        if (!key) return GLOBAL_PROPERTY.hasOwnProperty(id) ? $.extend(true, {}, GLOBAL_PROPERTY[id]) : null; //如果key不存在查看GLOBAL_Property中是否存在id属性存在的话返回这个id对对应的属性否则返回空

        var temp = $.extend(true, {}, GLOBAL_PROPERTY[id]); //获取对应id的属性对象
        if (key.indexOf(".") > -1) { //如果.在key中存在
            var keys = key.split("."); //吧key分割
            for (var i = 0; i < keys.length; i++) { //遍历数组
                var ckey = keys[i], //获取ckey
                    cvalue = temp[ckey]; //获取ckey对应的value
                if (!cvalue) { //如果不存在对应的value值
                    temp = "";
                    break;
                } else { //如果存在对应的value
                    temp = cvalue;
                }
            }
            return temp; //返回对应key对应的值
        } else return temp[key]; //如果不存在.直接返回值
    },
    /**
     * 设置属性值的value
     * @param {*} id 
     * @param {*} key 
     * @param {*} value 
     */
    setValue: function (id, key, value) {
        if (!id) return; //如果id不存在退出函数
        if (!key) { //如果key不存在
            GLOBAL_PROPERTY[id] = value; //给GLOBAL_PROPERTY下面的id属性设置value
            return; //退出函数
        }
        if (!GLOBAL_PROPERTY.hasOwnProperty(id)) { //判断GLOBAL_PROPERTY对象中没有id
            GLOBAL_PROPERTY[id] = {}; //在GLOBAL_PROPERTY对应的id上添加一个空对象
        }
        if (key.indexOf(".") > -1) { //如果key中有.
            var temp = GLOBAL_PROPERTY[id], //获取对应id的值赋值给tmp
                keys = key.split("."); //以.分割字符串
            for (var i = 0; i < keys.length; i++) { //遍历循环数组
                var ckey = keys[i]; //获取数组中的元素
                if (keys.length === i + 1) { //如果是最后一个元素
                    if (ckey == "db" || ckey == "nest") {
                        value ? temp[ckey] = value : delete temp[ckey]
                    } else {
                        temp[ckey] = value;
                    }
                } else { //如果不是数组的第一个元素
                    if (!temp.hasOwnProperty(ckey)) { //temp中不存在ckey这个属性时
                        temp[ckey] = {}; //添加一个空的对应在
                    }
                }
                temp = temp[ckey];
            }
        } else { //如果key中不存在. 
            GLOBAL_PROPERTY[id][key] = value; //直接在全局属性中添加
        }
    },
    //向数组中
    pushValue: function (id, key, value) {
        if (!id) return;
        if (!GLOBAL_PROPERTY[id][key]) {
            GLOBAL_PROPERTY[id][key] = [value]
        } else {
            try {
                GLOBAL_PROPERTY[id][key].push(value)
            } catch (error) {
                GLOBAL_PROPERTY[id][key] = []
            }
        }
    },
    /**
     * 设置元素的默认的属性
     * @param {*} id 
     * @param {*} type 
     */
    setDefault: function (id, type) {
        if (!id) return; //如果id不存在退出函数

        if (!GLOBAL_PROPERTY.hasOwnProperty(id)) { //如果GLOBAL_PROPERTY全局属性中不具有id这个id
            GLOBAL_PROPERTY[id] = {}; //在全局属性中新加一个该属性并赋值为空对象
        }
        if (type === "text") { //如果type是text文本输入框
            GLOBAL_PROPERTY[id]["controlType"] = "文本输入框"; //给全局属性中对应的id设置controltype属性为文本输入框
            GLOBAL_PROPERTY[id]["fontFamily"] = "宋体";
            GLOBAL_PROPERTY[id]["value"] = $("#" + id).val()
            GLOBAL_PROPERTY[id]["fontSize"] = "10px";
            GLOBAL_PROPERTY[id]["color"] = "black";
            GLOBAL_PROPERTY[id]["backgroundColor"] = "white";
        } else if (type === "arrow") { //如果不是文本输入框则设置下面这些属性
            GLOBAL_PROPERTY[id]["visibility"] = true;
            GLOBAL_PROPERTY[id]["controlType"] = "无";
        } else {
            GLOBAL_PROPERTY[id]["name"] = id;
            GLOBAL_PROPERTY[id]["cname"] = id;
            GLOBAL_PROPERTY[id]["value"] = $("#" + id).val()
            GLOBAL_PROPERTY[id]["visibility"] = true;
            GLOBAL_PROPERTY[id]["checkUp"] = false;
            GLOBAL_PROPERTY[id]["disabled"] = false;
            GLOBAL_PROPERTY[id]["readonly"] = false;
            GLOBAL_PROPERTY[id]["controlType"] = "文本输入框";
        }
    },
    /**
     * 
     * @param {*} id 
     * @param {*} key 
     */
    remove: function (id, key) {
        if (!id) return; //如果id不存在直接退出函数

        if (!key) { //如果key不存在
            delete GLOBAL_PROPERTY[id]; //直接删除GLOBAL_PROPERTY中的key属性
            return;
        }
        var temp = GLOBAL_PROPERTY[id], //获取对应id在全局属性中的值
            isEmptyObject = function (obj) { //判断一个对象是不是空对象
                for (var key in obj) { //遍历对象
                    return false; //返回真
                }
                return true; //返回假
            };
        if (!temp || isEmptyObject(temp)) return; //如果对应id的对象不存在或则是一个空对象直接退出函数

        if (key.indexOf(".") > -1) { //查找key中是否有.
            var keys = key.split("."); //以点. 来分割字符串
            for (var i = 0; i < keys.length; i++) { //遍历keys
                var ckey = keys[i]; //获取对应的元素
                if (i === keys.length - 1) { //如果是最后一个
                    delete temp[ckey]; //直接删除
                } else { //不是最后一个
                    if (!temp) { //如果不存在跳出循环
                        break;
                    }
                    temp = temp[ckey];
                }
            }
        } else {
            delete temp[key]; //删除对应的key
        }
    },
    /**
     * 
     * @param {*} srcId 被复制的属性编号id
     * @param {*} dstId 将要复制的属性编号id
     */
    copy: function (srcId, dstId) { // czp修改了属性复制
        // GLOBAL_PROPERTY[dstId] = GLOBAL_PROPERTY[srcId];//赋值

        GLOBAL_PROPERTY[dstId] = this.deepCopy(GLOBAL_PROPERTY[srcId]);
        GLOBAL_PROPERTY[dstId]["name"] = dstId;
        // for(var key in GLOBAL_PROPERTY[srcId]){
        //     if(key != "name")
        //         GLOBAL_PROPERTY[dstId][key] = GLOBAL_PROPERTY[srcId][key];
        //     else
        //         GLOBAL_PROPERTY[dstId][key] = dstId;
        // }
    },
    /**
     * 对象深度拷贝
     * @param {object} obj 要拷贝的对象
     * @returns 返回拷贝后的对象
     */
    deepCopy: function (obj) {
        let result = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    result[key] = this.deepCopy(obj[key]); //递归复制
                } else {
                    result[key] = obj[key];
                }
            }
        }
        return result;
    },
    /**
     * 
     * @param {*} key 
     */
    getArrayByKey: function (key) {
        if (!key) return null; //如果key不存在退出函数

        var result = [];
        for (var id in GLOBAL_PROPERTY) { //id是存在GLOBAL_PROPERTY中
            var property = GLOBAL_PROPERTY[id], //获取id对应的属性
                value = property[key]; //在property中对应的key属性
            if (value) { //如果value存在
                result.push(value); //向数组添加一个对象
            }
        }
        return result; //返回这个对象
    },
    //获取中文名的元素
    getArrayByCname: function (cname) {
        if (!cname) return null;
        var result = [];
        for (var id in GLOBAL_PROPERTY) {
            var property = GLOBAL_PROPERTY[id];
            if (property.cname == cname) {
                result.push(id)
            }
        }
        return result;
    }
};