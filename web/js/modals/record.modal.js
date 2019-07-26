/**
 * 历史记录配置
 * 一、需求分析
 * 1、操作的数据对象：表单产品、布局产品、数据库定义；
 * 2、根据产品编号获取关联表单产品、布局产品、数据库定义、数据库发布的属性数据集合；
 * 3、集合数据进行对比并按照表格显示；
 * 二、待补充的接口
 * 1、数据库定义保存时，保存一份新的数据至服务端；
 * 三、添加的接口
 * 1、根据四个对象获取全属性的keys集合；
 * 2、存在的打勾，不存在的打叉；
 */
function RecordModal($modal) {
    BaseModal.call(this, $modal, null);

    this._getData = function (templateProperty, auditProperty, defineProperty) {
        if (!DataType.isObject(templateProperty) ||
            !DataType.isObject(auditProperty) ||
            !DataType.isObject(defineProperty)) {
            return null;
        }

        var ids = [];
        for (var tid in templateProperty) {
            if (!ids.isExist(null, tid)) {
                ids.push(tid);
            }
        }
        for (var aid in auditProperty) {
            if (!ids.isExist(null, aid)) {
                ids.push(aid);
            }
        }
        for (var did in defineProperty) {
            if (!ids.isExist(null, did)) {
                ids.push(did);
            }
        }
        var result = [];
        ids.forEach(function (item) {
            var property = defineProperty[item] || auditProperty[item] || templateProperty[item];
            result.push({
                id: item,
                cname: property ? property["cname"] : "",
                template: templateProperty.hasOwnProperty(item),
                audit: auditProperty.hasOwnProperty(item),
                define: defineProperty.hasOwnProperty(item),
            });
        });
        return result;
    };

    this._ajax = function (id, flow) {
        var FLOW_CONFIG = {
            "表单": "property.json",
            "编辑": "property_history_edit.json",
            "审核": "property_history_audit.json",
            "定义": "property_history_define.json",
        };
        return $.ajax("/lib/" + id + "/" + FLOW_CONFIG[flow]);//这个功能暂时不能使用
        // var url = "/lib/" + id + "/" + FLOW_CONFIG[flow];
        // return $.cajax({//返回一个ajax
        //     url: url,
        //     type: "GET",
        //     dataType: "json"
        // });
    };
}

RecordModal.prototype = {
    initData: function () {
        var that = this,
            $workspace = $("#workspace"),
            id = $workspace.attr("data-id"),
            type = $workspace.attr("data-type"),
            subtype = $workspace.attr("data-subtype");
        if ((type === "产品" && subtype === "布局") || type === "数据库定义") {
            new ProductService().detail(id, function (result) {
                Common.handleResult(result, function (data) {
                    var relId = data.basicInfo.relid,
                        $table = that.$modalBody.find(".table tbody");
                    $.when(that._ajax(relId, "表单"), that._ajax(id, "审核"), that._ajax(id, "定义")).done(function (ret1, ret2, ret3) {
                        var templateProperty = ret1[0],
                            auditProperty = ret2[0],
                            defineProperty = ret3[0],
                            data = that._getData(templateProperty, auditProperty, defineProperty),
                            html = "";
                        if (Array.isArray(data)) {
                            data.forEach(function (item) {
                                html += '<tr>' +
                                    '<td>' + item.id + '</td>' +
                                    '<td>' + item.cname + '</td>' +
                                    '<td><input type="checkbox" disabled' + (item.template ? ' checked' : '') + '></td>' +
                                    '<td><input type="checkbox" disabled' + (item.audit ? ' checked' : '') + '></td>' +
                                    '<td><input type="checkbox" disabled' + (item.define ? ' checked' : '') + '></td>' +
                                    '</tr>';
                            });
                            $table.empty().append(html);
                        }
                    }).fail(function () {
                        $table.empty();
                        alert("获取数据出错！");
                    });
                });
            });
        }// end if
        else{
        }
    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, null, null);
    }
};
