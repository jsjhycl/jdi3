(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".dbDesigner_event", //事件命名空间
        CACHE_KEY = "dbDesigner_cache"; //缓存关键字

    function DbDesigner(elements, options, type) {
        this.$elements = elements;
        this.options = options;
        this.type = type
    }

    DbDesigner.prototype.constructor = DbDesigner;

    DbDesigner.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM(this);
                    that.setData(this);
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            if (!element) return;

            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.dbDesigner.defaults, that.options || {});
            } else {
                $(element).off(EVENT_NAMESPACE);
                cache = $.extend(cache, that.options || {});
            }
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        renderDOM: function (element) {
            if (!element) return;

            var cache = $.data(element, CACHE_KEY);
            if (!cache) return;

            var table = '<table class="dbdesigner-table table table-bordered table-striped table-hover table-responsive"><thead><tr>';
            cache.thead.forEach(function (item) {
                var checkbox = item.hasCheckbox ? '<input class="check-all" type="checkbox">' : "";
                table += '<th>' + item.text + checkbox + '</th>';
            });
            table += '</tr></thead><tbody></tbody></table>';
            //PS：此处存在性能问题，待优化……
            $(element).addClass("dbdesigner").empty().append(table);
        },
        setData: function (element) {
            if (!element) return;
            
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) return;

            var getProperty = cache.getProperty;
            if (typeof getProperty !== "function") throw "错误的参数类型！";

            var $tbody = $(element).find(".dbdesigner-table tbody");
            if ($tbody.length <= 0) return;

            var tbody = "";
            cache.$elems.each(function (index) {
                var id = this.id;
                if (!id) return true;

                tbody += "<tr>";
                var property = $.extend(getProperty(id), {
                    id: id
                });
                cache.thead.forEach(function (item) {
                    var template = item.template || function (value) {
                            return value;
                        },
                        value = that.recurseObject(property, item.key, cache.type);
                    tbody += '<td>' + template(value[0] || "",value[1] || "") + '</td>';
                });
                tbody += "</tr>";
            });
            $tbody.empty().append(tbody);
        },
        bindEvents: function (element) {
            if (!element) return;

            var that = this;
            //PS：此处存在依赖问题，待优化……
            $(element).on("click" + EVENT_NAMESPACE, '[data-key="isSave"]', {
                element: element
            }, function (event) {
                var current = event.data.element,
                    key = $(this).attr("data-key"),
                    $tr = $(this).parents("tr"),
                    isChecked = $(this).is(":checked");
                that.setDefaultData(current, key, $tr, isChecked);
            });
            $(element).on("click" + EVENT_NAMESPACE, "thead th .check-all", {
                element: element
            }, function (event) {
                var current = event.data.element,
                    index = $(this).parent("th").index(),
                    isChecked = $(this).is(":checked");
                $(current).find("tbody tr").each(function () {
                    var $checkbox = $(this).find("td:eq(" + index + ") :checkbox"),
                        key = $checkbox.attr("data-key"),
                        $tr = $(this);
                    $checkbox.prop("checked", isChecked);
                    that.setDefaultData(current, key, $tr, isChecked);
                });
            });
        },
        setDefaultData: function (element, key, $tr, isChecked) {
            var cache = $.data(element, CACHE_KEY);
            if (!cache) return;

            var selectors = cache.thead.filter(function (fitem) {
                    return !!fitem.group && fitem.name !== key;
                }).map(function (mitem) {
                    return '[data-key="' + mitem.name + '"]';
                }).join(","),
                customId = $("#workspace").attr("data-customId");
            //2017/09/27补充
            if (isChecked) {
                $tr.find(selectors).prop("disabled", false);
                var id = $tr.find('[data-key="id"]').val(),
                    cname = $tr.find('[data-key="cname"]').val();
                $tr.find('[data-key="table"]').val();
                $tr.find('[data-key="dbName"]').val()
                $tr.find('[data-key="field"]').val(id);
                $tr.find('[data-key="desc"]').val(cname);
            } else {
                $tr.find(selectors).prop("disabled", true);
                $tr.find(selectors).val("");
            }
        },
        recurseObject: function (data, key, type) {
            if (!data) return;
            if (!key) return;
            if (key.indexOf(".") > -1) {
                var temp = $.extend(true, {}, data),
                    keys = key.split(".");
                // for (var i = 0; i < keys.length; i++) {
                //     var ckey = keys[i],
                //         cvalue = temp[ckey];
                //         // if(data.db){
                //         //     if (ckey =="dbName" ||ckey == "table" || ckey == "field" || ckey == "fieldSplit") {
                //         //        console.log(ckey,data.db[ckey],this.getOptions(data,ckey))
                //         //         temp = [data.db[ckey], this.getOptions(data, ckey)]
                //         //     }
                //         //     if(ckey == "isSave"){
                //         //         temp = [!!data.db,""]
                //         //     }
                //         //     if(ckey=="desc"){
                //         //         temp = [data.db[ckey],""]
                //         //     }
                //         // }else{
                //         //     temp = ["",""]
                //         // }
                //     if(!cvalue){
                //         console.log(ckey,cvalue,temp)
                //         // temp = ""
                //         // break
                //     }else{
                        
                //         temp = cvalue;
                //     }

                    
                // }
                if(type=="setDbDesigner") return [];
                var db = keys[0], ckey = keys[1];
                if(!temp.db){
                    temp = ["",this.getOptions(data,ckey)]
                }else{
                    if(ckey=="dbName"||ckey == "table" || ckey == "field" || ckey == "fieldSplit"){
                        if(data[db][ckey]){
                            temp = [data[db][ckey], this.getOptions(data, ckey)]
                        }
                    }else{
                        temp = [data[db][ckey],""]
                    }
                }

                return temp;
            } else return [data[key],""];
        },
        getOptions: function (data, ckey) {
            var dbName = (data.db && data.db.dbName) ||"",
                table = (data.db && data.db.table) || "",
                field = (data.db && data.db.field)|| "",
                dbList = JSON.parse(localStorage.getItem("AllDbName")) || {},
                options = [];

            if (ckey == "dbName") {
                Object.keys(dbList).forEach(function (item) {
                    options.push({
                        name: item,
                        value: item
                    })
                })
            }
            if (ckey == "table") {
                if(dbName){
                    Object.keys(dbList[dbName]).forEach(function (item) {
                        options.push({
                            name: item,
                            value: item
                        })
                    })
                }
            }
            if (ckey == "field") {
                if(dbName && table){
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
                if(dbName&&table){
                    var fields = dbList[dbName][table].tableDetail,
                        fieldSplits = '';
                    fields.forEach(function (item) {
                        if (data.id == item.id) {
                            fieldSplits = Number(item.fieldSplit)
                        }
                    })
                    for (i = 1; i <= fieldSplits; i++) {
                        options.push({
                            name: "插入",
                            value: String(i)
                        })
                    }
                }
            }

            return options;
        }
    };

    $.fn.extend({
        dbDesigner: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.dbDesigner.methods[options](this, args);
            }
            return new DbDesigner(this, options).init();
        }
    });

    $.fn.dbDesigner.defaults = {
        disabled: false,
        $elems: null,
        thead: [{
                name: "id",
                text: "编号",
                key: "id",
                template: function (value) {
                    return '<input data-key="id" type="text" value="' + value + '" readonly>';
                }
            },
            {
                name: "cname",
                text: "中文名",
                key: "cname",
                template: function (value) {
                    return '<input data-key="cname" type="text" value="' + value + '" readonly>';
                }
            }, {
                name: "isSave",
                text: "是否入库",
                key: "db.isSave",
                group: true,
                hasCheckbox: true,
                template: function (value) {
                    var isChecked = !!value ? " checked" : "";
                    return '<input data-key="isSave" type="checkbox"' + isChecked + '>';
                }
            }, {
                name: "table",
                text: "表名称",
                key: "db.table",
                group: true,
                template: function (value) {
                    return '<input data-key="table" type="text" value="' + value + '">';
                }
            }, {
                name: "field",
                text: "字段名称",
                key: "db.field",
                group: true,
                template: function (value) {
                    return '<input data-key="field" type="text" value="' + value + '">';
                }
            }, {
                name: "desc",
                text: "字段描述",
                key: "db.desc",
                group: true,
                template: function (value) {
                    return '<input data-key="desc" type="text" value="' + value + '">';
                }
            }
        ],
        getProperty: null
    };

    $.fn.dbDesigner.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).dbDesigner({
                    disabled: false
                });
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).dbDesigner({
                    disabled: true
                });
            });
        },
        getData: function (elements) {
            var first = elements[0],
                cache = $.data(first, CACHE_KEY),
                names = cache.thead.map(function (item) {
                    return item.name;
                }),
                result = [];
            $(first).find(".dbdesigner-table tbody tr").each(function (index, tr) {
                var item = {};
                names.forEach(function (name) {
                    if (!item.hasOwnProperty(name)) {
                        var $elem = $(tr).find('[data-key="' + name + '"]'),
                            value = $elem.val() || "";
                        if ($elem.is(":checkbox")) {
                            value = !!$elem.is(":checked");
                        }
                        item[name] = value;
                    }
                });
                result.push(item);
            });
            return result;
        }
    };
})(jQuery, window, document);