function Property() {
    this.$propertybar = $("#propertybar");
    this.BODY = "BODY";

    this._clearStyles = function () {
        var that = this;
        $("#workspace").find(".focus").removeClass("focus");
        that.$propertybar.find(":text,select").val("");
        that.$propertybar.find(":checkbox:checked").prop("checked", false);
    };
    this._traverseProperty = function ($elem) {
        if (!$elem || $elem.length <= 0) return;

        var that = this,
            id = $elem.attr("id");
        if (id === "workspace") {
            id = that.BODY;
            that.setDefault(id);
        }
        var data = $.extend(true, {id: id}, that.getProperty(id));
        for (var key in data) {
            var value = data[key],
                $property = $("#property_" + key);
            //判断“第一层属性”是否为“属性配置元素”
            if ($property.length > 0) {//是“属性配置元素”
                //PS：第一层属性值为字符串或者对象
                if ($property.is(":text") || $property.is("textarea") || $property.is("select")) {//“属性配置元素”为文本框或者下拉列表
                    var tvalue = (DataType.isObject(value) || Array.isArray(value)) ? JSON.stringify(value) : value;
                    $property.val(tvalue);
                }
                if ($property.is(":checkbox")) {//“属性配置元素”为复选框
                    $property.prop("checked", !!value);
                }
            } else {//不是“属性配置元素”
                //PS：继续遍历属性值，获取“属性配置元素”
                if (DataType.isObject(value)) {
                    for (var ckey in value) {
                        var cvalue = value[ckey];
                        $property = $("#property_" + key + "_" + ckey);
                        if ($property.length > 0) {
                            if ($property.is(":text") || $property.is("textarea") || $property.is("select")) {
                                $property.val((DataType.isObject(cvalue) || Array.isArray(cvalue)) ? JSON.stringify(cvalue) : cvalue);
                            }
                            if ($property.is(":checkbox")) {
                                $property.prop("checked", !!cvalue);
                            }
                        }
                    }
                }
            }
        }
        $elem.addClass("focus");
    };
}

Property.prototype = {
    load: function ($control) {
        if (!$control || $control.length <= 0) return;

        var that = this;
        that._clearStyles();
        var isBody = $control.attr("id") === "workspace";
        if (isBody ||
            (!isBody &&
                (
                    //非子模块元素
                    ($control.hasClass("workspace-node") && $control.attr("data-type") !== "div" ) ||
                    //子模块元素内部的表单元素
                    ($control.parents(".workspace-node").data("type") === "div" && $control.is(":input") && !$control.is(".workspace-node"))
                )
            )
        ) {
            that._traverseProperty($control);
            AccessControl.executeControlType($("#property_controlType").val());
        }
    },
    save: function ($control, $property) {
        if (!$control || $control.length <= 0) return;
        if (!$property || $property.length <= 0) return;

        var that = this,
            isBody = $control.attr("id") === "workspace",
            id = isBody ? that.BODY : $control.attr("id"),
            pid = $property.attr("id"),
            pkey = pid.substring("property_".length),
            pvalue = $property.val();
        //修改元素属性（特殊处理）
        if (!isBody) {
            if (pid === "property_value") {
                $control.attr("value", pvalue);
            }
            if (pid === "property_name") {
                $control.attr("name", pvalue);
            }
        }
        //转换数据类型
        var dataType = $property.attr("data-dataType");
        pvalue = DataType.convert(dataType, pvalue, $property);
        //PS：待递归优化
        var ckey;
        if (pkey.indexOf("_") > -1) {
            var keys = pkey.split("_");
            pkey = keys.length >= 1 ? keys[0] : "";
            ckey = keys.length >= 2 ? keys[1] : "";
        }
        if (ckey) {
            if (!GLOBAL_PROPERTY[id].hasOwnProperty(pkey)) {
                GLOBAL_PROPERTY[id][pkey] = {};
            }
            GLOBAL_PROPERTY[id][pkey][ckey] = pvalue;
        } else {
            GLOBAL_PROPERTY[id][pkey] = pvalue;
        }
    },
    clearDOM: function () {
        $("#workspace.focus").removeClass("focus");
        $("#workspace").find(".focus").removeClass("focus");
        this.$propertybar.find('[id^="property_"]').val("");
    },
    getProperty: function (id) {
        if (!id) return null;
        return $.extend(true, {}, GLOBAL_PROPERTY[id]);
    },
    getDbProperty: function (defaultName, defaultDesc) {
        var result = {};
        for (var id in GLOBAL_PROPERTY) {
            var property = GLOBAL_PROPERTY[id],
                db = property.db;
            if (db && !!db.isSave) {
                var table = db.table;
                if (table) {
                    var field = db.field,
                        fieldSplit = db.fieldSplit,
                        desc = db.desc;
                    if (result.hasOwnProperty(table)) {
                        var fields = result[table]["fields"];
                        if (!Array.isArray(fields)) {
                            fields = [];
                        }
                        fields.push({name: field, desc: desc, type: "String", fieldSplit: fieldSplit});
                    } else {
                        result[table] = {
                            desc: defaultName === table ? defaultDesc : table,
                            fields: []
                        };
                        result[table].fields.push({name: field, desc: desc, type: "String", fieldSplit: fieldSplit});
                    }
                }
            }
        }
        return result;
    },
    getValue: function (id, key) {
        if (!id) return;
        if (!key) return GLOBAL_PROPERTY.hasOwnProperty(id) ? $.extend(true, {}, GLOBAL_PROPERTY[id]) : null;

        var temp = $.extend(true, {}, GLOBAL_PROPERTY[id]);
        if (key.indexOf(".") > -1) {
            var keys = key.split(".");
            for (var i = 0; i < keys.length; i++) {
                var ckey = keys[i],
                    cvalue = temp[ckey];
                if (!cvalue) {
                    temp = "";
                    break;
                } else {
                    temp = cvalue;
                }
            }
            return temp;
        } else return temp[key];
    },
    setValue: function (id, key, value) {
        if (!id) return;
        if (!key) {
            GLOBAL_PROPERTY[id] = value;
            return;
        }

        if (!GLOBAL_PROPERTY.hasOwnProperty(id)) {
            GLOBAL_PROPERTY[id] = {};
        }
        if (key.indexOf(".") > -1) {
            var temp = GLOBAL_PROPERTY[id],
                keys = key.split(".");
            for (var i = 0; i < keys.length; i++) {
                var ckey = keys[i];
                if (keys.length === i + 1) {
                    temp[ckey] = value;
                } else {
                    if (!temp.hasOwnProperty(ckey)) {
                        temp[ckey] = {};
                    }
                }
                temp = temp[ckey];
            }
        } else {
            GLOBAL_PROPERTY[id][key] = value;
        }
    },
    setDefault: function (id, type) {
        if (!id) return;

        if (!GLOBAL_PROPERTY.hasOwnProperty(id)) {
            GLOBAL_PROPERTY[id] = {};
        }
        if (type === "text") {
            GLOBAL_PROPERTY[id]["controlType"] = "文本输入框";
            GLOBAL_PROPERTY[id]["fontFamily"] = "宋体";
            GLOBAL_PROPERTY[id]["fontSize"] = "10px";
            GLOBAL_PROPERTY[id]["color"] = "black";
            GLOBAL_PROPERTY[id]["backgroundColor"] = "white";
        } else {
            GLOBAL_PROPERTY[id]["name"] = id;
            GLOBAL_PROPERTY[id]["cname"] = id;
            GLOBAL_PROPERTY[id]["visibility"] = true;
            GLOBAL_PROPERTY[id]["disabled"] = false;
            GLOBAL_PROPERTY[id]["readonly"] = false;
            GLOBAL_PROPERTY[id]["controlType"] = "文本输入框";
        }
    },
    remove: function (id, key) {
        if (!id) return;

        if (!key) {
            delete GLOBAL_PROPERTY[id];
            return;
        }
        var temp = GLOBAL_PROPERTY[id],
            isEmptyObject = function (obj) {
                for (var key in obj) {
                    return false;
                }
                return true;
            };
        if (!temp || isEmptyObject(temp)) return;

        if (key.indexOf(".") > -1) {
            var keys = key.split(".");
            for (var i = 0; i < keys.length; i++) {
                var ckey = keys[i];
                if (i === keys.length - 1) {
                    delete temp[ckey];
                } else {
                    if (!temp) {
                        break;
                    }
                    temp = temp[ckey];
                }
            }
        } else {
            delete temp[key];
        }
    },
    copy: function (srcId, dstId) {
        GLOBAL_PROPERTY[dstId] = GLOBAL_PROPERTY[srcId];
    },
    getArrayByKey: function (key) {
        if (!key) return null;

        var result = [];
        for (var id in GLOBAL_PROPERTY) {
            var property = GLOBAL_PROPERTY[id],
                value = property[key];
            if (value) {
                result.push(value);
            }
        }
        return result;
    }
};
